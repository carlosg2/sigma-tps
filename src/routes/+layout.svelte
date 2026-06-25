<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { UserConfig, UserConfigContext } from '$lib/user-config.svelte.js';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { DesignSystemProvider } from '$lib/ds/index.js';
	import { Customizer } from '$lib/components/customizer/index.js';

	let { children, data } = $props();

	// svelte-ignore state_referenced_locally
	UserConfigContext.set(new UserConfig(data.userConfig));
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher defaultMode="system" disableTransitions />
<Toaster position="top-center" />

<Tooltip.Provider>
	<DesignSystemProvider>
		<div class="fixed top-3 right-3 z-50">
			<Customizer />
		</div>
		{@render children()}
	</DesignSystemProvider>
</Tooltip.Provider>
