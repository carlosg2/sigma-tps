# Guía de Pantallas — TPS ERP (sigma-tps)


---


## Módulo 1 — Ingeniería (LMAT)

Gestión de listas de materiales, especificaciones, cambios de ingeniería y surtimiento.

### `/lmat` — Dashboard de Ingeniería
https://sigma-tps.vercel.app/lmat
- **Descripción:** Panel de control con KPIs (BOMs totales, especificaciones, ECN pendientes, kits, validaciones, salud promedio), distribución por madurez y accesos rápidos.
- **Flujo de usuario:** Es la pantalla de entrada. Desde las tarjetas de KPI o los accesos rápidos saltas a cada sub-módulo.
- **Prueba:** Pulsa cada tarjeta de estadística; cada una enlaza a su listado correspondiente.

### `/lmat/boms` — Listado de BOMs
https://sigma-tps.vercel.app/lmat/boms
- **Descripción:** Tabla de todas las listas de materiales con búsqueda, filtros por estatus y madurez, orden por columnas y % de salud (completitud de datos).
- **Flujo de usuario:** Buscas/filtras → clic en una fila para abrir el detalle, o botón **Nuevo BOM**.
- **Prueba:** Escribe en el buscador (ej. "Suburban"), cambia el filtro de madurez y ordena por "Salud".

### `/lmat/boms/nuevo` — Crear BOM
https://sigma-tps.vercel.app/lmat/boms/nuevo
- **Descripción:** Formulario para dar de alta un BOM: código de especificación, modelo, nivel de blindaje, planta y agregado de componentes buscando artículos del catálogo.
- **Flujo de usuario:** Llenas cabecera → buscas artículos y los agregas con cantidad/celda → **Guardar**.
- **Prueba:** Crea uno con código `ESP-PRUEBA-001`, agrega 2-3 artículos y guarda; aparecerá en el listado.

### `/lmat/boms/[id]` — Detalle de BOM
https://sigma-tps.vercel.app/lmat/boms/bom1
- **Descripción:** Pantalla central de ingeniería. Incluye:
  - **3 vistas** del mismo BOM: Jerárquica (árbol arrastrable), BOM Plano (listado de Ingeniería) y Por Celda/Kit (surtimiento).
  - **Estado de madurez** y **validación por departamento** (Ingeniería, Manufactura, Compras, Almacén, Calidad, Contabilidad).
  - **Historial de revisiones** con comparación (diff) entre versiones.
  - Acciones: **Clonar** (genera variante en borrador), **Excel** (exporta CSV), **Imprimir**, **Crear Versión** y cambio de estatus.
  - **Edición de celda** por componente (en vista Jerárquica y BOM Plano) cuando el BOM no está aprobado/obsoleto.
  - ECNs relacionados.
- **Flujo de usuario:** Revisas el árbol → cambias a vista por celda para ver el surtimiento → editas celdas → creas una nueva versión documentando el motivo → consultas el historial.
- **Prueba:** Abre un BOM **en borrador** (ej. `ESP-005` / Chevrolet Tahoe). Cambia la celda de un componente con el dropdown, pulsa **Clonar** para crear una variante, y abre **Historial** para ver las revisiones.

### `/lmat/boms/importar` — Importar BOMs
https://sigma-tps.vercel.app/lmat/boms/importar
- **Descripción:** Importación masiva de BOMs desde CSV; permite descargar una plantilla base.
- **Flujo de usuario:** Descargas plantilla → la llenas → (a futuro) la subes.
- **Prueba:** Pulsa **Descargar Plantilla CSV** y revisa el formato esperado.

### `/lmat/boms/cambio-masivo` — Cambio Masivo de Componente
https://sigma-tps.vercel.app/lmat/boms/cambio-masivo
- **Descripción:** Reemplaza un artículo por otro en múltiples BOMs a la vez, con vista previa de los BOMs afectados y propagación automática de versiones.
- **Flujo de usuario:** Buscas el artículo viejo → buscas el nuevo → seleccionas los BOMs afectados → indicas motivo → aplicas.
- **Prueba:** Busca un componente común (ej. un tornillo), elige uno nuevo, marca 1-2 BOMs y aplica; verás que crean nueva versión.

### `/lmat/especificaciones` — Especificaciones Técnicas
https://sigma-tps.vercel.app/lmat/especificaciones
- **Descripción:** Catálogo de especificaciones de blindaje por marca/modelo/año/nivel, con filtros por marca y madurez.
- **Flujo de usuario:** Filtras por marca → abres una especificación.
- **Prueba:** Filtra por "Toyota" y abre una ficha.

### `/lmat/especificaciones/[id]` — Detalle de Especificación
https://sigma-tps.vercel.app/lmat/especificaciones/spec3
- **Descripción:** Ficha técnica con protección por zona, componentes especiales, accesorios, BOMs asociados, rutas de producción, kits de corte, documentos e historial de cambios.
- **Flujo de usuario:** Consultas el blindaje por zona y navegas a los BOMs vinculados.
- **Prueba:** Abre `ESP-LC300-NIII-2025` y revisa las pestañas de contenido.

### `/lmat/ecn` — Listado de ECN (Cambios de Ingeniería)
https://sigma-tps.vercel.app/lmat/ecn
- **Descripción:** Lista de Engineering Change Notices con filtro por estatus (solicitud → análisis → aprobación → aplicación → completado).
- **Flujo de usuario:** Filtras por estatus → abres un ECN.
- **Prueba:** Filtra "En Aprobación" y abre uno.

### `/lmat/ecn/[id]` — Detalle de ECN
https://sigma-tps.vercel.app/lmat/ecn/ecn3
- **Descripción:** Ficha de cambio con justificación, BOMs/folios afectados, **impacto en inventario, costo, tiempo y materiales/MO de aditiva**, flujo de aprobación por departamento y efectividad (a partir de qué folio aplica).
- **Flujo de usuario:** Revisas impacto → apruebas/rechazas por departamento → al completar, defines efectividad.
- **Prueba:** Abre un ECN en aprobación y pulsa aprobar en un departamento.

### `/lmat/kits` — Kits de Surtimiento
https://sigma-tps.vercel.app/lmat/kits
- **Descripción:** Lista de kits de surtimiento por proceso/celda/folio con estatus (pendiente, en preparación, listo, entregado, parcial) y alertas de backorder.
- **Flujo de usuario:** Filtras por proceso → abres un kit a preparar.
- **Prueba:** Abre un kit "pendiente".

### `/lmat/kits/[id]` — Detalle de Kit
https://sigma-tps.vercel.app/lmat/kits/sk3
- **Descripción:** Preparación del kit: escaneo de ítems (simulado con QR), control de cantidades surtidas vs. BOM, registro de backorder, impresión/exportación y confirmación de entrega.
- **Flujo de usuario:** Escaneas/marcas ítems → registras faltantes (backorder) → confirmas entrega.
- **Prueba:** Marca ítems como escaneados y observa el avance; añade una nota de backorder.

### `/lmat/validacion` — Dashboard de Validación Multi-Departamento
https://sigma-tps.vercel.app/lmat/validacion
- **Descripción:** Tablero para liberar BOMs: cada departamento marca su validación (pendiente/en revisión/completado/rechazado/bloqueado). Un BOM se libera cuando todos validan.
- **Flujo de usuario:** Eliges un BOM → cambias el estado de validación de tu departamento.
- **Prueba:** Cambia un departamento a "Completado" y observa el avance de liberación.

### `/lmat/where-used` — Trazabilidad Inversa ("¿Dónde se usa?")
https://sigma-tps.vercel.app/lmat/where-used
- **Descripción:** Dado un artículo, muestra en qué BOMs aparece y con qué cantidad/celda.
- **Flujo de usuario:** Buscas un artículo → ves todos los BOMs que lo contienen.
- **Prueba:** Busca "acero" y selecciona un artículo; verás los BOMs donde se usa.

### `/lmat/wizard` — Asistente Unificado de Producto
https://sigma-tps.vercel.app/lmat/wizard
- **Descripción:** Wizard de 4 pasos que consolida el alta de producto: (1) datos técnicos, (2) carátula de blindaje, (3) BOM inicial, (4) validación colaborativa secuencial por departamento. Muestra progreso global.
- **Flujo de usuario:** Avanzas paso a paso; cada paso se marca como completo al llenarlo. En el paso 4 validas por departamento hasta llegar a 100% y liberar.
- **Prueba:** Llena marca/modelo/año, elige nivel de blindaje, pon un número de componentes y valida los 4 departamentos hasta habilitar **Liberar producto**.

### `/lmat/corte` — Trazabilidad de Corte por VIN
https://sigma-tps.vercel.app/lmat/corte
- **Descripción:** Trazabilidad de programas de corte. Dos consultas: **por VIN/folio** (qué revisión de cada programa se usó en una unidad) y **por programa** (en qué VINs se aplicó cada revisión), con nesting y número de placas.
- **Flujo de usuario:** En "Por VIN" capturas un folio para ver sus revisiones de corte; en "Por Programa" exploras cada revisión y los folios donde se aplicó.
- **Prueba:** En la pestaña "Por VIN / Folio" escribe `4521`. Luego cambia a "Por Programa" y revisa las revisiones.

### `/lmat/recepcion` — Recepción e Inspección (Tablet)
https://sigma-tps.vercel.app/lmat/recepcion
- **Descripción:** App optimizada para tablet para recibir vehículos prototipo: checklist configurable por tipo de vehículo, marca OK/Falla/N/A, adjunta foto en fallas, captura designaciones (borrador de especificación) y firma electrónica.
- **Flujo de usuario:** Capturas VIN → eliges tipo de vehículo → recorres el checklist → documentas hallazgos → firmas.
- **Prueba:** Selecciona "suv", marca todos los ítems, captura un VIN y pulsa **Firmar recepción**.

---

## Módulo 2 — Artículos (Catálogo)

### `/articulos` — Catálogo de Artículos
https://sigma-tps.vercel.app/articulos
- **Descripción:** Listado del catálogo (~6,000 artículos) con búsqueda por tokens (orden de palabras libre), filtros (estatus, ABC, grupo), KPIs de completitud, exportación CSV y **doble vista: tabla y tarjetas**.
- **Flujo de usuario:** Buscas/filtras → alternas tabla/tarjetas → abres un artículo o creas/importas.
- **Prueba:** Usa el toggle de vista (iconos tabla/cuadrícula arriba a la derecha de los filtros) y busca con palabras en cualquier orden (ej. "acero placa").

### `/articulos/nuevo` — Alta de Artículo
https://sigma-tps.vercel.app/articulos/nuevo
- **Descripción:** Formulario para crear un artículo con datos de Ingeniería, Compras y Almacén.
- **Flujo de usuario:** Llenas los campos por sección → guardas.
- **Prueba:** Crea uno con código `TEST-001` y revísalo en el catálogo.

### `/articulos/[id]` — Detalle de Artículo
https://sigma-tps.vercel.app/articulos/a2
- **Descripción:** Ficha completa con pestañas: **Datos Maestros** (Ingeniería/Compras/Almacén/Producción/Calidad, editable), **Proveedores** (multi-proveedor), **Documentos** (dibujos, programas CNC, fichas — enlaces a archivos tipo DXF/STEP/PDF) y **Where-Used**. Muestra completitud, clasificación ABC y tipo de artículo.
- **Flujo de usuario:** Revisas/editas datos → consultas proveedores y documentos → ves dónde se usa.
- **Prueba:** Abre un artículo, pulsa editar, cambia un dato y guarda; revisa la pestaña Documentos.

### `/articulos/importar` — Importar Artículos
https://sigma-tps.vercel.app/articulos/importar
- **Descripción:** Importación masiva desde CSV con validación de filas y descarga de plantilla.
- **Flujo de usuario:** Descargas plantilla → pegas/subes datos → revisas errores → importas.
- **Prueba:** Descarga la plantilla, pega 1-2 filas válidas y ejecuta la importación.

---

## Módulo 3 — Proyectos

### `/proyectos` — Dashboard de Proyectos
https://sigma-tps.vercel.app/proyectos
- **Descripción:** Listado de proyectos (folios TPS) con estatus del ciclo de vida (cotización → … → entregado), margen estimado y días en producción. Filtros por estatus/actividad.
- **Flujo de usuario:** Filtras (por defecto "activos") → abres un proyecto o creas uno nuevo.
- **Prueba:** Cambia el filtro a "Todos" y abre un proyecto entregado.

### `/proyectos/nuevo` — Nuevo Proyecto
https://sigma-tps.vercel.app/proyectos/nuevo
- **Descripción:** Alta de proyecto/folio con cliente, modelo, nivel, monto de cotización y BOM vinculado opcional.
- **Flujo de usuario:** Llenas datos → guardas.
- **Prueba:** Crea un folio de prueba y vincúlale un BOM.

### `/proyectos/[id]` — Detalle de Proyecto
https://sigma-tps.vercel.app/proyectos/p1
- **Descripción:** Trazabilidad del folio: línea de etapas del ciclo de vida, costos por tipo (material, mano de obra, GIF, terceros), documentos (cotización, anticipo, OC, factura), BOM vinculado y margen.
- **Flujo de usuario:** Revisas en qué etapa va → consultas costos acumulados y documentos.
- **Prueba:** Abre el folio `4521` y revisa su avance de etapas y desglose de costos.

---

## Recorrido sugerido (end-to-end)

Para entender el flujo completo de Ingeniería en una sola sesión:

1. **`/lmat`** — Familiarízate con los KPIs.
2. **`/articulos`** — Explora el catálogo (prueba vista tarjetas y búsqueda por tokens).
3. **`/lmat/boms/nuevo`** — Crea un BOM agregando artículos.
4. **`/lmat/boms/[id]`** — Edita celdas, clónalo, crea una versión y exporta a Excel.
5. **`/lmat/wizard`** — Da de alta un producto completo con validación por departamento.
6. **`/lmat/ecn`** — Revisa un cambio de ingeniería y su impacto en costo/tiempo.
7. **`/lmat/validacion`** — Libera un BOM validando departamentos.
8. **`/lmat/kits/[id]`** — Prepara un kit de surtimiento.
9. **`/lmat/corte`** — Consulta la trazabilidad de corte por VIN.
10. **`/lmat/recepcion`** — Simula la recepción de un prototipo en tablet.
11. **`/proyectos/[id]`** — Cierra el círculo viendo la trazabilidad del folio.

> Al terminar, usa **Reset** en la barra superior para restaurar los datos de demostración.
