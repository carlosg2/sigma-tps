import { z } from "zod/v4";

// Schema para vehículos de la API spTPSVehiculoLista
export const vehiculoSchema = z.object({
	clave_vehiculo: z.string(),
	marca: z.string(),
	modelo: z.string(),
	version: z.string(),
	año: z.number(),
	motor_tipo: z.string(),
	motor_cilindrada: z.number(),
	motor_potencia_hp: z.number(),
	motor_torque_nm: z.number(),
	transmision: z.string(),
	traccion: z.string(),
	largo_mm: z.number(),
	ancho_mm: z.number(),
	alto_mm: z.number(),
	peso_original_kg: z.number(),
	capacidad_tanque_litros: z.number(),
	activo: z.boolean(),
});

export type Vehiculo = z.output<typeof vehiculoSchema>;
