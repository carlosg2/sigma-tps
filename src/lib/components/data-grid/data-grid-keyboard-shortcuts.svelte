<script lang="ts">
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Dialog,
		DialogContent,
		DialogClose,
		DialogHeader,
		DialogTitle,
		DialogDescription
	} from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Kbd, KbdGroup } from '$lib/components/ui/kbd/index.js';

	// Icons
	import Search from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';

	const SHORTCUT_KEY = '/';
	type Direction = 'ltr' | 'rtl';

	interface ShortcutGroup {
		title: string;
		shortcuts: Array<{
			keys: string[];
			description: string;
		}>;
	}

	interface Props {
		dir?: Direction;
		enableSearch?: boolean;
		enableUndoRedo?: boolean;
		enablePaste?: boolean;
		enableRowAdd?: boolean;
		enableRowsDelete?: boolean;
	}

	let {
		dir = 'ltr',
		enableSearch = false,
		enableUndoRedo = false,
		enablePaste = false,
		enableRowAdd = false,
		enableRowsDelete = false
	}: Props = $props();

	let open = $state(false);
	let input = $state('');
	let inputRef: HTMLInputElement | null = $state(null);

	const isMac = browser ? /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) : false;
	const modKey = isMac ? '⌘' : 'Ctrl';

	function onOpenChange(isOpen: boolean) {
		open = isOpen;
		if (!isOpen) {
			input = '';
		}
	}

	function onOpenAutoFocus(event: Event) {
		event.preventDefault();
		inputRef?.focus();
	}

	const shortcutGroups = $derived.by((): ShortcutGroup[] => {
		const groups: ShortcutGroup[] = [
			{
				title: 'Navigation',
				shortcuts: [
					{ keys: ['↑', '↓', '←', '→'], description: 'Navigate between cells' },
					{ keys: ['Tab'], description: 'Move to next cell' },
					{ keys: ['Shift', 'Tab'], description: 'Move to previous cell' },
					{ keys: ['Home'], description: 'Move to first column' },
					{ keys: ['End'], description: 'Move to last column' },
					{ keys: [modKey, '↑'], description: 'Move to first row (same column)' },
					{ keys: [modKey, '↓'], description: 'Move to last row (same column)' },
					{ keys: [modKey, '←'], description: 'Move to first column (same row)' },
					{ keys: [modKey, '→'], description: 'Move to last column (same row)' },
					{ keys: [modKey, 'Home'], description: 'Move to first cell' },
					{ keys: [modKey, 'End'], description: 'Move to last cell' },
					{ keys: ['PgUp'], description: 'Move up one page' },
					{ keys: ['PgDn'], description: 'Move down one page' },
					{ keys: ['⌥', '↑'], description: 'Scroll up one page' },
					{ keys: ['⌥', '↓'], description: 'Scroll down one page' },
					{ keys: ['⌥', 'PgUp'], description: 'Scroll left one page of columns' },
					{ keys: ['⌥', 'PgDn'], description: 'Scroll right one page of columns' }
				]
			},
			{
				title: 'Selection',
				shortcuts: [
					{ keys: ['Shift', '↑↓←→'], description: 'Extend selection' },
					{ keys: [modKey, 'Shift', '↑'], description: 'Select to top of table' },
					{ keys: [modKey, 'Shift', '↓'], description: 'Select to bottom of table' },
					{ keys: [modKey, 'Shift', '←'], description: 'Select to first column' },
					{ keys: [modKey, 'Shift', '→'], description: 'Select to last column' },
					{ keys: [modKey, 'A'], description: 'Select all cells' },
					{ keys: [modKey, 'Click'], description: 'Toggle cell selection' },
					{ keys: ['Shift', 'Click'], description: 'Select range' },
					{ keys: ['Esc'], description: 'Clear selection' }
				]
			}
		];

		const editingShortcuts: ShortcutGroup['shortcuts'] = [
			{ keys: ['Enter'], description: 'Comenzar a editar celda' },
			{ keys: ['F2'], description: 'Comenzar a editar celda' },
			{ keys: ['Double Click'], description: 'Comenzar a editar celda' }
		];

		if (enableRowAdd) {
			editingShortcuts.push({ keys: ['Shift', 'Enter'], description: 'Insertar fila abajo' });
		}

		editingShortcuts.push(
			{ keys: [modKey, 'C'], description: 'Copiar celdas seleccionadas' },
			{ keys: [modKey, 'X'], description: 'Cortar celdas seleccionadas' },
		);

		if (enablePaste) {
				editingShortcuts.push({ keys: [modKey, 'V'], description: 'Pegar celdas' });
		}

		editingShortcuts.push(
			{ keys: ['Delete'], description: 'Limpiar celdas seleccionadas' },
			{ keys: ['Backspace'], description: 'Limpiar celdas seleccionadas' }
		);

		if (enableRowsDelete) {
			editingShortcuts.push(
				{ keys: [modKey, 'Backspace'], description: 'Eliminar filas seleccionadas' },
				{ keys: [modKey, 'Delete'], description: 'Eliminar filas seleccionadas' }
			);
		}

		if (enableUndoRedo) {
			editingShortcuts.push(
				{ keys: [modKey, 'Z'], description: 'Deshacer última acción' },
				{ keys: [modKey, 'Shift', 'Z'], description: 'Rehacer última acción' }
			);
		}

		groups.push({
			title: 'Edición',
			shortcuts: editingShortcuts
		});

		if (enableSearch) {
			groups.push({
				title: 'Búsqueda',
				shortcuts: [
					{ keys: [modKey, 'F'], description: 'Abrir búsqueda' },
					{ keys: ['Enter'], description: 'Siguiente coincidencia' },
					{ keys: ['Shift', 'Enter'], description: 'Coincidencia anterior' },
					{ keys: ['Esc'], description: 'Cerrar búsqueda' }
				]
			});
		}

		groups.push(
			{
				title: 'Filtrado',
				shortcuts: [
					{ keys: [modKey, 'Shift', 'F'], description: 'Abrir/cerrar menú de filtros' },
					{ keys: ['Backspace'], description: 'Quitar filtro (cuando está enfocado)' },
					{ keys: ['Delete'], description: 'Quitar filtro (cuando está enfocado)' }
				]
			},
			{
				title: 'Ordenamiento',
				shortcuts: [
					{ keys: [modKey, 'Shift', 'S'], description: 'Abrir/cerrar menú de orden' },
					{ keys: ['Backspace'], description: 'Quitar orden (cuando está enfocado)' },
					{ keys: ['Delete'], description: 'Quitar orden (cuando está enfocado)' }
				]
			},
			{
				title: 'General',
				shortcuts: [{ keys: [modKey, '/'], description: 'Mostrar atajos de teclado' }]
			}
		);

		return groups;
	});

	const filteredGroups = $derived.by(() => {
		if (!input.trim()) return shortcutGroups;

		const query = input.toLowerCase();
		return shortcutGroups
			.map((group) => ({
				...group,
				shortcuts: group.shortcuts.filter(
					(shortcut) =>
						shortcut.description.toLowerCase().includes(query) ||
						shortcut.keys.some((key) => key.toLowerCase().includes(query))
				)
			}))
			.filter((group) => group.shortcuts.length > 0);
	});

	function handleKeyDown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key === SHORTCUT_KEY) {
			event.preventDefault();
			open = true;
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<Dialog {open} {onOpenChange}>
	<DialogContent {dir} class="max-w-2xl px-0" {onOpenAutoFocus} showCloseButton={false}>
		<DialogClose class="absolute top-6 inset-e-6">
			{#snippet child({ props })}
				<Button {...props} variant="ghost" size="icon" class="size-6">
					<X />
				</Button>
			{/snippet}
		</DialogClose>
		<DialogHeader class="px-6">
		<DialogTitle>Atajos de teclado</DialogTitle>
		<DialogDescription class="sr-only">
			Usa estos atajos de teclado para navegar e interactuar con la tabla de datos de forma más eficiente.
			</DialogDescription>
		</DialogHeader>
		<div class="px-6">
			<div class="relative">
				<Search class="-translate-y-1/2 absolute top-1/2 inset-s-3 size-3.5 text-muted-foreground" />
				<Input
					bind:ref={inputRef}
				placeholder="Buscar atajos..."
					class="h-8 ps-8"
					bind:value={input}
				/>
			</div>
		</div>
		<Separator class="mx-auto data-[orientation=horizontal]:w-[calc(100%-(--spacing(12)))]" />
		<div class="h-[40vh] overflow-y-auto px-6">
			{#if filteredGroups.length === 0}
				<div class="flex h-full flex-col items-center justify-center gap-3 text-center">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground"
					>
						<Search class="pointer-events-none size-6" />
					</div>
					<div class="flex flex-col gap-1">
					<div class="font-medium text-lg tracking-tight">Sin atajos encontrados</div>
					<p class="text-muted-foreground text-sm">Intenta con un término diferente.</p>
					</div>
				</div>
			{:else}
				<div class="flex flex-col gap-6">
					{#each filteredGroups as shortcutGroup (shortcutGroup.title)}
						<div class="flex flex-col gap-2">
							<h3 class="font-semibold text-foreground text-sm">
								{shortcutGroup.title}
							</h3>
							<div class="divide-y divide-border rounded-md border">
								{#each shortcutGroup.shortcuts as shortcut, index (index)}
									<div class="flex items-center gap-4 px-3 py-2">
										<span class="flex-1 text-sm">{shortcut.description}</span>
										<KbdGroup class="shrink-0">
											{#each shortcut.keys as key, keyIndex (key)}
												{#if keyIndex > 0}
													<span class="text-muted-foreground text-xs">+</span>
												{/if}
												<Kbd>{key}</Kbd>
											{/each}
										</KbdGroup>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</DialogContent>
</Dialog>
