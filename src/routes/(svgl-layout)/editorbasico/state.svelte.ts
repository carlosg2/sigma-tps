import { SvelteSet } from 'svelte/reactivity';
import { type FileId, type FileNode, DUMMY_FILES, DUMMY_CONTENTS } from './dummy-data.js';

export type { FileId, FileNode };

type TerminalEntry =
	| { type: 'input'; command: string }
	| { type: 'output'; stdout: string; stderr: string; exitCode: number };

class AppState {
	// ── File system ─────────────────────────────────────────────
	files = $state<FileNode[]>([...DUMMY_FILES]);
	fileContents = $state<Record<FileId, string>>({ ...DUMMY_CONTENTS });

	openFileIds = $state(new SvelteSet<FileId>());
	activeFileId = $state<FileId | null>(null);
	expandedIds = $state(new SvelteSet<FileId>(['root', 'folder-notas', 'folder-proyectos']));
	focusedId = $state<FileId | null>(null);

	// ── Search ────────────────────────────────────────────────────
	searchQuery = $state('');
	showSearch = $state(false);

	// ── Terminal ──────────────────────────────────────────────────
	terminalOpen = $state(false);

	// ── AI Chat ───────────────────────────────────────────────────
	aiChatOpen = $state(false);
	terminalHistory = $state<TerminalEntry[]>([
		{
			type: 'output',
			stdout:
				'Bienvenido a opensidian — notas locales y eficientes.\nEscribe "help" para ver los comandos disponibles.',
			stderr: '',
			exitCode: 0
		}
	]);

	// ── Editor cursor ─────────────────────────────────────────────
	cursorLine = $state(1);
	cursorCol = $state(0);
	wordCount = $state(0);
	lineCount = $state(0);

	// ── Derived getters ───────────────────────────────────────────
	get activeFile(): FileNode | null {
		if (!this.activeFileId) return null;
		return this.files.find((f) => f.id === this.activeFileId) ?? null;
	}

	get hasOpenFiles(): boolean {
		return this.openFileIds.size > 0;
	}

	get openFileIdsArray(): FileId[] {
		return [...this.openFileIds];
	}

	get searchResults(): FileNode[] {
		const q = this.searchQuery.trim().toLowerCase();
		if (q.length < 2) return [];
		return this.files.filter(
			(f) =>
				f.type === 'file' &&
				(f.name.toLowerCase().includes(q) ||
					(this.fileContents[f.id] ?? '').toLowerCase().includes(q))
		);
	}

	// ── File tree helpers ─────────────────────────────────────────
	getFile(id: FileId): FileNode | undefined {
		return this.files.find((f) => f.id === id);
	}

	getChildren(parentId: FileId | null): FileId[] {
		return this.files
			.filter((f) => f.parentId === parentId)
			.sort((a, b) => {
				if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
				return a.name.localeCompare(b.name);
			})
			.map((f) => f.id);
	}

	isExpanded(id: FileId): boolean {
		return this.expandedIds.has(id);
	}

	toggleExpand(id: FileId): void {
		if (this.expandedIds.has(id)) {
			this.expandedIds.delete(id);
		} else {
			this.expandedIds.add(id);
		}
	}

	expand(id: FileId): void {
		this.expandedIds.add(id);
	}

	computePath(id: FileId): string {
		const parts: string[] = [];
		let current: FileNode | undefined = this.getFile(id);
		while (current) {
			parts.unshift(current.name);
			if (current.parentId === null) break;
			current = this.getFile(current.parentId);
		}
		return parts.join(' / ');
	}

	get activePath(): string {
		return this.activeFileId ? this.computePath(this.activeFileId) : '';
	}

	get activeBreadcrumbs(): string[] {
		if (!this.activeFileId) return [];
		const parts: string[] = [];
		let current: FileNode | undefined = this.getFile(this.activeFileId);
		while (current) {
			parts.unshift(current.name);
			if (current.parentId === null) break;
			current = this.getFile(current.parentId);
		}
		return parts;
	}

	// ── File operations ───────────────────────────────────────────
	selectFile(id: FileId): void {
		const file = this.getFile(id);
		if (!file || file.type !== 'file') return;
		this.activeFileId = id;
		this.openFileIds.add(id);
		this.recalcStats(id);
	}

	closeFile(id: FileId): void {
		this.openFileIds.delete(id);
		if (this.activeFileId === id) {
			const remaining = [...this.openFileIds];
			this.activeFileId = remaining.at(-1) ?? null;
			if (this.activeFileId) this.recalcStats(this.activeFileId);
		}
	}

	updateContent(id: FileId, content: string): void {
		this.fileContents[id] = content;
		if (id === this.activeFileId) {
			const lines = content.split('\n');
			this.lineCount = lines.length;
			const words = content.match(/\S+/g);
			this.wordCount = words?.length ?? 0;
		}
	}

	updateCursor(pos: number, content: string): void {
		const before = content.substring(0, pos);
		const lines = before.split('\n');
		this.cursorLine = lines.length;
		this.cursorCol = lines.at(-1)?.length ?? 0;
	}

	private recalcStats(id: FileId): void {
		const content = this.fileContents[id] ?? '';
		const lines = content.split('\n');
		this.lineCount = lines.length;
		const words = content.match(/\S+/g);
		this.wordCount = words?.length ?? 0;
		this.cursorLine = 1;
		this.cursorCol = 0;
	}

	// ── Terminal commands ─────────────────────────────────────────
	execCommand(command: string): void {
		const trimmed = command.trim();
		if (!trimmed) return;

		this.terminalHistory = [
			...this.terminalHistory,
			{ type: 'input', command: trimmed }
		];

		const [cmd, ...args] = trimmed.split(/\s+/);
		let result: { stdout: string; stderr: string; exitCode: number };

		switch (cmd) {
			case 'help':
				result = {
					stdout: [
						'Comandos disponibles:',
						'  ls [dir]        Listar archivos',
						'  cat <archivo>   Ver contenido de un archivo',
						'  open <archivo>  Abrir archivo en el editor',
						'  pwd             Mostrar ruta actual',
						'  clear           Limpiar terminal',
						'  help            Mostrar esta ayuda'
					].join('\n'),
					stderr: '',
					exitCode: 0
				};
				break;

			case 'ls': {
				const targetDir = args[0]
					? this.files.find((f) => f.name === args[0] && f.type === 'folder')
					: null;
				const parentId = targetDir ? targetDir.id : null;
				const children = this.files.filter((f) => f.parentId === parentId);

				if (args[0] && !targetDir) {
					result = { stdout: '', stderr: `ls: ${args[0]}: directorio no encontrado`, exitCode: 1 };
				} else {
					result = {
						stdout:
							children.map((f) => (f.type === 'folder' ? `${f.name}/` : f.name)).join('\n') ||
							'(vacío)',
						stderr: '',
						exitCode: 0
					};
				}
				break;
			}

			case 'cat': {
				if (!args[0]) {
					result = { stdout: '', stderr: 'cat: nombre de archivo requerido', exitCode: 1 };
				} else {
					const file = this.files.find((f) => f.name === args[0] && f.type === 'file');
					if (!file) {
						result = { stdout: '', stderr: `cat: ${args[0]}: archivo no encontrado`, exitCode: 1 };
					} else {
						result = { stdout: this.fileContents[file.id] ?? '', stderr: '', exitCode: 0 };
					}
				}
				break;
			}

			case 'open': {
				if (!args[0]) {
					result = { stdout: '', stderr: 'open: nombre de archivo requerido', exitCode: 1 };
				} else {
					const file = this.files.find((f) => f.name === args[0] && f.type === 'file');
					if (!file) {
						result = {
							stdout: '',
							stderr: `open: ${args[0]}: archivo no encontrado`,
							exitCode: 1
						};
					} else {
						this.selectFile(file.id);
						result = { stdout: `Abriendo ${args[0]}...`, stderr: '', exitCode: 0 };
					}
				}
				break;
			}

			case 'pwd':
				result = {
					stdout: this.activeFile
						? '/' + this.computePath(this.activeFile.id).replaceAll(' / ', '/')
						: '/Vault',
					stderr: '',
					exitCode: 0
				};
				break;

			case 'clear':
				this.terminalHistory = [];
				return;

			default:
				result = {
					stdout: '',
					stderr: `${cmd}: comando no encontrado. Escribe "help" para ayuda.`,
					exitCode: 127
				};
		}

		this.terminalHistory = [...this.terminalHistory, { type: 'output', ...result }];
	}
}

export const appState = new AppState();
