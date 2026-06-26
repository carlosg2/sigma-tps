import CarIcon from "@lucide/svelte/icons/car";
import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
import XCircleIcon from "@lucide/svelte/icons/x-circle";
import GaugeIcon from "@lucide/svelte/icons/gauge";
import CogIcon from "@lucide/svelte/icons/cog";
import ZapIcon from "@lucide/svelte/icons/zap";

// Marcas disponibles para filtrar
export const marcas = [
	{ value: "BMW", label: "BMW" },
	{ value: "Cadillac", label: "Cadillac" },
	{ value: "Chevrolet", label: "Chevrolet" },
	{ value: "Ford", label: "Ford" },
	{ value: "GMC", label: "GMC" },
	{ value: "Mercedes-Benz", label: "Mercedes-Benz" },
	{ value: "Nissan", label: "Nissan" },
	{ value: "Range Rover", label: "Range Rover" },
	{ value: "Toyota", label: "Toyota" },
];

// Estado activo/inactivo
export const estadosActivo = [
	{
		value: "true",
		label: "Activo",
		icon: CheckCircleIcon,
	},
	{
		value: "false",
		label: "Inactivo",
		icon: XCircleIcon,
	},
];

// Tipos de motor
export const tiposMotor = [
	{ value: "V8", label: "V8", icon: CogIcon },
	{ value: "V8 Turbo", label: "V8 Turbo", icon: ZapIcon },
	{ value: "V6 Turbo", label: "V6 Turbo", icon: ZapIcon },
	{ value: "6 cil Turbo", label: "6 cil Turbo", icon: CogIcon },
	{ value: "V6 Turbo Diesel", label: "V6 Turbo Diesel", icon: GaugeIcon },
	{ value: "4 cil Turbo Diesel", label: "4 cil Turbo Diesel", icon: GaugeIcon },
];

// Tipos de tracción
export const tiposTraccion = [
	{ value: "4x4", label: "4x4", icon: CarIcon },
	{ value: "4x2", label: "4x2", icon: CarIcon },
	{ value: "AWD", label: "AWD", icon: CarIcon },
];

// Años disponibles
export const años = [
	{ value: "2024", label: "2024" },
	{ value: "2023", label: "2023" },
	{ value: "2022", label: "2022" },
];
