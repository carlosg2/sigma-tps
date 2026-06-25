<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import * as Sheet from "$lib/components/ui/sheet";
  import { Button } from "$lib/components/ui/button";
  import * as Command from "$lib/components/ui/command";
  import type { Snippet } from "svelte";

  // Tipos mejorados
  interface SearchItem {
    ClaveCOmpucaja?: string;
    Descripcion?: string;
    Descripcion1?: string;
    [key: string]: any;
  }

  interface Props {
    input?: string;
    children?: Snippet;
    itemTemplate?: Snippet<[SearchItem & { searchTerm: string; type: 'codigo' | 'producto' }]>;
  }

  let { input = "0", children, itemTemplate }: Props = $props();

  const dispatch = createEventDispatcher<{ busqueda: string }>();

  // Estado consolidado
  let search = $state("");
  let results = $state<{ productos: SearchItem[]; codigos: SearchItem[] }>({ productos: [], codigos: [] });
  let isLoading = $state(false);
  let isOpen = $state(false);
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;

  // API endpoints consolidados
  const API_CONFIG = {
    baseUrl: "https://api.comercialparras.com:8000/api/PRODUCCION/sp",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Ik1BU0VSUCIsIm5iZiI6MTY5NjcwNjQ4MSwiZXhwIjoxNzg2NzA2NDgxLCJpYXQiOjE2OTY3MDY0ODEsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.qQQ1Dm1qyW0wEj2TY3Sw_i-ZnrUWKIL3AMHzoTNFlFQ"
    }
  };

  // Función de búsqueda unificada
  async function fetchSearchResults() {
    if (!search.trim()) {
      results = { productos: [], codigos: [] };
      return;
    }

    isLoading = true;
    
    try {
      const [productosRes, codigosRes] = await Promise.all([
        fetch(`${API_CONFIG.baseUrl}/spWebArticuloResurtidoLista`, {
          method: "POST",
          body: JSON.stringify({ WebUsuario: "MASERP", Nombre: search }),
          headers: API_CONFIG.headers,
        }),
        fetch(`${API_CONFIG.baseUrl}/spCBArticulo`, {
          method: "POST", 
          body: JSON.stringify({ Codigo: search }),
          headers: API_CONFIG.headers,
        })
      ]);

      const [productos, codigos] = await Promise.all([
        productosRes.ok ? productosRes.json() : [],
        codigosRes.ok ? codigosRes.json() : []
      ]);

      results = { 
        productos: productos || [], 
        codigos: codigos || [] 
      };
    } catch (error) {
      console.error('Error en búsqueda:', error);
      results = { productos: [], codigos: [] };
    } finally {
      isLoading = false;
    }
  }

  // Manejo de búsqueda con debounce
  function handleSearch() {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(fetchSearchResults, 400);
  }

  // Selección de item
  function selectItem(value: string) {
    navigator.vibrate?.(25);
    dispatch("busqueda", value);
    closeSearch();
  }

  function closeSearch() {
    isOpen = false;
    search = "";
    results = { productos: [], codigos: [] };
  }

  // Efectos optimizados
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

  // Debug simplificado
  $inspect('Search Results:', results);
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
        placeholder="Buscar código ó descripción..."  
        bind:value={search} 
        oninput={handleSearch}
        class="h-12"
        data-command-input
      />
      
      <Command.List class="max-h-72">
        <Command.Empty>
          {isLoading ? 'Buscando...' : 'No se encontraron resultados.'}
        </Command.Empty>
        
        {#each [
          { items: results.codigos, heading: 'Resultados por código', type: 'codigo' as const },
          { items: results.productos, heading: 'Productos por descripción', type: 'producto' as const }
        ] as group}
          {#if group.items.length > 0}
            <Command.Group heading={group.heading}>
              {#each group.items as item}
                <Command.Item 
                  value={group.type === 'codigo' ? search : item.ClaveCOmpucaja || ''} 
                  onSelect={() => selectItem(group.type === 'codigo' ? search : item.ClaveCOmpucaja || '')}
                  class="cursor-pointer"
                >
                  {#if itemTemplate}
                    {@render itemTemplate({ 
                      ...item, 
                      searchTerm: search, 
                      type: group.type 
                    })}
                  {:else}
                    <div class="w-full">
                      <div class="text-xs text-muted-foreground">
                        {group.type === 'codigo' ? search : item.ClaveCOmpucaja}
                      </div>
                      <div class="font-medium">
                        {item.Descripcion || item.Descripcion1 || 'Sin descripción'}
                      </div>
                    </div>
                  {/if}
                </Command.Item>
              {/each}
            </Command.Group>
          {/if}
        {/each}
      </Command.List>
    </Command.Root>
  </Sheet.Content>
</Sheet.Root>


