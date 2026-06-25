import { browser } from '$app/environment';
import { on } from 'svelte/events';
import { toast } from 'svelte-sonner';

/**
 * Native-integrated undo/redo for the data grid (Option B).
 *
 * Instead of owning the only undo stack in JavaScript (see
 * `use-data-grid-undo-redo.svelte.ts` for that approach), this hook makes the
 * BROWSER'S native undo stack the single source of truth and mirrors it.
 *
 * How it works (the "undoer" technique):
 *   1. A hidden `contentEditable` element is mounted. The browser keeps a
 *      native undo history for it automatically.
 *   2. Every time the grid records an undoable action we write a new
 *      "checkpoint" token into that element with `execCommand('insertText')`.
 *      That single edit becomes one unit on the browser's native undo stack.
 *   3. When the user triggers undo/redo through ANY native path — the keyboard
 *      shortcut, the "Edit > Undo" menu item, or the macOS/iOS gesture — the
 *      browser fires an `input`/`beforeinput` event whose `inputType` is
 *      `historyUndo` or `historyRedo`. We listen for those and run our real
 *      data transform.
 *   4. Keyboard shortcuts are forwarded into the same path with
 *      `execCommand('undo' | 'redo')` so we never maintain a parallel position.
 *
 * Net effect: the OS-level "Undo"/"Redo" affordances drive the grid, which is
 * the more robust and natural UX the integration is after.
 */

const DEFAULT_MAX_HISTORY = 100;
const BATCH_TIMEOUT = 300;

interface HistoryEntry<TData> {
	variant: 'cells_update' | 'rows_add' | 'rows_delete';
	count: number;
	timestamp: number;
	undo: (currentData: TData[]) => TData[];
	redo: (currentData: TData[]) => TData[];
}

export interface UndoRedoCellUpdate {
	rowId: string;
	columnId: string;
	previousValue: unknown;
	newValue: unknown;
}

export interface UseDataGridUndoRedoNativeOptions<TData> {
	data: TData[] | (() => TData[]);
	onDataChange: (data: TData[]) => void;
	getRowId: (row: TData, index: number) => string;
	maxHistory?: number;
	enabled?: boolean;
}

export interface UseDataGridUndoRedoNativeReturn<TData> {
	canUndo: boolean;
	canRedo: boolean;
	/** True when the native bridge mounted successfully (browser, execCommand available). */
	isNativeActive: boolean;
	onUndo: () => void;
	onRedo: () => void;
	onClear: () => void;
	trackCellsUpdate: (updates: UndoRedoCellUpdate[]) => void;
	trackRowsAdd: (rows: TData[]) => void;
	trackRowsDelete: (rows: TData[]) => void;
	/**
	 * Svelte action: attach to the grid's root element so keyboard undo/redo is
	 * captured while the grid is focused (and forwarded to the native stack).
	 */
	gridAction: (node: HTMLElement) => { destroy: () => void };
}

function buildIndexById<TData>(
	data: TData[],
	getRowId: (row: TData, index: number) => string
): Map<string, number> {
	const map = new Map<string, number>();
	for (let index = 0; index < data.length; index++) {
		const row = data[index];
		if (row !== undefined) {
			map.set(getRowId(row, index), index);
		}
	}
	return map;
}

function cloneHistoryValue<T>(value: T): T {
	if (typeof structuredClone === 'function') {
		try {
			return structuredClone(value);
		} catch {
			// Fall through to a shallow clone.
		}
	}

	if (Array.isArray(value)) {
		return value.map((item) => cloneHistoryValue(item)) as T;
	}

	if (value && typeof value === 'object') {
		return { ...(value as Record<string, unknown>) } as T;
	}

	return value;
}

function getPendingKey(rowId: string, columnId: string): string {
	return `${rowId}\0${columnId}`;
}

function getIsInPopover(element: HTMLElement): boolean {
	return (
		element.closest(
			'[data-grid-popover], [data-slot="popover-content"], [data-slot="select-content"], [data-slot="dropdown-menu-content"], [data-slot="dialog-content"]'
		) !== null
	);
}

/**
 * True when `element` is (or sits inside) an editable control that owns focus,
 * such as the long-text cell's `<textarea>` inside a focus-trapped popover.
 * Focusing the hidden bridge while one of these holds focus would either be
 * reverted by the focus trap or fire the editor's blur handler, and the
 * subsequent `execCommand('insertText')` could land inside that control and
 * corrupt the user's text. The bridge host itself is excluded.
 */
function isEditableFocusTarget(element: HTMLElement): boolean {
	if (element.getAttribute('data-grid-undo-bridge') !== null) return false;

	const tag = element.tagName;
	if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
	if (element.isContentEditable) return true;

	return getIsInPopover(element);
}

export function useDataGridUndoRedoNative<TData>(
	options: UseDataGridUndoRedoNativeOptions<TData>
): UseDataGridUndoRedoNativeReturn<TData> {
	const {
		data: dataProp,
		onDataChange,
		getRowId,
		maxHistory = DEFAULT_MAX_HISTORY,
		enabled = true
	} = options;

	const getData = typeof dataProp === 'function' ? dataProp : () => dataProp;

	let undoStack = $state<HistoryEntry<TData>[]>([]);
	let redoStack = $state<HistoryEntry<TData>[]>([]);
	let hasPendingChanges = $state(false);
	let isNativeActive = $state(false);

	const pendingBatch = {
		byKey: new Map<string, UndoRedoCellUpdate>(),
		timeoutId: null as ReturnType<typeof setTimeout> | null
	};

	// ============================================================
	// Native bridge — the hidden contentEditable that owns the
	// browser's undo stack.
	// ============================================================

	const bridge = {
		host: null as HTMLDivElement | null,
		depth: 0,
		gridNode: null as HTMLElement | null
	};

	function supportsExecCommand(): boolean {
		return (
			browser &&
			typeof document !== 'undefined' &&
			typeof document.execCommand === 'function'
		);
	}

	function mountBridge() {
		if (!supportsExecCommand() || bridge.host) return;

		const host = document.createElement('div');
		host.contentEditable = 'true';
		host.setAttribute('aria-hidden', 'true');
		host.setAttribute('data-grid-undo-bridge', '');
		host.tabIndex = -1;
		host.style.cssText = [
			'position:fixed',
			'top:0',
			'left:0',
			'width:1px',
			'height:1px',
			'padding:0',
			'margin:-1px',
			'border:0',
			'opacity:0',
			'overflow:hidden',
			'white-space:nowrap',
			'pointer-events:none',
			'user-select:none'
		].join(';');
		host.textContent = '0';

		// Native undo/redo notifications arrive here. We only react to the
		// `history*` input types; our own `insertText` checkpoints are ignored.
		host.addEventListener('input', handleBridgeInput as EventListener);

		document.body.appendChild(host);
		bridge.host = host;
		bridge.depth = 0;
		isNativeActive = true;
	}

	function unmountBridge() {
		if (!bridge.host) return;
		bridge.host.removeEventListener('input', handleBridgeInput as EventListener);
		bridge.host.remove();
		bridge.host = null;
		isNativeActive = false;
	}

	/** Push a new checkpoint onto the browser's native undo stack. */
	function writeNativeCheckpoint() {
		const host = bridge.host;
		if (!host || !supportsExecCommand()) return;

		const previousActive =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;

		bridge.depth += 1;

		// If focus currently sits in an editable control (e.g. the long-text
		// cell's debounced `<textarea>` inside a focus-trapped popover), focusing
		// the hidden bridge would be reverted by the focus trap and the
		// execCommand('insertText') below would land in that control, appending
		// the checkpoint counter into the user's text. Skip the native write in
		// that case: the JS undo stack still records the action and the
		// toolbar/keyboard undo paths fall back to it.
		if (previousActive && isEditableFocusTarget(previousActive)) {
			host.textContent = String(bridge.depth);
			return;
		}

		host.focus({ preventScroll: true });

		const selection = window.getSelection();
		if (selection) {
			const range = document.createRange();
			range.selectNodeContents(host);
			selection.removeAllRanges();
			selection.addRange(range);
		}

		// selectAll + insertText replaces the content as a single native undo unit.
		document.execCommand('insertText', false, String(bridge.depth));

		// Return focus to wherever the user was, so we don't steal it.
		if (previousActive && previousActive !== host) {
			previousActive.focus({ preventScroll: true });
		}
	}

	function handleBridgeInput(event: InputEvent) {
		const inputType = event.inputType;
		if (inputType === 'historyUndo') {
			performUndo();
		} else if (inputType === 'historyRedo') {
			performRedo();
		}
		// Any other inputType (e.g. our own 'insertText' checkpoint) is ignored.
	}

	/** Forward a keyboard shortcut into the native stack via execCommand. */
	function forwardToNative(direction: 'undo' | 'redo'): boolean {
		const host = bridge.host;
		if (!host || !supportsExecCommand()) return false;

		const previousActive =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;

		host.focus({ preventScroll: true });
		// This fires `input` with inputType historyUndo/historyRedo on the host,
		// which routes through handleBridgeInput -> performUndo/performRedo.
		const ran = document.execCommand(direction);

		if (previousActive && previousActive !== host) {
			previousActive.focus({ preventScroll: true });
		}
		return ran;
	}

	// ============================================================
	// History stack management (shared with the JS-only variant).
	// ============================================================

	function pushEntry(entry: HistoryEntry<TData>) {
		const nextUndoStack = [...undoStack, entry];
		if (nextUndoStack.length > maxHistory) {
			nextUndoStack.shift();
		}

		undoStack = nextUndoStack;
		redoStack = [];
		hasPendingChanges = false;

		// Mirror the new action onto the native stack.
		writeNativeCheckpoint();
	}

	function commitPendingChanges() {
		if (pendingBatch.byKey.size === 0) return;

		if (pendingBatch.timeoutId) {
			clearTimeout(pendingBatch.timeoutId);
			pendingBatch.timeoutId = null;
		}

		const updates = Array.from(pendingBatch.byKey.values());
		pendingBatch.byKey.clear();

		const entry: HistoryEntry<TData> = {
			variant: 'cells_update',
			count: updates.length,
			timestamp: Date.now(),
			undo: (currentData) => {
				const nextData = [...currentData];
				const indexById = buildIndexById(nextData, getRowId);

				for (const update of updates) {
					const rowIndex = indexById.get(update.rowId);
					if (rowIndex === undefined) continue;

					const row = nextData[rowIndex];
					if (row === undefined) continue;

					nextData[rowIndex] = {
						...(row as Record<string, unknown>),
						[update.columnId]: cloneHistoryValue(update.previousValue)
					} as TData;
				}

				return nextData;
			},
			redo: (currentData) => {
				const nextData = [...currentData];
				const indexById = buildIndexById(nextData, getRowId);

				for (const update of updates) {
					const rowIndex = indexById.get(update.rowId);
					if (rowIndex === undefined) continue;

					const row = nextData[rowIndex];
					if (row === undefined) continue;

					nextData[rowIndex] = {
						...(row as Record<string, unknown>),
						[update.columnId]: cloneHistoryValue(update.newValue)
					} as TData;
				}

				return nextData;
			}
		};

		pushEntry(entry);
	}

	/**
	 * Internal undo — runs when the NATIVE stack told us to undo. It must NOT
	 * write a new checkpoint (the native stack already moved).
	 */
	function performUndo() {
		if (!enabled) return;

		commitPendingChanges();

		const entry = undoStack[undoStack.length - 1];
		if (!entry) return;

		undoStack = undoStack.slice(0, -1);
		redoStack = [...redoStack, entry];
		hasPendingChanges = false;

		onDataChange(entry.undo(getData()));
		toast.success(`${entry.count} action${entry.count !== 1 ? 's' : ''} undone`);
	}

	function performRedo() {
		if (!enabled) return;

		commitPendingChanges();

		const entry = redoStack[redoStack.length - 1];
		if (!entry) return;

		redoStack = redoStack.slice(0, -1);
		undoStack = [...undoStack, entry];
		hasPendingChanges = false;

		onDataChange(entry.redo(getData()));
		toast.success(`${entry.count} action${entry.count !== 1 ? 's' : ''} redone`);
	}

	/**
	 * Public undo — invoked by toolbar buttons. Routes through the native stack
	 * so position stays aligned; falls back to the internal path when the bridge
	 * is unavailable.
	 */
	function onUndo() {
		if (!enabled) return;
		commitPendingChanges();
		if (!undoStack.length) {
			toast.info('No actions to undo');
			return;
		}
		if (!forwardToNative('undo')) {
			performUndo();
		}
	}

	function onRedo() {
		if (!enabled) return;
		commitPendingChanges();
		if (!redoStack.length) {
			toast.info('No actions to redo');
			return;
		}
		if (!forwardToNative('redo')) {
			performRedo();
		}
	}

	function onClear() {
		if (pendingBatch.timeoutId) {
			clearTimeout(pendingBatch.timeoutId);
			pendingBatch.timeoutId = null;
		}

		pendingBatch.byKey.clear();
		undoStack = [];
		redoStack = [];
		hasPendingChanges = false;

		// Reset the native anchor too.
		if (bridge.host) {
			bridge.depth = 0;
			bridge.host.textContent = '0';
		}
	}

	function trackCellsUpdate(updates: UndoRedoCellUpdate[]) {
		if (!enabled || updates.length === 0) return;

		const filteredUpdates = updates.filter((update) => {
			return !Object.is(update.previousValue, update.newValue);
		});

		if (filteredUpdates.length === 0) return;

		for (const update of filteredUpdates) {
			const key = getPendingKey(update.rowId, update.columnId);
			const existing = pendingBatch.byKey.get(key);

			if (existing) {
				pendingBatch.byKey.set(key, {
					...existing,
					newValue: cloneHistoryValue(update.newValue)
				});
			} else {
				pendingBatch.byKey.set(key, {
					rowId: update.rowId,
					columnId: update.columnId,
					previousValue: cloneHistoryValue(update.previousValue),
					newValue: cloneHistoryValue(update.newValue)
				});
			}
		}

		hasPendingChanges = true;

		if (pendingBatch.timeoutId) {
			clearTimeout(pendingBatch.timeoutId);
		}

		pendingBatch.timeoutId = setTimeout(() => {
			commitPendingChanges();
		}, BATCH_TIMEOUT);
	}

	function trackRowsAdd(rows: TData[]) {
		if (!enabled || rows.length === 0) return;

		commitPendingChanges();

		const rowIds = new Set(rows.map((row, index) => getRowId(row, index)));
		const rowsCopy = rows.map((row) => cloneHistoryValue(row));

		pushEntry({
			variant: 'rows_add',
			count: rows.length,
			timestamp: Date.now(),
			undo: (currentData) => {
				return currentData.filter((row, index) => !rowIds.has(getRowId(row, index)));
			},
			redo: (currentData) => {
				return [...currentData, ...rowsCopy.map((row) => cloneHistoryValue(row))];
			}
		});
	}

	function trackRowsDelete(rows: TData[]) {
		if (!enabled || rows.length === 0) return;

		commitPendingChanges();

		const currentData = getData();
		const indexById = buildIndexById(currentData, getRowId);
		const rowsWithPositions: Array<{ index: number; row: TData }> = [];

		for (const row of rows) {
			const rowId = getRowId(row, 0);
			const currentIndex = indexById.get(rowId);
			if (currentIndex === undefined) continue;

			rowsWithPositions.push({
				index: currentIndex,
				row: cloneHistoryValue(row)
			});
		}

		rowsWithPositions.sort((left, right) => left.index - right.index);

		const rowIds = new Set(rows.map((row, index) => getRowId(row, index)));

		pushEntry({
			variant: 'rows_delete',
			count: rows.length,
			timestamp: Date.now(),
			undo: (currentData) => {
				const nextData = [...currentData];

				for (const { index, row } of rowsWithPositions) {
					const insertIndex = Math.min(index, nextData.length);
					nextData.splice(insertIndex, 0, cloneHistoryValue(row));
				}

				return nextData;
			},
			redo: (currentData) => {
				return currentData.filter((row, index) => !rowIds.has(getRowId(row, index)));
			}
		});
	}

	// ============================================================
	// Keyboard capture (forwarded into the native stack).
	// ============================================================

	function handleGridKeyDown(event: KeyboardEvent) {
		const isCtrlOrCmd = event.ctrlKey || event.metaKey;
		const key = event.key.toLowerCase();

		if (!isCtrlOrCmd || (key !== 'z' && key !== 'y')) return;

		const activeElement = document.activeElement;
		if (activeElement instanceof HTMLElement) {
			const isInput =
				activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
			// Let the cell's own (native) text undo win while it's being edited,
			// and stay out of popovers.
			const isContentEditable =
				activeElement.isContentEditable &&
				activeElement.getAttribute('data-grid-undo-bridge') === null;
			if (isInput || isContentEditable || getIsInPopover(activeElement)) {
				return;
			}
		}

		if (key === 'z' && !event.shiftKey) {
			event.preventDefault();
			onUndo();
			return;
		}

		if ((key === 'z' && event.shiftKey) || key === 'y') {
			event.preventDefault();
			onRedo();
		}
	}

	function gridAction(node: HTMLElement) {
		bridge.gridNode = node;
		const off = on(node, 'keydown', handleGridKeyDown);
		return {
			destroy() {
				off();
				if (bridge.gridNode === node) bridge.gridNode = null;
			}
		};
	}

	// ============================================================
	// Lifecycle
	// ============================================================

	$effect(() => {
		if (!enabled) return;
		mountBridge();
		return () => {
			if (pendingBatch.timeoutId) {
				clearTimeout(pendingBatch.timeoutId);
			}
			unmountBridge();
		};
	});

	return {
		get canUndo() {
			return undoStack.length > 0 || hasPendingChanges;
		},
		get canRedo() {
			return redoStack.length > 0;
		},
		get isNativeActive() {
			return isNativeActive;
		},
		onUndo,
		onRedo,
		onClear,
		trackCellsUpdate,
		trackRowsAdd,
		trackRowsDelete,
		gridAction
	};
}
