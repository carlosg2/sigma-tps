<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import FileText from '@lucide/svelte/icons/file-text';
	import Flame from '@lucide/svelte/icons/flame';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Minus from '@lucide/svelte/icons/minus';
	import Paperclip from '@lucide/svelte/icons/paperclip';

	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { cn } from '$lib/utils.js';

	import { tagTones, type ColumnId, type Task, type TaskInsightLabel, type TaskPriority } from './data.js';
  import Card from '$lib/components/ui/card/card.svelte';

	const insightIcons: Record<TaskInsightLabel, typeof Paperclip> = {
		Adjuntos: Paperclip,
		Comentarios: MessageSquare,
		Documentos: FileText,
	};

	type PriorityConfig = {
		icon: typeof Flame;
		variant: 'destructive' | 'secondary';
		className: string;
	};

	const priorityConfig: Record<TaskPriority, PriorityConfig> = {
		Alta: {
			icon: Flame,
			variant: 'destructive',
			className: 'border-transparent',
		},
		Baja: {
			icon: Minus,
			variant: 'secondary',
			className: 'bg-slate-500/10 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
		},
		Media: {
			icon: ArrowUpRight,
			variant: 'secondary',
			className: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
		},
	};

	function getInitials(name: string) {
		return name
			.split(' ')
			.map((p) => p[0])
			.join('')
			.toUpperCase();
	}

	interface Props {
		task: Task;
		columnId?: ColumnId;
		isShadow?: boolean;
	}

	let { task, columnId, isShadow = false }: Props = $props();

	const isDone = $derived(columnId === 'shipped');
	const showBuildingDetails = $derived(columnId === 'building' && typeof task.progress === 'number');
	const config = $derived(priorityConfig[task.priority]);
	const PriorityIcon = $derived(config.icon);
</script>

<Card
	class={cn(
		'flex flex-col gap-3 bg-card p-4 text-card-foreground',
		isShadow && 'opacity-50',
	)}
>
	<div class="min-w-0 space-y-1.5">
		<div class="flex items-center justify-between gap-3">
			<h3 class="min-w-0 truncate font-medium text-sm leading-none">{task.title}</h3>
			<Badge
				variant={config.variant}
				class={cn('shrink-0 rounded-md border-transparent font-medium', config.className)}
			>
				<PriorityIcon class=" size-3" />
				{task.priority}
			</Badge>
		</div>
		<p class="line-clamp-2 text-muted-foreground text-sm leading-5">{task.description}</p>
	</div>

	{#if !showBuildingDetails}
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-1.5">
				<Avatar.Root class={cn('size-5 after:rounded-sm', task.owner.tone)}>
					<Avatar.Fallback class="rounded-sm text-[10px]">{getInitials(task.owner.name)}</Avatar.Fallback>
				</Avatar.Root>
				<span class="text-muted-foreground text-sm">{task.owner.name}</span>
			</div>
			<div class="flex min-w-0 items-center gap-1.5 text-muted-foreground">
				<span class="truncate text-sm">{task.dueDate}</span>
				<CalendarDays class="size-3" />
			</div>
		</div>
	{/if}

	{#if showBuildingDetails}
		<div class="flex flex-col gap-3">
			<div class="space-y-1.5">
				<div class="flex items-center justify-between text-muted-foreground text-xs">
					<span class="leading-none">Progreso</span>
					<span class="tabular-nums leading-none">{task.progress}%</span>
				</div>
				<Progress value={task.progress} />
			</div>
			<div class="flex flex-col gap-1.5">
				<div class="flex items-center justify-between gap-3">
					<span class="text-muted-foreground text-sm">Responsable</span>
					<div class="flex items-center gap-1.5">
						<span class="truncate text-muted-foreground text-sm">{task.owner.name}</span>
						<Avatar.Root class={cn('size-5 after:rounded-sm', task.owner.tone)}>
							<Avatar.Fallback class="rounded-sm text-[10px]">{getInitials(task.owner.name)}</Avatar.Fallback>
						</Avatar.Root>
					</div>
				</div>
				<div class="flex items-center justify-between gap-3">
					<span class="text-muted-foreground text-sm">Fecha límite</span>
					<span class="flex items-center gap-1.5 text-muted-foreground">
						<span class="truncate text-sm">{task.dueDate}</span>
						<CalendarDays class="size-3" />
					</span>
				</div>
				<div class="flex items-center justify-between gap-3">
					<span class="text-muted-foreground text-sm">Equipo</span>
					<Badge
						variant="secondary"
						class={cn('rounded-md border-transparent px-2 font-medium', tagTones[task.team])}
					>
						{task.team}
					</Badge>
				</div>
			</div>
		</div>
	{/if}

	<Separator />

	<div>
		{#if isDone}
			<div class="flex items-center gap-1 font-medium text-green-700 text-sm dark:text-green-600">
				<BadgeCheck class="size-4" />
				Entregado
			</div>
		{:else}
			<div class="flex items-center gap-3 text-muted-foreground text-sm">
				{#each task.insights as insight (insight.label)}
					{@const Icon = insightIcons[insight.label]}
					<span class="flex items-center gap-1.5 text-sm">
						<Icon class="size-3.5" />
						{insight.count}
					</span>
				{/each}
			</div>
		{/if}
	</div>
</Card>
