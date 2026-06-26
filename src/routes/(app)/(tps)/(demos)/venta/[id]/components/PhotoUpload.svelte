<script lang="ts">
	import { 
		FileDropZone, 
		MEGABYTE, 
		displaySize,
		ACCEPT_IMAGE,
		type FileDropZoneProps
	} from '$lib/components/extras/file-drop-zone';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { Camera, X, Image } from '@lucide/svelte';
	import { Progress } from '$lib/components/ui/progress';

	let { 
		form, 
		name, 
		title, 
		files = $bindable(),
		maxFiles = 3,
		capture = "environment",
		API_CONFIG
	}: {
		form: any;
		name: string;
		title: string;
		files: File[];
		maxFiles?: number;
		capture?: "user" | "environment" | boolean;
		API_CONFIG: {
			url: string;
			token: string;
			path: string;
			timeout: number;
			maxFileSize: number;
			acceptedTypes: string[];
		};
	} = $props();

	// Estado simplificado: solo para UI de progress/preview
	type FileWithMeta = {
		file: File;
		url: string;
		isUploading: boolean;
		uploadedAt: number;
		progress?: number;
	};

	let fileMetadata = $state<Map<string, FileWithMeta>>(new Map());

	// Validación del lado del cliente
	const validateFile = (file: File): string | null => {
		if (file.size > API_CONFIG.maxFileSize) {
			return `${file.name}: El archivo es demasiado grande (max ${Math.round(API_CONFIG.maxFileSize / 1024 / 1024)}MB)`;
		}
		if (!API_CONFIG.acceptedTypes.includes(file.type)) {
			return `${file.name}: Solo se permiten imágenes (${API_CONFIG.acceptedTypes.join(', ')})`;
		}
		if ((files || []).length >= maxFiles) {
			return `Máximo ${maxFiles} fotos permitidas`;
		}
		// Prevenir duplicados
		if (Array.from(files || []).some(f => f.name === file.name && f.size === file.size)) {
			return `${file.name}: La foto ya está agregada`;
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
			// Upload real a la API
			await uploadFileToAPI(file, fileKey);

			// Actualizar estado a completado
			const meta = fileMetadata.get(fileKey);
			if (meta) {
				fileMetadata.set(fileKey, { ...meta, isUploading: false, progress: 100 });
			}

			// Actualizar los archivos
			const currentFiles = Array.from(files || []);
			currentFiles.push(file);
			files = currentFiles;

			toast.success(`Foto de ${title} agregada exitosamente`);
		} catch (error) {
			// Manejar error
			const meta = fileMetadata.get(fileKey);
			if (meta) {
				fileMetadata.set(fileKey, { ...meta, isUploading: false, progress: 0 });
			}
			
			console.error('Upload failed:', error);
			toast.error(`Error al subir foto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
			
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
				reject(new Error('Error de red al subir archivo'));
			});

			xhr.addEventListener('abort', () => {
				reject(new Error('Upload cancelado'));
			});

			xhr.addEventListener('timeout', () => {
				reject(new Error('Timeout al subir archivo'));
			});

			// Configurar request
			xhr.open('POST', API_CONFIG.url);
			xhr.timeout = API_CONFIG.timeout;
			
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

		// Procesar archivos válidos uno por uno
		for (const file of validFiles) {
			await processFile(file);
		}
	};

	const removeFile = (fileToRemove: File) => {
		const fileKey = `${fileToRemove.name}-${fileToRemove.size}`;
		
		// Remover de metadata
		const meta = fileMetadata.get(fileKey);
		if (meta) {
			URL.revokeObjectURL(meta.url);
			fileMetadata.delete(fileKey);
		}
		
		// Remover del array de archivos
		files = files.filter(f => f !== fileToRemove);
		
		toast.success('Foto eliminada');
	};

	// Función para obtener la metadata de un archivo
	const getFileMetadata = (file: File) => {
		const fileKey = `${file.name}-${file.size}`;
		return fileMetadata.get(fileKey);
	};

	// Inicializar metadata para archivos existentes
	$effect(() => {
		if (files && files.length > 0) {
			files.forEach(file => {
				const fileKey = `${file.name}-${file.size}`;
				if (!fileMetadata.has(fileKey)) {
					const url = URL.createObjectURL(file);
					fileMetadata.set(fileKey, {
						file,
						url,
						isUploading: false,
						uploadedAt: Date.now(),
						progress: 100
					});
				}
			});
		}
	});
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h4 class="text-sm font-medium text-foreground">
			Fotos de {title}
		</h4>
		<Badge variant="secondary" class="text-xs">
			{files.length} / {maxFiles}
		</Badge>
	</div>

	<!-- File Drop Zone -->
	<FileDropZone
		{onUpload}
		maxFiles={maxFiles}
		fileCount={files.length}
		maxFileSize={API_CONFIG.maxFileSize}
		accept={API_CONFIG.acceptedTypes.join(', ')}
		{capture}
		class="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
		disabled={files.length >= maxFiles}
		onFileRejected={({ reason, file }) => {
			toast.error(`${file.name}: ${reason}`);
		}}
	>
		<div class="flex flex-col items-center justify-center gap-2 py-8 text-center">
			<div class="flex items-center gap-2">
				<Camera class="size-6 text-muted-foreground" />
				<Image class="size-6 text-muted-foreground" />
			</div>
			<div class="text-sm text-muted-foreground">
				<p class="font-medium">Toca para tomar una foto o seleccionar desde galería</p>
				<p class="text-xs mt-1">
					Máximo {maxFiles} fotos • Solo imágenes • Máx {Math.round(API_CONFIG.maxFileSize / 1024 / 1024)}MB cada una
				</p>
			</div>
		</div>
	</FileDropZone>

	<!-- Preview de archivos subidos -->
	{#if files.length > 0}
		<div class="grid grid-cols-3 gap-3">
			{#each files as file}
				{@const meta = getFileMetadata(file)}
				<div class="relative group">
					<div class="aspect-square overflow-hidden rounded-lg border border-border bg-muted">
						{#if meta?.url}
							<img 
								src={meta.url} 
								alt="Preview de {file.name}"
								class="w-full h-full object-cover"
							/>
						{:else}
							<div class="w-full h-full flex items-center justify-center">
								<Image class="size-8 text-muted-foreground" />
							</div>
						{/if}
						
						<!-- Overlay de carga -->
						{#if meta?.isUploading}
							<div class="absolute inset-0 bg-black/50 flex items-center justify-center">
								<div class="text-center text-white">
									<div class="text-xs mb-1">Subiendo...</div>
									<Progress value={meta.progress || 0} class="w-16 h-1" />
								</div>
							</div>
						{/if}
						
						<!-- Botón eliminar -->
						{#if !meta?.isUploading}
							<button
								type="button"
								onclick={() => removeFile(file)}
								class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full transition-opacity hover:bg-red-600"
							>
								<X class="size-3" />
							</button>
						{/if}
					</div>
					
					<!-- Info del archivo -->
					<div class="mt-1 text-xs text-muted-foreground text-center truncate">
						{displaySize(file.size)}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
