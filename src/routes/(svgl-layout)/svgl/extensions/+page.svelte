<script lang="ts">
  import { cn } from "$lib/utils.js";
  import PageCard from "$lib/components/layout/pageCard.svelte";
  import PageHeader from "$lib/components/layout/pageHeader.svelte";

  import PackageOpen from "@lucide/svelte/icons/package-open";
  import Rocket from "@lucide/svelte/icons/rocket";
  import Plus from "@lucide/svelte/icons/plus";
  import Search from "@lucide/svelte/icons/search";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";

  const extensions = [
    {
      id: 1,
      name: "VS Code Extension",
      description: "Search and copy SVG logos directly from your editor sidebar without leaving VS Code.",
      bg: "#007ACC",
      letter: "V",
      url: "https://marketplace.visualstudio.com",
      author: "pheralb",
      authorUrl: "https://github.com/pheralb",
    },
    {
      id: 2,
      name: "Figma Plugin",
      description: "Import SVG logos directly into your Figma designs with one click.",
      bg: "#F24E1E",
      letter: "F",
      url: "https://figma.com/community",
      author: "pheralb",
      authorUrl: "https://github.com/pheralb",
    },
    {
      id: 3,
      name: "Raycast Extension",
      description: "Quickly search and copy SVG logos right from your Raycast launcher.",
      bg: "#FF6363",
      letter: "R",
      url: "https://www.raycast.com/store",
      author: "peduarte",
      authorUrl: "https://github.com/peduarte",
    },
    {
      id: 4,
      name: "Alfred Workflow",
      description: "Browse and copy SVGL logos from Alfred with instant fuzzy search.",
      bg: "#5C5CE0",
      letter: "A",
      url: "https://www.alfredapp.com/workflows",
      author: "nicktindall",
      authorUrl: "https://github.com/nicktindall",
    },
    {
      id: 5,
      name: "Obsidian Plugin",
      description: "Embed SVG logos in your Obsidian notes and knowledge base effortlessly.",
      bg: "#7C3AED",
      letter: "O",
      url: "https://obsidian.md/plugins",
      author: "Lisandra-dev",
      authorUrl: "https://github.com/Lisandra-dev",
    },
    {
      id: 6,
      name: "Inkdrop Plugin",
      description: "Insert tech logos into your Inkdrop markdown notes with a quick command.",
      bg: "#4A9EFF",
      letter: "I",
      url: "https://my.inkdrop.app/plugins",
      author: "craftzdog",
      authorUrl: "https://github.com/craftzdog",
    },
    {
      id: 7,
      name: "Sketch Plugin",
      description: "Drag and drop SVG logos into your Sketch artboards from a dedicated panel.",
      bg: "#FDAD00",
      letter: "S",
      url: "https://www.sketch.com/extensions",
      author: "jcr_",
      authorUrl: "https://github.com/jcr",
    },
    {
      id: 8,
      name: "Neovim Plugin",
      description: "Pick and insert SVG logo paths from Telescope directly inside Neovim.",
      bg: "#57A143",
      letter: "N",
      url: "https://neovim.io/doc/user/usr_05.html",
      author: "emmanueltouzery",
      authorUrl: "https://github.com/emmanueltouzery",
    },
    {
      id: 9,
      name: "Arc Boost",
      description: "Add an SVGL search panel to any tab in the Arc browser with a single boost.",
      bg: "#CC2E2E",
      letter: "A",
      url: "https://arc.net/boosts",
      author: "sossou",
      authorUrl: "https://github.com/sossou",
    },
    {
      id: 10,
      name: "Docusaurus Plugin",
      description: "Auto-generate SVG logo components in your Docusaurus documentation site.",
      bg: "#25C2A0",
      letter: "D",
      url: "https://docusaurus.io/community/resources",
      author: "slorber",
      authorUrl: "https://github.com/slorber",
    },
  ];

  let searchTerm = $state("");

  const filtered = $derived(
    searchTerm
      ? extensions.filter((e) =>
          e.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : extensions,
  );
</script>

<svelte:head>
  <title>Extensions — svgl demo</title>
</svelte:head>

<PageCard>
  <PageHeader>
    <div class="flex items-center space-x-2 font-medium text-neutral-950 dark:text-neutral-50">
      <PackageOpen size={18} strokeWidth={1.5} />
      <p>Extensions</p>
    </div>
  </PageHeader>

  <!-- Hero -->
  <section class="flex flex-col px-4 py-12">
    <h2 class="mb-4 text-center text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
      Extensions
    </h2>
    <div class="flex w-full flex-col items-center justify-center space-y-4">
      <p class="max-w-md text-center text-sm text-neutral-500 dark:text-neutral-400">
        Integrate SVGL with your favorite tools and apps to streamline your
        workflow. Created by the community.
      </p>
      <div class="flex items-center space-x-2">
        <a
          href="/svgl/docs"
          class={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            "bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200",
          )}
        >
          <Rocket size={14} strokeWidth={2} />
          <span>Start Building</span>
        </a>
        <a
          href="https://github.com/pheralb/svgl/issues/new/choose"
          target="_blank"
          rel="noreferrer"
          class={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800",
          )}
        >
          <Plus size={14} strokeWidth={2} />
          <span>Add your extension</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Search + grid -->
  <div class="container mx-auto max-w-4xl px-6 lg:px-4">
    <!-- Search sticky within the card -->
    <div class="sticky top-8 z-10  pt-4 pb-0 backdrop-blur-sm">
      <div class="relative">
        <Search
          size={18}
          strokeWidth={2}
          class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
        />
        <input
          type="search"
          autocomplete="off"
          placeholder="Search..."
          bind:value={searchTerm}
          class={cn(
            "w-full overflow-hidden rounded-md border border-neutral-200 bg-white py-1.5 pr-3 pl-9 shadow-sm",
            "text-sm placeholder:text-neutral-400",
            "focus:border-neutral-400 focus:outline-none",
            "dark:border-neutral-800 dark:bg-neutral-900 dark:placeholder:text-neutral-400 dark:focus:border-neutral-600",
          )}
        />
      </div>
    </div>

    <!-- 2-col grid -->
    <div class="mt-5 mb-7 grid grid-cols-1 gap-4 md:grid-cols-2">
      {#each filtered as ext (ext.id)}
        <div
          class={cn(
            "relative flex h-48 max-h-48 flex-col",
            "rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
            "transition-shadow hover:shadow-sm",
          )}
        >
          <div class="p-4">
            <div class="mb-4 flex items-center justify-between">
              <!-- Logo placeholder -->
              <div
                class="flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold text-white"
                style="background-color: {ext.bg};"
              >
                {ext.letter}
              </div>
              <a
                href={ext.url}
                target="_blank"
                rel="noreferrer"
                class={cn(
                  "inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium transition-colors",
                  "hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800",
                )}
              >
                <span>Install</span>
                <ArrowUpRight size={11} strokeWidth={2} class="text-neutral-500 dark:text-neutral-400" />
              </a>
            </div>
            <p class="mb-1 text-sm font-medium text-neutral-900 dark:text-neutral-50">{ext.name}</p>
            <p class="truncate text-sm text-neutral-500 dark:text-neutral-400" title={ext.description}>
              {ext.description}
            </p>
          </div>
          <div
            class="absolute bottom-0 flex w-full items-center justify-end gap-1 border-t border-neutral-200 bg-neutral-100/60 px-4 py-2 text-xs dark:border-neutral-800 dark:bg-neutral-800/40"
          >
            <span class="text-neutral-500">Created by</span>
            <a
              href={ext.authorUrl}
              target="_blank"
              rel="noreferrer"
              class="font-medium text-neutral-700 underline-offset-2 transition-colors hover:text-neutral-900 hover:underline dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              {ext.author}
            </a>
          </div>
        </div>
      {/each}
    </div>
  </div>
</PageCard>
