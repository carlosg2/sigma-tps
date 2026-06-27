=== CONTEXTO DEL NEGOCIO ===

TPS es una empresa de manufactura de blindaje vehicular con 3 líneas de negocio:
1. Manufactura de Blindados — ~20 vehículos/mes, ciclo de ~1 mes, 2 plantas con estándares distintos
2. Taller de Servicio Postventa — Reparaciones, refacciones, garantías
3. Renta de Vehículos — Flota propia, contratos, traslados

Opera con ~18 áreas, ~30-50 usuarios, ~6,000 artículos en catálogo (~3,000 activos), ~231 especificaciones/BOMs vigentes, y 7-8 cuentas bancarias.

Hoy TODO se hace en Excel, correo y WhatsApp. 20+ procesos críticos son manuales. No hay trazabilidad del ciclo de vida de un vehículo (cotización → producción → facturación → cobro → costo).

=== LOS 7 PROBLEMAS A RESOLVER ===

PROBLEMA 1: BOMs incorrectos o incompletos
- 10-15% de errores por BOM (códigos inexistentes, cantidades incorrectas, UdM equivocadas)
- ~231 especificaciones vigentes con cientos de componentes cada una
- 2 plantas con estructuras diferentes (Planta 1 usa SolidWorks, Planta 2 usa AutoCAD 2D)
- No hay control de revisiones: al modificar un BOM se pierde la versión anterior
- No hay ECN/ECO (Engineering Change Notice/Order)
- Un cambio de componente que aplica a 100 especificaciones requiere 100 modificaciones manuales → necesita cambio masivo selectivo
- Los BOMs de Dynamics no son confiables; Ingeniería usa Excel
- Almacén detectó 200-300+ errores en BOMs al surtir kits
- Consenso: separar BOM de ingeniería (listado concentrado) de BOM de surtimiento (distribución por kits/celdas para almacén)

PROBLEMA 2: Catálogo de artículos deficiente
- ~6,000 artículos, ~50% sin lead time, proveedor ni precio
- Cualquiera puede crear artículos sin validación → duplicados masivos
- Sistema "P5": un mismo producto tiene 2 códigos (fabricación interna vs. compra)
- Sin clasificación ABC en el sistema
- Fórmula de reabastecimiento que depende de datos completos:
  Solicitud = Req. LMAT - Material en WIP - Inventario - OC pendientes - SC pendientes
  Si falta cualquier variable, el cálculo falla.

PROBLEMA 3: Operación manual generalizada (20+ procesos en Excel/correo/WhatsApp)
- Plan de producción: Excel compartido (~60 líneas)
- Explosión de materiales: Macros en Excel
- Facturación: 100% manual copy-paste
- Conciliación bancaria: Excel (5,000+ líneas/mes)
- Cotización de ventas: solo correo electrónico
- Seguimiento de producción: recorrido físico + Excel con colores
- Clasificación ABC: macros en Excel
- Cada dato se re-captura 3-5 veces en diferentes formatos

PROBLEMA 4: Sin trazabilidad de proyecto/folio
- El folio TPS (4 dígitos) es el identificador universal pero no está en el ERP
- Anticipo NO relacionado con cotización
- No hay orden de venta formal
- Factura manual no ligada a costos
- Necesidad: 5ª dimensión "Proyecto" → estado de resultados por vehículo

PROBLEMA 5: Inconsistencia de unidades de medida
- Compra en una UdM, almacén en otra, producción en otra
- Placas de acero: 5 meses de lead time, UdM "pieza" en vez de "placa", no permite fracciones
- Restricción de 2 decimales
- Multiunidades: UdM de producción, compra, almacenamiento y venta con equivalencias

PROBLEMA 6: Consignación no contabilizada
- Material de consignación NO está en el sistema → inventario invisible
- OC acumuladas desde 2021 distorsionan cálculos de reabastecimiento
- ~300 órdenes de producción abiertas sin actualizar

PROBLEMA 7: Flujo financiero desconectado
- De recepción a pago: 4-5 pasos manuales con re-captura
- Solo 1 de 7-8 bancos automatizado (Bajío)
- ~5,000 líneas mensuales de conciliación manual
- Facturas duplicadas: el candado dejó de funcionar
- CxP desaplica pagos sin notificar a Tesorería

=== REQUERIMIENTOS FUNCIONALES DE LA APP ===

La app debe tener estos módulos:

### MÓDULO 1: GESTIÓN DE BOMs (Listas de Materiales)
- CRUD de BOMs con versionamiento automático (cada cambio crea nueva versión, NUNCA sobreescribe)
- Historial completo de revisiones con diff visual (qué cambió, quién, cuándo, por qué)
- Soporte para 2 vistas del mismo BOM:
  - BOM de Ingeniería: listado concentrado de todos los componentes del vehículo
  - BOM de Surtimiento: distribución por kits/celdas para almacén (7 celdas Planta 1, 4 celdas Planta 2)
- Cambio masivo selectivo: "cambiar componente X por Y en las especificaciones seleccionadas" con preview antes de aplicar
- Flujo de ECN (Engineering Change Notice): solicitud → análisis de impacto (qué BOMs afecta) → aprobación → aplicación → notificación
- Validación automática: que cada componente del BOM exista en el catálogo de artículos y tenga todos los campos obligatorios
- Indicador de salud del BOM: % de componentes con datos completos, alertas de errores
- Importación masiva desde Excel (el formato real que usan las 2 plantas)
- Comparativo BOM vs. consumo real: tabla que muestre lo que dice el BOM contra lo que realmente se consumió en producción
- Búsqueda "where-used": dado un artículo, ¿en qué BOMs aparece?

### MÓDULO 2: CATÁLOGO DE ARTÍCULOS (Datos Maestros)
- CRUD de artículos con campos obligatorios por etapa:
  - Ingeniería: descripción, UdM base, dibujo/plano, grupo
  - Compras: proveedor principal, precio, UdM de compra, lead time
  - Almacén: ubicación, UdM de almacenamiento, máximo/mínimo
  - Producción: ruta, centro de trabajo
  - Calidad: grupo de calidad, inspección requerida (sí/no)
- Flujo de alta de artículo: Ingeniería solicita → Compras completa → Almacén completa → Producción completa → Calidad valida → Artículo liberado
- NO se puede usar un artículo en un BOM, solicitud de compra ni OP si no tiene TODOS los campos obligatorios
- Detección automática de duplicados (por descripción similar, código P5, proveedor)
- Clasificación ABC automática calculada desde consumo histórico
- Multi-unidades: configurar equivalencias entre UdM de compra, almacén, producción y venta
- Dashboard de completitud: % de artículos completos por campo, por área responsable
- Importación/exportación masiva desde Excel
- Alertas de artículos sin proveedor, sin precio, sin lead time

### MÓDULO 3: TRAZABILIDAD POR PROYECTO/FOLIO (Ciclo de Vida del Vehículo)
- Cada vehículo es un "Proyecto" identificado por folio TPS (4 dígitos)
- Timeline visual del proyecto mostrando todas las etapas:
  Cotización → Anticipo → Pedido en firme → Planeación → Producción → Calidad → Facturación → Cobro
- Estado actual de cada folio con semáforo (verde/amarillo/rojo)
- Acumulación de costos en tiempo real por folio:
  - Material (BOM × precio estándar vs. consumo real × costo promedio)
  - Mano de obra (horas reportadas × costo/hora por centro de trabajo)
  - GIF (Gastos Indirectos de Fabricación — prorrateo configurable)
  - Servicios de terceros / maquilados
- Estado de resultados por proyecto: Precio de venta - Costo total = Margen
- Dashboard ejecutivo: tabla de todos los folios activos con estatus, días en producción, % avance, costo acumulado, margen estimado
- Filtros por planta, modelo, nivel de blindaje, estatus, rango de fechas
- Vinculación de documentos: cotización, anticipo, OC, OP, facturas, complementos de pago → todo ligado al folio

### MÓDULO 4: GESTIÓN DE PRODUCCIÓN Y AVANCE
- Tablero Kanban de producción: cada folio como tarjeta que se mueve entre etapas (Despiece → Blindaje → Ensamble → Vestidura → Calidad → Terminado)
- Captura de avance simplificada tipo kiosco (2-3 toques máximo):
  - El operador selecciona su nombre, selecciona el folio, marca avance → listo
  - Diseño para tablets/pantallas táctiles en piso
- Registro de horas por folio, etapa y operador
- Alertas automáticas cuando un folio excede el tiempo estándar por etapa
- Dashboard de planta: vista de todas las bahías/celdas con qué folio está en cada una
- Integración con fronteras de calidad: liberaciones que desbloquean la siguiente etapa
- Reportes: productividad por operador, por celda, por etapa; comparativo real vs. estándar

### MÓDULO 5: GESTIÓN DE COMPRAS Y REABASTECIMIENTO
- Solicitudes de compra automáticas basadas en:
  Solicitud = Requerimiento LMAT - Material en WIP - Inventario - OC pendientes - SC pendientes
- Tablero de solicitudes pendientes con prioridad (fecha requerida vs. lead time)
- Flujo de autorización digital con motivo de rechazo obligatorio
- El autorizador ve el detalle completo (qué se compra, para qué folio, monto, historial de precios)
- Seguimiento de OC: estatus (emitida → confirmada → en tránsito → recibida parcial → recibida completa → facturada → pagada)
- Alertas de OC pendientes antiguas (> 30, 60, 90 días) para depuración
- Comparativo de precios por artículo (último precio, precio promedio, precio más bajo histórico, proveedor)

### MÓDULO 6: ALMACENES E INVENTARIOS
- Inventario en tiempo real por almacén y localidad
- Gestión de kits para producción:
  - Generar kit automáticamente desde BOM de surtimiento + folio
  - Checklist de surtimiento (qué falta, qué hay, qué está en camino)
  - Marcar kit como completo/incompleto
- Transferencias entre plantas con trazabilidad
- Gestión de consignación:
  - Inventario de consignación separado del propio
  - Conciliación periódica con proveedor
  - Conversión de consignación a compra
- Cuarentena/rechazo: estatus que saca el material del inventario disponible
- Inventario cíclico con programa de conteos y variaciones
- Alertas de mínimos/máximos, artículos sin movimiento

### MÓDULO 7: FLUJO FINANCIERO (CxP + Tesorería)
- Generación automática de provisión de CxP desde recepción de almacén (ELIMINAR re-captura)
- Programación de pagos con prioridades y flujo de caja proyectado
- Generación de layouts de pago para bancos (formato por banco)
- Candado de duplicidad de facturas (por UUID de CFDI)
- Notificación automática cuando se ejecuta un pago (al solicitante, al proveedor, a CxP)
- Dashboard de CxP: antigüedad de saldos, vencimientos próximos, concentración por proveedor
- Conciliación bancaria asistida: importar estado de cuenta, match automático con movimientos del sistema, marcar solo las diferencias
- Control de caja chica con reembolsos
- Registro de préstamos interfiliales con vencimientos

### MÓDULO 8: COTIZADOR / CONFIGURADOR DE PRODUCTO
- Configurador visual por modelo de vehículo + nivel de blindaje:
  - Seleccionar modelo base (Toyota, Ford, Chevrolet, etc.)
  - Seleccionar nivel de blindaje (III, III+, IV, V)
  - Seleccionar accesorios opcionales (cristales, posiciones, agregados)
  - Cada selección tiene precio y componentes (liga a BOM)
- Campos obligatorios que NO permiten generar cotización incompleta
- Flujo de factibilidad: si el requerimiento NO está en catálogo estándar → solicitud a Ingeniería para validación
- Cotización genera automáticamente: folio de proyecto, BOM preliminar, lista de materiales a comprar
- Conversión cotización → pedido → orden de producción sin re-captura

### MÓDULO 9: DASHBOARD EJECUTIVO Y REPORTES
- Vista gerencial con KPIs en tiempo real:
  - Vehículos en producción (por planta, modelo, estatus)
  - Backlog de producción (vehículos por iniciar)
  - Margen promedio por modelo/nivel
  - Días promedio de ciclo (cotización a entrega)
  - Cash flow proyectado
  - Top 10 artículos por costo
  - % de completitud de datos maestros
- Estado de resultados por proyecto/folio
- Reporte de productividad por celda/operador/etapa
- Reporte de compras: lead time real vs. estándar, cumplimiento de proveedores
- Reporte de inventario: rotación, cobertura, ABC, artículos sin movimiento
- Antigüedad de CxP y CxC
- Exportación a Excel/PDF de todos los reportes

### MÓDULO 10: GESTIÓN DE LA IMPLEMENTACIÓN DEL ERP (Project Management)
- Tracking de los 137 GAPs identificados por área con estatus (Pendiente / En progreso / Resuelto / Diferido a Fase 2)
- Checklist de prerequisitos para el go-live:
  - [ ] BOMs estandarizados y validados
  - [ ] Catálogo de artículos enriquecido
  - [ ] OC antiguas depuradas
  - [ ] OPs abiertas cerradas/canceladas
  - [ ] Inventario físico realizado
  - [ ] Plan de cuentas con dimensión Proyecto
  - [ ] Proveedores con cuenta bancaria y correo
  - [ ] Rutas y centros de trabajo definidos
- Dashboard de progreso de saneamiento de datos: barras de progreso por dato maestro
- Cronograma de implementación por olas con dependencias
- Registro de decisiones pendientes (e.g., ¿migrar SVisio?, ¿mantener Clear Mechanic?)
- Bitácora de reuniones / minutas vinculadas a cada área y GAP
- Control de cambios: solicitud → análisis de impacto → aprobación → ejecución

### MÓDULO 11: NOTIFICACIONES Y WORKFLOWS
- Motor de notificaciones configurable (email + in-app + push):
  - Nuevo proyecto creado → notificar a Planeación, Ingeniería, Almacén
  - Material recibido → notificar a CxP, Solicitante
  - Kit listo → notificar a Producción
  - Frontera de calidad liberada → notificar a siguiente etapa
  - Pago ejecutado → notificar a CxP, Solicitante, Proveedor
  - BOM modificado → notificar a Almacén, Planeación, Compras
  - Artículo creado/modificado → notificar a áreas pendientes de completar datos
  - Autorización pendiente → recordatorio diario
- Flujos de aprobación configurables con escalamiento por tiempo
- Historial completo de notificaciones por usuario y por documento

### MÓDULO 12: RENTAS DE VEHÍCULOS
- Calendario visual de disponibilidad de flota (reemplaza Excel con colores)
- Contratos de renta con términos, cargos y vigencia
- Seguimiento de vehículos: ubicación, estatus (Disponible / Rentado / En servicio / En traslado)
- Facturación periódica automática según contrato
- Historial de mantenimiento por vehículo

=== REQUERIMIENTOS NO FUNCIONALES ===

- Stack: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Prisma + PostgreSQL
- Auth: NextAuth.js con roles (Admin, Gerente, Key User, Operador, Consultor Externo)
- Responsive: funcionar en desktop y tablets (kioscos en piso de producción)
- Idioma: español (toda la UI en español)
- Moneda: MXN (con soporte para USD en compras de importación)
- Multi-planta: filtrar todo por Planta 1, Planta 2, Almacén de Servicios
- Auditoría: log de todos los cambios (quién, qué, cuándo, valor anterior, valor nuevo)
- Importación/Exportación: soporte masivo desde/hacia Excel (.xlsx)
- Performance: manejar ~6,000 artículos, ~231 BOMs, ~50 usuarios concurrentes
- Deployment: Docker + Docker Compose para desarrollo local; preparado para deploy en cloud

=== ESTRUCTURA DE DATOS PRINCIPAL ===

Entidades clave (mínimo):
- User (id, name, email, role, area, plant)
- Article (id, code, description, udmPurchase, udmStorage, udmProduction, udmSale, conversions[], supplier, price, leadTimeDays, abcClass, location, qualityGroup, status[draft/pending/active/inactive], completeness%)
- BOM (id, specificationCode, vehicleModel, armorLevel, plant, version, status, components[])
- BOMComponent (id, bomId, articleId, quantity, udm, cell, operation, notes)
- BOMRevision (id, bomId, version, changedBy, changedAt, changeReason, diff)
- Project (id, folioTPS, vehicleModel, armorLevel, client, plant, status, quotationAmount, totalCost, margin)
- ProjectCost (id, projectId, type[material/labor/gif/service], amount, date, source)
- ProductionOrder (id, projectId, bomId, status, stages[])
- ProductionStage (id, orderId, stageName, startedAt, completedAt, operator, hoursWorked)
- PurchaseRequest (id, articleId, projectId, quantity, requiredDate, status, approvedBy, rejectionReason)
- PurchaseOrder (id, supplierId, lines[], status, createdAt)
- InventoryItem (id, articleId, warehouseId, location, quantityOnHand, quantityReserved, quantityInTransit, isConsignment)
- Kit (id, projectId, bomSurtimientoId, status[pending/partial/complete], lines[])
- Supplier (id, name, rfc, bankAccount, email, currency, paymentTerms)
- Client (id, name, rfc, creditTerms)
- AccountsPayable (id, supplierId, invoiceUUID, amount, dueDate, status, paymentDate)
- PaymentLayout (id, bankName, lines[], generatedAt)
- Notification (id, type, recipientId, message, read, createdAt, linkedEntity)
- GAP (id, area, description, type[masterData/automation/report/workflow/integration], status, phase, priority)
- ChangeRequest (id, description, impactAnalysis, estimatedCost, estimatedTime, status, approvedBy)
- RentalContract (id, vehicleId, clientId, startDate, endDate, monthlyRate, status)
- Vehicle (id, plate, model, armorLevel, status[available/rented/inService/inTransit], currentLocation)
- AuditLog (id, userId, entity, entityId, action, oldValue, newValue, timestamp)

=== PRIORIDAD DE IMPLEMENTACIÓN ===

Fase 1 (MVP — lanzar en 2 semanas):
1. Catálogo de artículos con dashboard de completitud + importación Excel
2. BOMs con versionamiento + importación Excel + where-used
3. Trazabilidad por folio/proyecto con timeline y costos
4. Dashboard de progreso de implementación (GAPs + checklist)

Fase 2 (+2 semanas):
5. Tablero de producción (Kanban + captura de avance en kiosco)
6. Solicitudes de compra + flujo de autorización
7. Notificaciones y workflows

Fase 3 (+2 semanas):
8. Inventarios + kits + consignación
9. Flujo financiero (CxP + layouts de pago + conciliación)
10. Cotizador/configurador de producto

Fase 4 (+2 semanas):
11. Rentas
12. Dashboard ejecutivo con todos los KPIs
13. Reportes exportables

=== ENTREGABLES ===

1. Código fuente completo en un monorepo
2. Schema de Prisma con todas las entidades y relaciones
3. Seed de datos de ejemplo realista (artículos de blindaje, BOMs de ejemplo, folios, proveedores)
4. Docker Compose para levantar el ambiente completo
5. README con instrucciones de setup
6. Cada módulo con su página, API routes y componentes
