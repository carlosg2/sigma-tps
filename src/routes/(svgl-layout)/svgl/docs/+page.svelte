<script lang="ts">
  import { cn } from "$lib/utils.js";
  import PageCard from "$lib/components/layout/pageCard.svelte";
  import PageHeader from "$lib/components/layout/pageHeader.svelte";
  import TableOfContents from "$lib/components/tableOfContents/tableOfContents.svelte";
  import type { ToCItem } from "$lib/components/tableOfContents/toc.types.js";
  import * as Collapsible from "$lib/components/ui/collapsible/index.js";

  import FileText from "@lucide/svelte/icons/file-text";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";

  let tocOpen = $state(false);

  const toc: ToCItem[] = [
    { id: 0, level: 2, text: "Introduction", slug: "introduction" },
    { id: 1, level: 2, text: "Base URL", slug: "base-url" },
    { id: 2, level: 2, text: "Endpoints", slug: "endpoints" },
    { id: 3, level: 3, text: "GET /api/svgs", slug: "get-api-svgs" },
    { id: 4, level: 3, text: "GET /api/svgs/:id", slug: "get-api-svgs-id" },
    { id: 5, level: 2, text: "Response", slug: "response" },
    { id: 6, level: 2, text: "Rate Limiting", slug: "rate-limiting" },
  ];
</script>

<svelte:head>
  <title>svgl — API Docs demo</title>
</svelte:head>

<PageCard>
  <PageHeader>
    <div class="flex items-center space-x-2 font-medium text-neutral-950 dark:text-neutral-50">
      <FileText size={18} strokeWidth={1.5} />
      <p>API Documentation</p>
    </div>
  </PageHeader>

  <!-- ToC móvil: collapsible, visible solo en < lg -->
  <Collapsible.Root class="block lg:hidden" bind:open={tocOpen}>
    <Collapsible.Trigger
      class="mb-4 flex w-full items-center justify-between border-b border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900/50"
    >
      <span>On this page</span>
      <ChevronDown
        size={14}
        class={cn("transition-transform duration-200", tocOpen ? "rotate-180" : "rotate-0")}
      />
    </Collapsible.Trigger>
    <Collapsible.Content class="px-4 pb-4">
      <TableOfContents {toc} />
    </Collapsible.Content>
  </Collapsible.Root>

  <div class="flex min-h-screen gap-8 lg:gap-12">
    <!-- Contenido principal: container mx-auto replica el <Container> de SVGL -->
    <div class="container mx-auto mt-8 mb-6 max-w-3xl flex-1 px-6 lg:px-4">
      <div class="space-y-8 text-sm text-neutral-700 dark:text-neutral-300">

        <section>
          <span class="rounded-full border border-neutral-200 bg-white px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            REST API
          </span>
          <h2 id="introduction" class="mt-4 mb-3 text-base font-semibold text-neutral-900 dark:text-neutral-50">
            Introduction
          </h2>
          <p class="text-neutral-500 dark:text-neutral-400">
            Access the svgl logo library programmatically via the REST API. Free to use, no authentication required.
          </p>
        </section>

        <section>
          <h2 id="base-url" class="mb-3 text-base font-semibold text-neutral-900 dark:text-neutral-50">
            Base URL
          </h2>
          <div class="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-sm dark:border-neutral-800 dark:bg-neutral-900">
            https://svgl.app/api
          </div>
        </section>

        <section>
          <h2 id="endpoints" class="mb-3 text-base font-semibold text-neutral-900 dark:text-neutral-50">
            Endpoints
          </h2>

          <h3 id="get-api-svgs" class="mb-2 mt-4 font-medium text-neutral-800 dark:text-neutral-200">
            GET /api/svgs
          </h3>
          <p class="mb-3 text-neutral-500 dark:text-neutral-400">
            Returns a list of all available SVG logos. Optionally filter by category.
          </p>
          <div class="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
            <table class="w-full text-xs">
              <thead class="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th class="px-4 py-2 text-left font-medium text-neutral-600 dark:text-neutral-400">Parameter</th>
                  <th class="px-4 py-2 text-left font-medium text-neutral-600 dark:text-neutral-400">Type</th>
                  <th class="px-4 py-2 text-left font-medium text-neutral-600 dark:text-neutral-400">Description</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
                <tr>
                  <td class="px-4 py-2 font-mono text-neutral-700 dark:text-neutral-300">category</td>
                  <td class="px-4 py-2 text-neutral-500">string</td>
                  <td class="px-4 py-2 text-neutral-500">Filter by category (e.g. framework)</td>
                </tr>
                <tr>
                  <td class="px-4 py-2 font-mono text-neutral-700 dark:text-neutral-300">limit</td>
                  <td class="px-4 py-2 text-neutral-500">number</td>
                  <td class="px-4 py-2 text-neutral-500">Limit the number of results</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 id="get-api-svgs-id" class="mb-2 mt-6 font-medium text-neutral-800 dark:text-neutral-200">
            GET /api/svgs/:id
          </h3>
          <p class="text-neutral-500 dark:text-neutral-400">
            Returns a single SVG logo by its numeric ID.
          </p>
        </section>

        <section>
          <h2 id="response" class="mb-3 text-base font-semibold text-neutral-900 dark:text-neutral-50">
            Response
          </h2>
          <div class="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-xs dark:border-neutral-800 dark:bg-neutral-900">
            <pre class="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">[
  {`{`}
    "id": 1,
    "title": "Svelte",
    "category": "Framework",
    "route": "/library/svelte.svg"
  {`}`}
]</pre>
          </div>
        </section>

        <section>
          <h2 id="rate-limiting" class="mb-3 text-base font-semibold text-neutral-900 dark:text-neutral-50">
            Rate Limiting
          </h2>
          <p class="text-neutral-500 dark:text-neutral-400">
            Requests are limited to 100 per minute per IP address. Exceeding this limit returns a <code class="rounded bg-neutral-100 px-1 py-0.5 font-mono text-xs dark:bg-neutral-800">429</code> status code.
          </p>
        </section>

      </div>
    </div>

    <!-- ToC escritorio: fijo a la derecha, visible solo en lg+ -->
    <aside class="sticky top-20 hidden w-60 shrink-0 self-start pt-8 lg:block">
      <div class="mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-50">
        On this page
      </div>
      <TableOfContents {toc} />
    </aside>
  </div>
</PageCard>

