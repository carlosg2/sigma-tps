/**
 * /flow3 — La transición vive en los datos de cada página.
 *
 * Cada `+page.js` declara `export function load() { return { transition: 'xxx' } }`.
 * El layout lee `$page.data.transition` aplicando las clases CSS en el momento
 * correcto del ciclo de la view transition:
 *
 *   - backward: `before-start-view-transition` → $page aún es la página origen.
 *   - forward:  `after-navigation-complete`    → $page ya es la página destino,
 *               pero el callback de startViewTransition aún no terminó (el nuevo
 *               snapshot todavía no se ha tomado).
 */

export type FlowTransition =
	| 'fade'
	| 'push'
	| 'cover'
	| 'cover-v'
	| 'dive'
	| 'parallax'
	| 'flip'
	| 'circle'
	| 'android-fade'
	| 'android-fade-rtl';

export type FlowDirection = 'forward' | 'backward';

export const ALL_FLOW_TRANSITIONS: FlowTransition[] = [
	'fade', 'push', 'cover', 'cover-v', 'dive', 'parallax', 'flip', 'circle', 'android-fade', 'android-fade-rtl'
];
