<script lang="ts">
	import Example from "../example.svelte";
	import { toast } from "svelte-sonner";
	import { Button } from "$lib/components/ui/button/index.js";
</script>

<Example title="Basic" class="items-center justify-center">
	<Button onclick={() => toast("Event has been created")} variant="outline" class="w-fit">
		Show Toast
	</Button>
</Example>
