// Modelo de datos del modulo de Finanzas — Avisos de Pago Automaticos (GAP-FIN-004).

/** Estado de un aviso ya registrado en el historial. */
export type AvisoEstado = 'enviado' | 'error' | 'sin_correo';

/** Estado del aviso asociado a un egreso del ERP. */
export type EgresoAviso = 'pendiente' | 'enviado' | 'error' | 'sin_correo';

/** Proveedor sincronizado con el ERP. Solo el correo de avisos y el contacto son configurables. */
export interface Proveedor {
	id: number;
	rfc: string;
	nombre: string;
	/** Correo comercial proveniente del ERP (solo lectura). */
	correoC: string;
	/** Correo para avisos de pago (configurable en el portal). */
	correoA: string;
	contacto: string;
	tel: string;
	/** Si los avisos automaticos estan activos para este proveedor. */
	activo: boolean;
}

/** Una factura liquidada dentro de un egreso. */
export interface Factura {
	num: string;
	desc: string;
	sub: number;
	iva: number;
	tot: number;
	/** Saldo restante por liquidar en un siguiente ciclo (opcional). */
	saldoRest?: number;
}

/** Un egreso generado en el ERP, candidato a enviar aviso al proveedor. */
export interface Egreso {
	id: string;
	fecha: string; // 'YYYY-MM-DD'
	provId: number;
	facturas: Factura[];
	monto: number;
	ref: string;
	banco: string;
	aviso: EgresoAviso;
}

/** Registro de un aviso enviado (o intentado). */
export interface HistorialAviso {
	id: number;
	fecha: string; // 'YYYY-MM-DD HH:mm:ss'
	provId: number;
	facturas: Factura[];
	monto: number;
	correo: string;
	ref: string;
	banco: string;
	estado: AvisoEstado;
}

/** Preferencias generales del envio de avisos. */
export interface FinanzasConfig {
	envioAutomatico: boolean;
	reintentar: boolean;
	notificarErrores: boolean;
	retencionDias: number;
}

export interface FinanzasState {
	proveedores: Proveedor[];
	egresos: Egreso[];
	historial: HistorialAviso[];
	config: FinanzasConfig;
	nextHistId: number;
	lastUpdated: string;
}
