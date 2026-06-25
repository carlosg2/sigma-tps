import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
import CircleIcon from "@lucide/svelte/icons/circle";
import CircleOffIcon from "@lucide/svelte/icons/circle-off";
import CircleHelpIcon from "@lucide/svelte/icons/circle-help";
import TimerIcon from "@lucide/svelte/icons/timer";

export const labels = [
	{
		value: "bug",
		label: "Error",
	},
	{
		value: "feature",
		label: "Característica",
	},
	{
		value: "documentation",
		label: "Documentación",
	},
];

export const statuses = [
	{
		value: "backlog",
		label: "Pendiente",
		icon: CircleHelpIcon,
	},
	{
		value: "todo",
		label: "Por Hacer",
		icon: CircleIcon,
	},
	{
		value: "in progress",
		label: "En Progreso",
		icon: TimerIcon,
	},
	{
		value: "done",
		label: "Completado",
		icon: CircleCheckIcon,
	},
	{
		value: "canceled",
		label: "Cancelado",
		icon: CircleOffIcon,
	},
];

export const priorities = [
	{
		label: "Baja",
		value: "low",
		icon: ArrowDownIcon,
	},
	{
		label: "Media",
		value: "medium",
		icon: ArrowRightIcon,
	},
	{
		label: "Alta",
		value: "high",
		icon: ArrowUpIcon,
	},
];
