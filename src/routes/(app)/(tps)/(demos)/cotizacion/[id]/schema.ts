import { z } from "zod";

// Esquema para información general del vehículo (carga inicial - campos opcionales)
export const step1Schema = z.object({
  // Datos del cliente
  cliente: z.string().min(1, "El ID del cliente es requerido"),
  compania: z.string().optional().or(z.literal("")),
  cliente_nombre: z.string().min(1, "El nombre del cliente es requerido"),
  cliente_telefono: z.string().min(1, "El teléfono es requerido"),
  cliente_email: z.string().email("Email no válido").optional().or(z.literal("")),
  
  // Datos básicos del vehículo - opcionales inicialmente para evitar validación prematura
  marca: z.string().optional().or(z.literal("")),
  modelo: z.string().optional().or(z.literal("")),
  año: z.string().optional().or(z.literal("")),
  
  // Información de seguridad
  uso: z.enum(["Personal", "Ejecutivo", "Valores"]).optional(),
  amenazas: z.enum(["Arma corta", "Arma Larga", "Explosivos"]).optional(),
  cobertura: z.enum(["Conductor", "Pasajeros", "Total"]).optional(),
  requisitos: z.string().optional().or(z.literal("")),
  ubicacion: z.string().optional().or(z.literal("")),
});

// Esquema estricto para validación final (envío del formulario)
export const step1SchemaFinal = z.object({
  // Datos del cliente (mismas validaciones)
  cliente: z.string().min(1, "El ID del cliente es requerido"),
  compania: z.string().optional().or(z.literal("")),
  cliente_nombre: z.string().min(1, "El nombre del cliente es requerido"),
  cliente_telefono: z.string().min(1, "El teléfono es requerido"),
  cliente_email: z.string().email("Email no válido").optional().or(z.literal("")),
  
  // Datos básicos del vehículo - REQUERIDOS para el envío final
  marca: z.string().min(1, "La marca es requerida"),
  modelo: z.string().min(1, "El modelo es requerido"),
  año: z.string().min(4, "El año debe tener 4 dígitos").regex(/^\d{4}$/, "El año debe ser un número de 4 dígitos"),
  
  // Información de seguridad (mismas validaciones)
  uso: z.enum(["Personal", "Ejecutivo", "Valores"]).optional(),
  amenazas: z.enum(["Arma corta", "Arma Larga", "Explosivos"]).optional(),
  cobertura: z.enum(["Conductor", "Pasajeros", "Total"]).optional(),
  requisitos: z.string().optional().or(z.literal("")),
  ubicacion: z.string().optional().or(z.literal("")),
});

export type VehicleRequestSchema = typeof step1Schema;
export type VehicleRequestSchemaFinal = typeof step1SchemaFinal;
