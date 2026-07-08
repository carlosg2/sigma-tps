/**
 * /flow3 — La transición vive DENTRO de cada página.
 *
 * Cada `+page.svelte` declara su transición en su bloque `<script module>`
 * llamando a `defineTransition(pathname, transition)`. SvelteKit importa el
 * módulo de la ruta destino ANTES de disparar `onNavigate` (donde el layout
 * resuelve la animación), así que la entrada ya está registrada cuando se
 * necesita — incluso en la PRIMERA visita a la página.
 *
 * Modelo: la transición es una propiedad de la PÁGINA.
 *   - Al ENTRAR a la página (forward, es el destino) → se reproduce.
 *   - Al SALIR de la página (backward, es el origen)  → se reproduce invertida.
 *
 * No hay stack ni registro de navegación: todo se deriva de (from, to,
 * dirección) + esta tabla que las propias páginas rellenan. Navegar con
 * `goto()` o `<a href>` normales funciona sin ninguna función especial.
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

/** Transición declarada por cada página (pathname → transición). */
const registry = new Map<string, FlowTransition>();

/**
 * Registra la transición de una página. Se llama desde el `<script module>`
 * de cada `+page.svelte`, de modo que la CONFIG vive dentro de la página.
 * Devuelve el mismo valor para poder reutilizarlo en el título de la página.
 */
export function defineTransition(pathname: string, transition: FlowTransition): FlowTransition {
	registry.set(pathname, transition);
	return transition;
}

type NavInfo = {
	type: string;
	delta?: number | null;
	from?: { url: URL } | null;
	to?: { url: URL } | null;
};

/**
 * Resuelve `[transición, dirección]` a partir SÓLO del objeto `navigation`.
 *
 *  - popstate delta < 0 → «atrás»: la página que dejamos (`from`) se va con
 *    SU transición, invertida.
 *  - popstate delta > 0 → «adelante» del navegador: la página destino (`to`)
 *    entra con SU transición.
 *  - resto (goto/href)  → forward: el destino (`to`) entra con SU transición.
 *
 * Como la transición pertenece a la página, romper la secuencia de navegación
 * (ir a otra ruta en vez de volver) nunca aplica la animación equivocada.
 */
export function resolveTransition(nav: NavInfo): [FlowTransition, FlowDirection] {
	const isBack = nav.type === 'popstate' && (nav.delta ?? 0) < 0;
	const path = (isBack ? nav.from?.url.pathname : nav.to?.url.pathname) ?? '';
	return [registry.get(path) ?? 'fade', isBack ? 'backward' : 'forward'];
}
