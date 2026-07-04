<script lang="ts">
	import {
		FONT_DEFINITIONS,
		getFontAxes,
		getFontFeatures,
		getDefaultAxesValues,
		getDefaultFeatureValues,
	} from "$lib/ds/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Select from "$lib/components/ui/select/index.js";

	// Fonts with full OpenType feature support via static/fonts overrides (fonts-full.css).
	// Other fonts use Google's subsetted woff2, which strips alternate glyphs (cv*/ss*/...).
	const FULL_FEATURE_FONTS = new Set([
		"inter",
		"ibm-plex-sans",
		"geist",
		"noto-sans",
		"roboto",
		"raleway",
		"space-grotesk",
		"montserrat",
		"source-sans-3",
		"instrument-sans",
		"jetbrains-mono",
		"noto-serif",
		"merriweather",
		"playfair-display",
	]);

	const TYPE_LABELS: Record<string, string> = {
		sans: "Sans-serif",
		serif: "Serif",
		mono: "Monospace",
	};

	const groupedFonts = (() => {
		const byType: Record<string, (typeof FONT_DEFINITIONS)[number][]> = {};
		const order: string[] = [];
		for (const f of FONT_DEFINITIONS) {
			if (!byType[f.type]) {
				byType[f.type] = [];
				order.push(f.type);
			}
			byType[f.type].push(f);
		}
		return order.map((type) => ({ type, label: TYPE_LABELS[type] ?? type, items: byType[type] }));
	})();

	function initAxes(name: string): Record<string, number> {
		const a = getFontAxes(name);
		return a ? getDefaultAxesValues(a) : {};
	}
	function initFeatures(name: string): Record<string, boolean> {
		const f = getFontFeatures(name);
		return f ? getDefaultFeatureValues(f) : {};
	}

	let selectedName = $state("geist");
	let axisValues = $state<Record<string, number>>(initAxes("geist"));
	let featureValues = $state<Record<string, boolean>>(initFeatures("geist"));

	let sample = $state("Sphinx of black quartz, judge my vow — agil 0123456789 · fi ff 1/2 No.1 2nd");

	const selected = $derived(FONT_DEFINITIONS.find((f) => f.name === selectedName)!);
	const axes = $derived(getFontAxes(selectedName));
	const features = $derived(getFontFeatures(selectedName));
	const axesEntries = $derived(axes ? Object.entries(axes) : []);
	const isFullFeature = $derived(FULL_FEATURE_FONTS.has(selectedName));

	const variationSettings = $derived.by(() => {
		if (!axes) return "normal";
		const defaults = getDefaultAxesValues(axes);
		const entries = Object.entries(axisValues).filter(([k, v]) => v !== defaults[k]);
		if (entries.length === 0) return "normal";
		return entries.map(([k, v]) => `'${k}' ${v}`).join(", ");
	});

	const featureSettings = $derived.by(() => {
		if (!features) return "normal";
		const on = features.filter((f) => featureValues[f.tag]);
		if (on.length === 0) return "normal";
		return on.map((f) => `'${f.tag}' 1`).join(", ");
	});

	const customStyle = $derived(
		`font-family: ${selected.family}; font-variation-settings: ${variationSettings}; font-feature-settings: ${featureSettings};`
	);
	const defaultStyle = $derived(`font-family: ${selected.family};`);

	const cssText = $derived(
		[
			`font-family: ${selected.family};`,
			variationSettings !== "normal" ? `font-variation-settings: ${variationSettings};` : null,
			featureSettings !== "normal" ? `font-feature-settings: ${featureSettings};` : null,
		]
			.filter(Boolean)
			.join("\n")
	);

	const activeFeatureCount = $derived(
		features ? features.filter((f) => featureValues[f.tag]).length : 0
	);

	function selectFont(name: string) {
		selectedName = name;
		axisValues = initAxes(name);
		featureValues = initFeatures(name);
	}

	function resetAll() {
		axisValues = initAxes(selectedName);
		featureValues = initFeatures(selectedName);
	}

	function setAllFeatures(value: boolean) {
		if (!features) return;
		const next: Record<string, boolean> = {};
		for (const f of features) next[f.tag] = value;
		featureValues = next;
	}

	let copied = $state(false);
	async function copyCss() {
		try {
			await navigator.clipboard.writeText(cssText);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			// ignore
		}
	}

	const glyphSamples: [string, string][] = [
		["Letras", "a g l i j t y R I G"],
		["Números", "0 1 2 6 9"],
		["Tabulares", "1111 / 0000"],
		["Fracciones", "1/2 3/4 5/8"],
		["Ligaduras", "fi ff fl ffi -> =>"],
		["Símbolos", "& @ # No. 1st 2nd"],
	];
</script>

<svelte:head>
	<title>Font Features Playground · s-mail</title>
</svelte:head>

<div class="flex h-screen flex-col overflow-hidden">
	<!-- Slim header (pr-14 keeps clear of the floating customizer) -->
	<header class="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2 pr-14">
		<div class="flex items-baseline gap-2">
			<h1 class="text-sm font-semibold tracking-tight">Font Features Playground</h1>
			<span class="text-muted-foreground hidden text-xs sm:inline">
				{selected.title} · {axesEntries.length} ejes · {activeFeatureCount}/{features?.length ?? 0} features
			</span>
		</div>
		<Button href="/" variant="ghost" size="sm" class="h-7 shrink-0 px-2 text-xs">← Inicio</Button>
	</header>

	<div class="grid min-h-0 flex-1 md:grid-cols-[20rem_1fr]">
		<!-- LEFT: all controls, compact, no page scroll -->
		<aside class="flex min-h-0 flex-col gap-3 overflow-y-auto border-r p-3">
			<!-- Font selector: shadcn Select so each option renders in its own font -->
			<div class="grid gap-1">
				<span class="text-muted-foreground text-[11px] font-medium">Fuente</span>
				<Select.Root
					type="single"
					value={selectedName}
					onValueChange={(v) => v && selectFont(v)}
				>
					<Select.Trigger class="h-10 w-full">
						<span class="truncate text-lg" style="font-family: {selected.family}">
							{selected.title}
						</span>
					</Select.Trigger>
					<Select.Content align="start" class="max-h-[60vh]">
						{#each groupedFonts as group (group.type)}
							<Select.Group>
								<Select.GroupHeading>{group.label}</Select.GroupHeading>
								{#each group.items as font (font.name)}
									<Select.Item value={font.name} label={font.title}>
										<span class="text-base" style="font-family: {font.family}">
											{font.title}
										</span>
									</Select.Item>
								{/each}
							</Select.Group>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Variable axes -->
			{#if axesEntries.length > 0}
				<div class="flex flex-col gap-2 border-t pt-3">
					<span class="text-muted-foreground text-[11px] font-medium">Ejes variables</span>
					{#each axesEntries as [key, axis] (key)}
						<div class="grid gap-1">
							<div class="flex items-center justify-between">
								<span class="text-xs">
									{axis.label}
									<span class="text-muted-foreground/60 ml-1 font-mono text-[10px]">{key}</span>
								</span>
								<span class="text-muted-foreground text-[11px] tabular-nums">
									{axisValues[key]?.toFixed(axis.step < 1 ? 1 : 0) ?? axis.default}
								</span>
							</div>
							<Slider
								type="single"
								min={axis.min}
								max={axis.max}
								step={axis.step}
								value={axisValues[key] ?? axis.default}
								onValueChange={(v: number) => (axisValues[key] = v)}
								class="**:[[role=slider]]:size-3"
							/>
						</div>
					{/each}
				</div>
			{/if}

			<!-- OpenType features as a dense chip grid -->
			{#if features && features.length > 0}
				<div class="flex min-h-0 flex-col gap-2 border-t pt-3">
					<div class="flex items-center justify-between">
						<span class="text-muted-foreground text-[11px] font-medium">
							Features · {activeFeatureCount}/{features.length}
						</span>
						<div class="flex gap-1">
							<button
								type="button"
								class="text-muted-foreground hover:text-foreground text-[10px]"
								onclick={() => setAllFeatures(true)}
							>
								Todas
							</button>
							<span class="text-muted-foreground/40 text-[10px]">·</span>
							<button
								type="button"
								class="text-muted-foreground hover:text-foreground text-[10px]"
								onclick={() => setAllFeatures(false)}
							>
								Ninguna
							</button>
						</div>
					</div>
					<div class="grid grid-cols-2 gap-1">
						{#each features as feature (feature.tag)}
							<button
								type="button"
								onclick={() => (featureValues[feature.tag] = !featureValues[feature.tag])}
								title={feature.label}
								class="flex items-center gap-1.5 overflow-hidden rounded-md border px-1.5 py-1 text-left transition-colors {featureValues[
									feature.tag
								]
									? 'border-primary bg-primary text-primary-foreground'
									: 'border-input hover:bg-accent hover:text-accent-foreground'}"
							>
								<span class="shrink-0 font-mono text-[10px] tabular-nums">{feature.tag}</span>
								<span class="truncate text-[10px] opacity-80">{feature.label}</span>
							</button>
						{/each}
					</div>
				</div>
			{:else}
				<div class="text-muted-foreground border-t pt-3 text-xs">
					Esta fuente no define features OpenType en el catálogo.
				</div>
			{/if}

			<div class="mt-auto flex items-center gap-2 border-t pt-3">
				<Button variant="outline" size="sm" class="h-7 flex-1 text-xs" onclick={resetAll}>
					Restablecer
				</Button>
			</div>
		</aside>

		<!-- RIGHT: previews + slim sample bar -->
		<main class="flex min-h-0 flex-col overflow-hidden">
			<!-- Slim sample editor bar -->
			<div class="flex shrink-0 items-center gap-2 border-b px-4 py-1.5">
				<span class="text-muted-foreground shrink-0 text-[11px] font-medium">Muestra</span>
				<input
					bind:value={sample}
					spellcheck="false"
					class="focus-visible:ring-ring h-7 flex-1 rounded-md border-transparent bg-transparent px-1 text-sm focus-visible:ring-1 focus-visible:outline-none"
				/>
				{#if !isFullFeature && features && features.length > 0}
					<span
						class="shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-600 dark:text-amber-400"
						title="Esta fuente usa el subset de Google Fonts; las features de glifos alternos pueden no verse."
					>
						⚠ subset
					</span>
				{/if}
			</div>

			<div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
				<!-- Custom preview -->
				<div class="rounded-lg border p-4">
					<div class="text-muted-foreground mb-2 text-[11px] font-medium">Personalizado</div>
					<p class="text-4xl leading-snug wrap-break-word" style={customStyle}>{sample}</p>
				</div>

				<!-- Default preview -->
				<div class="rounded-lg border p-4">
					<div class="text-muted-foreground mb-2 text-[11px] font-medium">Por defecto</div>
					<p class="text-muted-foreground text-4xl leading-snug wrap-break-word" style={defaultStyle}>
						{sample}
					</p>
				</div>

				<!-- Glyph reference -->
				<div class="rounded-lg border p-4">
					<div class="text-muted-foreground mb-3 text-[11px] font-medium">Referencia de glifos</div>
					<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
						{#each glyphSamples as [label, text] (label)}
							<div class="flex flex-col gap-1">
								<span class="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
									{label}
								</span>
								<span class="text-2xl tabular-nums" style={customStyle}>{text}</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- Generated CSS -->
				<div class="rounded-lg border p-4">
					<div class="mb-2 flex items-center justify-between">
						<span class="text-muted-foreground text-[11px] font-medium">CSS generado</span>
						<Button variant="outline" size="sm" class="h-6 px-2 text-[11px]" onclick={copyCss}>
							{copied ? "¡Copiado!" : "Copiar"}
						</Button>
					</div>
					<pre class="bg-muted overflow-x-auto rounded-md p-3 text-xs"><code>{cssText}</code></pre>
				</div>
			</div>
		</main>
	</div>
</div>
