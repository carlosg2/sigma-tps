import { z } from "zod";

// Schema para la configuración del blindaje
export const configuradorSchema = z.object({
  // Configuraciones principales (combos)
  nivelProteccion: z.enum(["III", "IIIA", "IV", "IV-PLUS"]),
  tipoBlindaje: z.enum(["acero", "ceramico", "aramida"]),
  suspensionReforzada: z.enum(["estandar", "neumatica", "hidraulica"]),
  cristalesEspeciales: z.enum(["32mm", "38mm", "42mm"]),
  
  // Opciones adicionales (checkboxes)
  rollBarTecho: z.boolean().default(false),
  proteccionBateria: z.boolean().default(false),
  runFlatTires: z.boolean().default(false),
  proteccionTanque: z.boolean().default(false),
  cortinaCubreEquipaje: z.boolean().default(false),
  sistemaAudio: z.boolean().default(false),
  proteccionComputadora: z.boolean().default(false),
  defensaReforzada: z.boolean().default(false),
});

// Schema para la cotización final generada
export const cotizacionFinalSchema = z.object({
  // Información de la solicitud original
  solicitudId: z.string(),
  clienteInfo: z.object({
    cliente: z.string(),
    nombre: z.string(),
    telefono: z.string(),
    email: z.string().optional(),
  }),
  vehiculoInfo: z.object({
    marca: z.string(),
    modelo: z.string(),
    año: z.string(),
    uso: z.string(),
    amenazas: z.string(),
    cobertura: z.string(),
  }),
  
  // Configuración seleccionada
  configuracion: configuradorSchema,
  
  // Precios calculados
  precios: z.object({
    subtotal: z.number(),
    iva: z.number(),
    total: z.number(),
    pesoAproximadoBlindaje: z.number(), // en kg
  }),
  
  // Fecha de generación
  fechaGeneracion: z.string(),
  
  // Lista de materiales detallada
  listaMateriales: z.array(z.object({
    categoria: z.string(),
    descripcion: z.string(),
    cantidad: z.number().optional(),
    unidad: z.string().optional(),
    precioUnitario: z.number(),
    importe: z.number(),
  }))
});

// Definición de tipos
export type ConfiguradorData = z.infer<typeof configuradorSchema>;
export type CotizacionFinal = z.infer<typeof cotizacionFinalSchema>;

// Catálogo de componentes estándar para generar lista de materiales
export const catalogoComponentes = {
  "III": {
    pesoBlindaje: 450,
    componentes: [
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "TECHO", precioUnitario: 25000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "MARCO DE PARABRISAS", precioUnitario: 15000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "POSTES", precioUnitario: 35000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "PISO", precioUnitario: 40000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "PUERTAS DELANTERAS", precioUnitario: 30000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "PUERTAS TRASERAS", precioUnitario: 28000 },
    ]
  },
  "IIIA": {
    pesoBlindaje: 520,
    componentes: [
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "TECHO REFORZADO", precioUnitario: 32000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "MARCO DE PARABRISAS", precioUnitario: 18000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "POSTES REFORZADOS", precioUnitario: 42000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "PISO MULTICAPA", precioUnitario: 48000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "PUERTAS DELANTERAS", precioUnitario: 38000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "PUERTAS TRASERAS", precioUnitario: 35000 },
    ]
  },
  "IV": {
    pesoBlindaje: 650,
    componentes: [
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "TECHO", precioUnitario: 38000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "ROLL BAR EN TECHO", precioUnitario: 25000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "MARCO DE PARABRISAS", precioUnitario: 22000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "POSTES", precioUnitario: 48000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "PISO", precioUnitario: 55000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "PUERTAS DELANTERAS", precioUnitario: 45000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "PUERTAS TRASERAS", precioUnitario: 42000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "PARED DE FUEGO", precioUnitario: 18000 },
    ]
  },
  "IV-PLUS": {
    pesoBlindaje: 750,
    componentes: [
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "TECHO", precioUnitario: 45000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "ROLL BAR EN TECHO", precioUnitario: 35000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "MARCO DE PARABRISAS", precioUnitario: 28000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "POSTES", precioUnitario: 58000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "PISO", precioUnitario: 65000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "COSTADOS DE PISO", precioUnitario: 25000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "PUERTAS DELANTERAS", precioUnitario: 52000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "PUERTAS TRASERAS", precioUnitario: 48000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "PARED DE FUEGO", precioUnitario: 22000 },
      { categoria: "BLINDAJE ESTRUCTURAL", descripcion: "TANQUE DE COMBUSTIBLE", precioUnitario: 35000 },
    ]
  }
};
