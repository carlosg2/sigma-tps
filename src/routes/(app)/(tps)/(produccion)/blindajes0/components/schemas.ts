import { z } from "zod";

export const schema = z.object({
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

export type Schema = z.infer<typeof schema>;

// Helper para obtener el color del badge según el costo
export function getCostoColor(costo: string): string {
	switch (costo) {
		case "Medio":
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
		case "Alto":
			return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
		case "Muy Alto":
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
	}
}
