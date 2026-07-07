import type {
	Vehiculo,
	Extra,
	DayStatus,
	DocEstatus,
	Antifraude,
	ExpedienteEstatus,
	CalidadEstatus,
	LiberacionEstatus,
	FlowStepId
} from './types';

/** Fecha ISO (YYYY-MM-DD) desplazada n dias respecto a hoy. */
export function offsetDate(days: number): string {
	const d = new Date();
	d.setDate(d.getDate() + days);
	return d.toISOString().slice(0, 10);
}

/** Fecha ISO de hoy (YYYY-MM-DD). */
export function todayISO(): string {
	return new Date().toISOString().slice(0, 10);
}

/** Formato de moneda MXN. */
export function fmtMXN(n: number): string {
	return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

/** Formato de fecha legible (dd mmm yyyy). */
export function fmtDate(iso: string | null): string {
	if (!iso) return '—';
	return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
}

/** Marca de tiempo corta para bitacoras. */
export function nowStr(): string {
	return new Date().toLocaleString('es-MX', {
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit'
	});
}

// --- Catalogo de flota (ocupacion relativa a hoy) ---
export const VEHICULOS: Vehiculo[] = [
	{
		vin: 'VIN-AX90',
		modelo: 'Mercedes S600 Guard VR7+',
		nivel: 'VR7+',
		tarifa: 22000,
		fotos: [
			'https://images.unsplash.com/photo-1629019879059-2a0345f93aea?w=900&q=85',
			'https://images.unsplash.com/photo-1629019879070-11fceb18ed61?w=900&q=85',
			'https://images.unsplash.com/photo-1629019878464-5a7ef877716f?w=900&q=85'
		],
		ocupacion: [
			{ start: offsetDate(5), end: offsetDate(8), tipo: 'occupied' },
			{ start: offsetDate(15), end: offsetDate(17), tipo: 'maintenance' }
		]
	},
	{
		vin: 'VIN-BM11',
		modelo: 'BMW 760Li Protect',
		nivel: 'VR6',
		tarifa: 19500,
		fotos: [
			'https://images.unsplash.com/photo-1627936354732-ffbe552799d8?w=900&q=85',
			'https://images.unsplash.com/photo-1610099610040-ab19f3a5ec35?w=900&q=85',
			'https://images.unsplash.com/photo-1638980703460-8e542eb75007?w=900&q=85'
		],
		ocupacion: [
			{ start: offsetDate(2), end: offsetDate(4), tipo: 'occupied' },
			{ start: offsetDate(20), end: offsetDate(22), tipo: 'occupied' }
		]
	},
	{
		vin: 'VIN-CH33',
		modelo: 'Cadillac Escalade ESV Blindado',
		nivel: 'B6',
		tarifa: 15000,
		fotos: [
			'https://images.unsplash.com/photo-1767749995450-7b63ab7cd4fd?w=900&q=85',
			'https://images.unsplash.com/photo-1767749995462-9fe0890d5960?w=900&q=85',
			'https://images.unsplash.com/photo-1767749995458-b0927324e4d0?w=900&q=85'
		],
		ocupacion: [{ start: offsetDate(10), end: offsetDate(12), tipo: 'maintenance' }]
	}
];

export const CLIENTES = ['Grupo Alfa', 'Constructora Coppel', 'Gobierno de NL', 'Logística Hades'];

export const EXTRAS: Extra[] = [
	{ id: 'conductor', label: 'Conductor certificado', precio: 3500 },
	{ id: 'escolta', label: 'Escolta armado', precio: 5000 },
	{ id: 'km_extra', label: 'Kilometraje adicional (500 km)', precio: 1200 },
	{ id: 'rastreo', label: 'Rastreo satelital activo', precio: 800 },
	{ id: 'seguro_ext', label: 'Seguro extenso viaje', precio: 2500 },
	{ id: 'lavado', label: 'Lavado/Detailing salida', precio: 600 }
];

export const DOCUMENTOS_OBLIGATORIOS = [
	'Acta constitutiva',
	'Poder legal notariado',
	'Comprobante de domicilio (máx. 3 meses)',
	'Estados de cuenta (últimos 3)',
	'Referencias comerciales (mín. 2)',
	'Actas de asamblea relevantes',
	'Identificaciones con poderes (2 representantes)'
];

export const LISTA_NEGRA = ['Riesgo Total SA', 'Fraude Global LLC', 'Cliente Vetado 99'];

export const DOC_ESTATUS_OPCIONES: DocEstatus[] = [
	'Pendiente',
	'Recibido',
	'Validado',
	'Observaciones',
	'Rechazado'
];

// --- Pasos del flujo operativo ---
export const FLOW_STEPS: { id: FlowStepId; label: string }[] = [
	{ id: 'cliente', label: 'Cliente seleccionado' },
	{ id: 'vin', label: 'Unidad seleccionada' },
	{ id: 'fechas', label: 'Fechas capturadas' },
	{ id: 'disponibilidad', label: 'Disponibilidad validada' },
	{ id: 'total', label: 'Total calculado' },
	{ id: 'guardada', label: 'Cotización guardada' },
	{ id: 'antifraude', label: 'Antifraude verificado' },
	{ id: 'expediente', label: 'Expediente completo' },
	{ id: 'calidad', label: 'Calidad aprobada' },
	{ id: 'liberacion', label: 'Unidad liberada' }
];

// --- Colores de estado (tokens semanticos del design system) ---
export const DAY_STATUS_COLORS: Record<DayStatus, string> = {
	available: 'bg-emerald-500/15 text-emerald-400',
	occupied: 'bg-destructive/15 text-destructive',
	maintenance: 'bg-chart-4/15 text-chart-4'
};

export const DAY_STATUS_LABELS: Record<DayStatus, string> = {
	available: 'Disponible',
	occupied: 'Ocupada',
	maintenance: 'Mantenimiento'
};

export const DOC_ESTATUS_COLORS: Record<DocEstatus, string> = {
	Pendiente: 'bg-muted text-muted-foreground',
	Recibido: 'bg-chart-3/20 text-chart-3',
	Validado: 'bg-emerald-500/15 text-emerald-400',
	Observaciones: 'bg-chart-4/15 text-chart-4',
	Rechazado: 'bg-destructive/15 text-destructive'
};

export const ANTIFRAUDE_COLORS: Record<Antifraude, string> = {
	Pendiente: 'bg-muted text-muted-foreground',
	Limpio: 'bg-emerald-500/15 text-emerald-400',
	'En lista negra': 'bg-destructive/15 text-destructive'
};

export const EXPEDIENTE_COLORS: Record<ExpedienteEstatus, string> = {
	Pendiente: 'bg-muted text-muted-foreground',
	Completo: 'bg-emerald-500/15 text-emerald-400',
	Rechazado: 'bg-destructive/15 text-destructive'
};

export const CALIDAD_COLORS: Record<CalidadEstatus, string> = {
	'Sin revisar': 'bg-muted text-muted-foreground',
	Aprobado: 'bg-emerald-500/15 text-emerald-400',
	Rechazado: 'bg-destructive/15 text-destructive'
};

export const LIBERACION_COLORS: Record<LiberacionEstatus, string> = {
	Bloqueada: 'bg-destructive/15 text-destructive',
	Liberada: 'bg-emerald-500/15 text-emerald-400'
};
