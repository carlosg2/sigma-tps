import type {
  User, Article, BOM, BOMComponent, Project, ProjectStage,
  Supplier, Client, GAP, Decision, ChecklistItem, AppState, ProjectStatus,
  TechnicalSpecification, ECN, SupplyKit, DepartmentValidation, PlantRoute, CuttingKit
} from "./types"
import { PROJECT_STAGE_ORDER, PROJECT_STATUS_LABELS, VALIDATION_DEPARTMENTS } from "./constants"

// --- Usuarios ---
const users: User[] = [
  { id: "u1", name: "Carlos Mendoza", email: "carlos@tps.mx", role: "admin", area: "TI", plant: "planta_1", avatarInitials: "CM" },
  { id: "u2", name: "Laura Garcia", email: "laura@tps.mx", role: "gerente", area: "Produccion", plant: "planta_1", avatarInitials: "LG" },
  { id: "u3", name: "Roberto Silva", email: "roberto@tps.mx", role: "key_user", area: "Ingenieria", plant: "planta_1", avatarInitials: "RS" },
  { id: "u4", name: "Ana Torres", email: "ana@tps.mx", role: "key_user", area: "Compras", plant: "planta_1", avatarInitials: "AT" },
  { id: "u5", name: "Miguel Hernandez", email: "miguel@tps.mx", role: "key_user", area: "Almacen", plant: "planta_1", avatarInitials: "MH" },
  { id: "u6", name: "Patricia Lopez", email: "patricia@tps.mx", role: "gerente", area: "Finanzas", plant: "planta_1", avatarInitials: "PL" },
  { id: "u7", name: "Juan Ramirez", email: "juan@tps.mx", role: "operador", area: "Produccion", plant: "planta_1", avatarInitials: "JR" },
  { id: "u8", name: "Sofia Morales", email: "sofia@tps.mx", role: "key_user", area: "Calidad", plant: "planta_2", avatarInitials: "SM" },
  { id: "u9", name: "Fernando Diaz", email: "fernando@tps.mx", role: "key_user", area: "Produccion", plant: "planta_2", avatarInitials: "FD" },
  { id: "u10", name: "Consultor ERP", email: "consultor@externo.mx", role: "consultor", area: "TI", plant: "planta_1", avatarInitials: "CE" },
]

// --- Proveedores ---
const suppliers: Supplier[] = [
  { id: "s1", name: "Aceros Balisticos del Norte", rfc: "ABN120315XX1", bankAccount: "0123456789", email: "ventas@acerosbalisticos.mx", currency: "MXN", paymentTerms: "30 dias", contactPerson: "Ing. Martinez", phone: "+52 81 1234 5678" },
  { id: "s2", name: "Cristales Blindados SA", rfc: "CBS980721XX2", bankAccount: "9876543210", email: "pedidos@cristalesblindados.mx", currency: "MXN", paymentTerms: "45 dias", contactPerson: "Lic. Gonzalez", phone: "+52 55 2345 6789" },
  { id: "s3", name: "DuPont Ballistic Materials", rfc: "XEXX010101000", bankAccount: "INT-445566", email: "orders@dupont.com", currency: "USD", paymentTerms: "60 dias", contactPerson: "John Smith", phone: "+1 302 555 0100" },
  { id: "s4", name: "Tornillos y Sujeciones Express", rfc: "TSE150801XX3", bankAccount: "4455667788", email: "ventas@tornillosexp.mx", currency: "MXN", paymentTerms: "15 dias", contactPerson: "Sr. Perez", phone: "+52 33 3456 7890" },
  { id: "s5", name: "Pinturas Industriales Monterrey", rfc: "PIM110530XX4", bankAccount: "1122334455", email: "industrial@pinturasmonterrey.mx", currency: "MXN", paymentTerms: "30 dias", contactPerson: "Sra. Vega", phone: "+52 81 4567 8901" },
]

// --- Clientes ---
const clients: Client[] = [
  { id: "c1", name: "Grupo Financiero Azteca", rfc: "GFA010101ABC", creditTerms: "50% anticipo, 50% entrega", contactPerson: "Dir. Seguridad", email: "seguridad@gfazteca.mx", phone: "+52 55 1111 2222" },
  { id: "c2", name: "Gobierno del Estado de NL", rfc: "GEN850101DEF", creditTerms: "100% contra entrega", contactPerson: "Coord. Logistica", email: "logistica@nuevoleon.gob.mx", phone: "+52 81 2222 3333" },
  { id: "c3", name: "Embajada de USA en Mexico", rfc: "XEXX010101000", creditTerms: "PO + Net 30", contactPerson: "Security Office", email: "security@usembassy.gov", phone: "+52 55 5080 2000" },
  { id: "c4", name: "Minera Fresnillo PLC", rfc: "MFP060501GHI", creditTerms: "30% anticipo, 70% entrega", contactPerson: "Jefe Seguridad", email: "seguridad@fresnilloplc.com", phone: "+52 493 333 4444" },
  { id: "c5", name: "Particular - Sr. Alejandro Ramos", rfc: "RAAL800315JKL", creditTerms: "100% anticipo", contactPerson: "Alejandro Ramos", email: "aramos@gmail.com", phone: "+52 55 5555 6666" },
]

// --- Articulos (30 articulos realistas de blindaje) ---
function makeArticle(overrides: Partial<Article> & { id: string; code: string; description: string }): Article {
  return {
    descriptionGeneric: "",
    articleType: "compra",
    udmBase: "pieza",
    udmBOM: "pieza",
    drawingRef: "",
    group: "Varios",
    family: "",
    supplierId: "",
    supplierName: "",
    price: 0,
    currency: "MXN",
    udmPurchase: "pieza",
    leadTimeDays: 0,
    suppliers: [],
    location: "",
    warehouse: "MP - Materia Prima",
    udmStorage: "pieza",
    minStock: 0,
    maxStock: 0,
    reorderPoint: 0,
    supplyMethod: "bom_kit",
    requiresLotSerial: false,
    route: "",
    workCenter: "",
    udmProduction: "pieza",
    productionRoute: [],
    subBOMId: null,
    cncProgramId: null,
    qualityGroup: "",
    inspectionRequired: false,
    qualityApproved: true,
    costCenter: "",
    costMethod: "promedio",
    abcClass: "sin_clasificar",
    status: "activo",
    completeness: 0,
    conversions: [],
    plant: "planta_1",
    p5Code: "",
    documents: [],
    imageUrl: "",
    createdAt: "2025-01-15",
    updatedAt: "2025-06-01",
    createdBy: "u3",
    ...overrides,
  }
}

const articles: Article[] = [
  makeArticle({ id: "a1", code: "ACB-6MM-001", description: "Placa de acero balistico 6mm 1220x2440mm", group: "Acero Balistico", udmBase: "placa", udmPurchase: "placa", udmStorage: "placa", udmProduction: "placa", supplierId: "s1", supplierName: "Aceros Balisticos del Norte", price: 18500, leadTimeDays: 150, location: "A-01-01", minStock: 10, maxStock: 50, abcClass: "A", qualityGroup: "Balistico", inspectionRequired: true, drawingRef: "DWG-ACB-6-01", route: "Corte > Formado", workCenter: "CNC-01", completeness: 100, status: "activo" }),
  makeArticle({ id: "a2", code: "ACB-8MM-001", description: "Placa de acero balistico 8mm 1220x2440mm", group: "Acero Balistico", udmBase: "placa", udmPurchase: "placa", udmStorage: "placa", udmProduction: "placa", supplierId: "s1", supplierName: "Aceros Balisticos del Norte", price: 24500, leadTimeDays: 150, location: "A-01-02", minStock: 8, maxStock: 40, abcClass: "A", qualityGroup: "Balistico", inspectionRequired: true, drawingRef: "DWG-ACB-8-01", route: "Corte > Formado", workCenter: "CNC-01", completeness: 100, status: "activo" }),
  makeArticle({ id: "a3", code: "ACB-12MM-001", description: "Placa de acero balistico 12mm 1220x2440mm", group: "Acero Balistico", udmBase: "placa", udmPurchase: "placa", udmStorage: "placa", udmProduction: "placa", supplierId: "s1", supplierName: "Aceros Balisticos del Norte", price: 35800, leadTimeDays: 150, location: "A-01-03", minStock: 5, maxStock: 25, abcClass: "A", qualityGroup: "Balistico", inspectionRequired: true, drawingRef: "DWG-ACB-12-01", route: "Corte > Formado", workCenter: "CNC-01", completeness: 100, status: "activo" }),
  makeArticle({ id: "a4", code: "CB-DEL-NIII-001", description: "Cristal blindado parabrisas delantero NIII", group: "Cristales Blindados", supplierId: "s2", supplierName: "Cristales Blindados SA", price: 45000, currency: "MXN", leadTimeDays: 90, location: "B-02-01", minStock: 3, maxStock: 15, abcClass: "A", qualityGroup: "Balistico", inspectionRequired: true, drawingRef: "DWG-CB-DEL-01", route: "Instalacion", workCenter: "CRISTALES-01", completeness: 95, status: "activo" }),
  makeArticle({ id: "a5", code: "CB-LAT-NIII-001", description: "Cristal blindado lateral delantero NIII (par)", group: "Cristales Blindados", udmBase: "par", udmPurchase: "par", udmStorage: "par", udmProduction: "par", supplierId: "s2", supplierName: "Cristales Blindados SA", price: 32000, leadTimeDays: 90, location: "B-02-02", minStock: 4, maxStock: 20, abcClass: "A", qualityGroup: "Balistico", inspectionRequired: true, drawingRef: "DWG-CB-LAT-01", route: "Instalacion", workCenter: "CRISTALES-01", completeness: 95, status: "activo" }),
  makeArticle({ id: "a6", code: "CB-TRAS-NIII-001", description: "Cristal blindado trasero NIII", group: "Cristales Blindados", supplierId: "s2", supplierName: "Cristales Blindados SA", price: 38000, leadTimeDays: 90, location: "B-02-03", minStock: 3, maxStock: 12, abcClass: "A", qualityGroup: "Balistico", inspectionRequired: true, completeness: 85, status: "activo" }),
  makeArticle({ id: "a7", code: "CB-DEL-NIV-001", description: "Cristal blindado parabrisas delantero NIV", group: "Cristales Blindados", supplierId: "s2", supplierName: "Cristales Blindados SA", price: 68000, leadTimeDays: 120, location: "B-02-04", minStock: 2, maxStock: 8, abcClass: "A", qualityGroup: "Balistico", inspectionRequired: true, completeness: 80, status: "activo" }),
  makeArticle({ id: "a8", code: "KEV-R150-001", description: "Kevlar rollo 1.5m x 50m", group: "Material Balistico", udmBase: "rollo", udmPurchase: "rollo", udmStorage: "rollo", udmProduction: "metro_cuadrado", supplierId: "s3", supplierName: "DuPont Ballistic Materials", price: 2800, currency: "USD", leadTimeDays: 60, location: "C-03-01", minStock: 5, maxStock: 20, abcClass: "A", qualityGroup: "Balistico", inspectionRequired: true, drawingRef: "SPEC-KEV-150", conversions: [{ from: "rollo", to: "metro_cuadrado", factor: 75 }], completeness: 100, status: "activo" }),
  makeArticle({ id: "a9", code: "KEV-PC-PTA-001", description: "Kevlar precortado puerta delantera", group: "Material Balistico", udmBase: "juego", udmPurchase: "juego", supplierId: "s3", supplierName: "DuPont Ballistic Materials", price: 450, currency: "USD", leadTimeDays: 45, location: "C-03-02", minStock: 10, maxStock: 50, abcClass: "B", completeness: 75, status: "activo" }),
  makeArticle({ id: "a10", code: "TH-3/8-001", description: "Tornillo hexagonal 3/8\" x 1\" grado 8", group: "Tornilleria y Sujeciones", supplierId: "s4", supplierName: "Tornillos y Sujeciones Express", price: 3.5, leadTimeDays: 7, location: "D-04-01", udmPurchase: "caja", udmStorage: "pieza", minStock: 500, maxStock: 2000, abcClass: "C", conversions: [{ from: "caja", to: "pieza", factor: 100 }], completeness: 90, status: "activo" }),
  makeArticle({ id: "a11", code: "TA-M6-001", description: "Tornillo Allen M6 x 20mm inoxidable", group: "Tornilleria y Sujeciones", supplierId: "s4", supplierName: "Tornillos y Sujeciones Express", price: 4.2, leadTimeDays: 7, location: "D-04-02", udmPurchase: "caja", udmStorage: "pieza", minStock: 300, maxStock: 1500, abcClass: "C", conversions: [{ from: "caja", to: "pieza", factor: 50 }], completeness: 90, status: "activo" }),
  makeArticle({ id: "a12", code: "AE-3M-001", description: "Adhesivo estructural 3M DP810 50ml", group: "Adhesivos y Selladores", udmBase: "tubo", udmPurchase: "caja", udmStorage: "tubo", supplierId: "s5", supplierName: "Pinturas Industriales Monterrey", price: 850, leadTimeDays: 14, location: "E-05-01", minStock: 20, maxStock: 100, abcClass: "B", conversions: [{ from: "caja", to: "tubo", factor: 12 }], completeness: 85, status: "activo" }),
  makeArticle({ id: "a13", code: "SP-PU-001", description: "Sellador poliuretano Sikaflex negro 300ml", group: "Adhesivos y Selladores", udmBase: "tubo", udmPurchase: "caja", udmStorage: "tubo", supplierId: "s5", supplierName: "Pinturas Industriales Monterrey", price: 280, leadTimeDays: 7, location: "E-05-02", minStock: 50, maxStock: 200, abcClass: "C", conversions: [{ from: "caja", to: "tubo", factor: 24 }], completeness: 85, status: "activo" }),
  makeArticle({ id: "a14", code: "PA-NEG-001", description: "Pintura automotriz negra brillante 1 galon", group: "Pintura y Acabados", udmBase: "galon", udmPurchase: "galon", udmStorage: "galon", supplierId: "s5", supplierName: "Pinturas Industriales Monterrey", price: 1200, leadTimeDays: 5, location: "F-06-01", minStock: 10, maxStock: 40, abcClass: "B", completeness: 80, status: "activo" }),
  makeArticle({ id: "a15", code: "PR-AC-001", description: "Primer anticorrosivo gris 1 galon", group: "Pintura y Acabados", udmBase: "galon", udmPurchase: "galon", udmStorage: "galon", supplierId: "s5", supplierName: "Pinturas Industriales Monterrey", price: 650, leadTimeDays: 5, location: "F-06-02", minStock: 8, maxStock: 30, abcClass: "C", completeness: 80, status: "activo" }),
  makeArticle({ id: "a16", code: "TV-PIEL-001", description: "Tela vestidura piel sintetica negra (metro)", group: "Vestidura Interior", udmBase: "metro", udmPurchase: "rollo", udmStorage: "metro", supplierId: "", supplierName: "", price: 0, leadTimeDays: 0, location: "G-07-01", minStock: 50, maxStock: 200, abcClass: "B", conversions: [{ from: "rollo", to: "metro", factor: 30 }], completeness: 45, status: "pendiente" }),
  makeArticle({ id: "a17", code: "AM-NEG-001", description: "Alfombra moldeada negra juego completo", group: "Vestidura Interior", udmBase: "juego", supplierId: "", supplierName: "", price: 0, leadTimeDays: 0, location: "", abcClass: "C", completeness: 30, status: "borrador" }),
  makeArticle({ id: "a18", code: "MB-FRENO-001", description: "Manguera blindada freno (juego 4 piezas)", group: "Sistema Hidraulico", udmBase: "juego", supplierId: "", supplierName: "", price: 0, leadTimeDays: 0, location: "H-08-01", abcClass: "B", completeness: 35, status: "borrador" }),
  makeArticle({ id: "a19", code: "CBE-001", description: "Cable blindado electrico calibre 12 (metro)", group: "Sistema Electrico", udmBase: "metro", udmPurchase: "rollo", udmStorage: "metro", supplierId: "", supplierName: "", price: 0, leadTimeDays: 0, location: "", abcClass: "C", conversions: [{ from: "rollo", to: "metro", factor: 100 }], completeness: 40, status: "pendiente" }),
  makeArticle({ id: "a20", code: "RF-R18-001", description: "Run flat inserts R18 (juego 4 piezas)", group: "Run Flat", udmBase: "juego", supplierId: "s3", supplierName: "DuPont Ballistic Materials", price: 1500, currency: "USD", leadTimeDays: 45, location: "I-09-01", minStock: 3, maxStock: 12, abcClass: "A", qualityGroup: "Seguridad", inspectionRequired: true, completeness: 75, status: "activo" }),
  makeArticle({ id: "a21", code: "RF-R20-001", description: "Run flat inserts R20 (juego 4 piezas)", group: "Run Flat", udmBase: "juego", supplierId: "s3", supplierName: "DuPont Ballistic Materials", price: 1800, currency: "USD", leadTimeDays: 45, location: "I-09-02", minStock: 2, maxStock: 8, abcClass: "A", completeness: 70, status: "activo" }),
  makeArticle({ id: "a22", code: "HB-PTA-001", description: "Herraje bisagra puerta blindada reforzada", group: "Herrajes y Bisagras", supplierId: "s4", supplierName: "Tornillos y Sujeciones Express", price: 2800, leadTimeDays: 21, location: "D-04-10", minStock: 10, maxStock: 40, abcClass: "B", completeness: 70, status: "activo" }),
  makeArticle({ id: "a23", code: "HB-COF-001", description: "Herraje cofre blindado", group: "Herrajes y Bisagras", supplierId: "s4", supplierName: "Tornillos y Sujeciones Express", price: 3500, leadTimeDays: 21, location: "D-04-11", abcClass: "B", completeness: 60, status: "activo" }),
  makeArticle({ id: "a24", code: "VO-TRAS-001", description: "Vidrio operativo trasero electrico", group: "Cristales Blindados", supplierId: "s2", supplierName: "Cristales Blindados SA", price: 15000, leadTimeDays: 60, location: "B-02-05", abcClass: "B", completeness: 65, status: "activo" }),
  makeArticle({ id: "a25", code: "ACB-PISO-001", description: "Placa acero balistico piso 4mm", group: "Acero Balistico", udmBase: "placa", udmPurchase: "placa", udmStorage: "placa", supplierId: "s1", supplierName: "Aceros Balisticos del Norte", price: 12500, leadTimeDays: 150, location: "A-01-04", abcClass: "A", completeness: 75, status: "activo" }),
  makeArticle({ id: "a26", code: "OVER-001", description: "Overlap balistico puerta", group: "Material Balistico", supplierId: "", supplierName: "", price: 0, leadTimeDays: 0, location: "", abcClass: "sin_clasificar", completeness: 20, status: "borrador" }),
  makeArticle({ id: "a27", code: "ESP-TECHO-001", description: "Espuma balistico techo", group: "Material Balistico", supplierId: "", supplierName: "", price: 0, leadTimeDays: 0, location: "", abcClass: "sin_clasificar", completeness: 25, status: "borrador" }),
  makeArticle({ id: "a28", code: "GAS-AMORT-001", description: "Amortiguador de gas reforzado puerta (par)", group: "Herrajes y Bisagras", udmBase: "par", supplierId: "s4", supplierName: "Tornillos y Sujeciones Express", price: 4500, leadTimeDays: 30, location: "D-04-12", abcClass: "B", completeness: 65, status: "activo" }),
  makeArticle({ id: "a29", code: "SIRENA-001", description: "Sirena electronica bidireccional 100W", group: "Sistema Electrico", supplierId: "", supplierName: "", price: 0, leadTimeDays: 0, location: "", abcClass: "sin_clasificar", completeness: 15, status: "borrador", plant: "planta_2" }),
  makeArticle({ id: "a30", code: "LUZ-EST-001", description: "Luces estroboscopicas LED kit (4 piezas)", group: "Sistema Electrico", supplierId: "", supplierName: "", price: 0, leadTimeDays: 0, location: "", abcClass: "sin_clasificar", completeness: 20, status: "borrador", plant: "planta_2" }),
]

// --- BOMs ---
function makeBOMComponent(overrides: Partial<BOMComponent> & { id: string; articleId: string }): BOMComponent {
  const art = articles.find(a => a.id === overrides.articleId)
  return {
    articleCode: art?.code || "",
    articleDescription: art?.description || "",
    quantity: 1,
    udm: art?.udmBase || "pieza",
    cell: "Celda 1",
    operation: "",
    notes: "",
    hasCompleteData: (art?.completeness || 0) >= 80,
    // Jerarquia defaults
    parentId: null,
    order: 0,
    level: 0,
    isKit: false,
    ...overrides,
  }
}

// Helper para crear un kit (componente que contiene otros)
function makeKit(id: string, name: string, cell: string, order: number): BOMComponent {
  return {
    id,
    articleId: "",
    articleCode: "",
    articleDescription: name,
    quantity: 1,
    udm: "juego",
    cell,
    operation: "",
    notes: "",
    hasCompleteData: true,
    parentId: null,
    order,
    level: 0,
    isKit: true,
  }
}

// BOM1 con estructura jerarquica (kits que contienen articulos)
const bom1Components: BOMComponent[] = [
  // Kit 1: Blindaje de Carroceria (nivel 0)
  makeKit("bc1-kit1", "Kit Blindaje Carroceria", "Celda 1", 0),
  // Hijos del Kit 1 (nivel 1)
  makeBOMComponent({ id: "bc1-1", articleId: "a1", quantity: 8, cell: "Celda 1", operation: "Corte y formado", parentId: "bc1-kit1", order: 0, level: 1 }),
  makeBOMComponent({ id: "bc1-2", articleId: "a2", quantity: 4, cell: "Celda 1", operation: "Corte y formado", parentId: "bc1-kit1", order: 1, level: 1 }),
  makeBOMComponent({ id: "bc1-3", articleId: "a25", quantity: 2, cell: "Celda 2", operation: "Corte piso", parentId: "bc1-kit1", order: 2, level: 1 }),
  makeBOMComponent({ id: "bc1-7", articleId: "a8", quantity: 2, cell: "Celda 2", operation: "Forrado Kevlar", parentId: "bc1-kit1", order: 3, level: 1 }),
  makeBOMComponent({ id: "bc1-8", articleId: "a9", quantity: 4, cell: "Celda 2", operation: "Forrado puertas", parentId: "bc1-kit1", order: 4, level: 1 }),

  // Kit 2: Cristales Blindados (nivel 0)
  makeKit("bc1-kit2", "Kit Cristales Blindados", "Celda 3", 1),
  // Hijos del Kit 2 (nivel 1)
  makeBOMComponent({ id: "bc1-4", articleId: "a4", quantity: 1, cell: "Celda 3", operation: "Instalacion cristales", parentId: "bc1-kit2", order: 0, level: 1 }),
  makeBOMComponent({ id: "bc1-5", articleId: "a5", quantity: 1, cell: "Celda 3", operation: "Instalacion cristales", parentId: "bc1-kit2", order: 1, level: 1 }),
  makeBOMComponent({ id: "bc1-6", articleId: "a6", quantity: 1, cell: "Celda 3", operation: "Instalacion cristales", parentId: "bc1-kit2", order: 2, level: 1 }),

  // Kit 3: Ensamble General (nivel 0)
  makeKit("bc1-kit3", "Kit Ensamble y Herrajes", "Celda 4", 2),
  // Sub-kit: Tornilleria (nivel 1, hijo de kit3)
  { ...makeKit("bc1-kit3a", "Sub-kit Tornilleria", "Celda 4", 0), parentId: "bc1-kit3", level: 1 },
  // Hijos del sub-kit tornilleria (nivel 2)
  makeBOMComponent({ id: "bc1-9", articleId: "a10", quantity: 120, cell: "Celda 4", operation: "Ensamble general", parentId: "bc1-kit3a", order: 0, level: 2 }),
  makeBOMComponent({ id: "bc1-10", articleId: "a11", quantity: 80, cell: "Celda 4", operation: "Ensamble general", parentId: "bc1-kit3a", order: 1, level: 2 }),
  // Sub-kit: Adhesivos (nivel 1, hijo de kit3)
  { ...makeKit("bc1-kit3b", "Sub-kit Adhesivos y Selladores", "Celda 4", 1), parentId: "bc1-kit3", level: 1 },
  // Hijos del sub-kit adhesivos (nivel 2)
  makeBOMComponent({ id: "bc1-11", articleId: "a12", quantity: 8, cell: "Celda 4", operation: "Pegado estructural", parentId: "bc1-kit3b", order: 0, level: 2 }),
  makeBOMComponent({ id: "bc1-12", articleId: "a13", quantity: 12, cell: "Celda 4", operation: "Sellado", parentId: "bc1-kit3b", order: 1, level: 2 }),
  // Herrajes directo en kit3 (nivel 1)
  makeBOMComponent({ id: "bc1-17", articleId: "a22", quantity: 8, cell: "Celda 4", operation: "Puertas", parentId: "bc1-kit3", order: 2, level: 1 }),
  makeBOMComponent({ id: "bc1-18", articleId: "a28", quantity: 4, cell: "Celda 4", operation: "Puertas", parentId: "bc1-kit3", order: 3, level: 1 }),

  // Kit 4: Vestidura (nivel 0)
  makeKit("bc1-kit4", "Kit Vestidura Interior", "Celda 5", 3),
  makeBOMComponent({ id: "bc1-15", articleId: "a16", quantity: 15, cell: "Celda 5", operation: "Vestidura", parentId: "bc1-kit4", order: 0, level: 1 }),

  // Kit 5: Pintura (nivel 0)
  makeKit("bc1-kit5", "Kit Pintura y Acabados", "Celda 6", 4),
  makeBOMComponent({ id: "bc1-13", articleId: "a14", quantity: 3, cell: "Celda 6", operation: "Pintura", parentId: "bc1-kit5", order: 0, level: 1 }),
  makeBOMComponent({ id: "bc1-14", articleId: "a15", quantity: 2, cell: "Celda 6", operation: "Primer", parentId: "bc1-kit5", order: 1, level: 1 }),

  // Kit 6: Run Flat (nivel 0)
  makeKit("bc1-kit6", "Kit Run Flat", "Celda 7", 5),
  makeBOMComponent({ id: "bc1-16", articleId: "a20", quantity: 1, cell: "Celda 7", operation: "Run flat", parentId: "bc1-kit6", order: 0, level: 1 }),
]

// BOM2 con estructura jerarquica similar
const bom2Components: BOMComponent[] = [
  // Kit Blindaje
  makeKit("bc2-kit1", "Kit Blindaje Carroceria NIV", "Celda 1", 0),
  makeBOMComponent({ id: "bc2-1", articleId: "a2", quantity: 12, cell: "Celda 1", operation: "Corte y formado", parentId: "bc2-kit1", order: 0, level: 1 }),
  makeBOMComponent({ id: "bc2-2", articleId: "a3", quantity: 6, cell: "Celda 1", operation: "Corte y formado", parentId: "bc2-kit1", order: 1, level: 1 }),
  makeBOMComponent({ id: "bc2-3", articleId: "a25", quantity: 3, cell: "Celda 2", operation: "Corte piso", parentId: "bc2-kit1", order: 2, level: 1 }),
  makeBOMComponent({ id: "bc2-7", articleId: "a8", quantity: 3, cell: "Celda 2", operation: "Forrado Kevlar", parentId: "bc2-kit1", order: 3, level: 1 }),
  makeBOMComponent({ id: "bc2-8", articleId: "a9", quantity: 6, cell: "Celda 2", operation: "Forrado puertas", parentId: "bc2-kit1", order: 4, level: 1 }),

  // Kit Cristales
  makeKit("bc2-kit2", "Kit Cristales Blindados NIV", "Celda 3", 1),
  makeBOMComponent({ id: "bc2-4", articleId: "a7", quantity: 1, cell: "Celda 3", operation: "Instalacion cristales", parentId: "bc2-kit2", order: 0, level: 1 }),
  makeBOMComponent({ id: "bc2-5", articleId: "a5", quantity: 1, cell: "Celda 3", operation: "Instalacion cristales", parentId: "bc2-kit2", order: 1, level: 1 }),
  makeBOMComponent({ id: "bc2-6", articleId: "a6", quantity: 1, cell: "Celda 3", operation: "Instalacion cristales", parentId: "bc2-kit2", order: 2, level: 1 }),
  makeBOMComponent({ id: "bc2-18", articleId: "a24", quantity: 1, cell: "Celda 3", operation: "Cristales operativos", parentId: "bc2-kit2", order: 3, level: 1 }),

  // Kit Ensamble
  makeKit("bc2-kit3", "Kit Ensamble General", "Celda 4", 2),
  makeBOMComponent({ id: "bc2-9", articleId: "a10", quantity: 200, cell: "Celda 4", operation: "Ensamble general", parentId: "bc2-kit3", order: 0, level: 1 }),
  makeBOMComponent({ id: "bc2-10", articleId: "a11", quantity: 120, cell: "Celda 4", operation: "Ensamble general", parentId: "bc2-kit3", order: 1, level: 1 }),
  makeBOMComponent({ id: "bc2-11", articleId: "a12", quantity: 12, cell: "Celda 5", operation: "Pegado estructural", parentId: "bc2-kit3", order: 2, level: 1 }),
  makeBOMComponent({ id: "bc2-12", articleId: "a13", quantity: 20, cell: "Celda 5", operation: "Sellado", parentId: "bc2-kit3", order: 3, level: 1 }),
  makeBOMComponent({ id: "bc2-16", articleId: "a22", quantity: 10, cell: "Celda 4", operation: "Puertas", parentId: "bc2-kit3", order: 4, level: 1 }),
  makeBOMComponent({ id: "bc2-17", articleId: "a28", quantity: 5, cell: "Celda 4", operation: "Puertas", parentId: "bc2-kit3", order: 5, level: 1 }),

  // Kit Pintura
  makeKit("bc2-kit4", "Kit Pintura", "Celda 6", 3),
  makeBOMComponent({ id: "bc2-13", articleId: "a14", quantity: 4, cell: "Celda 6", operation: "Pintura", parentId: "bc2-kit4", order: 0, level: 1 }),
  makeBOMComponent({ id: "bc2-14", articleId: "a15", quantity: 3, cell: "Celda 6", operation: "Primer", parentId: "bc2-kit4", order: 1, level: 1 }),

  // Kit Run Flat
  makeKit("bc2-kit5", "Kit Run Flat R20", "Celda 7", 4),
  makeBOMComponent({ id: "bc2-15", articleId: "a21", quantity: 1, cell: "Celda 7", operation: "Run flat", parentId: "bc2-kit5", order: 0, level: 1 }),
]

// BOM3 con estructura jerarquica (planta 2, menos celdas)
const bom3Components: BOMComponent[] = [
  makeKit("bc3-kit1", "Kit Blindaje Explorer", "Celda 1", 0),
  makeBOMComponent({ id: "bc3-1", articleId: "a1", quantity: 6, cell: "Celda 1", operation: "Corte y formado", parentId: "bc3-kit1", order: 0, level: 1 }),
  makeBOMComponent({ id: "bc3-2", articleId: "a25", quantity: 2, cell: "Celda 1", operation: "Corte piso", parentId: "bc3-kit1", order: 1, level: 1 }),
  makeBOMComponent({ id: "bc3-5", articleId: "a8", quantity: 2, cell: "Celda 1", operation: "Forrado Kevlar", parentId: "bc3-kit1", order: 2, level: 1 }),

  makeKit("bc3-kit2", "Kit Cristales", "Celda 2", 1),
  makeBOMComponent({ id: "bc3-3", articleId: "a4", quantity: 1, cell: "Celda 2", operation: "Instalacion cristales", parentId: "bc3-kit2", order: 0, level: 1 }),
  makeBOMComponent({ id: "bc3-4", articleId: "a5", quantity: 1, cell: "Celda 2", operation: "Instalacion cristales", parentId: "bc3-kit2", order: 1, level: 1 }),

  makeKit("bc3-kit3", "Kit Ensamble y Acabados", "Celda 3", 2),
  makeBOMComponent({ id: "bc3-6", articleId: "a10", quantity: 100, cell: "Celda 3", operation: "Ensamble general", parentId: "bc3-kit3", order: 0, level: 1 }),
  makeBOMComponent({ id: "bc3-7", articleId: "a12", quantity: 6, cell: "Celda 3", operation: "Pegado", parentId: "bc3-kit3", order: 1, level: 1 }),
  makeBOMComponent({ id: "bc3-8", articleId: "a13", quantity: 10, cell: "Celda 3", operation: "Sellado", parentId: "bc3-kit3", order: 2, level: 1 }),
  makeBOMComponent({ id: "bc3-11", articleId: "a22", quantity: 6, cell: "Celda 3", operation: "Puertas", parentId: "bc3-kit3", order: 3, level: 1 }),

  makeKit("bc3-kit4", "Kit Finales", "Celda 4", 3),
  makeBOMComponent({ id: "bc3-9", articleId: "a14", quantity: 2, cell: "Celda 4", operation: "Pintura", parentId: "bc3-kit4", order: 0, level: 1 }),
  makeBOMComponent({ id: "bc3-10", articleId: "a20", quantity: 1, cell: "Celda 4", operation: "Run flat", parentId: "bc3-kit4", order: 1, level: 1 }),
]

function calcHealth(components: BOMComponent[]): number {
  if (components.length === 0) return 0
  const complete = components.filter(c => c.hasCompleteData).length
  return Math.round((complete / components.length) * 100)
}

// Crear snapshots con diferencias reales para demostrar el diff
const bom1SnapshotV1: BOMComponent[] = [
  // Kit 1 con cantidades diferentes
  makeKit("bc1-kit1", "Kit Blindaje Carroceria", "Celda 1", 0),
  makeBOMComponent({ id: "bc1-1", articleId: "a1", quantity: 6, cell: "Celda 1", operation: "Corte y formado", parentId: "bc1-kit1", order: 0, level: 1 }), // era 6, ahora 8
  makeBOMComponent({ id: "bc1-2", articleId: "a2", quantity: 4, cell: "Celda 1", operation: "Corte y formado", parentId: "bc1-kit1", order: 1, level: 1 }),
  makeBOMComponent({ id: "bc1-3", articleId: "a25", quantity: 3, cell: "Celda 2", operation: "Corte piso", parentId: "bc1-kit1", order: 2, level: 1 }), // era 3, ahora 2
  // Este componente sera ELIMINADO en v3
  makeBOMComponent({ id: "bc1-old", articleId: "a26", quantity: 1, cell: "Celda 1", operation: "Soporte provisional", parentId: "bc1-kit1", order: 3, level: 1 }),
  // Kit 2
  makeKit("bc1-kit2", "Kit Cristales Blindados", "Celda 3", 1),
  makeBOMComponent({ id: "bc1-4", articleId: "a4", quantity: 1, cell: "Celda 3", operation: "Instalacion cristales", parentId: "bc1-kit2", order: 0, level: 1 }),
  makeBOMComponent({ id: "bc1-5", articleId: "a5", quantity: 1, cell: "Celda 3", operation: "Instalacion cristales", parentId: "bc1-kit2", order: 1, level: 1 }),
  // Kit 3
  makeKit("bc1-kit3", "Kit Ensamble y Herrajes", "Celda 4", 2),
  makeBOMComponent({ id: "bc1-9", articleId: "a10", quantity: 100, cell: "Celda 4", operation: "Ensamble general", parentId: "bc1-kit3", order: 0, level: 1 }), // era 100, ahora 120
]

const bom1SnapshotV2: BOMComponent[] = [
  ...bom1SnapshotV1.filter(c => c.id !== "bc1-old"), // Eliminar el componente provisional
  // Cantidades actualizadas
].map(c => {
  if (c.id === "bc1-1") return { ...c, quantity: 7 } // intermedio
  if (c.id === "bc1-9") return { ...c, quantity: 110 } // intermedio
  return c
})

// LMAT 2.0: Validaciones de departamentos
function makeDeptValidations(status: "pendiente" | "parcial" | "completo"): DepartmentValidation[] {
  return VALIDATION_DEPARTMENTS.map((dept, idx) => ({
    department: dept,
    status: status === "completo" ? "completado" : status === "parcial" && idx < 3 ? "completado" : "pendiente",
    validatedBy: status === "completo" || (status === "parcial" && idx < 3) ? "Roberto Silva" : null,
    validatedAt: status === "completo" || (status === "parcial" && idx < 3) ? "2025-05-01" : null,
    notes: "",
  }))
}

// LMAT 2.0: Rutas por planta
const plantRoutesP1: PlantRoute[] = [
  { plant: "planta_1", cells: ["Celda 1", "Celda 2", "Celda 3", "Celda 4", "Celda 5", "Celda 6", "Celda 7"], isActive: true },
]
const plantRoutesP2: PlantRoute[] = [
  { plant: "planta_2", cells: ["Celda 1", "Celda 2", "Celda 3", "Celda 4"], isActive: true },
]

const boms: BOM[] = [
  {
    id: "bom1", specificationCode: "ESP-001", vehicleModel: "Toyota Land Cruiser 300", armorLevel: "NIII", plant: "planta_1", version: 3, status: "aprobado",
    maturityStatus: "liberado",
    components: bom1Components,
    revisions: [
      { id: "rev1-1", bomId: "bom1", version: 1, changedBy: "Roberto Silva", changedAt: "2025-01-20", changeReason: "Creacion inicial", componentsSnapshot: bom1SnapshotV1, diff: [] },
      { id: "rev1-2", bomId: "bom1", version: 2, changedBy: "Roberto Silva", changedAt: "2025-03-15", changeReason: "Eliminar soporte provisional y ajustar cantidades", componentsSnapshot: bom1SnapshotV2, diff: [{ type: "removed", articleCode: "ACB-TEMP-001", articleDescription: "Soporte provisional (eliminado)" }, { type: "modified", articleCode: "ACB-LAT-001", articleDescription: "Placa acero balistico lateral", field: "quantity", oldValue: "6", newValue: "7" }] },
      { id: "rev1-3", bomId: "bom1", version: 3, changedBy: "Roberto Silva", changedAt: "2025-05-10", changeReason: "Incrementar cantidades finales y agregar componentes faltantes", componentsSnapshot: bom1Components, diff: [{ type: "modified", articleCode: "ACB-LAT-001", articleDescription: "Placa acero balistico lateral", field: "quantity", oldValue: "7", newValue: "8" }, { type: "added", articleCode: "KEV-PANEL-001", articleDescription: "Panel Kevlar puerta" }] },
    ],
    healthPercent: calcHealth(bom1Components),
    departmentValidations: makeDeptValidations("completo"),
    specificationId: "spec1",
    plantRoutes: plantRoutesP1,
    cuttingKitIds: ["ck1", "ck2", "ck3"],
    createdAt: "2025-01-20", updatedAt: "2025-05-10", createdBy: "u3"
  },
  {
    id: "bom2", specificationCode: "ESP-002", vehicleModel: "Chevrolet Suburban", armorLevel: "NIV", plant: "planta_1", version: 2, status: "aprobado",
    maturityStatus: "liberado",
    components: bom2Components,
    revisions: [
      { id: "rev2-1", bomId: "bom2", version: 1, changedBy: "Roberto Silva", changedAt: "2025-02-01", changeReason: "Creacion inicial", componentsSnapshot: bom2Components.slice(0, 12), diff: [] },
      { id: "rev2-2", bomId: "bom2", version: 2, changedBy: "Roberto Silva", changedAt: "2025-04-20", changeReason: "Actualizar cantidades de tornilleria por revision de ingenieria", componentsSnapshot: bom2Components, diff: [{ type: "modified", articleCode: "TH-3/8-001", articleDescription: "Tornillo hexagonal", field: "quantity", oldValue: "150", newValue: "200" }] },
    ],
    healthPercent: calcHealth(bom2Components),
    departmentValidations: makeDeptValidations("completo"),
    specificationId: "spec2",
    plantRoutes: plantRoutesP1,
    cuttingKitIds: ["ck4", "ck5"],
    createdAt: "2025-02-01", updatedAt: "2025-04-20", createdBy: "u3"
  },
  {
    id: "bom3", specificationCode: "ESP-003", vehicleModel: "Ford Explorer", armorLevel: "NIII_plus", plant: "planta_2", version: 1, status: "aprobado",
    maturityStatus: "estabilizado",
    components: bom3Components,
    revisions: [
      { id: "rev3-1", bomId: "bom3", version: 1, changedBy: "Fernando Diaz", changedAt: "2025-03-01", changeReason: "Creacion inicial", componentsSnapshot: bom3Components, diff: [] },
    ],
    healthPercent: calcHealth(bom3Components),
    departmentValidations: makeDeptValidations("parcial"),
    specificationId: "spec3",
    plantRoutes: plantRoutesP2,
    cuttingKitIds: [],
    createdAt: "2025-03-01", updatedAt: "2025-03-01", createdBy: "u9"
  },
  {
    id: "bom4", specificationCode: "ESP-004", vehicleModel: "Toyota Hilux", armorLevel: "NIII", plant: "planta_2", version: 1, status: "en_revision",
    maturityStatus: "preliminar",
    components: [
      makeBOMComponent({ id: "bc4-1", articleId: "a1", quantity: 5, cell: "Celda 1" }),
      makeBOMComponent({ id: "bc4-2", articleId: "a4", quantity: 1, cell: "Celda 2" }),
      makeBOMComponent({ id: "bc4-3", articleId: "a5", quantity: 1, cell: "Celda 2" }),
      makeBOMComponent({ id: "bc4-4", articleId: "a8", quantity: 1, cell: "Celda 1" }),
      makeBOMComponent({ id: "bc4-5", articleId: "a10", quantity: 80, cell: "Celda 3" }),
      makeBOMComponent({ id: "bc4-6", articleId: "a20", quantity: 1, cell: "Celda 4" }),
    ],
    revisions: [],
    healthPercent: 0,
    departmentValidations: makeDeptValidations("pendiente"),
    specificationId: null,
    plantRoutes: plantRoutesP2,
    cuttingKitIds: [],
    createdAt: "2025-05-01", updatedAt: "2025-05-01", createdBy: "u9"
  },
  {
    id: "bom5", specificationCode: "ESP-005", vehicleModel: "Chevrolet Tahoe", armorLevel: "NV", plant: "planta_1", version: 1, status: "borrador",
    maturityStatus: "en_desarrollo",
    components: [
      makeBOMComponent({ id: "bc5-1", articleId: "a3", quantity: 10, cell: "Celda 1" }),
      makeBOMComponent({ id: "bc5-2", articleId: "a2", quantity: 8, cell: "Celda 1" }),
      makeBOMComponent({ id: "bc5-3", articleId: "a7", quantity: 1, cell: "Celda 3" }),
      makeBOMComponent({ id: "bc5-4", articleId: "a8", quantity: 4, cell: "Celda 2" }),
      makeBOMComponent({ id: "bc5-5", articleId: "a26", quantity: 8, cell: "Celda 2", notes: "Pendiente definir proveedor" }),
      makeBOMComponent({ id: "bc5-6", articleId: "a27", quantity: 4, cell: "Celda 2", notes: "Pendiente definir especificacion" }),
    ],
    revisions: [],
    healthPercent: 0,
    departmentValidations: makeDeptValidations("pendiente"),
    specificationId: null,
    plantRoutes: plantRoutesP1,
    cuttingKitIds: [],
    createdAt: "2025-06-01", updatedAt: "2025-06-01", createdBy: "u3"
  },
]
// Recalc health
boms.forEach(b => { b.healthPercent = calcHealth(b.components) })

// --- Proyectos ---
function makeStages(currentStatus: ProjectStatus): ProjectStage[] {
  const now = new Date()
  return PROJECT_STAGE_ORDER.map((status, idx) => {
    const currentIdx = PROJECT_STAGE_ORDER.indexOf(currentStatus)
    const isCompleted = idx < currentIdx
    const isActive = idx === currentIdx
    const daysAgo = (currentIdx - idx) * 5
    return {
      name: status,
      label: PROJECT_STATUS_LABELS[status],
      startedAt: isCompleted || isActive ? new Date(now.getTime() - daysAgo * 86400000).toISOString().split("T")[0] : null,
      completedAt: isCompleted ? new Date(now.getTime() - (daysAgo - 3) * 86400000).toISOString().split("T")[0] : null,
      isActive,
      notes: "",
    }
  })
}

const projects: Project[] = [
  { id: "p1", folioTPS: "4521", vehicleModel: "Toyota Land Cruiser 300", armorLevel: "NIII", clientId: "c1", clientName: "Grupo Financiero Azteca", plant: "planta_1", status: "produccion", quotationAmount: 1850000, stages: makeStages("produccion"), costs: [
    { id: "pc1-1", projectId: "p1", type: "material", description: "Kit de acero balistico", amount: 385000, date: "2025-06-01", source: "BOM ESP-001" },
    { id: "pc1-2", projectId: "p1", type: "material", description: "Cristales blindados", amount: 115000, date: "2025-06-05", source: "BOM ESP-001" },
    { id: "pc1-3", projectId: "p1", type: "mano_obra", description: "Despiece y blindaje (120 hrs)", amount: 48000, date: "2025-06-10", source: "Nomina" },
    { id: "pc1-4", projectId: "p1", type: "gif", description: "GIF prorrateo junio", amount: 25000, date: "2025-06-15", source: "Contabilidad" },
  ], documents: [
    { id: "pd1-1", type: "cotizacion", label: "Cotizacion COT-2025-089", reference: "COT-2025-089", date: "2025-04-10" },
    { id: "pd1-2", type: "anticipo", label: "Anticipo 50% - Transferencia", reference: "TRF-20250420-001", date: "2025-04-20" },
  ], bomId: "bom1", daysInProduction: 22, progressPercent: 55, totalCost: 573000, estimatedMargin: 69, createdAt: "2025-04-10", updatedAt: "2025-06-15" },

  { id: "p2", folioTPS: "4522", vehicleModel: "Chevrolet Suburban", armorLevel: "NIV", clientId: "c2", clientName: "Gobierno del Estado de NL", plant: "planta_1", status: "produccion", quotationAmount: 2450000, stages: makeStages("produccion"), costs: [
    { id: "pc2-1", projectId: "p2", type: "material", description: "Kit de materiales NIV", amount: 620000, date: "2025-06-03", source: "BOM ESP-002" },
    { id: "pc2-2", projectId: "p2", type: "mano_obra", description: "Despiece (80 hrs)", amount: 32000, date: "2025-06-08", source: "Nomina" },
  ], documents: [
    { id: "pd2-1", type: "cotizacion", label: "Cotizacion COT-2025-092", reference: "COT-2025-092", date: "2025-04-25" },
  ], bomId: "bom2", daysInProduction: 18, progressPercent: 40, totalCost: 652000, estimatedMargin: 73.4, createdAt: "2025-04-25", updatedAt: "2025-06-08" },

  { id: "p3", folioTPS: "4523", vehicleModel: "Ford Explorer", armorLevel: "NIII_plus", clientId: "c4", clientName: "Minera Fresnillo PLC", plant: "planta_2", status: "calidad", quotationAmount: 1650000, stages: makeStages("calidad"), costs: [
    { id: "pc3-1", projectId: "p3", type: "material", description: "Materiales completos", amount: 420000, date: "2025-05-10", source: "BOM ESP-003" },
    { id: "pc3-2", projectId: "p3", type: "mano_obra", description: "Produccion completa (200 hrs)", amount: 80000, date: "2025-06-01", source: "Nomina" },
    { id: "pc3-3", projectId: "p3", type: "gif", description: "GIF prorrateo", amount: 35000, date: "2025-06-05", source: "Contabilidad" },
    { id: "pc3-4", projectId: "p3", type: "servicio_tercero", description: "Maquila de vestidura especial", amount: 45000, date: "2025-05-20", source: "Factura proveedor" },
  ], documents: [], bomId: "bom3", daysInProduction: 35, progressPercent: 85, totalCost: 580000, estimatedMargin: 64.8, createdAt: "2025-03-15", updatedAt: "2025-06-05" },

  { id: "p4", folioTPS: "4524", vehicleModel: "Toyota Land Cruiser 300", armorLevel: "NIII", clientId: "c5", clientName: "Particular - Sr. Alejandro Ramos", plant: "planta_1", status: "facturacion", quotationAmount: 1850000, stages: makeStages("facturacion"), costs: [
    { id: "pc4-1", projectId: "p4", type: "material", description: "Materiales completos", amount: 395000, date: "2025-04-01", source: "BOM ESP-001" },
    { id: "pc4-2", projectId: "p4", type: "mano_obra", description: "Produccion completa", amount: 85000, date: "2025-05-15", source: "Nomina" },
    { id: "pc4-3", projectId: "p4", type: "gif", description: "GIF", amount: 30000, date: "2025-05-20", source: "Contabilidad" },
  ], documents: [], bomId: "bom1", daysInProduction: 42, progressPercent: 95, totalCost: 510000, estimatedMargin: 72.4, createdAt: "2025-02-01", updatedAt: "2025-05-20" },

  { id: "p5", folioTPS: "4525", vehicleModel: "Chevrolet Suburban", armorLevel: "NIV", clientId: "c3", clientName: "Embajada de USA en Mexico", plant: "planta_1", status: "cotizacion", quotationAmount: 2650000, stages: makeStages("cotizacion"), costs: [], documents: [
    { id: "pd5-1", type: "cotizacion", label: "Cotizacion COT-2025-105", reference: "COT-2025-105", date: "2025-06-10" },
  ], bomId: null, daysInProduction: 0, progressPercent: 5, totalCost: 0, estimatedMargin: 0, createdAt: "2025-06-10", updatedAt: "2025-06-10" },

  { id: "p6", folioTPS: "4526", vehicleModel: "Toyota Hilux", armorLevel: "NIII", clientId: "c4", clientName: "Minera Fresnillo PLC", plant: "planta_2", status: "anticipo", quotationAmount: 1250000, stages: makeStages("anticipo"), costs: [], documents: [], bomId: "bom4", daysInProduction: 0, progressPercent: 10, totalCost: 0, estimatedMargin: 0, createdAt: "2025-06-05", updatedAt: "2025-06-12" },

  { id: "p7", folioTPS: "4527", vehicleModel: "Chevrolet Tahoe", armorLevel: "NV", clientId: "c1", clientName: "Grupo Financiero Azteca", plant: "planta_1", status: "planeacion", quotationAmount: 3200000, stages: makeStages("planeacion"), costs: [], documents: [], bomId: "bom5", daysInProduction: 0, progressPercent: 15, totalCost: 0, estimatedMargin: 0, createdAt: "2025-05-20", updatedAt: "2025-06-01" },

  { id: "p8", folioTPS: "4520", vehicleModel: "Toyota Land Cruiser 300", armorLevel: "NIII", clientId: "c2", clientName: "Gobierno del Estado de NL", plant: "planta_1", status: "entregado", quotationAmount: 1850000, stages: makeStages("entregado"), costs: [
    { id: "pc8-1", projectId: "p8", type: "material", description: "Materiales completos", amount: 390000, date: "2025-01-15", source: "BOM ESP-001" },
    { id: "pc8-2", projectId: "p8", type: "mano_obra", description: "Produccion completa", amount: 82000, date: "2025-02-20", source: "Nomina" },
    { id: "pc8-3", projectId: "p8", type: "gif", description: "GIF", amount: 28000, date: "2025-02-28", source: "Contabilidad" },
  ], documents: [], bomId: "bom1", daysInProduction: 0, progressPercent: 100, totalCost: 500000, estimatedMargin: 73, createdAt: "2024-12-01", updatedAt: "2025-03-15" },
]

// --- GAPs ---
const gaps: GAP[] = [
  { id: "g1", area: "Ingenieria", description: "Estandarizar formato de BOM entre Planta 1 (SolidWorks) y Planta 2 (AutoCAD 2D)", type: "datos_maestros", status: "en_progreso", priority: "critica", phase: 1, assignedTo: "Roberto Silva", notes: "Se definio formato unificado, en proceso de migracion", createdAt: "2025-01-10", updatedAt: "2025-06-01" },
  { id: "g2", area: "Ingenieria", description: "Implementar control de revisiones y ECN en BOMs", type: "workflow", status: "en_progreso", priority: "critica", phase: 1, assignedTo: "Roberto Silva", notes: "Modulo de versionamiento listo en nueva app", createdAt: "2025-01-10", updatedAt: "2025-06-01" },
  { id: "g3", area: "Almacen", description: "Corregir 200-300 errores detectados en BOMs al surtir kits", type: "datos_maestros", status: "en_progreso", priority: "alta", phase: 1, assignedTo: "Miguel Hernandez", notes: "150 corregidos, faltan ~100", createdAt: "2025-01-15", updatedAt: "2025-05-20" },
  { id: "g4", area: "Compras", description: "Enriquecer catalogo de articulos: lead time, proveedor y precio faltantes en 50% de items", type: "datos_maestros", status: "en_progreso", priority: "critica", phase: 1, assignedTo: "Ana Torres", notes: "30% completado", createdAt: "2025-01-15", updatedAt: "2025-06-01" },
  { id: "g5", area: "Compras", description: "Eliminar duplicados en catalogo de articulos (sistema P5 - doble codigo)", type: "datos_maestros", status: "pendiente", priority: "alta", phase: 1, assignedTo: "Ana Torres", notes: "", createdAt: "2025-02-01", updatedAt: "2025-02-01" },
  { id: "g6", area: "Almacen", description: "Definir y configurar multiunidades (UdM compra vs almacen vs produccion)", type: "datos_maestros", status: "en_progreso", priority: "alta", phase: 1, assignedTo: "Miguel Hernandez", notes: "Equivalencias definidas para 60% de articulos", createdAt: "2025-02-01", updatedAt: "2025-05-15" },
  { id: "g7", area: "Finanzas", description: "Configurar dimension Proyecto en plan de cuentas para costeo por folio", type: "datos_maestros", status: "pendiente", priority: "critica", phase: 1, assignedTo: "Patricia Lopez", notes: "Requiere decision de estructura contable", createdAt: "2025-02-15", updatedAt: "2025-02-15" },
  { id: "g8", area: "Produccion", description: "Definir rutas y centros de trabajo estandar por planta", type: "datos_maestros", status: "pendiente", priority: "alta", phase: 1, assignedTo: "Laura Garcia", notes: "", createdAt: "2025-03-01", updatedAt: "2025-03-01" },
  { id: "g9", area: "Compras", description: "Depurar OC acumuladas desde 2021 que distorsionan calculos", type: "datos_maestros", status: "pendiente", priority: "alta", phase: 1, assignedTo: "Ana Torres", notes: "~500 OC por revisar", createdAt: "2025-03-01", updatedAt: "2025-03-01" },
  { id: "g10", area: "Produccion", description: "Cerrar ~300 ordenes de produccion abiertas sin actualizar", type: "datos_maestros", status: "pendiente", priority: "media", phase: 1, assignedTo: "Laura Garcia", notes: "", createdAt: "2025-03-15", updatedAt: "2025-03-15" },
  { id: "g11", area: "Almacen", description: "Realizar inventario fisico completo antes del go-live", type: "datos_maestros", status: "pendiente", priority: "critica", phase: 1, assignedTo: "Miguel Hernandez", notes: "Programar para 2 semanas antes del go-live", createdAt: "2025-04-01", updatedAt: "2025-04-01" },
  { id: "g12", area: "Almacen", description: "Contabilizar inventario de consignacion actualmente invisible en sistema", type: "datos_maestros", status: "pendiente", priority: "alta", phase: 2, assignedTo: "Miguel Hernandez", notes: "", createdAt: "2025-04-01", updatedAt: "2025-04-01" },
  { id: "g13", area: "Finanzas", description: "Automatizar conciliacion bancaria (5,000+ lineas/mes manual)", type: "automatizacion", status: "diferido_fase2", priority: "alta", phase: 2, assignedTo: "Patricia Lopez", notes: "Solo Bajio esta automatizado", createdAt: "2025-04-15", updatedAt: "2025-04-15" },
  { id: "g14", area: "Finanzas", description: "Eliminar re-captura en flujo de recepcion a pago (4-5 pasos manuales)", type: "automatizacion", status: "diferido_fase2", priority: "media", phase: 2, assignedTo: "Patricia Lopez", notes: "", createdAt: "2025-04-15", updatedAt: "2025-04-15" },
  { id: "g15", area: "Ventas", description: "Crear cotizador/configurador de producto con precios por modelo y nivel", type: "automatizacion", status: "diferido_fase2", priority: "media", phase: 3, assignedTo: "Carlos Mendoza", notes: "", createdAt: "2025-05-01", updatedAt: "2025-05-01" },
  { id: "g16", area: "Produccion", description: "Implementar tablero Kanban con captura de avance en kiosco", type: "automatizacion", status: "diferido_fase2", priority: "alta", phase: 2, assignedTo: "Laura Garcia", notes: "", createdAt: "2025-05-01", updatedAt: "2025-05-01" },
  { id: "g17", area: "TI", description: "Decidir sobre migracion de SVisio (sistema actual de seguimiento)", type: "integracion", status: "pendiente", priority: "media", phase: 1, assignedTo: "Carlos Mendoza", notes: "Evaluar si se reemplaza completamente", createdAt: "2025-05-15", updatedAt: "2025-05-15" },
  { id: "g18", area: "Calidad", description: "Definir fronteras de calidad como gates de liberacion en produccion", type: "workflow", status: "pendiente", priority: "alta", phase: 2, assignedTo: "Sofia Morales", notes: "", createdAt: "2025-05-15", updatedAt: "2025-05-15" },
  { id: "g19", area: "Compras", description: "Completar datos de proveedores (cuenta bancaria, correo) para pagos automaticos", type: "datos_maestros", status: "en_progreso", priority: "media", phase: 1, assignedTo: "Ana Torres", notes: "40% completado", createdAt: "2025-05-20", updatedAt: "2025-06-01" },
  { id: "g20", area: "Finanzas", description: "Reparar candado de facturas duplicadas (dejo de funcionar)", type: "automatizacion", status: "resuelto", priority: "critica", phase: 1, assignedTo: "Patricia Lopez", notes: "Implementado por UUID de CFDI en nueva app", createdAt: "2025-01-20", updatedAt: "2025-06-01" },
]

// --- Checklist go-live ---
const checklist: ChecklistItem[] = [
  { id: "cl1", label: "BOMs estandarizados y validados", description: "Todas las 231 especificaciones revisadas con formato unificado", completed: false, area: "Ingenieria", completedAt: null, completedBy: "" },
  { id: "cl2", label: "Catalogo de articulos enriquecido", description: "100% de articulos activos con proveedor, precio y lead time", completed: false, area: "Compras", completedAt: null, completedBy: "" },
  { id: "cl3", label: "OC antiguas depuradas", description: "Todas las OC anteriores a 2024 revisadas y cerradas/canceladas", completed: false, area: "Compras", completedAt: null, completedBy: "" },
  { id: "cl4", label: "OPs abiertas cerradas/canceladas", description: "300 ordenes de produccion abiertas sin actividad cerradas", completed: false, area: "Produccion", completedAt: null, completedBy: "" },
  { id: "cl5", label: "Inventario fisico realizado", description: "Conteo fisico completo en ambas plantas y almacen de servicios", completed: false, area: "Almacen", completedAt: null, completedBy: "" },
  { id: "cl6", label: "Plan de cuentas con dimension Proyecto", description: "Estructura contable configurada para costeo por folio TPS", completed: false, area: "Finanzas", completedAt: null, completedBy: "" },
  { id: "cl7", label: "Proveedores con cuenta bancaria y correo", description: "Datos completos para pagos automaticos", completed: false, area: "Compras", completedAt: null, completedBy: "" },
  { id: "cl8", label: "Rutas y centros de trabajo definidos", description: "Rutas de manufactura estandar por modelo y planta", completed: false, area: "Produccion", completedAt: null, completedBy: "" },
  { id: "cl9", label: "Usuarios y permisos configurados", description: "30-50 usuarios con roles y permisos por area", completed: true, area: "TI", completedAt: "2025-06-01", completedBy: "Carlos Mendoza" },
  { id: "cl10", label: "Capacitacion de key users completada", description: "Key users de cada area capacitados en modulos correspondientes", completed: false, area: "TI", completedAt: null, completedBy: "" },
]

// --- Decisiones ---
const decisions: Decision[] = [
  { id: "d1", description: "Migrar SVisio o mantenerlo en paralelo?", impact: "SVisio es el sistema actual de seguimiento de produccion. Migrarlo implica reconstruir toda la logica de seguimiento en el ERP.", options: "Opcion A: Migrar completamente. Opcion B: Mantener SVisio para produccion y usar ERP solo para planeacion. Opcion C: Fase 1 con ambos, migrar en Fase 2.", status: "pendiente", decidedBy: "", decidedAt: null, resolution: "", linkedGapIds: ["g17"], createdAt: "2025-05-15" },
  { id: "d2", description: "Mantener Clear Mechanic para servicio postventa?", impact: "Clear Mechanic maneja el taller de servicio actualmente. Reemplazarlo requiere modulo completo de servicio en el ERP.", options: "Opcion A: Mantener Clear Mechanic. Opcion B: Integrar via API. Opcion C: Reemplazar en Fase 3.", status: "decidido", decidedBy: "Carlos Mendoza", decidedAt: "2025-06-01", resolution: "Mantener Clear Mechanic en Fase 1-2, evaluar reemplazo en Fase 3", linkedGapIds: [], createdAt: "2025-05-15" },
  { id: "d3", description: "Estructura de codigos de articulo: mantener sistema P5 o unificar?", impact: "El sistema P5 genera 2 codigos por producto (fabricacion interna vs compra). Unificar elimina duplicados pero requiere migracion masiva.", options: "Opcion A: Unificar con nuevo esquema de codificacion. Opcion B: Mantener P5 con referencia cruzada. Opcion C: Migrar gradualmente.", status: "pendiente", decidedBy: "", decidedAt: null, resolution: "", linkedGapIds: ["g5"], createdAt: "2025-06-01" },
]

// --- LMAT 2.0: Especificaciones Tecnicas ---
const specifications: TechnicalSpecification[] = [
  {
    id: "spec1",
    code: "ESP-LC300-NIII-2025",
    brand: "Toyota",
    model: "Land Cruiser 300",
    year: "2022-2025",
    armorLevel: "NIII",
    designType: "alto_volumen",
    version: 3,
    status: "liberado",
    protectionByZone: [
      { zone: "Techo", thickness: "6mm", material: "Acero Balistico", overlapType: "Traslape 50mm" },
      { zone: "Puertas", thickness: "6mm + Kevlar", material: "Acero + Compuesto", overlapType: "Traslape 30mm" },
      { zone: "Motor", thickness: "4mm", material: "Acero Balistico", overlapType: "Sin traslape" },
      { zone: "Piso", thickness: "4mm", material: "Acero Balistico", overlapType: "Traslape 25mm" },
    ],
    specialComponents: ["Cristal parabrisas NIII 45mm", "Cristales laterales NIII 38mm"],
    optionalAccessories: ["Run Flat R18", "Sirena bidireccional", "Luces estroboscopicas"],
    bomIds: ["bom1"],
    productionRoutes: [{ plant: "planta_1", cells: ["Celda 1", "Celda 2", "Celda 3", "Celda 4", "Celda 5", "Celda 6", "Celda 7"], isActive: true }],
    cuttingKits: [],
    documents: [],
    changeHistory: [
      { id: "sch1-1", changedBy: "Roberto Silva", changedAt: "2025-01-20", changeType: "Creacion", description: "Especificacion inicial" },
      { id: "sch1-2", changedBy: "Roberto Silva", changedAt: "2025-05-10", changeType: "Actualizacion", description: "Actualizacion de cantidades de acero" },
    ],
    createdAt: "2025-01-20",
    updatedAt: "2025-05-10",
    createdBy: "u3",
  },
  {
    id: "spec2",
    code: "ESP-SUBURBAN-NIV-2025",
    brand: "Chevrolet",
    model: "Suburban",
    year: "2021-2025",
    armorLevel: "NIV",
    designType: "alto_volumen",
    version: 2,
    status: "liberado",
    protectionByZone: [
      { zone: "Techo", thickness: "8mm", material: "Acero Balistico", overlapType: "Traslape 50mm" },
      { zone: "Puertas", thickness: "8mm + Kevlar", material: "Acero + Compuesto", overlapType: "Traslape 40mm" },
      { zone: "Motor", thickness: "6mm", material: "Acero Balistico", overlapType: "Sin traslape" },
      { zone: "Piso", thickness: "6mm", material: "Acero Balistico", overlapType: "Traslape 30mm" },
    ],
    specialComponents: ["Cristal parabrisas NIV 55mm", "Cristales laterales NIV 48mm"],
    optionalAccessories: ["Run Flat R20", "Torretas LED", "Sistema de comunicacion"],
    bomIds: ["bom2"],
    productionRoutes: [{ plant: "planta_1", cells: ["Celda 1", "Celda 2", "Celda 3", "Celda 4", "Celda 5", "Celda 6", "Celda 7"], isActive: true }],
    cuttingKits: [],
    documents: [],
    changeHistory: [],
    createdAt: "2025-02-01",
    updatedAt: "2025-04-20",
    createdBy: "u3",
  },
  {
    id: "spec3",
    code: "ESP-EXPLORER-NIII+-2025",
    brand: "Ford",
    model: "Explorer",
    year: "2020-2025",
    armorLevel: "NIII_plus",
    designType: "bajo_volumen",
    version: 1,
    status: "estabilizado",
    protectionByZone: [
      { zone: "Techo", thickness: "6mm", material: "Acero Balistico", overlapType: "Traslape 40mm" },
      { zone: "Puertas", thickness: "6mm + Kevlar", material: "Acero + Compuesto", overlapType: "Traslape 30mm" },
    ],
    specialComponents: ["Cristal parabrisas NIII+ 48mm"],
    optionalAccessories: ["Run Flat R18"],
    bomIds: ["bom3"],
    productionRoutes: [{ plant: "planta_2", cells: ["Celda 1", "Celda 2", "Celda 3", "Celda 4"], isActive: true }],
    cuttingKits: [],
    documents: [],
    changeHistory: [],
    createdAt: "2025-03-01",
    updatedAt: "2025-03-01",
    createdBy: "u9",
  },
]

// --- LMAT 2.0: ECNs ---
const ecns: ECN[] = [
  {
    id: "ecn1",
    code: "ECN-2025-001",
    status: "completado",
    requestedBy: "Roberto Silva",
    requestedAt: "2025-03-10",
    justification: "Incrementar cantidad de acero por feedback de produccion - refuerzo insuficiente en zona de bisagras",
    affectedBOMIds: ["bom1"],
    affectedArticleIds: ["a1"],
    affectedFolios: ["4520", "4521"],
    inventoryImpact: "Sin impacto - se incrementa consumo",
    approvals: [
      { department: "Ingenieria", approvedBy: "Roberto Silva", approvedAt: "2025-03-11", status: "aprobado", notes: "" },
      { department: "Manufactura", approvedBy: "Laura Garcia", approvedAt: "2025-03-12", status: "aprobado", notes: "" },
      { department: "Compras", approvedBy: "Ana Torres", approvedAt: "2025-03-13", status: "aprobado", notes: "Proveedor confirmado" },
      { department: "Calidad", approvedBy: "Sofia Morales", approvedAt: "2025-03-14", status: "aprobado", notes: "" },
    ],
    effectivity: "A partir del folio 4522",
    appliedAt: "2025-03-15",
    appliedBy: "Roberto Silva",
    changes: [
      { type: "modificar", articleId: "a1", articleCode: "ACB-6MM-001", field: "quantity", oldValue: "6", newValue: "8" },
    ],
    notifiedAreas: ["Maquinados", "Almacen", "Compras", "Produccion"],
    createdAt: "2025-03-10",
    updatedAt: "2025-03-15",
  },
  {
    id: "ecn2",
    code: "ECN-2025-002",
    status: "aprobacion",
    requestedBy: "Fernando Diaz",
    requestedAt: "2025-06-01",
    justification: "Cambiar proveedor de cristales por obsolescencia del anterior - nuevo proveedor con mejor calidad",
    affectedBOMIds: ["bom3", "bom4"],
    affectedArticleIds: ["a4", "a5"],
    affectedFolios: [],
    inventoryImpact: "5 cristales en inventario del proveedor anterior - usar hasta agotar",
    approvals: [
      { department: "Ingenieria", approvedBy: "Roberto Silva", approvedAt: "2025-06-02", status: "aprobado", notes: "" },
      { department: "Manufactura", approvedBy: "Laura Garcia", approvedAt: "2025-06-03", status: "aprobado", notes: "" },
      { department: "Compras", approvedBy: null, approvedAt: null, status: "pendiente", notes: "" },
      { department: "Calidad", approvedBy: null, approvedAt: null, status: "pendiente", notes: "" },
    ],
    effectivity: "Inmediato al agotar inventario actual",
    appliedAt: null,
    appliedBy: null,
    changes: [
      { type: "modificar", articleId: "a4", articleCode: "CB-DEL-NIII-001", field: "proveedor", oldValue: "Cristales Blindados SA", newValue: "Cristales Premium MX" },
    ],
    notifiedAreas: [],
    createdAt: "2025-06-01",
    updatedAt: "2025-06-03",
  },
  {
    id: "ecn3",
    code: "ECN-2025-003",
    status: "solicitud",
    requestedBy: "Ana Torres",
    requestedAt: "2025-06-10",
    justification: "Agregar componente de refuerzo adicional en puertas traseras por requerimiento de cliente",
    affectedBOMIds: ["bom2"],
    affectedArticleIds: [],
    affectedFolios: ["4522"],
    inventoryImpact: "Requiere compra de nuevo material",
    approvals: VALIDATION_DEPARTMENTS.map(dept => ({ department: dept, approvedBy: null, approvedAt: null, status: "pendiente" as const, notes: "" })),
    effectivity: "Por definir",
    appliedAt: null,
    appliedBy: null,
    changes: [
      { type: "agregar", articleId: "", articleCode: "NUEVO", field: "componente", oldValue: "", newValue: "Refuerzo puerta trasera" },
    ],
    notifiedAreas: [],
    createdAt: "2025-06-10",
    updatedAt: "2025-06-10",
  },
]

// --- LMAT 2.0: Supply Kits ---
const supplyKits: SupplyKit[] = [
  {
    id: "sk1",
    process: "blindaje",
    cell: "Celda 2",
    folio: "4521",
    specificationId: "spec1",
    bomId: "bom1",
    items: [
      { id: "ski1-1", articleId: "a1", articleCode: "ACB-6MM-001", articleDescription: "Placa de acero balistico 6mm", quantityBOM: 8, quantitySupplied: 8, quantityBackorder: 0, udm: "placa", scanned: true, scannedAt: "2025-06-10T10:30:00" },
      { id: "ski1-2", articleId: "a2", articleCode: "ACB-8MM-001", articleDescription: "Placa de acero balistico 8mm", quantityBOM: 4, quantitySupplied: 4, quantityBackorder: 0, udm: "placa", scanned: true, scannedAt: "2025-06-10T10:32:00" },
      { id: "ski1-3", articleId: "a8", articleCode: "KEV-R150-001", articleDescription: "Kevlar rollo 1.5m x 50m", quantityBOM: 2, quantitySupplied: 2, quantityBackorder: 0, udm: "rollo", scanned: true, scannedAt: "2025-06-10T10:35:00" },
    ],
    status: "entregado",
    preparedBy: "Miguel Hernandez",
    preparedAt: "2025-06-10T10:00:00",
    deliveredTo: "Juan Ramirez",
    deliveredAt: "2025-06-10T10:45:00",
    supervisorConfirmed: true,
    hasBackorder: false,
    backorderNotes: "",
    createdAt: "2025-06-10T09:00:00",
  },
  {
    id: "sk2",
    process: "blindaje",
    cell: "Celda 3",
    folio: "4521",
    specificationId: "spec1",
    bomId: "bom1",
    items: [
      { id: "ski2-1", articleId: "a4", articleCode: "CB-DEL-NIII-001", articleDescription: "Cristal blindado parabrisas delantero NIII", quantityBOM: 1, quantitySupplied: 1, quantityBackorder: 0, udm: "pieza", scanned: true, scannedAt: "2025-06-11T09:00:00" },
      { id: "ski2-2", articleId: "a5", articleCode: "CB-LAT-NIII-001", articleDescription: "Cristal blindado lateral delantero NIII", quantityBOM: 1, quantitySupplied: 1, quantityBackorder: 0, udm: "par", scanned: true, scannedAt: "2025-06-11T09:05:00" },
      { id: "ski2-3", articleId: "a6", articleCode: "CB-TRAS-NIII-001", articleDescription: "Cristal blindado trasero NIII", quantityBOM: 1, quantitySupplied: 0, quantityBackorder: 1, udm: "pieza", scanned: false, scannedAt: null },
    ],
    status: "parcial",
    preparedBy: "Miguel Hernandez",
    preparedAt: "2025-06-11T08:30:00",
    deliveredTo: "Juan Ramirez",
    deliveredAt: "2025-06-11T09:15:00",
    supervisorConfirmed: false,
    hasBackorder: true,
    backorderNotes: "Cristal trasero en transito - llega 2025-06-12",
    createdAt: "2025-06-11T08:00:00",
  },
  {
    id: "sk3",
    process: "armado",
    cell: "Celda 4",
    folio: "4522",
    specificationId: "spec2",
    bomId: "bom2",
    items: [
      { id: "ski3-1", articleId: "a10", articleCode: "TH-3/8-001", articleDescription: "Tornillo hexagonal 3/8\" x 1\" grado 8", quantityBOM: 200, quantitySupplied: 0, quantityBackorder: 0, udm: "pieza", scanned: false, scannedAt: null },
      { id: "ski3-2", articleId: "a11", articleCode: "TA-M6-001", articleDescription: "Tornillo Allen M6 x 20mm inoxidable", quantityBOM: 120, quantitySupplied: 0, quantityBackorder: 0, udm: "pieza", scanned: false, scannedAt: null },
      { id: "ski3-3", articleId: "a22", articleCode: "HB-PTA-001", articleDescription: "Herraje bisagra puerta blindada reforzada", quantityBOM: 10, quantitySupplied: 0, quantityBackorder: 0, udm: "pieza", scanned: false, scannedAt: null },
    ],
    status: "pendiente",
    preparedBy: null,
    preparedAt: null,
    deliveredTo: null,
    deliveredAt: null,
    supervisorConfirmed: false,
    hasBackorder: false,
    backorderNotes: "",
    createdAt: "2025-06-12T07:00:00",
  },
]

// --- LMAT 2.0: Cutting Kits ---
const cuttingKits: CuttingKit[] = [
  {
    id: "ck1",
    name: "Kit Corte Puertas LC300 NIII",
    specificationId: "spec1",
    cncProgramVersion: "v2.1",
    cncProgramUrl: "/programs/LC300-PUERTAS-v2.1.dxf",
    components: [],
    usedInFolios: ["4520", "4521"],
    createdAt: "2025-01-20",
    updatedAt: "2025-03-15",
  },
  {
    id: "ck2",
    name: "Kit Corte Techo LC300 NIII",
    specificationId: "spec1",
    cncProgramVersion: "v1.3",
    cncProgramUrl: "/programs/LC300-TECHO-v1.3.dxf",
    components: [],
    usedInFolios: ["4520", "4521"],
    createdAt: "2025-01-20",
    updatedAt: "2025-02-10",
  },
]

// --- Estado inicial ---
export function createInitialState(): AppState {
  return {
    articles,
    boms,
    projects,
    suppliers,
    clients,
    gaps,
    decisions,
    checklist,
    users,
    auditLog: [],
    // LMAT 2.0
    specifications,
    ecns,
    supplyKits,
    cuttingKits,
    // UI
    currentUser: users[0],
    currentPlant: "todas",
    lastUpdated: new Date().toISOString(),
  }
}
