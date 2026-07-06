// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// Shiki themes only ship .mjs without separate .d.ts — suppress TS errors
declare module '@shikijs/themes/*' {
	import type { ThemeRegistration } from 'shiki';
	const theme: ThemeRegistration;
	export default theme;
}

export {};
