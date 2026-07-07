import { goto } from '$app/navigation';
import { browser } from '$app/environment';

/**
 * Tipos de transición disponibles para la demo /flow2.
 * Cada valor mapea a una clase CSS aplicada al <html> durante la
 * view-transition (ver transitions.css).
 */
export type FlowTransition =
	| 'fade'
	| 'push'
	| 'cover'
	| 'cover-v'
	| 'dive'
	| 'parallax'
	| 'flip'
	| 'circle';

export type FlowDirection = 'forward' | 'backward';

/**
 * Transición POR DEFECTO de cada ruta.
 *
 * Modelo: la transición es una propiedad de la RUTA, no de un botón.
 *  - Al navegar HACIA la ruta (forward) → se reproduce.
 *  - Al SALIR de la ruta (backward)     → se reproduce invertida.
 *
 * La animación se deriva puramente de (from, to, dirección); no hay stack
 * ni registro de navegación que mantener. Por eso romper la secuencia
 * (p. ej. hacer clic en otro enlace en vez de «atrás») nunca la corrompe.
 */
export const routeTransitions: Record<string, FlowTransition> = {
	'/flow2': 'fade',
	'/flow2/detail': 'push',
	'/flow2/extra': 'parallax'
};

/**
 * Memo de «última transición con la que se entró a cada ruta».
 *
 * NO es un stack: hay como mucho UNA entrada por ruta y se sobrescribe en
 * cada navegación forward, así que siempre refleja cómo llegaste por última
 * vez a esa ruta. Sirve para dos cosas:
 *   1. Al volver atrás (backward)             → invertir esa misma transición.
 *   2. Con el botón «adelante» del navegador  → repetir esa misma transición.
 * Al estar acotado a una entrada por ruta, es imposible que se corrompa
 * aunque el usuario navegue de forma no lineal.
 */
const lastEnter = new Map<string, FlowTransition>();

/**
 * Override de un solo uso para la SIGUIENTE navegación forward.
 * Lo usa el «picker» de la home para forzar una transición concreta hacia
 * un mismo destino. La navegación normal (goto/href) no lo toca.
 */
let pendingOverride: FlowTransition | null = null;

/**
 * Navega forzando una transición concreta (picker de la demo).
 * Para navegación NORMAL usa `goto(...)` o `<a href>` directamente: la ruta
 * destino ya define su propia transición por defecto.
 */
export function navigateWith(to: string, transition: FlowTransition) {
	pendingOverride = transition;
	return goto(to);
}

/** Vuelve atrás en el historial del navegador (equivale al botón «atrás»). */
export function flowBack() {
	if (browser) window.history.back();
}

type NavInfo = {
	type: string;
	delta?: number | null;
	from?: { url: URL } | null;
	to?: { url: URL } | null;
};

/**
 * Resuelve `[transición, dirección]` para una navegación a partir SÓLO del
 * objeto `navigation` del router. Es la única fuente de verdad; no depende
 * de estado externo que pueda quedar desincronizado.
 *
 *  - popstate delta < 0  → «atrás» (botón interno o del navegador):
 *      invierte la transición con la que se entró a la página que dejamos.
 *  - popstate delta > 0  → «adelante» del navegador:
 *      repite la transición con la que se entró a la página destino.
 *  - resto (goto/href)   → forward:
 *      usa el override (si lo hay) o la transición por defecto del destino,
 *      y la memoriza para el back futuro.
 */
export function resolveTransition(nav: NavInfo): [FlowTransition, FlowDirection] {
	const delta = nav.delta ?? 0;

	if (nav.type === 'popstate' && delta < 0) {
		const path = nav.from?.url.pathname ?? '';
		return [lastEnter.get(path) ?? routeTransitions[path] ?? 'fade', 'backward'];
	}

	if (nav.type === 'popstate' && delta > 0) {
		const path = nav.to?.url.pathname ?? '';
		return [lastEnter.get(path) ?? routeTransitions[path] ?? 'fade', 'forward'];
	}

	// Navegación forward normal (goto / href / navigateWith).
	const path = nav.to?.url.pathname ?? '';
	const t = pendingOverride ?? routeTransitions[path] ?? 'fade';
	pendingOverride = null;
	lastEnter.set(path, t);
	return [t, 'forward'];
}
