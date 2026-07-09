import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';
import type { TallerState, Vehicle, Appointment, MaintenanceAlert, BranchCode, ApptStatus } from './types';
import { createInitialTallerState } from './seed';

const STORAGE_KEY = 'tps-taller-state';
const DATA_VERSION = 1;

function loadState(): TallerState | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (parsed._dataVersion !== DATA_VERSION || !parsed.vehicles || !parsed.appointments) {
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}
		return parsed as TallerState;
	} catch {
		return null;
	}
}

function saveState(state: TallerState) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, _dataVersion: DATA_VERSION }));
	} catch {
		// noop
	}
}

export class TallerStore {
	state = $state<TallerState>(createInitialTallerState());
	/** Sucursal activa seleccionada en el header. */
	branch = $state<BranchCode>('MTY');

	constructor() {
		const saved = loadState();
		if (saved) this.state = saved;
	}

	#commit() {
		this.state.lastUpdated = new Date().toISOString();
		saveState(this.state);
	}

	// --- Lookups ---
	getVehicle(vin: string): Vehicle | undefined {
		return this.state.vehicles.find((v) => v.vin === vin);
	}

	getBranch(code: BranchCode) {
		return this.state.branches.find((b) => b.code === code);
	}

	historyFor(vin: string) {
		return this.state.history[vin] ?? [];
	}

	// --- Citas ---
	apptsByBranch(branch: BranchCode): Appointment[] {
		return this.state.appointments.filter((a) => a.branch === branch);
	}

	apptsOn(branch: BranchCode, date: string): Appointment[] {
		return this.state.appointments
			.filter((a) => a.branch === branch && a.date === date)
			.sort((a, b) => a.sh * 60 + a.sm - (b.sh * 60 + b.sm));
	}

	/** Citas de hoy para la sucursal activa (hoy = fecha mas frecuente del seed, 2026-07-02). */
	todayAppts(branch: BranchCode, date: string): Appointment[] {
		return this.apptsOn(branch, date);
	}

	addAppointment(appt: Omit<Appointment, 'id'>): Appointment {
		const id = `APT-${String(this.state.nextApptSeq++).padStart(3, '0')}`;
		const nuevo: Appointment = { ...appt, id };
		this.state.appointments = [...this.state.appointments, nuevo];
		this.#commit();
		return nuevo;
	}

	setApptStatus(id: string, status: ApptStatus) {
		this.state.appointments = this.state.appointments.map((a) => (a.id === id ? { ...a, status } : a));
		this.#commit();
	}

	/** Verifica si una bahia esta libre en una fecha/hora para cierta duracion. */
	isBayFree(branch: BranchCode, date: string, bay: number, sh: number, sm: number, dur: number, ignoreId?: string): boolean {
		const start = sh * 60 + sm;
		const end = start + dur * 60;
		return !this.state.appointments.some((a) => {
			if (a.branch !== branch || a.date !== date || a.bay !== bay || a.id === ignoreId) return false;
			if (a.status === 'cancelada') return false;
			const aStart = a.sh * 60 + a.sm;
			const aEnd = aStart + a.dur * 60;
			return start < aEnd && end > aStart;
		});
	}

	// --- Alertas ---
	alertsByBranch(branch: BranchCode | 'ALL'): MaintenanceAlert[] {
		if (branch === 'ALL') return this.state.alerts;
		return this.state.alerts.filter((a) => a.branch === branch);
	}

	// --- Notificaciones ---
	get unreadNotifs(): number {
		return this.state.notifs.filter((n) => !n.read).length;
	}

	markAllRead() {
		this.state.notifs = this.state.notifs.map((n) => ({ ...n, read: true }));
		this.#commit();
	}

	// --- Metricas ---
	/** Horas ocupadas por bahia en una fecha. */
	bayLoad(branch: BranchCode, date: string): Record<number, number> {
		const load: Record<number, number> = {};
		for (const a of this.state.appointments) {
			if (a.branch !== branch || a.date !== date || a.status === 'cancelada') continue;
			load[a.bay] = (load[a.bay] ?? 0) + a.dur;
		}
		return load;
	}
}

const STORE_KEY = Symbol('taller-store');

export function setTallerStore(): TallerStore {
	const store = new TallerStore();
	setContext(STORE_KEY, store);
	return store;
}

export function useTallerStore(): TallerStore {
	const store = getContext<TallerStore>(STORE_KEY);
	if (!store) throw new Error('useTallerStore must be used within a taller layout');
	return store;
}
