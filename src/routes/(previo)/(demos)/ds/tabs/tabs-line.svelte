<script lang="ts">
	import Example from "../example.svelte";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
</script>

<Example title="Line">
	<Tabs.Root value="overview">
		<Tabs.List variant="line">
			<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
			<Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
			<Tabs.Trigger value="reports">Reports</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>
</Example>
