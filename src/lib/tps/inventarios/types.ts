// Modelo de datos del modulo de Inventarios / Kitting por Folio (GAP-ALM-003).

export type FolioEstatus = 'urgente' | 'proceso' | 'completado';

export type CeldaLetra = 'A' | 'B' | 'C' | 'D';

export type NotifTipo = 'urgente' | 'aditiva' | 'normal';

export type NotifEstado = 'Sin surtir' | 'Pendiente' | 'En proceso' | 'Surtido';

export type TrazaTipo = 'Kit' | 'Aditiva';

export interface Material {
	pn: string;
	desc: string;
	qty: number;
	um: string;
	/** Material embolsado / surtido y listo en el carrito. */
	surtido: boolean;
	/** Bolsa confirmada electronicamente en la pantalla de confirmacion. */
	confirmada: boolean;
}

export interface Celda {
	letra: CeldaLetra;
	nombre: string;
	materiales: Material[];
}

export interface Folio {
	id: string;
	num: string;
	vin: string;
	unidad: string;
	nivel: string;
	resp: string;
	fecha: string;
	estatus: FolioEstatus;
	horaInicio: string;
	celdas: Celda[];
}

export interface Notificacion {
	id: string;
	folio: string;
	unidad: string;
	vin: string;
	tipo: NotifTipo;
	estado: NotifEstado;
	titulo: string;
	desc: string;
	mats: string;
	autoriza: string;
	hora: string;
	minuta: string;
}

export interface TrazaEntry {
	id: string;
	folio: string;
	unidad: string;
	celda: string;
	mat: string;
	qty: number;
	fecha: string;
	hora: string;
	resp: string;
	tipo: TrazaTipo;
}

export interface InventariosUser {
	name: string;
	role: string;
	avatarInitials: string;
}

export interface InventariosState {
	currentUser: InventariosUser;
	folios: Folio[];
	notificaciones: Notificacion[];
	trazabilidad: TrazaEntry[];
	lastUpdated: string;
	_dataVersion?: number;
}
