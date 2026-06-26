<script lang="ts" module>
	import AudioWaveformIcon from "@lucide/svelte/icons/audio-waveform";
	import BookOpenIcon from "@lucide/svelte/icons/book-open";
	import BotIcon from "@lucide/svelte/icons/bot";
	import ChartPieIcon from "@lucide/svelte/icons/chart-pie";
	import CommandIcon from "@lucide/svelte/icons/command";
	import FrameIcon from "@lucide/svelte/icons/frame";
	import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
	import MapIcon from "@lucide/svelte/icons/map";
	import Settings2Icon from "@lucide/svelte/icons/settings-2";
	import SquareTerminalIcon from "@lucide/svelte/icons/square-terminal";
	import HeartHandshake from "@lucide/svelte/icons/heart-handshake";
	import BookUser from "@lucide/svelte/icons/book-user";
	import DollarSignIcon from "@lucide/svelte/icons/dollar-sign";
	import CalendarDaysIcon from "@lucide/svelte/icons/calendar-days";
	import CreditCardIcon from "@lucide/svelte/icons/credit-card";
	import ClockIcon from "@lucide/svelte/icons/clock";
	import FileTextIcon from "@lucide/svelte/icons/file-text";
	import UserIcon from "@lucide/svelte/icons/user";
	import FolderIcon from "@lucide/svelte/icons/folder";

	// This is sample data.
	const data = {
		user: {
			name: "Carlos",
			email: "cgarza@sigma-ai.mx",
			avatar: "/avatars/06.jpg",
		},
		teams: [
			{
				/* name: "Comercial Parras", */
				name: "TPS Armoring",
				logo: Star,
				plan: "Producción",
			},
			{
				name: "Super Tienda Nogalera",
				logo: AudioWaveformIcon,
				plan: "Empresarial",
			}
		],
		
		navMain: [
			{
				title: "Blocks",
				url: "#",
				icon: Shapes,
				isActive: false,
				items: [
					{
						title: "Dashboard 1",
						url: "/dashboard/1",
						icon: DollarSignIcon,
					},
					{
						title: "Dashboard 2",
						url: "/dashboard/2",
						icon: CreditCardIcon,
					},
					
					{
						title: "Cabecero-Detalle",
						url: "/dashboard/mail",
						icon: Mail,
					},
					{
						title: "Orden",
						url: "/dashboard/orden",
						icon: CalendarDaysIcon,
					},
				],
			},
			{
				title: "Lab",
				url: "#",
				icon: FlaskConical,
				items: [
					{
						title: "Ventanas",
						url: "/dashboard/windows",
						icon: FileTextIcon,
					},
					{
						title: "Tareas",
						url: "/dashboard/tasks",
						icon: ClockCheck,
					},
					{
						title: "Preload",
						url: "/dashboard/users",
						icon: FolderIcon,
					},
					{
						title: "Calendario",
						url: "/dashboard/calendar",
						icon: Calendar,
					},
					{
						title: "Kanban",
						url: "/dashboard/kanban",
						icon: SquareKanban,
					},
					{
						title: "Rutas",
						url: "/dashboard/route-scroll",
						icon: MapPinned,
					},
					{
						title: "Pin",
						url: "/dashboard/pin",
						icon: LockKeyhole,
					},
					{
						title: "Matiz",
						url: "/dashboard/hue",
						icon: LockKeyhole,
					},
				],
			},
			/* {
				title: "Dashboard",
				url: "#",
				icon: SquareTerminalIcon,
				isActive: false,
				items: [
					{
						title: "Ventas",
						url: "/dashboard/1",
					},
					{
						title: "Destacados",
						url: "/dashboard/2",
					},
					{
						title: "Ajustes",
						url: "/dashboard/3",
					},
					{
						title: "Email",
						url: "/dashboard/mail",
					},
					{
						title: "Orden",
						url: "/dashboard/orden",
					},
				],
			},
			{
				title: "Modelos",
				url: "#",
				icon: BotIcon,
				items: [
					{
						title: "Genesis",
						url: "#",
					},
					{
						title: "Explorer",
						url: "#",
					},
					{
						title: "Quantum",
						url: "#",
					},
				],
			},
			{
				title: "Documentación",
				url: "#",
				icon: BookOpenIcon,
				items: [
					{
						title: "Introducción",
						url: "#",
					},
					{
						title: "Comenzar",
						url: "#",
					},
					{
						title: "Tutoriales",
						url: "#",
					},
					{
						title: "Registro de cambios",
						url: "#",
					},
				],
			},
			{
				title: "Configuración",
				url: "#",
				icon: Settings2Icon,
				items: [
					{
						title: "General",
						url: "#",
					},
					{
						title: "Equipo",
						url: "#",
					},
					{
						title: "Facturación",
						url: "#",
					},
					{
						title: "Límites",
						url: "#",
					},
				],
			}, */
		],
		projects: [
			{
				name: "Ingeniería de Diseño",
				url: "#",
				icon: FrameIcon,
			},
			{
				name: "Ventas y Marketing",
				url: "#",
				icon: ChartPieIcon,
			},
			{
				name: "Viajes",
				url: "#",
				icon: MapIcon,
			},
		],
	};

	import CameraIcon from "@tabler/icons-svelte/icons/camera";
  import DatabaseIcon from "@tabler/icons-svelte/icons/database";
  import FileAiIcon from "@tabler/icons-svelte/icons/file-ai";
  import FileDescriptionIcon from "@tabler/icons-svelte/icons/file-description";
  import FileWordIcon from "@tabler/icons-svelte/icons/file-word";

  import HelpIcon from "@tabler/icons-svelte/icons/help";
  import ReportIcon from "@tabler/icons-svelte/icons/report";
  import SettingsIcon from "@tabler/icons-svelte/icons/settings";

  /* import NavDocuments from "./nav-documents.svelte"; */
  import NavSecondary from "$lib/components/shell/nav-secondary.svelte";


  const datax = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [


			{
				title: "Vehiculos",
				url: "/vehiculos",
				icon: Car,
			},
			{
				title: "Blindajes",
				url: "/blindajes",
				icon: ShieldCheck,
			},
			{
				title: "Diseño de blindajes",
				url: "/diseño",
				icon: DraftingCompass,
			},
			{
				title: "Producción",
				url: "/matriz",
				icon: Factory,
			},
			
    ],
    navClouds: [
      {
        title: "Capture",
        icon: CameraIcon,
        isActive: true,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
      {
        title: "Proposal",
        icon: FileDescriptionIcon,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
      {
        title: "Prompts",
        icon: FileAiIcon,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
    ],
    navSecondary: [
			{
        title: "Ayuda",
        url: "#",
        icon: HelpIcon,
      },
      {
        title: "Configuración",
        url: "#",
        icon: SettingsIcon,
      },
      
    ],
    documents: [
      {
        name: "Data Library",
        url: "#",
        icon: DatabaseIcon,
      },
      {
        name: "Reports",
        url: "#",
        icon: ReportIcon,
      },
      {
        name: "Word Assistant",
        url: "#",
        icon: FileWordIcon,
      },
    ],
  };
</script>

<script lang="ts">
	import NavMain from "$lib/components/shell/nav-main.svelte";
	import NavProjects from "$lib/components/shell/nav-projects.svelte";
	import NavUser from "$lib/components/shell/nav-user.svelte";
	import TeamSwitcher from "$lib/components/shell/team-switcher.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { ComponentProps } from "svelte";
	import NavColapsable from "$lib/components/shell/nav-colapsable.svelte";
	import Mail from "@tabler/icons-svelte/icons/mail";
	import { Archive, Calendar, Car, DraftingCompass, Factory, FlaskConical, LockKeyhole, MapPinned, Presentation, Settings, Shapes, ShieldCheck, SquareKanban, Star, Truck } from "@lucide/svelte";
	
	import ClockCheck from "@tabler/icons-svelte/icons/clock-check";

	let {
		ref = $bindable(null),
		collapsible = "icon",
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();
</script>




<Sidebar.Root {collapsible} {...restProps}>
  <Sidebar.Header>
		<TeamSwitcher teams={data.teams} />
		
    <!-- <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
          {#snippet child({ props })}
            <a href="##" {...props}>
              <InnerShadowTopIcon class="!size-5" />
              <span class="text-base font-semibold">Acme Inc.</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu> -->
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain items={datax.navMain} />
		<NavColapsable items={data.navMain} />
    <!-- <NavDocuments items={datax.documents} /> -->
		<!-- <NavProjects projects={data.projects} /> -->
    
		<NavSecondary items={datax.navSecondary} class="mt-auto" />
		
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser user={data.user} />
  </Sidebar.Footer>
</Sidebar.Root>