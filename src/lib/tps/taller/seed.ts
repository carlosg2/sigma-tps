import type { TallerState, Vehicle, Technician, Bay, Branch, Appointment, ServiceRecord, MaintenanceAlert, TallerNotif } from './types';

const vehicles: Vehicle[] = [
	{ vin: 'WDD2221561A123401', brand: 'Mercedes-Benz', model: 'S600 Pullman Guard', year: 2024, level: 'VR7', color: 'Negro Obsidiana', km: 28450, client: 'Grupo Alfa — Dir. General', plate: 'AEX-1204', lastSvc: '2026-03-12', email: 'dg@grupoalfa.mx' },
	{ vin: 'WBAGV8100PCB12302', brand: 'BMW', model: '760Li Individual Protection', year: 2025, level: 'VR6+', color: 'Azul Midnight', km: 12780, client: 'Constructora Coppel SA', plate: 'BLD-9901', lastSvc: '2026-05-02', email: 'flota@coppel.com' },
	{ vin: 'JTJHY7AX5N4190203', brand: 'Lexus', model: 'LX 600 Blindado B6', year: 2024, level: 'B6', color: 'Blanco Lunar', km: 41200, client: 'Familia Zambrano Treviño', plate: 'CCC-2345', lastSvc: '2025-11-20', email: 'rzambrano@gmail.com' },
	{ vin: '1GYS4HKJ5NR412304', brand: 'Cadillac', model: 'Escalade ESV Protection', year: 2023, level: 'B6', color: 'Plata Sidereal', km: 55300, client: 'Gob. del Estado — Seg. Pública', plate: 'DEG-0012', lastSvc: '2025-10-08', email: 'flota.seg@estado.gob.mx' },
	{ vin: 'SALGA2BU5PA445305', brand: 'Range Rover', model: 'Autobiography Black LWB', year: 2025, level: 'VR7', color: 'Verde Aintree', km: 8900, client: 'Fibra Danhos — CEO', plate: 'EFT-7823', lastSvc: '2026-04-18', email: 'ceo@fibradanhos.mx' },
	{ vin: 'WAUZZZ4H5MN013306', brand: 'Audi', model: 'A8L Security VR9', year: 2024, level: 'VR9', color: 'Gris Quantum', km: 19600, client: 'Banco Bajío — Presidencia', plate: 'FGH-4510', lastSvc: '2026-02-28', email: 'presidencia@bancobajio.mx' },
	{ vin: 'WDD2220561A234407', brand: 'Mercedes-Benz', model: 'G63 AMG Blindado B6+', year: 2025, level: 'B6+', color: 'Negro Magno', km: 6300, client: 'Rancho Santa Fe Group', plate: 'GHI-9234', lastSvc: '2026-06-01', email: 'admin@ranchosantafe.mx' },
	{ vin: 'WBAGV8100PCB89308', brand: 'BMW', model: 'X7 M60i Protection', year: 2024, level: 'VR6', color: 'Café Tartufo', km: 33100, client: 'Holding Industrial Regiomontano', plate: 'HIJ-1102', lastSvc: '2026-01-15', email: 'flota@hir.mx' },
	{ vin: 'JTJHY7AX5N4111209', brand: 'Lexus', model: 'LM 500h Executive Blindado', year: 2025, level: 'B6', color: 'Gris Titanio', km: 4200, client: 'Tecnológico de Monterrey — Rectoría', plate: 'JKL-0071', lastSvc: '2026-05-30', email: 'rectoria@tec.mx' },
	{ vin: 'SALGA2BU5PA445310', brand: 'Range Rover', model: 'Defender 130 Blindado', year: 2024, level: 'VR6', color: 'Azul Tributite', km: 22700, client: 'Cemex — Dirección Corporativa', plate: 'LMN-5541', lastSvc: '2026-03-07', email: 'corporativo@cemex.com' }
];

const branches: Branch[] = [
	{ code: 'MTY', name: 'Monterrey', city: 'Monterrey, NL', bays: 4, techs: 4 },
	{ code: 'CDMX', name: 'Ciudad de México', city: 'CDMX, CDMX', bays: 5, techs: 5 },
	{ code: 'GDL', name: 'Guadalajara', city: 'Guadalajara, JAL', bays: 3, techs: 3 },
	{ code: 'CUN', name: 'Cancún', city: 'Cancún, Q.R.', bays: 2, techs: 2 },
	{ code: 'HMO', name: 'Hermosillo', city: 'Hermosillo, SON', bays: 2, techs: 2 }
];

const technicians: Technician[] = [
	{ id: 'T1', name: 'Ing. Rodrigo Cienfuegos', spec: 'Especialista VR7+', bay: 1, branch: 'MTY' },
	{ id: 'T2', name: 'Téc. Mauricio Ontiveros', spec: 'Diagnóstico Electrónico', bay: 2, branch: 'MTY' },
	{ id: 'T3', name: 'Ing. Armando Salazar', spec: 'Mecánica de Precisión', bay: 3, branch: 'MTY' },
	{ id: 'T4', name: 'Ing. Fernanda Ruiz', spec: 'Blindaje y Paneles', bay: 4, branch: 'MTY' },
	{ id: 'C1', name: 'Ing. Patricia Solís', spec: 'Especialista VR9', bay: 1, branch: 'CDMX' },
	{ id: 'C2', name: 'Téc. Julio Barragán', spec: 'Cristales Balísticos', bay: 2, branch: 'CDMX' },
	{ id: 'G1', name: 'Ing. Héctor Villalobos', spec: 'Mecánica de Precisión', bay: 1, branch: 'GDL' }
];

const bays: Bay[] = [
	{ id: 1, name: 'Bahía 1', branch: 'MTY', tech: 'Ing. Rodrigo Cienfuegos', capacityHrs: 8 },
	{ id: 2, name: 'Bahía 2', branch: 'MTY', tech: 'Téc. Mauricio Ontiveros', capacityHrs: 8 },
	{ id: 3, name: 'Bahía 3', branch: 'MTY', tech: 'Ing. Armando Salazar', capacityHrs: 8 },
	{ id: 4, name: 'Bahía 4', branch: 'MTY', tech: 'Ing. Fernanda Ruiz', capacityHrs: 8 }
];

const appointments: Appointment[] = [
	{ id: 'APT-001', date: '2026-07-02', sh: 8, sm: 0, dur: 2.5, vin: 'WDD2221561A123401', svc: 'Servicio Mayor — Paquete Blindado', bay: 1, tech: 'Ing. Rodrigo Cienfuegos', branch: 'MTY', status: 'en-proceso', notas: 'Cliente prioritario. Revisar sellado de puertas.' },
	{ id: 'APT-002', date: '2026-07-02', sh: 9, sm: 0, dur: 1.5, vin: 'WAUZZZ4H5MN013306', svc: 'Diagnóstico Electrónico Integral', bay: 2, tech: 'Téc. Mauricio Ontiveros', branch: 'MTY', status: 'programada' },
	{ id: 'APT-003', date: '2026-07-02', sh: 11, sm: 0, dur: 3, vin: 'JTJHY7AX5N4190203', svc: 'Revisión de Placas Balísticas', bay: 3, tech: 'Ing. Armando Salazar', branch: 'MTY', status: 'programada', notas: 'Familia Zambrano confirmó asistencia.' },
	{ id: 'APT-004', date: '2026-07-02', sh: 13, sm: 30, dur: 2, vin: 'SALGA2BU5PA445305', svc: 'Neumáticos Run-Flat — Alineación y Balanceo', bay: 4, tech: 'Ing. Fernanda Ruiz', branch: 'MTY', status: 'programada' },
	{ id: 'APT-005', date: '2026-07-02', sh: 16, sm: 0, dur: 1.5, vin: 'WDD2220561A234407', svc: 'Cambio de Aceite Sintético + Filtros Blindado', bay: 2, tech: 'Téc. Mauricio Ontiveros', branch: 'MTY', status: 'programada' },
	{ id: 'APT-006', date: '2026-07-01', sh: 8, sm: 30, dur: 3, vin: 'WDD2221561A123401', svc: 'Revisión Sistema de Blindaje VR7+', bay: 1, tech: 'Ing. Rodrigo Cienfuegos', branch: 'MTY', status: 'completada' },
	{ id: 'APT-007', date: '2026-07-01', sh: 10, sm: 0, dur: 2, vin: 'WBAGV8100PCB89308', svc: 'Mantenimiento Cristales Balísticos', bay: 3, tech: 'Ing. Armando Salazar', branch: 'MTY', status: 'completada' },
	{ id: 'APT-008', date: '2026-07-03', sh: 9, sm: 0, dur: 4, vin: 'JTJHY7AX5N4190203', svc: 'Inspección General Nivel B6/B7', bay: 1, tech: 'Ing. Rodrigo Cienfuegos', branch: 'MTY', status: 'programada' },
	{ id: 'APT-009', date: '2026-07-03', sh: 14, sm: 0, dur: 2, vin: 'SALGA2BU5PA445310', svc: 'Revisión Sistema de Comunicaciones Seguras', bay: 2, tech: 'Téc. Mauricio Ontiveros', branch: 'MTY', status: 'programada' },
	{ id: 'APT-010', date: '2026-07-04', sh: 8, sm: 0, dur: 2.5, vin: 'WBAGV8100PCB12302', svc: 'Servicio Mayor — Paquete Blindado', bay: 4, tech: 'Ing. Fernanda Ruiz', branch: 'MTY', status: 'programada' },
	{ id: 'APT-011', date: '2026-07-04', sh: 10, sm: 30, dur: 1.5, vin: 'WDD2221561A123401', svc: 'Cambio de Aceite Sintético + Filtros Blindado', bay: 2, tech: 'Téc. Mauricio Ontiveros', branch: 'MTY', status: 'programada' },
	{ id: 'APT-013', date: '2026-06-30', sh: 8, sm: 0, dur: 2, vin: 'JTJHY7AX5N4190203', svc: 'Diagnóstico Electrónico Integral', bay: 3, tech: 'Ing. Armando Salazar', branch: 'MTY', status: 'completada' },
	{ id: 'APT-014', date: '2026-06-30', sh: 11, sm: 0, dur: 1.5, vin: 'SALGA2BU5PA445305', svc: 'Neumáticos Run-Flat — Alineación y Balanceo', bay: 4, tech: 'Ing. Fernanda Ruiz', branch: 'MTY', status: 'completada' },
	{ id: 'APT-020', date: '2026-07-02', sh: 9, sm: 0, dur: 3, vin: 'WAUZZZ4H5MN013306', svc: 'Revisión Sistema de Blindaje VR7+', bay: 1, tech: 'Ing. Patricia Solís', branch: 'CDMX', status: 'programada' },
	{ id: 'APT-021', date: '2026-07-02', sh: 12, sm: 0, dur: 2, vin: 'WBAGV8100PCB12302', svc: 'Mantenimiento Cristales Balísticos', bay: 2, tech: 'Téc. Julio Barragán', branch: 'CDMX', status: 'en-proceso' },
	{ id: 'APT-030', date: '2026-07-02', sh: 10, sm: 0, dur: 2.5, vin: 'WBAGV8100PCB89308', svc: 'Inspección General Nivel B6/B7', bay: 1, tech: 'Ing. Héctor Villalobos', branch: 'GDL', status: 'programada' }
];

const history: Record<string, ServiceRecord[]> = {
	'WDD2221561A123401': [
		{ date: '2026-03-12', svc: 'Revisión Sistema de Blindaje VR7+', km: 28200, tech: 'Ricardo Fuentes', obs: 'Sellado de panel lateral revisado. Sin anomalías en cristales balísticos. Actualización de firmware del sistema de comunicaciones.', fotos: 4 },
		{ date: '2025-12-05', svc: 'Servicio Mayor — Paquete Blindado', km: 24800, tech: 'Jorge López', obs: 'Cambio de aceite sintético y filtros. Revisión integral de placas. Cristal balístico trasero con micro-fisura reparada con resina especializada.', fotos: 8 },
		{ date: '2025-08-20', svc: 'Neumáticos Run-Flat — Alineación y Balanceo', km: 20100, tech: 'Miguel Ángel Torres', obs: 'Sustitución de 4 llantas run-flat. Alineación corregida a especificaciones de fábrica. Sin observaciones adicionales.', fotos: 2 },
		{ date: '2025-04-14', svc: 'Diagnóstico Electrónico Integral', km: 15300, tech: 'Ricardo Fuentes', obs: 'Sistema de comunicaciones seguras actualizado. Sensor de puerta trasera izquierda reemplazado. Sin fallas activas.', fotos: 1 }
	],
	'WBAGV8100PCB12302': [
		{ date: '2026-05-02', svc: 'Cambio de Aceite Sintético + Filtros Blindado', km: 12500, tech: 'Jorge López', obs: 'Servicio de rutina. Vehículo en excelente estado. Sin observaciones.', fotos: 1 },
		{ date: '2025-11-15', svc: 'Revisión de Placas Balísticas', km: 8200, tech: 'Ricardo Fuentes', obs: 'Placas laterales en buen estado. Sin deformaciones. Se limpian y aplica tratamiento anticorrosión.', fotos: 3 }
	],
	'JTJHY7AX5N4190203': [
		{ date: '2025-11-20', svc: 'Inspección General Nivel B6/B7', km: 40800, tech: 'Miguel Ángel Torres', obs: 'Desgaste en cristales laterales detectado. Frenos delanteros al 35% — se recomienda cambio inmediato. Suspensión delantera con juego.', fotos: 6 },
		{ date: '2025-06-10', svc: 'Servicio Mayor — Paquete Blindado', km: 36200, tech: 'Jorge López', obs: 'Servicio completo realizado. Sistema de blindaje en condiciones normales.', fotos: 5 }
	],
	'1GYS4HKJ5NR412304': [
		{ date: '2025-10-08', svc: 'Revisión de Placas Balísticas', km: 51200, tech: 'Ricardo Fuentes', obs: 'Vehículo gubernamental. Placas y sellados revisados. Se detecta necesidad de servicio mayor próximo.', fotos: 4 }
	],
	'WAUZZZ4H5MN013306': [
		{ date: '2026-02-28', svc: 'Diagnóstico Electrónico Integral', km: 18200, tech: 'Patricia Solís', obs: 'Sistema VR9 completo. Comunicaciones seguras y contramedidas verificadas. Sin fallas.', fotos: 3 }
	]
};

const alerts: MaintenanceAlert[] = [
	{ id: 'AL-01', vin: '1GYS4HKJ5NR412304', svc: 'Revisión de Placas Balísticas + Inspección B6', urgency: 'critico', kmCur: 55300, kmThr: 55000, branch: 'MTY' },
	{ id: 'AL-02', vin: 'JTJHY7AX5N4190203', svc: 'Servicio Mayor — Paquete Blindado (60,000 km)', urgency: 'critico', kmCur: 41200, kmThr: 40000, branch: 'CDMX' },
	{ id: 'AL-03', vin: 'WBAGV8100PCB89308', svc: 'Cambio de Aceite Sintético + Filtros', urgency: 'alto', kmCur: 33100, kmThr: 35000, branch: 'GDL' },
	{ id: 'AL-04', vin: 'WAUZZZ4H5MN013306', svc: 'Diagnóstico Electrónico Integral', urgency: 'alto', kmCur: 19600, kmThr: 20000, branch: 'MTY' },
	{ id: 'AL-05', vin: 'WDD2221561A123401', svc: 'Inspección General Nivel VR7 (30,000 km)', urgency: 'normal', kmCur: 28450, kmThr: 30000, branch: 'MTY' },
	{ id: 'AL-06', vin: 'SALGA2BU5PA445310', svc: 'Neumáticos Run-Flat — Revisión de Desgaste', urgency: 'normal', kmCur: 22700, kmThr: 25000, branch: 'CDMX' }
];

const notifs: TallerNotif[] = [
	{ id: 1, title: 'Cita APT-003 confirmada — Familia Zambrano', sub: 'Lexus LX 600 · Bahía 3 · Hoy 11:00', time: 'hace 20 min', read: false },
	{ id: 2, title: 'Alerta km crítico — Escalade ESV (Seg. Pública)', sub: '55,300 km · supera umbral de 55,000 km', time: 'hace 1 h', read: false },
	{ id: 3, title: 'Reagendamiento solicitado — BMW 760Li', sub: 'Cliente Constructora Coppel solicita cambio al 05-Jul', time: 'hace 3 h', read: false },
	{ id: 4, title: 'Servicio completado — APT-007', sub: 'Mantenimiento Cristales Balísticos · BMW X7 M60i', time: 'Ayer 17:30', read: true },
	{ id: 5, title: 'Nuevo vehículo registrado en flota', sub: 'Range Rover Defender 130 · VIN SALGA2BU5PA445310', time: 'Ayer 09:15', read: true }
];

export function createInitialTallerState(): TallerState {
	return {
		vehicles,
		technicians,
		bays,
		branches,
		appointments,
		history,
		alerts,
		notifs,
		nextApptSeq: 40,
		lastUpdated: new Date().toISOString()
	};
}
