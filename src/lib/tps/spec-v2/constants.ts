import type { SpecV2Status, SpecAuthStatus, SpecDesignType } from './types';

export const SPEC_V2_STATUS_LABELS: Record<SpecV2Status, string> = {
	borrador: 'Borrador',
	en_revision: 'En Revision',
	autorizada: 'Autorizada',
	obsoleta: 'Obsoleta'
};

export const SPEC_V2_STATUS_COLORS: Record<SpecV2Status, string> = {
	borrador: 'bg-muted text-muted-foreground',
	en_revision: 'bg-chart-4/15 text-chart-4',
	autorizada: 'bg-emerald-500/15 text-emerald-400',
	obsoleta: 'bg-destructive/15 text-destructive-foreground'
};

export const SPEC_AUTH_STATUS_LABELS: Record<SpecAuthStatus, string> = {
	pendiente: 'Pendiente',
	autorizado: 'Autorizado',
	rechazado: 'Rechazado'
};

export const SPEC_AUTH_STATUS_COLORS: Record<SpecAuthStatus, string> = {
	pendiente: 'bg-muted text-muted-foreground',
	autorizado: 'bg-emerald-500/15 text-emerald-400',
	rechazado: 'bg-destructive/15 text-destructive-foreground'
};

export const SPEC_DESIGN_TYPE_LABELS: Record<SpecDesignType, string> = {
	alto_volumen: 'Alto Volumen',
	bajo_volumen: 'Bajo Volumen',
	tactico: 'Tactico'
};

// Departamentos que autorizan una especificacion
export const SPEC_AUTH_DEPARTMENTS = [
	'Ingenieria',
	'Calidad',
	'Manufactura',
	'Direccion Tecnica'
];

export function makeSpecAuthorizations() {
	return SPEC_AUTH_DEPARTMENTS.map((department) => ({
		department,
		status: 'pendiente' as const,
		authorizedBy: null,
		authorizedAt: null,
		notes: ''
	}));
}
