<script lang="ts">
	import RangeCalendar from '$lib/components/ui/range-calendar/range-calendar.svelte';
	import type { DateRange } from 'bits-ui';
	import type { DateValue } from '@internationalized/date';
	import { useRentasStore } from '$lib/tps/rentas/store.svelte.js';

	let {
		vin,
		value = $bindable(),
		readonly = false
	}: { vin: string; value?: DateRange; readonly?: boolean } = $props();

	const store = useRentasStore();

	function toISO(d: DateValue): string {
		return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
	}

	function isDateUnavailable(date: DateValue): boolean {
		if (!vin) return false;
		return store.getDayStatus(vin, toISO(date)) !== 'available';
	}
</script>

<RangeCalendar
	bind:value
	{isDateUnavailable}
	{readonly}
	captionLayout="dropdown"
	locale="es-MX"
	class="rounded-lg border"
/>
