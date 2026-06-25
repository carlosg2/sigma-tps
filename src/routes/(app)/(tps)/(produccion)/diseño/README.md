# Ruta: Diseños de Blindaje

Esta ruta muestra el catálogo de diseños y configuraciones de blindaje disponibles en el sistema TPS.

## 📁 Estructura

```
diseño/
├── +page.svelte           # Página principal con el título y DataTable
├── +page.ts              # Carga de datos desde API (spTPSDisenoBlindajeLista)
├── README.md             # Esta documentación
├── components/           # Componentes de la tabla de datos
│   ├── data-table.svelte              # Tabla principal con columnas personalizadas
│   ├── data-table-toolbar.svelte      # Toolbar con búsqueda y filtros
│   ├── data-table-faceted-filter.svelte
│   ├── data-table-view-options.svelte
│   ├── data-table-cell.svelte
│   └── index.ts
└── data/                 # Schemas y datos de referencia
    ├── schemas.ts        # Schema Zod para DisenoBlindaje
    └── data.ts          # Opciones de filtros (complejidad, costo)
```

## 🎯 Funcionalidades

### Columnas de la Tabla

1. **Código** (`diseno_codigo`) - Código único del diseño
2. **Nombre** (`diseno_nombre`) - Nombre y descripción del diseño
3. **Complejidad** (`nivel_complejidad`) - Nivel de complejidad (Bajo, Medio, Alto, Muy Alto)
4. **Costo** (`costo_relativo`) - Costo relativo (Bajo, Medio, Alto, Muy Alto)
5. **Peso (kg)** (`peso_aproximado_kg`) - Peso aproximado en kilogramos
6. **Tiempo (sem)** (`tiempo_fabricacion_semanas`) - Tiempo de fabricación en semanas
7. **Acciones** - Menú de opciones (Ver detalles, Editar, Duplicar, Activar/Desactivar)

### Filtros Disponibles

- **Búsqueda global**: Busca en todos los campos del diseño
- **Filtro por Complejidad**: Bajo, Medio, Alto, Muy Alto
- **Filtro por Costo**: Bajo, Medio, Alto, Muy Alto

### Características de la Tabla

- ✅ Selección múltiple con checkbox
- ✅ Ordenamiento por columnas
- ✅ Paginación configurable (10, 20, 30, 40, 50 filas)
- ✅ Búsqueda global
- ✅ Filtros facetados
- ✅ Columnas ocultables
- ✅ Sticky header y footer
- ✅ Responsive
- ✅ Configuración visual (bleed, dense, grid, striped)

## 📊 Modelo de Datos

### DisenoBlindaje Schema

```typescript
{
  id_diseno: number;
  diseno_codigo: string;
  diseno_nombre: string;
  descripcion: string;
  areas_blindadas: string;
  peso_aproximado_kg: number;
  tiempo_fabricacion_semanas: number;
  nivel_complejidad: "Bajo" | "Medio" | "Alto" | "Muy Alto";
  costo_relativo: "Bajo" | "Medio" | "Alto" | "Muy Alto";
  activo: boolean;
}
```

## 🔌 Fuente de Datos

Los datos se cargan desde el endpoint:
- **API**: `spTPSDisenoBlindajeLista`
- **Método**: POST
- **Body**: `{ Usuario: "MASERP" }`

## 🎨 Componentes UI Utilizados

- `Table` - Tabla personalizada con múltiples características
- `Button` - Botones de acción
- `Badge` - Para mostrar etiquetas
- `Checkbox` - Selección de filas
- `Input` - Campo de búsqueda
- `DropdownMenu` - Menús de acciones y filtros
- `Select` - Selector de filas por página
- Iconos de `@lucide/svelte`

## 🚀 Ejemplo de Uso

```svelte
<script lang="ts">
  import DataTable from "./components/data-table.svelte";
  
  let { data } = $props();
  const disenos = $derived(data.disenosBlindaje || []);
</script>

<DataTable data={disenos} />
```

## 📝 Notas

- Todos los textos están en español
- El sistema usa Svelte 5 con runes ($props, $state, $derived)
- La tabla es completamente tipada con TypeScript
- Los filtros son facetados (muestran contadores)
- La búsqueda es global y case-insensitive
