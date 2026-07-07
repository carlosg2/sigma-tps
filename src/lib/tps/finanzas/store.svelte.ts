import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';
import type { FinanzasState, Proveedor, Egreso, HistorialAviso, AvisoEstado, FinanzasConfig } from './types';
import { createInitialFinanzasState } from './seed';

const STORAGE_KEY = 'tps-finanzas-state';
const DATA_VERSION = 1;

function loadState(): FinanzasState | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (parsed._dataVersion !== DATA_VERSION || !parsed.proveedores || !parsed.egresos) {
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}
		return parsed as FinanzasState;
	} catch {
		return null;
	}
}

function saveState(state: FinanzasState) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, _dataVersion: DATA_VERSION }));
	} catch {
		// noop
	}
}

/** Fecha/hora local con formato 'YYYY-MM-DD HH:mm:ss' (coincide con la maqueta). */
function now(): string {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export class FinanzasStore {
	state = $state<FinanzasState>(createInitialFinanzasState());

	constructor() {
		const saved = loadState();
		if (saved) this.state = saved;
	}

	#commit() {
		this.state.lastUpdated = new Date().toISOString();
		saveState(this.state);
	}

	// --- Lookups ---
	getProveedor(id: number): Proveedor | undefined {
		return this.state.proveedores.find((p) => p.id === id);
	}

	getEgreso(id: string): Egreso | undefined {
		return this.state.egresos.find((e) => e.id === id);
	}

	getHistorial(id: number): HistorialAviso | undefined {
		return this.state.historial.find((h) => h.id === id);
	}

	/** Correo destino efectivo: el de avisos, o el comercial del ERP como fallback. */
	correoDestino(prov: Proveedor): string {
		return prov.correoA || prov.correoC || '';
	}

	// --- Getters derivados ---
	get avisosEnviadosMes(): number {
		return this.state.historial.filter((h) => h.estado === 'enviado').length;
	}

	get pendientes(): number {
		return this.state.egresos.filter((e) => e.aviso === 'pendiente' || e.aviso === 'error').length;
	}

	get conError(): number {
		return this.state.historial.filter((h) => h.estado === 'error').length;
	}

	get montoComunicado(): number {
		return this.state.historial.reduce((a, h) => a + h.monto, 0);
	}

	/** Proveedores activos que aun no tienen correo de avisos configurado. */
	get sinCorreoActivos(): Proveedor[] {
		return this.state.proveedores.filter((p) => p.activo && !p.correoA);
	}

	// --- Proveedores ---
	saveProveedor(id: number, updates: Pick<Proveedor, 'correoA' | 'contacto' | 'activo'>) {
		this.state.proveedores = this.state.proveedores.map((p) => (p.id === id ? { ...p, ...updates } : p));
		this.#commit();
	}

	toggleProveedor(id: number): boolean {
		let nuevo = false;
		this.state.proveedores = this.state.proveedores.map((p) => {
			if (p.id !== id) return p;
			nuevo = !p.activo;
			return { ...p, activo: nuevo };
		});
		this.#commit();
		return nuevo;
	}

	// --- Envio de avisos ---
	/** Envia el aviso de un egreso y registra el resultado en el historial. */
	enviarAviso(egresoId: string): AvisoEstado | null {
		const e = this.state.egresos.find((x) => x.id === egresoId);
		if (!e) return null;
		const p = this.getProveedor(e.provId);
		if (!p) return null;
		const correo = this.correoDestino(p);
		const estado: AvisoEstado = correo ? 'enviado' : 'sin_correo';
		e.aviso = estado;
		this.state.historial.unshift({
			id: this.state.nextHistId++,
			fecha: now(),
			provId: e.provId,
			facturas: e.facturas,
			monto: e.monto,
			correo,
			ref: e.ref,
			banco: e.banco,
			estado
		});
		this.#commit();
		return estado;
	}

	/** Envia un lote de egresos. Devuelve el conteo de enviados y sin correo. */
	enviarLote(ids: string[]): { sent: number; nomail: number } {
		let sent = 0;
		let nomail = 0;
		for (const id of ids) {
			const estado = this.enviarAvisoSilencioso(id);
			if (estado === 'enviado') sent++;
			else if (estado === 'sin_correo') nomail++;
		}
		this.#commit();
		return { sent, nomail };
	}

	/** Igual que enviarAviso pero sin commit individual (para lotes). */
	private enviarAvisoSilencioso(egresoId: string): AvisoEstado | null {
		const e = this.state.egresos.find((x) => x.id === egresoId);
		if (!e) return null;
		const p = this.getProveedor(e.provId);
		if (!p) return null;
		const correo = this.correoDestino(p);
		const estado: AvisoEstado = correo ? 'enviado' : 'sin_correo';
		e.aviso = estado;
		this.state.historial.unshift({
			id: this.state.nextHistId++,
			fecha: now(),
			provId: e.provId,
			facturas: e.facturas,
			monto: e.monto,
			correo,
			ref: e.ref,
			banco: e.banco,
			estado
		});
		return estado;
	}

	/** Reenvia un aviso del historial, opcionalmente a un correo corregido. */
	reenviarHistorial(id: number, email: string) {
		this.state.historial = this.state.historial.map((h) => (h.id === id ? { ...h, estado: 'enviado' as const, correo: email } : h));
		this.#commit();
	}

	// --- Configuracion ---
	updateConfig(updates: Partial<FinanzasConfig>) {
		this.state.config = { ...this.state.config, ...updates };
		this.#commit();
	}

	resetData() {
		this.state = createInitialFinanzasState();
		if (browser) localStorage.removeItem(STORAGE_KEY);
		this.#commit();
	}
}

const STORE_KEY = Symbol('finanzas-store');

export function setFinanzasStore(): FinanzasStore {
	const store = new FinanzasStore();
	setContext(STORE_KEY, store);
	return store;
}

export function useFinanzasStore(): FinanzasStore {
	const store = getContext<FinanzasStore>(STORE_KEY);
	if (!store) throw new Error('useFinanzasStore must be used within a finanzas layout');
	return store;
}
