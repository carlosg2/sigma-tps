<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import { BOM_STATUS_LABELS, BOM_STATUS_COLORS, ARMOR_LEVEL_LABELS } from '$lib/tps/constants.js';
	import { generateId } from '$lib/tps/utils.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Search from '@lucide/svelte/icons/search';
	import ArrowRightLeft from '@lucide/svelte/icons/arrow-right-left';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import CheckCircle2 from '@lucide/svelte/icons/circle-check-big';

	const store = useStore();
	const app = $derived(store.state);

	let oldQuery = $state('');
	let newQuery = $state('');
	let oldArticleId = $state<string | null>(null);
	let newArticleId = $state<string | null>(null);
	let selectedBomIds = $state<string[]>([]);
	let reason = $state('');
	let applied = $state(false);

	function searchArticles(q: string) {
		if (q.length < 2) return [];
		return app.articles
			.filter((a) => `${a.code} ${a.description}`.toLowerCase().includes(q.toLowerCase()))
			.slice(0, 8);
	}

	const affectedBOMs = $derived.by(() => {
		if (!oldArticleId) return [];
		return app.boms.filter((b) => b.components.some((c) => c.articleId === oldArticleId));
	});

	const oldArticle = $derived(app.articles.find((a) => a.id === oldArticleId));
	const newArticle = $derived(app.articles.find((a) => a.id === newArticleId));

	function toggleBom(id: string) {
		selectedBomIds = selectedBomIds.includes(id)
			? selectedBomIds.filter((b) => b !== id)
			: [...selectedBomIds, id];
	}

	function selectAll() {
		selectedBomIds = affectedBOMs.map((b) => b.id);
	}
	function deselectAll() {
		selectedBomIds = [];
	}

	function applyChange() {
		if (!oldArticleId || !newArticleId || selectedBomIds.length === 0 || !reason.trim()) return;
		store.dispatch({
			type: 'MASS_CHANGE_COMPONENT',
			payload: { oldArticleId, newArticleId, bomIds: selectedBomIds, reason: reason.trim() }
		});
		store.dispatch({
			type: 'ADD_AUDIT_LOG',
			payload: {
				id: generateId(),
				userId: app.currentUser.id,
				userName: app.currentUser.name,
				entity: 'BOM',
				entityId: 'mass-change',
				action: 'cambio_masivo',
				field: 'componente',
				oldValue: oldArticle?.code || '',
				newValue: `${newArticle?.code} en ${selectedBomIds.length} BOMs`,
				timestamp: new Date().toISOString()
			}
		});
		applied = true;
	}

	function reset() {
		applied = false;
		oldArticleId = null;
		newArticleId = null;
		selectedBomIds = [];
		reason = '';
		oldQuery = '';
		newQuery = '';
	}
</script>

{#if applied}
	<div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
		<Empty.Root>
			<Empty.Header>
				<Empty.Media variant="icon">
					<CheckCircle2 />
				</Empty.Media>
				<Empty.Title>Cambio masivo aplicado</Empty.Title>
				<Empty.Description>
					Se reemplazo <span class="text-primary font-mono">{oldArticle?.code}</span> por
					<span class="text-primary font-mono">{newArticle?.code}</span> en
					{selectedBomIds.length} BOMs. Se creo una nueva revision en cada BOM afectado.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<div class="flex justify-center gap-2">
					<Button href="/lmat/boms">Ver BOMs</Button>
					<Button variant="outline" onclick={reset}>Nuevo Cambio</Button>
				</div>
			</Empty.Content>
		</Empty.Root>
	</div>
{:else}
	<div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
		<div class="flex items-center gap-3">
			<Button href="/lmat/boms" variant="outline" size="icon">
				<ArrowLeft />
			</Button>
			<p class="text-muted-foreground text-sm">Reemplaza un componente por otro en multiples BOMs</p>
		</div>

		<!-- Step 1 -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>Componente ACTUAL (a reemplazar)</Card.Title>
				</Card.Header>
				<Card.Content class="flex flex-col gap-2">
					<div class="relative w-full">
						<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
						<Input
							placeholder="Buscar articulo..."
							bind:value={oldQuery}
							oninput={() => { oldArticleId = null; selectedBomIds = []; }}
							class="pl-8"
						/>
					</div>
					{#if !oldArticleId && searchArticles(oldQuery).length > 0}
						<div class="flex flex-col overflow-hidden rounded-md border">
							{#each searchArticles(oldQuery) as a (a.id)}
								<button
									onclick={() => { oldArticleId = a.id; oldQuery = a.code; selectAll(); }}
									class="hover:bg-accent border-border/30 flex items-center gap-2 border-b px-3 py-1.5 text-left text-xs transition-colors last:border-0"
								>
									<span class="text-primary font-mono">{a.code}</span>
									<span class="text-foreground truncate">{a.description}</span>
								</button>
							{/each}
						</div>
					{/if}
					{#if oldArticle}
						<div class="border-primary/30 bg-primary/5 rounded-md border p-2">
							<p class="text-primary font-mono text-xs">{oldArticle.code}</p>
							<p class="text-muted-foreground truncate text-xs">{oldArticle.description}</p>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Componente NUEVO (reemplazo)</Card.Title>
				</Card.Header>
				<Card.Content class="flex flex-col gap-2">
					<div class="relative w-full">
						<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
						<Input
							placeholder="Buscar articulo..."
							bind:value={newQuery}
							oninput={() => (newArticleId = null)}
							class="pl-8"
						/>
					</div>
					{#if !newArticleId && searchArticles(newQuery).length > 0}
						<div class="flex flex-col overflow-hidden rounded-md border">
							{#each searchArticles(newQuery) as a (a.id)}
								<button
									onclick={() => { newArticleId = a.id; newQuery = a.code; }}
									class="hover:bg-accent border-border/30 flex items-center gap-2 border-b px-3 py-1.5 text-left text-xs transition-colors last:border-0"
								>
									<span class="text-primary font-mono">{a.code}</span>
									<span class="text-foreground truncate">{a.description}</span>
								</button>
							{/each}
						</div>
					{/if}
					{#if newArticle}
						<div class="border-primary/30 bg-primary/5 rounded-md border p-2">
							<p class="text-primary font-mono text-xs">{newArticle.code}</p>
							<p class="text-muted-foreground truncate text-xs">{newArticle.description}</p>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Step 2 -->
		{#if oldArticleId && affectedBOMs.length > 0}
			<Card.Root>
				<Card.Header>
					<Card.Title>BOMs afectados ({affectedBOMs.length})</Card.Title>
					<Card.Description>Selecciona cuales modificar</Card.Description>
					<Card.Action>
						<div class="flex gap-2">
							<Button variant="ghost" size="sm" onclick={selectAll}>Todos</Button>
							<Button variant="ghost" size="sm" onclick={deselectAll}>Ninguno</Button>
						</div>
					</Card.Action>
				</Card.Header>
				<Card.Content>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-8"></Table.Head>
								<Table.Head>Especificacion</Table.Head>
								<Table.Head>Modelo</Table.Head>
								<Table.Head>Nivel</Table.Head>
								<Table.Head>Estatus</Table.Head>
								<Table.Head class="text-right">Cantidad</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each affectedBOMs as bom (bom.id)}
								{@const comp = bom.components.find((c) => c.articleId === oldArticleId)!}
								<Table.Row class="cursor-pointer" onclick={() => toggleBom(bom.id)}>
									<Table.Cell>
										<Checkbox checked={selectedBomIds.includes(bom.id)} />
									</Table.Cell>
									<Table.Cell>
										<span class="text-primary font-mono text-xs">{bom.specificationCode}</span>
									</Table.Cell>
									<Table.Cell>{bom.vehicleModel}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">{ARMOR_LEVEL_LABELS[bom.armorLevel]}</Table.Cell>
									<Table.Cell>
										<StatusBadge label={BOM_STATUS_LABELS[bom.status]} colorClass={BOM_STATUS_COLORS[bom.status]} />
									</Table.Cell>
									<Table.Cell class="text-right font-mono tabular-nums">{comp.quantity}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		{/if}

		{#if oldArticleId && affectedBOMs.length === 0}
			<Empty.Root>
				<Empty.Header>
					<Empty.Media variant="icon">
						<Search />
					</Empty.Media>
					<Empty.Title>Sin BOMs afectados</Empty.Title>
					<Empty.Description>Este articulo no aparece en ningun BOM.</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{/if}

		<!-- Step 3 -->
		{#if oldArticleId && newArticleId && selectedBomIds.length > 0}
			<Card.Root>
				<Card.Content class="flex flex-col gap-4 pt-6">
					<Alert.Root>
						<AlertTriangle />
						<Alert.Title>Preview del cambio</Alert.Title>
						<Alert.Description>
							Reemplazar <span class="text-primary font-mono">{oldArticle?.code}</span> por
							<span class="text-primary font-mono">{newArticle?.code}</span> en
							<span class="text-foreground font-bold">{selectedBomIds.length}</span> BOMs.
							Se creara una nueva revision en cada BOM afectado.
						</Alert.Description>
					</Alert.Root>
					<div class="grid gap-2">
						<Label for="motivo">Motivo del cambio (obligatorio):</Label>
						<Input id="motivo" bind:value={reason} placeholder="Ej: Cambio de proveedor, nuevo material equivalente..." />
					</div>
					<div>
						<Button onclick={applyChange} disabled={!reason.trim()}>
							<ArrowRightLeft data-icon="inline-start" /> Aplicar Cambio Masivo
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
{/if}
