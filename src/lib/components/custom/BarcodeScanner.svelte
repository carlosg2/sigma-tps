<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { ScanLine, X, Camera, AlertCircle, Loader2 } from "@lucide/svelte";
    import { Button } from "$lib/components/ui/button";
    import { browser } from '$app/environment';
    import { cn } from "$lib/utils";

    interface Props {
        startDefault?: boolean;
        onscanned?: (barcode: string) => void;
    }

    let { startDefault = false, onscanned }: Props = $props();

    let cameraOverlayEl: HTMLElement | undefined = $state();
    let vidEl: HTMLVideoElement | undefined = $state();
    let mediaStream: MediaStream | undefined = $state();
    let formats = ['code_128', 'code_39', 'code_93', 'codabar', 'data_matrix', 'ean_13', 'ean_8', 'itf', 'pdf417', 'qr_code', 'upc_a', 'upc_e', 'aztec'];
    
    let err = $state('');
    let status = $state('');
    let code = $state('');
    let isOverlayVisible = $state(false);
    let audioElement: HTMLAudioElement | undefined = $state();

    onMount(() => {
        if (startDefault && browser) {
            startCam();
        }
        
        // Inicializar el elemento de audio
        if (browser) {
            audioElement = new Audio('/beep.mp3');
            audioElement.preload = 'auto';
            audioElement.volume = 0.7; // Volumen moderado
        }
    });

    onDestroy(() => {
        if (browser) {
            stopCam();
        }
    });

    async function startCam() {
        if (!browser) return;
        
        // Verificar soporte del navegador
        if (!navigator.mediaDevices?.getUserMedia) {
            err = 'getUserMedia no está soportado en este navegador';
            return;
        }

        if (!('BarcodeDetector' in window)) {
            err = 'BarcodeDetector no está soportado en este navegador. Usa Chrome/Edge para acceder a esta funcionalidad.';
            return;
        }
        
        err = ''; // Limpiar errores previos
        status = 'Iniciando cámara...';
        isOverlayVisible = true;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }, 
                audio: false
            });
            
            mediaStream = stream;
            if (vidEl) {
                vidEl.srcObject = mediaStream;
                // Esperar a que el video esté listo
                vidEl.onloadedmetadata = () => {
                    status = 'Preparando escáner...';
                    const barcodeDetector = new BarcodeDetector({ formats: formats });
                    detectCode(barcodeDetector);
                };
            }
        } catch (error) {
            err = 'Error al acceder a la cámara. Verifica los permisos del navegador.';
            console.error('Error accessing camera:', error);
            isOverlayVisible = false;
        }
    }

    function stopCam() {
        if (!browser) return;
        
        status = 'Cerrando escáner...';
        isOverlayVisible = false;
        
        try {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
                mediaStream = undefined;
            }
            if (vidEl) {
                vidEl.srcObject = null;
            }
        } catch (error) {
            console.log('no video stream to stop', error);
        }
    }

    function playFeedback() {
        // Reproducir sonido
        if (browser && audioElement) {
            try {
                // Reiniciar el audio al principio para permitir reproducciones consecutivas
                audioElement.currentTime = 0;
                const playPromise = audioElement.play();
                
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log('No se pudo reproducir el sonido de beep (probablemente por políticas del navegador):', error);
                    });
                }
            } catch (error) {
                console.log('Error al reproducir sonido:', error);
            }
        }

        // Vibración para dispositivos móviles
        if (browser && 'vibrate' in navigator) {
            try {
                navigator.vibrate([50]);
            } catch (error) {
                console.log('Error al activar vibración:', error);
            }
        }
    }

    function onScan(barcode: string) {
        playFeedback();
        stopCam();
        onscanned?.(barcode);
    }

    function detectCode(barcodeDetector: BarcodeDetector) {
        if (!browser || !vidEl || !isOverlayVisible) return;
        
        if (vidEl.readyState === 4) { // HAVE_ENOUGH_DATA
            status = 'Listo para escanear';
            barcodeDetector.detect(vidEl)
                .then(barcodes => {
                    if (barcodes.length > 0) {
                        status = 'Código detectado!';
                        onScan(barcodes[0].rawValue);
                        return;
                    }
                    // Continuar detectando si no se encontró código
                    if (isOverlayVisible) {
                        setTimeout(() => detectCode(barcodeDetector), 100);
                    }
                })
                .catch(error => {
                    console.log('Detection error:', error);
                    if (isOverlayVisible) {
                        setTimeout(() => detectCode(barcodeDetector), 500);
                    }
                });
        } else {
            status = 'Preparando cámara...';
            if (isOverlayVisible) {
                setTimeout(() => detectCode(barcodeDetector), 100);
            }
        }
    }

</script>

    <!-- Botón de inicio -->
    <Button 
        class="text-primary h-9 p-2" 
        variant="outline" 
        onclick={startCam}
        disabled={isOverlayVisible}
    >
        <ScanLine />
        Escanear código
    </Button>

    <!-- Mensaje de error -->
    {#if err}
        <div class="mt-3 flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle class="size-4 shrink-0" />
            <span>{err}</span>
        </div>
    {/if}

    <!-- Overlay de la cámara -->
    <div 
        bind:this={cameraOverlayEl} 
        class={cn(
            "fixed inset-0 z-100 bg-background/95 backdrop-blur-sm transition-all duration-300",
            isOverlayVisible ? "opacity-100 visible" : "opacity-0 invisible"
        )}
    >
        <!-- Header con controles -->
        <div class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-linear-to-b from-black/80 to-transparent">
            <div class="flex items-center gap-3">
                <div class="flex items-center gap-2 text-white">
                    <Camera class="size-5" />
                    <span class="font-medium">Escáner activo</span>
                </div>
            </div>
            
            <Button 
                variant="ghost" 
                size="icon" 
                onclick={stopCam}
                class="text-white hover:bg-white/20 border-white/20"
            >
                <X class="size-5" />
                <span class="sr-only">Cerrar escáner</span>
            </Button>
        </div>

        <!-- Contenedor del video -->
        <div class="relative w-full h-full overflow-hidden">
            <video 
                bind:this={vidEl} 
                autoplay 
                muted
                playsinline
                class="absolute inset-0 w-full h-full object-cover"
                aria-label="Cámara para escanear códigos de barras"
            >
                <track kind="captions" src="" label="No captions available" />
            </video>
            
            <!-- Overlay de escaneo con marco -->
            <div class="absolute inset-0 flex items-center justify-center p-8 sm:p-12 md:p-16">
                <!-- Sombra exterior con recorte para el marco -->
                <div class="absolute inset-0"></div>
                
                <!-- Marco de escaneo -->
                <div class="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl aspect-square">
                    <!-- Marco principal -->
                    <div class="relative w-full h-full border-2 border-white/30 rounded-md">
                        <!-- Esquinas del marco - escalables -->
                        <div class="absolute -top-1 -left-1 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                        <div class="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                        <div class="absolute -bottom-1 -left-1 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                        <div class="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 border-b-4 border-r-4 border-primary rounded-br-lg"></div>

                        <!-- Línea de escaneo animada - escalable -->
                        <div class="absolute inset-x-2 sm:inset-x-4 md:inset-x-6 top-1/2 h-0.5 opacity-80">
                            <!-- <div class="absolute inset-0 bg-primary animate-pulse"></div> -->
                            <div class="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent animate-ping"></div>
                        </div>
                        
                        <!-- Indicadores laterales - escalables -->
                        <!-- <div class="absolute left-1 sm:left-2 md:left-3 top-1/2 -translate-y-1/2 w-0.5 sm:w-1 md:w-1.5 h-6 sm:h-8 md:h-12 bg-primary/60 rounded-full"></div>
                        <div class="absolute right-1 sm:right-2 md:right-3 top-1/2 -translate-y-1/2 w-0.5 sm:w-1 md:w-1.5 h-6 sm:h-8 md:h-12 bg-primary/60 rounded-full"></div> -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer con estado y controles -->
        <div class="absolute bottom-0 left-0 right-0 z-10 p-6 bg-linear-to-t from-black/80 to-transparent">
            <div class="flex flex-col items-center gap-4">
                <!-- Estado del escáner -->
                <div class="flex items-center gap-2 text-white/90">
                    {#if status.includes('Iniciando') || status.includes('iniciando')}
                        <Loader2 class="size-4 animate-spin" />
                    {:else if status.includes('Escaneando')}
                        <ScanLine class="size-4" />
                    {/if}
                    <span class="text-sm font-medium">{status}</span>
                </div>
                
                <!-- Botón de cierre principal -->
                <Button 
                    onclick={stopCam} 
                    variant="secondary"
                    class="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm"
                >
                    <X class="size-4" />
                    Detener escáner
                </Button>
                
                <!-- Instrucciones -->
                <p class="text-xs text-white/70 text-center max-w-xs">
                    Centra el código dentro del marco para escanearlo automáticamente
                </p>
            </div>
        </div>
    </div>
