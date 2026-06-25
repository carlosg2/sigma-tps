<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		displaySize,
		FileDropZone,
		MEGABYTE,
		type FileDropZoneProps
	} from '$lib/components/extras/file-drop-zone';
	import { Progress } from '$lib/components/ui/progress';
	import XIcon from '@lucide/svelte/icons/x';
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { type SuperValidated, superForm, filesProxy } from 'sveltekit-superforms';
	import SuperDebug from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { schema, type Schema } from './schema';

	let { data }: { data: { form: SuperValidated<Schema> } } = $props();

	// Configuración de la API
	const API_CONFIG = {
		url: 'https://api.maserp.mx/api/upload',
		token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImFkbWluQHNlcHJvYmFuLmNvbS5teCIsIm5iZiI6MTc1MzczMjcwMywiZXhwIjoxODQzNzMyNzAzLCJpYXQiOjE3NTM3MzI3MDMsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.OYPiY9HXvSyY4L_Je-Cf0wmbE2oKzC8V5VNUVfI1-u4',
		path: 'D:\\PruebaCG'
	};

	// Estado simplificado: solo para UI de progress/preview
	type FileWithMeta = {
		file: File;
		url: string;
		isUploading: boolean;
		uploadedAt: number;
		progress?: number;
		xhr?: XMLHttpRequest; // Para poder cancelar uploads
	};

	let fileMetadata = $state<Map<string, FileWithMeta>>(new Map());

	const form = superForm(data.form, {
		validators: zodClient(schema),
		SPA: true,
		onUpdated: ({ form }) => {
			if (form.valid) {
				toast.success('Files uploaded successfully!', {
					description: 'Your attachments were processed.'
				});
				console.log('Files to upload:', form.data.attachments);
				// Limpiar metadata después del envío exitoso
				fileMetadata.clear();
			}
		}
	});

	const { form: formData, enhance } = form;
	// Esta es la única fuente de verdad para los archivos
	const files = filesProxy(form, 'attachments');

	const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

	// Validación del lado del cliente para ahorrar ancho de banda
	const validateFile = (file: File): string | null => {
		if (file.size > 2 * MEGABYTE) {
			return `${file.name}: El archivo es demasiado grande (max 2MB)`;
		}
		if (!file.type.startsWith('image/')) {
			return `${file.name}: Solo se permiten imágenes`;
		}
		if (($files || []).length >= 4) {
			return 'Máximo 4 archivos permitidos';
		}
		// Prevenir duplicados
		if (Array.from($files || []).some(f => f.name === file.name && f.size === file.size)) {
			return `${file.name}: El archivo ya está agregado`;
		}
		return null;
	};

	const processFile = async (file: File) => {
		// Crear URL para preview inmediatamente
		const url = URL.createObjectURL(file);
		const fileKey = `${file.name}-${file.size}`;
		
		// Agregar metadata para UI
		fileMetadata.set(fileKey, {
			file,
			url,
			isUploading: true,
			uploadedAt: Date.now(),
			progress: 0
		});

		try {
			// Realizar upload real a la API
			await uploadFileToAPI(file, fileKey);

			// Actualizar estado a completado
			const meta = fileMetadata.get(fileKey);
			if (meta) {
				fileMetadata.set(fileKey, { ...meta, isUploading: false, progress: 100, xhr: undefined });
			}

			// Actualizar el filesProxy (fuente de verdad)
			const currentFiles = Array.from($files || []);
			currentFiles.push(file);
			files.set(currentFiles);

			toast.success(`${file.name} uploaded successfully!`);
		} catch (error) {
			// Manejar error
			const meta = fileMetadata.get(fileKey);
			if (meta) {
				fileMetadata.set(fileKey, { ...meta, isUploading: false, progress: 0, xhr: undefined });
			}
			
			console.error('Upload failed:', error);
			toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
			
			// Remover archivo del estado si falló
			fileMetadata.delete(fileKey);
		}
	};

	const uploadFileToAPI = async (file: File, fileKey: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			const formData = new FormData();
			formData.append('archivo', file);
			formData.append('path', API_CONFIG.path);

			const xhr = new XMLHttpRequest();

			// Almacenar referencia del XHR para poder cancelar
			const meta = fileMetadata.get(fileKey);
			if (meta) {
				fileMetadata.set(fileKey, { ...meta, xhr });
			}

			// Configurar progreso
			xhr.upload.addEventListener('progress', (event) => {
				if (event.lengthComputable) {
					const progress = (event.loaded / event.total) * 100;
					const currentMeta = fileMetadata.get(fileKey);
					if (currentMeta) {
						fileMetadata.set(fileKey, { ...currentMeta, progress });
					}
				}
			});

			// Configurar respuesta
			xhr.addEventListener('load', () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					try {
						const response = JSON.parse(xhr.responseText);
						console.log('Upload successful:', response);
						resolve();
					} catch (e) {
						// Si no es JSON válido, asumir éxito si status es 2xx
						resolve();
					}
				} else {
					reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
				}
			});

			xhr.addEventListener('error', () => {
				reject(new Error('Network error'));
			});

			xhr.addEventListener('abort', () => {
				reject(new Error('Upload cancelled'));
			});

			xhr.addEventListener('timeout', () => {
				reject(new Error('Upload timeout'));
			});

			// Configurar request
			xhr.open('POST', API_CONFIG.url);
			xhr.timeout = 30000; // 30 segundos timeout
			
			// Headers (sin Content-Type para que el browser lo configure automáticamente con boundary)
			xhr.setRequestHeader('accept', '*/*');
			xhr.setRequestHeader('authorization', `Bearer ${API_CONFIG.token}`);
			
			// Enviar
			xhr.send(formData);
		});
	};

	const onUpload: FileDropZoneProps['onUpload'] = async (newFiles) => {
		// Validación del lado del cliente
		const validFiles: File[] = [];
		
		for (const file of newFiles) {
			const error = validateFile(file);
			if (error) {
				toast.error(error);
				continue;
			}
			validFiles.push(file);
		}

		// Procesar archivos válidos
		await Promise.allSettled(validFiles.map(processFile));
	};

	const onFileRejected: FileDropZoneProps['onFileRejected'] = async ({ reason, file }) => {
		toast.error(`${file.name} failed to upload!`, { description: reason });
	};

	const removeFile = (fileToRemove: File) => {
		const fileKey = `${fileToRemove.name}-${fileToRemove.size}`;
		const meta = fileMetadata.get(fileKey);
		
		// Cancelar upload si está en progreso
		if (meta?.xhr && meta.isUploading) {
			meta.xhr.abort();
		}
		
		// Limpiar URL del objeto
		if (meta?.url) {
			URL.revokeObjectURL(meta.url);
		}
		
		// Remover de metadata
		fileMetadata.delete(fileKey);
		
		// Actualizar filesProxy (fuente de verdad)
		const currentFiles = Array.from($files || []);
		const newFiles = currentFiles.filter(file => 
			!(file.name === fileToRemove.name && file.size === fileToRemove.size)
		);
		files.set(newFiles);
	};

	const cancelUpload = (file: File) => {
		const fileKey = `${file.name}-${file.size}`;
		const meta = fileMetadata.get(fileKey);
		
		if (meta?.xhr && meta.isUploading) {
			meta.xhr.abort();
			toast.info(`Upload of ${file.name} cancelled`);
		}
	};

	// Derived state for UI
	let filesWithMetadata = $derived(
		$files ? Array.from($files).map(file => {
			const fileKey = `${file.name}-${file.size}`;
			return {
				file,
				...fileMetadata.get(fileKey) || {}
			};
		}) : []
	);

	let isAnyFileUploading = $derived(
		Array.from(fileMetadata.values()).some(metadata => metadata.isUploading)
	);

	onDestroy(() => {
		// Limpiar todas las URLs y cancelar uploads en progreso
		for (const meta of fileMetadata.values()) {
			if (meta.url) {
				URL.revokeObjectURL(meta.url);
			}
			if (meta.xhr && meta.isUploading) {
				meta.xhr.abort();
			}
		}
	});
</script>

<form
	enctype="multipart/form-data"
	use:enhance
	class="flex w-full flex-col gap-6 p-6"
>
	<div class="space-y-2">
		<h3 class="text-lg font-semibold">Upload con Cámara Trasera</h3>
		<p class="text-sm text-muted-foreground">En móviles abrirá directamente la cámara trasera</p>
		<FileDropZone
      class="h-12 w-12"
			{onUpload}
			{onFileRejected}
			maxFileSize={2 * MEGABYTE}
			accept="image/*"
			capture="environment"
			maxFiles={4}
			fileCount={($files || []).length}
		/>
	</div>
	
	<!-- Hidden input for Superforms compatibility -->
	<input name="attachments" type="file" bind:files={$files} class="hidden" />
	
	<div class="flex flex-col gap-2">
		{#each filesWithMetadata as fileData (fileData.file.name)}
			<div class="flex place-items-center justify-between gap-2">
				<div class="flex place-items-center gap-2">
					<div class="relative size-9 overflow-hidden rounded">
						<img
							src={fileData.url}
							alt={fileData.file.name}
							class="absolute top-1/2 left-1/2 h-full w-full object-cover -translate-x-1/2 -translate-y-1/2"
						/>
					</div>
					<div class="flex flex-col">
						<span class="text-sm font-medium">{fileData.file.name}</span>
						<span class="text-muted-foreground text-xs">{displaySize(fileData.file.size)}</span>
					</div>
				</div>
				
				{#if fileData.isUploading}
					<div class="flex items-center gap-2 flex-1 max-w-40">
						<Progress
							class="h-2 flex-1"
							value={fileData.progress || 0}
							max={100}
						/>
						<span class="text-xs text-muted-foreground min-w-8">
							{Math.round(fileData.progress || 0)}%
						</span>
						<Button
							variant="outline"
							size="icon"
							class="h-6 w-6"
							onclick={() => cancelUpload(fileData.file)}
							title="Cancel upload"
						>
							<XIcon class="h-3 w-3" />
						</Button>
					</div>
				{:else}
					<Button
						variant="outline"
						size="icon"
						onclick={() => removeFile(fileData.file)}
					>
						<XIcon class="h-4 w-4" />
					</Button>
				{/if}
			</div>
		{/each}
	</div>
	
	<Button 
		type="submit" 
		class="w-fit" 
		disabled={isAnyFileUploading}
	>
		{isAnyFileUploading 
			? `Uploading... (${Array.from(fileMetadata.values()).filter(m => m.isUploading).length}/${filesWithMetadata.length})` 
			: `Submit (${filesWithMetadata.length} files)`}
	</Button>
	
	<SuperDebug data={$formData} />
</form>