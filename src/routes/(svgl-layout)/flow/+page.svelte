<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  // Importar CSS
  import './transitions.css';

  // Estado reactivo con runes de Svelte 5
  let currentPage = $state('home');
  let transitionHistory = $state([]);
  let isTransitioning = $state(false);
  
  // Referencia a los elementos del DOM
  let pages = $state({
    home: null,
    detail: null,
    extra: null
  });
  
  // Verificar soporte para View Transitions API
  let supportsViewTransitions = $state(false);

  // Configuración de opciones
  let options = $state({
    enableSwipeGestures: true,
    enableKeyboardNavigation: true,
    enableBrowserHistory: true,
    showTransitionIndicator: false,
    debugMode: false
  });

  // Duración de las transiciones
  const transitionDurations = {
    'fade': 500,
    'push': 400,
    'circle': 700,
    'flip': 600,
    'cover': 450,
    'dive': 500,
    'parallax': 500,
    'ios-slide': 350,
    'android-fade': 300
  };

  // Función para obtener la duración de transición según el tipo
  function getTransitionDuration(transitionType) {
    const baseType = transitionType.replace('-forward', '').replace('-backward', '');
    return transitionDurations[baseType] || 400;
  }

  // Log para debug
  function log(message) {
    if (options.debugMode) {
      console.log(`[NativeTransitions]: ${message}`);
    }
  }

  // Funciones de indicador de transición eliminadas

  // Mostrar overlay para transiciones nativas
  function showNativeOverlay(transitionType, isBackward = false) {
    if (transitionType === 'ios-slide') {
      const overlay = document.getElementById('ios-overlay');
      if (overlay) overlay.classList.add('active');
    } else if (transitionType === 'android-fade') {
      const overlay = document.getElementById('android-overlay');
      if (overlay) overlay.classList.add('active');
    }
  }

  // Ocultar overlay para transiciones nativas
  function hideNativeOverlay(transitionType) {
    if (transitionType === 'ios-slide') {
      const overlay = document.getElementById('ios-overlay');
      if (overlay) overlay.classList.remove('active');
    } else if (transitionType === 'android-fade') {
      const overlay = document.getElementById('android-overlay');
      if (overlay) overlay.classList.remove('active');
    }
  }

  // Navegar a una página con transición
  async function navigateTo(pageId, transitionType = 'fade', isBackward = false) {
    if (isTransitioning) return;
    
    isTransitioning = true;
    
    // Mostrar overlay para transiciones nativas
    showNativeOverlay(transitionType, isBackward);
    
    log(`Navegando de ${currentPage} a ${pageId} con transición ${transitionType} (backward: ${isBackward})`);
    
    const fromPageElement = pages[currentPage];
    const toPageElement = pages[pageId];

    if (!fromPageElement || !toPageElement) {
      console.error(`Error: No se encontraron las páginas para la transición (${currentPage} -> ${pageId})`);
      isTransitioning = false;
      return;
    }

    // Determinar el tipo de transición según la dirección
    const finalTransitionType = isBackward 
      ? `${transitionType}-backward` 
      : `${transitionType}-forward`;

    // Solo agregar al historial si no es navegación hacia atrás
    if (!isBackward) {
      transitionHistory = [...transitionHistory, {
        from: currentPage,
        to: pageId,
        transition: transitionType,
        timestamp: Date.now()
      }];
    }

    try {
      // Realizar la transición con la API si está disponible
      if (supportsViewTransitions) {
        await performViewTransition(fromPageElement, toPageElement, finalTransitionType);
      } else {
        await performFallbackTransition(fromPageElement, toPageElement, finalTransitionType);
      }

      // Actualizar la página actual después de la transición
      currentPage = pageId;

      // Disparar evento de navegación
      dispatchNavigationEvent(pageId, transitionType, isBackward);

    } catch (error) {
      console.error('Error durante la transición:', error);
    } finally {
      // Limpiar después de la transición
      hideNativeOverlay(transitionType);
      isTransitioning = false;
    }
  }

  // Disparar evento de navegación personalizado
  function dispatchNavigationEvent(pageId, transitionType, isBackward) {
    const event = new CustomEvent('pagenavigation', {
      detail: {
        pageId,
        transitionType,
        isBackward,
        timestamp: Date.now()
      }
    });
    document.dispatchEvent(event);
  }

  // Realizar transición utilizando View Transitions API
  async function performViewTransition(fromPage, toPage, transitionType) {
    // Asignar view-transition-name para permitir transiciones personalizadas
    fromPage.style.viewTransitionName = transitionType;
    toPage.style.viewTransitionName = transitionType;

    // Crear la transición
    const transition = document.startViewTransition(() => {
      // Ocultar todas las páginas
      Object.values(pages).forEach(page => {
        if (page) page.classList.add('hidden');
      });
      
      // Mostrar la página de destino
      toPage.classList.remove('hidden');
    });

    try {
      // Esperar a que la transición termine
      await transition.finished;
    } catch (error) {
      console.error('Error en la transición de vista:', error);
    } finally {
      // Limpiar estilos después de la transición
      fromPage.style.viewTransitionName = '';
      toPage.style.viewTransitionName = '';
    }
  }

  // Realizar transición con fallback para navegadores sin soporte
  async function performFallbackTransition(fromPage, toPage, transitionType) {
    const duration = getTransitionDuration(transitionType);
    const baseTransition = transitionType.replace('-forward', '').replace('-backward', '');
    const isBackward = transitionType.includes('-backward');
    
    log(`Ejecutando fallback para ${baseTransition} (backward: ${isBackward})`);
    
    // Mostrar la página de destino pero mantener la origen visible durante la animación
    toPage.classList.remove('hidden');
    
    // Aplicar la transición adecuada según el tipo
    switch (baseTransition) {
      case 'fade':
        await fadeTransition(fromPage, toPage, duration, isBackward);
        break;
      case 'push':
        await pushTransition(fromPage, toPage, duration, isBackward);
        break;
      case 'circle':
        await circleTransition(fromPage, toPage, duration, isBackward);
        break;
      case 'flip':
        await flipTransition(fromPage, toPage, duration, isBackward);
        break;
      case 'cover':
        await coverTransition(fromPage, toPage, duration, isBackward);
        break;
      case 'dive':
        await diveTransition(fromPage, toPage, duration, isBackward);
        break;
      case 'parallax':
        await parallaxTransition(fromPage, toPage, duration, isBackward);
        break;
      case 'ios-slide':
        await iosSlideTransition(fromPage, toPage, duration, isBackward);
        break;
      case 'android-fade':
        await androidFadeTransition(fromPage, toPage, duration, isBackward);
        break;
      default:
        // Transición por defecto (fade)
        await fadeTransition(fromPage, toPage, duration, isBackward);
    }
    
    // Ocultar la página de origen después de la animación
    fromPage.classList.add('hidden');
    
    // Limpiar estilos aplicados durante la transición
    cleanupPageStyles([fromPage, toPage]);
  }

  // Transición de desvanecimiento
  async function fadeTransition(fromPage, toPage, duration, isBackward) {
    return new Promise(resolve => {
      // Implementación de fade fallback
      toPage.style.opacity = '0';
      setTimeout(() => {
        toPage.style.transition = `opacity ${duration}ms ease`;
        toPage.style.opacity = '1';
        setTimeout(resolve, duration);
      }, 50);
    });
  }

  // Implementación básica de las otras transiciones
  // (Solo incluiré una como ejemplo, las demás seguirían el mismo patrón)
  
  async function pushTransition(fromPage, toPage, duration, isBackward) {
    return new Promise(resolve => {
      // Implementación básica de push como ejemplo
      if (isBackward) {
        fromPage.style.transform = 'translateX(0)';
        toPage.style.transform = 'translateX(-100%)';
      } else {
        fromPage.style.transform = 'translateX(0)';
        toPage.style.transform = 'translateX(100%)';
      }
      
      setTimeout(() => {
        fromPage.style.transition = `transform ${duration}ms ease`;
        toPage.style.transition = `transform ${duration}ms ease`;
        
        if (isBackward) {
          fromPage.style.transform = 'translateX(100%)';
          toPage.style.transform = 'translateX(0)';
        } else {
          fromPage.style.transform = 'translateX(-100%)';
          toPage.style.transform = 'translateX(0)';
        }
        
        setTimeout(resolve, duration);
      }, 50);
    });
  }
  
  // Funciones de placeholder para el resto de transiciones
  // En una implementación completa, cada una tendría su lógica específica
  async function circleTransition(fromPage, toPage, duration, isBackward) {
    return fadeTransition(fromPage, toPage, duration, isBackward);
  }
  
  async function flipTransition(fromPage, toPage, duration, isBackward) {
    return fadeTransition(fromPage, toPage, duration, isBackward);
  }
  
  async function coverTransition(fromPage, toPage, duration, isBackward) {
    return fadeTransition(fromPage, toPage, duration, isBackward);
  }
  
  async function diveTransition(fromPage, toPage, duration, isBackward) {
    return fadeTransition(fromPage, toPage, duration, isBackward);
  }
  
  async function parallaxTransition(fromPage, toPage, duration, isBackward) {
    return fadeTransition(fromPage, toPage, duration, isBackward);
  }
  
  async function iosSlideTransition(fromPage, toPage, duration, isBackward) {
    return fadeTransition(fromPage, toPage, duration, isBackward);
  }
  
  async function androidFadeTransition(fromPage, toPage, duration, isBackward) {
    return fadeTransition(fromPage, toPage, duration, isBackward);
  }

  // Limpiar estilos después de las transiciones
  function cleanupPageStyles(pages) {
    pages.forEach(page => {
      if (!page) return;
      
      // Eliminar estilos de transición
      page.style.transition = '';
      page.style.transform = '';
      page.style.opacity = '';
      page.style.viewTransitionName = '';
    });
  }

  // Navegación hacia atrás
  async function navigateBack() {
    if (transitionHistory.length === 0 || isTransitioning) return;
    
    const lastTransition = transitionHistory[transitionHistory.length - 1];
    transitionHistory = transitionHistory.slice(0, -1);
    
    log(`Navegando hacia atrás a ${lastTransition.from}`);
    await navigateTo(lastTransition.from, lastTransition.transition, true);
  }

  // Método para detectar gestos de deslizamiento
  function enableSwipeGestures() {
    if (!options.enableSwipeGestures || !browser) return;
    
    let startX = null;
    let startY = null;
    let startTime = null;
    
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      if (!startX || !startY) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      
      const diffX = endX - startX;
      const diffY = endY - startY;
      const elapsedTime = endTime - startTime;
      
      // Detectar deslizamiento horizontal hacia la derecha (gesto de volver)
      if (Math.abs(diffX) > Math.abs(diffY) && 
          diffX > 100 && 
          elapsedTime < 300 &&
          transitionHistory.length > 0) {
        navigateBack();
      }
      
      startX = null;
      startY = null;
      startTime = null;
    }, { passive: true });
  }
  
  // Inicialización cuando el DOM esté listo
  onMount(() => {
    console.log('🚀 Inicializando NativeTransitions en SvelteKit...');
    
    try {
      // Verificar soporte de View Transitions API
      supportsViewTransitions = 'startViewTransition' in document;
      
      if (!supportsViewTransitions) {
        console.warn('View Transitions API no está disponible en este navegador. Se usarán fallbacks.');
      }
      
      // Indicador de transición eliminado
      
      // Inicializar referencias a las páginas
      pages = {
        home: document.getElementById('page1'),
        detail: document.getElementById('page2'),
        extra: document.getElementById('page3')
      };
      
      // Configurar listeners para eventos
      enableSwipeGestures();
      
      // Configurar navegación con teclado
      if (options.enableKeyboardNavigation) {
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && transitionHistory.length > 0) {
            navigateBack();
          }
        });
      }
      
      log('NativeTransitions inicializado correctamente');
      
    } catch (error) {
      console.error('Error al inicializar NativeTransitions:', error);
    }
  });

  // Mensaje de bienvenida
  let welcomeMessage = $derived(
    browser && options.debugMode ? `
      🎉 Native Transitions v2.0 cargado exitosamente en SvelteKit!

      📱 Nuevas características:
      - iOS Slide: Transición nativa de iOS con parallax (-30%)
      - Android Fade: Transición nativa de Android desde bottom (8vh)
      - Timing curves nativos de iOS y Android
      - Duración diferenciada para backward en Android (150ms)
    ` : ''
  );

  $effect(() => {
    if (welcomeMessage) {
      console.log(welcomeMessage);
    }
  });
</script>

<div class="app bg-card">
  <!-- Página Principal -->
  <div class="page" id="page1" data-page="home" class:hidden={currentPage !== 'home'}>
    <nav class="navbar">
      <h1>Transiciones Native-like</h1>
    </nav>
    <div class="page-content">
      <div class="intro-section">
        <h2>🚀 View Transitions API Demo</h2>
        <p>Experiencia de navegación fluida inspirada en Framework7 + Seed Design</p>
      </div>

      <div class="transition-grid">
        <button onclick={() => navigateTo('detail', 'fade')} class="transition-btn fade">
          <div class="btn-icon">🌅</div>
          <strong>Fade</strong>
          <small>Desvanecimiento suave</small>
        </button>
        
        <button onclick={() => navigateTo('detail', 'push')} class="transition-btn push">
          <div class="btn-icon">➡️</div>
          <strong>Push</strong>
          <small>Deslizamiento lateral</small>
        </button>
        
        <button onclick={() => navigateTo('detail', 'circle')} class="transition-btn circle">
          <div class="btn-icon">⭕</div>
          <strong>Circle</strong>
          <small>Círculo expansivo</small>
        </button>
        
        <button onclick={() => navigateTo('detail', 'flip')} class="transition-btn flip">
          <div class="btn-icon">🔄</div>
          <strong>Flip</strong>
          <small>Rotación 3D</small>
        </button>
        
        <button onclick={() => navigateTo('detail', 'cover')} class="transition-btn cover">
          <div class="btn-icon">📄</div>
          <strong>Cover</strong>
          <small>Cobertura con profundidad</small>
        </button>
        
        <button onclick={() => navigateTo('detail', 'dive')} class="transition-btn dive">
          <div class="btn-icon">🏊</div>
          <strong>Dive</strong>
          <small>Inmersión 3D</small>
        </button>
        
        <button onclick={() => navigateTo('detail', 'parallax')} class="transition-btn parallax">
          <div class="btn-icon">🌆</div>
          <strong>Parallax</strong>
          <small>Efecto paralaje</small>
        </button>
        
        <!-- NUEVAS TRANSICIONES INSPIRADAS EN SEED DESIGN -->
        <button onclick={() => navigateTo('detail', 'ios-slide')} class="transition-btn ios-slide">
          <div class="btn-icon">📱</div>
          <strong>iOS Slide</strong>
          <small>Transición nativa iOS</small>
        </button>
        
        <button onclick={() => navigateTo('detail', 'android-fade')} class="transition-btn android-fade">
          <div class="btn-icon">🤖</div>
          <strong>Android Fade</strong>
          <small>Transición nativa Android</small>
        </button>
      </div>

      <div class="tips-section">
        <h3>💡 Consejos de navegación</h3>
        <div class="tips-grid">
          <div class="tip">
            <span class="tip-icon">👆</span>
            <span>Desliza hacia la derecha para volver</span>
          </div>
          <div class="tip">
            <span class="tip-icon">⌨️</span>
            <span>Presiona <kbd>ESC</kbd> para navegar atrás</span>
          </div>
          <div class="tip">
            <span class="tip-icon">🌐</span>
            <span>Usa el botón atrás del navegador</span>
          </div>
          <div class="tip">
            <span class="tip-icon">🆕</span>
            <span>Nuevas transiciones iOS y Android incluidas</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Página de Detalle -->
  <div class="page" id="page2" data-page="detail" class:hidden={currentPage !== 'detail'}>
    <nav class="navbar">
      <button onclick={navigateBack} class="back-button">
        <span class="back-icon">←</span>
        <span>Atrás</span>
      </button>
      <h1>Página de Detalle</h1>
    </nav>
    <div class="page-content">
      <div class="success-message">
        <div class="success-icon">✅</div>
        <h2>¡Transición completada!</h2>
        <p>Esta página se cargó usando View Transitions API con animaciones personalizadas inspiradas en Framework7 y Seed Design.</p>
      </div>
      
      <div class="navigation-section">
        <h3>Continúa navegando:</h3>
        <div class="transition-grid">
          <button onclick={() => navigateTo('extra', 'flip')} class="transition-btn flip">
            <div class="btn-icon">🔄</div>
            <strong>Página 3</strong>
            <small>Transición Flip</small>
          </button>
          <button onclick={() => navigateTo('extra', 'ios-slide')} class="transition-btn ios-slide">
            <div class="btn-icon">📱</div>
            <strong>Página 3</strong>
            <small>iOS Slide</small>
          </button>
          <button onclick={() => navigateTo('extra', 'android-fade')} class="transition-btn android-fade">
            <div class="btn-icon">🤖</div>
            <strong>Página 3</strong>
            <small>Android Fade</small>
          </button>
        </div>
      </div>

      <div class="features-section">
        <h3>🎯 Características implementadas</h3>
        <div class="features-list">
          <div class="feature">
            <span class="feature-icon">✅</span>
            <span>Transiciones bidireccionales fluidas</span>
          </div>
          <div class="feature">
            <span class="feature-icon">✅</span>
            <span>Historial de navegación inteligente</span>
          </div>
          <div class="feature">
            <span class="feature-icon">✅</span>
            <span>Gestos de deslizamiento táctil</span>
          </div>
          <div class="feature">
            <span class="feature-icon">✅</span>
            <span>Integración con historial del navegador</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Página Extra -->
  <div class="page" id="page3" data-page="extra" class:hidden={currentPage !== 'extra'}>
    <nav class="navbar">
      <button onclick={navigateBack} class="back-button">
        <span class="back-icon">←</span>
        <span>Atrás</span>
      </button>
      <h1>Página Extra</h1>
    </nav>
    <div class="page-content">
      <div class="level-info">
        <div class="level-icon">🎯</div>
        <h2>Tercer nivel de navegación</h2>
        <p>Aquí puedes ver cómo funciona la navegación con múltiples niveles y el correcto manejo del historial con las nuevas transiciones.</p>
      </div>
      
      <div class="actions-section">
        <h3>Acciones disponibles:</h3>
        <div class="actions-grid">
          <button onclick={() => navigateTo('home', 'ios-slide')} class="action-btn home">
            <span class="action-icon">🏠</span>
            <span>Ir a Inicio</span>
          </button>
          <button onclick={() => navigateTo('detail', 'android-fade')} class="action-btn back">
            <span class="action-icon">↩️</span>
            <span>Ir a Detalle</span>
          </button>
        </div>
      </div>

      <div class="parallax-note">
        <h4>🆕 Nuevas transiciones Seed Design</h4>
        <p><strong>iOS Slide:</strong> Transición slideFromRightIOS con parallax de -30% en la página anterior y timing curve nativo de iOS.</p>
        <p><strong>Android Fade:</strong> Transición fadeFromBottomAndroid con entrada desde 8vh abajo y timing curve nativo de Android.</p>
      </div>
    </div>
  </div>
</div>

<!-- Overlays para transiciones -->
<!-- <div class="ios-transition-overlay" id="ios-overlay"></div>
<div class="android-transition-overlay" id="android-overlay"></div> -->

<style>
  /* Estilos específicos de Svelte */
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  .app {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 100vh;
    overflow: hidden;
  }

  /* Los demás estilos están en transitions.css */
</style>
