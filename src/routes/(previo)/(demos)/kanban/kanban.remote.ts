import { command, query } from '$app/server';
import { z } from 'zod';
import { columnIds, initialBoard, type BoardState, type ColumnId, type Task } from './components/data.js';

// Estado del tablero compartido en el servidor (en memoria)
let board: BoardState = Object.fromEntries(
	Object.entries(initialBoard).map(([k, v]) => [k, [...v]])
) as BoardState;

// Funciones que esperan el próximo cambio
const waiters = new Set<() => void>();

function notifyAll() {
	for (const resolve of waiters) resolve();
	waiters.clear();
}

function waitForChange(): Promise<void> {
	return new Promise<void>((resolve) => waiters.add(resolve));
}

// Bot: simula el flujo de trabajo de un kanban. Cada tick avanza entre 1 y 4
// tareas a la siguiente columna en orden (ideas → planned → building → qa →
// shipped) y, al llegar a la última, las recicla de vuelta a la primera columna.
function scheduleBot() {
	const delay = 6000 + Math.random() * 6000;
	setTimeout(() => {
		const moves = 1 + Math.floor(Math.random() * 4); // 1..4
		const movedIds = new Set<string>();
		let next = board;
		let changed = false;

		for (let m = 0; m < moves; m++) {
			// Columnas con tareas que aún no se movieron en este tick
			const sourceCols = columnIds.filter((id) =>
				next[id].some((t) => !movedIds.has(t.id))
			);
			if (sourceCols.length === 0) break;

			const from = sourceCols[Math.floor(Math.random() * sourceCols.length)];
			const candidates = next[from].filter((t) => !movedIds.has(t.id));
			const task = candidates[Math.floor(Math.random() * candidates.length)];

			// Avanzar a la siguiente columna; si es la última, volver a la primera
			const fromIdx = columnIds.indexOf(from);
			const to: ColumnId = columnIds[(fromIdx + 1) % columnIds.length];

			next = {
				...next,
				[from]: next[from].filter((t) => t.id !== task.id),
				[to]: [task, ...next[to]]
			};
			movedIds.add(task.id);
			changed = true;
		}

		if (changed) {
			board = next;
			notifyAll();
		}
		scheduleBot();
	}, delay);
}

scheduleBot();

export const getLiveBoard = query.live(async function* () {
	yield board;
	while (true) {
		await waitForChange();
		yield board;
	}
});

// Persiste un movimiento de tarjeta hecho por el usuario (drag & drop). Se fusiona
// con el estado actual del servidor —que el bot puede haber modificado— quitando la
// tarea de donde esté y reinsertándola en la columna/índice destino. Luego notifica
// a todos los clientes conectados para propagar el cambio en tiempo real.
const moveTaskSchema = z.object({
	taskId: z.string(),
	toColumn: z.enum(columnIds as [ColumnId, ...ColumnId[]]),
	toIndex: z.number().int().min(0)
});

export const moveTask = command(moveTaskSchema, async ({ taskId, toColumn, toIndex }) => {
	let moved: Task | undefined;

	// Quitar la tarea de cualquier columna donde se encuentre
	const next = Object.fromEntries(
		columnIds.map((col) => [
			col,
			board[col].filter((t) => {
				if (t.id === taskId) {
					moved = t;
					return false;
				}
				return true;
			})
		])
	) as BoardState;

	if (!moved) return; // la tarea ya no existe (estado obsoleto) → ignorar

	// Reinsertar en la posición destino
	const target = next[toColumn];
	const idx = Math.min(toIndex, target.length);
	next[toColumn] = [...target.slice(0, idx), moved, ...target.slice(idx)];

	board = next;
	notifyAll();
});
