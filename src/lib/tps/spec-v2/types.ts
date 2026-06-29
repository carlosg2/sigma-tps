// ============================================================
// Especificaciones v2 — tipos
// ============================================================
import type { ArmorLevel } from '$lib/tps/types';

export type { ArmorLevel };

export type SpecV2Status = 'borrador' | 'en_revision' | 'autorizada' | 'obsoleta';

export type SpecAuthStatus = 'pendiente' | 'autorizado' | 'rechazado';

export type SpecDesignType = 'alto_volumen' | 'bajo_volumen' | 'tactico';

// Autorizacion por departamento
export interface SpecAuthorization {
	department: string;
	status: SpecAuthStatus;
	authorizedBy: string | null;
	authorizedAt: string | null;
	notes: string;
}

// Articulo del catalogo propio de especificaciones (independiente del catalogo de BOM)
export interface SpecArticle {
	id: string;
	code: string;
	description: string;
	// Agrupadores jerarquicos (GrupoCont -> GrupoMayor -> GrupoMenor)
	grupoCont: string;
	grupoMayor: string;
	grupoMenor: string;
	udm: string;
	unitWeight: number; // kg
	price: number;
	currency: 'MXN' | 'USD';
	status: 'activo' | 'inactivo';
	createdAt: string;
	updatedAt: string;
}

// Valor capturado de un componente del catalogo en una especificacion concreta
export interface SpecComponentValue {
	seccion: string;
	subSeccion: string;
	componente: string; // clave del componente dentro del catalogo
	descripcion: string; // copia de la descripcion del catalogo (para PDF / consulta)
	value: string; // valor / medida / observacion
	specArticleId: string | null; // articulo del catalogo de especificaciones
	quantity: number;
	notes: string;
}

export interface SpecRevision {
	id: string;
	version: number;
	changedBy: string;
	changedAt: string;
	reason: string;
}

export interface SpecAccessory {
	code: string;
	description: string;
}

export interface SpecificationV2 {
	id: string;
	code: string;
	brand: string;
	model: string;
	year: string;
	armorLevel: ArmorLevel;
	designType: SpecDesignType;
	version: number;
	status: SpecV2Status;
	// Datos adicionales de la caratula (formato real TPS)
	producto?: string;
	disenoBlindaje?: string;
	planta?: string;
	diasFabricacion?: string;
	comentariosIngenieria?: string[];
	accesoriosEstandar?: SpecAccessory[];
	accesoriosOpcionales?: SpecAccessory[];
	// Componentes capturados (solo los que tienen valor o articulo)
	components: SpecComponentValue[];
	// Autorizaciones por departamento
	authorizations: SpecAuthorization[];
	revisions: SpecRevision[];
	notes: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
}

export interface SpecV2State {
	specArticles: SpecArticle[];
	specifications: SpecificationV2[];
	lastUpdated: string;
}

// Clave unica de un componente del catalogo
export function componentKey(seccion: string, subSeccion: string, componente: string): string {
	return `${seccion}|${subSeccion}|${componente}`;
}
