import type { InventariosState, Folio, Notificacion, TrazaEntry } from './types';

// Datos base portados de la maqueta GAP-ALM-003 (invetarios.html).
// `surtido` proviene del campo `lista` original; `confirmada` arranca igual a `surtido`.

const folios: Folio[] = [
	{
		id: 'F-2026-041',
		num: '041',
		vin: '3HGGK5H59FM700421',
		unidad: 'Chevrolet Suburban LTZ',
		nivel: 'NIJ III-A',
		resp: 'Carlos M.',
		fecha: '02/07/2026',
		estatus: 'urgente',
		horaInicio: '08:14',
		celdas: [
			{
				letra: 'A',
				nombre: 'Celda A — Blindaje Lateral',
				materiales: [
					{ pn: 'BLD-AR500-LAT-R', desc: 'Placa AR-500 Lateral Der.', qty: 2, um: 'pza', surtido: true, confirmada: true },
					{ pn: 'BLD-AR500-LAT-L', desc: 'Placa AR-500 Lateral Izq.', qty: 2, um: 'pza', surtido: true, confirmada: true },
					{ pn: 'KVL-29-R8M', desc: 'Relleno Kevlar 29', qty: 8, um: 'm²', surtido: false, confirmada: false },
					{ pn: 'BLD-FRNT-UP', desc: 'Placa frontal superior', qty: 1, um: 'pza', surtido: false, confirmada: false }
				]
			},
			{
				letra: 'B',
				nombre: 'Celda B — Vidrios Balísticos',
				materiales: [
					{ pn: 'VDR-NIJIIA-FNT', desc: 'Vidrio NIJ III-A Frontal', qty: 1, um: 'pza', surtido: true, confirmada: true },
					{ pn: 'VDR-NIIIA-LAT', desc: 'Vidrio NIJ III-A Lateral', qty: 4, um: 'pza', surtido: false, confirmada: false },
					{ pn: 'VDR-NIIIA-TSR', desc: 'Vidrio NIJ III-A Trasero', qty: 1, um: 'pza', surtido: false, confirmada: false }
				]
			},
			{
				letra: 'C',
				nombre: 'Celda C — Arneses y Eléctrico',
				materiales: [
					{ pn: 'ARN-BLD-CC', desc: 'Arnés cortocircuito blindaje', qty: 1, um: 'jgo', surtido: true, confirmada: true },
					{ pn: 'REL-PRO-SYS', desc: 'Relay protección sistema', qty: 2, um: 'pza', surtido: true, confirmada: true },
					{ pn: 'FCA-LAT-REF', desc: 'Facia lateral int. reforzada', qty: 2, um: 'pza', surtido: true, confirmada: true }
				]
			},
			{
				letra: 'D',
				nombre: 'Celda D — Piso y Ruedas',
				materiales: [
					{ pn: 'PIZ-DYN-SK75', desc: 'Piso Dyneema SK75', qty: 4, um: 'm²', surtido: false, confirmada: false },
					{ pn: 'RDA-RNF-ACR', desc: 'Aro rueda reforzado acero', qty: 4, um: 'pza', surtido: false, confirmada: false },
					{ pn: 'NMT-RUN-FLAT', desc: 'Neumático Run-Flat 275/50R22', qty: 4, um: 'pza', surtido: false, confirmada: false }
				]
			}
		]
	},
	{
		id: 'F-2026-040',
		num: '040',
		vin: 'WDC1670041A800880',
		unidad: 'Mercedes-Benz GLS 600',
		nivel: 'NIJ III-A — NIJ IV',
		resp: 'Diana R.',
		fecha: '02/07/2026',
		estatus: 'proceso',
		horaInicio: '07:58',
		celdas: [
			{
				letra: 'A',
				nombre: 'Celda A — Blindaje Lateral',
				materiales: [
					{ pn: 'BLD-AR500-GLS-R', desc: 'Placa AR-500 GLS Lateral Der.', qty: 3, um: 'pza', surtido: true, confirmada: true },
					{ pn: 'BLD-AR500-GLS-L', desc: 'Placa AR-500 GLS Lateral Izq.', qty: 3, um: 'pza', surtido: true, confirmada: true },
					{ pn: 'KVL-49-GLS', desc: 'Kevlar 49 aramid GLS', qty: 10, um: 'm²', surtido: false, confirmada: false },
					{ pn: 'BLD-TECHO-GLS', desc: 'Placa techo blindado GLS', qty: 1, um: 'pza', surtido: false, confirmada: false }
				]
			},
			{
				letra: 'B',
				nombre: 'Celda B — Vidrios Balísticos',
				materiales: [
					{ pn: 'VDR-NIJIV-FNT', desc: 'Vidrio NIJ IV Frontal 70mm', qty: 1, um: 'pza', surtido: false, confirmada: false },
					{ pn: 'VDR-NIJIV-LAT', desc: 'Vidrio NIJ IV Lateral', qty: 4, um: 'pza', surtido: false, confirmada: false },
					{ pn: 'VDR-NIJIV-TSR', desc: 'Vidrio NIJ IV Trasero', qty: 1, um: 'pza', surtido: false, confirmada: false }
				]
			},
			{
				letra: 'C',
				nombre: 'Celda C — Arneses y Eléctrico',
				materiales: [
					{ pn: 'ARN-GLS-CC', desc: 'Arnés cortocircuito GLS', qty: 1, um: 'jgo', surtido: true, confirmada: true },
					{ pn: 'REL-GLS-SYS', desc: 'Relay GLS protección', qty: 2, um: 'pza', surtido: true, confirmada: true }
				]
			}
		]
	},
	{
		id: 'F-2026-039',
		num: '039',
		vin: '5UXCR6C5XM9E39910',
		unidad: 'BMW X7 Protection VR6',
		nivel: 'B6 (VPAM)',
		resp: 'Héctor L.',
		fecha: '01/07/2026',
		estatus: 'completado',
		horaInicio: '06:30',
		celdas: [
			{
				letra: 'A',
				nombre: 'Celda A — Blindaje Lateral',
				materiales: [
					{ pn: 'BLD-AR600-BMW-L', desc: 'Placa acero balístico BMW', qty: 4, um: 'pza', surtido: true, confirmada: true },
					{ pn: 'KVL-X7-SPEC', desc: 'Kevlar especial BMW X7', qty: 12, um: 'm²', surtido: true, confirmada: true },
					{ pn: 'BLD-BMW-DOOR', desc: 'Refuerzo puerta BMW X7', qty: 4, um: 'pza', surtido: true, confirmada: true }
				]
			},
			{
				letra: 'B',
				nombre: 'Celda B — Vidrios Balísticos',
				materiales: [
					{ pn: 'VDR-B6-FNT', desc: 'Vidrio B6 VPAM Frontal', qty: 1, um: 'pza', surtido: true, confirmada: true },
					{ pn: 'VDR-B6-LAT', desc: 'Vidrio B6 VPAM Lateral', qty: 4, um: 'pza', surtido: true, confirmada: true }
				]
			},
			{
				letra: 'D',
				nombre: 'Celda D — Piso y Ruedas',
				materiales: [
					{ pn: 'PIZ-BMW-X7', desc: 'Piso balístico BMW X7', qty: 4, um: 'm²', surtido: true, confirmada: true },
					{ pn: 'NMT-BMW-RF', desc: 'Neumático Run-Flat BMW X7', qty: 4, um: 'pza', surtido: true, confirmada: true }
				]
			}
		]
	},
	{
		id: 'F-2026-038',
		num: '038',
		vin: 'JTJHM7BX5M4021038',
		unidad: 'Lexus LX 600',
		nivel: 'NIJ III',
		resp: 'Carlos M.',
		fecha: '02/07/2026',
		estatus: 'proceso',
		horaInicio: '09:05',
		celdas: [
			{
				letra: 'A',
				nombre: 'Celda A — Blindaje Lateral',
				materiales: [
					{ pn: 'BLD-LX600-LAT', desc: 'Placa blindaje LX 600', qty: 4, um: 'pza', surtido: false, confirmada: false },
					{ pn: 'KVL-LX600', desc: 'Kevlar LX 600', qty: 8, um: 'm²', surtido: false, confirmada: false }
				]
			},
			{
				letra: 'D',
				nombre: 'Celda D — Piso y Ruedas',
				materiales: [
					{ pn: 'PIZ-DYN75-LX', desc: 'Piso Dyneema LX 600', qty: 5, um: 'm²', surtido: false, confirmada: false },
					{ pn: 'PIZ-ACR3-LX', desc: 'Placa piso acero 3mm', qty: 3, um: 'm²', surtido: false, confirmada: false },
					{ pn: 'NMT-RF-LX600', desc: 'Neumático Run-Flat LX 600', qty: 4, um: 'pza', surtido: false, confirmada: false }
				]
			}
		]
	},
	{
		id: 'F-2026-037',
		num: '037',
		vin: '4JGFB4JB7LA107137',
		unidad: 'Mercedes-Benz GLE 53 AMG',
		nivel: 'NIJ III-A',
		resp: 'Diana R.',
		fecha: '01/07/2026',
		estatus: 'completado',
		horaInicio: '06:15',
		celdas: [
			{
				letra: 'A',
				nombre: 'Celda A — Blindaje Lateral',
				materiales: [
					{ pn: 'BLD-GLE-LAT-R', desc: 'Placa blindaje GLE Der.', qty: 2, um: 'pza', surtido: true, confirmada: true },
					{ pn: 'BLD-GLE-LAT-L', desc: 'Placa blindaje GLE Izq.', qty: 2, um: 'pza', surtido: true, confirmada: true },
					{ pn: 'KVL-GLE-53', desc: 'Kevlar GLE 53', qty: 6, um: 'm²', surtido: true, confirmada: true }
				]
			},
			{
				letra: 'B',
				nombre: 'Celda B — Vidrios Balísticos',
				materiales: [
					{ pn: 'VDR-GLE-FNT', desc: 'Vidrio blindado GLE Frontal', qty: 1, um: 'pza', surtido: true, confirmada: true },
					{ pn: 'VDR-GLE-LAT', desc: 'Vidrio blindado GLE Lateral', qty: 4, um: 'pza', surtido: true, confirmada: true }
				]
			},
			{
				letra: 'C',
				nombre: 'Celda C — Arneses y Eléctrico',
				materiales: [{ pn: 'ARN-GLE-CC', desc: 'Arnés GLE cortocircuito', qty: 1, um: 'jgo', surtido: true, confirmada: true }]
			}
		]
	}
];

const notificaciones: Notificacion[] = [
	{
		id: 'lk-001',
		folio: 'F-2026-041',
		unidad: 'Chevrolet Suburban LTZ',
		vin: '3HGGK5H59FM700421',
		tipo: 'urgente',
		estado: 'Sin surtir',
		titulo: 'Aditiva urgente',
		desc: 'Placa balística lateral adicional (lado conductor) — AR-500 calibre 6mm, 60x40cm',
		mats: 'BLD-AR500-LAT-ADD · Placa AR-500 6mm · 1 pza · Rack A-12 / KVL-29-ADD · Relleno Kevlar adicional · 0.5m² · Rack B-04',
		autoriza: 'Ing. Ramírez (Jefe de Producción)',
		hora: '09:31',
		minuta: 'Minuta 1.1'
	},
	{
		id: 'lk-002',
		folio: 'F-2026-040',
		unidad: 'Mercedes-Benz GLS 600',
		vin: 'WDC1670041A800880',
		tipo: 'aditiva',
		estado: 'Pendiente',
		titulo: 'Cambio de especificación',
		desc: 'Vidrio frontal nivel NIJ III-A → NIJ IV (vidrio laminado blindado 70mm)',
		mats: 'VDR-NIJIV-FNT · Vidrio NIJ IV Frontal 70mm · 1 pza · Rack C-02 / VDR-NIIIA-FNT · Retiro vidrio NIJ III-A (devolución)',
		autoriza: 'Ing. López (Ingeniería)',
		hora: '09:24',
		minuta: 'Minuta 1.8'
	},
	{
		id: 'lk-003',
		folio: 'F-2026-038',
		unidad: 'Lexus LX 600',
		vin: 'JTJHM7BX5M4021038',
		tipo: 'normal',
		estado: 'Pendiente',
		titulo: 'Aditiva',
		desc: 'Piso balístico reforzado (Dyneema SK75 + acero 3mm) — área completa cabina',
		mats: 'PIZ-DYN75-ADD · Dyneema SK75 adicional · 2m² · Rack D-07 / PIZ-ACR3-ADD · Placa acero 3mm adicional · 1m² · Rack D-08',
		autoriza: 'Ing. Vargas (Producción)',
		hora: '09:07',
		minuta: 'Minuta 1.10'
	}
];

const trazabilidad: TrazaEntry[] = [
	{ id: 'tz-01', folio: 'F-2026-039', unidad: 'BMW X7 Protection', celda: 'Celda A', mat: 'Placa AR-600 BMW (4 pzas)', qty: 4, fecha: '02/07/2026', hora: '08:55', resp: 'Héctor L.', tipo: 'Kit' },
	{ id: 'tz-02', folio: 'F-2026-039', unidad: 'BMW X7 Protection', celda: 'Celda B', mat: 'Vidrio B6 Frontal (1 pza)', qty: 1, fecha: '02/07/2026', hora: '08:40', resp: 'Héctor L.', tipo: 'Kit' },
	{ id: 'tz-03', folio: 'F-2026-037', unidad: 'Mercedes GLE 53', celda: 'Celda A', mat: 'Placa GLE Lateral (4 pzas)', qty: 4, fecha: '02/07/2026', hora: '07:50', resp: 'Diana R.', tipo: 'Kit' },
	{ id: 'tz-04', folio: 'F-2026-037', unidad: 'Mercedes GLE 53', celda: 'Celda C', mat: 'Arnés blindaje (1 jgo)', qty: 1, fecha: '02/07/2026', hora: '07:30', resp: 'Diana R.', tipo: 'Kit' },
	{ id: 'tz-05', folio: 'F-2026-040', unidad: 'Mercedes GLS 600', celda: 'Celda C', mat: 'Relay protección (2 pzas)', qty: 2, fecha: '02/07/2026', hora: '09:10', resp: 'Diana R.', tipo: 'Kit' },
	{ id: 'tz-06', folio: 'F-2026-040', unidad: 'Mercedes GLS 600', celda: 'Celda A', mat: 'Placa AR-500 GLS (6 pzas)', qty: 6, fecha: '02/07/2026', hora: '08:20', resp: 'Diana R.', tipo: 'Kit' },
	{ id: 'tz-07', folio: 'F-2026-041', unidad: 'Suburban LTZ', celda: 'Celda C', mat: 'Facia lat. reforzada (2 pzas)', qty: 2, fecha: '02/07/2026', hora: '09:22', resp: 'Carlos M.', tipo: 'Kit' },
	{ id: 'tz-08', folio: 'F-2026-038', unidad: 'Lexus LX 600', celda: 'Celda D', mat: 'Neumático Run-Flat (4 pzas)', qty: 4, fecha: '02/07/2026', hora: '07:15', resp: 'Carlos M.', tipo: 'Kit' },
	{ id: 'tz-09', folio: 'F-2026-041', unidad: 'Suburban LTZ', celda: 'Aditiva', mat: 'Placa AR-500 ADD — Aditiva', qty: 1, fecha: '02/07/2026', hora: '09:36', resp: 'Carlos M.', tipo: 'Aditiva' }
];

export function createInitialInventariosState(): InventariosState {
	return {
		currentUser: { name: 'Carlos Mendoza', role: 'Almacén Kitting', avatarInitials: 'CM' },
		folios: structuredClone(folios),
		notificaciones: structuredClone(notificaciones),
		trazabilidad: structuredClone(trazabilidad),
		lastUpdated: new Date().toISOString()
	};
}
