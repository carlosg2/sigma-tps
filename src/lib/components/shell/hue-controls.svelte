<script lang="ts">
  import { buttonVariants } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { Slider } from '$lib/components/ui/slider';
  import { Button } from '$lib/components/ui/button';
  import * as Popover from '$lib/components/ui/popover';
	import { Palette } from '@lucide/svelte';

  // Type for color family configuration
  type ColorFamily = {
    key: keyof typeof hueValues;
    label: string;
    cssVar: string;
  };

  // Individual hue values for each color family (preserving original theme hues)
  let hueValues = $state({
    primary: 264,
    secondary: 200,
    accent: 271,
    destructive: 27,
    chart1: 264,
    chart2: 304,
    chart3: 70,
    chart4: 162,
    chart5: 16
  });

  // Configuración de familias de colores
  const colorFamilies: ColorFamily[] = [
    { key: 'primary', label: 'Principal', cssVar: '--hue-primary' },
    { key: 'secondary', label: 'Secundario', cssVar: '--hue-secondary' },
    { key: 'accent', label: 'Acento', cssVar: '--hue-accent' },
    { key: 'destructive', label: 'Error', cssVar: '--hue-destructive' },
    { key: 'chart1', label: 'Gráfico 1', cssVar: '--hue-chart-1' },
    { key: 'chart2', label: 'Gráfico 2', cssVar: '--hue-chart-2' },
    { key: 'chart3', label: 'Gráfico 3', cssVar: '--hue-chart-3' },
    { key: 'chart4', label: 'Gráfico 4', cssVar: '--hue-chart-4' },
    { key: 'chart5', label: 'Gráfico 5', cssVar: '--hue-chart-5' }
  ];

  // Helper function to update a single CSS variable
  function updateCSSVariable(cssVar: string, value: number) {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty(cssVar, value.toString());
    }
  }

  // Update all CSS variables
  function updateAllHues() {
    colorFamilies.forEach(family => {
      updateCSSVariable(family.cssVar, hueValues[family.key]);
    });
  }

  // Reactive effect to update CSS variables when hue values change
  $effect(() => {
    colorFamilies.forEach(family => {
      updateCSSVariable(family.cssVar, hueValues[family.key]);
    });
  });

  // Helper functions for color calculations
  function getColorPreview(hue: number) {
    return `oklch(0.7 0.2 ${hue})`;
  }

  function getHueGradient() {
    // Create a gradient with color stops every 20 degrees for smoother transition
    const stops = [];
    for (let i = 0; i <= 360; i += 20) {
      const percentage = (i / 360) * 100;
      stops.push(`oklch(0.7 0.2 ${i}) ${percentage.toFixed(1)}%`);
    }
    // Add the final stop to close the loop
    stops.push(`oklch(0.7 0.2 0) 100%`);
    return `linear-gradient(to right, ${stops.join(', ')})`;
  }

  // Reset to default values
  function resetToDefaults() {
    hueValues = {
      primary: 264,
      secondary: 200,
      accent: 271,
      destructive: 27,
      chart1: 264,
      chart2: 304,
      chart3: 70,
      chart4: 162,
      chart5: 16
    };
  }
</script>

<Popover.Root>
  <Popover.Trigger class={buttonVariants({ variant: "outline" })}>
    <Palette class="size-4" />
  </Popover.Trigger>
  
  <Popover.Content class="w-80 max-h-96 overflow-y-auto">
    <div class="grid gap-4">
      <div class="space-y-2">
        <h4 class="font-medium leading-none">Colores del Tema</h4>
        <p class="text-muted-foreground text-sm">
          Personaliza los colores principales.
        </p>
      </div>
      
      <div class="space-y-2">
        {#each colorFamilies as family}
          {@render hueSlider(family)}
        {/each}
        
        <div class="pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onclick={resetToDefaults}
            class="w-full"
          >
            Restablecer
          </Button>
        </div>
      </div>
    </div>
  </Popover.Content>
</Popover.Root>

{#snippet hueSlider(family: ColorFamily)}
  <div class="hue-control-group">
    <div class="flex justify-between items-center mb-2">
      <Label for="hue-{family.key}" class="text-xs font-medium">{family.label}</Label>
      <span class="text-xs text-muted-foreground">
        {hueValues[family.key]}°
      </span>
    </div>
    
    <Slider 
      type="single"
      bind:value={hueValues[family.key]}
      max={360}
      step={1}
      class="hue-slider"
      style="--slider-color: {getColorPreview(hueValues[family.key])}; --hue-gradient: {getHueGradient()}"
    />
  </div>
{/snippet}

<style>
  /* Target the track element specifically */
  :global(.hue-slider [data-slot="slider-track"]) {
    background: var(--hue-gradient) !important;
    height: 4px !important;
    border-radius: 4px !important;
  }
  
  /* Make the range transparent to show the gradient */
  :global(.hue-slider [data-slot="slider-range"]) {
    background: transparent !important;
  }
  
  /* Style the thumb with the current color */
  :global(.hue-slider [data-slot="slider-thumb"]) {
    background: var(--slider-color) !important;
    border: 3px solid white !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
    width: 20px !important;
    height: 20px !important;
  }

  /* Ensure the slider root has proper positioning */
  :global(.hue-slider[data-slot="slider"]) {
    position: relative !important;
  }
</style>
