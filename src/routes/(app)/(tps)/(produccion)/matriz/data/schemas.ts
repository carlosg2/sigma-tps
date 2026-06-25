import { z } from "zod/v4";

// Schema para la matriz de materiales por vehículo
export const matrizMaterialSchema = z.object({
	id_matriz: z.number(),
	clave_vehiculo: z.string(),
	nombre_vehiculo: z.string(),
	marca: z.string(),
	modelo: z.string(),
	anio: z.number(),
	nivel_codigo: z.string(),
	nivel_nombre: z.string(),
	norma: z.string(),
	diseno_codigo: z.string(),
	diseno_nombre: z.string(),
	categoria: z.string(),
	descripcion: z.string(),
	codigo_material: z.string(),
	especificacion: z.string(),
	cantidad: z.number().nullable(),
	unidad: z.string().nullable(),
	activo: z.boolean(),
	fecha_creacion: z.string(),
});

export type MatrizMaterial = z.output<typeof matrizMaterialSchema>;

// Schema para el historial de revisiones
export const revisionSchema = z.object({
	numero: z.number(),
	descripcion: z.string(),
	fecha: z.string(),
	usuario: z.string(),
});

export type Revision = z.output<typeof revisionSchema>;
