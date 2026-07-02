// Modelo de datos del modulo de Compras (GAP-COM-002 y GAP-COM-003).

export type PackageStatus = 'Pendiente' | 'Aprobado' | 'Rechazado';

export type ReqStatus =
	| 'Solicitado'
	| 'Cotizado'
	| 'OC Generada'
	| 'En Autorización'
	| 'Comprado'
	| 'En Almacén'
	| 'Cancelado';

export type BitacoraTipo = 'creacion' | 'aprobado' | 'rechazado';

export type AlertaTipo = 'error' | 'warning' | 'info';

/** Una partida de OC: concepto + cantidad + monto. El proveedor se define a nivel de OrdenCompra. */
export interface PartidaOC {
	id: string;
	concepto: string;
	cantidad: number;
	unidad: string;
	monto: number;
}

export interface BitacoraEntry {
	id: string;
	fecha: string; // 'YYYY-MM-DD HH:mm'
	usuario: string;
	rol: string;
	accion: string;
	tipo: BitacoraTipo;
	comentario: string;
}

/** Una Orden de Compra: un solo proveedor con varias partidas. */
export interface OrdenCompra {
	id: string;
	centroCosto: string;
	ccNombre: string;
	solicitante: string;
	proveedor: string;
	fecha: string;
	monto: number;
	nivel: number;
	nivelActual: number;
	estado: PackageStatus;
	partidas: PartidaOC[];
	bitacora: BitacoraEntry[];
}

export interface Requisicion {
	id: string;
	material: string;
	solicitante: string;
	depto: string;
	fecha: string;
	status: ReqStatus;
	diasRetraso: number;
}

export interface Alerta {
	id: string;
	tipo: AlertaTipo;
	titulo: string;
	desc: string;
	req: string;
	fecha: string;
}

export interface NivelConfig {
	nivel: number;
	label: string;
	montoMin: number;
	montoMax: number;
	responsable: string;
}

export interface ComprasUser {
	name: string;
	role: string;
	nivel: number;
	initials: string;
}

export interface ComprasState {
	ordenes: OrdenCompra[];
	requisiciones: Requisicion[];
	alertas: Alerta[];
	config: NivelConfig[];
	currentUser: ComprasUser;
	lastUpdated: string;
}
