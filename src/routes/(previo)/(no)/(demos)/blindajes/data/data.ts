import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
import ShieldAlertIcon from "@lucide/svelte/icons/shield-alert";
import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
import CircleOffIcon from "@lucide/svelte/icons/circle-off";
import DollarSignIcon from "@lucide/svelte/icons/dollar-sign";
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import ZapIcon from "@lucide/svelte/icons/zap";
import FeatherIcon from "@lucide/svelte/icons/feather";
import WeightIcon from "@lucide/svelte/icons/weight";

export const costosRelativos = [
	{
		value: "Bajo",
		label: "Bajo",
		icon: DollarSignIcon,
	},
	{
		value: "Medio",
		label: "Medio",
		icon: TrendingUpIcon,
	},
	{
		value: "Alto",
		label: "Alto",
		icon: ZapIcon,
	},
	{
		value: "Muy Alto",
		label: "Muy Alto",
		icon: ShieldAlertIcon,
	},
];

export const estadosActivo = [
	{
		value: "true",
		label: "Activo",
		icon: CircleCheckIcon,
	},
	{
		value: "false",
		label: "Inactivo",
		icon: CircleOffIcon,
	},
];

export const disponibilidadUltraligero = [
	{
		value: "true",
		label: "Disponible",
		icon: FeatherIcon,
	},
	{
		value: "false",
		label: "No disponible",
		icon: WeightIcon,
	},
];

export const estandaresCertificacion = [
	{
		value: "IABG / CEN EN 1063",
		label: "IABG / CEN EN 1063",
		icon: ShieldCheckIcon,
	},
	{
		value: "IABG / ERV",
		label: "IABG / ERV",
		icon: ShieldAlertIcon,
	},
];
