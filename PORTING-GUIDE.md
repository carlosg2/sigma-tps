# Guía de Porting: Next.js (tps-alpha) → SvelteKit (sigma-tps)

Portar páginas React/shadcn a Svelte 5/shadcn-svelte con PARIDAD funcional y visual.

## Reglas de conversión (OBLIGATORIAS)

### Origen y destino
- Origen Next.js: `/Users/carlosgarzagarza/Documents/GitHub/tps-alpha/app/<ruta>/page.tsx`
- Destino Svelte: `/Users/carlosgarzagarza/Documents/GitHub/sigma-tps/src/routes/(tps)/<ruta>/+page.svelte`

### Imports (cambiar TODOS)
- `@/lib/store-provider` → store: `import { useStore } from '$lib/tps/store.svelte.js';` luego `const store = useStore();` y `const state = $derived(store.state);`. Para mutar: `store.dispatch({ type: '...', payload })`. Reset: `store.resetData()`.
- `@/lib/constants` → `$lib/tps/constants.js`
- `@/lib/types` → `import type { ... } from '$lib/tps/types.js';`
- `@/lib/utils` funciones formatCurrency/formatDate/formatPercent/generateId/searchMatch → `$lib/tps/utils.js`. `cn` → `$lib/utils.js`.
- `@/components/shared/stat-card` → `import StatCard from '$lib/tps/components/stat-card.svelte';`
- `@/components/shared/status-badge` → `import StatusBadge from '$lib/tps/components/status-badge.svelte';`
- `@/components/bom/bom-tree` → `import BomTree from '$lib/tps/components/bom-tree.svelte';`
- Iconos `lucide-react` → `@lucide/svelte/icons/<kebab-name>` (default import, uno por icono). Ej: `import Plus from '@lucide/svelte/icons/plus';`, `ChevronDown`→`chevron-down`, `AlertTriangle`→`triangle-alert`, `CheckCircle2`→`circle-check-big`, `Trash2`→`trash-2`, `X`→`x`, `Save`→`save`, `ArrowLeft`→`arrow-left`.

### Estado y reactividad
- `useState(x)` → `let v = $state(x);`
- `useMemo(() => expr, deps)` → `const v = $derived(expr);` o `$derived.by(() => { ... return ...; })` si tiene cuerpo.
- `state` del store ya es reactivo (runes). Para derivados del store usa `$derived`.

### Routing y params
- Página dinámica `[id]`: `import { page } from '$app/state';` luego `const id = $derived(page.params.id);`
- Navegación programática `router.push('/x')` → `import { goto } from '$app/navigation';` `goto('/x')`.
- `<Link href="/x">txt</Link>` → `<a href="/x">txt</a>`. Mantén las MISMAS clases.
- `useRouter` de next → eliminar; usar goto.

### JSX → Svelte markup
- `className=` → `class=`. Mantén EXACTAMENTE las mismas clases Tailwind.
- `{cond && <X/>}` → `{#if cond}<X/>{/if}`
- `{cond ? <A/> : <B/>}` → `{#if cond}<A/>{:else}<B/>{/if}`
- `arr.map(x => <tr key={x.id}>...)` → `{#each arr as x (x.id)} <tr>... {/each}`
- `style={{ width: `${n}%` }}` → `style="width: {n}%"`
- `onClick={fn}` → `onclick={fn}`; `onChange={e => setX(e.target.value)}` → en `<input>`/`<select>` usar `bind:value={x}` o `onchange={(e)=>x=e.currentTarget.value}`. `onInput`→`oninput`.
- `colSpan={9}` → `colspan="9"`. `htmlFor`→`for`.
- Componente de icono recibido como variable: en Svelte renderiza `{@const Icon = iconVar}<Icon class="..." />` o usa directamente si está en mayúscula.
- StatCard: prop `icon` ahora recibe el COMPONENTE de icono (no JSX). Ej: `<StatCard label="x" value={5} icon={Package} />` (NO `icon={<Package/>}`).
- Inputs controlados: usar `bind:value`. Checkboxes: `bind:checked`.
- `<select value={v} onChange=...>` → `<select bind:value={v}>` con `<option value="...">`.
- Formularios: el handler `onSubmit` → en `<form onsubmit={(e) => { e.preventDefault(); ... }}>`.

### Textarea/Input shadcn
- Puedes usar elementos `<input>`, `<select>`, `<textarea>`, `<button>` NATIVOS con las mismas clases Tailwind del original (es lo más fiel). NO es necesario usar los componentes de bits-ui.

### IMPORTANTE
- NO inventar rutas a `/implementacion/*` (esa sección NO se implementa). Si una página enlaza a /implementacion, omite ese enlace.
- Mantén textos en español tal cual (sin acentos, igual que el original).
- Conserva toda la lógica de negocio idéntica.
- Usa `(e.currentTarget as HTMLInputElement).value` con tipos correctos en TS.

## Archivos de ejemplo YA PORTADOS (síguelos como referencia de estilo):
- Listado con filtros/orden/tabla: `src/routes/(tps)/articulos/+page.svelte`
- Listado simple + StatCards: `src/routes/(tps)/proyectos/+page.svelte`
- Búsqueda + detalle: `src/routes/(tps)/lmat/where-used/+page.svelte`
- Dashboard: `src/routes/(tps)/+page.svelte`
- Store: `src/lib/tps/store.svelte.ts` (clase TpsStore, useStore via Context)
- BomTree props: `{ components: BOMComponent[]; onReorder: (c)=>void; readOnly?: boolean }`

## Verificación
Al terminar cada archivo, NO ejecutes build. El orquestador correrá svelte-check al final.

## GOTCHAS de Svelte 5 (CRÍTICO — evítalos):
- NO usar `<svelte:component this={X}>` (deprecado). Para renderizar un icono dinámico: `{@const Icon = x}<Icon class="..." />`.
- NO auto-cerrar elementos HTML no-void: escribe `<div ...></div>`, NUNCA `<div ... />`. (Componentes SÍ pueden auto-cerrarse: `<Plus />`).
- UN SOLO bloque `<script lang="ts">` (más `<script module>` si hace falta). NUNCA dos `<script>` normales.
- Para indexar Records tipados con variable string: castea, ej. `LABELS[k as MyType]`, o tipa el array como `MyType[]`.
- Iconos: SOLO nombres reales de @lucide/svelte/icons (kebab-case). NO existe `check-circle-2` → usa `circle-check-big`; `alert-circle` → `circle-alert`; `alert-triangle` → `triangle-alert`.
- StatCard SOLO acepta props: `label, value, subtitle?, icon?, trend?, class?` (NO href, NO alert). Para una card con link usa un `<a>` con markup propio.
- En handlers usa `e.currentTarget` con cast correcto, no `e.target`.
