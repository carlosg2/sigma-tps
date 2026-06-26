import ShieldIcon from "@lucide/svelte/icons/shield";
import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
import ShieldAlertIcon from "@lucide/svelte/icons/shield-alert";
import DollarSignIcon from "@lucide/svelte/icons/dollar-sign";
import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";

export const nivelesComplejidad = [
	{
		value: "Bajo",
		label: "Bajo",
		icon: ShieldIcon,
	},
	{
		value: "Medio",
		label: "Medio",
		icon: ShieldCheckIcon,
	},
	{
		value: "Alto",
		label: "Alto",
		icon: ShieldAlertIcon,
	},
	{
		value: "Muy Alto",
		label: "Muy Alto",
		icon: AlertCircleIcon,
	},
];

export const costosRelativos = [
	{
		value: "Bajo",
		label: "Bajo",
		icon: DollarSignIcon,
	},
	{
		value: "Medio",
		label: "Medio",
		icon: DollarSignIcon,
	},
	{
		value: "Alto",
		label: "Alto",
		icon: TrendingUpIcon,
	},
	{
		value: "Muy Alto",
		label: "Muy Alto",
		icon: TrendingUpIcon,
	},
];
