import { z } from "zod";
import { MEGABYTE } from '$lib/components/extras/file-drop-zone';

// Esquema para información general del vehículo
export const step1Schema = z.object({
  // Datos del cliente
  cliente_nombre: z.string().min(1, "El nombre del cliente es requerido"),
  cliente_telefono: z.string().min(1, "El teléfono es requerido"),
  cliente_email: z.string().email("Email no válido").optional().or(z.literal("")),
  
  // Datos básicos del vehículo
  marca: z.string().min(1, "La marca es requerida"),
  modelo: z.string().min(1, "El modelo es requerido"),
  año: z.string().min(4, "El año debe tener 4 dígitos"),
  numero_serie: z.string().min(1, "El número de serie es requerido"),
  placas: z.string().min(1, "Las placas son requeridas"),
  color: z.string().min(1, "El color es requerido"),
  kilometraje: z.string().min(1, "El kilometraje es requerido"),
});

// Esquema para condición externa del vehículo
export const step2Schema = step1Schema.extend({
  // Carrocería
  carroceria_estado: z.enum(["excelente", "bueno", "regular", "malo"], {
    required_error: "Selecciona el estado de la carrocería"
  }).default('' as 'excelente'),
  carroceria_observaciones: z.string().optional(),
  carroceria_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
  
  // Pintura
  pintura_estado: z.enum(["excelente", "bueno", "regular", "malo"], {
    required_error: "Selecciona el estado de la pintura"
  }).default('' as 'excelente'),
  pintura_observaciones: z.string().optional(),
  pintura_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
  
  // Cristales
  cristales_estado: z.enum(["excelente", "bueno", "regular", "malo"], {
    required_error: "Selecciona el estado de los cristales"
  }).default('' as 'excelente'),
  cristales_observaciones: z.string().optional(),
  cristales_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
  
  // Llantas y rines
  llantas_estado: z.enum(["excelente", "bueno", "regular", "malo"], {
    required_error: "Selecciona el estado de las llantas"
  }).default('' as 'excelente'),
  llantas_observaciones: z.string().optional(),
  llantas_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
});

// Esquema para condición interna del vehículo
export const step3Schema = step2Schema.extend({
  // Asientos
  asientos_estado: z.enum(["excelente", "bueno", "regular", "malo"], {
    required_error: "Selecciona el estado de los asientos"
  }).default('' as 'excelente'),
  asientos_observaciones: z.string().optional(),
  asientos_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
  
  // Tablero
  tablero_estado: z.enum(["excelente", "bueno", "regular", "malo"], {
    required_error: "Selecciona el estado del tablero"
  }).default('' as 'excelente'),
  tablero_observaciones: z.string().optional(),
  tablero_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
  
  // Tapicería
  tapiceria_estado: z.enum(["excelente", "bueno", "regular", "malo"], {
    required_error: "Selecciona el estado de la tapicería"
  }).default('' as 'excelente'),
  tapiceria_observaciones: z.string().optional(),
  tapiceria_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
  
  // Aire acondicionado
  aire_acondicionado_estado: z.enum(["excelente", "bueno", "regular", "malo"], {
    required_error: "Selecciona el estado del aire acondicionado"
  }).default('' as 'excelente'),
  aire_acondicionado_observaciones: z.string().optional(),
  aire_acondicionado_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
});

// Esquema para motor y mecánica
export const step4Schema = step3Schema.extend({
  // Motor
  motor_estado: z.enum(["excelente", "bueno", "regular", "malo"], {
    required_error: "Selecciona el estado del motor"
  }).default('' as 'excelente'),
  motor_observaciones: z.string().optional(),
  motor_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
  
  // Transmisión
  transmision_estado: z.enum(["excelente", "bueno", "regular", "malo"], {
    required_error: "Selecciona el estado de la transmisión"
  }).default('' as 'excelente'),
  transmision_observaciones: z.string().optional(),
  transmision_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
  
  // Frenos
  frenos_estado: z.enum(["excelente", "bueno", "regular", "malo"], {
    required_error: "Selecciona el estado de los frenos"
  }).default('' as 'excelente'),
  frenos_observaciones: z.string().optional(),
  frenos_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
  
  // Suspensión
  suspension_estado: z.enum(["excelente", "bueno", "regular", "malo"], {
    required_error: "Selecciona el estado de la suspensión"
  }).default('' as 'excelente'),
  suspension_observaciones: z.string().optional(),
  suspension_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
});

// Esquema para accesorios y elementos adicionales
export const step5Schema = step4Schema.extend({
  // Estéreo
  estereo_presente: z.boolean().default(false),
  estereo_estado: z.enum(["excelente", "bueno", "regular", "malo"]).default('' as 'excelente'),
  estereo_observaciones: z.string().optional(),
  estereo_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
  
  // Gato y herramientas
  gato_presente: z.boolean().default(false),
  gato_estado: z.enum(["excelente", "bueno", "regular", "malo"]).default('' as 'excelente'),
  gato_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
  
  // Llanta de refacción
  refaccion_presente: z.boolean().default(false),
  refaccion_estado: z.enum(["excelente", "bueno", "regular", "malo"]).default('' as 'excelente'),
  refaccion_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
  
  // Triángulos de seguridad
  triangulos_presente: z.boolean().default(false),
  triangulos_estado: z.enum(["excelente", "bueno", "regular", "malo"]).default('' as 'excelente'),
  triangulos_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
  
  // Manual del propietario
  manual_presente: z.boolean().default(false),
  manual_estado: z.enum(["excelente", "bueno", "regular", "malo"]).default('' as 'excelente'),
  manual_fotos: z.array(z.instanceof(File).refine(
    (file) => file.size <= MEGABYTE * 5,
    { message: "El tamaño del archivo debe ser menor a 5MB" }
  )).optional().default([]),
  
  // Otros accesorios
  otros_accesorios: z.string().optional(),
});

// Esquema final con documentos y observaciones generales
export const step6Schema = step5Schema.extend({
  // Documentos
  tarjeta_circulacion: z.boolean().default(false),
  factura_presente: z.boolean().default(false),
  verificacion_presente: z.boolean().default(false),
  seguro_presente: z.boolean().default(false),
  
  // Observaciones generales
  observaciones_generales: z.string().optional(),
  
  // Condición general del vehículo
  condicion_general: z.enum(["excelente", "bueno", "regular", "malo"], {
    required_error: "Selecciona la condición general del vehículo"
  }).default('' as 'excelente'),
  
  // Responsable de la recepción
  responsable_recepcion: z.string().min(1, "El responsable de recepción es requerido"),
  fecha_recepcion: z.string().min(1, "La fecha de recepción es requerida"),
});

export type VehicleReceptionSchema = typeof step6Schema;
