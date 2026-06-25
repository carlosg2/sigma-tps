import type { Component } from "svelte";

export type NavItem = {
	title: string;
	href?: string;
	disabled?: boolean;
	external?: boolean;
	label?: string;
	icon?: Component;
};

export type SidebarNavItem = NavItem & {
	items: SidebarNavItem[];
};

export type NavItemWithChildren = NavItem & {
	items: NavItemWithChildren[];
};

// Static content data to replace the missing $content imports
const components = [
	{ title: "Components", slug: "components" },
	{ title: "Accordion", slug: "accordion" },
	{ title: "Alert", slug: "alert" },
	{ title: "Alert Dialog", slug: "alert-dialog" },
	{ title: "Avatar", slug: "avatar" },
	{ title: "Badge", slug: "badge" },
	{ title: "Breadcrumb", slug: "breadcrumb" },
	{ title: "Button", slug: "button" }
];




function generateComponentsNav(): SidebarNavItem[] {
	const componentsNavItems: SidebarNavItem[] = [];
	const index = components.find((doc) => doc.title === "Components");
	if (index) {
		componentsNavItems.push({
			title: index.title,
			href: `/docs/components`,
			items: [],
		});
	}

	for (const doc of components) {
		if (doc.title === "Components") continue;
		componentsNavItems.push({
			title: doc.title,
			href: `/docs/components/${doc.slug}`,
			items: [],
		});
	}

	return componentsNavItems;
}

function generateDarkModeNav(): SidebarNavItem[] {
	const darkModeNavItems: SidebarNavItem[] = [
		{
			title: "Svelte",
			href: "/docs/dark-mode/svelte",
			items: [],
		},
		{
			title: "Astro",
			href: "/docs/dark-mode/astro",
			items: [],
		},
	];

	return darkModeNavItems;
}

function generateRegistryNav(): SidebarNavItem[] {
	const registryNavItems: SidebarNavItem[] = [
		{
			title: "Registry",
			href: "/docs/registry",
			items: [],
		},
		{
			title: "Getting Started",
			href: "/docs/registry/getting-started",
			items: [],
		},
		{
			title: "FAQ",
			href: "/docs/registry/faq",
			items: [],
		},
		{
			title: "Examples",
			href: "/docs/registry/examples",
			items: [],
		},
		{
			title: "registry.json",
			href: "/docs/registry/registry-json",
			items: [],
		},
		{
			title: "registry-item.json",
			href: "/docs/registry/registry-item-json",
			items: [],
		},
	];

	return registryNavItems;
}




const componentsNav = generateComponentsNav();
const darkModeNav = generateDarkModeNav();
const registryNav = generateRegistryNav();

export const sidebarNavItems: SidebarNavItem[] = [
	
	{
		title: "Components",
		items: componentsNav.filter((item) => item.title !== "Components"),
	},
	{
		title: "Dark Mode",
		items: darkModeNav,
	},
	{
		title: "Registry",
		items: registryNav,
	},
];

export const mainNavItems: NavItem[] = [
	{
		title: "Docs",
		href: "/docs",
	}
];

export function getFullNavItems(): Array<SidebarNavItem & { index: number }> {
	return [
		...componentsNav,
		...darkModeNav.filter((item) => item.title !== "Dark Mode"),
		...registryNav,
	].map((item, index) => ({
		...item,
		index,
	}));
}

const fullNavItems = getFullNavItems();

export function findNeighbors(pathName: string): {
	previous: SidebarNavItem | null;
	next: SidebarNavItem | null;
} {
	const path = pathName.split("?")[0].split("#")[0];
	const index = fullNavItems.findIndex((item) => item.href === path);
	const previous = fullNavItems[index - 1] ?? null;
	const next = fullNavItems[index + 1] ?? null;
	return { previous, next };
}
