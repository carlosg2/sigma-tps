<script lang="ts">
  import { run } from 'svelte/legacy';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Calendar } from '$lib/components/ui/calendar';
  import * as Popover from '$lib/components/ui/popover';
  import { Separator } from '$lib/components/ui/separator';
  import { Progress } from '$lib/components/ui/progress';
  import { 
    CalendarIcon, 
    Clock, 
    MapPin, 
    User, 
    Phone, 
    Mail, 
    CreditCard,
    Shield,
    Users,
    ArrowRight,
    ArrowLeft,
    Check,
    AlertCircle
  } from '@lucide/svelte';
  import { type DateValue, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date';
  import { cn } from '$lib/utils.js';

  // Props para recibir los datos del servidor
  let { data }: { data: { data: any[], escoltas: any[], choferes: any[] } } = $props();

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

  interface ServiceData {
    Articulo: string;
    Servicio: string;
    PrecioLista: number;
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
  const vehicles = data.data.reduce((acc, vehicle) => {
    const mappedVehicle = mapVehicleData(vehicle);
    acc[mappedVehicle.id] = mappedVehicle;
    return acc;
  }, {} as Record<string, any>);

  // Booking state
  let currentStep = $state(1);
  let selectedVehicleId = $state('');
  let selectedVehicle = $state(null);
  
  // Date selection con tipos correctos
  let startDate: DateValue | undefined = $state();
  let endDate: DateValue | undefined = $state();
  let startTime = $state('09:00');
  let endTime = $state('18:00');

  // Formatter para mostrar fechas
  const df = new DateFormatter('es-ES', {
    dateStyle: 'long'
  });
  let pickupLocation = $state('');
  let dropoffLocation = $state('');
  let sameLocation = $state(true);

  // Customer information
  let customerInfo = $state({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    idNumber: '',
    specialRequests: ''
  });

  // Additional services - ahora dinámicos basados en la API
  let selectedEscoltas = $state<string[]>([]);
  let selectedChoferes = $state<string[]>([]);

  // Terms and conditions acceptance
  let termsAccepted = $state(false);

  // Loading state for submission
  let isSubmitting = $state(false);

  // Form validation
  let errors = $state<Record<string, string>>({});

  // Computed values
  let totalDays = $state(0);
  let basePrice = $state(0);
  let servicesPrice = $state(0);
  let totalPrice = $state(0);

  // Initialize from URL params
  onMount(() => {
    // Obtener el VIN desde los parámetros de la URL
    const vin = $page.params.vin;
    if (vin && vehicles[vin]) {
      selectedVehicleId = vin;
      selectedVehicle = vehicles[vin];
    }
    
    // Leer fechas desde los parámetros de URL
    const startDateParam = $page.url.searchParams.get('startDate');
    const endDateParam = $page.url.searchParams.get('endDate');
    
    if (startDateParam) {
      try {
        startDate = parseDate(startDateParam);
      } catch (error) {
        console.warn('Error parsing start date:', error);
      }
    }
    
    if (endDateParam) {
      try {
        endDate = parseDate(endDateParam);
      } catch (error) {
        console.warn('Error parsing end date:', error);
      }
    }
  });

  // Watch for vehicle selection changes
  run(() => {
    if (selectedVehicleId && vehicles[selectedVehicleId]) {
      selectedVehicle = vehicles[selectedVehicleId];
    }
  });

  // Watch for same location checkbox
  run(() => {
    if (sameLocation) {
      dropoffLocation = pickupLocation;
    }
  });

  function validateStep(step: number): boolean {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!selectedVehicleId) newErrors.vehicle = 'Seleccione un vehículo';
      if (!startDate) newErrors.startDate = 'Seleccione fecha de inicio';
      if (!endDate) newErrors.endDate = 'Seleccione fecha de fin';
      if (!startTime) newErrors.startTime = 'Seleccione hora de inicio';
      if (!endTime) newErrors.endTime = 'Seleccione hora de fin';
      if (!pickupLocation) newErrors.pickupLocation = 'Ingrese ubicación de recogida';
      if (!sameLocation && !dropoffLocation) newErrors.dropoffLocation = 'Ingrese ubicación de entrega';
    }

    if (step === 2) {
      if (!customerInfo.firstName) newErrors.firstName = 'Nombre es requerido';
      if (!customerInfo.lastName) newErrors.lastName = 'Apellido es requerido';
      if (!customerInfo.email) newErrors.email = 'Email es requerido';
      if (!customerInfo.phone) newErrors.phone = 'Teléfono es requerido';
      if (!customerInfo.idNumber) newErrors.idNumber = 'Número de identificación es requerido';
      
      // Email validation
      if (customerInfo.email && !/\S+@\S+\.\S+/.test(customerInfo.email)) {
        newErrors.email = 'Email no válido';
      }
    }

    if (step === 3) {
      if (!termsAccepted) newErrors.terms = 'Debe aceptar los términos y condiciones';
    }

    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  function nextStep() {
    if (validateStep(currentStep)) {
      currentStep++;
    }
  }

  function prevStep() {
    currentStep--;
    errors = {};
  }

  function formatDate(dateValue: DateValue | undefined) {
    if (!dateValue) return '';
    return df.format(dateValue.toDate(getLocalTimeZone()));
  }

  async function submitBooking() {
    // Evitar múltiples submissions
    if (isSubmitting) {
      return;
    }
    
    isSubmitting = true;
    
    try {
      // Validar todos los pasos
      if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
        if (!termsAccepted) {
          alert('Debe aceptar los términos y condiciones para continuar');
        }
        isSubmitting = false;
        return;
      }
      
      // Obtener detalles de servicios seleccionados
      const selectedEscoltasDetails = selectedEscoltas.map(id => 
        data.escoltas.find(e => e.Articulo === id)
      ).filter(Boolean);
      
      const selectedChoferesDetails = selectedChoferes.map(id => 
        data.choferes.find(c => c.Articulo === id)
      ).filter(Boolean);
      
      // Preparar datos de la reserva para la cotización
      const bookingData = {
        vehicle: selectedVehicle,
        dates: { 
          startDate: startDate?.toString(), 
          endDate: endDate?.toString(), 
          startTime, 
          endTime 
        },
        locations: { pickupLocation, dropoffLocation },
        customer: customerInfo,
        services: {
          escoltas: selectedEscoltasDetails,
          choferes: selectedChoferesDetails
        },
        pricing: { 
          basePrice, 
          servicesPrice, 
          totalPrice,
          totalDays
        }
      };
      
      // Guardar datos en localStorage para usar en la cotización
      localStorage.setItem('bookingData', JSON.stringify(bookingData));
      
      // Navegar a la ruta de cotización
      await goto('/renta/cotizacion');
      
    } catch (error) {
      console.error('Error al procesar la reserva:', error);
      alert('Error al procesar la reserva. Por favor, inténtelo de nuevo.');
    } finally {
      isSubmitting = false;
    }
  }

  // Mock unavailable dates (in real app, this would come from API)
  const unavailableDates = [
    new Date(2025, 11, 25), // Christmas 2025
    new Date(2025, 11, 31), // New Year's Eve 2025
    new Date(2026, 0, 1),   // New Year's Day 2026
  ];

  function isDateUnavailable(date: Date): boolean {
    return unavailableDates.some(unavailable => 
      date.toDateString() === unavailable.toDateString()
    );
  }

  // Función para obtener la fecha de hoy sin hora
  function getToday() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  run(() => {
    if (!startDate || !endDate) {
      totalDays = 0;
    } else {
      // Convertir DateValue a Date para cálculo
      const startDateObj = startDate.toDate(getLocalTimeZone());
      const endDateObj = endDate.toDate(getLocalTimeZone());
      const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
      totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  });

  run(() => {
    if (!selectedVehicle) {
      basePrice = 0;
    } else {
      basePrice = selectedVehicle.price * totalDays;
    }
  });

  run(() => {
    let total = 0;
    
    // Servicios dinámicos de escoltas
    selectedEscoltas.forEach(articuloId => {
      const escolta = data.escoltas.find(e => e.Articulo === articuloId);
      if (escolta) {
        total += escolta.PrecioLista * totalDays;
      }
    });
    
    // Servicios dinámicos de choferes
    selectedChoferes.forEach(articuloId => {
      const chofer = data.choferes.find(c => c.Articulo === articuloId);
      if (chofer) {
        total += chofer.PrecioLista * totalDays;
      }
    });
    
    servicesPrice = total;
  });

  run(() => {
    totalPrice = basePrice + servicesPrice;
  });
</script>

<svelte:head>
  <title>Reservar Vehículo Blindado - TPS Armoring</title>
  <meta name="description" content="Reserve su vehículo blindado de forma rápida y segura. Proceso de reserva en 3 pasos simples." />
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Progress Header -->
  <div class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container mx-auto px-4 py-6">
      <div class="space-y-4">
        <div class="text-center">
          <h1 class="text-2xl lg:text-3xl font-bold">Reservar Vehículo</h1>
          <p class="text-muted-foreground mt-2 italic">Tecnología táctica, blindaje extremo. La unidad que redefine la protección en cada misión.</p>
        </div>
        
        <!-- Progress Steps -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center {currentStep >= 1 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}">
              {currentStep > 1 ? '✓' : '1'}
            </div>
            <span class="text-sm font-medium {currentStep >= 1 ? 'text-foreground' : 'text-muted-foreground'}">
              Fechas y Vehículo
            </span>
          </div>
          
          <div class="flex-1 h-px bg-border"></div>
          
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center {currentStep >= 2 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}">
              {currentStep > 2 ? '✓' : '2'}
            </div>
            <span class="text-sm font-medium {currentStep >= 2 ? 'text-foreground' : 'text-muted-foreground'}">
              Información Personal
            </span>
          </div>
          
          <div class="flex-1 h-px bg-border"></div>
          
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center {currentStep >= 3 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}">
              3
            </div>
            <span class="text-sm font-medium {currentStep >= 3 ? 'text-foreground' : 'text-muted-foreground'}">
              Confirmación
            </span>
          </div>
        </div>
        
        <Progress value={(currentStep / 3) * 100} class="w-full" />
      </div>
    </div>
  </div>

  <div class="container mx-auto px-4 py-8">
    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Main Form -->
      <div class="lg:col-span-2 space-y-8">
        
        {#if currentStep === 1}
          <!-- Step 1: Vehicle and Dates -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <CalendarIcon class="h-5 w-5" />
                Selección de Vehículo y Fechas
              </CardTitle>
              <CardDescription>
                Elija su vehículo blindado y las fechas de su reserva
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              
              <!-- Vehicle Selection -->
              <div class="space-y-3">
                <Label for="vehicle">Vehículo *</Label>
                <Select bind:value={selectedVehicleId}>
                  <SelectTrigger class={errors.vehicle ? 'border-destructive' : ''}>
                    {selectedVehicleId ? vehicles[selectedVehicleId]?.name + ' - $' + vehicles[selectedVehicleId]?.price + '/día' : 'Seleccione un vehículo'}
                  </SelectTrigger>
                  <SelectContent>
                    {#each Object.values(vehicles) as vehicle}
                      <SelectItem value={vehicle.vin}>
                        {vehicle.name} - ${vehicle.price}/día
                      </SelectItem>
                    {/each}
                  </SelectContent>
                </Select>
                {#if errors.vehicle}
                  <p class="text-sm text-destructive">{errors.vehicle}</p>
                {/if}
              </div>

              <!-- Date Selection -->
              <div class="grid md:grid-cols-2 gap-4">
                <div class="space-y-3">
                  <Label>Fecha de Inicio *</Label>
                  <Popover.Root>
                    <Popover.Trigger>
                      {#snippet child({ props })}
                        <Button 
                          variant="outline" 
                          class={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground",
                            errors.startDate ? 'border-destructive' : ''
                          )}
                          {...props}
                        >
                          <CalendarIcon class="mr-2 h-4 w-4" />
                          {startDate ? formatDate(startDate) : 'Seleccionar fecha'}
                        </Button>
                      {/snippet}
                    </Popover.Trigger>
                    <Popover.Content class="w-auto p-0" align="start">
                      <Calendar
                        bind:value={startDate}
                        type="single"
                        initialFocus
                      />
                    </Popover.Content>
                  </Popover.Root>
                  {#if errors.startDate}
                    <p class="text-sm text-destructive">{errors.startDate}</p>
                  {/if}
                </div>

                <div class="space-y-3">
                  <Label>Fecha de Fin *</Label>
                  <Popover.Root>
                    <Popover.Trigger>
                      {#snippet child({ props })}
                        <Button 
                          variant="outline" 
                          class={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground",
                            errors.endDate ? 'border-destructive' : ''
                          )}
                          {...props}
                        >
                          <CalendarIcon class="mr-2 h-4 w-4" />
                          {endDate ? formatDate(endDate) : 'Seleccionar fecha'}
                        </Button>
                      {/snippet}
                    </Popover.Trigger>
                    <Popover.Content class="w-auto p-0" align="start">
                      <Calendar
                        bind:value={endDate}
                        type="single"
                        initialFocus
                      />
                    </Popover.Content>
                  </Popover.Root>
                  {#if errors.endDate}
                    <p class="text-sm text-destructive">{errors.endDate}</p>
                  {/if}
                </div>
              </div>

              <!-- Time Selection -->
              <div class="grid md:grid-cols-2 gap-4">
                <div class="space-y-3">
                  <Label for="start-time">Hora de Recogida *</Label>
                  <Select bind:value={startTime}>
                    <SelectTrigger class={errors.startTime ? 'border-destructive' : ''}>
                      {startTime || 'Seleccionar hora'}
                    </SelectTrigger>
                    <SelectContent>
                      {#each ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] as time}
                        <SelectItem value={time}>{time}</SelectItem>
                      {/each}
                    </SelectContent>
                  </Select>
                  {#if errors.startTime}
                    <p class="text-sm text-destructive">{errors.startTime}</p>
                  {/if}
                </div>

                <div class="space-y-3">
                  <Label for="end-time">Hora de Entrega *</Label>
                  <Select bind:value={endTime}>
                    <SelectTrigger class={errors.endTime ? 'border-destructive' : ''}>
                      {endTime || 'Seleccionar hora'}
                    </SelectTrigger>
                    <SelectContent>
                      {#each ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] as time}
                        <SelectItem value={time}>{time}</SelectItem>
                      {/each}
                    </SelectContent>
                  </Select>
                  {#if errors.endTime}
                    <p class="text-sm text-destructive">{errors.endTime}</p>
                  {/if}
                </div>
              </div>

              <!-- Location Selection -->
              <div class="space-y-4">
                <div class="space-y-3">
                  <Label for="pickup-location">Ubicación de Recogida *</Label>
                  <Input
                    id="pickup-location"
                    placeholder="Dirección completa de recogida"
                    bind:value={pickupLocation}
                    class={errors.pickupLocation ? 'border-destructive' : ''}
                  />
                  {#if errors.pickupLocation}
                    <p class="text-sm text-destructive">{errors.pickupLocation}</p>
                  {/if}
                </div>

                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="same-location"
                    bind:checked={sameLocation}
                  />
                  <Label for="same-location" class="text-sm font-normal cursor-pointer">
                    La entrega será en la misma ubicación
                  </Label>
                </div>

                {#if !sameLocation}
                  <div class="space-y-3">
                    <Label for="dropoff-location">Ubicación de Entrega *</Label>
                    <Input
                      id="dropoff-location"
                      placeholder="Dirección completa de entrega"
                      bind:value={dropoffLocation}
                      class={errors.dropoffLocation ? 'border-destructive' : ''}
                    />
                    {#if errors.dropoffLocation}
                      <p class="text-sm text-destructive">{errors.dropoffLocation}</p>
                    {/if}
                  </div>
                {/if}
              </div>

            </CardContent>
          </Card>

        {:else if currentStep === 2}
          <!-- Step 2: Customer Information -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <User class="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Complete sus datos para procesar la reserva
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              
              <div class="grid md:grid-cols-2 gap-4">
                <div class="space-y-3">
                  <Label for="first-name">Nombre *</Label>
                  <Input
                    id="first-name"
                    placeholder="Su nombre"
                    bind:value={customerInfo.firstName}
                    class={errors.firstName ? 'border-destructive' : ''}
                  />
                  {#if errors.firstName}
                    <p class="text-sm text-destructive">{errors.firstName}</p>
                  {/if}
                </div>

                <div class="space-y-3">
                  <Label for="last-name">Apellido *</Label>
                  <Input
                    id="last-name"
                    placeholder="Su apellido"
                    bind:value={customerInfo.lastName}
                    class={errors.lastName ? 'border-destructive' : ''}
                  />
                  {#if errors.lastName}
                    <p class="text-sm text-destructive">{errors.lastName}</p>
                  {/if}
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-4">
                <div class="space-y-3">
                  <Label for="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="su@email.com"
                    bind:value={customerInfo.email}
                    class={errors.email ? 'border-destructive' : ''}
                  />
                  {#if errors.email}
                    <p class="text-sm text-destructive">{errors.email}</p>
                  {/if}
                </div>

                <div class="space-y-3">
                  <Label for="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    placeholder="+34 600 000 000"
                    bind:value={customerInfo.phone}
                    class={errors.phone ? 'border-destructive' : ''}
                  />
                  {#if errors.phone}
                    <p class="text-sm text-destructive">{errors.phone}</p>
                  {/if}
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-4">
                <div class="space-y-3">
                  <Label for="company">Empresa (Opcional)</Label>
                  <Input
                    id="company"
                    placeholder="Nombre de la empresa"
                    bind:value={customerInfo.company}
                  />
                </div>

                <div class="space-y-3">
                  <Label for="id-number">DNI/NIE/Pasaporte *</Label>
                  <Input
                    id="id-number"
                    placeholder="Número de identificación"
                    bind:value={customerInfo.idNumber}
                    class={errors.idNumber ? 'border-destructive' : ''}
                  />
                  {#if errors.idNumber}
                    <p class="text-sm text-destructive">{errors.idNumber}</p>
                  {/if}
                </div>
              </div>

              <div class="space-y-3">
                <Label for="special-requests">Solicitudes Especiales</Label>
                <Textarea
                  id="special-requests"
                  placeholder="Cualquier solicitud especial o información adicional..."
                  bind:value={customerInfo.specialRequests}
                  rows={3}
                />
              </div>

              <!-- Additional Services -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold">Servicios Adicionales</h3>
                
                <!-- Escoltas Section -->
                {#if data.escoltas && data.escoltas.length > 0}
                  <div class="space-y-3">
                    <h4 class="font-medium text-foreground">Servicios de Escolta</h4>
                    <div class="grid md:grid-cols-2 gap-3">
                      {#each data.escoltas as escolta}
                        <div class="flex items-center justify-between p-4 border rounded-lg">
                          <div class="space-y-1">
                            <div class="font-medium">{escolta.Servicio}</div>
                            <div class="text-sm text-muted-foreground">${escolta.PrecioLista}/día</div>
                          </div>
                          <Checkbox 
                            checked={selectedEscoltas.includes(escolta.Articulo)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                selectedEscoltas = [...selectedEscoltas, escolta.Articulo];
                              } else {
                                selectedEscoltas = selectedEscoltas.filter(id => id !== escolta.Articulo);
                              }
                            }}
                          />
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}

                <!-- Choferes Section -->
                {#if data.choferes && data.choferes.length > 0}
                  <div class="space-y-3">
                    <h4 class="font-medium text-foreground">Servicios de Chofer</h4>
                    <div class="grid md:grid-cols-2 gap-3">
                      {#each data.choferes as chofer}
                        <div class="flex items-center justify-between p-4 border rounded-lg">
                          <div class="space-y-1">
                            <div class="font-medium">{chofer.Servicio}</div>
                            <div class="text-sm text-muted-foreground">${chofer.PrecioLista}/día</div>
                          </div>
                          <Checkbox 
                            checked={selectedChoferes.includes(chofer.Articulo)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                selectedChoferes = [...selectedChoferes, chofer.Articulo];
                              } else {
                                selectedChoferes = selectedChoferes.filter(id => id !== chofer.Articulo);
                              }
                            }}
                          />
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>

            </CardContent>
          </Card>

        {:else if currentStep === 3}
          <!-- Step 3: Confirmation -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Check class="h-5 w-5" />
                Confirmar Reserva
              </CardTitle>
              <CardDescription>
                Revise los detalles de su reserva antes de confirmar
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              
              <!-- Booking Summary -->
              <div class="space-y-4">
                <h3 class="font-semibold">Resumen de la Reserva</h3>
                
                <div class="grid md:grid-cols-2 gap-6">
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">Vehículo:</span>
                      <span class="font-medium">{selectedVehicle?.name}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">Fechas:</span>
                      <span class="font-medium">{totalDays} día{totalDays > 1 ? 's' : ''}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">Recogida:</span>
                      <span class="font-medium">{startTime}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">Entrega:</span>
                      <span class="font-medium">{endTime}</span>
                    </div>
                  </div>
                  
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">Cliente:</span>
                      <span class="font-medium">{customerInfo.firstName} {customerInfo.lastName}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">Email:</span>
                      <span class="font-medium">{customerInfo.email}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">Teléfono:</span>
                      <span class="font-medium">{customerInfo.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <!-- Terms and Conditions -->
              <div class="space-y-4">
                <h3 class="font-semibold">Términos y Condiciones</h3>
                <div class="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
                  <p>• Se requiere un depósito de seguridad de $40,000 que será reembolsado tras la devolución del vehículo.</p>
                  <p>• El conductor debe tener al menos 25 años y 3 años de experiencia de conducción.</p>
                  <p>• Se requiere licencia de conducir válida y documento de identidad.</p>
                  <p>• Cancelaciones con más de 48 horas de anticipación: reembolso completo.</p>
                  <p>• El vehículo debe ser devuelto con el mismo nivel de combustible.</p>
                </div>
                
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    bind:checked={termsAccepted}
                    class={errors.terms ? 'border-destructive' : ''}
                  />
                  <Label for="terms" class="text-sm cursor-pointer">
                    Acepto los términos y condiciones de TPS Armoring
                  </Label>
                </div>
                {#if errors.terms}
                  <p class="text-sm text-destructive">{errors.terms}</p>
                {/if}
              </div>

            </CardContent>
          </Card>
        {/if}

        <!-- Navigation Buttons -->
        <div class="flex justify-between">
          <Button
            variant="outline"
            onclick={prevStep}
            disabled={currentStep === 1}
            class="gap-2"
          >
            <ArrowLeft class="h-4 w-4" />
            Anterior
          </Button>

          {#if currentStep < 3}
            <Button onclick={nextStep} class="gap-2">
              Siguiente
              <ArrowRight class="h-4 w-4" />
            </Button>
          {:else}
            <Button onclick={submitBooking} class="gap-2" disabled={isSubmitting}>
              {#if isSubmitting}
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Procesando Reserva...
              {:else}
                Confirmar Reserva
                <Check class="h-4 w-4" />
              {/if}
            </Button>
          {/if}
        </div>

      </div>

      <!-- Booking Summary Sidebar -->
      <div class="space-y-6">
        <div class="sticky top-24">
          
          <!-- Selected Vehicle -->
          {#if selectedVehicle}
            <Card>
              <CardContent class="p-4">
                <div class="space-y-4">
                  <div class="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                    <img 
                      src={selectedVehicle.image}
                      alt={selectedVehicle.name}
                      class="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <Badge variant="secondary">Nivel {selectedVehicle.armorLevel}</Badge>
                    </div>
                    <h3 class="font-semibold text-balance">{selectedVehicle.name}</h3>
                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users class="h-4 w-4" />
                      <span>{selectedVehicle.capacity} personas</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          {/if}

          <!-- Price Breakdown -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Resumen de Precios</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              
              {#if selectedVehicle && totalDays > 0}
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span>Vehículo ({totalDays} día{totalDays > 1 ? 's' : ''})</span>
                    <span>${basePrice}</span>
                  </div>
                  
                  <!-- Servicios dinámicos de escoltas -->
                  {#each selectedEscoltas as escoltaId}
                    {#each data.escoltas.filter(e => e.Articulo === escoltaId) as escolta}
                      <div class="flex justify-between text-sm">
                        <span>{escolta.Servicio}</span>
                        <span>${escolta.PrecioLista * totalDays}</span>
                      </div>
                    {/each}
                  {/each}
                  
                  <!-- Servicios dinámicos de choferes -->
                  {#each selectedChoferes as choferId}
                    {#each data.choferes.filter(c => c.Articulo === choferId) as chofer}
                      <div class="flex justify-between text-sm">
                        <span>{chofer.Servicio}</span>
                        <span>${chofer.PrecioLista * totalDays}</span>
                      </div>
                    {/each}
                  {/each}
                  
                  <Separator />
                  
                  <div class="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>
              {:else}
                <div class="text-center text-muted-foreground py-4">
                  <AlertCircle class="h-8 w-8 mx-auto mb-2" />
                  <p class="text-sm">Seleccione vehículo y fechas para ver el precio</p>
                </div>
              {/if}
              
            </CardContent>
          </Card>

          <!-- Contact Info -->
          <Card>
            <CardContent class="p-4">
              <div class="space-y-3">
                <h3 class="font-semibold">¿Necesita Ayuda?</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2">
                    <Phone class="h-4 w-4 text-muted-foreground" />
                    <span>+34 900 123 456</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Mail class="h-4 w-4 text-muted-foreground" />
                    <span>reservas@tpsarmoring.mx</span>
                  </div>
                </div>
                <p class="text-xs text-muted-foreground">
                  Disponible 24/7 para asistencia
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  </div>
</div>
