<script lang="ts">
  import { onMount } from 'svelte';

  const AGENT_NAMES = [
    'analyst-7f2a', 'executor-3b1c', 'monitor-9d4e', 'researcher-2c8f',
    'planner-5a3d', 'writer-1e9b', 'auditor-4f2c', 'coder-8d1a',
    'reviewer-6b3e', 'scheduler-0c7f',
  ];
  const TASKS = [
    'Reviewing 14 open PRs on main branch',
    'Summarizing weekly Slack threads',
    'Generating Q2 financial report',
    'Running integration test suite',
    'Scraping competitor pricing data',
    'Drafting 23 cold emails from CRM',
    'Parsing inbound invoices → DB',
    'Monitoring uptime across 8 regions',
    'Refactoring auth module — 3 files',
    'Analyzing user churn signals',
    'Syncing Notion docs with Linear',
    'Tagging 1,200 support tickets',
    'Deploying to staging environment',
    'Processing webhook payloads',
  ];
  const REGIONS = ['us-east', 'eu-west', 'ap-south', 'us-west', 'eu-central'];
  const STATUSES = [
    { label: 'running',  color: '#4ade80' },
    { label: 'running',  color: '#4ade80' },
    { label: 'running',  color: '#4ade80' },
    { label: 'queued',   color: '#facc15' },
    { label: 'complete', color: '#60a5fa' },
  ];

  type AgentRow = {
    id: string; name: string; task: string; region: string;
    status: typeof STATUSES[number]; progress: number; elapsed: string; key: number;
  };

  const SEED_ROWS: AgentRow[] = [
    { id: 'A1B2C3', name: 'analyst-7f2a',    task: 'Generating Q2 financial report',     region: 'us-east',    status: STATUSES[0], progress: 42, elapsed: '3m 12s', key: 0 },
    { id: 'D4E5F6', name: 'executor-3b1c',   task: 'Running integration test suite',     region: 'eu-west',    status: STATUSES[0], progress: 67, elapsed: '7m 48s', key: 1 },
    { id: 'G7H8I9', name: 'researcher-2c8f', task: 'Scraping competitor pricing data',   region: 'us-west',    status: STATUSES[3], progress: 18, elapsed: '1m 05s', key: 2 },
    { id: 'J0K1L2', name: 'planner-5a3d',    task: 'Syncing Notion docs with Linear',    region: 'eu-central', status: STATUSES[0], progress: 55, elapsed: '5m 30s', key: 3 },
    { id: 'M3N4O5', name: 'coder-8d1a',      task: 'Refactoring auth module — 3 files',  region: 'ap-south',   status: STATUSES[0], progress: 80, elapsed: '11m 22s', key: 4 },
    { id: 'P6Q7R8', name: 'monitor-9d4e',    task: 'Monitoring uptime across 8 regions', region: 'us-east',    status: STATUSES[4], progress: 99, elapsed: '14m 01s', key: 5 },
  ];

  function randomRow(key: number): AgentRow {
    return {
      id: Math.random().toString(36).slice(2, 8).toUpperCase(),
      name: AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)],
      task: TASKS[Math.floor(Math.random() * TASKS.length)],
      region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      progress: Math.floor(Math.random() * 85 + 10),
      elapsed: `${Math.floor(Math.random() * 14 + 1)}m ${Math.floor(Math.random() * 59)}s`,
      key,
    };
  }

  let rows = $state<AgentRow[]>(SEED_ROWS);
  let keyRef = 100;

  // Progress for each row — animated via RAF
  let progresses = $state<number[]>(SEED_ROWS.map(r => r.progress));
  let canvasEls: (HTMLCanvasElement | null)[] = Array(6).fill(null);

  onMount(() => {
    rows = Array.from({ length: 6 }, (_, i) => randomRow(i));
    progresses = rows.map(r => r.progress);

    const interval = setInterval(() => {
      keyRef++;
      rows = [...rows.slice(1), randomRow(keyRef)];
      progresses = rows.map(r => r.progress);
    }, 2800);

    // Animate progress bars via RAF
    const pcts = [...progresses];
    let raf = 0;
    const animate = () => {
      let changed = false;
      for (let i = 0; i < pcts.length; i++) {
        if (pcts[i] < 99) {
          pcts[i] = Math.min(99, pcts[i] + 0.015);
          changed = true;
        }
      }
      if (changed) progresses = [...pcts];
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(raf);
    };
  });

  // Keep pcts in sync when rows change
  $effect(() => {
    progresses = rows.map(r => r.progress);
  });
</script>

<div style="border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; overflow: hidden; background: rgba(255,255,255,0.7);">
  <!-- Table header -->
  <div style="display: grid; grid-template-columns: 80px 1fr 80px 70px; padding: 8px 16px; border-bottom: 1px solid rgba(0,0,0,0.06); background: rgba(0,0,0,0.03);">
    {#each ['AGENT', 'TASK', 'REGION', 'STATUS'] as h}
      <span style="font-size: 8px; letter-spacing: 0.16em; color: rgba(0,0,0,0.30); font-family: monospace;">{h}</span>
    {/each}
  </div>

  <!-- Rows -->
  <div style="overflow: hidden;">
    {#each rows as row, i (row.key)}
      <div
        style="display: grid; grid-template-columns: 80px 1fr 80px 70px; padding: 10px 16px; border-bottom: 1px solid rgba(0,0,0,0.04); gap: 8px; align-items: center; animation: {i === rows.length - 1 ? 'rowSlideIn 0.4s cubic-bezier(0.16,1,0.3,1) both' : 'none'};"
      >
        <!-- Agent -->
        <div>
          <div style="font-size: 9px; font-family: monospace; color: rgba(0,0,0,0.65); margin-bottom: 1px;">{row.name}</div>
          <div style="font-size: 7.5px; font-family: monospace; color: rgba(0,0,0,0.25);">#{row.id}</div>
        </div>

        <!-- Task + progress -->
        <div style="min-width: 0;">
          <div style="font-size: 9px; color: rgba(0,0,0,0.50); line-height: 1.35; margin-bottom: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{row.task}</div>
          <div style="width: 100%; height: 2px; background: rgba(0,0,0,0.08); border-radius: 9px;">
            <div style="height: 100%; border-radius: 9px; width: {progresses[i] ?? row.progress}%; background: rgba(0,0,0,0.35); transition: width 0.5s linear;"></div>
          </div>
        </div>

        <!-- Region -->
        <div style="font-size: 8px; font-family: monospace; color: rgba(0,0,0,0.30);">{row.region}</div>

        <!-- Status -->
        <div style="display: flex; align-items: center; gap: 5px;">
          <span style="width: 5px; height: 5px; border-radius: 50%; background: {row.status.color}; box-shadow: {row.status.label === 'running' ? `0 0 6px ${row.status.color}` : 'none'}; animation: {row.status.label === 'running' ? 'statusPulse 2s ease-in-out infinite' : 'none'}; flex-shrink: 0;"></span>
          <span style="font-size: 8px; font-family: monospace; color: rgba(0,0,0,0.35);">{row.status.label}</span>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  @keyframes rowSlideIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes statusPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
</style>
