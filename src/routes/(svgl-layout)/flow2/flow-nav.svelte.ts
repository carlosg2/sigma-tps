import { goto } from '$app/navigation';

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

type HistoryEntry = {
	/** Ruta desde la que se navegó (a donde volvemos con "atrás"). */
	from: string;
	/** Transición usada para llegar, se reutiliza (invertida) al volver. */
	transition: FlowTransition;
};

/**
 * Estado reactivo compartido entre el layout y las páginas de /flow2.
 *
 * El layout lee `transition` y `direction` dentro del callback `classes()`
 * de `setupViewTransition` para decidir qué animación aplicar en cada
 * navegación. Las páginas escriben estos valores justo antes de `goto`.
 */
class FlowNav {
	transition = $state<FlowTransition>('fade');
	direction = $state<FlowDirection>('forward');
	history = $state<HistoryEntry[]>([]);

	/** ¿Hay algo en el historial para volver atrás? */
	get canGoBack() {
		return this.history.length > 0;
	}
}

export const flowNav = new FlowNav();

/**
 * Navega hacia adelante aplicando `transition`.
 * @param from ruta actual (para poder volver a ella)
 * @param to ruta destino
 * @param transition tipo de animación
 */
export function flowForward(from: string, to: string, transition: FlowTransition) {
	flowNav.history = [...flowNav.history, { from, transition }];
	flowNav.transition = transition;
	flowNav.direction = 'forward';
	return goto(to);
}

/**
 * Navega hacia atrás reutilizando la transición con la que se llegó,
 * pero en dirección inversa. Si no hay historial usa `fallback`.
 */
export function flowBack(fallback = '/flow2') {
	const last = flowNav.history.at(-1);
	flowNav.history = flowNav.history.slice(0, -1);
	flowNav.transition = last?.transition ?? 'fade';
	flowNav.direction = 'backward';
	return goto(last?.from ?? fallback);
}
