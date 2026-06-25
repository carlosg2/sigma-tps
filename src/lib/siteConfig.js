import { dev } from '$app/environment'

export const siteName = 'ICF';
export const website = '';
export const description = '';
export const authorName = '';


export const servers = [
  { sever: 'SPB_SOPORTE',
    api: 'https://seproban.intelisiscloud.com:3003/api/SPB_SOPORTE/' },
  { sever: 'SPB_SOPORTE',
    api: 'http://192.110.161.211:2531/api/SPB_SOPORTE/' },
  { sever: 'TPS_INLOSA',
    api: 'https://api.maserp.mx/api/INLOSA/' },
  { sever: 'JOYA',
    api: 'https://api.maserp.mx/api/JOYA/' },
]

export let server = servers[2];

export const getAppById = (/** @type {string} */ appName) => {
  const link = links.find(link => link.app === appName);
  return link ? link.url : null;
};




/* import {
  Lightbulb,
  BarChart2,
  Home,
  Factory,
  FolderKanban,
  Boxes,
  Truck,
  Orbit,
  FileStack,
  LayoutDashboard,
  Group,
  ListChecks
} from 'lucide-svelte'; */


  import Lightbulb from "@lucide/svelte/icons/lightbulb";
  import BarChart2 from "@lucide/svelte/icons/bar-chart-2";
  import Home from "@lucide/svelte/icons/home";
  import Factory from "@lucide/svelte/icons/factory";
  import FolderKanban from "@lucide/svelte/icons/folder-kanban";
  import Boxes from "@lucide/svelte/icons/boxes";
  import Truck from "@lucide/svelte/icons/truck";
  import Orbit from "@lucide/svelte/icons/orbit";
  import FileStack from "@lucide/svelte/icons/file-stack";
  import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
  import Group from "@lucide/svelte/icons/group";
  import ListChecks from "@lucide/svelte/icons/list-checks";


export const links = [
  
  {
    label: 'Inicio',
    app: 'AppInicio',
    url: '/inicio2',
    icon: Home,
    disable: false,
    class: 'text-orange-500',
    historico: 1
  },
  {
    label: 'Dashboard',
    app: 'AppDashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    disable: false,
    class: 'text-orange-500',
    historico: 1
  },
  {
    label: 'Programa Mensual',
    app: 'AppProgramaMensual',
    url: '/inicio',
    icon: Orbit,
    disable: false,
    class: 'text-yellow-500',
    historico: 1
    
  },
  {
    label: 'Modelado de Centros',
    app: 'AppModelado',
    url: '/modelado3',
    icon: FolderKanban,
    disable: false,
    class: 'text-lime-500',
    historico: 1
  },

  {
    label: 'Desglose de Forecast',
    app: 'AppForecast',
    url: '/forecast',
    icon: Lightbulb,
    disable: false,
    class: 'text-emerald-500',
    historico: 1
    
  },

  {
    label: 'Concentrado de Familias',
    app: 'AppConcentradoFamilia',
    url: '/concentrado',
    icon: Group,
    disable: false,
    class: 'text-cyan-500',
    historico: 1
    
  },

  {
    label: 'Programa de Arribos',
    app: 'AppArribos',
    url: '/arribos',
    icon: Truck,
    disable: false,
    class: 'text-blue-500',
    historico: 0
  },
  {
    label: 'Validación de Insumos',
    app: 'AppProduccion',
    url: '/produccion',
    icon: Factory,
    disable: false,
    class: 'text-violet-500',
    historico: 0
  },
  {
    label: 'Faltantes de Materia',
    app: 'AppCompras',
    url: '/faltantes',
    icon: Boxes,
    disable: false,
    class: 'text-fuchsia-500',
    historico: 0
  },
  {
    label: 'Indicadores',
    app: 'AppAnalisis',
    url: '/indicadores',
    icon: BarChart2,
    disable: false,
    class: 'text-pink-500 rotate-90',
    historico: 0
  },
  {
    label: 'Articulos',
    app: 'AppArticulos',
    url: '/articulos',
    icon: ListChecks,
    disable: false,
    class: 'text-rose-500',
    historico: 0
  },
  /* {
    label: 'Programa Semanal',
    app: 'AppAnalisis',	
    url: '/historico',
    icon: FileStack,
    disable: false,
    class: 'text-rose-500 ',
    historico: 1
  } */
];



  import CameraIcon from "@tabler/icons-svelte/icons/camera";
  import ChartBarIcon from "@tabler/icons-svelte/icons/chart-bar";
  import DashboardIcon from "@tabler/icons-svelte/icons/dashboard";
  import DatabaseIcon from "@tabler/icons-svelte/icons/database";
  import FileAiIcon from "@tabler/icons-svelte/icons/file-ai";
  import FileDescriptionIcon from "@tabler/icons-svelte/icons/file-description";
  import FileWordIcon from "@tabler/icons-svelte/icons/file-word";
  import FolderIcon from "@tabler/icons-svelte/icons/folder";
  import HelpIcon from "@tabler/icons-svelte/icons/help";
  import InnerShadowTopIcon from "@tabler/icons-svelte/icons/inner-shadow-top";
  import ListDetailsIcon from "@tabler/icons-svelte/icons/list-details";
  import ReportIcon from "@tabler/icons-svelte/icons/report";
  import SearchIcon from "@tabler/icons-svelte/icons/search";
  import SettingsIcon from "@tabler/icons-svelte/icons/settings";
  import UsersIcon from "@tabler/icons-svelte/icons/users";



const data = {
    user: {
      name: "Carlos Garza",
      email: "m@example.com",
      avatar: "/avatars/06.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "#",
        icon: DashboardIcon,
      },
      {
        title: "Lifecycle",
        url: "#",
        icon: ListDetailsIcon,
      },
      {
        title: "Analytics",
        url: "#",
        icon: ChartBarIcon,
      },
      {
        title: "Projects",
        url: "#",
        icon: FolderIcon,
      },
      {
        title: "Team",
        url: "#",
        icon: UsersIcon,
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
        title: "Settings",
        url: "#",
        icon: SettingsIcon,
      },
      {
        title: "Get Help",
        url: "#",
        icon: HelpIcon,
      },
      {
        title: "Search",
        url: "#",
        icon: SearchIcon,
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