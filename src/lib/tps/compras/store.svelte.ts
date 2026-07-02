import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';
import type { ComprasState, OrdenCompra, NivelConfig, BitacoraEntry } from './types';
import { createInitialComprasState } from './seed';

const STORAGE_KEY = 'tps-compras-state';
const DATA_VERSION = 2;

function loadState(): ComprasState | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (parsed._dataVersion !== DATA_VERSION || !parsed.ordenes || !parsed.requisiciones) {
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}
		return parsed as ComprasState;
	} catch {
		return null;
	}
}

function saveState(state: ComprasState) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, _dataVersion: DATA_VERSION }));
	} catch {
		// noop
	}
}

function uid(prefix: string): string {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Fecha/hora local con formato 'DD/MM/AAAA HH:mm' (coincide con la maqueta). */
function now(): string {
	return new Date().toLocaleString('es-MX', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export class ComprasStore {
	state = $state<ComprasState>(createInitialComprasState());

	constructor() {
		const saved = loadState();
		if (saved) this.state = saved;
	}

	#commit() {
		this.state.lastUpdated = new Date().toISOString();
		saveState(this.state);
	}

	// --- Órdenes de Compra / Bandeja de autorizacion (GAP-COM-002) ---
	getOrden(id: string): OrdenCompra | undefined {
		return this.state.ordenes.find((o) => o.id === id);
	}

	get pendientes(): number {
		return this.state.ordenes.filter((o) => o.estado === 'Pendiente').length;
	}

	/** Bitacora global ordenada por fecha descendente. */
	get bitacoraGlobal(): (BitacoraEntry & { oc: string; cc: string })[] {
		const rows: (BitacoraEntry & { oc: string; cc: string })[] = [];
		for (const o of this.state.ordenes) {
			for (const b of o.bitacora) {
				rows.push({ ...b, oc: o.id, cc: `${o.centroCosto} · ${o.ccNombre}` });
			}
		}
		return rows.sort((a, b) => b.fecha.localeCompare(a.fecha));
	}

	authorizeOrden(id: string, comentario: string) {
		const user = this.state.currentUser;
		this.state.ordenes = this.state.ordenes.map((o) => {
			if (o.id !== id) return o;
			const entry: BitacoraEntry = {
				id: uid('bit'),
				fecha: now(),
				usuario: user.name,
				rol: user.role,
				accion: `Autorización Nivel ${o.nivelActual} ✓`,
				tipo: 'aprobado',
				comentario: comentario.trim() || 'Autorizado.'
			};
			const bitacora = [...o.bitacora, entry];
			if (o.nivelActual >= o.nivel) {
				return { ...o, bitacora, estado: 'Aprobado' as const };
			}
			return { ...o, bitacora, nivelActual: o.nivelActual + 1 };
		});
		this.#commit();
	}

	rejectOrden(id: string, comentario: string) {
		const user = this.state.currentUser;
		this.state.ordenes = this.state.ordenes.map((o) => {
			if (o.id !== id) return o;
			const entry: BitacoraEntry = {
				id: uid('bit'),
				fecha: now(),
				usuario: user.name,
				rol: user.role,
				accion: `Rechazado Nivel ${o.nivelActual} ✗`,
				tipo: 'rechazado',
				comentario: comentario.trim() || 'Rechazado.'
			};
			return { ...o, bitacora: [...o.bitacora, entry], estado: 'Rechazado' as const };
		});
		this.#commit();
	}

	// --- Configuracion de niveles (GAP-COM-002) ---
	updateConfigNivel(nivel: number, updates: Partial<NivelConfig>) {
		this.state.config = this.state.config.map((c) => (c.nivel === nivel ? { ...c, ...updates } : c));
		this.#commit();
	}

	saveConfig() {
		this.#commit();
	}

	// --- Requisiciones (GAP-COM-003) ---
	getRequisicion(id: string) {
		return this.state.requisiciones.find((r) => r.id === id);
	}

	resetData() {
		this.state = createInitialComprasState();
		if (browser) localStorage.removeItem(STORAGE_KEY);
		this.#commit();
	}
}

const STORE_KEY = Symbol('compras-store');

export function setComprasStore(): ComprasStore {
	const store = new ComprasStore();
	setContext(STORE_KEY, store);
	return store;
}

export function useComprasStore(): ComprasStore {
	const store = getContext<ComprasStore>(STORE_KEY);
	if (!store) throw new Error('useComprasStore must be used within a compras layout');
	return store;
}
