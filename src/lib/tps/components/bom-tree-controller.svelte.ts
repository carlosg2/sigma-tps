import { SvelteSet } from 'svelte/reactivity';
import type { BOMComponent } from '../types';

export interface TreeNode extends BOMComponent {
	children: TreeNode[];
}

// Convertir lista flat a arbol
export function buildTree(components: BOMComponent[]): TreeNode[] {
	const map = new Map<string, TreeNode>();
	const roots: TreeNode[] = [];

	components.forEach((comp) => {
		map.set(comp.id, { ...comp, children: [] });
	});

	components.forEach((comp) => {
		const node = map.get(comp.id)!;
		if (comp.parentId && map.has(comp.parentId)) {
			map.get(comp.parentId)!.children.push(node);
		} else {
			roots.push(node);
		}
	});

	const sortNodes = (nodes: TreeNode[]) => {
		nodes.sort((a, b) => a.order - b.order);
		nodes.forEach((n) => sortNodes(n.children));
	};
	sortNodes(roots);

	return roots;
}

type DragPosition = 'before' | 'after' | 'inside' | null;

export class BomTreeController {
	expanded = new SvelteSet<string>();
	draggedId = $state<string | null>(null);
	dragOverId = $state<string | null>(null);
	dragPosition = $state<DragPosition>(null);
	readOnly: boolean;

	#getComponents: () => BOMComponent[];
	#onReorder: (components: BOMComponent[]) => void;

	constructor(
		getComponents: () => BOMComponent[],
		onReorder: (components: BOMComponent[]) => void,
		readOnly = false
	) {
		this.#getComponents = getComponents;
		this.#onReorder = onReorder;
		this.readOnly = readOnly;
		// Por defecto expandir todos los kits de nivel 0
		for (const c of getComponents()) {
			if (c.isKit && c.level === 0) this.expanded.add(c.id);
		}
	}

	toggle = (id: string) => {
		if (this.expanded.has(id)) this.expanded.delete(id);
		else this.expanded.add(id);
	};

	dragStart = (id: string) => {
		this.draggedId = id;
	};

	dragOver = (e: DragEvent, id: string) => {
		e.preventDefault();
		if (id === this.draggedId) return;

		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const y = e.clientY - rect.top;
		const height = rect.height;

		const targetComp = this.#getComponents().find((c) => c.id === id);
		if (y < height * 0.25) {
			this.dragPosition = 'before';
		} else if (y > height * 0.75) {
			this.dragPosition = 'after';
		} else if (targetComp?.isKit) {
			this.dragPosition = 'inside';
		} else {
			this.dragPosition = 'after';
		}
		this.dragOverId = id;
	};

	dragEnd = () => {
		this.draggedId = null;
		this.dragOverId = null;
		this.dragPosition = null;
	};

	drop = (targetId: string) => {
		const draggedId = this.draggedId;
		const dragPosition = this.dragPosition;
		if (!draggedId || draggedId === targetId || !dragPosition) return;

		const components = this.#getComponents();
		const draggedComp = components.find((c) => c.id === draggedId);
		const targetComp = components.find((c) => c.id === targetId);
		if (!draggedComp || !targetComp) return;

		// Prevenir mover un padre dentro de sus propios hijos
		const isDescendant = (parentId: string, childId: string): boolean => {
			let current: BOMComponent | undefined = components.find((c) => c.id === childId);
			while (current?.parentId) {
				if (current.parentId === parentId) return true;
				const pid: string = current.parentId;
				current = components.find((c) => c.id === pid);
			}
			return false;
		};
		if (isDescendant(draggedId, targetId)) {
			this.dragEnd();
			return;
		}

		const updated = components.map((c) => ({ ...c }));

		const draggedIndex = updated.findIndex((c) => c.id === draggedId);
		const [dragged] = updated.splice(draggedIndex, 1);

		if (dragPosition === 'inside') {
			dragged.parentId = targetId;
			dragged.level = targetComp.level + 1;
			const siblings = updated.filter((c) => c.parentId === targetId);
			dragged.order = siblings.length;
		} else {
			dragged.parentId = targetComp.parentId;
			dragged.level = targetComp.level;
			const targetIndex = updated.findIndex((c) => c.id === targetId);
			if (dragPosition === 'before') {
				updated.splice(targetIndex, 0, dragged);
			} else {
				updated.splice(targetIndex + 1, 0, dragged);
			}
		}

		const recalcOrder = (parentId: string | null) => {
			const siblings = updated.filter((c) => c.parentId === parentId);
			siblings.forEach((s, idx) => {
				const comp = updated.find((c) => c.id === s.id);
				if (comp) comp.order = idx;
			});
		};
		recalcOrder(draggedComp.parentId);
		recalcOrder(dragged.parentId);
		if (draggedComp.parentId !== dragged.parentId && dragPosition !== 'inside') {
			recalcOrder(targetComp.parentId);
		}

		if (dragPosition === 'inside') {
			this.expanded.add(targetId);
		}

		this.#onReorder(updated);
		this.dragEnd();
	};

	expandAll = () => {
		this.expanded.clear();
		for (const c of this.#getComponents()) {
			if (c.isKit) this.expanded.add(c.id);
		}
	};

	collapseAll = () => {
		this.expanded.clear();
	};
}
