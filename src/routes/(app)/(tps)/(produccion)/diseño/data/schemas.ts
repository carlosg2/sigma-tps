import { z } from "zod/v4";

export const disenoBlindajeSchema = z.object({
	id_diseno: z.number(),
	diseno_codigo: z.string(),
	diseno_nombre: z.string(),
	descripcion: z.string(),
	areas_blindadas: z.string(),
	peso_aproximado_kg: z.number(),
	tiempo_fabricacion_semanas: z.number(),
	nivel_complejidad: z.string(),
	costo_relativo: z.string(),
	activo: z.boolean(),
});

export type DisenoBlindaje = z.output<typeof disenoBlindajeSchema>;
