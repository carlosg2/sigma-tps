// Modelo de datos del modulo de Rentas — Cotizador (GAP-RNT-001) y Compliance/Stop-Gate (GAP-RNT-003).

export type DayStatus = 'available' | 'occupied' | 'maintenance';
export type OcupacionTipo = 'occupied' | 'maintenance';

/** Un periodo en que una unidad esta ocupada o en mantenimiento. */
export interface Ocupacion {
	start: string; // 'YYYY-MM-DD'
	end: string; // 'YYYY-MM-DD'
	tipo: OcupacionTipo;
}

/** Unidad de la flota (catalogo). */
export interface Vehiculo {
	vin: string;
	modelo: string;
	nivel: string;
	tarifa: number;
	fotos: string[];
	ocupacion: Ocupacion[];
}

export interface Extra {
	id: string;
	label: string;
	precio: number;
}

export interface HistorialVersion {
	version: string;
	total: number;
	fecha: string;
	cliente: string;
	vin: string;
}

/** Una cotizacion de renta. */
export interface Cotizacion {
	folio: string;
	version: string; // 'v01'
	cliente: string;
	vin: string;
	fechaInicio: string | null; // 'YYYY-MM-DD'
	fechaFin: string | null;
	dias: number;
	tarifa: number;
	extras: Extra[];
	baseTotal: number;
	extrasTotal: number;
	total: number;
	disponibilidadOk: boolean;
	historial: HistorialVersion[];
}

/** Datos capturados en el formulario antes de guardar. */
export interface CotizacionDraft {
	cliente: string;
	vin: string;
	fechaInicio: string | null;
	fechaFin: string | null;
	dias: number;
	tarifa: number;
	extras: Extra[];
	baseTotal: number;
	extrasTotal: number;
	total: number;
}

export type DocEstatus = 'Pendiente' | 'Recibido' | 'Validado' | 'Observaciones' | 'Rechazado';
export type Antifraude = 'Pendiente' | 'Limpio' | 'En lista negra';
export type ExpedienteEstatus = 'Pendiente' | 'Completo' | 'Rechazado';
export type CalidadEstatus = 'Sin revisar' | 'Aprobado' | 'Rechazado';
export type LiberacionEstatus = 'Bloqueada' | 'Liberada';
export type Riesgo = 'bajo' | 'medio' | 'alto';
export type BitacoraTipo = 'info' | 'success' | 'danger';

export interface DocumentoCompliance {
	nombre: string;
	estatus: DocEstatus;
	obs: string;
}

export interface BitacoraItem {
	msg: string;
	tipo: BitacoraTipo;
	fecha: string;
}

/** Estado de cumplimiento y stop-gate de una cotizacion (keyed por folio). */
export interface Compliance {
	cliente: string;
	riesgo: Riesgo;
	antifraude: Antifraude;
	expediente: ExpedienteEstatus;
	calidad: CalidadEstatus;
	liberacion: LiberacionEstatus;
	documentos: DocumentoCompliance[];
	bitacora: BitacoraItem[];
}

/** Identificadores de los pasos del flujo operativo. */
export type FlowStepId =
	| 'cliente'
	| 'vin'
	| 'fechas'
	| 'disponibilidad'
	| 'total'
	| 'guardada'
	| 'antifraude'
	| 'expediente'
	| 'calidad'
	| 'liberacion';

export type FlowStatus = Record<FlowStepId, boolean>;

export interface RentasState {
	cotizaciones: Cotizacion[];
	compliance: Record<string, Compliance>;
	cotizacionActiva: string | null;
	nextFolio: number;
	lastUpdated: string;
}
