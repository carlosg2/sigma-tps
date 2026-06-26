import { z } from "zod/v4";

export const nivelBlindajeSchema = z.object({
	id_nivel: z.number(),
	nivel_codigo: z.string(),
	nivel_nombre: z.string(),
	estandar_certificacion: z.string(),
	proteccion_contra: z.string(),
	materiales: z.string(),
	peso_total_vehiculo_kg: z.number(),
	aplicacion: z.string(),
	costo_relativo: z.string(),
	disponible_ultraligero: z.boolean(),
	activo: z.boolean(),
});

export type NivelBlindaje = z.output<typeof nivelBlindajeSchema>;
