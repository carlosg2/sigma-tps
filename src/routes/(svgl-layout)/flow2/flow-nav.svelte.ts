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

// ─── Persistencia en sessionStorage ─────────────────────────────────────────
// Cada pestaña tiene su propia sessionStorage, así que no hay colisiones.
const BACK_KEY = 'flow2:back';
const FWD_KEY  = 'flow2:fwd';

function readStack(key: string): FlowTransition[] {
	if (!browser) return [];
	try { return JSON.parse(sessionStorage.getItem(key) ?? '[]'); } catch { return []; }
}

function writeStack(key: string, stack: FlowTransition[]) {
	if (!browser) return;
	try { sessionStorage.setItem(key, JSON.stringify(stack)); } catch { /* noop */ }
}

// ─── Estado reactivo ─────────────────────────────────────────────────────────

/**
 * Estado reactivo compartido entre el layout y las páginas de /flow2.
 *
 * - `backStack`: transiciones usadas para llegar aquí (más reciente al final).
 *   Al retroceder: pop → usamos esa transición invertida.
 * - `fwdStack`: transiciones guardadas al retroceder (más reciente al final).
 *   Al avanzar con el botón forward del navegador: pop → usamos esa transición.
 *
 * Ambos stacks se persisten en sessionStorage para sobrevivir recargas.
 * La hidratación ocurre en el onMount del layout (cliente).
 */
class FlowNav {
	transition = $state<FlowTransition>('fade');
	direction  = $state<FlowDirection>('forward');

	private _back = $state<FlowTransition[]>([]);
	private _fwd  = $state<FlowTransition[]>([]);

	/** Hidrata los stacks desde sessionStorage (llamar en onMount). */
	hydrate() {
		this._back = readStack(BACK_KEY);
		this._fwd  = readStack(FWD_KEY);
	}

	get canGoBack()    { return this._back.length > 0; }
	get canGoForward() { return this._fwd.length > 0; }

	pushBack(t: FlowTransition) {
		this._back = [...this._back, t];
		writeStack(BACK_KEY, this._back);
	}

	/** Quita y devuelve la transición más reciente del back-stack. */
	popBack(): FlowTransition | undefined {
		const last = this._back.at(-1);
		this._back = this._back.slice(0, -1);
		writeStack(BACK_KEY, this._back);
		return last;
	}

	pushFwd(t: FlowTransition) {
		this._fwd = [...this._fwd, t];
		writeStack(FWD_KEY, this._fwd);
	}

	/** Quita y devuelve la transición más reciente del forward-stack. */
	popFwd(): FlowTransition | undefined {
		const last = this._fwd.at(-1);
		this._fwd = this._fwd.slice(0, -1);
		writeStack(FWD_KEY, this._fwd);
		return last;
	}

	/** Borra el forward-stack (nueva rama de navegación). */
	clearFwd() {
		this._fwd = [];
		writeStack(FWD_KEY, []);
	}
}

export const flowNav = new FlowNav();

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Navega hacia adelante aplicando `transition`.
 * Limpia el forward-stack porque se inicia una nueva rama.
 *
 * @param _from  ruta actual (ya no se usa para navegar, el browser la recuerda)
 * @param to     ruta destino
 * @param transition tipo de animación
 */
export function flowForward(_from: string, to: string, transition: FlowTransition) {
	flowNav.pushBack(transition);
	flowNav.clearFwd();
	flowNav.transition = transition;
	flowNav.direction  = 'forward';
	return goto(to);
}

/**
 * Retrocede en el historial del navegador.
 *
 * Usa `history.back()` en lugar de `goto()` para que TODOS los retrocesos
 * (botón interno o back del navegador) pasen por el mismo handler `popstate`
 * del layout, que pop-ea el back-stack y aplica la transición correcta.
 */
export function flowBack() {
	if (browser) window.history.back();
}
