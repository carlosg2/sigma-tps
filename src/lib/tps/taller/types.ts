// Modelo de datos del modulo de Taller de Servicios.
// Cubre GAP-TLL-001 (Agenda, Bahias, Multi-Sucursal, Alertas de mantenimiento)
// y GAP-TLL-002 (Recepcion de vehiculo, Historial por VIN).

/** Nivel de blindaje certificado del vehiculo. */
export type ArmorLevel = 'B6' | 'B6+' | 'B7' | 'VR6' | 'VR6+' | 'VR7' | 'VR7+' | 'VR9';

/** Codigo de sucursal. */
export type BranchCode = 'MTY' | 'CDMX' | 'GDL' | 'CUN' | 'HMO';

/** Estado de una cita en la agenda. */
export type ApptStatus = 'programada' | 'en-proceso' | 'completada' | 'cancelada' | 'pendiente';

/** Urgencia de una alerta de mantenimiento preventivo. */
export type AlertUrgency = 'critico' | 'alto' | 'normal';

/** Vehiculo blindado registrado en la flota. */
export interface Vehicle {
	vin: string;
	brand: string;
	model: string;
	year: number;
	level: ArmorLevel;
	color: string;
	km: number;
	client: string;
	plate: string;
	/** Fecha del ultimo servicio 'YYYY-MM-DD'. */
	lastSvc: string;
	email: string;
}

/** Tecnico asignado a una bahia en una sucursal. */
export interface Technician {
	id: string;
	name: string;
	spec: string;
	bay: number;
	branch: BranchCode;
}

/** Bahia de trabajo del taller. */
export interface Bay {
	id: number;
	name: string;
	branch: BranchCode;
	tech: string;
	/** Capacidad diaria en horas efectivas. */
	capacityHrs: number;
}

/** Datos consolidados de una sucursal. */
export interface Branch {
	code: BranchCode;
	name: string;
	city: string;
	bays: number;
	techs: number;
}

/** Cita agendada en el taller. */
export interface Appointment {
	id: string;
	/** Fecha 'YYYY-MM-DD'. */
	date: string;
	/** Hora de inicio (0-23). */
	sh: number;
	/** Minuto de inicio (0-59). */
	sm: number;
	/** Duracion en horas. */
	dur: number;
	/** Indice del vehiculo en la flota (referencia al VIN). */
	vin: string;
	svc: string;
	bay: number;
	tech: string;
	branch: BranchCode;
	status: ApptStatus;
	notas?: string;
}

/** Registro de un servicio anterior en el historial del vehiculo. */
export interface ServiceRecord {
	date: string; // 'YYYY-MM-DD'
	svc: string;
	km: number;
	tech: string;
	obs: string;
	fotos: number;
}

/** Alerta de mantenimiento preventivo por kilometraje. */
export interface MaintenanceAlert {
	id: string;
	vin: string;
	svc: string;
	urgency: AlertUrgency;
	kmCur: number;
	kmThr: number;
	branch: BranchCode;
}

/** Notificacion del taller. */
export interface TallerNotif {
	id: number;
	title: string;
	sub: string;
	time: string;
	read: boolean;
}

/** Categoria de inspeccion con sus puntos de verificacion. */
export interface InspectionCategory {
	id: string;
	/** Identificador de icono (mapea a un componente lucide en la vista). */
	icon: string;
	name: string;
	pts: string[];
}

/** Estado persistente del modulo de Taller. */
export interface TallerState {
	vehicles: Vehicle[];
	technicians: Technician[];
	bays: Bay[];
	branches: Branch[];
	appointments: Appointment[];
	history: Record<string, ServiceRecord[]>;
	alerts: MaintenanceAlert[];
	notifs: TallerNotif[];
	nextApptSeq: number;
	lastUpdated: string;
}
