import type { PackageStatus, ReqStatus, AlertaTipo } from './types';

// Etapas del pipeline de una requisicion (excluye Cancelado, que es terminal alterno).
export const REQ_STATUS_FLOW: ReqStatus[] = [
	'Solicitado',
	'Cotizado',
	'OC Generada',
	'En Autorización',
	'Comprado',
	'En Almacén'
];

// Paleta alineada al tema monocromatico (tokens chart-* en escala de gris),
// usando emerald solo para exito y destructive para negativo, igual que spec-v2.
export const REQ_STATUS_COLORS: Record<ReqStatus, string> = {
	Solicitado: 'bg-muted text-muted-foreground',
	Cotizado: 'bg-secondary text-secondary-foreground',
	'OC Generada': 'bg-chart-4/15 text-chart-4',
	'En Autorización': 'bg-chart-3/20 text-chart-3',
	Comprado: 'bg-primary/15 text-primary',
	'En Almacén': 'bg-emerald-500/15 text-emerald-400',
	Cancelado: 'bg-destructive/15 text-destructive'
};

// Colores de los puntos del pipeline (solidos, mismo orden de progresion).
export const REQ_STATUS_DOTS: Record<ReqStatus, string> = {
	Solicitado: 'bg-muted-foreground/40',
	Cotizado: 'bg-secondary-foreground/50',
	'OC Generada': 'bg-chart-4',
	'En Autorización': 'bg-chart-3',
	Comprado: 'bg-primary',
	'En Almacén': 'bg-emerald-500',
	Cancelado: 'bg-destructive'
};

export const PACKAGE_STATUS_COLORS: Record<PackageStatus, string> = {
	Pendiente: 'bg-chart-4/15 text-chart-4',
	Aprobado: 'bg-emerald-500/15 text-emerald-400',
	Rechazado: 'bg-destructive/15 text-destructive'
};

// Variante de Alert por tipo (destructive es la unica con color del tema).
export const ALERTA_VARIANT: Record<AlertaTipo, 'default' | 'destructive'> = {
	error: 'destructive',
	warning: 'default',
	info: 'default'
};

export const CENTROS_COSTO = [
	{ id: 'CC-001', nombre: 'Producción' },
	{ id: 'CC-002', nombre: 'Administración' },
	{ id: 'CC-003', nombre: 'TI' },
	{ id: 'CC-004', nombre: 'Logística' }
];

export const DEPARTAMENTOS = ['Producción', 'Administración', 'TI', 'Logística'];

/** Formato de moneda identico al de la maqueta original ($ es-MX, 2 decimales). */
export function fmtMoney(n: number): string {
	return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
