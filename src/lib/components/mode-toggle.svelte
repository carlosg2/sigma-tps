<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu/index.js';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import Laptop from '@lucide/svelte/icons/laptop';
	import { setMode } from 'mode-watcher';
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="size-8">
				<Sun class="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
				<Moon
					class="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		{/snippet}
	</DropdownMenuTrigger>
	<DropdownMenuContent align="end">
		<DropdownMenuItem onclick={() => setMode('light')}>
			<Sun class="mr-2 size-4" />
			<span>Light</span>
		</DropdownMenuItem>
		<DropdownMenuItem onclick={() => setMode('dark')}>
			<Moon class="mr-2 size-4" />
			<span>Dark</span>
		</DropdownMenuItem>
		<DropdownMenuItem onclick={() => setMode('system')}>
			<Laptop class="mr-2 size-4" />
			<span>System</span>
		</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
