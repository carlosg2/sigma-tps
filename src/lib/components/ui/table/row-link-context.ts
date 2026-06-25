import { getContext, setContext } from "svelte";

const ROW_LINK_KEY = Symbol("table-row-link");

export interface RowLink {
	href?: string;
	target?: string;
	title?: string;
}

export function setRowLink(link: RowLink): void {
	setContext(ROW_LINK_KEY, link);
}

export function getRowLink(): RowLink | undefined {
	return getContext(ROW_LINK_KEY);
}
