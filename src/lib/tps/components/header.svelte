<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import { ROLE_LABELS } from '$lib/tps/constants.js';
	import type { UserRole, Plant } from '$lib/tps/types.js';
	import * as NativeSelect from '$lib/components/ui/native-select/index.js';
	import User from '@lucide/svelte/icons/user';
	import Factory from '@lucide/svelte/icons/factory';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

	const store = useStore();

	let currentRole = $derived(store.state.currentUser.role);
	let currentPlant = $derived(store.state.currentPlant);

	function handleRoleChange(role: string) {
		const user = store.state.users.find((u) => u.role === (role as UserRole)) ?? store.state.users[0];
		store.dispatch({ type: 'SET_CURRENT_USER', payload: user });
	}

	function handlePlantChange(plant: string) {
		store.dispatch({ type: 'SET_CURRENT_PLANT', payload: plant as Plant | 'todas' });
	}

	const roleEntries = Object.entries(ROLE_LABELS) as [UserRole, string][];
</script>

<header class="border-border bg-card flex h-14 items-center justify-between border-b px-6">
	<div class="flex items-center gap-4">
		<h2 class="text-foreground text-sm font-medium">
			Bienvenido, <span class="text-primary">{store.state.currentUser.name}</span>
		</h2>
		<span class="text-muted-foreground text-xs">{store.state.currentUser.area}</span>
	</div>

	<div class="flex items-center gap-3">
		<!-- Plant selector -->
		<div class="border-border bg-secondary flex items-center gap-1.5 rounded-md border px-2 py-1">
			<Factory class="text-muted-foreground h-3.5 w-3.5" />
			<NativeSelect.Root
				size="sm"
				value={currentPlant}
				onchange={(e) => handlePlantChange(e.currentTarget.value)}
				class="border-none bg-transparent"
			>
				<NativeSelect.Option value="todas">Todas las Plantas</NativeSelect.Option>
				<NativeSelect.Option value="planta_1">Planta 1</NativeSelect.Option>
				<NativeSelect.Option value="planta_2">Planta 2</NativeSelect.Option>
				<NativeSelect.Option value="almacen_servicios">Almacen Servicios</NativeSelect.Option>
			</NativeSelect.Root>
		</div>

		<!-- Role switcher -->
		<div class="border-border bg-secondary flex items-center gap-1.5 rounded-md border px-2 py-1">
			<User class="text-muted-foreground h-3.5 w-3.5" />
			<NativeSelect.Root
				size="sm"
				value={currentRole}
				onchange={(e) => handleRoleChange(e.currentTarget.value)}
				class="border-none bg-transparent"
			>
				{#each roleEntries as [role, label] (role)}
					<NativeSelect.Option value={role}>{label}</NativeSelect.Option>
				{/each}
			</NativeSelect.Root>
		</div>

		<!-- Reset button -->
		<button
			onclick={() => store.resetData()}
			class="border-border text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors"
			title="Restaurar datos de ejemplo"
		>
			<RotateCcw class="h-3 w-3" />
			Reset
		</button>
	</div>
</header>
