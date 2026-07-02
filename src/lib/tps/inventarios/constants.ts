import type { Component } from 'svelte';
import type { CeldaLetra, FolioEstatus, NotifTipo, NotifEstado, TrazaTipo } from './types';
import ShieldHalf from '@lucide/svelte/icons/shield-half';
import RectangleHorizontal from '@lucide/svelte/icons/rectangle-horizontal';
import Zap from '@lucide/svelte/icons/zap';
import CircleDot from '@lucide/svelte/icons/circle-dot';
import Layers from '@lucide/svelte/icons/layers';

// Iconos por celda (se mapean por letra para no serializar componentes en el estado).
export const CELDA_ICONS: Record<CeldaLetra, Component<{ class?: string }>> = {
	A: ShieldHalf,
	B: RectangleHorizontal,
	C: Zap,
	D: CircleDot
};

export function celdaIcon(letra: string): Component<{ class?: string }> {
	return CELDA_ICONS[letra as CeldaLetra] ?? Layers;
}

// Colores de badge alineados al tema (emerald=exito, chart-*=proceso, destructive=urgente).
export const FOLIO_ESTATUS_LABEL: Record<FolioEstatus, string> = {
	urgente: 'Urgente',
	proceso: 'En Proceso',
	completado: 'Completado'
};

export const FOLIO_ESTATUS_COLORS: Record<FolioEstatus, string> = {
	urgente: 'bg-destructive/15 text-destructive',
	proceso: 'bg-chart-3/20 text-chart-3',
	completado: 'bg-emerald-500/15 text-emerald-400'
};

export const NOTIF_TIPO_LABEL: Record<NotifTipo, string> = {
	urgente: 'Urgente',
	aditiva: 'Aditiva',
	normal: 'Cambio'
};

export const NOTIF_ESTADO_COLORS: Record<NotifEstado, string> = {
	'Sin surtir': 'bg-destructive/15 text-destructive',
	Pendiente: 'bg-chart-4/15 text-chart-4',
	'En proceso': 'bg-chart-3/20 text-chart-3',
	Surtido: 'bg-emerald-500/15 text-emerald-400'
};

export const NOTIF_TIPO_ACCENT: Record<NotifTipo, string> = {
	urgente: 'border-l-destructive',
	aditiva: 'border-l-chart-4',
	normal: 'border-l-chart-3'
};

export const TRAZA_TIPO_COLORS: Record<TrazaTipo, string> = {
	Kit: 'bg-emerald-500/15 text-emerald-400',
	Aditiva: 'bg-primary/15 text-primary'
};

export const RESPONSABLES = ['Carlos M.', 'Diana R.', 'Héctor L.'];

export const CELDAS_FILTRO = [
	'Celda A — Blindaje Lateral',
	'Celda B — Vidrios Balísticos',
	'Celda C — Arneses y Eléctrico',
	'Celda D — Piso y Ruedas'
];

export const MODELOS = [
	'Chevrolet Suburban LTZ',
	'Mercedes-Benz GLS 600',
	'BMW X7 Protection VR6',
	'Lexus LX 600',
	'Mercedes-Benz GLE 53 AMG',
	'RAM 1500 TRX'
];

export const NIVELES = ['NIJ Level III-A', 'NIJ Level III', 'NIJ Level IV', 'B6 (VPAM)'];

export function pad(n: number): string {
	return String(n).padStart(2, '0');
}
