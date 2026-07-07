import type { FinanzasState, Proveedor, Egreso, HistorialAviso } from './types';

const proveedores: Proveedor[] = [
	{ id: 1, rfc: 'PCG200115MX1', nombre: 'Papelería García S.A. de C.V.', correoC: 'ventas@papeleriagarcia.com.mx', correoA: 'pagos@papeleriagarcia.com.mx', contacto: 'José García Martínez', tel: '55-4521-8890', activo: true },
	{ id: 2, rfc: 'DNH190823MX5', nombre: 'Distribuidora Nacional Hernández SA', correoC: 'ventas@distnalhernandez.mx', correoA: 'contabilidad@distnalhernandez.mx', contacto: 'María Hernández Cruz', tel: '55-2234-7761', activo: true },
	{ id: 3, rfc: 'TSM180401MX3', nombre: 'TechSolutions México SAPI de CV', correoC: 'contacto@techsolutionsmx.com', correoA: 'pagos@techsolutionsmx.com', contacto: 'Roberto Méndez Leal', tel: '55-8801-4492', activo: true },
	{ id: 4, rfc: 'SLI170912MX7', nombre: 'Servicios de Limpieza Integral SA', correoC: 'info@limpiezaintegral.mx', correoA: '', contacto: 'Ana López Vega', tel: '55-3345-6612', activo: true },
	{ id: 5, rfc: 'MCN160520MX2', nombre: 'Materiales del Norte S.A.', correoC: 'ventas@matnorte.mx', correoA: 'cxc@matnorte.mx', contacto: 'Luis Torres Ibarra', tel: '81-2291-3304', activo: false },
	{ id: 6, rfc: 'CFA210304MX9', nombre: 'Consultores Financieros Asociados SC', correoC: 'info@consultoresfa.mx', correoA: 'finanzas@consultoresfa.mx', contacto: 'Sofía Ramírez Peña', tel: '55-6677-8821', activo: true },
	{ id: 7, rfc: 'EOM150718MX4', nombre: 'Equipos de Oficina Moderna SA de CV', correoC: 'ventas@equiposofimoderna.com', correoA: 'pagos@equiposofimoderna.com', contacto: 'Carlos Morales Ríos', tel: '55-9900-1122', activo: true },
	{ id: 8, rfc: 'ABP220110MX6', nombre: 'Alimentos y Bebidas Premium SC', correoC: 'ventas@abpremium.mx', correoA: 'tesoreria@abpremium.mx', contacto: 'Diana Ruiz Castillo', tel: '55-4455-6677', activo: true }
];

const historial: HistorialAviso[] = [
	{ id: 1001, fecha: '2026-07-07 09:23:14', provId: 3, facturas: [{ num: 'FAC-2026-0451', desc: 'Licencias software Q3', sub: 79310.34, iva: 12689.66, tot: 92000 }, { num: 'FAC-2026-0452', desc: 'Soporte técnico julio', sub: 79741.38, iva: 12758.62, tot: 92500 }], monto: 184500, correo: 'pagos@techsolutionsmx.com', ref: 'SPEI202607070001', banco: 'Santander → BBVA', estado: 'enviado' },
	{ id: 1002, fecha: '2026-07-07 08:45:30', provId: 1, facturas: [{ num: 'FAC-2026-0448', desc: 'Papelería y consumibles', sub: 39068.97, iva: 6251.03, tot: 45320 }], monto: 45320, correo: 'pagos@papeleriagarcia.com.mx', ref: 'SPEI202607070002', banco: 'Santander → BBVA', estado: 'enviado' },
	{ id: 1003, fecha: '2026-07-06 16:10:05', provId: 6, facturas: [{ num: 'FAC-2026-0440', desc: 'Consultoría financiera jun', sub: 50000, iva: 8000, tot: 58000 }], monto: 58000, correo: 'finanzas@consultoresfa.mx', ref: 'SPEI202607060008', banco: 'Santander → Banamex', estado: 'enviado' },
	{ id: 1004, fecha: '2026-07-06 14:22:18', provId: 8, facturas: [{ num: 'FAC-2026-0438', desc: 'Suministro alimentos', sub: 26810.34, iva: 4289.66, tot: 31100 }, { num: 'FAC-2026-0439', desc: 'Bebidas premium', sub: 16293.1, iva: 2606.9, tot: 18900 }], monto: 50000, correo: 'tesoreria@abpremium.mx', ref: 'SPEI202607060007', banco: 'Santander → Banorte', estado: 'error' },
	{ id: 1005, fecha: '2026-07-06 11:05:44', provId: 2, facturas: [{ num: 'FAC-2026-0435', desc: 'Distribución jun 2026', sub: 103448.28, iva: 16551.72, tot: 120000 }], monto: 120000, correo: 'contabilidad@distnalhernandez.mx', ref: 'SPEI202607060005', banco: 'Santander → HSBC', estado: 'enviado' },
	{ id: 1006, fecha: '2026-07-05 17:33:21', provId: 7, facturas: [{ num: 'FAC-2026-0430', desc: 'Equipos oficina', sub: 58448.28, iva: 9351.72, tot: 67800 }], monto: 67800, correo: 'pagos@equiposofimoderna.com', ref: 'SPEI202607050012', banco: 'Santander → Scotiabank', estado: 'enviado' },
	{ id: 1007, fecha: '2026-07-05 09:14:58', provId: 4, facturas: [{ num: 'FAC-2026-0428', desc: 'Servicio limpieza jul', sub: 13448.28, iva: 2151.72, tot: 15600 }], monto: 15600, correo: '', ref: 'SPEI202607050004', banco: 'Santander → BBVA', estado: 'sin_correo' },
	{ id: 1008, fecha: '2026-07-04 15:48:12', provId: 3, facturas: [{ num: 'FAC-2026-0422', desc: 'Infraestructura cloud', sub: 75862.07, iva: 12137.93, tot: 88000 }, { num: 'FAC-2026-0423', desc: 'Consultoría TI', sub: 37931.03, iva: 6068.97, tot: 44000 }], monto: 132000, correo: 'pagos@techsolutionsmx.com', ref: 'SPEI202607040009', banco: 'Santander → BBVA', estado: 'enviado' },
	{ id: 1009, fecha: '2026-07-03 13:22:44', provId: 6, facturas: [{ num: 'FAC-2026-0415', desc: 'Auditoría Q2', sub: 43103.45, iva: 6896.55, tot: 50000 }], monto: 50000, correo: 'finanzas@consultoresfa.mx', ref: 'SPEI202607030003', banco: 'Santander → Banamex', estado: 'enviado' },
	{ id: 1010, fecha: '2026-07-02 10:05:18', provId: 1, facturas: [{ num: 'FAC-2026-0408', desc: 'Material de oficina', sub: 22413.79, iva: 3586.21, tot: 26000 }, { num: 'FAC-2026-0409', desc: 'Tóner y cartuchos', sub: 12931.03, iva: 2068.97, tot: 15000 }], monto: 41000, correo: 'pagos@papeleriagarcia.com.mx', ref: 'SPEI202607020011', banco: 'Santander → BBVA', estado: 'enviado' }
];

const egresos: Egreso[] = [
	{ id: 'EGR-2026-00188', fecha: '2026-07-07', provId: 3, facturas: [{ num: 'FAC-2026-0460', desc: 'Licencias software Q3 2026', sub: 108620.69, iva: 17379.31, tot: 126000 }, { num: 'FAC-2026-0461', desc: 'Soporte técnico julio', sub: 68103.45, iva: 10896.55, tot: 79000 }], monto: 205000, ref: 'SPEI202607070010', banco: 'Santander → BBVA', aviso: 'pendiente' },
	{ id: 'EGR-2026-00187', fecha: '2026-07-07', provId: 1, facturas: [{ num: 'FAC-2026-0458', desc: 'Material de oficina y papelería', sub: 29310.34, iva: 4689.66, tot: 34000 }], monto: 34000, ref: 'SPEI202607070009', banco: 'Santander → BBVA', aviso: 'pendiente' },
	{ id: 'EGR-2026-00186', fecha: '2026-07-07', provId: 6, facturas: [{ num: 'FAC-2026-0456', desc: 'Consultoría financiera julio', sub: 37500, iva: 6000, tot: 43500, saldoRest: 6500 }], monto: 43500, ref: 'SPEI202607070008', banco: 'Santander → Banamex', aviso: 'pendiente' },
	{ id: 'EGR-2026-00185', fecha: '2026-07-07', provId: 4, facturas: [{ num: 'FAC-2026-0454', desc: 'Servicio de limpieza sem. 27', sub: 13448.28, iva: 2151.72, tot: 15600 }], monto: 15600, ref: 'SPEI202607070007', banco: 'Santander → BBVA', aviso: 'sin_correo' },
	{ id: 'EGR-2026-00184', fecha: '2026-07-06', provId: 8, facturas: [{ num: 'FAC-2026-0450', desc: 'Suministro alimentos julio', sub: 36206.9, iva: 5793.1, tot: 42000 }, { num: 'FAC-2026-0451', desc: 'Bebidas y refrescos', sub: 21551.72, iva: 3448.28, tot: 25000 }], monto: 67000, ref: 'SPEI202607060015', banco: 'Santander → Banorte', aviso: 'enviado' },
	{ id: 'EGR-2026-00183', fecha: '2026-07-06', provId: 2, facturas: [{ num: 'FAC-2026-0447', desc: 'Distribución nacional junio', sub: 103448.28, iva: 16551.72, tot: 120000 }], monto: 120000, ref: 'SPEI202607060014', banco: 'Santander → HSBC', aviso: 'enviado' },
	{ id: 'EGR-2026-00182', fecha: '2026-07-05', provId: 7, facturas: [{ num: 'FAC-2026-0444', desc: 'Sillas ergonómicas x12', sub: 47413.79, iva: 7586.21, tot: 55000 }, { num: 'FAC-2026-0445', desc: 'Escritorios modulares x6', sub: 34482.76, iva: 5517.24, tot: 40000 }], monto: 95000, ref: 'SPEI202607050020', banco: 'Santander → Scotiabank', aviso: 'enviado' },
	{ id: 'EGR-2026-00181', fecha: '2026-07-05', provId: 3, facturas: [{ num: 'FAC-2026-0442', desc: 'Infraestructura cloud junio', sub: 75862.07, iva: 12137.93, tot: 88000 }], monto: 88000, ref: 'SPEI202607050019', banco: 'Santander → BBVA', aviso: 'error' },
	{ id: 'EGR-2026-00180', fecha: '2026-07-04', provId: 1, facturas: [{ num: 'FAC-2026-0439', desc: 'Cartuchos y tóner impresoras', sub: 18103.45, iva: 2896.55, tot: 21000 }], monto: 21000, ref: 'SPEI202607040018', banco: 'Santander → BBVA', aviso: 'enviado' },
	{ id: 'EGR-2026-00179', fecha: '2026-07-03', provId: 6, facturas: [{ num: 'FAC-2026-0435', desc: 'Auditoría financiera Q2 2026', sub: 86206.9, iva: 13793.1, tot: 100000 }], monto: 100000, ref: 'SPEI202607030017', banco: 'Santander → Banamex', aviso: 'enviado' }
];

export function createInitialFinanzasState(): FinanzasState {
	return {
		proveedores: structuredClone(proveedores),
		egresos: structuredClone(egresos),
		historial: structuredClone(historial),
		config: {
			envioAutomatico: true,
			reintentar: true,
			notificarErrores: true,
			retencionDias: 365
		},
		nextHistId: 1011,
		lastUpdated: new Date().toISOString()
	};
}
