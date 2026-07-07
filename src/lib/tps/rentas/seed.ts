import type { RentasState, Cotizacion, Compliance } from './types';
import { EXTRAS, DOCUMENTOS_OBLIGATORIOS, offsetDate } from './constants';

function nuevaCompliance(cliente: string): Compliance {
	return {
		cliente,
		riesgo: 'bajo',
		antifraude: 'Pendiente',
		expediente: 'Pendiente',
		calidad: 'Sin revisar',
		liberacion: 'Bloqueada',
		documentos: DOCUMENTOS_OBLIGATORIOS.map((d) => ({ nombre: d, estatus: 'Pendiente', obs: '' })),
		bitacora: []
	};
}

export function createInitialRentasState(): RentasState {
	const cotizaciones: Cotizacion[] = [];
	const compliance: Record<string, Compliance> = {};

	// Cotizacion 1 — flujo casi completo (falta liberacion)
	cotizaciones.push({
		folio: 'RNT-0001',
		version: 'v02',
		cliente: 'Grupo Alfa',
		vin: 'VIN-AX90',
		fechaInicio: offsetDate(3),
		fechaFin: offsetDate(10),
		dias: 7,
		tarifa: 22000,
		extras: [EXTRAS[0], EXTRAS[1]],
		baseTotal: 7 * 22000,
		extrasTotal: 7 * (EXTRAS[0].precio + EXTRAS[1].precio),
		total: 7 * 22000 + 7 * (EXTRAS[0].precio + EXTRAS[1].precio),
		disponibilidadOk: true,
		historial: [
			{ version: 'v01', total: 7 * 20000, fecha: '05 Jul, 10:15', cliente: 'Grupo Alfa', vin: 'VIN-AX90' }
		]
	});
	const comp1 = nuevaCompliance('Grupo Alfa');
	comp1.antifraude = 'Limpio';
	comp1.documentos.forEach((d, i) => {
		if (i < 6) d.estatus = 'Validado';
	});
	comp1.expediente = 'Pendiente';
	comp1.bitacora.push(
		{ msg: 'Cotización v01 creada.', tipo: 'info', fecha: '05 Jul, 10:15' },
		{ msg: 'Antifraude OK: "Grupo Alfa" sin registros negativos.', tipo: 'success', fecha: '05 Jul, 11:02' },
		{ msg: 'Nueva versión v02 generada tras ajuste de tarifa.', tipo: 'info', fecha: '05 Jul, 14:30' },
		{ msg: '6 de 7 documentos validados. Pendiente: Actas de asamblea.', tipo: 'info', fecha: '06 Jul, 09:10' }
	);
	compliance['RNT-0001'] = comp1;

	// Cotizacion 2 — solo captura
	cotizaciones.push({
		folio: 'RNT-0002',
		version: 'v01',
		cliente: 'Gobierno de NL',
		vin: 'VIN-CH33',
		fechaInicio: offsetDate(14),
		fechaFin: offsetDate(21),
		dias: 7,
		tarifa: 15000,
		extras: [EXTRAS[3]],
		baseTotal: 7 * 15000,
		extrasTotal: 7 * EXTRAS[3].precio,
		total: 7 * 15000 + 7 * EXTRAS[3].precio,
		disponibilidadOk: true,
		historial: []
	});

	// Cotizacion 3 — flujo 100% completo (liberada)
	cotizaciones.push({
		folio: 'RNT-0003',
		version: 'v01',
		cliente: 'Constructora Coppel',
		vin: 'VIN-BM11',
		fechaInicio: offsetDate(-5),
		fechaFin: offsetDate(-1),
		dias: 4,
		tarifa: 19500,
		extras: [EXTRAS[0], EXTRAS[4]],
		baseTotal: 4 * 19500,
		extrasTotal: 4 * (EXTRAS[0].precio + EXTRAS[4].precio),
		total: 4 * 19500 + 4 * (EXTRAS[0].precio + EXTRAS[4].precio),
		disponibilidadOk: true,
		historial: []
	});
	const comp3 = nuevaCompliance('Constructora Coppel');
	comp3.antifraude = 'Limpio';
	comp3.documentos.forEach((d) => (d.estatus = 'Validado'));
	comp3.expediente = 'Completo';
	comp3.calidad = 'Aprobado';
	comp3.liberacion = 'Liberada';
	comp3.bitacora.push(
		{ msg: 'Cotización creada.', tipo: 'info', fecha: '01 Jul, 08:00' },
		{ msg: 'Antifraude OK.', tipo: 'success', fecha: '01 Jul, 09:15' },
		{ msg: 'Expediente completo — 7/7 documentos validados.', tipo: 'success', fecha: '01 Jul, 11:00' },
		{ msg: 'Calidad: expediente APROBADO.', tipo: 'success', fecha: '01 Jul, 12:30' },
		{ msg: '🟢 Unidad liberada. Stop-Gate superado.', tipo: 'success', fecha: '01 Jul, 12:31' }
	);
	compliance['RNT-0003'] = comp3;

	return {
		cotizaciones,
		compliance,
		cotizacionActiva: null,
		nextFolio: 4,
		lastUpdated: new Date().toISOString()
	};
}
