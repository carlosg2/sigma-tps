<script lang="ts">
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Item from "$lib/components/ui/item/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
</script>

<Card.Root>
	<Card.Header class="flex flex-col gap-3">
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item>
					<Breadcrumb.Link href="#/">Inicio</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button size="icon-sm" variant="ghost" {...props}>
									<IconPlaceholder
										lucide="MoreHorizontalIcon"
										tabler="IconDots"
										hugeicons="MoreHorizontalCircle01Icon"
										phosphor="DotsThreeIcon"
										remixicon="RiMoreLine"
									/>
									<span class="sr-only">Opciones de cuenta</span>
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="start">
							<DropdownMenu.Group>
								<DropdownMenu.Item>Cuenta corporativa</DropdownMenu.Item>
								<DropdownMenu.Item>Estados de cuenta</DropdownMenu.Item>
								<DropdownMenu.Item>Documentos</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
						<Breadcrumb.Page>Pago proveedors</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</Card.Header>
	<Card.Content>
		<Item.Group>
			<Item.Root variant="muted">
				{#snippet child({ props })}
					<a href="#/" {...props}>
						<Item.Media variant="icon">
							<IconPlaceholder
								lucide="GaugeIcon"
								tabler="IconGauge"
								hugeicons="Settings01Icon"
								phosphor="GaugeIcon"
								remixicon="RiDashboardLine"
							/>
						</Item.Media>
						<Item.Content>
							<Item.Title>Modificar límite de transferencia</Item.Title>
							<Item.Description
								>Ajuste el monto máximo que puede liberar desde tesorería.</Item.Description
							>
						</Item.Content>
						<IconPlaceholder
							lucide="ChevronRightIcon"
							tabler="IconChevronRight"
							hugeicons="ArrowRight01Icon"
							phosphor="CaretRightIcon"
							remixicon="RiArrowRightSLine"
							class="text-muted-foreground size-4 shrink-0"
						/>
					</a>
				{/snippet}
			</Item.Root>
			<Item.Root variant="muted">
				{#snippet child({ props })}
					<a href="#/" {...props}>
						<Item.Media variant="icon">
							<IconPlaceholder
								lucide="CalendarIcon"
								tabler="IconCalendar"
								hugeicons="Calendar03Icon"
								phosphor="CalendarIcon"
								remixicon="RiCalendarLine"
							/>
						</Item.Media>
						<Item.Content>
							<Item.Title>Transferencias programadas</Item.Title>
							<Item.Description
								>Configure una transferencia para enviarla en una fecha posterior.</Item.Description
							>
						</Item.Content>
						<IconPlaceholder
							lucide="ChevronRightIcon"
							tabler="IconChevronRight"
							hugeicons="ArrowRight01Icon"
							phosphor="CaretRightIcon"
							remixicon="RiArrowRightSLine"
							class="text-muted-foreground size-4 shrink-0"
						/>
					</a>
				{/snippet}
			</Item.Root>
			<Item.Root variant="muted">
				{#snippet child({ props })}
					<a href="#/" {...props}>
						<Item.Media variant="icon">
							<IconPlaceholder
								lucide="RepeatIcon"
								tabler="IconRepeat"
								hugeicons="RepeatIcon"
								phosphor="RepeatIcon"
								remixicon="RiRepeatLine"
							/>
						</Item.Media>
						<Item.Content>
							<Item.Title>Débitos automáticos</Item.Title>
							<Item.Description>Configure y administre pago proveedors periódicos.</Item.Description>
						</Item.Content>
						<IconPlaceholder
							lucide="ChevronRightIcon"
							tabler="IconChevronRight"
							hugeicons="ArrowRight01Icon"
							phosphor="CaretRightIcon"
							remixicon="RiArrowRightSLine"
							class="text-muted-foreground size-4 shrink-0"
						/>
					</a>
				{/snippet}
			</Item.Root>
			<Item.Root variant="muted">
				{#snippet child({ props })}
					<a href="#/" {...props}>
						<Item.Media variant="icon">
							<IconPlaceholder
								lucide="RefreshCwIcon"
								tabler="IconRefresh"
								hugeicons="RepeatIcon"
								phosphor="ArrowsClockwiseIcon"
								remixicon="RiRefreshLine"
							/>
						</Item.Media>
						<Item.Content>
							<Item.Title>Pago proveedors recurrentes de tarjeta</Item.Title>
							<Item.Description
								>Administre sus translotes de tarjeta repetidas.</Item.Description
							>
						</Item.Content>
						<IconPlaceholder
							lucide="ChevronRightIcon"
							tabler="IconChevronRight"
							hugeicons="ArrowRight01Icon"
							phosphor="CaretRightIcon"
							remixicon="RiArrowRightSLine"
							class="text-muted-foreground size-4 shrink-0"
						/>
					</a>
				{/snippet}
			</Item.Root>
		</Item.Group>
	</Card.Content>
</Card.Root>
