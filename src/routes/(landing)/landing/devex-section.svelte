<script lang="ts">
  import { onMount } from 'svelte';

  type CodeLine = {
    type: 'comment' | 'command' | 'gap' | 'output' | 'success' | 'url' | 'plain' | 'prop' | 'keyword';
    text?: string;
    after?: string;
    keyword2?: string;
    keyword3?: string;
    fn?: string;
    args?: string;
    string?: string;
    key?: string;
    val?: string;
  };

  const STEPS = [
    {
      num: '01', title: 'Install SDK', desc: 'One command to get started', file: 'terminal',
      code: [
        { type: 'comment', text: '# Install the Agentic SDK' },
        { type: 'command', text: 'npm install @agentic/sdk' },
        { type: 'gap' },
        { type: 'comment', text: '# Initialize your project' },
        { type: 'command', text: 'npx agentic init' },
        { type: 'gap' },
        { type: 'output', text: '✓ Project initialized' },
        { type: 'output', text: '✓ Config file created' },
        { type: 'output', text: '✓ Ready to build' },
      ] as CodeLine[],
    },
    {
      num: '02', title: 'Define Agent', desc: 'TypeScript-first agent class', file: 'agents/researcher.ts',
      code: [
        { type: 'comment', text: '// agents/researcher.ts' },
        { type: 'keyword', text: 'import', after: ' { Agent, Tool } ', keyword2: 'from', string: " '@agentic/sdk'" },
        { type: 'gap' },
        { type: 'keyword', text: 'const', after: ' webSearch ', keyword2: '=', keyword3: ' new ', fn: 'Tool', args: "('web-search', async (q) => { ... })" },
        { type: 'gap' },
        { type: 'keyword', text: 'export const', after: ' researcher ', keyword2: '=', keyword3: ' new ', fn: 'Agent', args: '({' },
        { type: 'prop', key: '  name', val: "'researcher'" },
        { type: 'prop', key: '  model', val: "'claude-opus'" },
        { type: 'prop', key: '  tools', val: '[webSearch]' },
        { type: 'prop', key: '  memory', val: 'true' },
        { type: 'plain', text: '});' },
      ] as CodeLine[],
    },
    {
      num: '03', title: 'Add Memory', desc: 'Persistent conversation context', file: 'agents/memory.ts',
      code: [
        { type: 'comment', text: '// Add long-term memory to any agent' },
        { type: 'keyword', text: 'import', after: ' { VectorMemory } ', keyword2: 'from', string: " '@agentic/memory'" },
        { type: 'gap' },
        { type: 'keyword', text: 'const', after: ' memory ', keyword2: '=', keyword3: ' new ', fn: 'VectorMemory', args: '({' },
        { type: 'prop', key: '  provider', val: "'pgvector'" },
        { type: 'prop', key: '  namespace', val: "'researcher'" },
        { type: 'plain', text: '})' },
        { type: 'gap' },
        { type: 'comment', text: '// Attach to agent' },
        { type: 'plain', text: 'researcher.use(memory)' },
      ] as CodeLine[],
    },
    {
      num: '04', title: 'Deploy', desc: 'One command to production', file: 'terminal',
      code: [
        { type: 'comment', text: '# Deploy to Agentic Cloud' },
        { type: 'command', text: 'agentic deploy --prod' },
        { type: 'gap' },
        { type: 'output', text: '  Building agent...' },
        { type: 'output', text: '  Running tests...' },
        { type: 'output', text: '  Deploying to edge...' },
        { type: 'gap' },
        { type: 'success', text: '✓ researcher deployed' },
        { type: 'url', text: '  → https://agents.agentic.dev/researcher' },
      ] as CodeLine[],
    },
  ];

  let active = $state(0);
  let visible = $state(true);

  function selectStep(i: number) {
    if (i === active) return;
    visible = false;
    setTimeout(() => { active = i; visible = true; }, 180);
  }

  onMount(() => {
    const t = setInterval(() => {
      visible = false;
      setTimeout(() => { active = (active + 1) % STEPS.length; visible = true; }, 180);
    }, 3200);
    return () => clearInterval(t);
  });

  const step = $derived(STEPS[active]);
</script>

<section id="devex" class="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
  <div class="max-w-6xl mx-auto">
    <div class="mb-16">
      <div class="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.05] border border-black/[0.06] text-[10px] tracking-widest text-black/40 uppercase">
        Developer Experience
      </div>
      <h2 class="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]" style="font-family: 'IBM Plex Sans Variable', sans-serif;">
        Built for developers.<br />Loved by teams.
      </h2>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
      <!-- Left — step cards -->
      <div class="flex flex-col gap-3">
        {#each STEPS as s, i}
          <button
            onclick={() => selectStep(i)}
            class="flex-1 text-left rounded-2xl border transition-all duration-200 p-6 group"
            style="background: {active === i ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.7)'}; border-color: {active === i ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.06)'}; box-shadow: {active === i ? '0 1px 3px rgba(0,0,0,0.06)' : '0 1px 2px rgba(0,0,0,0.03)'};"
          >
            <div class="flex gap-4 items-start">
              <div
                class="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-light shrink-0 transition-colors duration-200"
                style="background: {active === i ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)'}; color: {active === i ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.35)'};"
              >
                {s.num}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-light transition-colors duration-200" style="color: {active === i ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)'};">{s.title}</p>
                <p class="text-xs mt-0.5" style="color: rgba(0,0,0,0.28);">{s.desc}</p>
              </div>
            </div>
          </button>
        {/each}
      </div>

      <!-- Right — code panel -->
      <div
        class="lg:col-span-2 rounded-2xl border border-black/[0.06] p-8 flex flex-col"
        style="background: rgba(255,255,255,0.7); box-shadow: 0 1px 3px rgba(0,0,0,0.04); min-height: 360px;"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-5 shrink-0">
          <div
            class="text-[10px] tracking-widest uppercase"
            style="opacity: {visible ? 1 : 0}; filter: {visible ? 'blur(0px)' : 'blur(4px)'}; transition: opacity 200ms ease, filter 200ms ease; color: rgba(0,0,0,0.3);"
          >
            {step.file}
          </div>
          <div class="flex gap-1.5">
            {#each [0, 1, 2] as d}
              <div class="w-2 h-2 rounded-full transition-all duration-300" style="background: {d === active % 3 ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.08)'};"></div>
            {/each}
          </div>
        </div>

        <!-- Code block -->
        <div class="flex-1 rounded-xl p-6 overflow-hidden" style="background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.06);">
          <div
            class="font-mono text-[12px] leading-6"
            style="opacity: {visible ? 1 : 0}; filter: {visible ? 'blur(0px)' : 'blur(6px)'}; transform: {visible ? 'translateY(0)' : 'translateY(6px)'}; transition: opacity 220ms cubic-bezier(0.16,1,0.3,1), filter 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1);"
          >
            {#each step.code as line, li}
              {#if line.type === 'gap'}
                <div class="h-3"></div>
              {:else if line.type === 'comment'}
                <div style="color: #9ca3af;">{line.text}</div>
              {:else if line.type === 'output'}
                <div style="color: #6b7280;">{line.text}</div>
              {:else if line.type === 'success'}
                <div style="color: #16a34a;">{line.text}</div>
              {:else if line.type === 'url'}
                <div style="color: #2563eb; text-decoration: underline;">{line.text}</div>
              {:else if line.type === 'command'}
                <div><span style="color: #16a34a;">$ </span><span style="color: #111;">{line.text}</span></div>
              {:else if line.type === 'plain'}
                <div style="color: #111;">{line.text}</div>
              {:else if line.type === 'prop'}
                <div><span style="color: #2563eb;">{line.key}</span><span style="color: #111;">: </span><span style="color: #16a34a;">{line.val}</span><span style="color: #111;">,</span></div>
              {:else if line.type === 'keyword'}
                <div>
                  <span style="color: #7c3aed;">{line.text}</span>
                  <span style="color: #111;">{line.after}</span>
                  <span style="color: #7c3aed;">{line.keyword2}</span>
                  {#if line.keyword3}<span style="color: #7c3aed;">{line.keyword3}</span>{/if}
                  {#if line.fn}<span style="color: #b45309;">{line.fn}</span>{/if}
                  {#if line.args}<span style="color: #111;">{line.args}</span>{/if}
                  {#if line.string}<span style="color: #16a34a;">{line.string}</span>{/if}
                </div>
              {/if}
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
