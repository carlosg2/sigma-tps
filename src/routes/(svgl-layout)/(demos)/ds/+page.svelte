<script lang="ts">
	import { tick } from "svelte";
	import { examples } from "./index.js";
	import * as Command from "$lib/components/ui/command/index.js";

	const visibleExamples = examples.filter((e) => !e.hidden);

	const modules = import.meta.glob<{ default: unknown }>("./*/*.svelte");

	let highlighted = $state(visibleExamples[0]?.title ?? "");
	let selected = $state(visibleExamples[0]?.name ?? "");

	const selectedTitle = $derived(visibleExamples.find((e) => e.name === selected)?.title);

	const NAV_KEYS = ["ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"];

	async function onkeydown(e: KeyboardEvent) {
		if (!NAV_KEYS.includes(e.key)) return;
		// Wait for the Command to update its highlighted value, then follow it.
		await tick();
		const next = visibleExamples.find((ex) => ex.title === highlighted);
		if (next) selected = next.name;
	}

	function selectExample(name: string) {
		selected = name;
	}

	async function loadExample(name: string) {
		const key = `./${name}/${name}.svelte`;
		return modules[key]?.();
	}
</script>

<div class="flex h-screen min-h-0 w-full">
	<aside class="flex w-64 shrink-0 flex-col border-r">
		<Command.Root bind:value={highlighted} class="h-full rounded-none" {onkeydown}>
			<Command.Input placeholder="Search examples..." />
			<Command.List class="max-h-none flex-1">
				<Command.Empty>No examples found.</Command.Empty>
				<Command.Group>
					{#each visibleExamples as example (example.name)}
						<Command.Item
							value={example.title}
							data-checked={selected === example.name}
							onSelect={() => selectExample(example.name)}
						>
							{example.title}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</aside>

	<main class="min-w-0 flex-1 overflow-auto p-8">
		{#key selected}
			{#await loadExample(selected) then mod}
				{#if mod}
					{@const Component = mod.default as any}
					<section>
						<h2 class="text-muted-foreground mb-4 px-1 text-xs font-medium">{selectedTitle}</h2>
						<Component />
					</section>
				{/if}
			{/await}
		{/key}
	</main>
</div>