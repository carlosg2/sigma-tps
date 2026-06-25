<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { parseDate, getLocalTimeZone } from '@internationalized/date';
  import { server } from '$lib/siteConfig';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Separator } from '$lib/components/ui/separator';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { 
    Download, 
    Printer,
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Clock, 
    Shield, 
    Users, 
    Car,
    CheckCircle,
    FileText,
    Share,
    ArrowLeft,
    Building,
    CreditCard,
    AlertCircle,
    Star
  } from 'lucide-svelte';

  // Estado para los datos de la reserva
  let bookingData = $state(null);
  let quotationData = $state(null);

  // Estados de la UI
  let isDownloading = $state(false);
  let isPrinting = $state(false);
  let isSharing = $state(false);
  let isSendingToERP = $state(false);

  // Función para cargar modern-screenshot dinámicamente
  async function loadModernScreenshot() {
    if (typeof window !== 'undefined') {
      // Si ya está cargado, devolverlo
      if ((window as any).modernScreenshot) {
        return (window as any).modernScreenshot;
      }
      
      // Cargar dinámicamente via CDN
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/modern-screenshot@4.6.6/dist/index.umd.js';
        script.onload = () => {
          // modern-screenshot se monta en window.ModernScreenshot
          (window as any).modernScreenshot = (window as any).ModernScreenshot;
          resolve((window as any).modernScreenshot);
        };
        script.onerror = (error) => {
          reject(new Error('No se pudo cargar modern-screenshot desde CDN'));
        };
        document.head.appendChild(script);
      });
    }
    throw new Error('Window no disponible');
  }

  // Función alternativa para cargar dom-to-image como fallback
  async function loadDomToImage() {
    if (typeof window !== 'undefined') {
      // Si ya está cargado, devolverlo
      if ((window as any).domtoimage) {
        return (window as any).domtoimage;
      }
      
      // Cargar dinámicamente via CDN
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/dom-to-image@2.6.0/dist/dom-to-image.min.js';
        script.onload = () => {
          // dom-to-image se monta en window.domtoimage
          resolve((window as any).domtoimage);
        };
        script.onerror = (error) => {
          reject(new Error('No se pudo cargar dom-to-image desde CDN'));
        };
        document.head.appendChild(script);
      });
    }
    throw new Error('Window no disponible');
  }

  // Función robusta para capturar imagen usando múltiples estrategias
  async function captureQuotationImage() {
    const quotationContainer = document.querySelector('.quotation-container') as HTMLElement;
    if (!quotationContainer) {
      throw new Error('No se encontró el contenedor de la cotización');
    }

    // Preparar el contenedor original para la captura
    const originalStyle = {
      maxWidth: quotationContainer.style.maxWidth,
      margin: quotationContainer.style.margin,
      padding: quotationContainer.style.padding,
      width: quotationContainer.style.width
    };

    try {
      // Aplicar estilos temporales al contenedor original para mejor captura
      quotationContainer.style.maxWidth = '800px';
      quotationContainer.style.margin = '0';
      quotationContainer.style.padding = '20px';
      quotationContainer.style.width = '800px';
      quotationContainer.style.backgroundColor = '#ffffff';
      quotationContainer.style.boxSizing = 'border-box';

      // Dar tiempo para que los estilos se apliquen
      await new Promise(resolve => setTimeout(resolve, 100));

      // Estrategia 1: Intentar con modern-screenshot
      try {
        const modernScreenshot = await loadModernScreenshot();
        
        const dataUrl = await modernScreenshot.domToPng(quotationContainer, {
          backgroundColor: '#ffffff',
          width: 800,
          scale: 1.5,
          quality: 0.95,
          filter: (node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              return !element.classList.contains('sr-only') && 
                     element.tagName !== 'SCRIPT' &&
                     element.tagName !== 'STYLE';
            }
            return true;
          },
          style: {
            'font-family': 'system-ui, -apple-system, sans-serif',
            'color': '#000000',
            'background-color': '#ffffff'
          }
        });
        
        return dataUrl;
      } catch (error) {
        console.warn('modern-screenshot falló:', error);
      }

      // Estrategia 2: Intentar con dom-to-image
      try {
        const domtoimage = await loadDomToImage();
        
        const dataUrl = await domtoimage.toPng(quotationContainer, {
          bgcolor: '#ffffff',
          width: 800,
          quality: 0.95,
          style: {
            'font-family': 'system-ui, -apple-system, sans-serif',
            'background-color': '#ffffff'
          },
          filter: (node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              return !element.classList.contains('sr-only') && 
                     element.tagName !== 'SCRIPT' &&
                     element.tagName !== 'STYLE';
            }
            return true;
          }
        });
        
        return dataUrl;
      } catch (error) {
        console.warn('dom-to-image falló:', error);
      }

      // Estrategia 3: HTML2Canvas como alternativa confiable
      try {
        // Cargar html2canvas dinámicamente
        if (!(window as any).html2canvas) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        const html2canvas = (window as any).html2canvas;
        const canvas = await html2canvas(quotationContainer, {
          backgroundColor: '#ffffff',
          width: 800,
          height: quotationContainer.scrollHeight,
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: false,
          removeContainer: false
        });
        
        return canvas.toDataURL('image/png', 0.95);
      } catch (error) {
        console.warn('html2canvas falló:', error);
      }

      // Estrategia 4: Fallback usando Canvas API nativo
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) throw new Error('No se pudo crear contexto 2D');
        
        // Configurar canvas con dimensiones adecuadas
        canvas.width = 800 * 2; // Doble resolución
        canvas.height = Math.max(quotationContainer.scrollHeight, 600) * 2;
        
        // Configurar estilos
        ctx.scale(2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, Math.max(quotationContainer.scrollHeight, 600));
        
        // Crear representación del contenido
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
        ctx.fillText('Cotización TPS Armoring', 20, 40);
        
        ctx.fillStyle = '#000000';
        ctx.font = '16px system-ui, -apple-system, sans-serif';
        
        // Extraer y renderizar texto del contenedor
        const textContent = quotationContainer.textContent || '';
        const lines = textContent.split('\n').filter(line => line.trim());
        
        let y = 80;
        lines.forEach((line, index) => {
          if (index < 40 && y < canvas.height/2 - 50) {
            const cleanLine = line.trim().substring(0, 70);
            if (cleanLine) {
              ctx.fillText(cleanLine, 20, y);
              y += 22;
            }
          }
        });
        
        // Información adicional
        ctx.fillStyle = '#666666';
        ctx.font = '12px system-ui, -apple-system, sans-serif';
        ctx.fillText(`Generado el ${new Date().toLocaleDateString('es-ES')}`, 20, y + 30);
        ctx.fillText('TPS Armoring - Blindaje Táctico', 20, y + 50);
        
        return canvas.toDataURL('image/png', 0.95);
      } catch (error) {
        console.warn('Canvas API nativo falló:', error);
      }

      throw new Error('Todas las estrategias de captura de imagen fallaron');
      
    } finally {
      // Restaurar estilos originales
      quotationContainer.style.maxWidth = originalStyle.maxWidth;
      quotationContainer.style.margin = originalStyle.margin;
      quotationContainer.style.padding = originalStyle.padding;
      quotationContainer.style.width = originalStyle.width;
    }
  }

  function generateQuotationId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `COT-${year}${month}${day}-${random}`;
  }

  function generateBookingId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `AR-${year}${month}${day}-${random}`;
  }

  function processBookingData(booking: any) {
    if (!booking) {
      console.error('❌ processBookingData: booking es null o undefined');
      return null;
    }

    // DEBUG: Verificar datos del vehículo
    console.log('🔍 DEBUG - booking.vehicle completo:', booking.vehicle);
    console.log('🔍 DEBUG - booking.vehicle.articulo:', booking.vehicle.articulo);
    console.log('🔍 DEBUG - booking.vehicle.Articulo:', booking.vehicle.Articulo);
    console.log('🔍 DEBUG - RESULTADO articulo final:', booking.vehicle.articulo || booking.vehicle.Articulo || 'VH-001');

    // Convertir fechas desde string si es necesario
    let startDateObj, endDateObj;
    try {
      if (typeof booking.dates.startDate === 'string') {
        const startDateValue = parseDate(booking.dates.startDate);
        startDateObj = startDateValue.toDate(getLocalTimeZone());
      } else {
        startDateObj = booking.dates.startDate;
      }

      if (typeof booking.dates.endDate === 'string') {
        const endDateValue = parseDate(booking.dates.endDate);
        endDateObj = endDateValue.toDate(getLocalTimeZone());
      } else {
        endDateObj = booking.dates.endDate;
      }
    } catch (error) {
      console.error('Error parsing dates:', error);
      startDateObj = new Date();
      endDateObj = new Date();
    }

    // Calcular servicios incluidos - adaptado a nuestra estructura
    const services = [];
    
    // Agregar servicios de escoltas dinámicos
    if (booking.services?.escoltas && Array.isArray(booking.services.escoltas)) {
      booking.services.escoltas.forEach(escolta => {
        services.push({
          articulo: escolta.Articulo || escolta.ID || 'ESC001',
          name: escolta.Servicio,
          description: `Servicio de escolta: ${escolta.Servicio}`,
          dailyRate: escolta.PrecioLista,
          quantity: booking.pricing.totalDays,
          total: escolta.PrecioLista * booking.pricing.totalDays
        });
      });
    }

    // Agregar servicios de choferes dinámicos
    if (booking.services?.choferes && Array.isArray(booking.services.choferes)) {
      booking.services.choferes.forEach(chofer => {
        services.push({
          articulo: chofer.Articulo || chofer.ID || 'CHF001',
          name: chofer.Servicio,
          description: `Servicio de chofer: ${chofer.Servicio}`,
          dailyRate: chofer.PrecioLista,
          quantity: booking.pricing.totalDays,
          total: chofer.PrecioLista * booking.pricing.totalDays
        });
      });
    }

    // Mantener compatibilidad con la estructura antigua si existe
    if (booking.services?.driver) {
      services.push({
        name: 'Conductor Especializado Premium',
        description: 'Conductor profesional con formación en seguridad ejecutiva',
        dailyRate: 3000,
        quantity: booking.pricing.totalDays,
        total: 3000 * booking.pricing.totalDays
      });
    }
    if (booking.services?.security) {
      services.push({
        name: 'Escolta de Seguridad',
        description: 'Servicio de escolta profesional para mayor protección',
        dailyRate: 4000,
        quantity: booking.pricing.totalDays,
        total: 4000 * booking.pricing.totalDays
      });
    }
    if (booking.services?.insurance) {
      services.push({
        name: 'Seguro Premium',
        description: 'Cobertura completa para el vehículo y ocupantes',
        dailyRate: 1000,
        quantity: booking.pricing.totalDays,
        total: 1000 * booking.pricing.totalDays
      });
    }
    if (booking.services?.gps) {
      services.push({
        name: 'GPS Avanzado',
        description: 'Sistema de localización y navegación de alta precisión',
        dailyRate: 500,
        quantity: booking.pricing.totalDays,
        total: 500 * booking.pricing.totalDays
      });
    }

    const subtotal = booking.pricing?.totalPrice || 0;
    const discount = 0; // Aplicar descuentos si es necesario
    const taxRate = 0.15; // IVA México
    const tax = Math.round((subtotal - discount) * taxRate);
    const total = subtotal - discount + tax;
    const deposit = 40000; // Depósito estándar
    const finalPayment = total - deposit;

    const result = {
      quotationNumber: generateQuotationId(),
      bookingId: generateBookingId(),
      issueDate: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      
      company: {
        name: 'TPS Armoring',
        slogan: 'Tecnología táctica, blindaje extremo. La unidad que redefine la protección en cada misión.',
        address: 'Av. Paseo de la Reforma 250, Col. Juárez, 06600 Ciudad de México, México',
        phone: '+52 55 1234 5678',
        email: 'info@tpsarmoring.mx',
        website: 'www.tpsarmoring.mx',
        taxId: 'TPS123456789',
        license: 'Licencia Federal de Transporte: SCT-2024-001'
      },
      
      customer: {
        firstName: booking.customer.firstName || 'Cliente',
        lastName: booking.customer.lastName || '',
        email: booking.customer.email || '',
        phone: booking.customer.phone || '',
        company: booking.customer.company || '',
        address: 'Ciudad de México, México', // Se podría agregar al formulario
        taxId: booking.customer.idNumber || ''
      },
      
      vehicle: {
        name: booking.vehicle.name || 'Vehículo Blindado',
        model: `${booking.vehicle.name} ${booking.vehicle.model || ''}`.trim(),
        year: booking.vehicle.model || '2024',
        armorLevel: booking.vehicle.armorLevel || 'B6',
        capacity: booking.vehicle.capacity || 4,
        vin: booking.vehicle.vin || booking.vehicle.VIN || '',
        articulo: booking.vehicle.articulo || booking.vehicle.Articulo || 'VH-001',
        features: [
          `Blindaje certificado ${booking.vehicle.armorLevel || 'B6'}`,
          'Cristales antibalas',
          'Neumáticos run-flat',
          'Sistema de comunicaciones'
        ],
        dailyRate: booking.vehicle.price || 0
      },
      
      rental: {
        startDate: startDateObj,
        endDate: endDateObj,
        startTime: booking.dates.startTime || '09:00',
        endTime: booking.dates.endTime || '18:00',
        totalDays: booking.pricing.totalDays || 1,
        pickupLocation: booking.locations.pickupLocation || 'Por definir',
        dropoffLocation: booking.locations.dropoffLocation || booking.locations.pickupLocation || 'Por definir'
      },
      
      services,
      
      pricing: {
        subtotal,
        discount,
        taxRate,
        tax,
        total,
        deposit,
        finalPayment
      },
      
      terms: [
        'Esta cotización es válida por 7 días desde la fecha de emisión.',
        'Se requiere un depósito de seguridad de $40,000 que será reembolsado tras la devolución del vehículo en perfectas condiciones.',
        'El conductor principal debe tener al menos 25 años y 3 años de experiencia de conducción.',
        'Se requiere licencia de conducir válida y documento de identidad en vigor.',
        'Cancelaciones con más de 48 horas de anticipación: reembolso del 100%.',
        'Cancelaciones entre 24-48 horas: reembolso del 50%.',
        'Cancelaciones con menos de 24 horas: sin reembolso.',
        'El vehículo debe ser devuelto con el mismo nivel de combustible.',
        'Cualquier daño al vehículo será evaluado y facturado por separado.',
        'Los precios incluyen IVA (15%) según la legislación mexicana vigente.'
      ]
    };
    
    return result;
  }

  onMount(() => {
    // Cargar datos de la reserva desde localStorage
    try {
      const storedBookingData = localStorage.getItem('bookingData');
      
      if (storedBookingData) {
        const parsedData = JSON.parse(storedBookingData);
        bookingData = parsedData;
        quotationData = processBookingData(bookingData);
      } else {
        // Si no hay datos, redirigir de vuelta a vehículos
        alert('No se encontraron datos de la reserva. Serás redirigido a la página de vehículos.');
        setTimeout(() => {
          goto('/renta/vehiculos');
        }, 2000);
      }
    } catch (error) {
      console.error('Error loading booking data:', error);
      alert('Error al cargar los datos de la reserva. Serás redirigido a la página de vehículos.');
      setTimeout(() => {
        goto('/renta/vehiculos');
      }, 2000);
    }
  });

  function formatDate(date: Date) {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  async function downloadPDF() {
    isDownloading = true;
    
    // Crear un mensaje informativo para el usuario
    const userConfirmed = confirm(
      'Se abrirá el diálogo de impresión. Por favor:\n\n' +
      '1. Selecciona "Guardar como PDF" como destino\n' +
      '2. Configura el formato de página según necesites\n' +
      '3. Haz clic en "Guardar"\n\n' +
      '¿Continuar?'
    );
    
    if (userConfirmed) {
      // Esperar un poco para que el usuario lea el mensaje
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Usar la funcionalidad nativa de impresión del navegador
      // que permite guardar como PDF
      window.print();
    }
    
    isDownloading = false;
  }

  function printQuotation() {
    isPrinting = true;
    setTimeout(() => {
      window.print();
      isPrinting = false;
    }, 500);
  }

  async function shareQuotation() {
    if (!quotationData) return;
    
    isSharing = true;
    
    try {
      // Usar la nueva función robusta de captura
      const dataUrl = await captureQuotationImage();
      
      // Convertir dataUrl a blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Crear archivo con nombre descriptivo
      const fileName = `Cotizacion_${quotationData.quotationNumber}_${new Date().toISOString().split('T')[0]}.png`;
      
      // Verificar si el navegador soporta Web Share API con archivos
      const canShareFiles = navigator.share && navigator.canShare && 
                           navigator.canShare({ files: [new File([blob], fileName, { type: 'image/png' })] });
      
      if (canShareFiles) {
        const file = new File([blob], fileName, { type: 'image/png' });
        
        await navigator.share({
          title: `Cotización ${quotationData.quotationNumber}`,
          text: `Cotización de renta de vehículo - ${quotationData.vehicle?.name || 'Vehículo Blindado'}`,
          files: [file]
        });
      } else {
        // Fallback: mostrar modal con opciones de compartir y descarga
        showShareModal(blob, dataUrl);
      }
      
    } catch (error) {
      console.error('Error al compartir:', error);
      
      // Mensaje más amigable al usuario
      const errorMessage = error.message?.includes('imagen') 
        ? 'No se pudo generar la imagen de la cotización' 
        : 'Error al procesar la cotización';
        
      const userChoice = confirm(
        `${errorMessage}.\n\n¿Desea compartir la cotización sin imagen?\n\n` +
        'Sí: Mostrar opciones de compartir texto/enlace\n' +
        'No: Cancelar'
      );
      
      if (userChoice) {
        showSimpleShareModal();
      }
    } finally {
      isSharing = false;
    }
  }

  async function showSimpleShareModal() {
    return new Promise((resolve) => {
      // Crear modal HTML simplificado
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
      `;

      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      `;

      modalContent.innerHTML = `
        <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
          Compartir Cotización
        </h3>
        <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">
          Comparte tu cotización usando estos métodos:
        </p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button id="shareEmail" style="
            background: #10b981;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          ">
            📧 Enviar por email
          </button>
          <button id="copyLink" style="
            background: #8b5cf6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          ">
            🔗 Copiar enlace
          </button>
          <button id="shareWhatsApp" style="
            background: #25d366;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          ">
            💬 Compartir en WhatsApp
          </button>
          <button id="closeModal" style="
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          ">
            Cancelar
          </button>
        </div>
      `;

      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      function closeModal() {
        document.body.removeChild(modal);
        resolve(null);
      }

      // Event listeners
      modal.querySelector('#shareEmail')?.addEventListener('click', () => {
        const subject = encodeURIComponent(`Cotización TPS Armoring - ${quotationData.quotationNumber}`);
        const body = encodeURIComponent(
          `Estimado/a,\n\n` +
          `Le comparto la cotización para el alquiler de vehículo blindado.\n\n` +
          `Detalles:\n` +
          `• Número: ${quotationData.quotationNumber}\n` +
          `• Cliente: ${quotationData.customer.firstName} ${quotationData.customer.lastName}\n` +
          `• Vehículo: ${quotationData.vehicle?.year || '2024'} ${quotationData.vehicle?.name || 'Vehículo Blindado'} ${quotationData.vehicle?.model || ''}\n` +
          `• Total: $${quotationData.pricing.total.toLocaleString()}\n\n` +
          `Ver cotización completa: ${window.location.href}\n\n` +
          `Saludos cordiales,\nEquipo TPS Armoring`
        );
        window.open(`mailto:?subject=${subject}&body=${body}`);
        closeModal();
      });

      modal.querySelector('#copyLink')?.addEventListener('click', async () => {
        try {
          await copyToClipboard(window.location.href);
          alert('Enlace copiado al portapapeles');
        } catch (error) {
          alert('Error al copiar el enlace');
        }
        closeModal();
      });

      modal.querySelector('#shareWhatsApp')?.addEventListener('click', () => {
        const text = encodeURIComponent(
          `🚗 Cotización TPS Armoring - ${quotationData.quotationNumber}\n\n` +
          `Cliente: ${quotationData.customer.firstName} ${quotationData.customer.lastName}\n` +
          `Total: $${quotationData.pricing.total.toLocaleString()}\n\n` +
          `Ver cotización: ${window.location.href}`
        );
        window.open(`https://wa.me/?text=${text}`);
        closeModal();
      });

      modal.querySelector('#closeModal')?.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    });
  }

  async function showShareModal(blob: Blob, dataURL: string) {
    return new Promise((resolve) => {
      // Crear URLs para descarga
      const imageUrl = URL.createObjectURL(blob);
      
      // Crear modal HTML
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
      `;

      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      `;

      modalContent.innerHTML = `
        <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
          Compartir Cotización
        </h3>
        <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">
          Elige cómo deseas compartir tu cotización:
        </p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button id="downloadImage" style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          ">
            📥 Descargar imagen
          </button>
          <button id="shareEmail" style="
            background: #10b981;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          ">
            📧 Enviar por email
          </button>
          <button id="copyLink" style="
            background: #8b5cf6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          ">
            🔗 Copiar enlace
          </button>
          <button id="shareWhatsApp" style="
            background: #25d366;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          ">
            💬 Compartir en WhatsApp
          </button>
          <button id="closeModal" style="
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          ">
            Cancelar
          </button>
        </div>
      `;

      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      // Event listeners para las opciones
      const downloadBtn = modal.querySelector('#downloadImage');
      const emailBtn = modal.querySelector('#shareEmail');
      const copyBtn = modal.querySelector('#copyLink');
      const whatsappBtn = modal.querySelector('#shareWhatsApp');
      const closeBtn = modal.querySelector('#closeModal');

      function closeModal() {
        document.body.removeChild(modal);
        URL.revokeObjectURL(imageUrl);
        resolve(null);
      }

      // Descargar imagen
      downloadBtn?.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `cotizacion-${quotationData.quotationNumber}.png`;
        a.click();
        closeModal();
      });

      // Compartir por email con imagen como adjunto usando mailto
      emailBtn?.addEventListener('click', () => {
        const subject = encodeURIComponent(`Cotización TPS Armoring - ${quotationData.quotationNumber}`);
        const body = encodeURIComponent(
          `Estimado/a,\n\n` +
          `Adjunto encontrará la cotización para el alquiler de vehículo blindado.\n\n` +
          `Detalles de la cotización:\n` +
          `• Número: ${quotationData.quotationNumber}\n` +
          `• Cliente: ${quotationData.customer.firstName} ${quotationData.customer.lastName}\n` +
          `• Vehículo: ${quotationData.vehicle?.year || '2024'} ${quotationData.vehicle?.name || 'Vehículo Blindado'} ${quotationData.vehicle?.model || ''}\n` +
          `• Período: ${formatDate(quotationData.rental.startDate)} a ${formatDate(quotationData.rental.endDate)}\n` +
          `• Total: $${quotationData.pricing.total.toLocaleString()}\n\n` +
          `Para ver la cotización completa, visite: ${window.location.href}\n\n` +
          `NOTA: La imagen de la cotización se descargará automáticamente. Por favor adjúntela a este email.\n\n` +
          `Saludos cordiales,\nEquipo TPS Armoring`
        );
        
        // Abrir cliente de email
        window.open(`mailto:?subject=${subject}&body=${body}`);
        
        // Descargar imagen automáticamente para que el usuario la adjunte
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `cotizacion-${quotationData.quotationNumber}.png`;
        a.click();
        
        closeModal();
      });

      // Copiar enlace
      copyBtn?.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          copyBtn.textContent = '✅ Enlace copiado!';
          setTimeout(() => {
            copyBtn.innerHTML = '🔗 Copiar enlace';
          }, 2000);
        } catch (error) {
          alert('Error al copiar el enlace');
        }
      });

      // Compartir en WhatsApp
      whatsappBtn?.addEventListener('click', () => {
        const text = encodeURIComponent(
          `🚗 Cotización TPS Armoring - ${quotationData.quotationNumber}\n\n` +
          `Cliente: ${quotationData.customer.firstName} ${quotationData.customer.lastName}\n` +
          `Vehículo: ${quotationData.vehicle?.year || '2024'} ${quotationData.vehicle?.name || 'Vehículo Blindado'} ${quotationData.vehicle?.model || ''}\n` +
          `Total: $${quotationData.pricing.total.toLocaleString()}\n\n` +
          `Ver cotización completa: ${window.location.href}`
        );
        window.open(`https://wa.me/?text=${text}`);
        closeModal();
      });

      // Cerrar modal
      closeBtn?.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    });
  }

  async function copyToClipboard(text: string) {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback para navegadores más antiguos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  async function sendToERP() {
    if (!quotationData) {
      alert('No hay datos de cotización para enviar');
      return;
    }

    isSendingToERP = true;

    try {
      // Preparar los datos JSON según el formato requerido
      const jsonData = [];

      // Agregar el vehículo principal
      jsonData.push({
        Articulo: quotationData.vehicle.articulo || 'VH-001',
        Precio: quotationData.vehicle.dailyRate,
        Cantidad: quotationData.rental.totalDays,
        VIN: quotationData.vehicle.vin || ''
      });

      // Agregar los servicios adicionales
      quotationData.services.forEach(service => {
        jsonData.push({
          Articulo: service.articulo || 'SRV-001',
          Precio: service.dailyRate,
          Cantidad: service.quantity,
          VIN: ''
        });
      });

      // Formatear fechas para el SP
      const fechaRentaD = quotationData.rental.startDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit', 
        year: 'numeric'
      });
      
      const fechaRentaA = quotationData.rental.endDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });

      console.log('📤 Enviando al ERP:', {
        Usuario: 'INT',
        Cliente: 'C01446', // TODO: Obtener del cliente real
        FehaRentaD: fechaRentaD,
        FehaRentaA: fechaRentaA,
        json: JSON.stringify(jsonData)
      });

      const response = await fetch(
        server.api + 'sp/spVentaEnvioCotizacion',
        {
          method: 'POST',
          body: JSON.stringify({
            Usuario: 'INT',
            Cliente: 'C01446', // TODO: Obtener del cliente real
            FehaRentaD: fechaRentaD,
            FehaRentaA: fechaRentaA,
            Referencia: quotationData.quotationNumber, // aqui debe ir la cotizacion ej: #COT-20250902-5467 de quotationData.quotationNumber
            json: JSON.stringify(jsonData)
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Ik1BU0VSUCIsIm5iZiI6MTY5NjcwNjQ4MSwiZXhwIjoxNzg2NzA2NDgxLCJpYXQiOjE2OTY3MDY0ODEsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.qQQ1Dm1qyW0wEj2TY3Sw_i-ZnrUWKIL3AMHzoTNFlFQ'
          }
        }
      );

      const data = await response.json();
      console.log('📥 Respuesta del ERP:', data);

      if (data[0]?.Ok === null || data[0]?.Ok === undefined) {
        alert('✅ Cotización enviada exitosamente al ERP');
        console.log('✅ Cotización enviada correctamente:', data);
      } else {
        alert('❌ Error al enviar al ERP: ' + (data[0]?.OkRef || 'Error desconocido'));
        console.error('❌ Error del ERP:', data[0]?.OkRef);
      }

    } catch (error) {
      console.error('❌ Error al enviar cotización al ERP:', error);
      alert('❌ Error de conexión al enviar la cotización al ERP. Revise la consola para más detalles.');
    } finally {
      isSendingToERP = false;
    }
  }
</script>

<svelte:head>
  <title>Cotización {quotationData?.quotationNumber || ''} - TPS Armoring</title>
  <meta name="description" content="Cotización detallada para el alquiler de vehículo blindado con TPS Armoring." />
  
  <!-- Estilos específicos para impresión/PDF -->
  <style>
    @media print {
      @page {
        margin: 0.5in;
        size: A4;
      }
      
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      .quotation-container {
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .print\\:break-after-page {
        page-break-after: always;
      }
      
      .print\\:break-inside-avoid {
        page-break-inside: avoid;
      }
      
      /* Asegurar que los colores se mantengan en PDF */
      .bg-primary {
        background-color: #1f2937 !important;
        color: white !important;
      }
    }

    /* Estilos para captura de imagen optimizada */
    .quotation-container {
      /* Mejorar renderizado de fuentes */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      
      /* Evitar problemas de overflow */
      overflow: visible;
    }

    /* Asegurar que las tablas se vean bien en capturas */
    .quotation-container table {
      border-collapse: collapse;
      width: 100%;
    }

    .quotation-container table td,
    .quotation-container table th {
      border: 1px solid #e5e7eb;
      padding: 8px;
    }

    /* Mejorar la visibilidad de elementos importantes */
    .quotation-container .bg-gray-50 {
      background-color: #f9fafb !important;
    }

    .quotation-container .border {
      border-color: #e5e7eb !important;
    }
  </style>
</svelte:head>

<div class="min-h-screen bg-background">
  {#if !quotationData}
    <!-- Loading state -->
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="text-muted-foreground">Generando cotización...</p>
      </div>
    </div>
  {:else}
    <!-- Content when data is loaded -->
    <div class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <Button variant="ghost" onclick={() => window.history.back()} class="gap-2">
            <ArrowLeft class="h-4 w-4" />
            Volver
          </Button>
          
          <div class="flex items-center gap-2">
            <Button variant="outline" onclick={shareQuotation} disabled={isSharing} class="gap-2">
              <Share class="h-4 w-4" />
              {isSharing ? 'Generando imagen...' : 'Compartir'}
            </Button>
            <Button variant="outline" onclick={printQuotation} disabled={isPrinting} class="gap-2">
              <Printer class="h-4 w-4" />
              {isPrinting ? 'Imprimiendo...' : 'Imprimir'}
            </Button>
            <Button variant="outline" onclick={sendToERP} disabled={isSendingToERP} class="gap-2">
              <Building class="h-4 w-4" />
              {isSendingToERP ? 'Enviando al ERP...' : 'Enviar al ERP'}
            </Button>
            <Button onclick={downloadPDF} disabled={isDownloading} class="gap-2">
              <Download class="h-4 w-4" />
              {isDownloading ? 'Generando PDF...' : 'Descargar PDF'}
            </Button>
          </div>
        </div>
      </div>
    </div>

  <!-- container to take image snapshot when sharing  -->
  <div class="container mx-auto px-4 py-8 max-w-4xl quotation-container">
    <div class="bg-card shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none print:break-inside-avoid">
      
      <div class="bg-primary text-primary-foreground p-8 print:bg-gray-800 print:text-white">
        <div class="flex items-center justify-between">
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <Shield class="h-8 w-8" />
              <h1 class="text-2xl font-bold">{quotationData.company.name}</h1>
            </div>
            <p class="opacity-90 italic text-sm">{quotationData.company.slogan}</p>
            <p class="opacity-80 text-xs">Servicios Premium de Vehículos Blindados</p>
          </div>
          
          <div class="text-right space-y-1">
            <h2 class="text-3xl font-bold">COTIZACIÓN</h2>
            <p class="text-lg">#{quotationData.quotationNumber}</p>
            <p class="opacity-90">Fecha: {formatDate(quotationData.issueDate)}</p>
          </div>
        </div>
      </div>

      <div class="p-8 grid md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-foreground">Datos de la Empresa</h3>
          <div class="space-y-2 text-sm">
            <div class="flex items-start gap-2">
              <Building class="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p class="font-medium">{quotationData.company.name}</p>
                <p class="text-muted-foreground">{quotationData.company.address}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Phone class="h-4 w-4 text-muted-foreground" />
              <span>{quotationData.company.phone}</span>
            </div>
            <div class="flex items-center gap-2">
              <Mail class="h-4 w-4 text-muted-foreground" />
              <span>{quotationData.company.email}</span>
            </div>
            <div class="pt-2 space-y-1 text-xs text-muted-foreground">
              <p>CIF: {quotationData.company.taxId}</p>
              <p>{quotationData.company.license}</p>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-foreground">Datos del Cliente</h3>
          <div class="space-y-2 text-sm">
            <div>
              <p class="font-medium">{quotationData.customer.firstName} {quotationData.customer.lastName}</p>
              {#if quotationData.customer.company}
                <p class="text-muted-foreground">{quotationData.customer.company}</p>
              {/if}
              <p class="text-muted-foreground">{quotationData.customer.address}</p>
            </div>
            <div class="flex items-center gap-2">
              <Phone class="h-4 w-4 text-muted-foreground" />
              <span>{quotationData.customer.phone}</span>
            </div>
            <div class="flex items-center gap-2">
              <Mail class="h-4 w-4 text-muted-foreground" />
              <span>{quotationData.customer.email}</span>
            </div>
            {#if quotationData.customer.taxId}
              <p class="text-xs text-muted-foreground pt-2">CIF: {quotationData.customer.taxId}</p>
            {/if}
          </div>
        </div>
      </div>

      <Separator />

      <div class="p-8 space-y-6">
        <h3 class="text-xl font-semibold text-foreground">Detalles del Servicio</h3>
        
        <div class="grid md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <h4 class="font-semibold text-foreground flex items-center gap-2">
              <Car class="h-5 w-5" />
              Vehículo Seleccionado
            </h4>
            <div class="bg-muted/30 p-4 rounded-lg space-y-3">
              <div class="flex items-center justify-between">
                <h5 class="font-medium">{quotationData.vehicle.name}</h5>
                <Badge variant="secondary">Nivel {quotationData.vehicle.armorLevel}</Badge>
              </div>
              <div class="text-sm space-y-1">
                <p><strong>Modelo:</strong> {quotationData.vehicle.model}</p>
                <p><strong>Año:</strong> {quotationData.vehicle.year}</p>
                <p><strong>Capacidad:</strong> {quotationData.vehicle.capacity} personas</p>
                <p><strong>Tarifa diaria:</strong> {formatCurrency(quotationData.vehicle.dailyRate)}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium">Características de Seguridad:</p>
                <ul class="text-xs space-y-1">
                  {#each quotationData.vehicle.features as feature}
                    <li class="flex items-center gap-2">
                      <CheckCircle class="h-3 w-3 text-accent" />
                      {feature}
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="font-semibold text-foreground flex items-center gap-2">
              <Calendar class="h-5 w-5" />
              Información del Alquiler
            </h4>
            <div class="bg-muted/30 p-4 rounded-lg space-y-3">
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <Calendar class="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p><strong>Inicio:</strong> {formatDate(quotationData.rental.startDate)}</p>
                    <p><strong>Fin:</strong> {formatDate(quotationData.rental.endDate)}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <Clock class="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p><strong>Horario:</strong> {quotationData.rental.startTime} - {quotationData.rental.endTime}</p>
                    <p><strong>Duración:</strong> {quotationData.rental.totalDays} días</p>
                  </div>
                </div>
                <div class="flex items-start gap-2">
                  <MapPin class="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div class="space-y-1">
                    <p><strong>Recogida:</strong></p>
                    <p class="text-muted-foreground text-xs">{quotationData.rental.pickupLocation}</p>
                    <p><strong>Entrega:</strong></p>
                    <p class="text-muted-foreground text-xs">{quotationData.rental.dropoffLocation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div class="p-8 space-y-6">
        <h3 class="text-xl font-semibold text-foreground">Desglose de Precios</h3>
        
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-2 font-semibold">Artículo</th>
                <th class="text-left py-3 px-2 font-semibold">Servicio</th>
                <th class="text-center py-3 px-2 font-semibold">Días</th>
                <th class="text-right py-3 px-2 font-semibold">Precio/Día</th>
                <th class="text-right py-3 px-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b">
                <td class="py-3 px-2">
                  <span class="text-sm font-mono bg-muted px-2 py-1 rounded">{quotationData.vehicle.articulo || 'VH-001'}</span>
                </td>
                <td class="py-3 px-2">
                  <div>
                    <p class="font-medium">{quotationData.vehicle.name}</p>
                    <p class="text-sm text-muted-foreground">
                      Vehículo blindado nivel {quotationData.vehicle.armorLevel}
                      {#if quotationData.vehicle.vin}
                        <br>VIN: {quotationData.vehicle.vin}
                      {/if}
                    </p>
                  </div>
                </td>
                <td class="text-center py-3 px-2">{quotationData.rental.totalDays}</td>
                <td class="text-right py-3 px-2">{formatCurrency(quotationData.vehicle.dailyRate)}</td>
                <td class="text-right py-3 px-2 font-medium">{formatCurrency(quotationData.vehicle.dailyRate * quotationData.rental.totalDays)}</td>
              </tr>
              
              {#each quotationData.services as service}
                <tr class="border-b">
                  <td class="py-3 px-2">
                    <span class="text-sm font-mono bg-muted px-2 py-1 rounded">{service.articulo || 'SRV-001'}</span>
                  </td>
                  <td class="py-3 px-2">
                    <div>
                      <p class="font-medium">{service.name}</p>
                      <p class="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </td>
                  <td class="text-center py-3 px-2">{service.quantity}</td>
                  <td class="text-right py-3 px-2">{formatCurrency(service.dailyRate)}</td>
                  <td class="text-right py-3 px-2 font-medium">{formatCurrency(service.total)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <div class="bg-muted/30 p-6 rounded-lg">
          <div class="space-y-3">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span class="font-medium">{formatCurrency(quotationData.pricing.subtotal)}</span>
            </div>
            
            {#if quotationData.pricing.discount > 0}
              <div class="flex justify-between text-accent">
                <span>Descuento aplicado</span>
                <span class="font-medium">-{formatCurrency(quotationData.pricing.discount)}</span>
              </div>
            {/if}
            
            <div class="flex justify-between">
              <span>IVA (15%)</span>
              <span class="font-medium">{formatCurrency(quotationData.pricing.tax)}</span>
            </div>
            
            <Separator />
            
            <div class="flex justify-between text-lg font-bold">
              <span>TOTAL</span>
              <span>{formatCurrency(quotationData.pricing.total)}</span>
            </div>
            
            <Separator />
            
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Depósito de seguridad</span>
                <span class="font-medium">{formatCurrency(quotationData.pricing.deposit)}</span>
              </div>
              <div class="flex justify-between text-accent">
                <span class="font-medium">Pago restante</span>
                <span class="font-bold">{formatCurrency(quotationData.pricing.finalPayment)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div class="p-8 space-y-4">
        <h3 class="text-xl font-semibold text-foreground">Términos y Condiciones</h3>
        
        <div class="space-y-3 text-sm">
          {#each quotationData.terms as term, index}
            <div class="flex items-start gap-3">
              <span class="text-muted-foreground font-medium">{index + 1}.</span>
              <p class="text-muted-foreground">{term}</p>
            </div>
          {/each}
        </div>
      </div>

      <Separator />

      <div class="p-8 bg-muted/30">
        <div class="grid md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <h4 class="font-semibold text-foreground">Validez de la Cotización</h4>
            <div class="space-y-2 text-sm">
              <p>Esta cotización es válida hasta: <strong>{formatDate(quotationData.validUntil)}</strong></p>
              <p class="text-muted-foreground">
                Para confirmar su reserva, póngase en contacto con nosotros antes de la fecha de vencimiento.
              </p>
            </div>
          </div>
          
          <div class="space-y-4">
            <h4 class="font-semibold text-foreground">Contacto</h4>
            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2">
                <Phone class="h-4 w-4 text-muted-foreground" />
                <span>{quotationData.company.phone}</span>
              </div>
              <div class="flex items-center gap-2">
                <Mail class="h-4 w-4 text-muted-foreground" />
                <span>{quotationData.company.email}</span>
              </div>
              <p class="text-muted-foreground">Disponible 24/7 para su comodidad</p>
            </div>
          </div>
        </div>
        
        <div class="mt-6 pt-6 border-t text-center">
          <p class="text-sm text-muted-foreground">
            Gracias por confiar en {quotationData.company.name} para sus necesidades de transporte seguro.
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8 grid md:grid-cols-2 gap-6 print:hidden">
      <Alert>
        <CheckCircle class="h-4 w-4" />
        <AlertDescription>
          <strong>Cotización generada exitosamente.</strong> Puede descargar el PDF o imprimir esta cotización para sus registros.
          La cotización es válida por 7 días.
        </AlertDescription>
      </Alert>
      
      <Alert>
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>
          <strong>¿Listo para confirmar?</strong> Contacte con nuestro equipo al {quotationData.company.phone} 
          o envíe un email a {quotationData.company.email} para proceder con la reserva.
        </AlertDescription>
      </Alert>
    </div>
  </div>
{/if}
</div>

<style>
  @media print {
    .print\:hidden {
      display: none !important;
    }
    
    .print\:shadow-none {
      box-shadow: none !important;
    }
    
    .print\:rounded-none {
      border-radius: 0 !important;
    }
    
    .print\:bg-gray-800 {
      background-color: #1f2937 !important;
    }
    
    .print\:text-white {
      color: white !important;
    }
  }
</style>
