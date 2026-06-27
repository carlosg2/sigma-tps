// ============================================================
// TPS ERP - Tipos principales (LMAT 2.0)
// ============================================================

// --- Enums ---

export type UserRole = "admin" | "gerente" | "key_user" | "operador" | "consultor"

export type Plant = "planta_1" | "planta_2" | "almacen_servicios"

export type ArticleStatus = "borrador" | "pendiente" | "activo" | "inactivo"

export type ABCClass = "A" | "B" | "C" | "sin_clasificar"

// LMAT 2.0: Estatus de Madurez del BOM (Seccion 2.1)
export type BOMMaturityStatus =
  | "en_desarrollo"     // Prototipo - vehiculo 1, carga libre
  | "preliminar"        // Vehiculo 2 - 50-60% confiable
  | "estabilizado"      // Vehiculo 3 - candidata a serie
  | "liberado"          // Validado por todos los departamentos
  | "obsoleto"          // Version anterior - solo consulta

export type BOMStatus = "borrador" | "en_revision" | "aprobado" | "obsoleto"

export type ProjectStatus =
  | "cotizacion"
  | "anticipo"
  | "pedido_firme"
  | "planeacion"
  | "produccion"
  | "calidad"
  | "facturacion"
  | "cobro"
  | "entregado"
  | "cancelado"

export type GAPStatus = "pendiente" | "en_progreso" | "resuelto" | "diferido_fase2"

export type GAPType = "datos_maestros" | "automatizacion" | "reporte" | "workflow" | "integracion"

export type GAPPriority = "critica" | "alta" | "media" | "baja"

export type CostType = "material" | "mano_obra" | "gif" | "servicio_tercero"

export type DecisionStatus = "pendiente" | "decidido" | "diferido"

export type UdM =
  | "pieza"
  | "placa"
  | "rollo"
  | "metro"
  | "metro_cuadrado"
  | "kilogramo"
  | "litro"
  | "juego"
  | "par"
  | "caja"
  | "galon"
  | "tubo"
  | "yarda"
  | "pie"
  | "pulgada"
  | "libra"
  | "cubeta"
  | "tramo"

export type ArmorLevel = "NIII" | "NIII_plus" | "NIV" | "NIV_plus" | "NV" | "NVI" | "NVII"

// LMAT 2.0: Tipo de articulo (Seccion 8.1)
export type ArticleType = "compra" | "fabricacion" | "ambas"

// LMAT 2.0: Tipos de documentos (Seccion 4.1)
export type DocumentType =
  | "dibujo_2d"          // PDF / DWG - AutoCAD
  | "modelo_3d"          // STEP / SLDPRT - SolidWorks
  | "programa_cnc"       // DXF / STEP - Archivo de corte
  | "imagen_referencia"  // JPG / PNG
  | "plano_ensamble"     // PDF - Explosionado
  | "ficha_tecnica"      // PDF - Proveedor
  | "certificado_calidad" // PDF - Por lote
  | "hoja_seguridad"     // MSDS

// LMAT 2.0: Permisos de documentos (Seccion 3.1)
export type DocumentPermission = "solo_visualizar" | "visualizar_descargar" | "edicion"

// LMAT 2.0: Procesos de produccion (Seccion 6.1)
export type ProductionProcess =
  | "desarmado"
  | "blindaje"
  | "pintura"
  | "armado"
  | "detallado"

// LMAT 2.0: Estado de validacion por departamento (Seccion 5.2)
export type DepartmentValidationStatus =
  | "pendiente"
  | "en_revision"
  | "completado"
  | "rechazado"
  | "bloqueado"

// LMAT 2.0: Estado del ECN (Seccion 2.3)
export type ECNStatus =
  | "solicitud"
  | "analisis"
  | "aprobacion"
  | "aplicacion"
  | "completado"
  | "rechazado"

// --- Entidades ---

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  area: string
  plant: Plant
  avatarInitials: string
}

export interface UdMConversion {
  from: UdM
  to: UdM
  factor: number
}

// LMAT 2.0: Documento vinculado (Seccion 4.2)
export interface ArticleDocument {
  id: string
  articleId: string
  type: DocumentType
  fileName: string
  fileUrl: string
  version: number
  uploadedBy: string
  uploadedAt: string
  changeReason: string
  permissions: Record<string, DocumentPermission> // por area
}

// LMAT 2.0: Proveedor alternativo por articulo (Seccion 3.1)
export interface ArticleSupplier {
  id: string
  articleId: string
  supplierId: string
  supplierName: string
  supplierCode: string // codigo alterno del proveedor
  price: number
  currency: "MXN" | "USD" | "EUR"
  leadTimeDays: number
  isPrimary: boolean
  isApproved: boolean // aprobado por calidad
}

export interface Article {
  id: string
  code: string
  description: string
  descriptionGeneric: string // LMAT 2.0: descripcion generica para alta rotacion
  // LMAT 2.0: Tipo de articulo (Seccion 8.1)
  articleType: ArticleType
  // Ingenieria
  udmBase: UdM
  udmBOM: UdM // LMAT 2.0: UdM especifica para BOM
  drawingRef: string
  group: string
  family: string // LMAT 2.0: familia de articulos
  // Compras
  supplierId: string
  supplierName: string
  price: number
  currency: "MXN" | "USD"
  udmPurchase: UdM
  leadTimeDays: number
  // LMAT 2.0: Multi-proveedor
  suppliers: ArticleSupplier[]
  // Almacen
  location: string
  warehouse: string // LMAT 2.0: almacen (MP, Servicios, Maquilados, Consignacion)
  udmStorage: UdM
  minStock: number
  maxStock: number
  reorderPoint: number // LMAT 2.0: punto de reorden
  supplyMethod: "bom_kit" | "kanban" | "solicitud" // LMAT 2.0: metodo de surtimiento
  requiresLotSerial: boolean // LMAT 2.0: requiere lote/serie
  // Produccion
  route: string
  workCenter: string
  udmProduction: UdM
  // LMAT 2.0: Ruta de produccion (si es fabricacion)
  productionRoute: ProductionRouteStep[]
  subBOMId: string | null // LMAT 2.0: sub-BOM si tiene
  cncProgramId: string | null // LMAT 2.0: programa CNC asociado
  // Calidad
  qualityGroup: string
  inspectionRequired: boolean
  qualityApproved: boolean // LMAT 2.0: bandera de liberacion
  // Costeo (LMAT 2.0 Seccion 7)
  costCenter: string
  costMethod: "promedio" | "especifico"
  // Sistema
  abcClass: ABCClass
  status: ArticleStatus
  completeness: number // 0-100
  conversions: UdMConversion[]
  plant: Plant
  p5Code: string // codigo alterno P5
  // LMAT 2.0: Documentos vinculados
  documents: ArticleDocument[]
  // LMAT 2.0: Imagen de referencia
  imageUrl: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

// LMAT 2.0: Paso de ruta de produccion (Seccion 6.1)
export interface ProductionRouteStep {
  id: string
  operation: number
  process: ProductionProcess
  workCenter: string
  standardTime: number // minutos
  description: string
}

export interface BOMComponent {
  id: string
  articleId: string
  articleCode: string
  articleDescription: string
  quantity: number
  udm: UdM
  cell: string // e.g. "Celda 1", "Celda 2"
  operation: string
  notes: string
  hasCompleteData: boolean // si el articulo tiene todos los campos
  // Jerarquia (flat storage)
  parentId: string | null // null = raiz, string = id del componente padre
  order: number // orden dentro del nivel (para drag & drop)
  level: number // profundidad en el arbol (0 = raiz)
  isKit: boolean // true = es un kit/ensamble que contiene otros componentes
}

export interface BOMRevision {
  id: string
  bomId: string
  version: number
  changedBy: string
  changedAt: string
  changeReason: string
  componentsSnapshot: BOMComponent[]
  diff: BOMDiff[]
}

export interface BOMDiff {
  type: "added" | "removed" | "modified"
  articleCode: string
  articleDescription: string
  field?: string
  oldValue?: string
  newValue?: string
}

export interface BOM {
  id: string
  specificationCode: string
  vehicleModel: string
  armorLevel: ArmorLevel
  plant: Plant
  version: number
  status: BOMStatus
  // LMAT 2.0: Estatus de madurez (Seccion 2.1)
  maturityStatus: BOMMaturityStatus
  components: BOMComponent[]
  revisions: BOMRevision[]
  healthPercent: number // % componentes con datos completos
  // LMAT 2.0: Validacion multi-departamental (Seccion 5.2)
  departmentValidations: DepartmentValidation[]
  // LMAT 2.0: Especificacion tecnica vinculada
  specificationId: string | null
  // LMAT 2.0: Rutas de produccion por planta (Seccion 6.2)
  plantRoutes: PlantRoute[]
  // LMAT 2.0: Kits de corte asociados
  cuttingKitIds: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

// LMAT 2.0: Validacion por departamento (Seccion 5.2)
export interface DepartmentValidation {
  department: string
  status: DepartmentValidationStatus
  validatedBy: string | null
  validatedAt: string | null
  notes: string
}

// LMAT 2.0: Ruta de produccion por planta (Seccion 6.2)
export interface PlantRoute {
  plant: Plant
  cells: string[]
  isActive: boolean
}

// LMAT 2.0: Especificacion Tecnica (Seccion 3.2)
export interface TechnicalSpecification {
  id: string
  code: string
  brand: string // GMC, Chevrolet, Audi, Ford, Dina...
  model: string // Suburban, Tahoe, Q7, Mamba...
  year: string
  armorLevel: ArmorLevel
  designType: "alto_volumen" | "bajo_volumen" | "tactico"
  version: number
  status: BOMMaturityStatus
  // Contenido tecnico
  protectionByZone: ProtectionZone[]
  specialComponents: string[] // cristales con espesores
  optionalAccessories: string[]
  // BOMs asociados
  bomIds: string[]
  // Rutas de produccion
  productionRoutes: PlantRoute[]
  // Kits de corte (~15 por especificacion)
  cuttingKits: CuttingKit[]
  // Documentos
  documents: ArticleDocument[]
  // Historial
  changeHistory: SpecificationChange[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

// LMAT 2.0: Zona de proteccion
export interface ProtectionZone {
  zone: string // techo, puertas, motor, perimetros, piso
  thickness: string
  material: string
  overlapType: string
}

// LMAT 2.0: Kit de corte (Seccion 8.2)
export interface CuttingKit {
  id: string
  name: string
  specificationId: string
  cncProgramVersion: string
  cncProgramUrl: string
  components: BOMComponent[] // mini-LMAT
  usedInFolios: string[] // trazabilidad
  createdAt: string
  updatedAt: string
}

// LMAT 2.0: Cambio en especificacion
export interface SpecificationChange {
  id: string
  changedBy: string
  changedAt: string
  changeType: string
  description: string
}

// LMAT 2.0: ECN - Engineering Change Notice (Seccion 2.3)
export interface ECN {
  id: string
  code: string
  status: ECNStatus
  requestedBy: string
  requestedAt: string
  justification: string
  // Impacto
  affectedBOMIds: string[]
  affectedArticleIds: string[]
  affectedFolios: string[] // vehiculos en linea afectados
  inventoryImpact: string // hay inventario del componente anterior?
  // Aprobaciones
  approvals: ECNApproval[]
  // Aplicacion
  effectivity: string // "A partir del folio XXX" / "Retroactivo"
  appliedAt: string | null
  appliedBy: string | null
  // Cambios
  changes: ECNChange[]
  // Notificaciones
  notifiedAreas: string[]
  createdAt: string
  updatedAt: string
}

export interface ECNApproval {
  department: string
  approvedBy: string | null
  approvedAt: string | null
  status: "pendiente" | "aprobado" | "rechazado"
  notes: string
}

export interface ECNChange {
  type: "agregar" | "eliminar" | "modificar"
  articleId: string
  articleCode: string
  field: string
  oldValue: string
  newValue: string
}

// LMAT 2.0: Kit de Surtimiento (Seccion 3.3)
export interface SupplyKit {
  id: string
  process: ProductionProcess
  cell: string
  folio: string // VIN del vehiculo
  specificationId: string
  bomId: string
  // Componentes del kit
  items: SupplyKitItem[]
  // Estado
  status: "pendiente" | "en_preparacion" | "listo" | "entregado" | "parcial"
  // Validaciones
  preparedBy: string | null
  preparedAt: string | null
  deliveredTo: string | null
  deliveredAt: string | null
  supervisorConfirmed: boolean
  // Backorder
  hasBackorder: boolean
  backorderNotes: string
  createdAt: string
}

export interface SupplyKitItem {
  id: string
  articleId: string
  articleCode: string
  articleDescription: string
  quantityBOM: number
  quantitySupplied: number
  quantityBackorder: number
  udm: UdM
  scanned: boolean
  scannedAt: string | null
}

export interface ProjectStage {
  name: ProjectStatus
  label: string
  startedAt: string | null
  completedAt: string | null
  isActive: boolean
  notes: string
}

export interface ProjectCost {
  id: string
  projectId: string
  type: CostType
  description: string
  amount: number
  date: string
  source: string
}

export interface ProjectDocument {
  id: string
  type: "cotizacion" | "anticipo" | "oc" | "op" | "factura" | "complemento_pago" | "otro"
  label: string
  reference: string
  date: string
}

export interface Project {
  id: string
  folioTPS: string // 4 digitos
  vehicleModel: string
  armorLevel: ArmorLevel
  clientId: string
  clientName: string
  plant: Plant
  status: ProjectStatus
  quotationAmount: number
  stages: ProjectStage[]
  costs: ProjectCost[]
  documents: ProjectDocument[]
  bomId: string | null
  daysInProduction: number
  progressPercent: number
  totalCost: number
  estimatedMargin: number
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  id: string
  name: string
  rfc: string
  bankAccount: string
  email: string
  currency: "MXN" | "USD"
  paymentTerms: string
  contactPerson: string
  phone: string
}

export interface Client {
  id: string
  name: string
  rfc: string
  creditTerms: string
  contactPerson: string
  email: string
  phone: string
}

export interface GAP {
  id: string
  area: string
  description: string
  type: GAPType
  status: GAPStatus
  priority: GAPPriority
  phase: 1 | 2 | 3 | 4
  assignedTo: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Decision {
  id: string
  description: string
  impact: string
  options: string
  status: DecisionStatus
  decidedBy: string
  decidedAt: string | null
  resolution: string
  linkedGapIds: string[]
  createdAt: string
}

export interface ChecklistItem {
  id: string
  label: string
  description: string
  completed: boolean
  area: string
  completedAt: string | null
  completedBy: string
}

export interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  entity: string
  entityId: string
  action: "crear" | "editar" | "eliminar" | "importar" | "cambio_masivo" | "aprobar"
  field: string
  oldValue: string
  newValue: string
  timestamp: string
}

// --- Store ---

export interface AppState {
  // Datos
  articles: Article[]
  boms: BOM[]
  projects: Project[]
  suppliers: Supplier[]
  clients: Client[]
  gaps: GAP[]
  decisions: Decision[]
  checklist: ChecklistItem[]
  users: User[]
  auditLog: AuditLogEntry[]
  // LMAT 2.0
  specifications: TechnicalSpecification[]
  ecns: ECN[]
  supplyKits: SupplyKit[]
  cuttingKits: CuttingKit[]
  // UI
  currentUser: User
  currentPlant: Plant | "todas"
  // Metadata
  lastUpdated: string
}

export type AppAction =
  // Articulos
  | { type: "ADD_ARTICLE"; payload: Article }
  | { type: "UPDATE_ARTICLE"; payload: { id: string; updates: Partial<Article> } }
  | { type: "DELETE_ARTICLE"; payload: string }
  | { type: "IMPORT_ARTICLES"; payload: Article[] }
  // BOMs
  | { type: "ADD_BOM"; payload: BOM }
  | { type: "UPDATE_BOM"; payload: { id: string; updates: Partial<BOM>; reason: string } }
  | { type: "ADD_BOM_COMPONENT"; payload: { bomId: string; component: BOMComponent } }
  | { type: "REMOVE_BOM_COMPONENT"; payload: { bomId: string; componentId: string } }
  | { type: "UPDATE_BOM_COMPONENT"; payload: { bomId: string; componentId: string; updates: Partial<BOMComponent> } }
  | { type: "REORDER_BOM_COMPONENTS"; payload: { bomId: string; components: BOMComponent[] } }
  | { type: "MOVE_BOM_COMPONENT"; payload: { bomId: string; componentId: string; newParentId: string | null; newOrder: number } }
  | { type: "CREATE_BOM_VERSION"; payload: { bomId: string; reason: string } }
  | { type: "MASS_CHANGE_COMPONENT"; payload: { oldArticleId: string; newArticleId: string; bomIds: string[]; reason: string } }
  // Proyectos
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: { id: string; updates: Partial<Project> } }
  | { type: "ADD_PROJECT_COST"; payload: { projectId: string; cost: ProjectCost } }
  | { type: "UPDATE_PROJECT_STAGE"; payload: { projectId: string; stageName: ProjectStatus; updates: Partial<ProjectStage> } }
  // GAPs
  | { type: "ADD_GAP"; payload: GAP }
  | { type: "UPDATE_GAP"; payload: { id: string; updates: Partial<GAP> } }
  // Decisiones
  | { type: "ADD_DECISION"; payload: Decision }
  | { type: "UPDATE_DECISION"; payload: { id: string; updates: Partial<Decision> } }
  // Checklist
  | { type: "TOGGLE_CHECKLIST"; payload: { id: string; completed: boolean } }
  // LMAT 2.0: Especificaciones
  | { type: "ADD_SPECIFICATION"; payload: TechnicalSpecification }
  | { type: "UPDATE_SPECIFICATION"; payload: { id: string; updates: Partial<TechnicalSpecification> } }
  // LMAT 2.0: ECN
  | { type: "ADD_ECN"; payload: ECN }
  | { type: "UPDATE_ECN"; payload: { id: string; updates: Partial<ECN> } }
  | { type: "APPROVE_ECN"; payload: { ecnId: string; department: string; approved: boolean; notes: string } }
  | { type: "APPLY_ECN"; payload: { ecnId: string } }
  // LMAT 2.0: Supply Kits
  | { type: "ADD_SUPPLY_KIT"; payload: SupplyKit }
  | { type: "UPDATE_SUPPLY_KIT"; payload: { id: string; updates: Partial<SupplyKit> } }
  | { type: "SCAN_KIT_ITEM"; payload: { kitId: string; itemId: string } }
  // LMAT 2.0: Validacion departamental
  | { type: "UPDATE_BOM_VALIDATION"; payload: { bomId: string; department: string; status: DepartmentValidationStatus; notes: string } }
  // LMAT 2.0: Documentos
  | { type: "ADD_ARTICLE_DOCUMENT"; payload: { articleId: string; document: ArticleDocument } }
  | { type: "UPDATE_ARTICLE_DOCUMENT"; payload: { articleId: string; documentId: string; updates: Partial<ArticleDocument> } }
  // UI
  | { type: "SET_CURRENT_USER"; payload: User }
  | { type: "SET_CURRENT_PLANT"; payload: Plant | "todas" }
  // Audit
  | { type: "ADD_AUDIT_LOG"; payload: AuditLogEntry }
  // Hydrate
  | { type: "HYDRATE"; payload: AppState }
