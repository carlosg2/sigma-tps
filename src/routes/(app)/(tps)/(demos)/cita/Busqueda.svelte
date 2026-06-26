<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import * as Sheet from "$lib/components/ui/sheet";
  import { Button } from "$lib/components/ui/button";
  import * as Command from "$lib/components/ui/command";
  import type { Snippet } from "svelte";

  // Tipos para los proyectos
  interface Proyecto {
    Folio: string;
    Cliente: string;
    Nombre: string;
    Articulo: string;
    Descripcion1: string;
    VIN: string;
    Motor: string;
    Modelo: string;
    ColorExteriorDescripcion: string;
    Telefonos: string;
    Email1: string | null;
    Placas: string;
  }

  interface Props {
    input?: string;
    children?: Snippet;
    itemTemplate?: Snippet<[Proyecto]>;
    proyectos: Proyecto[];
  }

  let { input = "0", children, itemTemplate, proyectos = [] }: Props = $props();

  const dispatch = createEventDispatcher<{ busqueda: Proyecto }>();

  // Estado
  let search = $state("");
  let filteredProyectos = $state<Proyecto[]>([]);
  let isOpen = $state(false);
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;

  // Función de filtrado local
  function filterProyectos() {
    if (!search.trim()) {
      filteredProyectos = [];
      return;
    }

    const searchTerm = search.toLowerCase().trim();
    
    filteredProyectos = proyectos.filter(proyecto => {
      return (
        proyecto.Folio?.toLowerCase().includes(searchTerm) ||
        proyecto.Cliente?.toLowerCase().includes(searchTerm) ||
        proyecto.Nombre?.toLowerCase().includes(searchTerm) ||
        proyecto.VIN?.toLowerCase().includes(searchTerm) ||
        proyecto.Placas?.toLowerCase().includes(searchTerm) ||
        proyecto.Telefonos?.includes(searchTerm) ||
        proyecto.Email1?.toLowerCase().includes(searchTerm) ||
        proyecto.Descripcion1?.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Manejo de búsqueda con debounce
  function handleSearch() {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(filterProyectos, 200);
  }

  // Selección de proyecto
  function selectProyecto(proyecto: Proyecto) {
    navigator.vibrate?.(25);
    dispatch("busqueda", proyecto);
    closeSearch();
  }

  function closeSearch() {
    isOpen = false;
    search = "";
    filteredProyectos = [];
  }

  // Efectos
  onMount(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        isOpen = !isOpen;
      }
    };
    
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  });

  // Auto-focus cuando se abre
  $effect(() => {
    if (isOpen) {
      setTimeout(() => {
        document.querySelector<HTMLInputElement>('[data-command-input]')?.focus();
      }, 100);
    }
  });

  // Debug
  $inspect('Filtered Proyectos:', filteredProyectos);
</script>

<Sheet.Root bind:open={isOpen}>
  <Sheet.Trigger class="flex-[1_1_0%]">
    {#if children}
      {@render children()}
    {:else}
      <Button size="lg" variant="link" class="text-4xl tracking-tighter font-bold h-16">
        {input}
      </Button>
    {/if}
  </Sheet.Trigger>

  <Sheet.Content side="top" class="p-4 border-0">
    <Command.Root class="rounded-lg border shadow-md w-full" shouldFilter={false}>
      <Command.Input 
        placeholder="Buscar por folio, cliente, nombre, VIN, placas, teléfono o email..."  
        bind:value={search} 
        oninput={handleSearch}
        class="h-12"
        data-command-input
      />
      
      <Command.List class="max-h-72">
        <Command.Empty>
          {search ? 'No se encontraron folios.' : 'Escribe para buscar folios...'}
        </Command.Empty>
        
        {#if filteredProyectos.length > 0}
          <Command.Group heading="Folios encontrados ({filteredProyectos.length})">
            {#each filteredProyectos as proyecto}
              <Command.Item 
                value={proyecto.Folio} 
                onSelect={() => selectProyecto(proyecto)}
                class="cursor-pointer"
              >
                {#if itemTemplate}
                  {@render itemTemplate(proyecto)}
                {:else}
                  <div class="w-full">
                    <div class="text-xs text-muted-foreground">
                      {proyecto.Folio} • {proyecto.Cliente}
                    </div>
                    <div class="font-medium">
                      {proyecto.Nombre}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {proyecto.Descripcion1}
                    </div>
                    <div class="text-xs text-muted-foreground mt-1">
                      VIN: {proyecto.VIN} • Placas: {proyecto.Placas} • Tel: {proyecto.Telefonos}
                    </div>
                  </div>
                {/if}
              </Command.Item>
            {/each}
          </Command.Group>
        {/if}
      </Command.List>
    </Command.Root>
  </Sheet.Content>
</Sheet.Root>


