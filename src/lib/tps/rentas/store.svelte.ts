import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';
import type {
	RentasState,
	Cotizacion,
	CotizacionDraft,
	Compliance,
	DayStatus,
	DocEstatus,
	FlowStatus,
	Vehiculo,
	BitacoraTipo
} from './types';
import { createInitialRentasState } from './seed';
import {
	VEHICULOS,
	DOCUMENTOS_OBLIGATORIOS,
	LISTA_NEGRA,
	FLOW_STEPS,
	todayISO,
	nowStr
} from './constants';

const STORAGE_KEY = 'tps-rentas-state';
const DATA_VERSION = 1;

function loadState(): RentasState | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (parsed._dataVersion !== DATA_VERSION || !parsed.cotizaciones || !parsed.compliance) {
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}
		return parsed as RentasState;
	} catch {
		return null;
	}
}

function saveState(state: RentasState) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, _dataVersion: DATA_VERSION }));
	} catch {
		// noop
	}
}

function inRange(dateStr: string, start: string, end: string): boolean {
	return dateStr >= start && dateStr <= end;
}

export class RentasStore {
	state = $state<RentasState>(createInitialRentasState());

	constructor() {
		const saved = loadState();
		if (saved) this.state = saved;
	}

	#commit() {
		this.state.lastUpdated = new Date().toISOString();
		saveState(this.state);
	}

	// --- Catalogo ---
	get vehiculos(): Vehiculo[] {
		return VEHICULOS;
	}

	getVehiculo(vin: string): Vehiculo | undefined {
		return VEHICULOS.find((v) => v.vin === vin);
	}

	/** Estado de un dia para una unidad, considerando ocupacion demo y cotizaciones guardadas. */
	getDayStatus(vin: string, dateStr: string): DayStatus {
		const v = this.getVehiculo(vin);
		if (!v) return 'available';
		for (const o of v.ocupacion) {
			if (inRange(dateStr, o.start, o.end)) return o.tipo;
		}
		for (const c of this.state.cotizaciones) {
			if (c.vin === vin && c.fechaInicio && c.fechaFin && inRange(dateStr, c.fechaInicio, c.fechaFin)) {
				return 'occupied';
			}
		}
		return 'available';
	}

	/** Devuelve el conflicto si la unidad no esta disponible en el periodo, o null. */
	checkOcupacion(
		vin: string,
		startStr: string,
		endStr: string,
		excludeFolio?: string | null
	): { tipo: string; folio?: string } | null {
		const v = this.getVehiculo(vin);
		if (!v || !startStr || !endStr) return null;
		const conflicto = this.state.cotizaciones.find(
			(c) =>
				c.vin === vin &&
				c.folio !== excludeFolio &&
				c.fechaInicio &&
				c.fechaFin &&
				!(endStr < c.fechaInicio || startStr > c.fechaFin)
		);
		if (conflicto) return { tipo: 'cotizacion', folio: conflicto.folio };
		const ocupado = v.ocupacion.find((o) => !(endStr < o.start || startStr > o.end));
		if (ocupado) return { tipo: ocupado.tipo };
		return null;
	}

	// --- Cotizaciones ---
	getCotizacion(folio: string | null): Cotizacion | undefined {
		if (!folio) return undefined;
		return this.state.cotizaciones.find((c) => c.folio === folio);
	}

	get cotizacionActivaObj(): Cotizacion | undefined {
		return this.getCotizacion(this.state.cotizacionActiva);
	}

	setActiva(folio: string | null) {
		this.state.cotizacionActiva = folio;
		this.#commit();
	}

	#generarFolio(): string {
		const folio = `RNT-${String(this.state.nextFolio).padStart(4, '0')}`;
		this.state.nextFolio += 1;
		return folio;
	}

	/** Crea una nueva cotizacion desde un draft y la marca como activa. */
	createCotizacion(draft: CotizacionDraft): string {
		const folio = this.#generarFolio();
		const nueva: Cotizacion = {
			folio,
			version: 'v01',
			historial: [],
			disponibilidadOk: false,
			...draft
		};
		this.state.cotizaciones = [...this.state.cotizaciones, nueva];
		this.state.cotizacionActiva = folio;
		this.#commit();
		return folio;
	}

	/** Actualiza una cotizacion existente conservando folio, version e historial. */
	updateCotizacion(folio: string, draft: Partial<CotizacionDraft> & { disponibilidadOk?: boolean }) {
		this.state.cotizaciones = this.state.cotizaciones.map((c) =>
			c.folio === folio ? { ...c, ...draft } : c
		);
		this.#commit();
	}

	/** Genera una nueva version, archivando la actual en el historial. */
	nuevaVersion(folio: string): string | null {
		const cot = this.getCotizacion(folio);
		if (!cot) return null;
		const num = parseInt(cot.version.replace('v', ''), 10) + 1;
		const nueva = `v${String(num).padStart(2, '0')}`;
		this.state.cotizaciones = this.state.cotizaciones.map((c) => {
			if (c.folio !== folio) return c;
			return {
				...c,
				historial: [
					...c.historial,
					{ version: c.version, total: c.total, fecha: nowStr(), cliente: c.cliente, vin: c.vin }
				],
				version: nueva
			};
		});
		this.#commit();
		return nueva;
	}

	// --- KPIs ---
	get disponibilidadHoy(): number {
		const total = VEHICULOS.length;
		if (!total) return 0;
		const hoy = todayISO();
		const ocupados = VEHICULOS.filter((v) => this.getDayStatus(v.vin, hoy) !== 'available').length;
		return Math.round(((total - ocupados) / total) * 100);
	}

	get utilizacion(): number {
		const total = VEHICULOS.length;
		if (!total) return 0;
		const hoy = todayISO();
		const ocupados = VEHICULOS.filter((v) => this.getDayStatus(v.vin, hoy) !== 'available').length;
		return Math.round((ocupados / total) * 100);
	}

	get pipeline(): number {
		return this.state.cotizaciones.reduce((s, c) => s + (c.total || 0), 0);
	}

	get riesgo(): { label: string; nivel: 'bajo' | 'medio' | 'alto' } {
		const pendientes = this.state.cotizaciones.filter((c) => {
			const comp = this.state.compliance[c.folio];
			return !comp || comp.liberacion !== 'Liberada';
		});
		if (pendientes.length === 0) return { label: 'Bajo', nivel: 'bajo' };
		if (pendientes.length <= 2) return { label: 'Medio', nivel: 'medio' };
		return { label: 'Alto', nivel: 'alto' };
	}

	// --- Flujo ---
	flowStatusFor(folio: string): FlowStatus {
		const cot = this.getCotizacion(folio);
		const comp = this.state.compliance[folio] ?? ({} as Partial<Compliance>);
		return {
			cliente: !!cot?.cliente,
			vin: !!cot?.vin,
			fechas: !!(cot?.fechaInicio && cot?.fechaFin),
			disponibilidad: !!cot?.disponibilidadOk,
			total: !!(cot && cot.total > 0),
			guardada: !!cot,
			antifraude: comp.antifraude === 'Limpio',
			expediente: comp.expediente === 'Completo',
			calidad: comp.calidad === 'Aprobado',
			liberacion: comp.liberacion === 'Liberada'
		};
	}

	flowProgress(folio: string): { done: number; total: number; pct: number } {
		const status = this.flowStatusFor(folio);
		const done = FLOW_STEPS.filter((s) => status[s.id]).length;
		return { done, total: FLOW_STEPS.length, pct: Math.round((done / FLOW_STEPS.length) * 100) };
	}

	// --- Compliance ---
	ensureCompliance(folio: string): Compliance {
		if (!this.state.compliance[folio]) {
			const cot = this.getCotizacion(folio);
			this.state.compliance[folio] = {
				cliente: cot?.cliente ?? '',
				riesgo: 'bajo',
				antifraude: 'Pendiente',
				expediente: 'Pendiente',
				calidad: 'Sin revisar',
				liberacion: 'Bloqueada',
				documentos: DOCUMENTOS_OBLIGATORIOS.map((d) => ({ nombre: d, estatus: 'Pendiente', obs: '' })),
				bitacora: []
			};
			this.#commit();
		}
		return this.state.compliance[folio];
	}

	getCompliance(folio: string | null): Compliance | undefined {
		if (!folio) return undefined;
		return this.state.compliance[folio];
	}

	logBitacora(folio: string, msg: string, tipo: BitacoraTipo = 'info') {
		const comp = this.ensureCompliance(folio);
		comp.bitacora = [...comp.bitacora, { msg, tipo, fecha: nowStr() }];
		this.#commit();
	}

	/** Verifica al cliente contra la lista negra. Devuelve true si esta limpio. */
	verificarListaNegra(folio: string, cliente: string): boolean {
		const comp = this.ensureCompliance(folio);
		const enLista = LISTA_NEGRA.some((n) => n.toLowerCase() === cliente.toLowerCase());
		comp.antifraude = enLista ? 'En lista negra' : 'Limpio';
		comp.cliente = cliente;
		this.logBitacora(
			folio,
			enLista
				? `ALERTA: "${cliente}" encontrado en lista negra.`
				: `Antifraude OK: "${cliente}" sin registros en lista negra.`,
			enLista ? 'danger' : 'success'
		);
		this.#recomputeLiberacion(folio);
		return !enLista;
	}

	marcarDocsRecibidos(folio: string) {
		const comp = this.ensureCompliance(folio);
		comp.documentos = comp.documentos.map((d) =>
			d.estatus === 'Pendiente' ? { ...d, estatus: 'Recibido' } : d
		);
		this.logBitacora(folio, 'Todos los documentos marcados como Recibido.', 'info');
	}

	setDocEstatus(folio: string, idx: number, estatus: DocEstatus) {
		const comp = this.ensureCompliance(folio);
		comp.documentos = comp.documentos.map((d, i) => (i === idx ? { ...d, estatus } : d));
		this.#recomputeExpediente(folio);
		this.#recomputeLiberacion(folio);
		this.#commit();
	}

	setDocObs(folio: string, idx: number, obs: string) {
		const comp = this.ensureCompliance(folio);
		comp.documentos = comp.documentos.map((d, i) => (i === idx ? { ...d, obs } : d));
		this.#commit();
	}

	#recomputeExpediente(folio: string) {
		const comp = this.ensureCompliance(folio);
		const allValid = comp.documentos.every((d) => d.estatus === 'Validado');
		const anyRejected = comp.documentos.some((d) => d.estatus === 'Rechazado');
		comp.expediente = anyRejected ? 'Rechazado' : allValid ? 'Completo' : 'Pendiente';
	}

	/** Recalcula la liberacion. Devuelve true si acaba de liberarse la unidad. */
	#recomputeLiberacion(folio: string): boolean {
		const comp = this.ensureCompliance(folio);
		const ok =
			comp.antifraude === 'Limpio' && comp.expediente === 'Completo' && comp.calidad === 'Aprobado';
		const anteriorLiberada = comp.liberacion === 'Liberada';
		comp.liberacion = ok ? 'Liberada' : 'Bloqueada';
		this.#commit();
		return ok && !anteriorLiberada;
	}

	guardarValidacion(folio: string) {
		this.#recomputeExpediente(folio);
		this.logBitacora(folio, 'Validación de expediente guardada.', 'info');
		this.#recomputeLiberacion(folio);
	}

	/** Envia el expediente a Calidad. Devuelve false si no esta completo. */
	enviarCalidad(folio: string): boolean {
		const comp = this.ensureCompliance(folio);
		if (comp.expediente !== 'Completo') return false;
		this.logBitacora(folio, 'Expediente enviado a revisión de Calidad.', 'info');
		return true;
	}

	/** Aprueba Calidad. Devuelve { ok, liberada }. */
	aprobarCalidad(folio: string): { ok: boolean; liberada: boolean } {
		const comp = this.ensureCompliance(folio);
		if (comp.expediente !== 'Completo') return { ok: false, liberada: false };
		comp.calidad = 'Aprobado';
		this.logBitacora(folio, 'Calidad: expediente APROBADO.', 'success');
		const liberada = this.#recomputeLiberacion(folio);
		return { ok: true, liberada };
	}

	rechazarCalidad(folio: string) {
		const comp = this.ensureCompliance(folio);
		comp.calidad = 'Rechazado';
		this.logBitacora(folio, 'Calidad: expediente RECHAZADO.', 'danger');
		this.#recomputeLiberacion(folio);
	}

	/** Reutiliza documentos y antifraude de una cotizacion previa aprobada del mismo cliente. */
	reutilizarHistorial(folio: string, cliente: string): string | null {
		const comp = this.ensureCompliance(folio);
		const prevFolio = Object.keys(this.state.compliance).find(
			(f) =>
				f !== folio &&
				this.state.compliance[f].calidad === 'Aprobado' &&
				this.state.cotizaciones.some((c) => c.folio === f && c.cliente === cliente)
		);
		if (!prevFolio) return null;
		const prev = this.state.compliance[prevFolio];
		comp.documentos = prev.documentos.map((d) => ({ ...d }));
		comp.antifraude = prev.antifraude;
		this.#recomputeExpediente(folio);
		this.logBitacora(folio, `Historial de validación reutilizado de ${prevFolio}.`, 'info');
		this.#recomputeLiberacion(folio);
		return prevFolio;
	}

	// --- Validacion / disponibilidad de una cotizacion ---
	marcarDisponibilidad(folio: string, ok: boolean) {
		this.updateCotizacion(folio, { disponibilidadOk: ok });
	}

	resetData() {
		this.state = createInitialRentasState();
		if (browser) localStorage.removeItem(STORAGE_KEY);
		this.#commit();
	}
}

const STORE_KEY = Symbol('rentas-store');

export function setRentasStore(): RentasStore {
	const store = new RentasStore();
	setContext(STORE_KEY, store);
	return store;
}

export function useRentasStore(): RentasStore {
	const store = getContext<RentasStore>(STORE_KEY);
	if (!store) throw new Error('useRentasStore must be used within a rentas layout');
	return store;
}
