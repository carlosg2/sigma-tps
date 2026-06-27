<script lang="ts" module>
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { WithElementRef } from '$lib/utils.js';

	// Utilidades de tamaño de archivo
	export const BYTE = 1;
	export const KILOBYTE = 1000;
	export const MEGABYTE = 1000 * KILOBYTE;
	export const GIGABYTE = 1000 * MEGABYTE;

	// Utilidades para limitar tipos de archivo aceptados
	export const ACCEPT_IMAGE = 'image/*';
	export const ACCEPT_VIDEO = 'video/*';
	export const ACCEPT_AUDIO = 'audio/*';

	export function displaySize(bytes: number): string {
		if (bytes < KILOBYTE) return `${bytes.toFixed(0)} B`;
		if (bytes < MEGABYTE) return `${(bytes / KILOBYTE).toFixed(0)} KB`;
		if (bytes < GIGABYTE) return `${(bytes / MEGABYTE).toFixed(0)} MB`;
		return `${(bytes / GIGABYTE).toFixed(0)} GB`;
	}

	export type FileRejectedReason =
		| 'Maximum file size exceeded'
		| 'File type not allowed'
		| 'Maximum files uploaded';

	export type FileDropZoneProps = WithElementRef<
		Omit<HTMLInputAttributes, 'onchange'> & {
			/** Llamado con los archivos cuando el usuario los suelta o los selecciona. */
			onUpload: (files: File[]) => Promise<void>;
			/** Llamado cuando un archivo no cumple los criterios (tamaño o tipo). */
			onFileRejected?: (opts: { reason: FileRejectedReason; file: File }) => void;
			/** Numero maximo de archivos permitidos. */
			maxFiles?: number;
			/** Numero de archivos ya cargados (para validar `maxFiles`). */
			fileCount?: number;
			/** Tamaño maximo de un archivo en bytes. */
			maxFileSize?: number;
		},
		HTMLInputElement
	>;
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';
	import UploadIcon from '@lucide/svelte/icons/upload';

	let {
		ref = $bindable(null),
		onUpload,
		onFileRejected,
		maxFiles,
		fileCount,
		maxFileSize,
		accept,
		disabled = false,
		class: className,
		id = crypto.randomUUID(),
		...rest
	}: FileDropZoneProps = $props();

	let uploading = $state(false);

	function shouldAcceptFile(file: File, fileNumber: number): FileRejectedReason | undefined {
		if (maxFileSize !== undefined && file.size > maxFileSize) return 'Maximum file size exceeded';
		if (maxFiles !== undefined && fileNumber > maxFiles) return 'Maximum files uploaded';
		if (!accept) return undefined;

		const acceptedTypes = accept.split(',').map((a) => a.trim().toLowerCase());
		const fileType = file.type.toLowerCase();
		const fileName = file.name.toLowerCase();

		const isAcceptable = acceptedTypes.some((pattern) => {
			// extension como .png
			if (fileType === '' || pattern.startsWith('.')) return fileName.endsWith(pattern);
			// comodin como image/*
			if (pattern.endsWith('/*')) return fileType.startsWith(pattern.slice(0, pattern.indexOf('/*')) + '/');
			// tipo especifico como image/png
			return fileType === pattern;
		});

		return isAcceptable ? undefined : 'File type not allowed';
	}

	async function upload(uploadFiles: File[]) {
		uploading = true;
		const validFiles: File[] = [];
		for (let i = 0; i < uploadFiles.length; i++) {
			const file = uploadFiles[i];
			const reason = shouldAcceptFile(file, (fileCount ?? 0) + i + 1);
			if (reason) {
				onFileRejected?.({ reason, file });
				continue;
			}
			validFiles.push(file);
		}
		await onUpload?.(validFiles);
		uploading = false;
	}

	const canUploadFiles = $derived.by(() => {
		if (disabled) return false;
		if (uploading) return false;
		if (maxFiles !== undefined && fileCount !== undefined && fileCount >= maxFiles) return false;
		return true;
	});

	async function onchange(e: Event & { currentTarget: HTMLInputElement }) {
		if (disabled) return;
		const selected = e.currentTarget.files;
		if (!selected) return;
		await upload(Array.from(selected));
		// permite volver a subir el mismo archivo y recibir feedback
		e.currentTarget.value = '';
	}

	async function ondrop(e: DragEvent) {
		if (disabled || !canUploadFiles) return;
		e.preventDefault();
		const dropped = Array.from(e.dataTransfer?.files ?? []);
		await upload(dropped);
	}

	function ondragover(e: DragEvent) {
		e.preventDefault();
	}

	const multiple = $derived(maxFiles === undefined || maxFiles - (fileCount ?? 0) > 1);
</script>

<label
	for={id}
	aria-disabled={!canUploadFiles}
	{ondrop}
	{ondragover}
	class={cn(
		'border-border hover:bg-accent/25 group flex h-48 w-full flex-col place-items-center justify-center gap-2 rounded-lg border border-dashed p-6 transition-all hover:cursor-pointer aria-disabled:opacity-50 aria-disabled:hover:cursor-not-allowed',
		className
	)}
>
	<input
		bind:this={ref}
		{id}
		type="file"
		{accept}
		{disabled}
		{multiple}
		{onchange}
		class="hidden"
		{...rest}
	/>
	<div
		class="border-border text-muted-foreground flex size-14 place-items-center justify-center rounded-full border border-dashed"
	>
		<UploadIcon class="size-7" />
	</div>
	<div class="flex flex-col gap-0.5 text-center">
		<span class="text-muted-foreground font-medium">
			Arrastra archivos aquí, o haz clic para seleccionar
		</span>
		{#if maxFiles || maxFileSize}
			<span class="text-muted-foreground/75 text-sm">
				{#if maxFiles}<span>Puedes subir {maxFiles} archivos</span>{/if}
				{#if maxFiles && maxFileSize}<span> (hasta {displaySize(maxFileSize)} cada uno)</span>{/if}
				{#if maxFileSize && !maxFiles}<span>Tamaño máximo {displaySize(maxFileSize)}</span>{/if}
			</span>
		{/if}
	</div>
</label>
