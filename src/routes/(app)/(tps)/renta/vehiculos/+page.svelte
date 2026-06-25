<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as Select from '$lib/components/ui/select/index.js';
  import { Slider } from '$lib/components/ui/slider';
  import { Shield, Users, Star, Search, Car } from 'lucide-svelte';
  import RangeCalendar from "$lib/components/ui/range-calendar/range-calendar.svelte";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import ChevronDownIcon from "lucide-svelte/icons/chevron-down";
  import { getLocalTimeZone } from "@internationalized/date";
  import type { DateRange } from "bits-ui";

  // Props para recibir los datos del servidor
  let { data }: { data: { data: any[] } } = $props();

  // Tipos para los datos del API
  interface VehicleData {
    Articulo: string;
    Descripcion1: string;
    VIN: string;
    Motor: string;
    Modelo: string;
    ColorExteriorDescripcion: string;
    Blindaje: string;
    NoPasajeros: number;
    Km: number;
    Imagen: string;
  }

  // Función para procesar la ruta de imagen
  function processImagePath(imagePath: string): string {
    if (!imagePath) {
      // Imagen por defecto si no hay imagen
      return '/img/gmc-denali.png';
    }
    
    // Si la imagen tiene una ruta de Windows (D:\...), extraer solo el nombre del archivo
    if (imagePath.includes('\\')) {
      const fileName = imagePath.split('\\').pop();
      // Si es un archivo .bmp, convertirlo a .png o .jpg (asumimos que se han convertido)
      if (fileName && fileName.endsWith('.bmp')) {
        const nameWithoutExt = fileName.replace('.bmp', '');

        return `/img/${nameWithoutExt}.png`;
      }
      return `/img/${fileName}`;
    }
    
    // Si ya es una ruta web válida, usarla directamente
    if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
      return imagePath;
    }
    
    // Por defecto, asumir que está en la carpeta de vehículos
    return `/img/vehicles/${imagePath}`;
  }

  // Función para mapear los datos del API al formato interno
  function mapVehicleData(apiVehicle: VehicleData) {
    // Normalizar nivel de blindaje
    const armorLevel = apiVehicle.Blindaje.replace('Nivel ', '');

    // Calcular precio base según el modelo y blindaje (en pesos mexicanos)
    const baseYear = parseInt(apiVehicle.Modelo);
    const currentYear = new Date().getFullYear();
    const yearFactor = Math.max(0.8, 1 - (currentYear - baseYear) * 0.05);
    const armorFactor = parseInt(armorLevel) * 1000; // Incremento por blindaje en pesos
    const basePrice = 6000 + armorFactor + (apiVehicle.NoPasajeros * 400); // Precio base en pesos
    const price = Math.round(basePrice * yearFactor);

    // Generar rating basado en modelo y kilometraje
    const kmFactor = Math.max(0.7, 1 - (apiVehicle.Km / 100000) * 0.3);
    const rating = Math.round((4.0 + yearFactor * kmFactor) * 10) / 10;

    return {
      id: apiVehicle.VIN,
      name: apiVehicle.Descripcion1,
      armorLevel,
      price,
      capacity: apiVehicle.NoPasajeros,
      rating,
      description: `${apiVehicle.Descripcion1} ${apiVehicle.Modelo} con blindaje ${apiVehicle.Blindaje}`,
      model: apiVehicle.Modelo,
      color: apiVehicle.ColorExteriorDescripcion,
      km: apiVehicle.Km,
      vin: apiVehicle.VIN,
      articulo: apiVehicle.Articulo,
      image: processImagePath(apiVehicle.Imagen)
    };
  }

  // Mapear todos los vehículos del API
  const finalVehicles = data.data.map(mapVehicleData);
  
  console.log('Total vehículos recibidos:', data.data.length);
  console.log('Total vehículos mapeados:', finalVehicles.length);
  console.log('Vehículos:', finalVehicles);

  // Calcular precios mínimo y máximo
  const minPrice = Math.min(...finalVehicles.map(v => v.price));
  const maxPrice = Math.max(...finalVehicles.map(v => v.price));

  // Filtros de estado (solo los realmente útiles)
  let selectedArmorLevel = $state('armor-all');
  let selectedCapacity = $state('capacity-any');
  let selectedColor = $state('color-all');
  let sortOrder = $state('price-asc');
  let searchQuery = $state('');

  // Estado para el selector de rango de fechas
  let dateRangeOpen = $state(false);
  let dateRangeValue = $state<DateRange | undefined>();

  // Obtener valores únicos para los filtros (solo los relevantes)
  const uniqueArmorLevels = [...new Set(finalVehicles.map(v => v.armorLevel))].sort();
  const uniqueCapacities = [...new Set(finalVehicles.map(v => v.capacity))].sort((a, b) => a - b);
  const uniqueColors = [...new Set(finalVehicles.map(v => v.color))].sort();

  // Precio range reactivo
  let priceRange = $state([minPrice, maxPrice]);

  // Vehículos filtrados
  let filteredVehicles = $derived(
    finalVehicles.filter(vehicle => {
      // Filtro por búsqueda de texto
      if (searchQuery && !vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !vehicle.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filtro por nivel de blindaje
      if (selectedArmorLevel !== 'armor-all' && vehicle.armorLevel !== selectedArmorLevel) return false;
      
      // Filtro por capacidad
      if (selectedCapacity !== 'capacity-any' && vehicle.capacity.toString() !== selectedCapacity) return false;

      // Filtro por color
      if (selectedColor !== 'color-all' && vehicle.color !== selectedColor) return false;
      
      // Filtro por rango de precios
      if (vehicle.price < priceRange[0] || vehicle.price > priceRange[1]) return false;
      
      return true;
    }).sort((a, b) => {
      switch (sortOrder) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'sort-capacity':
          return b.capacity - a.capacity;
        case 'model-desc':
          return b.model.localeCompare(a.model);
        case 'km-asc':
          return a.km - b.km;
        default:
          return 0;
      }
    })
  );

  // Helper functions to get display text for select values
  function getArmorDisplayText(value: string): string {
    const armorMap: Record<string, string> = {
      'armor-all': 'Todos los niveles'
    };
    
    uniqueArmorLevels.forEach(level => {
      armorMap[level] = `Nivel ${level}`;
    });
    
    return armorMap[value] || 'Todos los niveles';
  }

  function getCapacityDisplayText(value: string): string {
    const capacityMap: Record<string, string> = {
      'capacity-any': 'Cualquier capacidad'
    };
    
    uniqueCapacities.forEach(capacity => {
      capacityMap[capacity.toString()] = `${capacity} personas`;
    });
    
    return capacityMap[value] || 'Cualquier capacidad';
  }

  function getColorDisplayText(value: string): string {
    const colorMap: Record<string, string> = {
      'color-all': 'Todos los colores'
    };
    
    uniqueColors.forEach(color => {
      colorMap[color] = color;
    });
    
    return colorMap[value] || 'Todos los colores';
  }

  function getSortDisplayText(value: string): string {
    const sortMap: Record<string, string> = {
      'price-asc': 'Precio: Menor a Mayor',
      'price-desc': 'Precio: Mayor a Menor',
      'rating': 'Mejor Valorados',
      'sort-capacity': 'Mayor Capacidad',
      'model-desc': 'Modelo: Más Nuevo',
      'km-asc': 'Menor Kilometraje'
    };
    return sortMap[value] || 'Precio: Menor a Mayor';
  }

  function clearFilters() {
    searchQuery = '';
    selectedArmorLevel = 'armor-all';
    selectedCapacity = 'capacity-any';
    selectedColor = 'color-all';
    priceRange = [minPrice, maxPrice];
    sortOrder = 'price-asc';
    dateRangeValue = undefined;
  }
</script>

<div class="min-h-screen bg-background">
  <div class="container mx-auto px-4 py-8">

    <!-- Selector de rango de fechas -->
    <div class="mb-6 flex justify-center">
      <div class="flex gap-3">
        <Label class="">Rango de Fechas</Label>
        <Popover.Root bind:open={dateRangeOpen}>
          <Popover.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="outline" class="w-80 justify-between font-normal h-12">
                {dateRangeValue?.start && dateRangeValue?.end
                  ? `${dateRangeValue.start.toDate(getLocalTimeZone()).toLocaleDateString('es-ES')} - ${dateRangeValue.end.toDate(getLocalTimeZone()).toLocaleDateString('es-ES')}`
                  : "Seleccionar fechas de renta"}
                <ChevronDownIcon class="h-4 w-4" />
              </Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content class="w-auto overflow-hidden p-0" align="center">
            <RangeCalendar bind:value={dateRangeValue} captionLayout="dropdown" />
          </Popover.Content>
        </Popover.Root>
      </div>
    </div>

    <div class="grid lg:grid-cols-4 gap-8">
      <!-- Sidebar de filtros -->
      <div class="lg:col-span-1">
        <div class="sticky top-24 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Filtros</h2>
            <Button variant="outline" size="sm" onclick={clearFilters}>
              Limpiar
            </Button>
          </div>

          <!-- Search -->
          <div class="space-y-3">
            <Label>Buscar Vehículo</Label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                bind:value={searchQuery}
                placeholder="Buscar por nombre, VIN..."
                class="pl-10"
              />
            </div>
          </div>

          <!-- Armor Level -->
          <div class="space-y-3 mb-6">
            <Label>Nivel de Blindaje</Label>
            <Select.Root bind:value={selectedArmorLevel} type="single">
              <Select.Trigger>
                {getArmorDisplayText(selectedArmorLevel)}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="armor-all">Todos los niveles</Select.Item>
                {#each uniqueArmorLevels as level (`armor-${level}`)}
                  <Select.Item value={level}>Nivel {level}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>

          <!-- Price Range -->
          <div class="space-y-3 mb-6">
            <Label>Rango de Precio ($/día)</Label>
            <div class="px-2">
              <Slider
                bind:value={priceRange}
                max={maxPrice}
                min={minPrice}
                step={10}
                type="multiple"
                class="w-full"
              />
              <div class="flex justify-between text-sm text-muted-foreground mt-2">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>

          <!-- Capacity -->
          <div class="space-y-3 mb-6">
            <Label>Capacidad</Label>
            <Select.Root bind:value={selectedCapacity} type="single">
              <Select.Trigger>
                {getCapacityDisplayText(selectedCapacity)}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="capacity-any">Cualquier capacidad</Select.Item>
                {#each uniqueCapacities as capacity (`capacity-${capacity}`)}
                  <Select.Item value={capacity.toString()}>{capacity} personas</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>

          <!-- Color -->
          <div class="space-y-3 mb-6">
            <Label>Color</Label>
            <Select.Root bind:value={selectedColor} type="single">
              <Select.Trigger>
                {getColorDisplayText(selectedColor)}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="color-all">Todos los colores</Select.Item>
                {#each uniqueColors as color (`color-${color}`)}
                  <Select.Item value={color}>{color}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
        </div>
      </div>
      

      <!-- Main Content -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold tracking-tight mb-2">Vehículos Blindados</h1>
            <p class="text-muted-foreground">
              Vehículos blindados disponibles para alquiler
            </p>
          </div>
          
          <div class="flex items-center gap-2">
            <Label for="sort" class="text-sm">Ordenar por:</Label>
            <Select.Root bind:value={sortOrder} type="single">
              <Select.Trigger class="w-48">
                {getSortDisplayText(sortOrder)}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="price-asc">Precio: Menor a Mayor</Select.Item>
                <Select.Item value="price-desc">Precio: Mayor a Menor</Select.Item>
                <Select.Item value="rating">Mejor Valorados</Select.Item>
                <Select.Item value="sort-capacity">Mayor Capacidad</Select.Item>
                <Select.Item value="model-desc">Modelo: Más Nuevo</Select.Item>
                <Select.Item value="km-asc">Menor Kilometraje</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        <!-- Results count -->
        <div class="text-sm text-muted-foreground">
          Mostrando {filteredVehicles.length} de {finalVehicles.length} vehículos
        </div>

        <!-- Vehicle Grid -->
        <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {#each filteredVehicles as vehicle (vehicle.id)}
            <Card class="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div class="aspect-[5/3] overflow-hidden relative">
                <img 
                  src={vehicle.image}
                  alt={vehicle.name}
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div class="absolute top-4 left-4 flex gap-2">
                  <Badge variant="secondary" class="bg-background/80 backdrop-blur-sm">
                    Nivel {vehicle.armorLevel}
                  </Badge>
                </div>
                <div class="absolute top-4 right-4">
                  <div class="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1">
                    <Star class="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span class="text-xs font-medium">{vehicle.rating}</span>
                  </div>
                </div>
                <div class="absolute bottom-4 left-4">
                  <Badge variant="outline" class="bg-background/80 backdrop-blur-sm border-border/50">
                    {vehicle.color}
                  </Badge>
                </div>
                <div class="absolute bottom-4 right-4">
                  <Badge variant="outline" class="bg-background/80 backdrop-blur-sm border-border/50">
                    {vehicle.model}
                  </Badge>
                </div>
              </div>
              
              <CardContent class="p-6">
                <div class="space-y-4">
                  <div>
                    <h3 class="text-lg font-semibold text-balance mb-1">{vehicle.name}</h3>
                    <p class="text-sm text-muted-foreground text-pretty">{vehicle.description}</p>
                    <p class="text-xs text-muted-foreground mt-1">VIN: {vehicle.vin}</p>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="flex items-center gap-2">
                      <Users class="h-4 w-4 text-muted-foreground" />
                      <span>{vehicle.capacity} personas</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Shield class="h-4 w-4 text-muted-foreground" />
                      <span>Blindaje {vehicle.armorLevel}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Car class="h-4 w-4 text-muted-foreground" />
                      <span>{vehicle.km.toLocaleString()} km</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-muted-foreground">Modelo:</span>
                      <span>{vehicle.model}</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between pt-4 border-t">
                    <div class="space-y-1">
                      <div class="text-2xl font-bold text-foreground">${vehicle.price}</div>
                      <div class="text-xs text-muted-foreground">por día</div>
                    </div>
                    <Button onclick={() => {
                      let url = `/renta/reservar/${vehicle.id}`;
                      if (dateRangeValue?.start && dateRangeValue?.end) {
                        const params = new URLSearchParams();
                        params.set('startDate', dateRangeValue.start.toString());
                        params.set('endDate', dateRangeValue.end.toString());
                        url += `?${params.toString()}`;
                      }
                      window.location.href = url;
                    }}>
                      Reservar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          {/each}
        </div>

        {#if filteredVehicles.length === 0}
          <div class="text-center py-12">
            <Car class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 class="text-lg font-semibold mb-2">No se encontraron vehículos</h3>
            <p class="text-muted-foreground mb-4">
              Intenta ajustar los filtros para encontrar más opciones
            </p>
            <Button onclick={clearFilters}>Limpiar filtros</Button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>