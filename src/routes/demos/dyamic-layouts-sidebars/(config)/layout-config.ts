import type { HugeIconsIconName } from "$lib/registry/icons/__hugeicons__/index.js";
import type { LucideIconName } from "$lib/registry/icons/__lucide__/index.js";
import type { TablerIconName } from "$lib/registry/icons/__tabler__/index.js";
import type { PhosphorIconName } from "$lib/registry/icons/__phosphor__/index.js";
import type { RemixIconIconName } from "$lib/registry/icons/__remixicon__/index.js";

export type IconSet = {
	lucide: LucideIconName;
	tabler: TablerIconName;
	hugeicons: HugeIconsIconName;
	phosphor: PhosphorIconName;
	remixicon: RemixIconIconName;
};

export type Variant = "sidebar" | "floating" | "inset";
export type Collapsible = "offcanvas" | "icon" | "none";
export type Side = "left" | "right";
export type Width = "compact" | "default" | "comfortable";
export type AppHeader = "inset" | "global";
export type HeaderMode = "none" | "brand" | "workspace" | "version";
export type FooterMode = "none" | "user" | "account" | "card";
export type NavStyle = "tree" | "flat" | "groups";
export type MenuAction = "collapsible" | "dropdown" | "none";

export type LayoutConfig = {
	// Structure
	variant: Variant;
	collapsible: Collapsible;
	side: Side;
	open: boolean;
	width: Width;
	// Header / chrome
	appHeader: AppHeader;
	headerMode: HeaderMode;
	showSearch: boolean;
	showBreadcrumb: boolean;
	headerBorder: boolean;
	// Content
	navStyle: NavStyle;
	menuAction: MenuAction;
	footerMode: FooterMode;
	// Extras
	dualSidebar: boolean;
	showSecondary: boolean;
	showRail: boolean;
	showBadges: boolean;
	showGroupAction: boolean;
	showSeparators: boolean;
	loading: boolean;
};

export function defaultConfig(): LayoutConfig {
	return {
		variant: "inset",
		collapsible: "icon",
		side: "left",
		open: true,
		width: "default",
		appHeader: "inset",
		headerMode: "workspace",
		showSearch: false,
		showBreadcrumb: true,
		headerBorder: true,
		navStyle: "tree",
		menuAction: "collapsible",
		footerMode: "account",
		dualSidebar: false,
		showSecondary: true,
		showRail: true,
		showBadges: true,
		showGroupAction: true,
		showSeparators: false,
		loading: false,
	};
}

export const WIDTHS: Record<Width, string> = {
	compact: "13rem",
	default: "16rem",
	comfortable: "20rem",
};

export const BASE = "/demos/dyamic-layouts-sidebars";

export const presets = [
	{ id: "floating", label: "Floating", variant: "floating", collapsible: "offcanvas" },
	{ id: "icon", label: "Icon", variant: "sidebar", collapsible: "icon" },
	{ id: "inset", label: "Inset", variant: "inset", collapsible: "icon" },
	{ id: "classic", label: "Classic", variant: "sidebar", collapsible: "offcanvas" },
] as const;

export type Canonical = {
	id: "list-detail" | "supporting" | "feed" | "dynamic-page" | "object-page";
	label: string;
	href: string;
	badge: string;
	icon: IconSet;
};

export const canonicals: Canonical[] = [
	{
		id: "list-detail",
		label: "List-detail",
		href: `${BASE}/list-detail`,
		badge: "3",
		icon: {
			lucide: "ListIcon",
			tabler: "IconList",
			hugeicons: "LayoutLeftIcon",
			phosphor: "ListIcon",
			remixicon: "RiListUnordered",
		},
	},
	{
		id: "supporting",
		label: "Supporting",
		href: `${BASE}/supporting`,
		badge: "",
		icon: {
			lucide: "LayoutIcon",
			tabler: "IconLayout",
			hugeicons: "LayoutIcon",
			phosphor: "LayoutIcon",
			remixicon: "RiLayoutLine",
		},
	},
	{
		id: "feed",
		label: "Feed",
		href: `${BASE}/feed`,
		badge: "12",
		icon: {
			lucide: "LayoutGridIcon",
			tabler: "IconLayoutGrid",
			hugeicons: "GridIcon",
			phosphor: "GridFourIcon",
			remixicon: "RiGridLine",
		},
	},
	{
		id: "dynamic-page",
		label: "Dynamic page",
		href: `${BASE}/dynamic-page`,
		badge: "",
		icon: {
			lucide: "SparklesIcon",
			tabler: "IconSparkles",
			hugeicons: "SparklesIcon",
			phosphor: "SparkleIcon",
			remixicon: "RiSparklingLine",
		},
	},
	{
		id: "object-page",
		label: "Object page",
		href: `${BASE}/object-page`,
		badge: "",
		icon: {
			lucide: "FileTextIcon",
			tabler: "IconFileText",
			hugeicons: "File02Icon",
			phosphor: "FileTextIcon",
			remixicon: "RiFileTextLine",
		},
	},
];

export const brandIcon: IconSet = {
	lucide: "LayoutDashboardIcon",
	tabler: "IconLayoutDashboard",
	hugeicons: "DashboardSquare01Icon",
	phosphor: "SquaresFourIcon",
	remixicon: "RiLayoutLine",
};

export const searchIcon: IconSet = {
	lucide: "SearchIcon",
	tabler: "IconSearch",
	hugeicons: "SearchIcon",
	phosphor: "MagnifyingGlassIcon",
	remixicon: "RiSearchLine",
};

export const chevronsIcon: IconSet = {
	lucide: "ChevronsUpDownIcon",
	tabler: "IconSelector",
	hugeicons: "UnfoldMoreIcon",
	phosphor: "CaretUpDownIcon",
	remixicon: "RiExpandUpDownLine",
};

export const chevronRightIcon: IconSet = {
	lucide: "ChevronRightIcon",
	tabler: "IconChevronRight",
	hugeicons: "ArrowRight01Icon",
	phosphor: "CaretRightIcon",
	remixicon: "RiArrowRightSLine",
};

export const moreIcon: IconSet = {
	lucide: "MoreHorizontalIcon",
	tabler: "IconDots",
	hugeicons: "MoreHorizontalCircle01Icon",
	phosphor: "DotsThreeIcon",
	remixicon: "RiMoreLine",
};

export const plusIcon: IconSet = {
	lucide: "PlusIcon",
	tabler: "IconPlus",
	hugeicons: "PlusSignIcon",
	phosphor: "PlusIcon",
	remixicon: "RiAddLine",
};

export const userIcon: IconSet = {
	lucide: "UserIcon",
	tabler: "IconUser",
	hugeicons: "UserIcon",
	phosphor: "UserIcon",
	remixicon: "RiUserLine",
};

export const settingsIcon: IconSet = {
	lucide: "Settings2Icon",
	tabler: "IconSettings",
	hugeicons: "Settings05Icon",
	phosphor: "GearIcon",
	remixicon: "RiSettingsLine",
};

export const teams = [
	{ name: "Acme Inc", plan: "Enterprise" },
	{ name: "Acme Corp.", plan: "Startup" },
	{ name: "Evil Corp.", plan: "Free" },
];

export const versions = ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"];

export type NavItem = {
	title: string;
	icon: IconSet;
	badge?: string;
	items?: string[];
};

export const navMain: NavItem[] = [
	{
		title: "Dashboard",
		badge: "5",
		icon: {
			lucide: "HomeIcon",
			tabler: "IconHome",
			hugeicons: "HomeIcon",
			phosphor: "HouseIcon",
			remixicon: "RiHomeLine",
		},
		items: ["Overview", "Analytics"],
	},
	{
		title: "Orders",
		icon: {
			lucide: "ShoppingBagIcon",
			tabler: "IconShoppingBag",
			hugeicons: "ShoppingBag01Icon",
			phosphor: "BagIcon",
			remixicon: "RiShoppingBagLine",
		},
		items: ["All Orders", "Pending", "Completed"],
	},
	{
		title: "Products",
		icon: {
			lucide: "ShoppingCartIcon",
			tabler: "IconShoppingCart",
			hugeicons: "ShoppingCart01Icon",
			phosphor: "ShoppingCartIcon",
			remixicon: "RiShoppingCartLine",
		},
		items: ["All Products", "Categories"],
	},
	{
		title: "Customers",
		icon: {
			lucide: "UserIcon",
			tabler: "IconUser",
			hugeicons: "UserIcon",
			phosphor: "UserIcon",
			remixicon: "RiUserLine",
		},
	},
];

export const navSecondary: NavItem[] = [
	{
		title: "Support",
		icon: {
			lucide: "HelpCircleIcon",
			tabler: "IconHelpCircle",
			hugeicons: "HelpCircleIcon",
			phosphor: "QuestionIcon",
			remixicon: "RiQuestionLine",
		},
	},
	{
		title: "Feedback",
		icon: {
			lucide: "SendIcon",
			tabler: "IconSend",
			hugeicons: "SentIcon",
			phosphor: "PaperPlaneTiltIcon",
			remixicon: "RiSendPlaneLine",
		},
	},
];

// Flat / collapsible group navigation (docs-style, sidebar-01/02)
export const docsGroups: { title: string; items: string[] }[] = [
	{ title: "Getting Started", items: ["Installation", "Project Structure"] },
	{
		title: "Building",
		items: ["Routing", "Data Fetching", "Rendering", "Caching", "Styling"],
	},
	{ title: "API Reference", items: ["Components", "File Conventions", "Functions", "CLI"] },
];
