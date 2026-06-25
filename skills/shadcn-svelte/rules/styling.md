# Styling & Customization

See [customization.md](../customization.md) for theming, CSS variables, and adding custom colors.

## Contents

- Semantic colors
- Built-in variants first
- class for layout only
- No space-x-_ / space-y-_
- Prefer size-_ over w-_ h-\* when equal
- Prefer truncate shorthand
- No manual dark: color overrides
- Use cn() for conditional classes
- No manual z-index on overlay components
- CSS layer specificity: overriding component interactive states

---

## Semantic colors

**Incorrect:**

```svelte
<div class="bg-blue-500 text-white">
  <p class="text-gray-600">Secondary text</p>
</div>
```

**Correct:**

```svelte
<div class="bg-primary text-primary-foreground">
  <p class="text-muted-foreground">Secondary text</p>
</div>
```

---

## No raw color values for status/state indicators

For positive, negative, or status indicators, use Badge variants, semantic tokens like `text-destructive`, or define custom CSS variables — don't reach for raw Tailwind colors.

**Incorrect:**

```svelte
<span class="text-emerald-600">+20.1%</span>
<span class="text-green-500">Active</span>
<span class="text-red-600">-3.2%</span>
```

**Correct:**

```svelte
<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
</script>

<Badge variant="secondary">+20.1%</Badge>
<Badge>Active</Badge>
<span class="text-destructive">-3.2%</span>
```

If you need a success/positive color that doesn't exist as a semantic token, use a Badge variant or ask the user about adding a custom CSS variable to the theme (see [customization.md](../customization.md)).

---

## Built-in variants first

**Incorrect:**

```svelte
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
</script>

<Button class="border-input hover:bg-accent border bg-transparent"
  >Click me</Button
>
```

**Correct:**

```svelte
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
</script>

<Button variant="outline">Click me</Button>
```

---

## class for layout only

Use `class` for layout (e.g. `max-w-md`, `mx-auto`, `mt-4`), **not** for overriding component colors or typography. To change colors, use semantic tokens, built-in variants, or CSS variables.

**Incorrect:**

```svelte
<script lang="ts">
  import * as Card from "$lib/components/ui/card";
</script>

<Card.Root class="bg-blue-100 font-bold text-blue-900">
  <Card.Content>Dashboard</Card.Content>
</Card.Root>
```

**Correct:**

```svelte
<script lang="ts">
  import * as Card from "$lib/components/ui/card";
</script>

<Card.Root class="mx-auto max-w-md">
  <Card.Content>Dashboard</Card.Content>
</Card.Root>
```

To customize a component's appearance, prefer these approaches in order:

1. **Built-in variants** — `variant="outline"`, `variant="destructive"`, etc.
2. **Semantic color tokens** — `bg-primary`, `text-muted-foreground`.
3. **CSS variables** — define custom colors in the global CSS file (see [customization.md](../customization.md)).

---

## No space-x-_ / space-y-_

Use `gap-*` instead. `space-y-4` → `flex flex-col gap-4`. `space-x-2` → `flex gap-2`.

```svelte
<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
</script>

<div class="flex flex-col gap-4">
  <Input />
  <Input />
  <Button>Submit</Button>
</div>
```

---

## Prefer size-_ over w-_ h-\* when equal

`size-10` not `w-10 h-10`. Applies to icons, avatars, skeletons, etc.

---

## Prefer truncate shorthand

`truncate` not `overflow-hidden text-ellipsis whitespace-nowrap`.

---

## No manual dark: color overrides

Use semantic tokens — they handle light/dark via CSS variables. `bg-background text-foreground` not `bg-white dark:bg-gray-950`.

---

## Use cn() for conditional classes

Use the `cn()` utility from the project for conditional or merged class names. Don't write manual ternaries in `class` strings.

**Incorrect:**

```svelte
<script lang="ts">
  let isActive = $state(false);
</script>

<div class={`flex items-center ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
```

**Correct:**

```svelte
<script lang="ts">
  import { cn } from "$lib/utils";
  let isActive = $state(false);
</script>

<div class={cn("flex items-center", isActive ? "bg-primary text-primary-foreground" : "bg-muted")}>
```

---

## No manual z-index on overlay components

`Dialog`, `Sheet`, `Drawer`, `AlertDialog`, `DropdownMenu`, `Popover`, `Tooltip`, `HoverCard` handle their own stacking. Never add `z-50` or `z-[999]`.

---

## CSS layer specificity: overriding component interactive states

Component classes like `cn-table-row` live in `layer(base)`. Tailwind utility classes in `class` attributes live in `layer(utilities)`, which **always wins** regardless of selector specificity. Use this to your advantage when overriding hover or other interactive states.

### Grouping multiple rows under one hover

When two `<tr>` elements should highlight together (e.g. an item name row + a details row), wrap them in their own `<tbody>` and put the hover on the `<tbody>`. Individual `<tr>` backgrounds are transparent by default, so the parent's hover background shows through.

- Put `hover:bg-muted/50 transition-colors` on the `<tbody>`.
- Put `hover:bg-transparent` on each `<tr>` to neutralize the per-row hover from `cn-table-row` (utility layer beats base layer).
- Multiple `<tbody>` elements in one `<table>` is valid HTML.

**Incorrect — `group` approach that fights layer specificity:**

```svelte
<Table.Body class="group">
  <Table.Row class="border-b-0 group-hover:bg-muted/50">
    <Table.Cell colspan={3}>{row.item}</Table.Cell>
  </Table.Row>
  <Table.Row class="group-hover:bg-muted/50">
    <Table.Cell>{row.qty}</Table.Cell>
    <Table.Cell>{row.rate}</Table.Cell>
  </Table.Row>
</Table.Body>
```

This fails because `cn-table-row`'s own `hover:bg-muted/50` still fires on the hovered row (base layer), and `group-hover:bg-muted/50` doesn't help the sibling — the hovered row gets a double highlight from its own hover while the sibling may not respond.

**Correct — hover on `<tbody>`, neutralize per-row hover:**

```svelte
<Table.Body class="hover:bg-muted/50 transition-colors [&_tr:last-child]:border-b">
  <Table.Row class="border-b-0 hover:bg-transparent">
    <Table.Cell colspan={3}>{row.item}</Table.Cell>
  </Table.Row>
  <Table.Row class="hover:bg-transparent">
    <Table.Cell>{row.qty}</Table.Cell>
    <Table.Cell>{row.rate}</Table.Cell>
  </Table.Row>
</Table.Body>
```

**Why it works:** `hover:bg-transparent` (utilities layer) overrides `cn-table-row`'s `hover:bg-muted/50` (base layer). The `<tbody>`'s own `hover:bg-muted/50` highlights both rows uniformly because `<tr>` backgrounds are transparent.

**Note:** `cn-table-body` sets `[&_tr:last-child]:border-0`, so add `[&_tr:last-child]:border-b` to restore the bottom border on the last row of each group.
