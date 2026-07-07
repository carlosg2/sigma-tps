import type { AvisoEstado, EgresoAviso } from './types';

// --- Datos del emisor usados en el aviso de pago (correo al proveedor). ---
export const EMPRESA = {
	nombre: 'TPS Intelisis',
	remitente: 'Tesorería TPS',
	correoRemitente: 'notificaciones.finanzas@empresa.com.mx',
	cc: 'cxp@empresa.com.mx',
	tel: '55-1234-5678',
	correo: 'finanzas@empresa.com.mx'
};

// --- Estados del historial ---
export const AVISO_ESTADO_LABELS: Record<AvisoEstado, string> = {
	enviado: 'Enviado',
	error: 'Error',
	sin_correo: 'Sin correo'
};

// Paleta alineada al tema: emerald para exito, destructive para error, chart-4 para advertencia.
export const AVISO_ESTADO_COLORS: Record<AvisoEstado, string> = {
	enviado: 'bg-emerald-500/15 text-emerald-400',
	error: 'bg-destructive/15 text-destructive',
	sin_correo: 'bg-chart-4/15 text-chart-4'
};

// --- Estados del aviso de un egreso ERP ---
export const EGRESO_AVISO_LABELS: Record<EgresoAviso, string> = {
	pendiente: 'Pendiente',
	enviado: 'Enviado',
	error: 'Error',
	sin_correo: 'Sin correo'
};

export const EGRESO_AVISO_COLORS: Record<EgresoAviso, string> = {
	pendiente: 'bg-chart-3/20 text-chart-3',
	enviado: 'bg-emerald-500/15 text-emerald-400',
	error: 'bg-destructive/15 text-destructive',
	sin_correo: 'bg-chart-4/15 text-chart-4'
};

/** Formato de moneda ($ es-MX, 2 decimales), identico al del resto del ERP. */
export function fmtMoney(n: number): string {
	return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Version compacta para KPIs (millones abreviados). */
export function fmtMoneyShort(n: number): string {
	if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
	return fmtMoney(n);
}

/** Valida un correo electronico de forma sencilla. */
export function isValidEmail(email: string): boolean {
	return /\S+@\S+\.\S+/.test(email);
}
