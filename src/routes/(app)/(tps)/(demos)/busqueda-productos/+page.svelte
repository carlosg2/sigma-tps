<script lang="ts">
	import Busqueda from "./Busqueda.svelte";
	import { Button } from "$lib/components/ui/button";
	import { Search } from "@lucide/svelte";

  function handleSearch(e: CustomEvent) {
		console.log(e.detail);
		/* search = e.detail;
		handle_search(); */
		
	}

</script>
<div
		  class="flex flex-1 items-center gap-3 justify-end"
		>
		  <div class="flex gap-4">
			<Busqueda on:busqueda={handleSearch}>
				{#snippet itemTemplate(item)}
          <div class="w-full">
            <div class="text-xs text-muted-foreground">
              {item.ClaveCOmpucaja}
            </div>
            <div class="font-medium">
              {item.Descripcion1}
            </div>
          </div>
				{/snippet}
				
				<Button variant="outline" size="icon" class="rounded-full" href="#" >
					<span class="sr-only">Buscar</span>
					<Search class="h-6 w-6 " />
				</Button>
			</Busqueda>
		  </div>
		  
		  <span
				aria-hidden="true"
				class="block h-6 w-px rounded-full bg-gray-200"
			></span>
		  
		</div>