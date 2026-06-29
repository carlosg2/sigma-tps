import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';
import type {
	SpecV2State,
	SpecArticle,
	SpecificationV2,
	SpecComponentValue,
	SpecAuthStatus,
	SpecV2Status
} from './types';
import { createInitialSpecV2State } from './seed';
import { SPEC_AUTH_DEPARTMENTS } from './constants';

const STORAGE_KEY = 'tps-spec-v2-state';
const DATA_VERSION = 3;

function loadState(): SpecV2State | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (parsed._dataVersion !== DATA_VERSION || !parsed.specArticles || !parsed.specifications) {
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}
		return parsed as SpecV2State;
	} catch {
		return null;
	}
}

function saveState(state: SpecV2State) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, _dataVersion: DATA_VERSION }));
	} catch {
		// noop
	}
}

function uid(prefix: string): string {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function today(): string {
	return new Date().toISOString().split('T')[0];
}

export class SpecV2Store {
	state = $state<SpecV2State>(createInitialSpecV2State());

	constructor() {
		const saved = loadState();
		if (saved) this.state = saved;
	}

	#commit() {
		this.state.lastUpdated = new Date().toISOString();
		saveState(this.state);
	}

	// --- Especificaciones ---
	getSpec(id: string): SpecificationV2 | undefined {
		return this.state.specifications.find((s) => s.id === id);
	}

	addSpec(spec: SpecificationV2) {
		this.state.specifications = [...this.state.specifications, spec];
		this.#commit();
	}

	updateSpec(id: string, updates: Partial<SpecificationV2>) {
		this.state.specifications = this.state.specifications.map((s) =>
			s.id === id ? { ...s, ...updates, updatedAt: today() } : s
		);
		this.#commit();
	}

	setComponents(id: string, components: SpecComponentValue[], reason: string, userName: string) {
		this.state.specifications = this.state.specifications.map((s) => {
			if (s.id !== id) return s;
			const newVersion = s.version + 1;
			return {
				...s,
				components,
				version: newVersion,
				revisions: [
					...s.revisions,
					{ id: uid('srev'), version: newVersion, changedBy: userName, changedAt: today(), reason: reason || 'Actualizacion de contenido' }
				],
				updatedAt: today()
			};
		});
		this.#commit();
	}

	cloneSpec(id: string, userName: string): string | null {
		const src = this.getSpec(id);
		if (!src) return null;
		const newId = uid('spv');
		const clone: SpecificationV2 = {
			...structuredClone($state.snapshot(src)),
			id: newId,
			code: `${src.code}-COPY`,
			version: 1,
			status: 'borrador',
			authorizations: SPEC_AUTH_DEPARTMENTS.map((department) => ({
				department,
				status: 'pendiente' as SpecAuthStatus,
				authorizedBy: null,
				authorizedAt: null,
				notes: ''
			})),
			revisions: [{ id: uid('srev'), version: 1, changedBy: userName, changedAt: today(), reason: `Clonado de ${src.code}` }],
			createdAt: today(),
			updatedAt: today(),
			createdBy: userName
		};
		this.state.specifications = [...this.state.specifications, clone];
		this.#commit();
		return newId;
	}

	deleteSpec(id: string) {
		this.state.specifications = this.state.specifications.filter((s) => s.id !== id);
		this.#commit();
	}

	setStatus(id: string, status: SpecV2Status) {
		this.updateSpec(id, { status });
	}

	authorize(id: string, department: string, status: SpecAuthStatus, userName: string, notes: string) {
		this.state.specifications = this.state.specifications.map((s) => {
			if (s.id !== id) return s;
			const authorizations = s.authorizations.map((a) =>
				a.department === department
					? { ...a, status, authorizedBy: status === 'pendiente' ? null : userName, authorizedAt: status === 'pendiente' ? null : today(), notes }
					: a
			);
			const allAuthorized = authorizations.every((a) => a.status === 'autorizado');
			const anyRejected = authorizations.some((a) => a.status === 'rechazado');
			let newStatus: SpecV2Status = s.status;
			if (anyRejected) newStatus = 'en_revision';
			else if (allAuthorized) newStatus = 'autorizada';
			else if (s.status === 'borrador') newStatus = 'en_revision';
			return { ...s, authorizations, status: newStatus, updatedAt: today() };
		});
		this.#commit();
	}

	// --- Catalogo de articulos de especificacion ---
	getArticle(id: string): SpecArticle | undefined {
		return this.state.specArticles.find((a) => a.id === id);
	}

	addArticle(article: SpecArticle) {
		this.state.specArticles = [...this.state.specArticles, article];
		this.#commit();
	}

	updateArticle(id: string, updates: Partial<SpecArticle>) {
		this.state.specArticles = this.state.specArticles.map((a) =>
			a.id === id ? { ...a, ...updates, updatedAt: today() } : a
		);
		this.#commit();
	}

	cloneArticle(id: string): string | null {
		const src = this.getArticle(id);
		if (!src) return null;
		const newId = uid('sa');
		const clone: SpecArticle = {
			...structuredClone($state.snapshot(src)),
			id: newId,
			code: `${src.code}-COPY`,
			createdAt: today(),
			updatedAt: today()
		};
		this.state.specArticles = [...this.state.specArticles, clone];
		this.#commit();
		return newId;
	}

	deleteArticle(id: string) {
		this.state.specArticles = this.state.specArticles.filter((a) => a.id !== id);
		this.#commit();
	}

	resetData() {
		if (browser) localStorage.removeItem(STORAGE_KEY);
		this.state = createInitialSpecV2State();
		saveState(this.state);
	}
}

const STORE_KEY = Symbol('spec-v2-store');

export function setSpecV2Store(): SpecV2Store {
	const store = new SpecV2Store();
	setContext(STORE_KEY, store);
	return store;
}

export function useSpecV2Store(): SpecV2Store {
	const store = getContext<SpecV2Store>(STORE_KEY);
	if (!store) throw new Error('useSpecV2Store must be used within a especificaciones-v2 layout');
	return store;
}

export { uid as specUid, today as specToday };
