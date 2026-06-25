export type ColumnId = 'ideas' | 'planned' | 'building' | 'qa' | 'shipped';

export type Column = {
	id: ColumnId;
	title: string;
};

export type TaskTeam =
	| 'Finanzas'
	| 'Inventario'
	| 'Diseño'
	| 'Documentación'
	| 'Compras'
	| 'Plataforma'
	| 'Producto'
	| 'QA'
	| 'Seguridad';

export type TaskPriority = 'Alta' | 'Media' | 'Baja';

export type TaskInsightLabel = 'Adjuntos' | 'Comentarios' | 'Documentos';

export type TaskInsight = {
	label: TaskInsightLabel;
	count: number;
};

export type TaskOwnerProfile = {
	name: string;
	tone: string;
};

export type Task = {
	id: string;
	title: string;
	description: string;
	priority: TaskPriority;
	dueDate: string;
	progress: number;
	owner: TaskOwnerProfile;
	team: TaskTeam;
	insights: TaskInsight[];
};

export type BoardState = Record<ColumnId, Task[]>;

export const columns: Column[] = [
	{ id: 'ideas', title: 'Ideas' },
	{ id: 'planned', title: 'Planificado' },
	{ id: 'building', title: 'En desarrollo' },
	{ id: 'qa', title: 'QA' },
	{ id: 'shipped', title: 'Entregado' },
];

export const columnIds: ColumnId[] = columns.map((c) => c.id);

export const tagTones: Record<TaskTeam, string> = {
	Finanzas: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
	Inventario: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
	Diseño: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300',
	Documentación: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
	Compras: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
	Plataforma: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
	Producto: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
	QA: 'bg-red-500/10 text-red-700 dark:text-red-300',
	Seguridad: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
};

const taskOwners = {
	alejandro: {
		name: 'Alejandro Pérez',
		tone: '[&_[data-slot=avatar-fallback]]:bg-zinc-100 [&_[data-slot=avatar-fallback]]:text-zinc-700 after:border-zinc-200 dark:[&_[data-slot=avatar-fallback]]:bg-zinc-500/15 dark:[&_[data-slot=avatar-fallback]]:text-zinc-300 dark:after:border-zinc-500/20',
	},
	lucia: {
		name: 'Lucía Ortega',
		tone: '[&_[data-slot=avatar-fallback]]:bg-lime-100 [&_[data-slot=avatar-fallback]]:text-lime-700 after:border-lime-200 dark:[&_[data-slot=avatar-fallback]]:bg-lime-500/15 dark:[&_[data-slot=avatar-fallback]]:text-lime-300 dark:after:border-lime-500/20',
	},
	marta: {
		name: 'Marta Silva',
		tone: '[&_[data-slot=avatar-fallback]]:bg-indigo-100 [&_[data-slot=avatar-fallback]]:text-indigo-700 after:border-indigo-200 dark:[&_[data-slot=avatar-fallback]]:bg-indigo-500/15 dark:[&_[data-slot=avatar-fallback]]:text-indigo-300 dark:after:border-indigo-500/20',
	},
	sofia: {
		name: 'Sofía Ríos',
		tone: '[&_[data-slot=avatar-fallback]]:bg-fuchsia-100 [&_[data-slot=avatar-fallback]]:text-fuchsia-700 after:border-fuchsia-200 dark:[&_[data-slot=avatar-fallback]]:bg-fuchsia-500/15 dark:[&_[data-slot=avatar-fallback]]:text-fuchsia-300 dark:after:border-fuchsia-500/20',
	},
	nicolas: {
		name: 'Nicolás Vega',
		tone: '[&_[data-slot=avatar-fallback]]:bg-violet-100 [&_[data-slot=avatar-fallback]]:text-violet-700 after:border-violet-200 dark:[&_[data-slot=avatar-fallback]]:bg-violet-500/15 dark:[&_[data-slot=avatar-fallback]]:text-violet-300 dark:after:border-violet-500/20',
	},
	paula: {
		name: 'Paula Díaz',
		tone: '[&_[data-slot=avatar-fallback]]:bg-pink-100 [&_[data-slot=avatar-fallback]]:text-pink-700 after:border-pink-200 dark:[&_[data-slot=avatar-fallback]]:bg-pink-500/15 dark:[&_[data-slot=avatar-fallback]]:text-pink-300 dark:after:border-pink-500/20',
	},
	javier: {
		name: 'Javier Moreno',
		tone: '[&_[data-slot=avatar-fallback]]:bg-sky-100 [&_[data-slot=avatar-fallback]]:text-sky-700 after:border-sky-200 dark:[&_[data-slot=avatar-fallback]]:bg-sky-500/15 dark:[&_[data-slot=avatar-fallback]]:text-sky-300 dark:after:border-sky-500/20',
	},
} satisfies Record<string, TaskOwnerProfile>;

export const initialBoard: BoardState = {
	ideas: [
		{
			id: 'mapa-ventas',
			title: 'Mapa del flujo de ventas ERP',
			description: 'Modela cotizaciones, pedidos, facturación, cobros y seguimiento de clientes en un solo flujo.',
			priority: 'Alta',
			dueDate: 'Jun 14',
			progress: 10,
			owner: taskOwners.alejandro,
			team: 'Producto',
			insights: [
				{ label: 'Comentarios', count: 7 },
				{ label: 'Documentos', count: 3 },
			],
		},
		{
			id: 'plan-implementacion',
			title: 'Plan de implementación del módulo financiero',
			description: 'Define fases de despliegue, capacitación y migración de saldos para el ERP completo.',
			priority: 'Media',
			dueDate: 'Jun 16',
			progress: 20,
			owner: taskOwners.paula,
			team: 'Finanzas',
			insights: [
				{ label: 'Adjuntos', count: 2 },
				{ label: 'Comentarios', count: 5 },
			],
		},
		{
			id: 'respaldo-recuperacion',
			title: 'Estrategia de respaldo y recuperación',
			description: 'Establece copias de seguridad de inventario, cuentas contables y documentos del ERP.',
			priority: 'Media',
			dueDate: 'Jun 18',
			progress: 15,
			owner: taskOwners.marta,
			team: 'Plataforma',
			insights: [
				{ label: 'Adjuntos', count: 1 },
				{ label: 'Comentarios', count: 4 },
			],
		},
		{
			id: 'asignacion-ordenes',
			title: 'Modelo de asignación de órdenes de compra',
			description: 'Relaciona proveedores, líneas de compra y aprobaciones por centro de costo.',
			priority: 'Media',
			dueDate: 'Jun 19',
			progress: 5,
			owner: taskOwners.sofia,
			team: 'Compras',
			insights: [
				{ label: 'Comentarios', count: 3 },
				{ label: 'Documentos', count: 1 },
			],
		},
		{
			id: 'sincronizacion-sucursales',
			title: 'Notas de sincronización de sucursales',
			description: 'Registra supuestos de conectividad para almacenes, filiales y centros de distribución.',
			priority: 'Baja',
			dueDate: 'Jun 21',
			progress: 0,
			owner: taskOwners.alejandro,
			team: 'Plataforma',
			insights: [{ label: 'Comentarios', count: 2 }],
		},
	],
	planned: [
		{
			id: 'shell-erp-desktop',
			title: 'Shell de aplicación ERP desktop',
			description: 'Crea la interfaz principal para módulos de ventas, compras, inventario y finanzas.',
			priority: 'Alta',
			dueDate: 'Jun 20',
			progress: 25,
			owner: taskOwners.alejandro,
			team: 'Plataforma',
			insights: [
				{ label: 'Adjuntos', count: 4 },
				{ label: 'Comentarios', count: 9 },
				{ label: 'Documentos', count: 2 },
			],
		},
		{
			id: 'api-importacion',
			title: 'API segura para importación de inventario',
			description: 'Expone métodos seguros para cargar productos, proveedores y movimientos de stock.',
			priority: 'Alta',
			dueDate: 'Jun 22',
			progress: 20,
			owner: taskOwners.nicolas,
			team: 'Seguridad',
			insights: [
				{ label: 'Adjuntos', count: 2 },
				{ label: 'Comentarios', count: 6 },
				{ label: 'Documentos', count: 1 },
			],
		},
		{
			id: 'registros-clientes',
			title: 'Registros de clientes y proveedores',
			description: 'Crea la base maestra de contactos, identificadores y condiciones comerciales.',
			priority: 'Media',
			dueDate: 'Jun 24',
			progress: 15,
			owner: taskOwners.sofia,
			team: 'Producto',
			insights: [
				{ label: 'Comentarios', count: 5 },
				{ label: 'Documentos', count: 2 },
			],
		},
		{
			id: 'indice-documentos',
			title: 'Índice de documentos generados',
			description: 'Planifica filtros por empresa, periodo, proveedor y lote de importación.',
			priority: 'Media',
			dueDate: 'Jun 25',
			progress: 10,
			owner: taskOwners.marta,
			team: 'Documentación',
			insights: [
				{ label: 'Adjuntos', count: 2 },
				{ label: 'Comentarios', count: 4 },
			],
		},
	],
	building: [
		{
			id: 'esquema-erp',
			title: 'Esquema de base de datos ERP',
			description: 'Modela clientes, proveedores, inventario, compras, contabilidad y documentos.',
			priority: 'Alta',
			dueDate: 'Jun 26',
			progress: 65,
			owner: taskOwners.alejandro,
			team: 'Inventario',
			insights: [
				{ label: 'Adjuntos', count: 5 },
				{ label: 'Comentarios', count: 11 },
				{ label: 'Documentos', count: 4 },
			],
		},
		{
			id: 'importacion-nomina',
			title: 'Importación de nómina desde Excel',
			description: 'Lee hojas de cálculo de salarios y registra lotes de importación para contabilidad.',
			priority: 'Alta',
			dueDate: 'Jun 28',
			progress: 45,
			owner: taskOwners.lucia,
			team: 'Finanzas',
			insights: [
				{ label: 'Adjuntos', count: 3 },
				{ label: 'Comentarios', count: 8 },
				{ label: 'Documentos', count: 2 },
			],
		},
		{
			id: 'mapeo-campos',
			title: 'Constructor de mapeo de campos ERP',
			description: 'Asocia columnas de Excel con campos de compras, inventario y finanzas.',
			priority: 'Media',
			dueDate: 'Jul 1',
			progress: 30,
			owner: taskOwners.javier,
			team: 'Diseño',
			insights: [
				{ label: 'Comentarios', count: 6 },
				{ label: 'Documentos', count: 2 },
			],
		},
	],
	qa: [
		{
			id: 'validacion-movimientos',
			title: 'Validación de movimientos contables',
			description: 'Detecta cuentas faltantes, montos inválidos, duplicados y campos sin mapear.',
			priority: 'Alta',
			dueDate: 'Jul 4',
			progress: 75,
			owner: taskOwners.nicolas,
			team: 'QA',
			insights: [
				{ label: 'Adjuntos', count: 4 },
				{ label: 'Comentarios', count: 10 },
			],
		},
		{
			id: 'previsualizacion-facturas',
			title: 'Vista previa de facturas y nómina',
			description: 'Revisa comprobantes antes de exportarlos a PDF y conservar su historial.',
			priority: 'Media',
			dueDate: 'Jul 6',
			progress: 60,
			owner: taskOwners.lucia,
			team: 'Finanzas',
			insights: [
				{ label: 'Adjuntos', count: 3 },
				{ label: 'Comentarios', count: 7 },
				{ label: 'Documentos', count: 3 },
			],
		},
	],
	shipped: [
		{
			id: 'reglas-arquitectura',
			title: 'Reglas de arquitectura ERP cerradas',
			description: 'La capa UI se mantiene separada de importación, IPC, servicios y base de datos.',
			priority: 'Alta',
			dueDate: 'Jun 8',
			progress: 100,
			owner: taskOwners.alejandro,
			team: 'Seguridad',
			insights: [
				{ label: 'Comentarios', count: 6 },
				{ label: 'Documentos', count: 3 },
			],
		},
		{
			id: 'alcance-mvp',
			title: 'Alcance MVP del módulo financiero',
			description: 'Comenzamos con la versión privada y validamos flujos antes de ampliar módulos.',
			priority: 'Media',
			dueDate: 'Jun 10',
			progress: 100,
			owner: taskOwners.paula,
			team: 'Finanzas',
			insights: [
				{ label: 'Adjuntos', count: 2 },
				{ label: 'Comentarios', count: 4 },
			],
		},
		{
			id: 'prioridades-compras',
			title: 'Prioridades del módulo de compras',
			description: 'La generación de órdenes de compra va primero, pero el modelo soporta todo el ERP.',
			priority: 'Media',
			dueDate: 'Jun 12',
			progress: 100,
			owner: taskOwners.sofia,
			team: 'Compras',
			insights: [
				{ label: 'Comentarios', count: 5 },
				{ label: 'Documentos', count: 2 },
			],
		},
	],
};
