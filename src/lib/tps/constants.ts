import type {
  UserRole, Plant, ArticleStatus, ABCClass, BOMStatus, ProjectStatus,
  GAPStatus, GAPType, GAPPriority, UdM, ArmorLevel, CostType, DecisionStatus,
  BOMMaturityStatus, ArticleType, DocumentType, ProductionProcess,
  DepartmentValidationStatus, ECNStatus, Article
} from "./types"

// --- Roles ---
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  key_user: "Key User",
  operador: "Operador",
  consultor: "Consultor Externo",
}

// --- Plantas ---
export const PLANT_LABELS: Record<Plant | "todas", string> = {
  planta_1: "Planta 1",
  planta_2: "Planta 2",
  almacen_servicios: "Almacen Servicios",
  todas: "Todas las Plantas",
}

export const PLANT_CELLS: Record<Plant, string[]> = {
  planta_1: ["Celda 1", "Celda 2", "Celda 3", "Celda 4", "Celda 5", "Celda 6", "Celda 7"],
  planta_2: ["Celda 1", "Celda 2", "Celda 3", "Celda 4"],
  almacen_servicios: ["Almacen General"],
}

// --- Articulos ---
export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  borrador: "Borrador",
  pendiente: "Pendiente",
  activo: "Activo",
  inactivo: "Inactivo",
}

export const ARTICLE_STATUS_COLORS: Record<ArticleStatus, string> = {
  borrador: "bg-muted text-muted-foreground",
  pendiente: "bg-chart-4/15 text-chart-4",
  activo: "bg-emerald-500/15 text-emerald-400",
  inactivo: "bg-destructive/15 text-destructive-foreground",
}

export const ABC_LABELS: Record<ABCClass, string> = {
  A: "A - Alto valor",
  B: "B - Medio valor",
  C: "C - Bajo valor",
  sin_clasificar: "Sin clasificar",
}

export const ABC_COLORS: Record<ABCClass, string> = {
  A: "bg-destructive/15 text-destructive-foreground",
  B: "bg-chart-4/15 text-chart-4",
  C: "bg-emerald-500/15 text-emerald-400",
  sin_clasificar: "bg-muted text-muted-foreground",
}

// --- BOMs ---
export const BOM_STATUS_LABELS: Record<BOMStatus, string> = {
  borrador: "Borrador",
  en_revision: "En Revision",
  aprobado: "Aprobado",
  obsoleto: "Obsoleto",
}

export const BOM_STATUS_COLORS: Record<BOMStatus, string> = {
  borrador: "bg-muted text-muted-foreground",
  en_revision: "bg-chart-4/15 text-chart-4",
  aprobado: "bg-emerald-500/15 text-emerald-400",
  obsoleto: "bg-destructive/15 text-destructive-foreground",
}

// --- Proyectos ---
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  cotizacion: "Cotizacion",
  anticipo: "Anticipo",
  pedido_firme: "Pedido en Firme",
  planeacion: "Planeacion",
  produccion: "Produccion",
  calidad: "Calidad",
  facturacion: "Facturacion",
  cobro: "Cobro",
  entregado: "Entregado",
  cancelado: "Cancelado",
}

export const PROJECT_STAGE_ORDER: ProjectStatus[] = [
  "cotizacion",
  "anticipo",
  "pedido_firme",
  "planeacion",
  "produccion",
  "calidad",
  "facturacion",
  "cobro",
  "entregado",
]

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  cotizacion: "bg-muted text-muted-foreground",
  anticipo: "bg-chart-1/15 text-chart-1",
  pedido_firme: "bg-chart-2/15 text-chart-2",
  planeacion: "bg-chart-4/15 text-chart-4",
  produccion: "bg-chart-1/15 text-chart-1",
  calidad: "bg-chart-3/15 text-chart-3",
  facturacion: "bg-chart-5/15 text-chart-5",
  cobro: "bg-emerald-500/15 text-emerald-400",
  entregado: "bg-emerald-500/15 text-emerald-400",
  cancelado: "bg-destructive/15 text-destructive-foreground",
}

// --- GAPs ---
export const GAP_STATUS_LABELS: Record<GAPStatus, string> = {
  pendiente: "Pendiente",
  en_progreso: "En Progreso",
  resuelto: "Resuelto",
  diferido_fase2: "Diferido Fase 2",
}

export const GAP_STATUS_COLORS: Record<GAPStatus, string> = {
  pendiente: "bg-destructive/15 text-destructive-foreground",
  en_progreso: "bg-chart-4/15 text-chart-4",
  resuelto: "bg-emerald-500/15 text-emerald-400",
  diferido_fase2: "bg-muted text-muted-foreground",
}

export const GAP_TYPE_LABELS: Record<GAPType, string> = {
  datos_maestros: "Datos Maestros",
  automatizacion: "Automatizacion",
  reporte: "Reporte",
  workflow: "Workflow",
  integracion: "Integracion",
}

export const GAP_PRIORITY_LABELS: Record<GAPPriority, string> = {
  critica: "Critica",
  alta: "Alta",
  media: "Media",
  baja: "Baja",
}

export const GAP_PRIORITY_COLORS: Record<GAPPriority, string> = {
  critica: "bg-destructive/15 text-destructive-foreground",
  alta: "bg-chart-5/15 text-chart-5",
  media: "bg-chart-4/15 text-chart-4",
  baja: "bg-muted text-muted-foreground",
}

// --- UdM ---
export const UDM_LABELS: Record<UdM, string> = {
  pieza: "Pieza",
  placa: "Placa",
  rollo: "Rollo",
  metro: "Metro",
  metro_cuadrado: "Metro cuadrado",
  kilogramo: "Kilogramo",
  litro: "Litro",
  juego: "Juego",
  par: "Par",
  caja: "Caja",
  galon: "Galon",
  tubo: "Tubo",
  yarda: "Yarda",
  pie: "Pie",
  pulgada: "Pulgada",
  libra: "Libra",
  cubeta: "Cubeta (19 lt)",
  tramo: "Tramo (15 pies)",
}

// --- Niveles de Blindaje ---
export const ARMOR_LEVEL_LABELS: Record<ArmorLevel, string> = {
  NIII: "Nivel III",
  NIII_plus: "Nivel III+",
  NIV: "Nivel IV",
  NIV_plus: "Nivel IV+",
  NV: "Nivel V",
  NVI: "Nivel VI",
  NVII: "Nivel VII",
}

// --- LMAT 2.0: Estatus de Madurez del BOM (Seccion 2.1) ---
export const BOM_MATURITY_LABELS: Record<BOMMaturityStatus, string> = {
  en_desarrollo: "En Desarrollo",
  preliminar: "Preliminar",
  estabilizado: "Estabilizado",
  liberado: "Liberado para Serie",
  obsoleto: "Obsoleto",
}

export const BOM_MATURITY_COLORS: Record<BOMMaturityStatus, string> = {
  en_desarrollo: "bg-chart-1/15 text-chart-1",
  preliminar: "bg-chart-4/15 text-chart-4",
  estabilizado: "bg-chart-2/15 text-chart-2",
  liberado: "bg-emerald-500/15 text-emerald-400",
  obsoleto: "bg-muted text-muted-foreground",
}

export const BOM_MATURITY_DESCRIPTIONS: Record<BOMMaturityStatus, string> = {
  en_desarrollo: "Prototipo - Vehiculo 1. Carga libre de materiales.",
  preliminar: "Vehiculo 2 - ~50-60% confiable. Ajustes agiles con autorizacion.",
  estabilizado: "Vehiculo 3 - Candidata a serie. Candados de LMAT activados.",
  liberado: "BOM validado por todos los departamentos. Cambios requieren ECN.",
  obsoleto: "Version anterior. Solo consulta para refacciones/siniestros.",
}

// --- LMAT 2.0: Tipo de Articulo (Seccion 8.1) ---
export const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  compra: "Compra",
  fabricacion: "Fabricacion",
  ambas: "Compra o Fabricacion",
}

export const ARTICLE_TYPE_COLORS: Record<ArticleType, string> = {
  compra: "bg-chart-2/15 text-chart-2",
  fabricacion: "bg-chart-1/15 text-chart-1",
  ambas: "bg-chart-4/15 text-chart-4",
}

// --- LMAT 2.0: Tipos de Documentos (Seccion 4.1) ---
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  dibujo_2d: "Dibujo Tecnico 2D",
  modelo_3d: "Modelo 3D",
  programa_cnc: "Programa CNC",
  imagen_referencia: "Imagen Referencia",
  plano_ensamble: "Plano de Ensamble",
  ficha_tecnica: "Ficha Tecnica Proveedor",
  certificado_calidad: "Certificado de Calidad",
  hoja_seguridad: "Hoja de Seguridad (MSDS)",
}

export const DOCUMENT_TYPE_ICONS: Record<DocumentType, string> = {
  dibujo_2d: "FileText",
  modelo_3d: "Box",
  programa_cnc: "Cpu",
  imagen_referencia: "Image",
  plano_ensamble: "LayoutTemplate",
  ficha_tecnica: "FileSpreadsheet",
  certificado_calidad: "BadgeCheck",
  hoja_seguridad: "AlertTriangle",
}

// --- LMAT 2.0: Procesos de Produccion (Seccion 6.1) ---
export const PRODUCTION_PROCESS_LABELS: Record<ProductionProcess, string> = {
  desarmado: "Desarmado",
  blindaje: "Blindaje",
  pintura: "Pintura",
  armado: "Armado",
  detallado: "Detallado",
}

export const PRODUCTION_PROCESS_COLORS: Record<ProductionProcess, string> = {
  desarmado: "bg-chart-1/15 text-chart-1",
  blindaje: "bg-chart-2/15 text-chart-2",
  pintura: "bg-chart-3/15 text-chart-3",
  armado: "bg-chart-4/15 text-chart-4",
  detallado: "bg-chart-5/15 text-chart-5",
}

export const PRODUCTION_PROCESS_ORDER: ProductionProcess[] = [
  "desarmado",
  "blindaje",
  "pintura",
  "armado",
  "detallado",
]

// --- LMAT 2.0: Estado de Validacion Departamental (Seccion 5.2) ---
export const DEPT_VALIDATION_LABELS: Record<DepartmentValidationStatus, string> = {
  pendiente: "Pendiente",
  en_revision: "En Revision",
  completado: "Completado",
  rechazado: "Rechazado",
  bloqueado: "Bloqueado",
}

export const DEPT_VALIDATION_COLORS: Record<DepartmentValidationStatus, string> = {
  pendiente: "bg-muted text-muted-foreground",
  en_revision: "bg-chart-4/15 text-chart-4",
  completado: "bg-emerald-500/15 text-emerald-400",
  rechazado: "bg-destructive/15 text-destructive-foreground",
  bloqueado: "bg-chart-5/15 text-chart-5",
}

// --- LMAT 2.0: ECN Status (Seccion 2.3) ---
export const ECN_STATUS_LABELS: Record<ECNStatus, string> = {
  solicitud: "Solicitud",
  analisis: "Analisis de Impacto",
  aprobacion: "En Aprobacion",
  aplicacion: "En Aplicacion",
  completado: "Completado",
  rechazado: "Rechazado",
}

export const ECN_STATUS_COLORS: Record<ECNStatus, string> = {
  solicitud: "bg-chart-1/15 text-chart-1",
  analisis: "bg-chart-4/15 text-chart-4",
  aprobacion: "bg-chart-2/15 text-chart-2",
  aplicacion: "bg-chart-3/15 text-chart-3",
  completado: "bg-emerald-500/15 text-emerald-400",
  rechazado: "bg-destructive/15 text-destructive-foreground",
}

// --- LMAT 2.0: Departamentos para validacion ---
export const VALIDATION_DEPARTMENTS = [
  "Ingenieria",
  "Manufactura",
  "Compras",
  "Almacen",
  "Calidad",
  "Contabilidad",
]

// --- LMAT 2.0: Almacenes ---
export const WAREHOUSES = [
  "MP - Materia Prima",
  "Servicios",
  "Maquilados",
  "Consignacion",
]

// --- LMAT 2.0: Metodos de surtimiento ---
export const SUPPLY_METHODS = {
  bom_kit: "Por BOM/Kit",
  kanban: "Por Gaveta/Kanban",
  solicitud: "Por Solicitud",
}

// --- Costos ---
export const COST_TYPE_LABELS: Record<CostType, string> = {
  material: "Material",
  mano_obra: "Mano de Obra",
  gif: "Gastos Indirectos",
  servicio_tercero: "Servicio de Terceros",
}

// --- Decisiones ---
export const DECISION_STATUS_LABELS: Record<DecisionStatus, string> = {
  pendiente: "Pendiente",
  decidido: "Decidido",
  diferido: "Diferido",
}

// --- Modelos de vehiculos comunes ---
export const VEHICLE_MODELS = [
  "Toyota Land Cruiser 300",
  "Toyota Hilux",
  "Toyota Tacoma",
  "Chevrolet Suburban",
  "Chevrolet Tahoe",
  "Chevrolet Silverado",
  "Ford Explorer",
  "Ford Expedition",
  "Ford F-150",
  "Jeep Grand Cherokee",
  "Dodge Ram 1500",
  "GMC Yukon",
  "Nissan Patrol",
]

// --- Areas ---
export const AREAS = [
  "Ingenieria",
  "Compras",
  "Almacen",
  "Produccion",
  "Calidad",
  "Finanzas",
  "Ventas",
  "TI",
  "Recursos Humanos",
  "Direccion",
  "Logistica",
  "Servicio Postventa",
]

// --- Grupos de articulos ---
export const ARTICLE_GROUPS = [
  "Acero Balistico",
  "Cristales Blindados",
  "Material Balistico",
  "Tornilleria y Sujeciones",
  "Adhesivos y Selladores",
  "Pintura y Acabados",
  "Vestidura Interior",
  "Sistema Electrico",
  "Sistema Hidraulico",
  "Run Flat",
  "Herrajes y Bisagras",
  "Varios",
]

// --- Campos obligatorios por area ---
export const REQUIRED_FIELDS_BY_AREA: Record<string, (keyof Article)[]> = {
  Ingenieria: ["description", "udmBase", "group"],
  Compras: ["supplierId", "price", "udmPurchase", "leadTimeDays"],
  Almacen: ["location", "udmStorage"],
  Produccion: ["udmProduction"],
  Calidad: ["qualityGroup"],
}
