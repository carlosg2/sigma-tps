<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Shield, Car, Phone, Menu } from 'lucide-svelte';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
  
  let mobileMenuOpen = $state(false);
</script>

<div class="min-h-screen bg-background">
  <!-- <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container mx-auto flex h-16 items-center justify-between px-4">

      <a href="/" class="flex items-center space-x-2">
        <Shield class="h-8 w-8 text-accent" />
        <span class="text-xl font-bold text-foreground">ArmorRent</span>
      </a>

      <nav class="hidden md:flex items-center space-x-6">
        <a href="renta/" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Inicio
        </a>
        <a href="renta/vehiculos" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Vehículos
        </a>
        <a href="renta/reservar" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Reservar
        </a>
        <a href="renta/contacto" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Contacto
        </a>
      </nav>


      <div class="flex items-center space-x-4">
        <div class="hidden lg:flex items-center space-x-2 text-sm text-muted-foreground">
          <Phone class="h-4 w-4" />
          <span>+34 900 123 456</span>
        </div>
        
        <Button class="hidden md:inline-flex">
          Cotizar Ahora
        </Button>


        <Button
          variant="ghost"
          size="sm"
          class="md:hidden"
          onclick={() => mobileMenuOpen = !mobileMenuOpen}
        >
          <Menu class="h-5 w-5" />
        </Button>
      </div>
    </div>


    {#if mobileMenuOpen}
      <div class="md:hidden border-t bg-background">
        <nav class="container mx-auto px-4 py-4 space-y-3">
          <a href="/" class="block text-sm font-medium text-muted-foreground hover:text-foreground">
            Inicio
          </a>
          <a href="/vehiculos" class="block text-sm font-medium text-muted-foreground hover:text-foreground">
            Vehículos
          </a>
          <a href="/reservar" class="block text-sm font-medium text-muted-foreground hover:text-foreground">
            Reservar
          </a>
          <a href="/contacto" class="block text-sm font-medium text-muted-foreground hover:text-foreground">
            Contacto
          </a>
          <div class="pt-3 border-t">
            <Button class="w-full">
              Cotizar Ahora
            </Button>
          </div>
        </nav>
      </div>
    {/if}
  </header> -->

  <main class="flex-1">
    {@render children?.()}
  </main>

  <!-- <footer class="border-t bg-muted/30">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <Shield class="h-6 w-6 text-accent" />
            <span class="font-bold text-foreground">ArmorRent</span>
          </div>
          <p class="text-sm text-muted-foreground">
            Servicio premium de alquiler de vehículos blindados con la máxima seguridad y confort.
          </p>
        </div>
        
        <div class="space-y-3">
          <h4 class="font-semibold text-foreground">Servicios</h4>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><a href="/vehiculos" class="hover:text-foreground">Vehículos Blindados</a></li>
            <li><a href="/conductores" class="hover:text-foreground">Conductores Especializados</a></li>
            <li><a href="/seguridad" class="hover:text-foreground">Servicios de Seguridad</a></li>
          </ul>
        </div>
        
        <div class="space-y-3">
          <h4 class="font-semibold text-foreground">Contacto</h4>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li>+34 900 123 456</li>
            <li>info@armorrent.es</li>
            <li>Madrid, España</li>
          </ul>
        </div>
        
        <div class="space-y-3">
          <h4 class="font-semibold text-foreground">Legal</h4>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><a href="/privacidad" class="hover:text-foreground">Política de Privacidad</a></li>
            <li><a href="/terminos" class="hover:text-foreground">Términos de Servicio</a></li>
            <li><a href="/cookies" class="hover:text-foreground">Política de Cookies</a></li>
          </ul>
        </div>
      </div>
      
      <div class="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>&copy; 2024 ArmorRent. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer> -->
</div>
