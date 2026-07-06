<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import X from '@lucide/svelte/icons/x';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import { appState } from '../state.svelte.js';

	import { Chat } from "@ai-sdk/svelte";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import GlobeIcon from "@lucide/svelte/icons/globe";
	import ImageIcon from "@lucide/svelte/icons/image";
	import MessageCircleDashedIcon from "@lucide/svelte/icons/message-circle-dashed";
	import PaperclipIcon from "@lucide/svelte/icons/paperclip";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import RotateCwIcon from "@lucide/svelte/icons/rotate-cw";
	import TelescopeIcon from "@lucide/svelte/icons/telescope";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import * as InputGroup from "$lib/components/ui/input-group/index.js";
	import * as MessageScroller from "$lib/components/ui/message-scroller/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import MessageAnimated from "$lib/components/message-animated.svelte";
	import { createChat, getMessageText } from "$lib/lib/ai.svelte.js";

	const chat = createChat()
		.user("¿Cuál es el estado general del inventario esta semana?")
		.sleep(800)
		.assistant(
			"El inventario presenta **3 alertas críticas** que requieren atención hoy:\n\n1. **Válvula de compuerta 2\" (SKU-0482)** — stock en 4 uds, mínimo recomendado 20. Proveedor Ferreaceros tiene entrega en 3 días.\n2. **Brida ciega DN100 (SKU-1130)** — 0 existencias. Hay 2 órdenes de compra abiertas desde hace 12 días sin confirmación de fecha.\n3. **Empaque PTFE (SKU-0219)** — consumo promedio semanal aumentó 40% vs mes anterior. Al ritmo actual, se agotará en 6 días.\n\n¿Quieres que genere las requisiciones de compra para los tres artículos ahora?"
		)
		.user("Sí, genera las requisiciones. ¿A qué proveedor le asignas cada una?")
		.sleep(1000)
		.assistant(
			"Basándome en historial de precios, tiempos de entrega y calificación de proveedor, recomiendo:\n\n| Artículo | Proveedor | Precio unit. | Entrega est. |\n|---|---|---|---|\n| Válvula 2\" | Ferreaceros del Norte | $487.00 | 3 días |\n| Brida DN100 | Grupo Industrial Reyes | $1,240.00 | 5 días |\n| Empaque PTFE | Plastimundo S.A. | $38.50 | 1 día |\n\nHe pre-llenado las 3 requisiciones. **Nota:** Grupo Industrial Reyes tiene una factura vencida de $14,200 — Cuentas por Pagar debe liberarla antes de que Compras pueda emitir la orden. ¿Procedo con las otras dos y marco la brida como pendiente?"
		)
		.user("Procede con las dos y avísame cuando estén autorizadas.")
		.sleep(900)
		.assistant(
			"Listo. REQ-2024-0891 (Válvula) y REQ-2024-0892 (Empaque PTFE) están en flujo de autorización.\n\nDetecté que el autorizador asignado, **Ing. Ramírez**, tiene 7 documentos pendientes con más de 48 hrs sin revisar. Le envié una notificación automática con prioridad alta.\n\nTambién encontré algo relevante: el **proyecto Planta Norte (OT-445)** consume el 60% del empaque PTFE que estás reordenando. Si ese proyecto se adelanta, necesitarás el doble. ¿Quieres que ajuste la cantidad antes de autorizar?"
		)
		.user("Buena observación. Ajusta la cantidad al doble para OT-445.")
		.sleep(700)
		.assistant(
			"REQ-2024-0892 actualizada: cantidad de 500 uds → **1,000 uds** (importe $38,500). Monto por encima del límite de autorización individual del Ing. Ramírez ($30,000), por lo que el flujo escala automáticamente al **Gerente de Operaciones**.\n\nAdemás, detecté que Plastimundo ofrece descuento del 8% en pedidos superiores a 800 uds — ya está aplicado. Ahorro generado: **$3,080.00**.\n\nRequisición lista para firma electrónica. ¿Algo más antes de cerrar el día?"
		);
	const initialMessages = chat.get({ count: 0 });
	const transport = chat.transport({ chunkDelayMs: 20 });
	const chatState = new Chat({
		messages: initialMessages,
		transport,
	});
	const nextMessage = $derived(chat.next({ after: chatState.messages }));
	const isBusy = $derived(chatState.status === "submitted" || chatState.status === "streaming");

	function resetConversation() {
		chatState.messages = initialMessages;
	}
</script>

<div class="flex h-full flex-col bg-background">
	<!-- Header -->
	<div class="flex h-9 shrink-0 items-center justify-between px-3">
		<div class="flex items-center gap-2">
			<MessageSquare class="size-3.5 text-muted-foreground" />
			<span class="text-xs font-medium">Chat IA</span>
		</div>
		<div class="flex items-center gap-0.5">
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="ghost"
							size="icon"
							class="size-6"
							aria-label="Reiniciar conversación"
							onclick={resetConversation}
							disabled={isBusy}
						>
							<RotateCwIcon class="size-3.5" />
						</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content side="bottom"><p>Reiniciar</p></Tooltip.Content>
			</Tooltip.Root>
			<Button
				variant="ghost"
				size="icon"
				class="size-6"
				aria-label="Cerrar panel"
				onclick={() => (appState.aiChatOpen = false)}
			>
				<X class="size-3.5" />
			</Button>
		</div>
	</div>
	<Separator />

	<MessageScroller.Provider>
		<div class="flex min-h-0 flex-1 flex-col">
			{#if chatState.messages.length === 0}
				<Empty.Root class="flex-1">
					<Empty.Header>
						<Empty.Media variant="icon">
							<MessageCircleDashedIcon />
						</Empty.Media>
						<Empty.Title>Chat IA</Empty.Title>
						<Empty.Description>¿En qué puedo ayudarte?</Empty.Description>
					</Empty.Header>
				</Empty.Root>
			{:else}
				<MessageScroller.Root class="flex-1">
					<MessageScroller.Viewport>
						<MessageScroller.Content aria-busy={isBusy} class="p-4">
							{#each chatState.messages as message (message.id)}
								<MessageAnimated
									{message}
									scrollAnchor={message.role === "user"}
								/>
							{/each}
						</MessageScroller.Content>
					</MessageScroller.Viewport>
					<MessageScroller.Button />
				</MessageScroller.Root>
			{/if}

			<!-- Input -->
			<div class="shrink-0 border-t p-3">
				<form
					onsubmit={(event) => {
						event.preventDefault();
						if (!nextMessage || isBusy) return;
						void chatState.sendMessage(nextMessage);
					}}
				>
					<InputGroup.Root>
						<div class="h-14 w-full px-3 py-2.5">
							<span
								class="line-clamp-2 opacity-60 data-[status=ready]:opacity-100"
								data-status={chatState.status}
							>
								{#if nextMessage}
									{getMessageText(nextMessage)}
								{:else}
									<span class="text-muted-foreground text-xs">
										Sin mensajes. Reinicia la conversación.
									</span>
								{/if}
							</span>
						</div>
						<InputGroup.Addon align="block-end" class="pt-1">
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									{#snippet child({ props })}
										<InputGroup.Button
											{...props}
											aria-label="Adjuntar"
											type="button"
											size="icon-sm"
											variant="outline"
										>
											<PlusIcon />
										</InputGroup.Button>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content
									align="start"
									side="top"
									class="w-44"
									portalProps={{ disabled: true }}
								>
									<DropdownMenu.Item>
										<PaperclipIcon />
										Adjuntar archivo
									</DropdownMenu.Item>
									<DropdownMenu.Separator />
									<DropdownMenu.Item>
										<ImageIcon />
										Crear imagen
									</DropdownMenu.Item>
									<DropdownMenu.Item>
										<TelescopeIcon />
										Deep Research
									</DropdownMenu.Item>
									<DropdownMenu.Item>
										<GlobeIcon />
										Búsqueda web
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
							<InputGroup.Button
								type="submit"
								variant="default"
								size="icon-sm"
								disabled={!nextMessage || isBusy}
								class="ml-auto"
							>
								<ArrowUpIcon />
								<span class="sr-only">Enviar</span>
							</InputGroup.Button>
						</InputGroup.Addon>
					</InputGroup.Root>
				</form>
			</div>
		</div>
	</MessageScroller.Provider>
</div>
