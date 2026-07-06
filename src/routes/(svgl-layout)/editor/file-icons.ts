import type { Component } from 'svelte';
import FileCode from '@lucide/svelte/icons/file-code-2';
import FileText from '@lucide/svelte/icons/file-text';
import FileJson from '@lucide/svelte/icons/file-json';
import FileTerminal from '@lucide/svelte/icons/file-terminal';
import FileType from '@lucide/svelte/icons/file-type';
import File from '@lucide/svelte/icons/file';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFileIcon(name: string): Component<any> {
	const ext = name.split('.').pop()?.toLowerCase() ?? '';
	switch (ext) {
		case 'md':
		case 'txt':
			return FileText;
		case 'ts':
		case 'js':
		case 'svelte':
		case 'tsx':
		case 'jsx':
			return FileCode;
		case 'json':
			return FileJson;
		case 'sh':
		case 'bash':
		case 'zsh':
			return FileTerminal;
		case 'css':
		case 'html':
			return FileType;
		default:
			return File;
	}
}
