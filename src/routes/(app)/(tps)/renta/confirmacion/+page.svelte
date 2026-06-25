<script>
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Separator } from '$lib/components/ui/separator';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { 
    Check, 
    Shield, 
    Users, 
    User,
    Car, 
    Clock, 
    MapPin, 
    Phone, 
    Mail,
    Download,
    Star,
    Crown,
    UserCheck,
    ShieldCheck,
    Navigation,
    Headphones,
    Wifi,
    Coffee,
    Camera,
    AlertCircle,
    CheckCircle,
    ArrowRight
  } from 'lucide-svelte';

  // Mock booking data (in real app, this would come from the booking process)
  let bookingData = $state({
    bookingId: 'AR-2024-001234',
    vehicle: {
      name: 'Mercedes-Benz S-Class Blindado',
      armorLevel: 'B6',
      price: 450,
      capacity: 4,
      image: 'luxury armored Mercedes S-Class sedan black professional'
    },
    dates: {
      startDate: new Date(2024, 11, 15),
      endDate: new Date(2024, 11, 18),
      startTime: '09:00',
      endTime: '18:00',
      totalDays: 3
    },
    customer: {
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+34 600 123 456',
      company: 'Empresa Ejecutiva S.L.'
    },
    locations: {
      pickup: 'Hotel Ritz, Plaza de la Lealtad, 5, Madrid',
      dropoff: 'Aeropuerto Adolfo Suárez Madrid-Barajas, Terminal 4'
    },
    basePrice: 1350, // 450 * 3 days
    status: 'confirmed'
  });

  // Premium upsell services
  let premiumServices = $state({
    driver: {
      selected: false,
      name: 'Conductor Especializado Premium',
      description: 'Conductor profesional con formación en seguridad ejecutiva y conocimiento de rutas seguras',
      price: 200,
      originalPrice: 150,
      features: ['Formación en seguridad', 'Conocimiento de rutas', 'Protocolo VIP', 'Multiidioma'],
      icon: UserCheck,
      popular: true
    },
    security: {
      selected: false,
      name: 'Escolta de Seguridad Personal',
      description: 'Agente de seguridad profesional para máxima protección durante el trayecto',
      price: 300,
      originalPrice: 250,
      features: ['Agente certificado', 'Comunicación constante', 'Evaluación de riesgos', 'Respuesta inmediata'],
      icon: ShieldCheck,
      popular: false
    },
    concierge: {
      selected: false,
      name: 'Servicio de Conserjería VIP',
      description: 'Asistente personal para gestionar reservas, citas y servicios durante su estancia',
      price: 150,
      originalPrice: 120,
      features: ['Asistente 24/7', 'Gestión de reservas', 'Servicios personalizados', 'Coordinación de eventos'],
      icon: Crown,
      popular: false
    },
    communication: {
      selected: false,
      name: 'Sistema de Comunicaciones Avanzado',
      description: 'Comunicaciones encriptadas y conexión satelital para máxima seguridad',
      price: 100,
      originalPrice: 75,
      features: ['Comunicación encriptada', 'Conexión satelital', 'Internet de alta velocidad', 'Teléfono seguro'],
      icon: Headphones,
      popular: false
    },
    surveillance: {
      selected: false,
      name: 'Monitoreo y Seguimiento GPS',
      description: 'Seguimiento en tiempo real con centro de control 24/7 y respuesta de emergencia',
      price: 80,
      originalPrice: 60,
      features: ['GPS en tiempo real', 'Centro de control', 'Alertas automáticas', 'Historial de rutas'],
      icon: Navigation,
      popular: false
    },
    comfort: {
      selected: false,
      name: 'Paquete de Confort Premium',
      description: 'Amenidades de lujo para una experiencia de viaje excepcional',
      price: 120,
      originalPrice: 100,
      features: ['Refreshments premium', 'Wi-Fi de alta velocidad', 'Cargadores inalámbricos', 'Entretenimiento'],
      icon: Coffee,
      popular: false
    }
  });

  // Computed values
  let selectedServices = $derived(
    Object.entries(premiumServices).filter(([key, service]) => service.selected)
  );

  let servicesTotal = $derived(
    selectedServices.reduce((total, [key, service]) => total + (service.price * bookingData.dates.totalDays), 0)
  );

  let originalServicesTotal = $derived(
    selectedServices.reduce((total, [key, service]) => total + (service.originalPrice * bookingData.dates.totalDays), 0)
  );

  let totalSavings = $derived(originalServicesTotal - servicesTotal);

  let finalTotal = $derived(bookingData.basePrice + servicesTotal);

  // Special offers
  let specialOffers = $state([
    {
      id: 'bundle-security',
      title: 'Paquete Seguridad Total',
      description: 'Conductor + Escolta + Comunicaciones',
      services: ['driver', 'security', 'communication'],
      originalPrice: 600,
      discountPrice: 500,
      savings: 100,
      popular: true
    },
    {
      id: 'bundle-executive',
      title: 'Experiencia Ejecutiva',
      description: 'Conductor + Conserjería + Confort',
      services: ['driver', 'concierge', 'comfort'],
      originalPrice: 470,
      discountPrice: 400,
      savings: 70,
      popular: false
    }
  ]);

  function toggleService(serviceKey) {
    premiumServices[serviceKey].selected = !premiumServices[serviceKey].selected;
  }

  function selectBundle(bundle) {
    // Clear all selections first
    Object.keys(premiumServices).forEach(key => {
      premiumServices[key].selected = false;
    });
    
    // Select bundle services
    bundle.services.forEach(serviceKey => {
      if (premiumServices[serviceKey]) {
        premiumServices[serviceKey].selected = true;
        // Apply bundle pricing
        premiumServices[serviceKey].price = bundle.discountPrice / bundle.services.length;
      }
    });
  }

  function formatDate(date) {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function proceedToQuotation() {
    // In a real app, this would save the final booking details and redirect
    const finalBooking = {
      ...bookingData,
      selectedServices: selectedServices.map(([key, service]) => ({
        key,
        name: service.name,
        price: service.price,
        totalPrice: service.price * bookingData.dates.totalDays
      })),
      pricing: {
        basePrice: bookingData.basePrice,
        servicesTotal,
        totalSavings,
        finalTotal
      }
    };
    
    console.log('Final booking:', finalBooking);
    window.location.href = '/cotizacion';
  }
</script>

<svelte:head>
  <title>Confirmación de Reserva - ArmorRent</title>
  <meta name="description" content="Confirme su reserva y personalice su experiencia con nuestros servicios premium de seguridad y confort." />
</svelte:head>

<div class="min-h-screen bg-background">
   Success Header 
  <section class="bg-gradient-to-r from-accent/10 to-accent/5 py-12">
    <div class="container mx-auto px-4">
      <div class="text-center space-y-4">
        <div class="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle class="h-8 w-8 text-accent" />
        </div>
        <h1 class="text-3xl lg:text-4xl font-bold text-balance">
          ¡Reserva Confirmada!
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          Su vehículo blindado ha sido reservado exitosamente. Personalice su experiencia con nuestros servicios premium.
        </p>
        <Badge variant="secondary" class="text-lg px-4 py-2">
          Reserva #{bookingData.bookingId}
        </Badge>
      </div>
    </div>
  </section>

  <div class="container mx-auto px-4 py-8">
    <div class="grid lg:grid-cols-3 gap-8">
       Main Content 
      <div class="lg:col-span-2 space-y-8">
        
         Booking Confirmation Details 
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Car class="h-5 w-5" />
              Detalles de su Reserva
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            
            <div class="grid md:grid-cols-2 gap-6">
               Vehicle Info 
              <div class="space-y-4">
                <div class="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                  <img 
                    src="/placeholder.svg?height=200&width=300"
                    alt={bookingData.vehicle.name}
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="space-y-2">
                  <Badge variant="secondary">Nivel {bookingData.vehicle.armorLevel}</Badge>
                  <h3 class="font-semibold">{bookingData.vehicle.name}</h3>
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users class="h-4 w-4" />
                    <span>{bookingData.vehicle.capacity} personas</span>
                  </div>
                </div>
              </div>

               Booking Details 
              <div class="space-y-4">
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <Clock class="h-4 w-4 text-muted-foreground" />
                    <span class="font-medium">Fechas y Horarios</span>
                  </div>
                  <div class="pl-6 space-y-1 text-sm">
                    <p><strong>Inicio:</strong> {formatDate(bookingData.dates.startDate)} a las {bookingData.dates.startTime}</p>
                    <p><strong>Fin:</strong> {formatDate(bookingData.dates.endDate)} a las {bookingData.dates.endTime}</p>
                    <p><strong>Duración:</strong> {bookingData.dates.totalDays} días</p>
                  </div>
                </div>

                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <MapPin class="h-4 w-4 text-muted-foreground" />
                    <span class="font-medium">Ubicaciones</span>
                  </div>
                  <div class="pl-6 space-y-1 text-sm">
                    <p><strong>Recogida:</strong> {bookingData.locations.pickup}</p>
                    <p><strong>Entrega:</strong> {bookingData.locations.dropoff}</p>
                  </div>
                </div>

                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <User class="h-4 w-4 text-muted-foreground" />
                    <span class="font-medium">Cliente</span>
                  </div>
                  <div class="pl-6 space-y-1 text-sm">
                    <p><strong>Nombre:</strong> {bookingData.customer.firstName} {bookingData.customer.lastName}</p>
                    <p><strong>Email:</strong> {bookingData.customer.email}</p>
                    <p><strong>Teléfono:</strong> {bookingData.customer.phone}</p>
                    {#if bookingData.customer.company}
                      <p><strong>Empresa:</strong> {bookingData.customer.company}</p>
                    {/if}
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

         Special Bundle Offers 
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Crown class="h-5 w-5 text-accent" />
              Ofertas Especiales - Solo Hoy
            </CardTitle>
            <CardDescription>
              Paquetes premium con descuentos exclusivos para su reserva
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            
            {#each specialOffers as bundle}
              <div class="relative border rounded-lg p-4 hover:border-accent/50 transition-colors {bundle.popular ? 'border-accent bg-accent/5' : ''}">
                {#if bundle.popular}
                  <Badge class="absolute -top-2 left-4 bg-accent text-accent-foreground">
                    Más Popular
                  </Badge>
                {/if}
                
                <div class="flex items-center justify-between">
                  <div class="space-y-2">
                    <h3 class="font-semibold text-lg">{bundle.title}</h3>
                    <p class="text-sm text-muted-foreground">{bundle.description}</p>
                    <div class="flex items-center gap-4">
                      <div class="flex items-center gap-2">
                        <span class="text-2xl font-bold text-accent">€{bundle.discountPrice * bookingData.dates.totalDays}</span>
                        <span class="text-sm text-muted-foreground line-through">€{bundle.originalPrice * bookingData.dates.totalDays}</span>
                      </div>
                      <Badge variant="outline" class="text-accent border-accent">
                        Ahorra €{bundle.savings * bookingData.dates.totalDays}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button onclick={() => selectBundle(bundle)} class="shrink-0">
                    Seleccionar Paquete
                  </Button>
                </div>
              </div>
            {/each}

          </CardContent>
        </Card>

         Individual Premium Services 
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Shield class="h-5 w-5" />
              Servicios Premium Individuales
            </CardTitle>
            <CardDescription>
              Personalice su experiencia con servicios adicionales de seguridad y confort
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            
            <div class="grid md:grid-cols-2 gap-4">
              {#each Object.entries(premiumServices) as [key, service]}
                <div class="relative border rounded-lg p-4 hover:border-accent/50 transition-colors {service.selected ? 'border-accent bg-accent/5' : ''}">
                  {#if service.popular}
                    <Badge class="absolute -top-2 left-4 bg-accent text-accent-foreground text-xs">
                      Popular
                    </Badge>
                  {/if}
                  
                  <div class="space-y-4">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center gap-3">
                        <div class="bg-accent/10 p-2 rounded-lg">
                          <service.icon class="h-5 w-5 text-accent" />
                        </div>
                        <div class="space-y-1">
                          <h3 class="font-semibold text-sm">{service.name}</h3>
                          <div class="flex items-center gap-2">
                            <span class="font-bold text-accent">€{service.price * bookingData.dates.totalDays}</span>
                            <span class="text-xs text-muted-foreground line-through">€{service.originalPrice * bookingData.dates.totalDays}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Checkbox
                        checked={service.selected}
                        onCheckedChange={() => toggleService(key)}
                      />
                    </div>
                    
                    <p class="text-sm text-muted-foreground text-pretty">{service.description}</p>
                    
                    <div class="space-y-1">
                      {#each service.features as feature}
                        <div class="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check class="h-3 w-3 text-accent" />
                          <span>{feature}</span>
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
              {/each}
            </div>

          </CardContent>
        </Card>

         Important Information 
        <Alert>
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>
            <strong>Información Importante:</strong> Los servicios premium pueden ser añadidos o modificados hasta 24 horas antes de su reserva. 
            Algunos servicios requieren verificación adicional y pueden tomar hasta 48 horas para confirmar disponibilidad.
          </AlertDescription>
        </Alert>

      </div>

       Pricing Sidebar 
      <div class="space-y-6">
        <div class="sticky top-24">
          
           Price Summary 
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Resumen de Precios</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span>Vehículo ({bookingData.dates.totalDays} días)</span>
                  <span>€{bookingData.basePrice}</span>
                </div>
                
                {#if selectedServices.length > 0}
                  <Separator />
                  <div class="space-y-2">
                    <h4 class="font-medium text-sm">Servicios Premium:</h4>
                    {#each selectedServices as [key, service]}
                      <div class="flex justify-between text-sm">
                        <span class="text-muted-foreground">{service.name}</span>
                        <span>€{service.price * bookingData.dates.totalDays}</span>
                      </div>
                    {/each}
                  </div>
                {/if}
                
                {#if totalSavings > 0}
                  <div class="flex justify-between text-sm text-accent">
                    <span>Descuento aplicado</span>
                    <span>-€{totalSavings}</span>
                  </div>
                {/if}
                
                <Separator />
                
                <div class="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>€{finalTotal}</span>
                </div>
                
                {#if totalSavings > 0}
                  <div class="text-center">
                    <Badge variant="outline" class="text-accent border-accent">
                      ¡Ahorra €{totalSavings}!
                    </Badge>
                  </div>
                {/if}
              </div>
              
              <Button onclick={proceedToQuotation} size="lg" class="w-full gap-2">
                Generar Cotización
                <ArrowRight class="h-4 w-4" />
              </Button>
              
            </CardContent>
          </Card>

           Next Steps 
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Próximos Pasos</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <div class="bg-accent/10 p-1 rounded-full mt-1">
                    <div class="w-2 h-2 bg-accent rounded-full"></div>
                  </div>
                  <div class="space-y-1">
                    <p class="text-sm font-medium">Generar Cotización</p>
                    <p class="text-xs text-muted-foreground">Descargue su cotización detallada</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-3">
                  <div class="bg-muted p-1 rounded-full mt-1">
                    <div class="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  </div>
                  <div class="space-y-1">
                    <p class="text-sm font-medium">Confirmación Final</p>
                    <p class="text-xs text-muted-foreground">Recibirá confirmación por email</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-3">
                  <div class="bg-muted p-1 rounded-full mt-1">
                    <div class="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  </div>
                  <div class="space-y-1">
                    <p class="text-sm font-medium">Preparación del Vehículo</p>
                    <p class="text-xs text-muted-foreground">48h antes de la fecha</p>
                  </div>
                </div>
              </div>
              
            </CardContent>
          </Card>

           Contact Support 
          <Card>
            <CardContent class="p-4">
              <div class="space-y-3">
                <h3 class="font-semibold">Soporte 24/7</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2">
                    <Phone class="h-4 w-4 text-muted-foreground" />
                    <span>+34 900 123 456</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Mail class="h-4 w-4 text-muted-foreground" />
                    <span>reservas@armorrent.es</span>
                  </div>
                </div>
                <p class="text-xs text-muted-foreground">
                  ¿Preguntas sobre su reserva? Nuestro equipo está disponible para ayudarle.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  </div>
</div>
