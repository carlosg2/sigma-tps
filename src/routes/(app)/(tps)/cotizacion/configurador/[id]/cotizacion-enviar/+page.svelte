<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { server } from '$lib/siteConfig';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import * as Alert from '$lib/components/ui/alert';
	import * as Table from '$lib/components/ui/table';
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
		Star,
		Database,
		Weight,
		User,
		Send
	} from 'lucide-svelte';

	// Interfaces actualizadas siguiendo el patrón de renta/cotizacion
	interface CotizacionData {
		solicitudId: string;
		clienteInfo: {
			cliente: string;
			nombre: string;
			telefono: string;
			email: string;
		};
		vehiculoInfo: {
			marca: string;
			modelo: string;
			año: string;
			uso: string;
			amenazas: string;
			cobertura: string;
		};
		configuracion: any;
		precios: {
			subtotal: number;
			iva: number;
			total: number;
			pesoAproximadoBlindaje: number;
		};
		fechaGeneracion: string;
		listaMateriales: Array<{
			categoria: string;
			descripcion: string;
			cantidad?: number;
			unidad?: string;
			precioUnitario: number;
			importe: number;
		}>;
	}

	interface PageData {
		cotizacion: CotizacionData;
	}

	interface ProcessedQuotation {
		quotationNumber: string;
		issueDate: Date;
		validUntil: Date;
		company: {
			name: string;
			slogan: string;
			address: string;
			phone: string;
			email: string;
			website: string;
			taxId: string;
			license: string;
		};
		customer: {
			firstName: string;
			lastName: string;
			email: string;
			phone: string;
			company: string;
			address: string;
			taxId: string;
		};
		vehicle: {
			name: string;
			model: string;
			year: string;
			armorLevel: string;
			capacity: number;
			vin: string;
			features: string[];
		};
		materials: Array<{
			categoria: string;
			descripcion: string;
			cantidad: number;
			unidad: string;
			precioUnitario: number;
			importe: number;
		}>;
		pricing: {
			subtotal: number;
			discount: number;
			taxRate: number;
			tax: number;
			total: number;
			pesoBlindaje: number;
		};
		terms: string[];
	}

	// Estados de la UI siguiendo el patrón
	let quotationData = $state<ProcessedQuotation | null>(null);
	let downloading = $state(false);
	let isPrinting = $state(false);
	let sharing = $state(false);
	let sendingToERP = $state(false);
	let approving = $state(false);
	let shareError = $state<string | null>(null);

	let { data }: { data: PageData } = $props();

	// Función para cargar modern-screenshot dinámicamente
	async function loadModernScreenshot() {
		if (typeof window !== 'undefined') {
			// Si ya está cargado, devolverlo
			if ((window as any).modernScreenshot) {
				return (window as any).modernScreenshot;
			}
			
			// Cargar dinámicamente via CDN - URL actualizada
			return new Promise((resolve, reject) => {
				const script = document.createElement('script');
				script.src = 'https://cdn.jsdelivr.net/npm/modern-screenshot@4.4.39/dist/index.umd.min.js';
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

	// Función robusta para capturar imagen
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
			// Aplicar estilos temporales
			quotationContainer.style.maxWidth = '800px';
			quotationContainer.style.margin = '0';
			quotationContainer.style.padding = '20px';
			quotationContainer.style.width = '800px';
			quotationContainer.style.backgroundColor = '#ffffff';
			quotationContainer.style.boxSizing = 'border-box';

			// Dar tiempo para que los estilos se apliquen
			await new Promise(resolve => setTimeout(resolve, 100));

			// Estrategia 1: modern-screenshot
			try {
				const modernScreenshot = await loadModernScreenshot();
				
				const dataUrl = await modernScreenshot.domToPng(quotationContainer, {
					backgroundColor: '#ffffff',
					width: 800,
					scale: 1.5,
					quality: 0.95,
					filter: (node: Node) => {
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

			// Estrategia 2: dom-to-image
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
					filter: (node: Node) => {
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

			// Estrategia 3: HTML2Canvas
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

			// Estrategia 4: Canvas API nativo como fallback final
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
				ctx.fillText('Cotización Blindaje TPS Armoring', 20, 40);
				
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
				ctx.fillText('TPS Armoring - Blindaje Vehicular', 20, y + 50);
				
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

	// Generar ID de cotización siguiendo el formato
	function generateQuotationId() {
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
		return `COT-BLD-${year}${month}${day}-${random}`;
	}

	// Procesar datos de cotización siguiendo el patrón
	function processQuotationData(cotizacion: CotizacionData): ProcessedQuotation {
		// Procesar datos del cliente
		const [nombre, apellido] = cotizacion.clienteInfo.nombre.split(' ', 2);
		
		return {
			quotationNumber: generateQuotationId(),
			issueDate: new Date(cotizacion.fechaGeneracion),
			validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
			
			company: {
				name: 'TPS Armoring',
				slogan: 'Tecnología táctica, blindaje extremo. La unidad que redefine la protección en cada misión.',
				address: 'Av. Paseo de la Reforma 250, Col. Juárez, 06600 Ciudad de México, México',
				phone: '+52 55 1234 5678',
				email: 'blindaje@tpsarmoring.mx',
				website: 'www.tpsarmoring.mx',
				taxId: 'TPS123456789',
				license: 'Licencia Federal de Blindaje: SEDENA-BLD-2024-001'
			},
			
			customer: {
				firstName: nombre || cotizacion.clienteInfo.nombre,
				lastName: apellido || '',
				email: cotizacion.clienteInfo.email,
				phone: cotizacion.clienteInfo.telefono,
				company: cotizacion.clienteInfo.cliente,
				address: 'Ciudad de México, México',
				taxId: cotizacion.clienteInfo.cliente
			},
			
			vehicle: {
				name: `${cotizacion.vehiculoInfo.marca} ${cotizacion.vehiculoInfo.modelo}`,
				model: cotizacion.vehiculoInfo.modelo,
				year: cotizacion.vehiculoInfo.año,
				armorLevel: cotizacion.vehiculoInfo.amenazas,
				capacity: 4,
				vin: '',
				features: [
					`Blindaje certificado ${cotizacion.vehiculoInfo.amenazas}`,
					'Cristales antibalas de alta resistencia',
					'Neumáticos run-flat especializados',
					'Sistema de comunicaciones blindado',
					'Refuerzo estructural completo'
				]
			},
			
			materials: cotizacion.listaMateriales.map(material => ({
				categoria: material.categoria,
				descripcion: material.descripcion,
				cantidad: material.cantidad || 1,
				unidad: material.unidad || 'PZA',
				precioUnitario: material.precioUnitario,
				importe: material.importe
			})),
			
			pricing: {
				subtotal: cotizacion.precios.subtotal,
				discount: 0,
				taxRate: 0.16,
				tax: cotizacion.precios.iva,
				total: cotizacion.precios.total,
				pesoBlindaje: cotizacion.precios.pesoAproximadoBlindaje
			},
			
			terms: [
				'Esta cotización es válida por 30 días desde la fecha de emisión.',
				'Se requiere un anticipo del 50% para iniciar los trabajos de blindaje.',
				'El tiempo de entrega estimado es de 45-60 días hábiles.',
				'El precio incluye instalación y pruebas de calidad.',
				'La garantía del blindaje es de 12 meses bajo condiciones normales de uso.',
				'Cancelaciones después del inicio de trabajos tienen penalización del 25%.',
				'Los precios están sujetos a cambios por fluctuaciones en materias primas.',
				'Se incluye certificado de blindaje conforme a estándares internacionales.',
				'El vehículo debe estar en condiciones óptimas para el proceso de blindaje.',
				'Los precios incluyen IVA (16%) según la legislación mexicana vigente.'
			]
		};
	}

	// Montar componente
	onMount(() => {
		if (data?.cotizacion) {
			quotationData = processQuotationData(data.cotizacion);
		} else {
			alert('No se encontraron datos de la cotización.');
			setTimeout(() => {
				goto('/cotizacion');
			}, 2000);
		}
	});

	// Funciones de utilidad
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

	// Funciones de acción siguiendo el patrón de renta/cotizacion
	function volverAtras() {
		goto(`/cotizacion/configurador/${data.cotizacion.solicitudId}`);
	}

	async function downloadPDF() {
		downloading = true;
		
		const userConfirmed = confirm(
			'Se abrirá el diálogo de impresión. Por favor:\n\n' +
			'1. Selecciona "Guardar como PDF" como destino\n' +
			'2. Configura el formato de página según necesites\n' +
			'3. Haz clic en "Guardar"\n\n' +
			'¿Continuar?'
		);
		
		if (userConfirmed) {
			await new Promise(resolve => setTimeout(resolve, 500));
			window.print();
		}
		
		downloading = false;
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
		
		sharing = true;
		shareError = null;
		
		try {
			console.log('Iniciando proceso de compartir cotización...');
			
			const dataUrl = await captureQuotationImage();
			
			if (!dataUrl) {
				throw new Error('No se pudo generar la imagen de la cotización');
			}

			const response = await fetch(dataUrl);
			const blob = await response.blob();
			
			const fileName = `Cotizacion_Blindaje_${quotationData.quotationNumber}_${new Date().toISOString().split('T')[0]}.png`;
			
			const testFile = new File([blob], fileName, { type: 'image/png' });
			const canShareFiles = navigator.share && navigator.canShare && 
							   navigator.canShare({ files: [testFile] });
			
			if (canShareFiles) {
				await navigator.share({
					title: `Cotización Blindaje ${quotationData.quotationNumber}`,
					text: `Cotización de blindaje vehicular - ${quotationData.vehicle.name}`,
					files: [testFile]
				});
				console.log('Compartido exitosamente via Web Share API');
			} else {
				// Fallback: usar modal o descarga directa
				const link = document.createElement('a');
				link.href = dataUrl;
				link.download = fileName;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				console.log('Descargado como imagen via fallback');
			}
			
		} catch (error) {
			console.error('Error al compartir cotización:', error);
			shareError = error instanceof Error ? error.message : 'Error desconocido al compartir';
		} finally {
			sharing = false;
		}
	}

	async function showSimpleShareModal() {
		return new Promise((resolve) => {
			const modal = document.createElement('div');
			modal.style.cssText = `
				position: fixed; top: 0; left: 0; width: 100%; height: 100%;
				background: rgba(0, 0, 0, 0.8); display: flex; align-items: center;
				justify-content: center; z-index: 10000; font-family: system-ui, -apple-system, sans-serif;
			`;

			const modalContent = document.createElement('div');
			modalContent.style.cssText = `
				background: white; border-radius: 12px; padding: 24px; max-width: 400px;
				width: 90%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
			`;

			modalContent.innerHTML = `
				<h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
					Compartir Cotización de Blindaje
				</h3>
				<p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">
					Comparte tu cotización usando estos métodos:
				</p>
				<div style="display: flex; flex-direction: column; gap: 12px;">
					<button id="shareEmail" style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">
						📧 Enviar por email
					</button>
					<button id="copyLink" style="background: #8b5cf6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">
						🔗 Copiar enlace
					</button>
					<button id="shareWhatsApp" style="background: #25d366; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">
						💬 Compartir en WhatsApp
					</button>
					<button id="closeModal" style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">
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
				const subject = encodeURIComponent(`Cotización Blindaje TPS Armoring - ${quotationData.quotationNumber}`);
				const body = encodeURIComponent(
					`Estimado/a,\n\n` +
					`Le comparto la cotización para el blindaje vehicular.\n\n` +
					`Detalles:\n` +
					`• Número: ${quotationData.quotationNumber}\n` +
					`• Cliente: ${quotationData.customer.firstName} ${quotationData.customer.lastName}\n` +
					`• Vehículo: ${quotationData.vehicle.name}\n` +
					`• Nivel de blindaje: ${quotationData.vehicle.armorLevel}\n` +
					`• Total: ${formatCurrency(quotationData.pricing.total)}\n\n` +
					`Ver cotización completa: ${window.location.href}\n\n` +
					`Saludos cordiales,\nEquipo TPS Armoring`
				);
				window.open(`mailto:?subject=${subject}&body=${body}`);
				closeModal();
			});

			modal.querySelector('#copyLink')?.addEventListener('click', async () => {
				try {
					await navigator.clipboard.writeText(window.location.href);
					alert('Enlace copiado al portapapeles');
				} catch (error) {
					alert('Error al copiar el enlace');
				}
				closeModal();
			});

			modal.querySelector('#shareWhatsApp')?.addEventListener('click', () => {
				const text = encodeURIComponent(
					`🛡️ Cotización Blindaje TPS Armoring - ${quotationData.quotationNumber}\n\n` +
					`Cliente: ${quotationData.customer.firstName} ${quotationData.customer.lastName}\n` +
					`Vehículo: ${quotationData.vehicle.name}\n` +
					`Total: ${formatCurrency(quotationData.pricing.total)}\n\n` +
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
		// Similar implementación al patrón de renta, adaptado para blindaje
		return new Promise((resolve) => {
			const imageUrl = URL.createObjectURL(blob);
			
			const modal = document.createElement('div');
			modal.style.cssText = `
				position: fixed; top: 0; left: 0; width: 100%; height: 100%;
				background: rgba(0, 0, 0, 0.8); display: flex; align-items: center;
				justify-content: center; z-index: 10000; font-family: system-ui, -apple-system, sans-serif;
			`;

			const modalContent = document.createElement('div');
			modalContent.style.cssText = `
				background: white; border-radius: 12px; padding: 24px; max-width: 400px;
				width: 90%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
			`;

			modalContent.innerHTML = `
				<h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Compartir Cotización de Blindaje</h3>
				<p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Elige cómo deseas compartir tu cotización:</p>
				<div style="display: flex; flex-direction: column; gap: 12px;">
					<button id="downloadImage" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">📥 Descargar imagen</button>
					<button id="shareEmail" style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">📧 Enviar por email</button>
					<button id="copyLink" style="background: #8b5cf6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">🔗 Copiar enlace</button>
					<button id="shareWhatsApp" style="background: #25d366; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">💬 Compartir en WhatsApp</button>
					<button id="closeModal" style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">Cancelar</button>
				</div>
			`;

			modal.appendChild(modalContent);
			document.body.appendChild(modal);

			function closeModal() {
				document.body.removeChild(modal);
				URL.revokeObjectURL(imageUrl);
				resolve(null);
			}

			// Event listeners para las opciones
			modal.querySelector('#downloadImage')?.addEventListener('click', () => {
				const a = document.createElement('a');
				a.href = imageUrl;
				a.download = `cotizacion-blindaje-${quotationData.quotationNumber}.png`;
				a.click();
				closeModal();
			});

			modal.querySelector('#shareEmail')?.addEventListener('click', () => {
				const subject = encodeURIComponent(`Cotización Blindaje TPS Armoring - ${quotationData.quotationNumber}`);
				const body = encodeURIComponent(
					`Estimado/a,\n\n` +
					`Adjunto encontrará la cotización para el blindaje vehicular.\n\n` +
					`Detalles de la cotización:\n` +
					`• Número: ${quotationData.quotationNumber}\n` +
					`• Cliente: ${quotationData.customer.firstName} ${quotationData.customer.lastName}\n` +
					`• Vehículo: ${quotationData.vehicle.name}\n` +
					`• Nivel: ${quotationData.vehicle.armorLevel}\n` +
					`• Total: ${formatCurrency(quotationData.pricing.total)}\n\n` +
					`Para ver la cotización completa, visite: ${window.location.href}\n\n` +
					`NOTA: La imagen de la cotización se descargará automáticamente. Por favor adjúntela a este email.\n\n` +
					`Saludos cordiales,\nEquipo TPS Armoring`
				);
				
				window.open(`mailto:?subject=${subject}&body=${body}`);
				
				const a = document.createElement('a');
				a.href = imageUrl;
				a.download = `cotizacion-blindaje-${quotationData.quotationNumber}.png`;
				a.click();
				
				closeModal();
			});

			modal.querySelector('#copyLink')?.addEventListener('click', async () => {
				try {
					await navigator.clipboard.writeText(window.location.href);
					const btn = modal.querySelector('#copyLink');
					btn.textContent = '✅ Enlace copiado!';
					setTimeout(() => {
						btn.innerHTML = '🔗 Copiar enlace';
					}, 2000);
				} catch (error) {
					alert('Error al copiar el enlace');
				}
			});

			modal.querySelector('#shareWhatsApp')?.addEventListener('click', () => {
				const text = encodeURIComponent(
					`🛡️ Cotización Blindaje TPS Armoring - ${quotationData.quotationNumber}\n\n` +
					`Cliente: ${quotationData.customer.firstName} ${quotationData.customer.lastName}\n` +
					`Vehículo: ${quotationData.vehicle.name}\n` +
					`Total: ${formatCurrency(quotationData.pricing.total)}\n\n` +
					`Ver cotización completa: ${window.location.href}`
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

	async function sendToERP() {
		if (!quotationData || !data.cotizacion) {
			alert('No hay datos de cotización para enviar');
			return;
		}

		sendingToERP = true;

		try {
			// Preparar JSON completo siguiendo el formato original
			const datosParaERP = {
				solicitud: {
					id: data.cotizacion.solicitudId,
					fechaGeneracion: data.cotizacion.fechaGeneracion,
					estado: "cotizada"
				},
				cliente: {
					codigo: data.cotizacion.clienteInfo.cliente,
					nombre: data.cotizacion.clienteInfo.nombre,
					telefono: data.cotizacion.clienteInfo.telefono,
					email: data.cotizacion.clienteInfo.email
				},
				vehiculo: {
					marca: data.cotizacion.vehiculoInfo.marca,
					modelo: data.cotizacion.vehiculoInfo.modelo,
					año: data.cotizacion.vehiculoInfo.año,
					uso: data.cotizacion.vehiculoInfo.uso,
					nivelAmenazas: data.cotizacion.vehiculoInfo.amenazas,
					tipoCobertura: data.cotizacion.vehiculoInfo.cobertura
				},
				configuracionBlindaje: {
					nivelProteccion: data.cotizacion.configuracion.nivelProteccion,
					tipoBlindaje: data.cotizacion.configuracion.tipoBlindaje,
					cristalesEspeciales: data.cotizacion.configuracion.cristalesEspeciales,
					suspensionReforzada: data.cotizacion.configuracion.suspensionReforzada,
					opciones: {
						rollBarTecho: data.cotizacion.configuracion.rollBarTecho || false,
						proteccionBateria: data.cotizacion.configuracion.proteccionBateria || false,
						runFlatTires: data.cotizacion.configuracion.runFlatTires || false,
						proteccionTanque: data.cotizacion.configuracion.proteccionTanque || false,
						cortinaCubreEquipaje: data.cotizacion.configuracion.cortinaCubreEquipaje || false,
						sistemaAudio: data.cotizacion.configuracion.sistemaAudio || false,
						proteccionComputadora: data.cotizacion.configuracion.proteccionComputadora || false,
						defensaReforzada: data.cotizacion.configuracion.defensaReforzada || false
					}
				},
				listaMateriales: data.cotizacion.listaMateriales.map(material => ({
					categoria: material.categoria,
					descripcion: material.descripcion,
					cantidad: material.cantidad || 1,
					unidad: material.unidad || "PZA",
					precioUnitario: material.precioUnitario,
					importe: material.importe
				})),
				totales: {
					subtotal: data.cotizacion.precios.subtotal,
					iva: data.cotizacion.precios.iva,
					total: data.cotizacion.precios.total,
					pesoAproximadoBlindaje: data.cotizacion.precios.pesoAproximadoBlindaje
				},
				resumenPorCategoria: Object.entries(materialesPorCategoria).map(([categoria, materiales]) => ({
					categoria,
					cantidadItems: materiales.length,
					subtotalCategoria: materiales.reduce((sum, material) => sum + material.importe, 0)
				}))
			};

			console.log('📤 Enviando al ERP:', JSON.stringify(datosParaERP, null, 2));

			const response = await fetch(
				server.api + "sp/sp_ProcesarCotizacionJSON",
				{
					method: "POST",
					body: JSON.stringify({
						ID: data.cotizacion.solicitudId,
						JsonData: JSON.stringify(datosParaERP)
					}),
					headers: {
						"Content-Type": "application/json",
						Authorization:
							"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Ik1BU0VSUCIsIm5iZiI6MTcwNDczOTg5MiwiZXhwIjoxNzk0NzM5ODkyLCJpYXQiOjE3MDQ3Mzk4OTIsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.FjzsgDNyQRodwo_vk1UgJ8RcC0xh27SSZm7NoLotIok",
					},
				}
			);

			const responseData = await response.json();
			console.log('📥 Respuesta del ERP:', responseData);

			if (responseData[0]?.Ok === null || responseData[0]?.Ok === undefined) {
				alert("✅ Cotización enviada exitosamente al ERP");
				console.log('✅ Cotización enviada correctamente:', responseData);
			} else {
				alert('❌ Error al enviar al ERP: ' + (responseData[0]?.OkRef || 'Error desconocido'));
				console.error('❌ Error del ERP:', responseData[0]?.OkRef);
			}

		} catch (error) {
			console.error('❌ Error al enviar cotización al ERP:', error);
			alert('❌ Error de conexión al enviar la cotización al ERP. Revise la consola para más detalles.');
		} finally {
			sendingToERP = false;
		}
	}

	async function approveQuotation() {
		if (!data.cotizacion) {
			alert('No hay datos de cotización para aprobar');
			return;
		}

		approving = true;

		try {
			console.log('📤 Aprobando cotización...');
			
			const response = await fetch(
				server.api + "sp/spAvanzarSituacionCotizacion",
				{
					method: "POST",
					body: JSON.stringify({
						Usuario: "MASERP",
						ID: data.cotizacion.solicitudId
					}),
					headers: {
						"Content-Type": "application/json",
						Authorization:
							"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Ik1BU0VSUCIsIm5iZiI6MTcwNDczOTg5MiwiZXhwIjoxNzk0NzM5ODkyLCJpYXQiOjE3MDQ3Mzk4OTIsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.FjzsgDNyQRodwo_vk1UgJ8RcC0xh27SSZm7NoLotIok",
					},
				}
			);

			const responseData = await response.json();
			console.log('📥 Respuesta del ERP:', responseData);

			if (responseData[0]?.Ok === null || responseData[0]?.Ok === undefined) {
				alert("✅ Cotización aprobada exitosamente");
				console.log('✅ Cotización aprobada correctamente:', responseData);
			} else {
				alert('❌ Error al aprobar cotización: ' + (responseData[0]?.OkRef || 'Error desconocido'));
				console.error('❌ Error del ERP:', responseData[0]?.OkRef);
			}
			
		} catch (error) {
			console.error('❌ Error al aprobar cotización:', error);
			alert('❌ Error de conexión al procesar la aprobación de cotización');
		} finally {
			approving = false;
		}
	}

	// Agrupar materiales por categoría
	let materialesPorCategoria = $derived.by(() => {
		if (!data.cotizacion?.listaMateriales) return {};
		
		const grupos = data.cotizacion.listaMateriales.reduce((acc, material) => {
			if (!acc[material.categoria]) {
				acc[material.categoria] = [];
			}
			acc[material.categoria].push(material);
			return acc;
		}, {} as Record<string, typeof data.cotizacion.listaMateriales>);
		
		return grupos;
	});

	// Fecha formateada
	let fechaFormateada = $derived.by(() => {
		if (!data.cotizacion?.fechaGeneracion) return '';
		return new Date(data.cotizacion.fechaGeneracion).toLocaleDateString('es-MX', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	});
</script>

<svelte:head>
	<title>Cotización {quotationData?.quotationNumber || ''} - TPS Armoring</title>
	<meta name="description" content="Cotización detallada para blindaje vehicular con TPS Armoring." />
	
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
		<!-- Header de navegación -->
		<div class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
			<div class="container mx-auto px-4 py-4">
				<div class="flex items-center justify-between">
					<Button variant="ghost" onclick={volverAtras} class="gap-2">
						<ArrowLeft class="h-4 w-4" />
						Volver al Configurador
					</Button>
					
					<div class="flex items-center gap-2">
						<Button variant="outline" onclick={shareQuotation} disabled={sharing} class="gap-2">
							<Share class="h-4 w-4" />
							{sharing ? 'Generando imagen...' : 'Compartir'}
						</Button>
						<Button variant="outline" onclick={printQuotation} disabled={isPrinting} class="gap-2">
							<Printer class="h-4 w-4" />
							{isPrinting ? 'Imprimiendo...' : 'Imprimir'}
						</Button>
						<Button variant="outline" onclick={sendToERP} disabled={sendingToERP} class="gap-2">
							<Database class="h-4 w-4" />
							{sendingToERP ? 'Enviando al ERP...' : 'Enviar al ERP'}
						</Button>
						<Button variant="outline" onclick={approveQuotation} disabled={approving} class="gap-2">
							<Shield class="h-4 w-4" />
							{approving ? 'Aprobando...' : 'Aprobar'}
						</Button>
						<Button onclick={downloadPDF} disabled={downloading} class="gap-2">
							<Download class="h-4 w-4" />
							{downloading ? 'Generando PDF...' : 'Descargar PDF'}
						</Button>
					</div>
				</div>
				
				<!-- Mensaje de error si algo falla -->
				{#if shareError}
					<div class="container mx-auto px-4 pb-4">
						<Alert.Root variant="destructive">
							<AlertCircle class="h-4 w-4" />
							<Alert.Title>Error al compartir</Alert.Title>
							<Alert.Description>{shareError}</Alert.Description>
						</Alert.Root>
					</div>
				{/if}
			</div>
		</div>

		<!-- Container principal para captura de imagen -->
		<div class="container mx-auto px-4 py-8 max-w-4xl quotation-container">
			<div class="bg-card shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none print:break-inside-avoid">
				
				<!-- Header de la cotización -->
				<div class="bg-primary text-primary-foreground p-8 print:bg-gray-800 print:text-white">
					<div class="flex items-center justify-between">
						<div class="space-y-2">
							<div class="flex items-center gap-3">
								<Shield class="h-8 w-8" />
								<h1 class="text-2xl font-bold">{quotationData.company.name}</h1>
							</div>
							<p class="opacity-90 italic text-sm">{quotationData.company.slogan}</p>
							<p class="opacity-80 text-xs">Servicios Premium de Blindaje Vehicular</p>
						</div>
						
						<div class="text-right space-y-1">
							<h2 class="text-3xl font-bold">COTIZACIÓN</h2>
							<p class="text-lg">#{quotationData.quotationNumber}</p>
							<p class="opacity-90">Fecha: {formatDate(quotationData.issueDate)}</p>
							<p class="opacity-80 text-sm">ID Solicitud: {data.cotizacion.solicitudId}</p>
						</div>
					</div>
				</div>

				<!-- Información de empresa y cliente -->
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
								<p>RFC: {quotationData.company.taxId}</p>
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
									<p class="text-muted-foreground">Cliente: {quotationData.customer.company}</p>
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
						</div>
					</div>
				</div>

				<Separator />

				<!-- Detalles del vehículo y configuración -->
				<div class="p-8 space-y-6">
					<h3 class="text-xl font-semibold text-foreground">Detalles del Blindaje</h3>
					
					<div class="grid md:grid-cols-2 gap-8">
						<!-- Información del vehículo -->
						<div class="space-y-4">
							<h4 class="font-semibold text-foreground flex items-center gap-2">
								<Car class="h-5 w-5" />
								Vehículo a Blindar
							</h4>
							<div class="bg-muted/30 p-4 rounded-lg space-y-3">
								<div class="flex items-center justify-between">
									<h5 class="font-medium">{quotationData.vehicle.name}</h5>
									<Badge variant="secondary">Nivel {quotationData.vehicle.armorLevel}</Badge>
								</div>
								<div class="text-sm space-y-1">
									<p><strong>Año:</strong> {quotationData.vehicle.year}</p>
									<p><strong>Uso:</strong> {data.cotizacion.vehiculoInfo.uso}</p>
									<p><strong>Cobertura:</strong> {data.cotizacion.vehiculoInfo.cobertura}</p>
								</div>
								<div class="space-y-1">
									<p class="text-sm font-medium">Características de Seguridad:</p>
									<ul class="text-xs space-y-1">
										{#each quotationData.vehicle.features as feature}
											<li class="flex items-center gap-2">
												<CheckCircle class="h-3 w-3 text-green-600" />
												{feature}
											</li>
										{/each}
									</ul>
								</div>
							</div>
						</div>

						<!-- Configuración de blindaje -->
						<div class="space-y-4">
							<h4 class="font-semibold text-foreground flex items-center gap-2">
								<Shield class="h-5 w-5" />
								Configuración de Blindaje
							</h4>
							<div class="bg-muted/30 p-4 rounded-lg space-y-3">
								<div class="space-y-2 text-sm">
									<div class="flex justify-between items-center">
										<span>Nivel de Protección:</span>
										<Badge variant="default">{data.cotizacion.configuracion.nivelProteccion}</Badge>
									</div>
									<div class="flex justify-between items-center">
										<span>Material:</span>
										<span class="font-medium">{data.cotizacion.configuracion.tipoBlindaje}</span>
									</div>
									<div class="flex justify-between items-center">
										<span>Cristales:</span>
										<span class="font-medium">{data.cotizacion.configuracion.cristalesEspeciales}</span>
									</div>
									<div class="flex justify-between items-center">
										<span>Suspensión:</span>
										<span class="font-medium">{data.cotizacion.configuracion.suspensionReforzada}</span>
									</div>
								</div>
								<Separator />
								<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
									<span class="text-sm font-medium text-muted-foreground flex items-center gap-2">
										<Weight class="size-4" />
										Peso Aprox. del Blindaje:
									</span>
					<span class="font-bold text-lg">{quotationData.pricing.pesoBlindaje} KG</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<Separator />

				<!-- Desglose detallado de materiales y precios -->
				<div class="p-8 space-y-6">
					<h3 class="text-xl font-semibold text-foreground">Desglose Detallado de Materiales</h3>
					
					<div class="space-y-6">
						{#each Object.entries(materialesPorCategoria) as [categoria, materiales]}
							<div class="border rounded-lg overflow-hidden">
								<!-- Header de categoría -->
								<div class="bg-muted p-4 border-b">
									<div class="flex items-center justify-between">
										<h4 class="font-semibold flex items-center gap-2">
											<div class="w-3 h-3 bg-blue-500 rounded-full"></div>
											{categoria}
										</h4>
										<Badge variant="secondary">
											{materiales.length} items
										</Badge>
									</div>
								</div>

								<!-- Tabla de materiales -->
								<div class="overflow-x-auto">
									<Table.Root>
										<Table.Header>
											<Table.Row>
												<Table.Head class="font-semibold">Descripción</Table.Head>
												<Table.Head class="text-center font-semibold w-24">Cantidad</Table.Head>
												<Table.Head class="text-center font-semibold w-24">Unidad</Table.Head>
												<Table.Head class="text-right font-semibold w-32">Precio Unit.</Table.Head>
												<Table.Head class="text-right font-semibold w-32">Importe</Table.Head>
											</Table.Row>
										</Table.Header>
										<Table.Body>
											{#each materiales as material}
												<Table.Row class="hover:bg-muted/50">
													<Table.Cell class="font-medium">
														{material.descripcion}
													</Table.Cell>
													<Table.Cell class="text-center">
														<Badge variant="outline" class="font-mono">
															{material.cantidad || 1}
														</Badge>
													</Table.Cell>
													<Table.Cell class="text-center">
														<Badge variant="outline" class="text-xs">
															{material.unidad || 'PZA'}
														</Badge>
													</Table.Cell>
													<Table.Cell class="text-right font-mono">
														{formatCurrency(material.precioUnitario)}
													</Table.Cell>
													<Table.Cell class="text-right font-bold font-mono">
														{formatCurrency(material.importe)}
													</Table.Cell>
												</Table.Row>
											{/each}
										</Table.Body>
									</Table.Root>
								</div>

								<!-- Subtotal por categoría -->
								<div class="bg-muted/50 p-4 border-t">
									<div class="flex justify-between items-center">
										<span class="font-medium">Subtotal {categoria}:</span>
										<span class="font-bold text-lg">
											{formatCurrency(materiales.reduce((sum, material) => sum + material.importe, 0))}
										</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<Separator />

				<!-- Resumen financiero -->
				<div class="p-8 space-y-6">
					<h3 class="text-xl font-semibold text-foreground">Resumen Financiero</h3>
					
					<div class="bg-muted/30 p-6 rounded-lg">
						<div class="space-y-3">
							<div class="flex justify-between">
								<span>Subtotal</span>
								<span class="font-medium font-mono">{formatCurrency(quotationData.pricing.subtotal)}</span>
							</div>
							
							{#if quotationData.pricing.discount > 0}
								<div class="flex justify-between text-green-600">
									<span>Descuento aplicado</span>
									<span class="font-medium font-mono">-{formatCurrency(quotationData.pricing.discount)}</span>
								</div>
							{/if}
							
							<div class="flex justify-between">
								<span>IVA ({Math.round(quotationData.pricing.taxRate * 100)}%)</span>
								<span class="font-medium font-mono">{formatCurrency(quotationData.pricing.tax)}</span>
							</div>
							
							<Separator />
							
							<div class="flex justify-between text-lg font-bold">
								<span>TOTAL</span>
								<span class="font-mono">{formatCurrency(quotationData.pricing.total)}</span>
							</div>

							<Separator />
							
							<div class="flex justify-between items-center p-3 bg-background rounded-lg border">
								<span class="font-medium flex items-center gap-2">
									<Weight class="h-4 w-4" />
									Peso Aproximado del Blindaje:
								</span>
								<span class="font-bold text-lg">{quotationData.pricing.pesoBlindaje} KG</span>
							</div>
						</div>
					</div>
				</div>

				<Separator />

				<!-- Términos y condiciones -->
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

				<!-- Footer con validez y contacto -->
				<div class="p-8 bg-muted/30">
					<div class="grid md:grid-cols-2 gap-8">
						<div class="space-y-4">
							<h4 class="font-semibold text-foreground">Validez de la Cotización</h4>
							<div class="space-y-2 text-sm">
								<p>Esta cotización es válida hasta: <strong>{formatDate(quotationData.validUntil)}</strong></p>
								<p class="text-muted-foreground">
									Para confirmar su proyecto de blindaje, póngase en contacto con nosotros antes de la fecha de vencimiento.
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
								<p class="text-muted-foreground">Especialistas en blindaje disponibles 24/7</p>
							</div>
						</div>
					</div>
					
					<div class="mt-6 pt-6 border-t text-center">
						<p class="text-sm text-muted-foreground">
							Gracias por confiar en {quotationData.company.name} para sus necesidades de blindaje vehicular.
						</p>
					</div>
				</div>
			</div>

			<!-- Alertas informativas -->
			<div class="mt-8 grid md:grid-cols-2 gap-6 print:hidden">
				<Alert.Root>
					<CheckCircle class="h-4 w-4" />
					<Alert.Description>
						<strong>Cotización generada exitosamente.</strong> Puede descargar el PDF o imprimir esta cotización para sus registros.
						La cotización es válida por 30 días.
					</Alert.Description>
				</Alert.Root>
				
				<Alert.Root>
					<AlertCircle class="h-4 w-4" />
					<Alert.Description>
						<strong>¿Listo para proceder?</strong> Contacte con nuestro equipo al {quotationData.company.phone} 
						o envíe un email a {quotationData.company.email} para iniciar el proceso de blindaje.
					</Alert.Description>
				</Alert.Root>
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
