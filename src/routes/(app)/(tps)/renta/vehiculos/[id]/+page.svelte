<script>
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Separator } from '$lib/components/ui/separator';
  import { Shield, Users, Fuel, Settings, Star, ArrowLeft, Calendar, Phone } from 'lucide-svelte';

  // Mock vehicle data (in real app, this would come from a data source)
  const vehicles = {
    '1': {
      id: 1,
      name: 'Mercedes-Benz S-Class Blindado',
      type: 'sedan',
      armorLevel: 'B6',
      price: 450,
      capacity: 4,
      fuel: 'Gasolina',
      transmission: 'Automático',
      features: ['GPS', 'Comunicaciones', 'Aire Acondicionado', 'Asientos de Cuero'],
      rating: 4.9,
      images: [
        'luxury armored Mercedes S-Class sedan black professional exterior',
        'Mercedes S-Class armored interior luxury leather seats',
        'Mercedes S-Class security features dashboard technology'
      ],
      description: 'El Mercedes-Benz S-Class Blindado representa la perfecta combinación entre lujo ejecutivo y seguridad de nivel militar. Con blindaje certificado B6, este vehículo ofrece protección contra amenazas balísticas mientras mantiene el confort y la elegancia característicos de la marca.',
      specifications: {
        'Motor': 'V8 4.0L Biturbo',
        'Potencia': '463 CV',
        'Aceleración': '0-100 km/h en 5.4s',
        'Velocidad Máxima': '210 km/h',
        'Consumo': '12.5L/100km',
        'Peso': '3,200 kg',
        'Longitud': '5.18 m',
        'Anchura': '1.90 m',
        'Altura': '1.50 m'
      },
      securityFeatures: [
        'Blindaje certificado nivel B6',
        'Cristales antibalas de 40mm',
        'Neumáticos run-flat',
        'Sistema de comunicaciones encriptadas',
        'Cámaras de seguridad 360°',
        'Sistema de escape de emergencia',
        'Protección contra explosivos (piso reforzado)'
      ]
    }
  };

  const vehicleId = $page.params.id;
  const vehicle = vehicles[vehicleId];

  let selectedImageIndex = $state(0);
</script>

<svelte:head>
  <title>{vehicle?.name || 'Vehículo'} - ArmorRent</title>
  <meta name="description" content={vehicle?.description || 'Detalles del vehículo blindado'} />
</svelte:head>

{#if vehicle}
  <div class="min-h-screen bg-background">
     Back Navigation 
    <div class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto px-4 py-4">
        <Button variant="ghost" onclick={() => window.history.back()} class="gap-2">
          <ArrowLeft class="h-4 w-4" />
          Volver a Vehículos
        </Button>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <div class="grid lg:grid-cols-2 gap-12">
         Vehicle Images 
        <div class="space-y-4">
          <div class="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
            <img 
              src="/placeholder.svg?height=600&width=800"
              alt={vehicle.name}
              class="w-full h-full object-cover"
            />
          </div>
          
          <div class="grid grid-cols-3 gap-4">
            {#each vehicle.images as image, index}
              <button
                class="aspect-[4/3] overflow-hidden rounded-lg bg-muted border-2 transition-colors {selectedImageIndex === index ? 'border-accent' : 'border-transparent hover:border-border'}"
                onclick={() => selectedImageIndex = index}
              >
                <img 
                  src="/placeholder.svg?height=200&width=300"
                  alt="{vehicle.name} - Vista {index + 1}"
                  class="w-full h-full object-cover"
                />
              </button>
            {/each}
          </div>
        </div>

         Vehicle Details 
        <div class="space-y-8">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <Badge variant="secondary">Nivel {vehicle.armorLevel}</Badge>
              <div class="flex items-center gap-1">
                <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span class="font-medium">{vehicle.rating}</span>
                <span class="text-muted-foreground">(127 reseñas)</span>
              </div>
            </div>
            
            <h1 class="text-3xl lg:text-4xl font-bold text-balance">{vehicle.name}</h1>
            <p class="text-lg text-muted-foreground text-pretty">{vehicle.description}</p>
          </div>

           Quick Specs 
          <div class="grid grid-cols-2 gap-6">
            <div class="flex items-center gap-3">
              <div class="bg-accent/10 p-2 rounded-lg">
                <Users class="h-5 w-5 text-accent" />
              </div>
              <div>
                <div class="font-medium">{vehicle.capacity} Personas</div>
                <div class="text-sm text-muted-foreground">Capacidad</div>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <div class="bg-accent/10 p-2 rounded-lg">
                <Fuel class="h-5 w-5 text-accent" />
              </div>
              <div>
                <div class="font-medium">{vehicle.fuel}</div>
                <div class="text-sm text-muted-foreground">Combustible</div>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <div class="bg-accent/10 p-2 rounded-lg">
                <Settings class="h-5 w-5 text-accent" />
              </div>
              <div>
                <div class="font-medium">{vehicle.transmission}</div>
                <div class="text-sm text-muted-foreground">Transmisión</div>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <div class="bg-accent/10 p-2 rounded-lg">
                <Shield class="h-5 w-5 text-accent" />
              </div>
              <div>
                <div class="font-medium">Blindaje {vehicle.armorLevel}</div>
                <div class="text-sm text-muted-foreground">Protección</div>
              </div>
            </div>
          </div>

           Pricing & CTA 
          <Card class="border-accent/20 bg-accent/5">
            <CardContent class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <div class="text-3xl font-bold text-foreground">€{vehicle.price}</div>
                  <div class="text-muted-foreground">por día</div>
                </div>
                <Badge variant="outline" class="text-accent border-accent">
                  Disponible
                </Badge>
              </div>
              
              <div class="space-y-3">
                <Button size="lg" class="w-full" onclick={() => window.location.href = '/reservar?vehiculo=' + vehicle.id}>
                  <Calendar class="h-5 w-5 mr-2" />
                  Reservar Ahora
                </Button>
                <Button variant="outline" size="lg" class="w-full">
                  <Phone class="h-5 w-5 mr-2" />
                  Llamar: +34 900 123 456
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

       Detailed Information 
      <div class="mt-16 space-y-12">
         Security Features 
        <section>
          <h2 class="text-2xl font-bold mb-6">Características de Seguridad</h2>
          <Card>
            <CardContent class="p-6">
              <div class="grid md:grid-cols-2 gap-4">
                {#each vehicle.securityFeatures as feature}
                  <div class="flex items-center gap-3">
                    <Shield class="h-5 w-5 text-accent flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                {/each}
              </div>
            </CardContent>
          </Card>
        </section>

         Technical Specifications 
        <section>
          <h2 class="text-2xl font-bold mb-6">Especificaciones Técnicas</h2>
          <Card>
            <CardContent class="p-6">
              <div class="grid md:grid-cols-2 gap-6">
                {#each Object.entries(vehicle.specifications) as [key, value]}
                  <div class="flex justify-between items-center py-2">
                    <span class="font-medium">{key}</span>
                    <span class="text-muted-foreground">{value}</span>
                  </div>
                  <Separator class="md:col-span-2" />
                {/each}
              </div>
            </CardContent>
          </Card>
        </section>

         Features 
        <section>
          <h2 class="text-2xl font-bold mb-6">Características Incluidas</h2>
          <Card>
            <CardContent class="p-6">
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each vehicle.features as feature}
                  <div class="flex items-center gap-3">
                    <div class="bg-accent/10 p-1 rounded">
                      <div class="w-2 h-2 bg-accent rounded-full"></div>
                    </div>
                    <span>{feature}</span>
                  </div>
                {/each}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-background flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-2">Vehículo no encontrado</h1>
      <p class="text-muted-foreground mb-4">El vehículo que busca no existe o no está disponible.</p>
      <Button onclick={() => window.location.href = '/vehiculos'}>
        Volver a Vehículos
      </Button>
    </div>
  </div>
{/if}
