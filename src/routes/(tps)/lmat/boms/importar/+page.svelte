<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import { generateId } from '$lib/tps/utils.js';
	import {
		ARMOR_LEVEL_LABELS,
		PLANT_LABELS,
		PLANT_CELLS,
		VALIDATION_DEPARTMENTS
	} from '$lib/tps/constants.js';
	import type { BOM, BOMComponent, ArmorLevel, Plant, UdM } from '$lib/tps/types.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Upload from '@lucide/svelte/icons/upload';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import CheckCircle2 from '@lucide/svelte/icons/circle-check-big';
	import Download from '@lucide/svelte/icons/download';
	import Info from '@lucide/svelte/icons/info';
	import Layers from '@lucide/svelte/icons/layers';

	interface ParsedRow {
		line: number;
		specCode: string;
		model: string;
		armorRaw: string;
		plantRaw: string;
		articleCode: string;
		quantity: number;
		udm: string;
		cell: string;
		operation: string;
		articleId: string;
		errors: string[];
	}

	interface ParsedBOM {
		specCode: string;
		model: string;
		armorLevel: ArmorLevel | '';
		plant: Plant | '';
		rows: ParsedRow[];
		validRows: ParsedRow[];
		errors: string[];
		valid: boolean;
	}

	const TEMPLATE_HEADERS =
		'Codigo Especificacion,Modelo,Nivel Blindaje,Planta,Codigo Articulo,Cantidad,UdM,Celda,Operacion';

	const ARMOR_MAP: Record<string, ArmorLevel> = {
		NIII: 'NIII',
		'NIII+': 'NIII_plus',
		NIII_PLUS: 'NIII_plus',
		NIV: 'NIV',
		'NIV+': 'NIV_plus',
		NIV_PLUS: 'NIV_plus',
		NV: 'NV',
		NVI: 'NVI',
		NVII: 'NVII'
	};

	const store = useStore();
	const app = $derived(store.state);

	let rows = $state<ParsedRow[]>([]);
	let rawText = $state('');
	let imported = $state(false);
	let createdBOMs = $state(0);
	let createdComponents = $state(0);

	function normalizeArmor(s: string): ArmorLevel | '' {
		const key = s.trim().toUpperCase().replace(/\s+/g, '');
		return ARMOR_MAP[key] ?? '';
	}

	function normalizePlant(s: string): Plant | '' {
		const key = s.trim().toLowerCase().replace(/\s+/g, '_');
		if (key === 'planta_1' || key === 'planta_2' || key === 'almacen_servicios') return key;
		return '';
	}

	function downloadTemplate() {
		const csv =
			`${TEMPLATE_HEADERS}\n` +
			`ESP-EJEMPLO-001,Toyota Land Cruiser 300,NIII,planta_1,ACB-6MM-001,8,placa,Celda 1,Corte y formado\n` +
			`ESP-EJEMPLO-001,Toyota Land Cruiser 300,NIII,planta_1,CB-DEL-NIII-001,1,pieza,Celda 3,Instalacion cristales`;
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'plantilla_boms.csv';
		a.click();
		URL.revokeObjectURL(url);
	}

	function parseCSV(text: string) {
		const lines = text.trim().split(/\r?\n/);
		if (lines.length < 2) {
			rows = [];
			return;
		}
		const parsed: ParsedRow[] = lines.slice(1).map((line, idx) => {
			const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
			const specCode = cols[0] || '';
			const model = cols[1] || '';
			const armorRaw = cols[2] || '';
			const plantRaw = cols[3] || '';
			const articleCode = cols[4] || '';
			const quantity = parseFloat(cols[5]) || 0;
			const udm = cols[6] || '';
			const cell = cols[7] || '';
			const operation = cols[8] || '';

			const article = app.articles.find(
				(a) => a.code.toLowerCase() === articleCode.toLowerCase()
			);
			const errors: string[] = [];
			if (!specCode) errors.push('Especificacion vacia');
			if (!articleCode) errors.push('Codigo de articulo vacio');
			else if (!article) errors.push('Articulo no encontrado en catalogo');
			if (quantity <= 0) errors.push('Cantidad invalida');
			if (armorRaw && !normalizeArmor(armorRaw)) errors.push('Nivel de blindaje invalido');
			if (plantRaw && !normalizePlant(plantRaw)) errors.push('Planta invalida');

			return {
				line: idx + 2,
				specCode,
				model,
				armorRaw,
				plantRaw,
				articleCode,
				quantity,
				udm,
				cell,
				operation,
				articleId: article?.id ?? '',
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

	// Agrupar filas por codigo de especificacion -> BOMs
	const parsedBOMs = $derived.by<ParsedBOM[]>(() => {
		const groups = new Map<string, ParsedRow[]>();
		for (const r of rows) {
			const key = r.specCode || `__sin_codigo_${r.line}`;
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key)!.push(r);
		}
		return Array.from(groups.values()).map((grp) => {
			const first = grp[0];
			const armorLevel = normalizeArmor(first.armorRaw);
			const plant = normalizePlant(first.plantRaw);
			const validRows = grp.filter((r) => r.errors.length === 0);
			const errors: string[] = [];
			if (!first.specCode) errors.push('Especificacion vacia');
			else if (app.boms.some((b) => b.specificationCode.toLowerCase() === first.specCode.toLowerCase()))
				errors.push('La especificacion ya existe en el sistema');
			if (!first.model) errors.push('Modelo vacio');
			if (!armorLevel) errors.push('Nivel de blindaje invalido');
			if (!plant) errors.push('Planta invalida');
			if (validRows.length === 0) errors.push('Sin componentes validos');
			return {
				specCode: first.specCode,
				model: first.model,
				armorLevel,
				plant,
				rows: grp,
				validRows,
				errors,
				valid: errors.length === 0
			};
		});
	});

	const validBOMs = $derived(parsedBOMs.filter((b) => b.valid));
	const errorBOMs = $derived(parsedBOMs.filter((b) => !b.valid));
	const totalValidComponents = $derived(
		validBOMs.reduce((sum, b) => sum + b.validRows.length, 0)
	);
	const errorRowCount = $derived(rows.filter((r) => r.errors.length > 0).length);

	function doImport() {
		const today = new Date().toISOString().split('T')[0];
		let bomCount = 0;
		let compCount = 0;
		for (const pb of validBOMs) {
			const components: BOMComponent[] = pb.validRows.map((r, idx) => {
				const art = app.articles.find((a) => a.id === r.articleId);
				return {
					id: generateId(),
					articleId: r.articleId,
					articleCode: art?.code || r.articleCode,
					articleDescription: art?.description || '',
					quantity: r.quantity,
					udm: (r.udm || art?.udmBase || 'pieza') as UdM,
					cell: r.cell || 'Celda 1',
					operation: r.operation || '',
					notes: '',
					hasCompleteData: (art?.completeness || 0) >= 80,
					parentId: null,
					order: idx,
					level: 0,
					isKit: false
				};
			});
			const bom: BOM = {
				id: generateId(),
				specificationCode: pb.specCode,
				vehicleModel: pb.model,
				armorLevel: pb.armorLevel as ArmorLevel,
				plant: pb.plant as Plant,
				version: 1,
				status: 'borrador',
				maturityStatus: 'en_desarrollo',
				components,
				revisions: [],
				healthPercent: 0,
				departmentValidations: VALIDATION_DEPARTMENTS.map((d) => ({
					department: d,
					status: 'pendiente' as const,
					validatedBy: null,
					validatedAt: null,
					notes: ''
				})),
				specificationId: null,
				plantRoutes: [
					{ plant: pb.plant as Plant, cells: PLANT_CELLS[pb.plant as Plant] ?? [], isActive: true }
				],
				cuttingKitIds: [],
				createdAt: today,
				updatedAt: today,
				createdBy: app.currentUser.id
			};
			store.dispatch({ type: 'ADD_BOM', payload: bom });
			bomCount++;
			compCount += components.length;
		}
		store.dispatch({
			type: 'ADD_AUDIT_LOG',
			payload: {
				id: generateId(),
				userId: app.currentUser.id,
				userName: app.currentUser.name,
				entity: 'BOM',
				entityId: 'batch',
				action: 'importar',
				field: 'importacion',
				oldValue: '',
				newValue: `${bomCount} BOMs (${compCount} componentes) importados`,
				timestamp: new Date().toISOString()
			}
		});
		createdBOMs = bomCount;
		createdComponents = compCount;
		imported = true;
	}

	function reset() {
		rows = [];
		rawText = '';
		imported = false;
		createdBOMs = 0;
		createdComponents = 0;
	}
</script>

<div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<Button href="/lmat/boms" variant="outline" size="sm">
			<ArrowLeft data-icon="inline-start" /> Volver a BOMs
		</Button>
		<p class="text-muted-foreground text-sm">Importacion masiva de listas de materiales desde CSV</p>
	</div>

	{#if imported}
		<Empty.Root>
			<Empty.Header>
				<Empty.Media variant="icon">
					<CheckCircle2 />
				</Empty.Media>
				<Empty.Title>{createdBOMs} BOMs importados correctamente</Empty.Title>
				<Empty.Description>
					Se crearon {createdBOMs} BOMs con {createdComponents} componentes en estatus "Borrador" / "En Desarrollo".
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<div class="flex flex-wrap justify-center gap-2">
					<Button href="/lmat/boms">Ver BOMs</Button>
					<Button variant="outline" onclick={reset}>Importar mas</Button>
				</div>
			</Empty.Content>
		</Empty.Root>
	{:else}
		<!-- Instrucciones / Plantilla -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<FileSpreadsheet class="text-primary size-5" /> Plantilla CSV
				</Card.Title>
				<Card.Description>
					Cada fila es un componente. Las filas con el mismo <strong>Codigo Especificacion</strong> se
					agrupan automaticamente en un BOM. El articulo debe existir en el catalogo (por codigo).
				</Card.Description>
				<Card.Action>
					<Button variant="outline" size="sm" onclick={downloadTemplate}>
						<Download data-icon="inline-start" /> Descargar Plantilla
					</Button>
				</Card.Action>
			</Card.Header>
			<Card.Content>
				<div class="text-muted-foreground bg-muted/40 overflow-x-auto rounded-md border p-3 font-mono text-xs">
					{TEMPLATE_HEADERS}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Upload -->
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

		<!-- Paste -->
		<Card.Root>
			<Card.Header>
				<Card.Title>O pega datos CSV directamente</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-2">
				<Textarea
					class="min-h-25 font-mono text-xs"
					placeholder={`${TEMPLATE_HEADERS}\nESP-001,Toyota Hilux,NIII,planta_2,ACB-6MM-001,5,placa,Celda 1,Corte`}
					bind:value={rawText}
				/>
				<div>
					<Button variant="outline" size="sm" onclick={handlePaste}>Procesar Texto</Button>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Preview -->
		{#if parsedBOMs.length > 0}
			<Card.Root>
				<Card.Header>
					<Card.Title>Preview</Card.Title>
					<Card.Description>
						{rows.length} filas · {parsedBOMs.length} BOMs ({validBOMs.length} validos, {errorBOMs.length}
						con errores)
					</Card.Description>
					<Card.Action>
						<Button size="sm" onclick={doImport} disabled={validBOMs.length === 0}>
							<Upload data-icon="inline-start" /> Importar {validBOMs.length} BOMs
						</Button>
					</Card.Action>
				</Card.Header>
				<Card.Content class="flex flex-col gap-4">
					{#if errorBOMs.length > 0}
						<Alert.Root variant="destructive">
							<AlertTriangle />
							<Alert.Title>{errorBOMs.length} BOMs no se importaran</Alert.Title>
							<Alert.Description>
								Revisa los errores marcados; esos BOMs se omitiran al importar.
							</Alert.Description>
						</Alert.Root>
					{/if}

					<!-- Resumen por BOM -->
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-8"></Table.Head>
								<Table.Head>Especificacion</Table.Head>
								<Table.Head>Modelo</Table.Head>
								<Table.Head>Nivel</Table.Head>
								<Table.Head>Planta</Table.Head>
								<Table.Head class="text-right">Componentes</Table.Head>
								<Table.Head>Errores</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each parsedBOMs as pb, i (pb.specCode + i)}
								<Table.Row class={pb.valid ? '' : 'bg-destructive/5'}>
									<Table.Cell>
										{#if pb.valid}
											<CheckCircle2 class="text-primary size-4" />
										{:else}
											<AlertTriangle class="text-destructive size-4" />
										{/if}
									</Table.Cell>
									<Table.Cell class="font-mono text-xs">{pb.specCode || '—'}</Table.Cell>
									<Table.Cell class="max-w-40 truncate">{pb.model || '—'}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">
										{pb.armorLevel ? ARMOR_LEVEL_LABELS[pb.armorLevel] : pb.rows[0]?.armorRaw || '—'}
									</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">
										{pb.plant ? PLANT_LABELS[pb.plant] : pb.rows[0]?.plantRaw || '—'}
									</Table.Cell>
									<Table.Cell class="text-right font-mono text-xs tabular-nums">
										{pb.validRows.length}/{pb.rows.length}
									</Table.Cell>
									<Table.Cell class="text-destructive text-xs">{pb.errors.join(', ')}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>

					<!-- Detalle de componentes -->
					<div class="flex flex-col gap-2">
						<div class="flex items-center gap-2">
							<Layers class="text-muted-foreground size-4" />
							<span class="text-sm font-medium">Detalle de componentes</span>
							<Badge variant="secondary">{rows.length}</Badge>
							{#if errorRowCount > 0}
								<Badge variant="outline" class="text-destructive border-transparent">
									{errorRowCount} con error
								</Badge>
							{/if}
						</div>
						<div class="max-h-96 overflow-auto rounded-md border">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head class="w-8"></Table.Head>
										<Table.Head>Especificacion</Table.Head>
										<Table.Head>Articulo</Table.Head>
										<Table.Head class="text-right">Cant.</Table.Head>
										<Table.Head>Celda</Table.Head>
										<Table.Head>Operacion</Table.Head>
										<Table.Head>Errores</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each rows as row (row.line)}
										<Table.Row class={row.errors.length > 0 ? 'bg-destructive/5' : ''}>
											<Table.Cell>
												{#if row.errors.length > 0}
													<AlertTriangle class="text-destructive size-3.5" />
												{:else}
													<CheckCircle2 class="text-primary size-3.5" />
												{/if}
											</Table.Cell>
											<Table.Cell class="font-mono text-xs">{row.specCode || '—'}</Table.Cell>
											<Table.Cell class="text-xs">
												<span class="font-mono">{row.articleCode || '—'}</span>
											</Table.Cell>
											<Table.Cell class="text-right font-mono text-xs tabular-nums">{row.quantity}</Table.Cell>
											<Table.Cell class="text-muted-foreground text-xs">{row.cell || '—'}</Table.Cell>
											<Table.Cell class="text-muted-foreground max-w-40 truncate text-xs">{row.operation || '—'}</Table.Cell>
											<Table.Cell class="text-destructive text-xs">{row.errors.join(', ')}</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{:else}
			<Alert.Root>
				<Info />
				<Alert.Title>Formato esperado</Alert.Title>
				<Alert.Description>
					Sube o pega un CSV con la cabecera de la plantilla. Cuando tengamos un ejemplo real del formato Excel
					de Planta 1 (SolidWorks) o Planta 2 (AutoCAD 2D) podemos mapear directamente ese formato.
				</Alert.Description>
			</Alert.Root>
		{/if}
	{/if}
</div>
