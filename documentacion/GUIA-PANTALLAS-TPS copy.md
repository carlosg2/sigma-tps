# Guía de Pantallas — TPS ERP (sigma-tps)

> Manual funcional de todas las rutas de la aplicación TPS. Para cada pantalla se describe **qué hace**, el **flujo de usuario** y **cómo probarla**.
> Aplica a la empresa **TPS** (blindaje vehicular). La app simula el ERP con datos sembrados (seed) que viven en el navegador (localStorage), por lo que puedes experimentar libremente y luego pulsar **Reset** para volver al estado inicial.

---

## Cómo arrancar y conceptos globales

### Arranque
1. En la raíz del repo: `pnpm install` y luego `pnpm dev`.
2. Abre la URL que indica la terminal (ej. `http://localhost:5173`). La raíz redirige automáticamente al **Dashboard de Ingeniería** (`/lmat`).

### Barra superior (presente en todas las pantallas)
La cabecera ([site-header.svelte](../src/lib/tps/components/site-header.svelte)) incluye 3 controles globales que afectan a toda la app:

| Control | Qué hace | Cómo probarlo |
|---|---|---|
| **Selector de Planta** (icono fábrica) | Filtra los datos por `Planta 1`, `Planta 2`, `Almacén Servicios` o `Todas`. | Cámbialo y observa cómo se filtran BOMs, artículos y proyectos. |
| **Selector de Rol/Usuario** (icono persona) | Cambia el usuario activo (Admin, Gerente, Key User, Operador, Consultor). El nombre se usa al firmar versiones, validar, etc. | Cambia el rol y crea una versión de BOM: verás tu nombre en el historial. |
| **Reset** (icono flecha) | Borra el estado local y restaura los datos sembrados. | Úsalo cuando quieras empezar de cero tras experimentar. |

### Navegación lateral
El menú ([app-sidebar.svelte](../src/lib/tps/components/app-sidebar.svelte)) agrupa las rutas en 4 secciones: **Ingeniería**, **Artículos**, **Proyectos** e **Implementación**.

### Persistencia
Todos los cambios (crear, editar, validar, escanear) se guardan en `localStorage`. No hay backend: es un prototipo navegable.

---

## Módulo 1 — Ingeniería (LMAT)

Gestión de listas de materiales, especificaciones, cambios de ingeniería y surtimiento.

### `/lmat` — Dashboard de Ingeniería
- **Qué hace:** Panel de control con KPIs (BOMs totales, especificaciones, ECN pendientes, kits, validaciones, salud promedio), distribución por madurez y accesos rápidos.
- **Flujo de usuario:** Es la pantalla de entrada. Desde las tarjetas de KPI o los accesos rápidos saltas a cada sub-módulo.
- **Cómo probar:** Pulsa cada tarjeta de estadística; cada una enlaza a su listado correspondiente.

### `/lmat/boms` — Listado de BOMs
- **Qué hace:** Tabla de todas las listas de materiales con búsqueda, filtros por estatus y madurez, orden por columnas y % de salud (completitud de datos).
- **Flujo de usuario:** Buscas/filtras → clic en una fila para abrir el detalle, o botón **Nuevo BOM**.
- **Cómo probar:** Escribe en el buscador (ej. "Suburban"), cambia el filtro de madurez y ordena por "Salud".

### `/lmat/boms/nuevo` — Crear BOM
- **Qué hace:** Formulario para dar de alta un BOM: código de especificación, modelo, nivel de blindaje, planta y agregado de componentes buscando artículos del catálogo.
- **Flujo de usuario:** Llenas cabecera → buscas artículos y los agregas con cantidad/celda → **Guardar**.
- **Cómo probar:** Crea uno con código `ESP-PRUEBA-001`, agrega 2-3 artículos y guarda; aparecerá en el listado.

### `/lmat/boms/[id]` — Detalle de BOM
- **Qué hace:** Pantalla central de ingeniería. Incluye:
  - **3 vistas** del mismo BOM: Jerárquica (árbol arrastrable), BOM Plano (listado de Ingeniería) y Por Celda/Kit (surtimiento).
  - **Estado de madurez** y **validación por departamento** (Ingeniería, Manufactura, Compras, Almacén, Calidad, Contabilidad).
  - **Historial de revisiones** con comparación (diff) entre versiones.
  - Acciones: **Clonar** (genera variante en borrador), **Excel** (exporta CSV), **Imprimir**, **Crear Versión** y cambio de estatus.
  - **Edición de celda** por componente (en vista Jerárquica y BOM Plano) cuando el BOM no está aprobado/obsoleto.
  - ECNs relacionados.
- **Flujo de usuario:** Revisas el árbol → cambias a vista por celda para ver el surtimiento → editas celdas → creas una nueva versión documentando el motivo → consultas el historial.
- **Cómo probar:** Abre un BOM **en borrador** (ej. `ESP-005` / Chevrolet Tahoe). Cambia la celda de un componente con el dropdown, pulsa **Clonar** para crear una variante, y abre **Historial** para ver las revisiones.

### `/lmat/boms/importar` — Importar BOMs
- **Qué hace:** Importación masiva de BOMs desde CSV; permite descargar una plantilla base.
- **Flujo de usuario:** Descargas plantilla → la llenas → (a futuro) la subes.
- **Cómo probar:** Pulsa **Descargar Plantilla CSV** y revisa el formato esperado.

### `/lmat/boms/cambio-masivo` — Cambio Masivo de Componente
- **Qué hace:** Reemplaza un artículo por otro en múltiples BOMs a la vez, con vista previa de los BOMs afectados y propagación automática de versiones.
- **Flujo de usuario:** Buscas el artículo viejo → buscas el nuevo → seleccionas los BOMs afectados → indicas motivo → aplicas.
- **Cómo probar:** Busca un componente común (ej. un tornillo), elige uno nuevo, marca 1-2 BOMs y aplica; verás que crean nueva versión.

### `/lmat/especificaciones` — Especificaciones Técnicas
- **Qué hace:** Catálogo de especificaciones de blindaje por marca/modelo/año/nivel, con filtros por marca y madurez.
- **Flujo de usuario:** Filtras por marca → abres una especificación.
- **Cómo probar:** Filtra por "Toyota" y abre una ficha.

### `/lmat/especificaciones/[id]` — Detalle de Especificación
- **Qué hace:** Ficha técnica con protección por zona, componentes especiales, accesorios, BOMs asociados, rutas de producción, kits de corte, documentos e historial de cambios.
- **Flujo de usuario:** Consultas el blindaje por zona y navegas a los BOMs vinculados.
- **Cómo probar:** Abre `ESP-LC300-NIII-2025` y revisa las pestañas de contenido.

### `/lmat/ecn` — Listado de ECN (Cambios de Ingeniería)
- **Qué hace:** Lista de Engineering Change Notices con filtro por estatus (solicitud → análisis → aprobación → aplicación → completado).
- **Flujo de usuario:** Filtras por estatus → abres un ECN.
- **Cómo probar:** Filtra "En Aprobación" y abre uno.

### `/lmat/ecn/[id]` — Detalle de ECN
- **Qué hace:** Ficha de cambio con justificación, BOMs/folios afectados, **impacto en inventario, costo, tiempo y materiales/MO de aditiva**, flujo de aprobación por departamento y efectividad (a partir de qué folio aplica).
- **Flujo de usuario:** Revisas impacto → apruebas/rechazas por departamento → al completar, defines efectividad.
- **Cómo probar:** Abre un ECN en aprobación y pulsa aprobar en un departamento.

### `/lmat/kits` — Kits de Surtimiento
- **Qué hace:** Lista de kits de surtimiento por proceso/celda/folio con estatus (pendiente, en preparación, listo, entregado, parcial) y alertas de backorder.
- **Flujo de usuario:** Filtras por proceso → abres un kit a preparar.
- **Cómo probar:** Abre un kit "pendiente".

### `/lmat/kits/[id]` — Detalle de Kit
- **Qué hace:** Preparación del kit: escaneo de ítems (simulado con QR), control de cantidades surtidas vs. BOM, registro de backorder, impresión/exportación y confirmación de entrega.
- **Flujo de usuario:** Escaneas/marcas ítems → registras faltantes (backorder) → confirmas entrega.
- **Cómo probar:** Marca ítems como escaneados y observa el avance; añade una nota de backorder.

### `/lmat/validacion` — Dashboard de Validación Multi-Departamento
- **Qué hace:** Tablero para liberar BOMs: cada departamento marca su validación (pendiente/en revisión/completado/rechazado/bloqueado). Un BOM se libera cuando todos validan.
- **Flujo de usuario:** Eliges un BOM → cambias el estado de validación de tu departamento.
- **Cómo probar:** Cambia un departamento a "Completado" y observa el avance de liberación.

### `/lmat/where-used` — Trazabilidad Inversa ("¿Dónde se usa?")
- **Qué hace:** Dado un artículo, muestra en qué BOMs aparece y con qué cantidad/celda.
- **Flujo de usuario:** Buscas un artículo → ves todos los BOMs que lo contienen.
- **Cómo probar:** Busca "acero" y selecciona un artículo; verás los BOMs donde se usa.

### `/lmat/wizard` — Asistente Unificado de Producto
- **Qué hace:** Wizard de 4 pasos que consolida el alta de producto: (1) datos técnicos, (2) carátula de blindaje, (3) BOM inicial, (4) validación colaborativa secuencial por departamento. Muestra progreso global.
- **Flujo de usuario:** Avanzas paso a paso; cada paso se marca como completo al llenarlo. En el paso 4 validas por departamento hasta llegar a 100% y liberar.
- **Cómo probar:** Llena marca/modelo/año, elige nivel de blindaje, pon un número de componentes y valida los 4 departamentos hasta habilitar **Liberar producto**.

### `/lmat/corte` — Trazabilidad de Corte por VIN
- **Qué hace:** Trazabilidad de programas de corte. Dos consultas: **por VIN/folio** (qué revisión de cada programa se usó en una unidad) y **por programa** (en qué VINs se aplicó cada revisión), con nesting y número de placas.
- **Flujo de usuario:** En "Por VIN" capturas un folio para ver sus revisiones de corte; en "Por Programa" exploras cada revisión y los folios donde se aplicó.
- **Cómo probar:** En la pestaña "Por VIN / Folio" escribe `4521`. Luego cambia a "Por Programa" y revisa las revisiones.

### `/lmat/recepcion` — Recepción e Inspección (Tablet)
- **Qué hace:** App optimizada para tablet para recibir vehículos prototipo: checklist configurable por tipo de vehículo, marca OK/Falla/N/A, adjunta foto en fallas, captura designaciones (borrador de especificación) y firma electrónica.
- **Flujo de usuario:** Capturas VIN → eliges tipo de vehículo → recorres el checklist → documentas hallazgos → firmas.
- **Cómo probar:** Selecciona "suv", marca todos los ítems, captura un VIN y pulsa **Firmar recepción**.

---

## Módulo 2 — Artículos (Catálogo)

### `/articulos` — Catálogo de Artículos
- **Qué hace:** Listado del catálogo (~6,000 artículos) con búsqueda por tokens (orden de palabras libre), filtros (estatus, ABC, grupo), KPIs de completitud, exportación CSV y **doble vista: tabla y tarjetas**.
- **Flujo de usuario:** Buscas/filtras → alternas tabla/tarjetas → abres un artículo o creas/importas.
- **Cómo probar:** Usa el toggle de vista (iconos tabla/cuadrícula arriba a la derecha de los filtros) y busca con palabras en cualquier orden (ej. "acero placa").

### `/articulos/nuevo` — Alta de Artículo
- **Qué hace:** Formulario para crear un artículo con datos de Ingeniería, Compras y Almacén.
- **Flujo de usuario:** Llenas los campos por sección → guardas.
- **Cómo probar:** Crea uno con código `TEST-001` y revísalo en el catálogo.

### `/articulos/[id]` — Detalle de Artículo
- **Qué hace:** Ficha completa con pestañas: **Datos Maestros** (Ingeniería/Compras/Almacén/Producción/Calidad, editable), **Proveedores** (multi-proveedor), **Documentos** (dibujos, programas CNC, fichas — enlaces a archivos tipo DXF/STEP/PDF) y **Where-Used**. Muestra completitud, clasificación ABC y tipo de artículo.
- **Flujo de usuario:** Revisas/editas datos → consultas proveedores y documentos → ves dónde se usa.
- **Cómo probar:** Abre un artículo, pulsa editar, cambia un dato y guarda; revisa la pestaña Documentos.

### `/articulos/importar` — Importar Artículos
- **Qué hace:** Importación masiva desde CSV con validación de filas y descarga de plantilla.
- **Flujo de usuario:** Descargas plantilla → pegas/subes datos → revisas errores → importas.
- **Cómo probar:** Descarga la plantilla, pega 1-2 filas válidas y ejecuta la importación.

---

## Módulo 3 — Proyectos

### `/proyectos` — Dashboard de Proyectos
- **Qué hace:** Listado de proyectos (folios TPS) con estatus del ciclo de vida (cotización → … → entregado), margen estimado y días en producción. Filtros por estatus/actividad.
- **Flujo de usuario:** Filtras (por defecto "activos") → abres un proyecto o creas uno nuevo.
- **Cómo probar:** Cambia el filtro a "Todos" y abre un proyecto entregado.

### `/proyectos/nuevo` — Nuevo Proyecto
- **Qué hace:** Alta de proyecto/folio con cliente, modelo, nivel, monto de cotización y BOM vinculado opcional.
- **Flujo de usuario:** Llenas datos → guardas.
- **Cómo probar:** Crea un folio de prueba y vincúlale un BOM.

### `/proyectos/[id]` — Detalle de Proyecto
- **Qué hace:** Trazabilidad del folio: línea de etapas del ciclo de vida, costos por tipo (material, mano de obra, GIF, terceros), documentos (cotización, anticipo, OC, factura), BOM vinculado y margen.
- **Flujo de usuario:** Revisas en qué etapa va → consultas costos acumulados y documentos.
- **Cómo probar:** Abre el folio `4521` y revisa su avance de etapas y desglose de costos.

---

## Módulo 4 — Implementación y herramientas

### `/implementacion` — Dashboard General
- **Qué hace:** Panel ejecutivo con métricas globales (artículos, BOMs, ECN, kits) y estado de avance de la implementación del ERP.
- **Flujo de usuario:** Vista de alto nivel del proyecto de implementación.
- **Cómo probar:** Revísalo como panel de resumen.

### `/kanban` — Tablero Kanban (Producción)
- **Qué hace:** Tablero de tareas arrastrable (drag & drop) con columnas de flujo. Demo de seguimiento visual de producción.
- **Flujo de usuario:** Arrastras tarjetas entre columnas.
- **Cómo probar:** Mueve una tarjeta de columna y observa la animación; el cambio se persiste.

### `/lista` — Tabla de Materiales (Data Grid)
- **Qué hace:** Tabla avanzada tipo hoja de cálculo (filtros, orden, agrupación, alto de fila, columnas configurables) sobre datos de explosión de materiales.
- **Flujo de usuario:** Filtras/agrupas/ordenas como en Excel.
- **Cómo probar:** Agrupa por "Almacén" y ordena por "Cantidad".

### `/grid-grouping-undo` — Demo Tabla con Agrupación + Deshacer
- **Qué hace:** Demostración técnica de la tabla con agrupación dinámica e historial nativo de cambios (Ctrl+Z / Ctrl+Y).
- **Flujo de usuario:** Editas un valor de agrupación y la fila se reubica; deshaces con Ctrl+Z.
- **Cómo probar:** Sigue las "Pruebas sugeridas" que aparecen en la propia pantalla.

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
