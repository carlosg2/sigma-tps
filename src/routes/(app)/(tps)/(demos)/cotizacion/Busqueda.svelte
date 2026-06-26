<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import * as Sheet from "$lib/components/ui/sheet";
  import { Button } from "$lib/components/ui/button";
  import * as Command from "$lib/components/ui/command";
  import type { Snippet } from "svelte";

  // Tipos para los clientes
  interface Cliente {
    Cliente: string;
    Nombre: string;
    RFC: string;
    CodigoPostal: string;
    FiscalRegimen: string;
    Uso: string;
    Contacto: string;
    Email: string;
    Telefonos: string | null;
  }

  interface Props {
    input?: string;
    children?: Snippet;
    itemTemplate?: Snippet<[Cliente]>;
    clientes: Cliente[];
  }

  let { input = "0", children, itemTemplate, clientes = [] }: Props = $props();

  const dispatch = createEventDispatcher<{ busqueda: Cliente }>();

  // Estado
  let search = $state("");
  let filteredClientes = $state<Cliente[]>([]);
  let isOpen = $state(false);
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;

  // Función de filtrado local
  function filterClientes() {
    if (!search.trim()) {
      filteredClientes = [];
      return;
    }

    const searchTerm = search.toLowerCase().trim();
    
    filteredClientes = clientes.filter(cliente => {
      return (
        cliente.Cliente?.toLowerCase().includes(searchTerm) ||
        cliente.Nombre?.toLowerCase().includes(searchTerm) ||
        cliente.RFC?.toLowerCase().includes(searchTerm) ||
        cliente.Contacto?.toLowerCase().includes(searchTerm) ||
        cliente.Email?.toLowerCase().includes(searchTerm) ||
        cliente.Telefonos?.includes(searchTerm) ||
        cliente.CodigoPostal?.includes(searchTerm)
      );
    });
  }

  // Manejo de búsqueda con debounce
  function handleSearch() {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(filterClientes, 200);
  }

  // Selección de cliente
  function selectCliente(cliente: Cliente) {
    navigator.vibrate?.(25);
    dispatch("busqueda", cliente);
    closeSearch();
  }

  function closeSearch() {
    isOpen = false;
    search = "";
    filteredClientes = [];
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
  $inspect('Filtered Clientes:', filteredClientes);
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
        placeholder="Buscar por código cliente, nombre, RFC, contacto, email o teléfono..."  
        bind:value={search} 
        oninput={handleSearch}
        class="h-12"
        data-command-input
      />
      
      <Command.List class="max-h-72">
        <Command.Empty>
          {search ? 'No se encontraron clientes.' : 'Escribe para buscar clientes...'}
        </Command.Empty>
        
        {#if filteredClientes.length > 0}
          <Command.Group heading="Clientes encontrados ({filteredClientes.length})">
            {#each filteredClientes as cliente}
              <Command.Item 
                value={cliente.Cliente} 
                onSelect={() => selectCliente(cliente)}
                class="cursor-pointer"
              >
                {#if itemTemplate}
                  {@render itemTemplate(cliente)}
                {:else}
                  <div class="w-full">
                    <div class="text-xs text-muted-foreground">
                      {cliente.Cliente} • {cliente.RFC}
                    </div>
                    <div class="font-medium">
                      {cliente.Nombre}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {cliente.Contacto}
                    </div>
                    <div class="text-xs text-muted-foreground mt-1">
                      Email: {cliente.Email} • Tel: {cliente.Telefonos} • CP: {cliente.CodigoPostal}
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


