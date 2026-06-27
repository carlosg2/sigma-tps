<script lang="ts">
	import { tick, untrack } from 'svelte';
	import type { DndEvent } from 'svelte-dnd-action';
	import { dragHandleZone } from 'svelte-dnd-action';

	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import Bot from '@lucide/svelte/icons/bot';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import KanbanIcon from '@lucide/svelte/icons/kanban';
	import LayoutTemplate from '@lucide/svelte/icons/layout-template';
	import List from '@lucide/svelte/icons/list';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import MoreHorizontal from '@lucide/svelte/icons/more-horizontal';
	import Table2 from '@lucide/svelte/icons/table-2';
	import Upload from '@lucide/svelte/icons/upload';

	import { Button } from '$lib/components/ui/button/index.js';
	import { ButtonGroup, ButtonGroupSeparator } from '$lib/components/ui/button-group/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';

	import { columns, initialBoard, type BoardState, type Column, type ColumnId, type Task } from './components/data.js';
	import KanbanColumn from './components/kanban-column.svelte';
	import { getLiveBoard, moveTask } from './kanban.remote.js';

	const liveQuery = getLiveBoard();

	let board = $state<BoardState>(
		Object.fromEntries(
			Object.entries(initialBoard).map(([k, v]) => [k, [...v]])
		) as BoardState
	);

	// colItems carries the ordered columns; id is required by svelte-dnd-action
	let colItems = $state<Column[]>(columns.map((c) => ({ ...c })));

	let isDragging = $state(false);
	let flashUpdate = $state(false);

	function applyServerBoard(serverBoard: BoardState) {
		board = Object.fromEntries(
			Object.entries(serverBoard).map(([k, v]) => [k, [...v]])
		) as BoardState;
		flashUpdate = true;
		setTimeout(() => (flashUpdate = false), 600);
	}

	// Devuelve la columna donde está cada task id
	function columnIndexById(b: BoardState): Map<string, ColumnId> {
		const map = new Map<string, ColumnId>();
		for (const [colId, tasks] of Object.entries(b) as [ColumnId, Task[]][]) {
			for (const t of tasks) map.set(t.id, colId);
		}
		return map;
	}

	// Inyecta reglas CSS por cada tarea movida para escalonar (stagger) su delay
	// y elevar su z-index, de modo que las tarjetas en movimiento queden SIEMPRE
	// por encima de las que no se mueven (por defecto los grupos de view-transition
	// se apilan según el orden del DOM y una tarjeta animada podía pasar por detrás
	// de otra estática). Devuelve una función de limpieza.
	function applyStagger(movedIds: string[], stepMs: number): () => void {
		const style = document.createElement('style');
		style.textContent = movedIds
			.map(
				(id, i) =>
					`::view-transition-group(task-${id}) { animation-delay: ${i * stepMs}ms; z-index: ${100 + i}; }\n` +
					`::view-transition-old(task-${id}),` +
					`::view-transition-new(task-${id}) { animation-delay: ${i * stepMs}ms; }`
			)
			.join('\n');
		document.head.appendChild(style);
		return () => style.remove();
	}

	// Sincronizar estado del servidor → board local (solo cuando no se está arrastrando).
	// Usamos la View Transitions API en lugar de transiciones de Svelte (in:/out:),
	// porque svelte-dnd-action controla el DOM directamente y las transiciones de
	// Svelte retienen nodos que la librería ya removió, causando saltos. Las view
	// transitions operan a nivel de compositor (snapshot antes/después) y hacen el
	// morph entre columnas sin tocar el ciclo de vida del DOM.
	$effect(() => {
		const serverBoard = liveQuery.current;
		if (!serverBoard || untrack(() => isDragging)) return;

		if (typeof document !== 'undefined' && document.startViewTransition) {
			// Detectar qué tareas cambiaron de columna para escalonar su animación
			const before = columnIndexById(untrack(() => board));
			const after = columnIndexById(serverBoard);
			const movedIds: string[] = [];
			for (const [id, col] of after) {
				if (before.get(id) && before.get(id) !== col) movedIds.push(id);
			}

			const cleanup = applyStagger(movedIds, 120);
			const transition = document.startViewTransition(async () => {
				applyServerBoard(serverBoard);
				await tick();
			});
			transition.finished.finally(cleanup);
		} else {
			applyServerBoard(serverBoard);
		}
	});

	function handleTaskConsider(colId: ColumnId, e: CustomEvent<DndEvent<Task>>) {
		isDragging = true;
		board = { ...board, [colId]: e.detail.items as Task[] };
	}

	function handleTaskFinalize(colId: ColumnId, e: CustomEvent<DndEvent<Task>>) {
		const items = e.detail.items as Task[];
		board = { ...board, [colId]: items };
		isDragging = false;

		// Si la tarjeta arrastrada aterrizó en esta columna, persistir el movimiento
		// en el servidor para propagarlo a los demás clientes vía la live query.
		const draggedId = e.detail.info.id;
		const toIndex = items.findIndex((t) => t.id === draggedId);
		if (toIndex !== -1) {
			moveTask({ taskId: draggedId, toColumn: colId, toIndex }).catch(() => {
				// Si falla la persistencia, la próxima live query reconciliará el estado.
			});
		}
	}

	function handleColConsider(e: CustomEvent<DndEvent<Column>>) {
		isDragging = true;
		colItems = e.detail.items as Column[];
	}

	function handleColFinalize(e: CustomEvent<DndEvent<Column>>) {
		colItems = e.detail.items as Column[];
		isDragging = false;
	}
</script>

<div class="flex h-dvh min-h-0 min-w-0 flex-col overflow-hidden">
	<!-- Toolbar -->
	<div class="flex shrink-0 items-center gap-2 border-b px-4 py-3 lg:gap-3 lg:px-6">
		<Tabs.Root value="board" class="min-w-0">
			<Tabs.List class="w-fit">
				<Tabs.Trigger value="board" class="gap-2">
					<KanbanIcon class="size-4" />
					<span class="hidden sm:inline">Tablero</span>
				</Tabs.Trigger>
				<Tabs.Trigger value="list" class="gap-2">
					<List class="size-4" />
					<span class="hidden sm:inline">Lista</span>
				</Tabs.Trigger>
				<Tabs.Trigger value="table" class="gap-2">
					<Table2 class="size-4" />
					<span class="hidden sm:inline">Tabla</span>
				</Tabs.Trigger>
			</Tabs.List>
		</Tabs.Root>

		<div class="ml-auto flex min-w-0 items-center gap-2">
			<!-- Indicador live: el punto siempre; el texto solo en pantallas medianas+ -->
			<span
				class={[
					'inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium transition-colors',
					flashUpdate ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400' : 'text-muted-foreground'
				].join(' ')}
			>
				<span
					class={[
						'size-1.5 rounded-full',
						liveQuery.connected ? 'animate-pulse bg-green-500' : 'bg-muted-foreground'
					].join(' ')}
				></span>
				<span class="hidden sm:inline">{liveQuery.connected ? 'En vivo' : 'Desconectado'}</span>
			</span>

			<!-- Buscar / Filtrar / Ordenar: inline solo en pantallas grandes -->
			<InputGroup.Root class="hidden lg:flex lg:w-56 2xl:w-48">
				<InputGroup.Input type="search" placeholder="Buscar tareas ERP" />
				<InputGroup.Addon>
					<Search class="size-4" />
				</InputGroup.Addon>
			</InputGroup.Root>
			<Button variant="outline" class="hidden lg:inline-flex">
				<SlidersHorizontal class="size-4" />
				Filtrar
			</Button>
			<Button variant="outline" class="hidden lg:inline-flex">
				<ArrowUpDown class="size-4" />
				Ordenar
			</Button>

			<!-- En pantallas pequeñas, agrupar buscar/filtrar/ordenar en un menú compacto -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="icon" class="lg:hidden" aria-label="Buscar y filtros">
							<MoreHorizontal class="size-4" />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="w-44">
					<DropdownMenu.Item>
						<Search class="size-4" />
						Buscar
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<SlidersHorizontal class="size-4" />
						Filtrar
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<ArrowUpDown class="size-4" />
						Ordenar
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>

			<ButtonGroup class="w-fit">
				<Button>
					<Plus class="size-4" />
					<span class="hidden sm:inline">Agregar tarea</span>
				</Button>
				<ButtonGroupSeparator />
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props} aria-label="Open add task menu">
								<ChevronDown class="size-4" />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="w-48">
						<DropdownMenu.Item>
							<Upload class="size-4" />
							Importar CSV
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							<LayoutTemplate class="size-4" />
							Agregar desde plantilla
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							<Bot class="size-4" />
							Crear automatización
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</ButtonGroup>
		</div>
	</div>

	<!-- Board -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		use:dragHandleZone={{ items: colItems, flipDurationMs: 200, dropTargetStyle: {}, type: 'kanban-column', delayTouchStart: true }}
		onconsider={handleColConsider}
		onfinalize={handleColFinalize}
		class="scrollbar-thin inline-grid min-h-0 min-w-0 flex-1 auto-cols-[minmax(20rem,1fr)] grid-flow-col gap-4 overflow-x-auto overflow-y-hidden bg-muted/25 px-4 pt-4 pb-0 [scrollbar-color:var(--border)_transparent] lg:px-5 lg:pt-5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1"
	>
		{#each colItems as col (col.id)}
			<KanbanColumn
				column={col}
				tasks={board[col.id] ?? []}
				onconsider={(e) => handleTaskConsider(col.id, e)}
				onfinalize={(e) => handleTaskFinalize(col.id, e)}
			/>
		{/each}
	</div>
</div>

<style>
	/* Afinar el morph de las View Transitions (movimientos del bot entre columnas). */
	:global(::view-transition-group(*)) {
		animation-duration: 400ms;
		animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
	}

	/* Sincronizar el cross-fade del CONTENIDO (snapshots viejo/nuevo) con el
	   movimiento del contenedor. Sin esto, cuando una tarjeta entra o sale de
	   "En desarrollo" —donde aparecen/desaparecen progreso, responsable, fecha y
	   equipo— el contenido se desvanece más rápido que el contenedor y se ve brusco.
	   Igualar duración y easing hace que el detalle se revele de forma fluida
	   mientras la tarjeta se traslada y cambia de altura. */
	:global(::view-transition-old(*)),
	:global(::view-transition-new(*)) {
		animation-duration: 400ms;
		animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
		/* Mantener cada snapshot anclado arriba para que el cambio de altura se
		   revele de arriba hacia abajo en vez de estirar el contenido. */
		height: auto;
		transform-origin: top center;
	}

	/* Accesibilidad: desactivar el morph si el usuario prefiere menos movimiento */
	@media (prefers-reduced-motion: reduce) {
		:global(::view-transition-group(*)),
		:global(::view-transition-old(*)),
		:global(::view-transition-new(*)) {
			animation: none !important;
		}
	}
</style>
