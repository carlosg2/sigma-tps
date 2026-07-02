import type { ComprasState, OrdenCompra, Requisicion, Alerta, NivelConfig, ComprasUser } from './types';

function be(
	fecha: string,
	usuario: string,
	rol: string,
	accion: string,
	tipo: 'creacion' | 'aprobado' | 'rechazado',
	comentario = ''
) {
	return { id: `bit-${fecha}-${Math.random().toString(36).slice(2, 7)}`, fecha, usuario, rol, accion, tipo, comentario };
}

const ordenes: OrdenCompra[] = [
	{
		id: 'OC-2026-0892',
		centroCosto: 'CC-001',
		ccNombre: 'Producción',
		solicitante: 'Ana López',
		proveedor: 'Aceros del Norte S.A.',
		fecha: '2026-06-28',
		monto: 77300,
		nivel: 2,
		nivelActual: 2,
		estado: 'Pendiente',
		partidas: [
			{ id: 'PT-001', concepto: 'Varilla corrugada 3/8"', cantidad: 500, unidad: 'kg', monto: 45200 },
			{ id: 'PT-002', concepto: 'Perfil L 2×2"', cantidad: 200, unidad: 'pzas', monto: 32100 }
		],
		bitacora: [
			be('2026-06-28 09:15', 'Ana López', 'Solicitante', 'Creación de la OC', 'creacion'),
			be('2026-06-28 11:30', 'Luis Hernández', 'Jefe de Compras', 'Autorización Nivel 1 ✓', 'aprobado', 'Cotizaciones revisadas y validadas.')
		]
	},
	{
		id: 'OC-2026-0901',
		centroCosto: 'CC-003',
		ccNombre: 'TI',
		solicitante: 'Roberto Sánchez',
		proveedor: 'TechnoSupply MX',
		fecha: '2026-06-29',
		monto: 38900,
		nivel: 1,
		nivelActual: 1,
		estado: 'Pendiente',
		partidas: [
			{ id: 'PT-003', concepto: 'Switches Cisco 24p', cantidad: 4, unidad: 'pzas', monto: 22400 },
			{ id: 'PT-004', concepto: 'Patch panels CAT6', cantidad: 8, unidad: 'pzas', monto: 10500 },
			{ id: 'PT-005', concepto: 'Cable UTP Cat6 (caja 305m)', cantidad: 2, unidad: 'caja', monto: 6000 }
		],
		bitacora: [be('2026-06-29 10:00', 'Roberto Sánchez', 'Solicitante', 'Creación de la OC', 'creacion')]
	},
	{
		id: 'OC-2026-0875',
		centroCosto: 'CC-002',
		ccNombre: 'Administración',
		solicitante: 'María García',
		proveedor: 'Office Pro MX',
		fecha: '2026-06-25',
		monto: 312000,
		nivel: 3,
		nivelActual: 3,
		estado: 'Pendiente',
		partidas: [
			{ id: 'PT-006', concepto: 'Mobiliario ejecutivo', cantidad: 15, unidad: 'pzas', monto: 185000 },
			{ id: 'PT-007', concepto: 'Sillas ergonómicas', cantidad: 30, unidad: 'pzas', monto: 90000 },
			{ id: 'PT-008', concepto: 'Iluminación LED escritorio', cantidad: 45, unidad: 'pzas', monto: 37000 }
		],
		bitacora: [
			be('2026-06-25 08:45', 'María García', 'Solicitante', 'Creación de la OC', 'creacion'),
			be('2026-06-25 14:20', 'Luis Hernández', 'Jefe de Compras', 'Autorización Nivel 1 ✓', 'aprobado', 'Necesidad urgente justificada.'),
			be('2026-06-26 09:00', 'Carlos Mendoza', 'Gerente de Compras', 'Autorización Nivel 2 ✓', 'aprobado', 'Presupuesto disponible, proceder.')
		]
	},
	{
		id: 'OC-2026-0864',
		centroCosto: 'CC-004',
		ccNombre: 'Logística',
		solicitante: 'Pedro Ruiz',
		proveedor: 'Logística Integral SA',
		fecha: '2026-06-24',
		monto: 82500,
		nivel: 2,
		nivelActual: 2,
		estado: 'Aprobado',
		partidas: [
			{ id: 'PT-009', concepto: 'Montacargas eléctrico 2T', cantidad: 1, unidad: 'pzas', monto: 67500 },
			{ id: 'PT-010', concepto: 'Racks metálicos 4 niveles', cantidad: 5, unidad: 'pzas', monto: 15000 }
		],
		bitacora: [
			be('2026-06-24 09:00', 'Pedro Ruiz', 'Solicitante', 'Creación de la OC', 'creacion'),
			be('2026-06-24 13:00', 'Luis Hernández', 'Jefe de Compras', 'Autorización Nivel 1 ✓', 'aprobado'),
			be('2026-06-25 10:30', 'Carlos Mendoza', 'Gerente de Compras', 'Autorización Nivel 2 ✓', 'aprobado', 'Aprobado. Proceder con la compra.')
		]
	},
	{
		id: 'OC-2026-0850',
		centroCosto: 'CC-001',
		ccNombre: 'Producción',
		solicitante: 'Ana López',
		proveedor: 'Maquinaria Pesada SA',
		fecha: '2026-06-23',
		monto: 89200,
		nivel: 2,
		nivelActual: 1,
		estado: 'Rechazado',
		partidas: [
			{ id: 'PT-011', concepto: 'Compresor industrial 100HP', cantidad: 1, unidad: 'pzas', monto: 89200 }
		],
		bitacora: [
			be('2026-06-23 08:00', 'Ana López', 'Solicitante', 'Creación de la OC', 'creacion'),
			be('2026-06-23 16:45', 'Luis Hernández', 'Jefe de Compras', 'Rechazado Nivel 1 ✗', 'rechazado', 'Requiere 3 cotizaciones. Solo se adjuntó 1.')
		]
	}
];

const requisiciones: Requisicion[] = [
	{ id: 'REQ-2026-0045', material: 'Varilla corrugada 3/8" × 500 kg', solicitante: 'Ana López', depto: 'Producción', fecha: '2026-06-01', status: 'En Almacén', diasRetraso: 0 },
	{ id: 'REQ-2026-0048', material: 'Switches Cisco 24p × 4', solicitante: 'Roberto Sánchez', depto: 'TI', fecha: '2026-06-05', status: 'En Autorización', diasRetraso: 0 },
	{ id: 'REQ-2026-0050', material: 'Mobiliario ejecutivo × 15 pzas', solicitante: 'María García', depto: 'Administración', fecha: '2026-06-08', status: 'OC Generada', diasRetraso: 0 },
	{ id: 'REQ-2026-0052', material: 'Resmas papel bond A4 × 100', solicitante: 'Diana Torres', depto: 'Administración', fecha: '2026-06-10', status: 'Comprado', diasRetraso: 0 },
	{ id: 'REQ-2026-0055', material: 'Laptop Dell Latitude 15" × 3', solicitante: 'Roberto Sánchez', depto: 'TI', fecha: '2026-06-12', status: 'Solicitado', diasRetraso: 0 },
	{ id: 'REQ-2026-0058', material: 'Montacargas eléctrico × 1', solicitante: 'Pedro Ruiz', depto: 'Logística', fecha: '2026-06-14', status: 'Comprado', diasRetraso: 0 },
	{ id: 'REQ-2026-0060', material: 'Cemento Portland × 200 sacos', solicitante: 'Ana López', depto: 'Producción', fecha: '2026-06-15', status: 'Cotizado', diasRetraso: 5 },
	{ id: 'REQ-2026-0063', material: 'Aire acondicionado 2T × 2', solicitante: 'Carlos Fuentes', depto: 'Administración', fecha: '2026-06-18', status: 'OC Generada', diasRetraso: 3 },
	{ id: 'REQ-2026-0066', material: 'Servidor Dell PowerEdge × 1', solicitante: 'Roberto Sánchez', depto: 'TI', fecha: '2026-06-20', status: 'En Autorización', diasRetraso: 0 },
	{ id: 'REQ-2026-0068', material: 'Pallets de madera × 50', solicitante: 'Pedro Ruiz', depto: 'Logística', fecha: '2026-06-22', status: 'Solicitado', diasRetraso: 0 },
	{ id: 'REQ-2026-0070', material: 'Impermeabilizante × 20 cubetas', solicitante: 'Mario Ríos', depto: 'Producción', fecha: '2026-06-24', status: 'Cancelado', diasRetraso: 0 },
	{ id: 'REQ-2026-0072', material: 'Uniformes de seguridad × 25', solicitante: 'Ana López', depto: 'Logística', fecha: '2026-06-26', status: 'Cotizado', diasRetraso: 2 }
];

const alertas: Alerta[] = [
	{ id: 'alr-1', tipo: 'error', titulo: 'Retraso crítico', desc: 'REQ-2026-0060 · Cemento Portland lleva 5 días sin avance en etapa Cotizado.', req: 'REQ-2026-0060', fecha: '2026-07-01 08:00' },
	{ id: 'alr-2', tipo: 'warning', titulo: 'Retraso moderado', desc: 'REQ-2026-0063 · Aire acondicionado 2T lleva 3 días en OC Generada sin liberación.', req: 'REQ-2026-0063', fecha: '2026-07-01 08:00' },
	{ id: 'alr-3', tipo: 'warning', titulo: 'Retraso moderado', desc: 'REQ-2026-0072 · Uniformes de seguridad llevan 2 días sin avance en Cotizado.', req: 'REQ-2026-0072', fecha: '2026-06-30 18:00' },
	{ id: 'alr-4', tipo: 'info', titulo: 'Cambio de estatus', desc: 'REQ-2026-0045 · Varilla corrugada 3/8" ha llegado a En Almacén.', req: 'REQ-2026-0045', fecha: '2026-06-30 15:30' }
];

const config: NivelConfig[] = [
	{ nivel: 1, label: 'Nivel 1 – Jefe de Compras', montoMin: 0, montoMax: 50000, responsable: 'Luis Hernández' },
	{ nivel: 2, label: 'Nivel 2 – Gerente de Compras', montoMin: 50001, montoMax: 200000, responsable: 'Carlos Mendoza' },
	{ nivel: 3, label: 'Nivel 3 – Director General', montoMin: 200001, montoMax: 9999999, responsable: 'Fernando Ibarra' }
];

const currentUser: ComprasUser = { name: 'Carlos Mendoza', role: 'Gerente de Compras', nivel: 2, initials: 'CM' };

export function createInitialComprasState(): ComprasState {
	return {
		ordenes: structuredClone(ordenes),
		requisiciones: structuredClone(requisiciones),
		alertas: structuredClone(alertas),
		config: structuredClone(config),
		currentUser: { ...currentUser },
		lastUpdated: new Date().toISOString()
	};
}
