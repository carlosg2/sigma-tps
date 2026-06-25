import CarIcon from "@lucide/svelte/icons/car";
import ShieldIcon from "@lucide/svelte/icons/shield";
import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
import ShieldAlertIcon from "@lucide/svelte/icons/shield-alert";
import DoorOpenIcon from "@lucide/svelte/icons/door-open";
import SquareIcon from "@lucide/svelte/icons/square";
import CircleIcon from "@lucide/svelte/icons/circle";
import CogIcon from "@lucide/svelte/icons/cog";
import LayersIcon from "@lucide/svelte/icons/layers";
import GlassWaterIcon from "@lucide/svelte/icons/glass-water";
import SettingsIcon from "@lucide/svelte/icons/settings";

// Categorías de materiales
export const categorias = [
	{
		value: "BLINDAJE OPACO",
		label: "Blindaje Opaco",
		icon: ShieldIcon,
	},
	{
		value: "TECHO",
		label: "Techo",
		icon: SquareIcon,
	},
	{
		value: "TOLVA DE PARABRISAS Y PARED DE FUEGO",
		label: "Tolva Parabrisas/Pared Fuego",
		icon: CarIcon,
	},
	{
		value: "POSTES, BISELES Y PISO",
		label: "Postes, Biseles y Piso",
		icon: LayersIcon,
	},
	{
		value: "PUERTAS",
		label: "Puertas",
		icon: DoorOpenIcon,
	},
	{
		value: "DIVISORIO / MAMPARA / RESPALDO",
		label: "Divisorio/Mampara/Respaldo",
		icon: SquareIcon,
	},
	{
		value: "PROTECCION DE MOTOR / PERIFERIA",
		label: "Protección Motor/Periferia",
		icon: CogIcon,
	},
	{
		value: "5TA PUERTA",
		label: "5ta Puerta",
		icon: DoorOpenIcon,
	},
	{
		value: "BLINDAJE TRANSPARENTE",
		label: "Blindaje Transparente",
		icon: GlassWaterIcon,
	},
	{
		value: "EQUIPO PERFORMANCE",
		label: "Equipo Performance",
		icon: SettingsIcon,
	},
];

// Tipos de materiales (especificaciones)
export const especificaciones = [
	{
		value: "ACERO A-B 3MM",
		label: "Acero A-B 3mm",
		icon: ShieldIcon,
	},
	{
		value: "KEVLAR 7C",
		label: "Kevlar 7C",
		icon: ShieldCheckIcon,
	},
	{
		value: "KEVLAR IIIA",
		label: "Kevlar IIIA",
		icon: ShieldCheckIcon,
	},
	{
		value: "ACERO A-B 3MM Y KEVLAR 7C",
		label: "Acero + Kevlar 7C",
		icon: ShieldAlertIcon,
	},
	{
		value: "ACERO A-B 3MM Y KEVLAR IIIA",
		label: "Acero + Kevlar IIIA",
		icon: ShieldAlertIcon,
	},
	{
		value: "VIDRIO LAMINADO 45MM CLARO",
		label: "Vidrio 45mm Claro",
		icon: GlassWaterIcon,
	},
	{
		value: "VIDRIO LAMINADO 50MM TONO 14%",
		label: "Vidrio 50mm Tono 14%",
		icon: GlassWaterIcon,
	},
	{
		value: "VIDRIO LAMINADO 55MM TONO 44%",
		label: "Vidrio 55mm Tono 44%",
		icon: GlassWaterIcon,
	},
	{
		value: "BISAGRAS ORIGINALES",
		label: "Bisagras Originales",
		icon: CogIcon,
	},
	{
		value: "GATO HIDRAULICO",
		label: "Gato Hidráulico",
		icon: CogIcon,
	},
	{
		value: "RESORTES REFORZADOS",
		label: "Resortes Reforzados",
		icon: CogIcon,
	},
	{
		value: "RUN-FLAT ESTANDAR",
		label: "Run-Flat Estándar",
		icon: CircleIcon,
	},
];

// Estados de material (activo/inactivo)
export const estados = [
	{
		value: "true",
		label: "Activo",
		icon: ShieldCheckIcon,
	},
	{
		value: "false",
		label: "Inactivo",
		icon: ShieldIcon,
	},
];
