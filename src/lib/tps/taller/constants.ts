// Constantes del modulo de Taller: catalogos estaticos, etiquetas y estilos.
import type { ArmorLevel, ApptStatus, AlertUrgency, BranchCode, InspectionCategory } from './types';

/** Sucursales en orden de despliegue. */
export const BRANCH_CODES: BranchCode[] = ['MTY', 'CDMX', 'GDL', 'CUN', 'HMO'];

/** Clases de badge (shadcn) por nivel de blindaje. */
export const ARMOR_BADGE: Record<ArmorLevel, string> = {
	B6: 'border-blue-500/40 text-blue-600 bg-blue-500/10',
	'B6+': 'border-blue-500/40 text-blue-600 bg-blue-500/10',
	B7: 'border-destructive/40 text-destructive bg-destructive/10',
	VR6: 'border-sky-500/40 text-sky-600 bg-sky-500/10',
	'VR6+': 'border-sky-500/40 text-sky-600 bg-sky-500/10',
	VR7: 'border-amber-500/40 text-amber-600 bg-amber-500/10',
	'VR7+': 'border-indigo-500/40 text-indigo-600 bg-indigo-500/10',
	VR9: 'border-indigo-500/40 text-indigo-600 bg-indigo-500/10'
};

/** Etiqueta legible del estado de la cita. */
export const APPT_STATUS_LABEL: Record<ApptStatus, string> = {
	programada: 'Programada',
	'en-proceso': 'En proceso',
	completada: 'Completada',
	cancelada: 'Cancelada',
	pendiente: 'Pendiente'
};

/** Variante de badge (shadcn) por estado de cita. */
export const APPT_STATUS_VARIANT: Record<ApptStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
	programada: 'outline',
	'en-proceso': 'default',
	completada: 'secondary',
	cancelada: 'destructive',
	pendiente: 'outline'
};

/** Color de acento (borde izquierdo) por estado de cita. */
export const APPT_ACCENT: Record<ApptStatus, string> = {
	programada: 'border-l-sky-500',
	'en-proceso': 'border-l-primary',
	completada: 'border-l-emerald-500',
	cancelada: 'border-l-destructive',
	pendiente: 'border-l-amber-500'
};

/** Urgencia de alerta -> etiqueta y estilo. */
export const ALERT_URGENCY: Record<AlertUrgency, { label: string; variant: 'destructive' | 'outline' | 'secondary'; dot: string }> = {
	critico: { label: 'Crítico', variant: 'destructive', dot: 'bg-destructive' },
	alto: { label: 'Alto', variant: 'outline', dot: 'bg-amber-500' },
	normal: { label: 'Normal', variant: 'secondary', dot: 'bg-emerald-500' }
};

/** Tipos de servicio ofrecidos por el taller. */
export const SERVICE_TYPES = [
	'Servicio Mayor — Paquete Blindado',
	'Revisión Sistema de Blindaje VR7+',
	'Mantenimiento Cristales Balísticos',
	'Diagnóstico Electrónico Integral',
	'Revisión de Placas Balísticas',
	'Cambio de Aceite Sintético + Filtros Blindado',
	'Neumáticos Run-Flat — Alineación y Balanceo',
	'Inspección General Nivel B6/B7',
	'Revisión Sistema de Comunicaciones Seguras'
];

/** Horarios base de agenda. */
export const SLOTS_BASE = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

/** Accesorios y pertenencias que pueden entregarse con el vehiculo. */
export const ACCESSORIES = [
	'Llanta de Emergencia', 'Gato Hidráulico', 'Extintor', 'Triángulos de Seguridad',
	'Kit de Herramientas', 'Radio Comunicación', 'Botiquín de Primeros Auxilios', 'Chaleco Antibalas',
	'Documentos del Vehículo', 'Tapetes Originales', 'Cargador USB / Inalámbrico', 'Control de Apertura Remota',
	'Portaequipaje', 'Cable de Corriente', 'Candado de Volante', 'Gafete / Identificación'
];

/** Categorias de foto para clasificar la evidencia. */
export const PHOTO_CATS = ['Todos', 'Exterior', 'Cristales', 'Blindaje', 'Interior', 'Motor', 'Frenos', 'Llantas'];

/** 170 puntos de inspeccion agrupados en 8 categorias. */
export const INSPECTION_CATS: InspectionCategory[] = [
	{ id: 'ext', icon: 'car', name: 'Exterior — Carrocería', pts: [
		'Cofre / Capó — estado y bisagras', 'Paragolpes delantero — sin deformaciones',
		'Rejilla frontal / parrilla', 'Panel aleta delantera izquierda',
		'Panel aleta delantera derecha', 'Puerta delantera izquierda — carrocería',
		'Puerta delantera derecha — carrocería', 'Puerta trasera izquierda — carrocería',
		'Puerta trasera derecha — carrocería', 'Panel trasero izquierdo',
		'Panel trasero derecho', 'Cajuela / maletero — cierre y estado',
		'Paragolpes trasero — sin deformaciones', 'Techo / toldo exterior',
		'Molduras y guarniciones perimetrales', 'Antena',
		'Estribo izquierdo', 'Estribo derecho',
		'Piso exterior — sin abolladuras', 'Emblemas y logotipos',
		'Jaladera delantera izquierda', 'Jaladera delantera derecha',
		'Jaladera trasera izquierda', 'Jaladera trasera derecha'
	] },
	{ id: 'crist', icon: 'panel-top', name: 'Cristales y Vidrios Balísticos', pts: [
		'Parabrisas delantero — integridad balística', 'Parabrisas trasero — integridad balística',
		'Cristal puerta delantera izquierda', 'Cristal puerta delantera derecha',
		'Cristal puerta trasera izquierda', 'Cristal puerta trasera derecha',
		'Cristales laterales traseros fijos', 'Luneta trasera',
		'Mecanismo elevador delantero izquierdo', 'Mecanismo elevador delantero derecho',
		'Mecanismo elevador trasero izquierdo', 'Mecanismo elevador trasero derecho',
		'Burletes y sellos perimetrales — estanqueidad', 'Tinte y tratamiento balístico visible'
	] },
	{ id: 'blind', icon: 'shield', name: 'Sistema de Blindaje', pts: [
		'Placa de acero — puerta delantera izquierda', 'Placa de acero — puerta delantera derecha',
		'Placa de acero — puerta trasera izquierda', 'Placa de acero — puerta trasera derecha',
		'Blindaje de piso — zona delantera', 'Blindaje de piso — zona trasera',
		'Blindaje de techo', 'Blindaje de cofre', 'Blindaje de cajuela',
		'Protección de tanque de combustible', 'Anillos internos de run-flat',
		'Batería auxiliar / respaldo eléctrico', 'Panel de control de seguridad',
		'Botón de pánico — funcionalidad', 'Intercomunicador interior-exterior',
		'Portillones de disparo (si aplica)', 'Sellado perimetral de placas — sin separaciones',
		'Nivel de protección certificado visible'
	] },
	{ id: 'int', icon: 'armchair', name: 'Interior — Habitáculo', pts: [
		'Asiento delantero izquierdo — estado y ajuste', 'Asiento delantero derecho — estado y ajuste',
		'Asiento trasero izquierdo', 'Asiento trasero centro', 'Asiento trasero derecho',
		'Tapicería — sin rasgaduras visibles', 'Alfombra — limpieza y estado',
		'Tablero principal — sin grietas', 'Consola central', 'Guantera — cierre correcto',
		'Techo interior / relleno', 'Viseras parasol', 'Espejo retrovisor interior',
		'Iluminación interior y de cortesía', 'Cinturones de seguridad — los 5',
		'Airbags — testigo apagado en tablero', 'Sistema de sonido / pantalla central',
		'Control de climatización — funcionalidad', 'Mandos al volante',
		'Pedales y alfombrilla', 'Parasoles traseros', 'Reposapiés trasero', 'Portavasos'
	] },
	{ id: 'elec', icon: 'zap', name: 'Eléctrico y Electrónico', pts: [
		'Batería principal — carga y terminales', 'Alternador — carga correcta',
		'Luces delanteras — bajo haz', 'Luces delanteras — alto haz',
		'Luces antiniebla delanteras', 'Luces traseras — posición y freno',
		'Luz de reversa', 'Cuatro direccionales / emergencias', 'Bocina',
		'Limpiaparabrisas delantero — ambas velocidades', 'Limpiaparabrisas trasero',
		'Cámara de reversa / sistema 360°', 'Sensores de proximidad (parktronic)',
		'GPS y rastreo satelital', 'Sistema de comunicaciones seguras',
		'Cargador inalámbrico / USB'
	] },
	{ id: 'motor', icon: 'wrench', name: 'Motor y Sistema Mecánico', pts: [
		'Nivel de aceite de motor', 'Nivel de refrigerante', 'Nivel de aceite de frenos',
		'Nivel de dirección hidráulica', 'Nivel de agua limpiaparabrisas',
		'Correa de distribución / serpentina — desgaste visible',
		'Mangueras — sin fugas ni fisuras', 'Compresor de A/C — funcionamiento',
		'Filtro de aire — limpieza', 'Motor de arranque — respuesta normal',
		'Transmisión — respuesta sin vibraciones', 'Caja de cambios — tiempos correctos',
		'Diferencial — sin ruidos anómalos', 'Cardán / semiejes — sin holguras',
		'Sistema de escape — sin fugas', 'Catalizador — estado'
	] },
	{ id: 'frenos', icon: 'disc-3', name: 'Frenos y Suspensión', pts: [
		'Disco de freno delantero izquierdo — desgaste', 'Disco de freno delantero derecho — desgaste',
		'Disco de freno trasero izquierdo — desgaste', 'Disco de freno trasero derecho — desgaste',
		'Pastillas delanteras — grosor', 'Pastillas traseras — grosor',
		'Freno de mano / estacionamiento', 'Amortiguador delantero izquierdo',
		'Amortiguador delantero derecho', 'Amortiguador trasero izquierdo',
		'Amortiguador trasero derecho', 'Resortes — sin deformación',
		'Rótulas y terminales de dirección', 'Dirección — sin holguras excesivas',
		'Fuelles de dirección — sin roturas'
	] },
	{ id: 'llantas', icon: 'circle-dot', name: 'Llantas Run-Flat y Rines', pts: [
		'Llanta delantera izquierda — profundidad de banda', 'Llanta delantera derecha — profundidad de banda',
		'Llanta trasera izquierda — profundidad de banda', 'Llanta trasera derecha — profundidad de banda',
		'Llanta delantera izquierda — presión', 'Llanta delantera derecha — presión',
		'Llanta trasera izquierda — presión', 'Llanta trasera derecha — presión',
		'Rin delantero izquierdo — sin grietas', 'Rin delantero derecho — sin grietas',
		'Rin trasero izquierdo — sin grietas', 'Rin trasero derecho — sin grietas',
		'Llanta de repuesto run-flat — estado', 'TPMS — sensor de presión funcional'
	] }
];

/** Total de puntos de inspeccion (suma dinamica de las 8 categorias). */
export const INSPECTION_TOTAL = INSPECTION_CATS.reduce((n, c) => n + c.pts.length, 0);

/** Mapea el nombre de la categoria a su categoria de foto. */
export const CAT_TO_PHOTO: Record<string, string> = {
	ext: 'Exterior', crist: 'Cristales', blind: 'Blindaje', int: 'Interior',
	elec: 'Motor', motor: 'Motor', frenos: 'Frenos', llantas: 'Llantas'
};
