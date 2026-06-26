<script>
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Shield, Car, Users, Clock, Star, ArrowRight } from '@lucide/svelte';
</script>

<svelte:head>
  <title>TPS - Alquiler de Vehículos Blindados Premium</title>
  <meta name="description" content="Servicio premium de alquiler de vehículos blindados con la máxima seguridad y confort para ejecutivos y eventos especiales." />
</svelte:head>

 Hero Section 
<section class="relative bg-gradient-to-br from-background to-muted/30 py-20 lg:py-32">
  <div class="container mx-auto px-4">
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <div class="space-y-8">
        <div class="space-y-4">
          <Badge variant="secondary" class="w-fit">
            <Shield class="h-3 w-3 mr-1" />
            Seguridad Premium
          </Badge>
          <h1 class="text-4xl lg:text-6xl font-bold text-balance leading-tight">
            Vehículos Blindados de 
            <span class="text-accent">Máxima Seguridad</span>
          </h1>
          <p class="text-xl text-muted-foreground text-pretty">
            Protección ejecutiva y transporte seguro con nuestra flota de vehículos blindados de última generación. Disponibles 24/7 con conductores especializados.
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4">
          <Button size="lg" class="text-lg px-8" onclick={() => window.location.href = '/vehiculos'}>
            Ver Vehículos
            <ArrowRight class="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" class="text-lg px-8">
            Cotización Rápida
          </Button>
        </div>
        
        <div class="flex items-center gap-8 pt-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-foreground">50+</div>
            <div class="text-sm text-muted-foreground">Vehículos</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-foreground">24/7</div>
            <div class="text-sm text-muted-foreground">Disponibilidad</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-foreground">100%</div>
            <div class="text-sm text-muted-foreground">Seguridad</div>
          </div>
        </div>
      </div>
      
      <div class="relative">
        <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
          <img 
            src="/placeholder.svg?height=600&width=800"
            alt="Vehículo blindado de lujo"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="absolute -bottom-6 -left-6 bg-card border rounded-xl p-4 shadow-lg">
          <div class="flex items-center gap-3">
            <div class="bg-accent/10 p-2 rounded-lg">
              <Shield class="h-5 w-5 text-accent" />
            </div>
            <div>
              <div class="font-semibold text-sm">Blindaje Nivel B6</div>
              <div class="text-xs text-muted-foreground">Máxima Protección</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

 Features Section 
<section class="py-20 bg-background">
  <div class="container mx-auto px-4">
    <div class="text-center space-y-4 mb-16">
      <h2 class="text-3xl lg:text-4xl font-bold text-balance">
        ¿Por qué elegir ArmorRent?
      </h2>
      <p class="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
        Ofrecemos el más alto nivel de seguridad y confort para sus desplazamientos más importantes.
      </p>
    </div>
    
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Card class="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader class="text-center pb-4">
          <div class="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield class="h-6 w-6 text-accent" />
          </div>
          <CardTitle class="text-xl">Blindaje Certificado</CardTitle>
        </CardHeader>
        <CardContent class="text-center">
          <CardDescription class="text-base">
            Vehículos con blindaje nivel B4 a B7, certificados internacionalmente para máxima protección.
          </CardDescription>
        </CardContent>
      </Card>
      
      <Card class="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader class="text-center pb-4">
          <div class="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users class="h-6 w-6 text-accent" />
          </div>
          <CardTitle class="text-xl">Conductores Expertos</CardTitle>
        </CardHeader>
        <CardContent class="text-center">
          <CardDescription class="text-base">
            Personal altamente capacitado en conducción defensiva y protocolos de seguridad.
          </CardDescription>
        </CardContent>
      </Card>
      
      <Card class="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader class="text-center pb-4">
          <div class="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Clock class="h-6 w-6 text-accent" />
          </div>
          <CardTitle class="text-xl">Disponibilidad 24/7</CardTitle>
        </CardHeader>
        <CardContent class="text-center">
          <CardDescription class="text-base">
            Servicio disponible las 24 horas, los 7 días de la semana para emergencias y eventos.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  </div>
</section>

 Vehicle Preview Section 
<section class="py-20 bg-muted/30">
  <div class="container mx-auto px-4">
    <div class="text-center space-y-4 mb-16">
      <h2 class="text-3xl lg:text-4xl font-bold text-balance">
        Nuestra Flota Premium
      </h2>
      <p class="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
        Vehículos de lujo con el más alto nivel de protección y confort.
      </p>
    </div>
    
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each [
        { name: 'Mercedes-Benz S-Class Blindado', level: 'B6', price: '€450', image: 'luxury armored Mercedes S-Class sedan black professional' },
        { name: 'BMW X7 Blindado', level: 'B4', price: '€380', image: 'armored BMW X7 SUV black luxury security vehicle' },
        { name: 'Audi A8 L Security', level: 'B7', price: '€520', image: 'Audi A8 armored luxury sedan security black professional' }
      ] as vehicle}
        <Card class="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
          <div class="aspect-[4/3] overflow-hidden">
            <img 
              src="/placeholder.svg?height=300&width=400"
              alt={vehicle.name}
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          <CardContent class="p-6">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <Badge variant="secondary">Nivel {vehicle.level}</Badge>
                <div class="text-right">
                  <div class="text-2xl font-bold text-foreground">{vehicle.price}</div>
                  <div class="text-sm text-muted-foreground">por día</div>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-balance">{vehicle.name}</h3>
              <Button class="w-full" variant="outline">
                Ver Detalles
              </Button>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
    
    <div class="text-center mt-12">
      <Button size="lg" onclick={() => window.location.href = '/vehiculos'}>
        Ver Toda la Flota
        <ArrowRight class="ml-2 h-5 w-5" />
      </Button>
    </div>
  </div>
</section>

 CTA Section 
<section class="py-20 bg-primary text-primary-foreground">
  <div class="container mx-auto px-4 text-center">
    <div class="max-w-3xl mx-auto space-y-8">
      <h2 class="text-3xl lg:text-4xl font-bold text-balance">
        ¿Listo para viajar con máxima seguridad?
      </h2>
      <p class="text-xl opacity-90 text-pretty">
        Obtenga una cotización personalizada en menos de 5 minutos. Nuestro equipo está disponible 24/7 para atender sus necesidades de seguridad.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" variant="secondary" class="text-lg px-8">
          Cotizar Ahora
        </Button>
        <Button size="lg" variant="outline" class="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
          Llamar: +34 900 123 456
        </Button>
      </div>
    </div>
  </div>
</section>
