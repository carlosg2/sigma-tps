<script lang="ts">
  /**
   * 30. Bill of Materials - cost roll-up tree
   * -----------------------------------------
   * A bicycle BOM with 4 levels of nesting: the finished product breaks
   * down into assemblies (frame, wheels, drivetrain...), which break
   * down into sub-assemblies, which break down into individual parts.
   *
   * Every NON-LEAF row's `quantity` is "1 per parent" and its
   * `unitCost` + `subtotal` are roll-ups: subtotal = sum(child.subtotal).
   * Leaf parts have an explicit quantity and unit cost. Change a leaf's
   * quantity (double-click) and the entire ancestor chain recomputes.
   */
  import {
    SvGrid,
    tableFeatures,
    rowSortingFeature,
    renderSnippet,
    type ColumnDef,
  } from '@svgrid/grid'
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import * as Card from '$lib/components/ui/card/index.js'
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Progress } from '$lib/components/ui/progress/index.js'
  import { Separator } from '$lib/components/ui/separator/index.js'
  import AppSidebar from '../dashboard-01/components/app-sidebar.svelte'
  import TrendingUpIcon from '@tabler/icons-svelte/icons/trending-up'
  import IconPlaceholder from '$lib/components/icon-placeholder/icon-placeholder.svelte'

  type Part = {
    id: string
    parentId: string | null
    depth: number
    name: string
    sku: string
    quantity: number
    unitCost: number
    subtotal: number
    childIds: string[]
  }

  function makeBom(): Part[] {
    type Seed = Omit<Part, 'subtotal' | 'unitCost' | 'childIds'> & { unitCost?: number }
    const seeds: Seed[] = [
      { id: 'B-001',     parentId: null,     depth: 0, name: 'City bike (complete)',     sku: 'BIKE-CITY',     quantity: 1 },
      { id: 'B-100',     parentId: 'B-001',  depth: 1, name: 'Frame assembly',           sku: 'ASM-FRAME',     quantity: 1 },
      { id: 'B-100.1',   parentId: 'B-100',  depth: 2, name: 'Main triangle',            sku: 'FRM-TRI',       quantity: 1 },
      { id: 'B-100.1.1', parentId: 'B-100.1', depth: 3, name: 'Top tube (aluminum)',     sku: 'TUBE-TOP-AL',   quantity: 1, unitCost:  42 },
      { id: 'B-100.1.2', parentId: 'B-100.1', depth: 3, name: 'Down tube (aluminum)',    sku: 'TUBE-DN-AL',    quantity: 1, unitCost:  54 },
      { id: 'B-100.1.3', parentId: 'B-100.1', depth: 3, name: 'Seat tube (aluminum)',    sku: 'TUBE-ST-AL',    quantity: 1, unitCost:  38 },
      { id: 'B-100.2',   parentId: 'B-100',  depth: 2, name: 'Fork (steel)',             sku: 'FRK-STL',       quantity: 1, unitCost: 120 },
      { id: 'B-100.3',   parentId: 'B-100',  depth: 2, name: 'Headset',                  sku: 'HDS-1.125',     quantity: 1, unitCost:  28 },
      { id: 'B-200',     parentId: 'B-001',  depth: 1, name: 'Wheel set',                sku: 'ASM-WHEELS',    quantity: 1 },
      { id: 'B-200.1',   parentId: 'B-200',  depth: 2, name: 'Front wheel',              sku: 'WHL-FRT',       quantity: 1 },
      { id: 'B-200.1.1', parentId: 'B-200.1', depth: 3, name: 'Rim (700c)',              sku: 'RIM-700C',      quantity: 1, unitCost:  35 },
      { id: 'B-200.1.2', parentId: 'B-200.1', depth: 3, name: 'Spokes',                  sku: 'SPK-2.0',       quantity: 32, unitCost: 0.80 },
      { id: 'B-200.1.3', parentId: 'B-200.1', depth: 3, name: 'Hub (front)',             sku: 'HUB-FRT',       quantity: 1, unitCost:  22 },
      { id: 'B-200.1.4', parentId: 'B-200.1', depth: 3, name: 'Tire (700x35)',           sku: 'TIRE-700-35',   quantity: 1, unitCost:  28 },
      { id: 'B-200.1.5', parentId: 'B-200.1', depth: 3, name: 'Tube (700x35)',           sku: 'TUBE-700-35',   quantity: 1, unitCost:   8 },
      { id: 'B-200.2',   parentId: 'B-200',  depth: 2, name: 'Rear wheel',               sku: 'WHL-RR',        quantity: 1 },
      { id: 'B-200.2.1', parentId: 'B-200.2', depth: 3, name: 'Rim (700c)',              sku: 'RIM-700C',      quantity: 1, unitCost:  35 },
      { id: 'B-200.2.2', parentId: 'B-200.2', depth: 3, name: 'Spokes',                  sku: 'SPK-2.0',       quantity: 32, unitCost: 0.80 },
      { id: 'B-200.2.3', parentId: 'B-200.2', depth: 3, name: 'Hub (rear, geared)',      sku: 'HUB-RR-GR',     quantity: 1, unitCost:  48 },
      { id: 'B-200.2.4', parentId: 'B-200.2', depth: 3, name: 'Tire (700x35)',           sku: 'TIRE-700-35',   quantity: 1, unitCost:  28 },
      { id: 'B-200.2.5', parentId: 'B-200.2', depth: 3, name: 'Tube (700x35)',           sku: 'TUBE-700-35',   quantity: 1, unitCost:   8 },
      { id: 'B-300',     parentId: 'B-001',  depth: 1, name: 'Drivetrain',               sku: 'ASM-DRIVE',     quantity: 1 },
      { id: 'B-300.1',   parentId: 'B-300',  depth: 2, name: 'Crankset',                 sku: 'CR-170-48',     quantity: 1, unitCost:  95 },
      { id: 'B-300.2',   parentId: 'B-300',  depth: 2, name: 'Bottom bracket',           sku: 'BB-SQ',         quantity: 1, unitCost:  18 },
      { id: 'B-300.3',   parentId: 'B-300',  depth: 2, name: 'Pedals',                   sku: 'PDL-PLT',       quantity: 1, unitCost:  24 },
      { id: 'B-300.4',   parentId: 'B-300',  depth: 2, name: 'Chain',                    sku: 'CHN-7SP',       quantity: 1, unitCost:  16 },
      { id: 'B-300.5',   parentId: 'B-300',  depth: 2, name: 'Cassette (7-spd)',         sku: 'CAS-7SP',       quantity: 1, unitCost:  32 },
      { id: 'B-300.6',   parentId: 'B-300',  depth: 2, name: 'Derailleur (rear)',        sku: 'DER-RR',        quantity: 1, unitCost:  44 },
      { id: 'B-400',     parentId: 'B-001',  depth: 1, name: 'Cockpit',                  sku: 'ASM-CKPT',      quantity: 1 },
      { id: 'B-400.1',   parentId: 'B-400',  depth: 2, name: 'Handlebar',                sku: 'BAR-FLT-580',   quantity: 1, unitCost:  22 },
      { id: 'B-400.2',   parentId: 'B-400',  depth: 2, name: 'Stem',                     sku: 'STM-90',        quantity: 1, unitCost:  18 },
      { id: 'B-400.3',   parentId: 'B-400',  depth: 2, name: 'Grips',                    sku: 'GRP-RBR',       quantity: 2, unitCost:   6 },
      { id: 'B-400.4',   parentId: 'B-400',  depth: 2, name: 'Brake lever pair',         sku: 'LVR-V',         quantity: 1, unitCost:  20 },
      { id: 'B-500',     parentId: 'B-001',  depth: 1, name: 'Brakes',                   sku: 'ASM-BRK',       quantity: 1 },
      { id: 'B-500.1',   parentId: 'B-500',  depth: 2, name: 'V-brake (front)',          sku: 'VBR-FRT',       quantity: 1, unitCost:  28 },
      { id: 'B-500.2',   parentId: 'B-500',  depth: 2, name: 'V-brake (rear)',           sku: 'VBR-RR',        quantity: 1, unitCost:  28 },
      { id: 'B-500.3',   parentId: 'B-500',  depth: 2, name: 'Brake pads',               sku: 'PAD-V',         quantity: 4, unitCost:   3 },
      { id: 'B-600',     parentId: 'B-001',  depth: 1, name: 'Saddle + seatpost',        sku: 'ASM-SAD',       quantity: 1 },
      { id: 'B-600.1',   parentId: 'B-600',  depth: 2, name: 'Saddle',                   sku: 'SAD-CMF',       quantity: 1, unitCost:  35 },
      { id: 'B-600.2',   parentId: 'B-600',  depth: 2, name: 'Seatpost',                 sku: 'SPS-27.2',      quantity: 1, unitCost:  18 },
    ]
    const parts: Part[] = seeds.map((s) => ({
      ...s,
      unitCost: s.unitCost ?? 0,
      subtotal: 0,
      childIds: [],
    }))
    const byId = new Map(parts.map((p) => [p.id, p]))
    for (const p of parts) if (p.parentId) byId.get(p.parentId)!.childIds.push(p.id)
    return parts
  }

  function recomputeCosts(parts: Part[]): Part[] {
    const byId = new Map(parts.map((p) => [p.id, { ...p }]))
    const ordered = [...byId.values()].sort((a, b) => b.depth - a.depth)
    for (const p of ordered) {
      if (p.childIds.length === 0) {
        p.subtotal = p.quantity * p.unitCost
      } else {
        let sum = 0
        for (const cid of p.childIds) sum += byId.get(cid)!.subtotal
        p.unitCost = sum
        p.subtotal = p.quantity * sum
      }
    }
    return parts.map((p) => byId.get(p.id)!)
  }

  let allParts = $state<Part[]>(recomputeCosts(makeBom()))
  let expanded = $state<Record<string, boolean>>({ 'B-001': true, 'B-100': true, 'B-200': true, 'B-300': true })

  const visibleParts = $derived.by(() => {
    const out: Part[] = []
    const byId = new Map(allParts.map((p) => [p.id, p]))
    function walk(id: string) {
      const node = byId.get(id)
      if (!node) return
      out.push(node)
      if (expanded[id]) for (const cid of node.childIds) walk(cid)
    }
    walk('B-001')
    return out
  })

  function toggle(id: string) {
    expanded = { ...expanded, [id]: !expanded[id] }
  }
  function expandAll() {
    const next: Record<string, boolean> = {}
    for (const p of allParts) if (p.childIds.length) next[p.id] = true
    expanded = next
  }
  function collapseAll() {
    expanded = { 'B-001': true }
  }

  const grandTotal = $derived(allParts.find((p) => p.id === 'B-001')?.subtotal ?? 0)
  const stats = $derived.by(() => {
    let leaves = 0, assemblies = 0, lineCost = 0
    let maxDepth = 0
    for (const p of allParts) {
      if (p.depth > maxDepth) maxDepth = p.depth
      if (p.childIds.length === 0) { leaves += 1; lineCost += p.subtotal }
      else if (p.depth > 0) assemblies += 1
    }
    return { leaves, assemblies, lineCost, depth: maxDepth + 1 }
  })

  // Keyboard navigation: Right Arrow expands, Left Arrow collapses,
  // Enter / Space toggle - only on the name column.
  let activeCol = $state<string>('')
  let activeRowIndex = $state<number>(0)
  $effect(() => {
    function onKey(e: KeyboardEvent) {
      if (activeCol !== 'name') return
      const node = visibleParts[activeRowIndex]
      if (!node || node.childIds.length === 0) return
      const isOpen = !!expanded[node.id]
      if (e.key === 'ArrowRight' && !isOpen) {
        e.preventDefault(); toggle(node.id)
      } else if (e.key === 'ArrowLeft' && isOpen) {
        e.preventDefault(); toggle(node.id)
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); toggle(node.id)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  function onCellChange(e: { rowIndex: number; columnId: string; newValue: unknown; row: Part }) {
    if (e.columnId !== 'quantity' && e.columnId !== 'unitCost') return
    if (e.row.childIds.length > 0) return
    const next = allParts.slice()
    const idx = next.findIndex((p) => p.id === e.row.id)
    if (idx < 0) return
    const value = Number(e.newValue)
    if (!Number.isFinite(value) || value < 0) return
    next[idx] = { ...next[idx]!, [e.columnId]: value } as Part
    allParts = recomputeCosts(next)
  }

  const features = tableFeatures({ rowSortingFeature })
  const columns: ColumnDef<typeof features, Part>[] = [
    {
      id: 'name',
      header: 'Part',
      accessorFn: (row) => row.name,
      cell: (ctx) => renderSnippet(NameCell, { node: ctx.row.original }),
      width: 380,
    },
    {
      field: 'sku',
      header: 'SKU',
      width: 150,
      cell: (ctx) => renderSnippet(SkuCell, { sku: ctx.row.original.sku }),
    },
    {
      field: 'quantity',
      header: 'Qty',
      editorType: 'number',
      width: 100,
      cell: (ctx) => renderSnippet(QtyCell, { part: ctx.row.original }),
    },
    {
      field: 'unitCost',
      header: 'Unit cost',
      editorType: 'number',
      width: 140,
      cell: (ctx) => renderSnippet(UnitCostCell, { part: ctx.row.original }),
    },
    {
      field: 'subtotal',
      header: 'Subtotal',
      width: 170,
      cell: (ctx) => renderSnippet(SubtotalCell, { part: ctx.row.original, grand: grandTotal }),
    },
  ]

  function fmtMoney(n: number): string {
    return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 })
  }
</script>

{#snippet NameCell(props: { node: Part })}
  {@const canExpand = props.node.childIds.length > 0}
  {@const isOpen = !!expanded[props.node.id]}
  {@const isRoot = props.node.depth === 0}
  <span
    class="relative inline-flex h-full w-full items-center gap-2"
    style={`padding-left: ${4 + props.node.depth * 22}px`}
  >
    {#each Array(props.node.depth) as _, i (i)}
      <span
        class="pointer-events-none absolute inset-y-0 w-0 border-l border-dashed border-border"
        style={`left: ${4 + i * 22 + 11}px`}
      ></span>
    {/each}
    {#if props.node.depth > 0}
      <span
        class="pointer-events-none absolute top-1/2 w-3.5 border-t border-dashed border-border  "
        style={`left: ${4 + (props.node.depth - 1) * 22 + 11}px`}
      ></span>
    {/if}
    {#if canExpand}
      <Button
        variant="ghost"
        size="icon-sm"
        class="size-4.5 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
        onclick={() => toggle(props.node.id)}
        aria-label={isOpen ? 'Collapse' : 'Expand'}
        aria-expanded={isOpen}
      >
        <IconPlaceholder
          lucide="ChevronRightIcon"
          tabler="IconChevronRight"
          hugeicons="ArrowRight01Icon"
          phosphor="CaretRightIcon"
          remixicon="RiArrowRightSLine"
          class="transition-transform {isOpen ? 'rotate-90' : ''}"
        />
      </Button>
    {:else}
      <span class="inline-flex size-4.5 shrink-0 items-center justify-center text-transparent">
        <IconPlaceholder
          lucide="ChevronRightIcon"
          tabler="IconChevronRight"
          hugeicons="ArrowRight01Icon"
          phosphor="CaretRightIcon"
          remixicon="RiArrowRightSLine"
        />
      </span>
    {/if}
    <span
      class="inline-flex size-6.5 p-1 shrink-0 items-center justify-center rounded-sm {canExpand ? 'bg-indigo-500/15 text-indigo-500' : 'bg-emerald-500/15 text-emerald-500'}"
      aria-hidden="true"
    >
      {#if canExpand}
        <IconPlaceholder
          lucide="FolderIcon"
          tabler="IconFolder"
          hugeicons="Folder01Icon"
          phosphor="FolderIcon"
          remixicon="RiFolderLine"
        />
      {:else}
        <IconPlaceholder
          lucide="FileIcon"
          tabler="IconFile"
          hugeicons="File01Icon"
          phosphor="FileIcon"
          remixicon="RiFileLine"
        />
      {/if}
    </span>
    <span class="font-medium {isRoot ? 'text-[13px] font-bold' : ''}">{props.node.name}</span>
  </span>
{/snippet}

{#snippet SkuCell(props: { sku: string })}
  <Badge variant="outline" class="text-[11px] font-mono tracking-wide">
    {props.sku}
  </Badge>
{/snippet}

{#snippet QtyCell(props: { part: Part })}
  {@const isLeaf = props.part.childIds.length === 0}
  <span class="inline-flex items-baseline gap-1 text-[13px] {isLeaf ? 'font-semibold' : 'font-normal text-muted-foreground'}">
    <span class="tabular-nums">{props.part.quantity.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
    {#if !isLeaf}<span class="text-[10px] opacity-60">x</span>{/if}
  </span>
{/snippet}

{#snippet UnitCostCell(props: { part: Part })}
  {@const isLeaf = props.part.childIds.length === 0}
  <span class="text-[13px] {isLeaf ? 'font-medium' : 'italic text-muted-foreground'}">
    <span class="tabular-nums">{fmtMoney(props.part.unitCost)}</span>
  </span>
{/snippet}

{#snippet SubtotalCell(props: { part: Part; grand: number })}
  {@const pct = props.grand > 0 ? (props.part.subtotal / props.grand) * 100 : 0}
  <span class="inline-flex w-full flex-col gap-1">
    <span class="text-xs tabular-nums">{fmtMoney(props.part.subtotal)}</span>
    <Progress value={pct} class="h-1" />
  </span>
{/snippet}

<Sidebar.Provider style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);">
  <AppSidebar variant="inset" />
  <Sidebar.Inset>
    <header class="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <Sidebar.Trigger class="-ms-1" />
        <Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
        <h1 class="text-base font-medium">Bill of Materials</h1>
        <div class="ms-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onclick={expandAll}>Expand all</Button>
          <Button variant="ghost" size="sm" onclick={collapseAll}>Collapse</Button>
        </div>
      </div>
    </header>

    <div class="flex flex-1 flex-col">
      <div class="@container/main flex flex-1 flex-col gap-2">
        <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

          <!-- KPI cards -->
          <div class="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <Card.Root class="@container/card">
              <Card.Header>
                <Card.Description>Grand total</Card.Description>
                <Card.Title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {fmtMoney(grandTotal)}
                </Card.Title>
                <Card.Action>
                  <Badge variant="outline">
                    <TrendingUpIcon />
                    per unit
                  </Badge>
                </Card.Action>
              </Card.Header>
              <Card.Footer class="flex-col items-start gap-1.5 text-sm">
                <div class="text-muted-foreground">City bike complete BOM</div>
              </Card.Footer>
            </Card.Root>

            <Card.Root class="@container/card">
              <Card.Header>
                <Card.Description>Leaf parts</Card.Description>
                <Card.Title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats.leaves}
                </Card.Title>
              </Card.Header>
              <Card.Footer class="flex-col items-start gap-1.5 text-sm">
                <div class="text-muted-foreground">{stats.assemblies} sub-assemblies</div>
              </Card.Footer>
            </Card.Root>

            <Card.Root class="@container/card">
              <Card.Header>
                <Card.Description>Depth</Card.Description>
                <Card.Title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats.depth}
                </Card.Title>
              </Card.Header>
              <Card.Footer class="flex-col items-start gap-1.5 text-sm">
                <div class="text-muted-foreground">levels of nesting</div>
              </Card.Footer>
            </Card.Root>

            <Card.Root class="@container/card">
              <Card.Header>
                <Card.Description>Visible rows</Card.Description>
                <Card.Title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {visibleParts.length}<span class="text-muted-foreground text-xl font-medium">/{allParts.length}</span>
                </Card.Title>
              </Card.Header>
              <Card.Footer class="flex-col items-start gap-1.5 text-sm">
                <div class="text-muted-foreground">rows currently in view</div>
              </Card.Footer>
            </Card.Root>
          </div>

          <!-- BOM grid -->
          <div class="px-4 lg:px-6">
            <div class="overflow-hidden rounded-xl border">
              <SvGrid
                data={visibleParts}
                columns={columns}
                features={features}
                filterMode="none"
                showPagination={false}
                enableInlineEditing={true}
                enableCellSelection={true}              showRowSelection={false}                enableRowSummaries={false}
                rowHeight={44}
                containerHeight={600}
                fitColumns={true}
                onCellValueChange={onCellChange}
                onActiveCellChange={(args) => { activeCol = args.columnId; activeRowIndex = args.rowIndex }}
              />
            </div>
            <p class="mt-2 text-xs text-muted-foreground">
              Double-click any LEAF row's <strong>Qty</strong> or <strong>Unit cost</strong> to recompute the entire ancestor chain.
              <strong>Keyboard:</strong> Right expands, Left collapses, Enter/Space toggles.
            </p>
          </div>

        </div>
      </div>
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>
