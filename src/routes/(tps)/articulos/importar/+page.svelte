<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import { generateId } from '$lib/tps/utils.js';
	import type { Article, UdM, Plant } from '$lib/tps/types.js';
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

<div class="flex max-w-4xl flex-col gap-6">
	<div class="flex items-center gap-3">
		<a
			href="/articulos"
			class="border-border hover:bg-secondary flex h-8 w-8 items-center justify-center rounded-md border transition-colors"
		>
			<ArrowLeft class="text-foreground h-4 w-4" />
		</a>
		<div>
			<h1 class="text-foreground text-xl font-bold">Importar Articulos</h1>
			<p class="text-muted-foreground text-sm">Carga masiva desde archivo CSV</p>
		</div>
	</div>

	{#if imported}
		<div class="border-primary/30 bg-primary/10 rounded-lg border p-6 text-center">
			<CheckCircle2 class="text-primary mx-auto mb-3 h-10 w-10" />
			<h2 class="text-foreground mb-1 text-lg font-semibold">
				{validCount} articulos importados correctamente
			</h2>
			<p class="text-muted-foreground mb-4 text-sm">Los articulos fueron creados con estatus "Borrador"</p>
			<a
				href="/articulos"
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
			>
				Ver Catalogo
			</a>
		</div>
	{:else}
		<!-- Download template -->
		<div class="border-border bg-card rounded-lg border p-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<FileSpreadsheet class="text-primary h-8 w-8" />
					<div>
						<h3 class="text-card-foreground text-sm font-semibold">Plantilla CSV</h3>
						<p class="text-muted-foreground text-xs">Descarga la plantilla, llenala y subela aqui</p>
					</div>
				</div>
				<button
					onclick={downloadTemplate}
					class="border-border text-foreground hover:bg-secondary flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors"
				>
					<Download class="h-3.5 w-3.5" /> Descargar Plantilla
				</button>
			</div>
		</div>

		<!-- Upload area -->
		<div class="border-border bg-card rounded-lg border-2 border-dashed p-8 text-center">
			<Upload class="text-muted-foreground mx-auto mb-3 h-8 w-8" />
			<p class="text-card-foreground mb-2 text-sm">Arrastra tu archivo CSV aqui o</p>
			<label
				class="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors"
			>
				Seleccionar Archivo
				<input type="file" accept=".csv,.txt" onchange={handleFile} class="hidden" />
			</label>
		</div>

		<!-- Paste area -->
		<div class="border-border bg-card rounded-lg border p-4">
			<h3 class="text-card-foreground mb-2 text-sm font-semibold">O pega datos CSV directamente:</h3>
			<textarea
				class="border-border bg-secondary text-foreground placeholder:text-muted-foreground min-h-[100px] w-full rounded-md border p-3 font-mono text-xs outline-none"
				placeholder={TEMPLATE_HEADERS + '\nACB-001,Placa ejemplo,...'}
				bind:value={rawText}
			></textarea>
			<button
				onclick={handlePaste}
				class="border-border text-foreground hover:bg-secondary mt-2 rounded-md border px-3 py-1.5 text-xs transition-colors"
			>
				Procesar Texto
			</button>
		</div>

		<!-- Preview table -->
		{#if rows.length > 0}
			<div class="border-border bg-card rounded-lg border">
				<div class="border-border flex items-center justify-between border-b px-4 py-3">
					<h3 class="text-card-foreground text-sm font-semibold">
						Preview: {rows.length} filas ({validCount} validas, {errorCount} con errores)
					</h3>
					<button
						onclick={doImport}
						disabled={validCount === 0}
						class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
					>
						<Upload class="h-3.5 w-3.5" /> Importar {validCount} Articulos
					</button>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-xs">
						<thead>
							<tr class="border-border border-b text-left">
								<th class="text-muted-foreground px-3 py-2 font-medium">Est.</th>
								<th class="text-muted-foreground px-3 py-2 font-medium">Codigo</th>
								<th class="text-muted-foreground px-3 py-2 font-medium">Descripcion</th>
								<th class="text-muted-foreground px-3 py-2 font-medium">Grupo</th>
								<th class="text-muted-foreground px-3 py-2 font-medium">UdM</th>
								<th class="text-muted-foreground px-3 py-2 text-right font-medium">Precio</th>
								<th class="text-muted-foreground px-3 py-2 font-medium">Errores</th>
							</tr>
						</thead>
						<tbody>
							{#each rows as row, i (i)}
								<tr class="border-border/30 border-b {row.errors.length > 0 ? 'bg-destructive/5' : ''}">
									<td class="px-3 py-1.5">
										{#if row.errors.length > 0}
											<AlertTriangle class="text-destructive-foreground h-3.5 w-3.5" />
										{:else}
											<CheckCircle2 class="text-primary h-3.5 w-3.5" />
										{/if}
									</td>
									<td class="text-card-foreground px-3 py-1.5 font-mono">{row.code}</td>
									<td class="text-card-foreground max-w-[200px] truncate px-3 py-1.5">{row.description}</td>
									<td class="text-muted-foreground px-3 py-1.5">{row.group}</td>
									<td class="text-muted-foreground px-3 py-1.5">{row.udmBase}</td>
									<td class="text-card-foreground px-3 py-1.5 text-right font-mono">
										{row.price > 0 ? `$${row.price}` : '---'}
									</td>
									<td class="text-destructive-foreground px-3 py-1.5">{row.errors.join(', ')}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	{/if}
</div>
