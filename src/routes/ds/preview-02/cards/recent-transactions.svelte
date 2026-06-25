<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Movimientos contables recientes</Card.Title>
		<Card.Description>Últimas operaciones contables y logísticas.</Card.Description>
		<Card.Action>
			<Button variant="outline" size="sm">Ver todo</Button>
		</Card.Action>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Body>
				<Table.Row>
					<Table.Cell class="w-10">
						<div class="bg-muted flex size-10 items-center justify-center rounded-lg">
							<IconPlaceholder
								class="size-4 shrink-0"
								lucide="CoffeeIcon"
								tabler="IconCoffee"
								hugeicons="CoffeeIcon"
								phosphor="CoffeeIcon"
								remixicon="RiCupLine"
							/>
						</div>
					</Table.Cell>
					<Table.Cell>
						<div class="flex flex-col">
							<span class="font-medium">Factura Proveedor A</span>
							<span class="text-muted-foreground text-sm">Compras</span>
						</div>
					</Table.Cell>
					<Table.Cell class="text-muted-foreground text-sm">Today, 10:24 AM</Table.Cell>
					<Table.Cell class="text-right">
						<span class="text-sm font-semibold tabular-nums">-$6.50</span>
					</Table.Cell>
					<Table.Cell class="w-8">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Button variant="ghost" size="icon-sm" {...props}>
										<IconPlaceholder
											lucide="MoreHorizontalIcon"
											tabler="IconDotsVertical"
											hugeicons="MoreVerticalCircle01Icon"
											phosphor="DotsThreeIcon"
											remixicon="RiMore2Line"
										/>
									</Button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end">
								<DropdownMenu.Item>Ver dashboard</DropdownMenu.Item>
								<DropdownMenu.Item>Agregar nota</DropdownMenu.Item>
								<DropdownMenu.Item>Categorizar</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item>Reportar</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell class="w-10">
						<div class="bg-muted flex size-10 items-center justify-center rounded-lg">
							<IconPlaceholder
								class="size-4 shrink-0"
								lucide="ShoppingCartIcon"
								tabler="IconShoppingCart"
								hugeicons="ShoppingCart01Icon"
								phosphor="ShoppingCartIcon"
								remixicon="RiShoppingCartLine"
							/>
						</div>
					</Table.Cell>
					<Table.Cell>
						<div class="flex flex-col">
							<span class="font-medium">Adquisición de materia prima</span>
							<span class="text-muted-foreground text-sm">Inventario</span>
						</div>
					</Table.Cell>
					<Table.Cell class="text-muted-foreground text-sm">Yesterday</Table.Cell>
					<Table.Cell class="text-right">
						<span class="text-sm font-semibold tabular-nums">-$142.30</span>
					</Table.Cell>
					<Table.Cell class="w-8">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Button variant="ghost" size="icon-sm" {...props}>
										<IconPlaceholder
											lucide="MoreHorizontalIcon"
											tabler="IconDotsVertical"
											hugeicons="MoreVerticalCircle01Icon"
											phosphor="DotsThreeIcon"
											remixicon="RiMore2Line"
										/>
									</Button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end">
								<DropdownMenu.Item>Ver dashboard</DropdownMenu.Item>
								<DropdownMenu.Item>Agregar nota</DropdownMenu.Item>
								<DropdownMenu.Item>Categorizar</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item>Reportar</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell class="w-10">
						<div class="bg-muted flex size-10 items-center justify-center rounded-lg">
							<IconPlaceholder
								class="size-4 shrink-0"
								lucide="WalletIcon"
								tabler="IconWallet"
								hugeicons="Wallet01Icon"
								phosphor="WalletIcon"
								remixicon="RiWalletLine"
							/>
						</div>
					</Table.Cell>
					<Table.Cell>
						<div class="flex flex-col">
							<span class="font-medium">Cobro de cliente de cliente</span>
							<span class="text-muted-foreground text-sm">Ingresos</span>
						</div>
					</Table.Cell>
					<Table.Cell class="text-muted-foreground text-sm">Oct 12</Table.Cell>
					<Table.Cell class="text-right">
						<span class="text-sm font-semibold text-emerald-500 tabular-nums"
							>+$4,200.00</span
						>
					</Table.Cell>
					<Table.Cell class="w-8">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Button variant="ghost" size="icon-sm" {...props}>
										<IconPlaceholder
											lucide="MoreHorizontalIcon"
											tabler="IconDotsVertical"
											hugeicons="MoreVerticalCircle01Icon"
											phosphor="DotsThreeIcon"
											remixicon="RiMore2Line"
										/>
									</Button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end">
								<DropdownMenu.Item>Ver dashboard</DropdownMenu.Item>
								<DropdownMenu.Item>Agregar nota</DropdownMenu.Item>
								<DropdownMenu.Item>Categorizar</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item>Reportar</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell class="w-10">
						<div class="bg-muted flex size-10 items-center justify-center rounded-lg">
							<IconPlaceholder
								class="size-4 shrink-0"
								lucide="CarIcon"
								tabler="IconCar"
								hugeicons="Car01Icon"
								phosphor="CarIcon"
								remixicon="RiCarLine"
							/>
						</div>
					</Table.Cell>
					<Table.Cell>
						<div class="flex flex-col">
							<span class="font-medium">Logística y transporte</span>
							<span class="text-muted-foreground text-sm">Logística</span>
						</div>
					</Table.Cell>
					<Table.Cell class="text-muted-foreground text-sm">Oct 11</Table.Cell>
					<Table.Cell class="text-right">
						<span class="text-sm font-semibold tabular-nums">-$24.10</span>
					</Table.Cell>
					<Table.Cell class="w-8">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Button variant="ghost" size="icon-sm" {...props}>
										<IconPlaceholder
											lucide="MoreHorizontalIcon"
											tabler="IconDotsVertical"
											hugeicons="MoreVerticalCircle01Icon"
											phosphor="DotsThreeIcon"
											remixicon="RiMore2Line"
										/>
									</Button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end">
								<DropdownMenu.Item>Ver dashboard</DropdownMenu.Item>
								<DropdownMenu.Item>Agregar nota</DropdownMenu.Item>
								<DropdownMenu.Item>Categorizar</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item>Reportar</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell class="w-10">
						<div class="bg-muted flex size-10 items-center justify-center rounded-lg">
							<IconPlaceholder
								class="size-4 shrink-0"
								lucide="TvIcon"
								tabler="IconDeviceTv"
								hugeicons="Tv01Icon"
								phosphor="TelevisionIcon"
								remixicon="RiTvLine"
							/>
						</div>
					</Table.Cell>
					<Table.Cell>
						<div class="flex flex-col">
							<span class="font-medium">Suscripción ERP</span>
							<span class="text-muted-foreground text-sm">Servicios</span>
						</div>
					</Table.Cell>
					<Table.Cell class="text-muted-foreground text-sm">Oct 10</Table.Cell>
					<Table.Cell class="text-right">
						<span class="text-sm font-semibold tabular-nums">-$19.99</span>
					</Table.Cell>
					<Table.Cell class="w-8">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Button variant="ghost" size="icon-sm" {...props}>
										<IconPlaceholder
											lucide="MoreHorizontalIcon"
											tabler="IconDotsVertical"
											hugeicons="MoreVerticalCircle01Icon"
											phosphor="DotsThreeIcon"
											remixicon="RiMore2Line"
										/>
									</Button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end">
								<DropdownMenu.Item>Ver dashboard</DropdownMenu.Item>
								<DropdownMenu.Item>Agregar nota</DropdownMenu.Item>
								<DropdownMenu.Item>Categorizar</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item>Reportar</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
