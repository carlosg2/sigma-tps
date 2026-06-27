<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import { generateId } from '$lib/tps/utils.js';
	import type { Article, UdM, Plant } from '$lib/tps/types.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Upload from '@lucide/svelte/icons/upload';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import CheckCircle2 from '@lucide/svelte/icons/circle-check-big';
	import Download from '@lucide/svelte/icons/download';

	interface ParsedRow {
		code: string;
		description: string;
		group: string;
		udmBase: string;
		supplierName: string;
		price: number;
		currency: string;
		leadTimeDays: number;
		location: string;
		plant: string;
		errors: string[];
	}

	const TEMPLATE_HEADERS =
		'Codigo,Descripcion,Grupo,UdM Base,Proveedor,Precio,Moneda,Lead Time (dias),Ubicacion,Planta';

	const store = useStore();
	const app = $derived(store.state);

	let rows = $state<ParsedRow[]>([]);
	let rawText = $state('');
	let imported = $state(false);

	function downloadTemplate() {
		const csv = `${TEMPLATE_HEADERS}\nACB-EJEMPLO-001,Placa de ejemplo 6mm,Acero Balistico,placa,Aceros Balisticos del Norte,18500,MXN,150,A-01-01,planta_1`;
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'plantilla_articulos.csv';
		a.click();
		URL.revokeObjectURL(url);
	}

	function parseCSV(text: string) {
		const lines = text.trim().split('\n');
		if (lines.length < 2) return;
		const parsed: ParsedRow[] = lines.slice(1).map((line) => {
			const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
			const errors: string[] = [];
			if (!cols[0]) errors.push('Codigo vacio');
			if (!cols[1]) errors.push('Descripcion vacia');
			if (app.articles.some((a) => a.code === cols[0])) errors.push('Codigo duplicado en sistema');
			return {
				code: cols[0] || '',
				description: cols[1] || '',
				group: cols[2] || 'Varios',
				udmBase: cols[3] || 'pieza',
				supplierName: cols[4] || '',
				price: parseFloat(cols[5]) || 0,
				currency: cols[6] || 'MXN',
				leadTimeDays: parseInt(cols[7]) || 0,
				location: cols[8] || '',
				plant: cols[9] || 'planta_1',
				errors
			};
		});
		rows = parsed;
	}

	function handleFile(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			const text = ev.target?.result as string;
			rawText = text;
			parseCSV(text);
		};
		reader.readAsText(file);
	}

	function handlePaste() {
		if (rawText) parseCSV(rawText);
	}

	function doImport() {
		const validRows = rows.filter((r) => r.errors.length === 0);
		const today = new Date().toISOString().split('T')[0];
		const articles: Article[] = validRows.map((r) => {
			const supplier = app.suppliers.find((s) =>
				s.name.toLowerCase().includes(r.supplierName.toLowerCase())
			);
			return {
				id: generateId(),
				code: r.code,
				description: r.description,
				descriptionGeneric: '',
				articleType: 'compra',
				udmBase: r.udmBase as UdM,
				udmBOM: r.udmBase as UdM,
				drawingRef: '',
				group: r.group,
				family: '',
				supplierId: supplier?.id || '',
				supplierName: supplier?.name || r.supplierName,
				price: r.price,
				currency: r.currency as 'MXN' | 'USD',
				udmPurchase: r.udmBase as UdM,
				leadTimeDays: r.leadTimeDays,
				suppliers: [],
				location: r.location,
				warehouse: 'MP - Materia Prima',
				udmStorage: r.udmBase as UdM,
				minStock: 0,
				maxStock: 0,
				reorderPoint: 0,
				supplyMethod: 'bom_kit',
				requiresLotSerial: false,
				route: '',
				workCenter: '',
				udmProduction: r.udmBase as UdM,
				productionRoute: [],
				subBOMId: null,
				cncProgramId: null,
				qualityGroup: '',
				inspectionRequired: false,
				qualityApproved: false,
				costCenter: '',
				costMethod: 'promedio',
				abcClass: 'sin_clasificar',
				status: 'borrador',
				completeness: 0,
				conversions: [],
				plant: r.plant as Plant,
				p5Code: '',
				documents: [],
				imageUrl: '',
				createdAt: today,
				updatedAt: today,
				createdBy: app.currentUser.id
			};
		});
		store.dispatch({ type: 'IMPORT_ARTICLES', payload: articles });
		store.dispatch({
			type: 'ADD_AUDIT_LOG',
			payload: {
				id: generateId(),
				userId: app.currentUser.id,
				userName: app.currentUser.name,
				entity: 'Article',
				entityId: 'batch',
				action: 'importar',
				field: 'importacion',
				oldValue: '',
				newValue: `${articles.length} articulos importados`,
				timestamp: new Date().toISOString()
			}
		});
		imported = true;
	}

	const validCount = $derived(rows.filter((r) => r.errors.length === 0).length);
	const errorCount = $derived(rows.filter((r) => r.errors.length > 0).length);
</script>

<div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<Button href="/articulos" variant="outline" size="sm">
			<ArrowLeft data-icon="inline-start" /> Volver
		</Button>
		<p class="text-muted-foreground text-sm">Carga masiva desde archivo CSV</p>
	</div>

	{#if imported}
		<Empty.Root>
			<Empty.Header>
				<Empty.Media variant="icon">
					<CheckCircle2 />
				</Empty.Media>
				<Empty.Title>{validCount} articulos importados correctamente</Empty.Title>
				<Empty.Description>Los articulos fueron creados con estatus "Borrador"</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button href="/articulos">Ver Catalogo</Button>
			</Empty.Content>
		</Empty.Root>
	{:else}
		<!-- Download template -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<FileSpreadsheet class="text-primary size-5" /> Plantilla CSV
				</Card.Title>
				<Card.Description>Descarga la plantilla, llenala y subela aqui</Card.Description>
				<Card.Action>
					<Button variant="outline" size="sm" onclick={downloadTemplate}>
						<Download data-icon="inline-start" /> Descargar Plantilla
					</Button>
				</Card.Action>
			</Card.Header>
		</Card.Root>

		<!-- Upload area -->
		<Card.Root class="border-dashed">
			<Card.Content class="flex flex-col items-center gap-3 py-8 text-center">
				<Upload class="text-muted-foreground size-8" />
				<p class="text-card-foreground text-sm">Arrastra tu archivo CSV aqui o</p>
				<label class={buttonVariants({ size: 'sm' })}>
					Seleccionar Archivo
					<input type="file" accept=".csv,.txt" onchange={handleFile} class="hidden" />
				</label>
			</Card.Content>
		</Card.Root>

		<!-- Paste area -->
		<Card.Root>
			<Card.Header>
				<Card.Title>O pega datos CSV directamente</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-2">
				<Textarea
					class="min-h-25 font-mono text-xs"
					placeholder={TEMPLATE_HEADERS + '\nACB-001,Placa ejemplo,...'}
					bind:value={rawText}
				/>
				<div>
					<Button variant="outline" size="sm" onclick={handlePaste}>Procesar Texto</Button>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Preview table -->
		{#if rows.length > 0}
			<Card.Root>
				<Card.Header>
					<Card.Title>Preview</Card.Title>
					<Card.Description>
						{rows.length} filas ({validCount} validas, {errorCount} con errores)
					</Card.Description>
					<Card.Action>
						<Button size="sm" onclick={doImport} disabled={validCount === 0}>
							<Upload data-icon="inline-start" /> Importar {validCount} Articulos
						</Button>
					</Card.Action>
				</Card.Header>
				<Card.Content>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Est.</Table.Head>
								<Table.Head>Codigo</Table.Head>
								<Table.Head>Descripcion</Table.Head>
								<Table.Head>Grupo</Table.Head>
								<Table.Head>UdM</Table.Head>
								<Table.Head class="text-right">Precio</Table.Head>
								<Table.Head>Errores</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each rows as row, i (i)}
								<Table.Row class={row.errors.length > 0 ? 'bg-destructive/5' : ''}>
									<Table.Cell>
										{#if row.errors.length > 0}
											<AlertTriangle class="text-destructive size-3.5" />
										{:else}
											<CheckCircle2 class="text-primary size-3.5" />
										{/if}
									</Table.Cell>
									<Table.Cell class="font-mono text-xs">{row.code}</Table.Cell>
									<Table.Cell class="max-w-50 truncate">{row.description}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">{row.group}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">{row.udmBase}</Table.Cell>
									<Table.Cell class="text-right font-mono text-xs tabular-nums">
										{row.price > 0 ? `$${row.price}` : '---'}
									</Table.Cell>
									<Table.Cell class="text-destructive text-xs">{row.errors.join(', ')}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}
</div>
