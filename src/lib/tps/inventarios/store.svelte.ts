import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';
import type { InventariosState, Folio, Notificacion, TrazaEntry, NotifTipo, LmatFolio } from './types';
import { createInitialInventariosState } from './seed';
import { pad } from './constants';

const STORAGE_KEY = 'tps-inventarios-state';
const DATA_VERSION = 2;

function loadState(): InventariosState | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (parsed._dataVersion !== DATA_VERSION || !parsed.folios || !parsed.notificaciones || !parsed.lmatFolios) {
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}
		return parsed as InventariosState;
	} catch {
		return null;
	}
}

function saveState(state: InventariosState) {
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

function horaAhora(): string {
	const d = new Date();
	return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fechaHoy(): string {
	const d = new Date();
	return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export class InventariosStore {
	state = $state<InventariosState>(createInitialInventariosState());

	constructor() {
		const saved = loadState();
		if (saved) this.state = saved;
	}

	#commit() {
		this.state.lastUpdated = new Date().toISOString();
		saveState(this.state);
	}

	// --- Consultas ---
	getFolio(id: string): Folio | undefined {
		return this.state.folios.find((f) => f.id === id);
	}

	get foliosActivos(): number {
		return this.state.folios.filter((f) => f.estatus !== 'completado').length;
	}

	get kitsCompletados(): number {
		return this.state.folios.filter((f) => f.estatus === 'completado').length;
	}

	get aditivasPendientes(): number {
		return this.state.notificaciones.filter((n) => n.estado !== 'Surtido').length;
	}

	get unidadesEnProceso(): number {
		return this.state.folios.filter((f) => f.estatus === 'proceso' || f.estatus === 'urgente').length;
	}

	folioTotales(f: Folio) {
		const total = f.celdas.reduce((a, c) => a + c.materiales.length, 0);
		const surtidos = f.celdas.reduce((a, c) => a + c.materiales.filter((m) => m.surtido).length, 0);
		const confirmadas = f.celdas.reduce((a, c) => a + c.materiales.filter((m) => m.confirmada).length, 0);
		return { total, surtidos, confirmadas, pendientes: total - surtidos };
	}

	// --- Picking / Carritos ---
	surtirMaterial(folioId: string, pn: string) {
		const folio = this.getFolio(folioId);
		if (!folio) return;
		for (const celda of folio.celdas) {
			const mat = celda.materiales.find((m) => m.pn === pn);
			if (mat && !mat.surtido) {
				mat.surtido = true;
				this.addTraza({
					folio: folio.id,
					unidad: folio.unidad,
					celda: celda.nombre.split('—')[0].trim(),
					mat: `${mat.desc} (${mat.qty} ${mat.um})`,
					qty: mat.qty,
					resp: this.state.currentUser.name.split(' ')[0] + ' ' + (this.state.currentUser.name.split(' ')[1]?.[0] ?? '') + '.',
					tipo: 'Kit'
				});
				break;
			}
		}
		this.#commit();
	}

	// --- Confirmacion ---
	confirmarBolsa(folioId: string, pn: string) {
		const folio = this.getFolio(folioId);
		if (!folio) return;
		for (const celda of folio.celdas) {
			const mat = celda.materiales.find((m) => m.pn === pn);
			if (mat && !mat.confirmada) {
				mat.confirmada = true;
				break;
			}
		}
		this.#commit();
	}

	confirmarKitCompleto(folioId: string): boolean {
		const folio = this.getFolio(folioId);
		if (!folio) return false;
		const { total, confirmadas } = this.folioTotales(folio);
		if (confirmadas < total) return false;
		folio.estatus = 'completado';
		this.#commit();
		return true;
	}

	// --- Linekeeper ---
	surtirNotificacion(id: string) {
		const notif = this.state.notificaciones.find((n) => n.id === id);
		if (!notif || notif.estado === 'Surtido') return;
		notif.estado = 'Surtido';
		this.addTraza({
			folio: notif.folio,
			unidad: notif.unidad,
			celda: 'Aditiva',
			mat: notif.desc.slice(0, 48),
			qty: 1,
			resp: this.state.currentUser.name.split(' ')[0] + ' ' + (this.state.currentUser.name.split(' ')[1]?.[0] ?? '') + '.',
			tipo: 'Aditiva'
		});
		this.#commit();
	}

	agregarNotificacion(data: { folio: string; unidad: string; desc: string; autoriza: string; tipo?: NotifTipo }) {
		const notif: Notificacion = {
			id: uid('lk'),
			folio: data.folio,
			unidad: data.unidad,
			vin: '—',
			tipo: data.tipo ?? 'urgente',
			estado: 'Sin surtir',
			titulo: 'Aditiva urgente',
			desc: data.desc,
			mats: 'Material pendiente de especificar · Almacén verificando stock',
			autoriza: data.autoriza,
			hora: horaAhora(),
			minuta: 'Nueva'
		};
		this.state.notificaciones = [notif, ...this.state.notificaciones];
		this.#commit();
		return notif;
	}

	// --- Trazabilidad ---
	addTraza(entry: Omit<TrazaEntry, 'id' | 'fecha' | 'hora'>) {
		const row: TrazaEntry = { id: uid('tz'), fecha: fechaHoy(), hora: horaAhora(), ...entry };
		this.state.trazabilidad = [row, ...this.state.trazabilidad];
	}

	// --- Surtido de Materiales (GAP-ALM-005) ---
	getLmatFolio(id: string): LmatFolio | undefined {
		return this.state.lmatFolios.find((f) => f.id === id);
	}

	lmatFolioProgress(folio: LmatFolio) {
		const done = folio.materiales.filter((m) => m.status === 'done').length;
		const total = folio.materiales.length;
		const pct = total ? Math.round((done / total) * 100) : 0;
		return { done, total, pct, pending: total - done };
	}

	get lmatPendientes(): number {
		return this.state.lmatFolios.filter((f) => f.estatus === 'pendiente').length;
	}

	get lmatEnProceso(): number {
		return this.state.lmatFolios.filter((f) => f.estatus === 'proceso').length;
	}

	get lmatCompletados(): number {
		return this.state.lmatFolios.filter((f) => f.estatus === 'completado').length;
	}

	surtirLmatMaterial(folioId: string, sku: string, qty: number) {
		const folio = this.getLmatFolio(folioId);
		if (!folio) return;
		const mat = folio.materiales.find((m) => m.sku === sku);
		if (!mat || mat.status === 'done') return;
		mat.surtido = Math.min(mat.surtido + qty, mat.solicitado);
		mat.status = mat.surtido >= mat.solicitado ? 'done' : 'progress';
		const doneMats = folio.materiales.filter((m) => m.status === 'done').length;
		folio.estatus = doneMats === folio.materiales.length ? 'completado' : 'proceso';
		this.#commit();
	}

	// --- Nuevo folio ---
	crearFolio(data: { id: string; unidad: string; nivel: string; resp: string }): Folio {
		const num = data.id.replace(/[^0-9]/g, '').slice(-3) || '000';
		const folio: Folio = {
			id: data.id,
			num,
			vin: '—',
			unidad: data.unidad,
			nivel: data.nivel,
			resp: data.resp,
			fecha: fechaHoy(),
			estatus: 'proceso',
			horaInicio: horaAhora(),
			celdas: []
		};
		this.state.folios = [folio, ...this.state.folios];
		this.#commit();
		return folio;
	}

	resetData() {
		this.state = createInitialInventariosState();
		if (browser) localStorage.removeItem(STORAGE_KEY);
		this.#commit();
	}
}

const STORE_KEY = Symbol('inventarios-store');

export function setInventariosStore(): InventariosStore {
	const store = new InventariosStore();
	setContext(STORE_KEY, store);
	return store;
}

export function useInventariosStore(): InventariosStore {
	const store = getContext<InventariosStore>(STORE_KEY);
	if (!store) throw new Error('useInventariosStore must be used within an inventarios layout');
	return store;
}
