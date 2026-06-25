<script lang="ts">
  let { data } = $props();
</script>

<div class="container mx-auto p-6 space-y-6">
  <h1 class="text-2xl font-bold">Debug Data</h1>
  
  <div class="space-y-4">
    <div class="border rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-2">Vehículos ({data.vehiculos?.length ?? 0})</h2>
      <pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">{JSON.stringify(data.vehiculos, null, 2)}</pre>
    </div>

    <div class="border rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-2">Niveles de Blindaje ({data.nivelesBlindaje?.length ?? 0})</h2>
      <pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">{JSON.stringify(data.nivelesBlindaje, null, 2)}</pre>
    </div>

    <div class="border rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-2">Diseños de Blindaje ({data.disenosBlindaje?.length ?? 0})</h2>
      <pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">{JSON.stringify(data.disenosBlindaje, null, 2)}</pre>
    </div>

    <div class="border rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-2">Categorías ({data.categorias?.length ?? 0})</h2>
      <pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">{JSON.stringify(data.categorias, null, 2)}</pre>
    </div>
  </div>
</div>
