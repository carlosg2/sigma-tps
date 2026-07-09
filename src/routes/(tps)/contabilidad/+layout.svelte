<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import FileSearch from '@lucide/svelte/icons/file-search';
	import type { Component } from 'svelte';

	let { children } = $props();

	type NavItem = { label: string; href: string; icon: Component; gap?: string };
	const items: NavItem[] = [
		{ label: 'Dashboard', href: '/contabilidad', icon: LayoutDashboard },
		{ label: 'Estados de Resultados', href: '/contabilidad/estados-resultados', icon: TrendingUp, gap: 'GAP-CON-003' },
		{ label: 'Compulsa SAT', href: '/contabilidad/compulsa-sat', icon: FileSearch, gap: 'GAP-CON-010' }
	];
	function isActive(href: string) {
		return page.url.pathname === href || (href !== '/contabilidad' && page.url.pathname.startsWith(href));
	}
</script>

{@render children()}
