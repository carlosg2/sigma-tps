<script lang="ts">
	let { children } = $props();
</script>

<div class="space-y-0 p-4 pb-16 block">
	<div class="flex flex-col space-y-8 lg:flex-row">
		<div class="flex-1 lg:max-w-2xl">
			{@render children()}
		</div>
	</div>
</div>
