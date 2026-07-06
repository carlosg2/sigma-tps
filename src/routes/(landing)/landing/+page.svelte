<script lang="ts">
  import { onMount } from 'svelte';
  import IntroAnimation, { HERO_REVEAL_MS } from './intro-animation.svelte';
  import MobileNav from './mobile-nav.svelte';
  import RevealText from './reveal-text.svelte';
  import PixelIcon from './pixel-icon.svelte';
  import BentoCard from './bento-card.svelte';
  import StackingAgentCards from './stacking-agent-cards.svelte';
  import LiveAgentFeed from './live-agent-feed.svelte';
  import LiveAgentCounter from './live-agent-counter.svelte';
  import DevExSection from './devex-section.svelte';

  let heroReady = $state(false);
  let videoReady = $state(false);
  let email = $state('');
  let submitted = $state(false);

  function handleIntroDone() {
    heroReady = true;
  }

  onMount(() => {
    const t = setTimeout(() => (videoReady = true), HERO_REVEAL_MS);
    return () => clearTimeout(t);
  });

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (email) submitted = true;
  }
</script>

{#snippet tag(text: string)}
  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest text-black/40 bg-black/[0.04]">{text}</span>
{/snippet}

<div class="bg-[#F5F4F0] text-[#111] min-h-screen antialiased" style="font-family: 'IBM Plex Sans Variable', sans-serif;">

  <!-- ── INTRO ANIMATION ───────────────────────────────────────────────── -->
  <IntroAnimation onDone={handleIntroDone} />

  <!-- ── STICKY NAV ────────────────────────────────────────────────────── -->
  <MobileNav />

  <!-- ── HERO ──────────────────────────────────────────────────────────── -->
  <section class="relative h-screen overflow-hidden">

    <!-- Video background -->
    <video
      autoplay
      loop
      muted
      playsinline
      class="absolute inset-0 w-full h-full object-cover z-0"
      src="/videos/agentic-hero.mp4"
      style="transform: {videoReady ? 'scale(1.05)' : 'scale(0.85)'}; transition: transform 2s cubic-bezier(0.16, 1, 0.3, 1);"
    ></video>

    <!-- Progressive blur + light gradient rising from bottom -->
    <div class="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style="height: 65%; background: linear-gradient(to top, #F5F4F0 0%, #F5F4F0 18%, rgba(245,244,240,0.85) 35%, rgba(245,244,240,0.5) 55%, rgba(245,244,240,0.15) 75%, transparent 100%);"></div>
    <div class="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style="height: 20%; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); mask-image: linear-gradient(to top, black 0%, transparent 100%); -webkit-mask-image: linear-gradient(to top, black 0%, transparent 100%);"></div>
    <div class="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style="height: 38%; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); mask-image: linear-gradient(to top, black 0%, transparent 100%); -webkit-mask-image: linear-gradient(to top, black 0%, transparent 100%);"></div>
    <div class="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style="height: 55%; backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); mask-image: linear-gradient(to top, black 0%, transparent 100%); -webkit-mask-image: linear-gradient(to top, black 0%, transparent 100%);"></div>

    <div class="h-20"></div>

    <!-- Title + metrics -->
    <div class="absolute inset-x-0 bottom-0 z-30 flex flex-col px-6 md:px-12 pb-12 max-w-3xl">
      <h1
        class="text-6xl sm:text-7xl md:text-8xl font-light text-[#111] leading-[1.0] tracking-tight mb-10"
        style="opacity: {heroReady ? 1 : 0}; filter: {heroReady ? 'blur(0px)' : 'blur(24px)'}; transform: {heroReady ? 'translateY(0px)' : 'translateY(32px)'}; transition: opacity 1s cubic-bezier(0.16,1,0.3,1), filter 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1);"
      >
        Build &amp;<br />orchestrate AI<br />agents while<br />you sleep.
      </h1>

      <div class="flex gap-8 sm:gap-12">
        {#each [{ value: '50M+', label: 'Tasks' }, { value: '99.9%', label: 'Uptime' }, { value: '180+', label: 'Countries' }] as stat, i}
          <div style="opacity: {heroReady ? 1 : 0}; filter: {heroReady ? 'blur(0px)' : 'blur(16px)'}; transform: {heroReady ? 'translateY(0px)' : 'translateY(20px)'}; transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1) {120 + i * 80}ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) {120 + i * 80}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) {120 + i * 80}ms;">
            <div class="text-3xl sm:text-4xl text-[#111] font-light tracking-tight">{stat.value}</div>
            <div class="text-xs text-black/40 tracking-widest uppercase mt-1">{stat.label}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── PLATFORM OVERVIEW (bento) ──────────────────────────────────────── -->
  <section id="platform" class="py-32 px-6 md:px-12 lg:px-20">
    <div class="max-w-6xl mx-auto">
      <div class="mb-16">
        <PixelIcon type="platform" size={40} />
        <div class="mt-4">{@render tag('PLATFORM')}</div>
        <RevealText class="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]" text={"Everything you need\nto ship agents."} />
      </div>

      <div class="grid grid-cols-12 gap-3">
        <!-- Big card -->
        <BentoCard class="col-span-12 p-8 min-h-[200px] flex flex-col justify-between relative overflow-hidden" delay={0}>
          <img
            src="/images/agentic-arc.png"
            alt=""
            aria-hidden="true"
            class="absolute inset-0 w-full h-full object-cover"
            style="object-position: center 70%;"
          />
          <div class="absolute inset-0" style="mask-image: linear-gradient(to bottom, transparent 45%, black 100%); -webkit-mask-image: linear-gradient(to bottom, transparent 45%, black 100%); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);"></div>
          <div class="absolute inset-0" style="background: linear-gradient(to bottom, transparent 35%, rgba(245,244,240,0.3) 50%, rgba(245,244,240,0.75) 65%, rgba(245,244,240,0.95) 80%, rgb(245,244,240) 100%);"></div>
          <div class="relative z-10">
            <div class="w-10 h-10 rounded-xl border border-black/10 bg-white/60 flex items-center justify-center mb-6" style="backdrop-filter: blur(8px);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="m4.93 4.93 2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>
            </div>
            <h3 class="text-xl font-light mb-3">Visual Agent Builder</h3>
            <p class="text-sm text-black/45 leading-relaxed max-w-sm">Drag, connect, and configure agents through an intuitive graph editor. No boilerplate. Ship in minutes, not days.</p>
          </div>
        </BentoCard>

        <!-- Bottom row -->
        <BentoCard class="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={120}>
          <div class="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <h3 class="text-lg font-light mb-2">Real-time Monitoring</h3>
          <p class="text-sm text-black/45 leading-relaxed">Trace every decision. Debug with full execution history and live logs.</p>
        </BentoCard>

        <BentoCard class="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={160}>
          <div class="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10h8M8 14h5"/></svg>
          </div>
          <h3 class="text-lg font-light mb-2">Memory & Context</h3>
          <p class="text-sm text-black/45 leading-relaxed">Persistent long-term memory across sessions. Agents learn from every interaction.</p>
        </BentoCard>

        <BentoCard class="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={200}>
          <div class="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3 class="text-lg font-light mb-2">Guardrails & Permissions</h3>
          <p class="text-sm text-black/45 leading-relaxed">Define what agents can and cannot do. Fine-grained access control per tool.</p>
        </BentoCard>
      </div>
    </div>
  </section>

  <!-- ── BUILD YOUR AGENTS ───────────────────────────────────────────────── -->
  <section id="agents" class="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
        <div>
          <PixelIcon type="agents" size={40} />
          <div class="mt-4">{@render tag('AGENT TYPES')}</div>
          <RevealText class="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]" text={"Plug-and-play agents\nready to deploy."} />
        </div>
        <p class="text-sm text-black/45 leading-relaxed max-w-xs">
          Start with a pre-built agent or compose your own from primitives. Every agent is versioned, testable, and observable.
        </p>
      </div>
      <StackingAgentCards />
    </div>
  </section>

  <!-- ── HOW IT WORKS ────────────────────────────────────────────────────── -->
  <section id="workflow" class="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden">
    <div class="max-w-6xl mx-auto">
      <div class="mb-16">
        <PixelIcon type="workflow" size={40} />
        <div class="mt-4">{@render tag('WORKFLOW')}</div>
        <RevealText class="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]" text={"From idea to running agent\nin four steps."} />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        {#each [
          { n: '01', title: 'Define',  desc: 'Describe your agent in plain language. Set objectives, tools, and boundaries.', delay: 0,   img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/define-5aafAmGBrxZpOqJ3XLHY3n3qzC2I5K.png' },
          { n: '02', title: 'Compose', desc: 'Chain agents together in the visual editor. Wire triggers, conditions, and outputs.', delay: 80,  img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/compose-5RT5VR4f1Y3GoFmovqTKLTG4UXp3g2.png' },
          { n: '03', title: 'Test',    desc: 'Run sandboxed simulations. Inspect every decision in the execution trace.', delay: 140, img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test-zm8guZwxJHtwWsJ7XO4B0CF7GzlNK8.png' },
          { n: '04', title: 'Deploy',  desc: 'Push globally in one click. Agents auto-scale, self-heal, and report back.', delay: 200, img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deploy-an8fgHSLzniojkcmRyGGIFQUJF9T5J.png' },
        ] as step}
          <BentoCard class="relative overflow-hidden flex flex-col min-h-[320px]" delay={step.delay}>
            <div class="absolute inset-x-0 top-0 h-56 pointer-events-none">
              <img
                src={step.img}
                alt={step.title}
                class="w-full h-full object-cover object-top"
                style="mask-image: linear-gradient(to bottom, black 0%, black 30%, transparent 80%); -webkit-mask-image: linear-gradient(to bottom, black 0%, black 30%, transparent 80%);"
              />
            </div>
            <div class="relative z-10 p-7">
              <span class="font-mono text-[11px] text-black/20 tracking-widest block">{step.n}</span>
            </div>
            <div class="relative z-10 px-7 pb-7 mt-auto pt-16">
              <h3 class="text-2xl font-light mb-3">{step.title}</h3>
              <p class="text-sm text-black/45 leading-relaxed">{step.desc}</p>
            </div>
          </BentoCard>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── INTEGRATIONS ────────────────────────────────────────────────────── -->
  <section id="integrations" class="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
        <div>
          <PixelIcon type="integrations" size={40} />
          <div class="mt-4">{@render tag('INTEGRATIONS')}</div>
          <RevealText class="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]" text={"Connect any tool.\nControl any system."} />
        </div>
        <p class="text-sm text-black/45 leading-relaxed max-w-xs">
          200+ native connectors. Everything from Slack to your internal database. Build custom tools with our SDK in minutes.
        </p>
      </div>

      <div class="rounded-2xl overflow-hidden border border-black/[0.07] flex flex-col md:block md:relative">
        <div class="relative w-full h-[280px] md:h-[480px] shrink-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Org%20Arc%20-%20Upscaled-Sk90jShfu7nltLnhoQbaMJC1YaQKuU.png"
            alt="Agent orchestration architecture"
            class="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>

        <div class="flex flex-col gap-3 p-4 md:absolute md:bottom-4 md:right-4 md:p-0 md:w-72">
          <div class="rounded-xl border border-white/50 p-6" style="backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); background: rgba(255,255,255,0.60);">
            {@render tag('SDK')}
            <h3 class="mt-3 text-lg font-light mb-2">Build custom tools</h3>
            <p class="text-xs text-black/45 leading-relaxed mb-4">Define any function as a tool your agents can call. TypeScript and Python.</p>
            <div class="bg-black/[0.05] rounded-lg border border-black/[0.07] p-3 font-mono text-[11px] text-black/50 leading-relaxed">
              <span class="text-black/25">// tool definition</span><br />
              <span class="text-blue-600/70">defineTool</span>({'({'}<br />
              {'  '}<span class="text-amber-700/70">name</span>: <span class="text-green-700/70">'fetchPrice'</span>,<br />
              {'  '}<span class="text-amber-700/70">run</span>: <span class="text-black/35">async (q) </span>=&gt;<br />
              {'    '}<span class="text-blue-600/70">api</span>.get(q)<br />
              {'})'}
            </div>
          </div>

          <div class="rounded-xl border border-white/50 p-6" style="backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); background: rgba(255,255,255,0.60);">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse"></div>
              <span class="text-xs text-black/40 tracking-widest">LIVE API</span>
            </div>
            <p class="text-sm text-black/45">Full REST + WebSocket API. Stream agent outputs directly into your product.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── SECURITY & OBSERVABILITY ───────────────────────────────────────── -->
  <section id="security" class="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
    <div class="max-w-6xl mx-auto">
      <div class="mb-16">
        <PixelIcon type="platform" size={40} />
        <div class="mt-4">{@render tag('SECURITY')}</div>
        <RevealText class="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]" text={"Enterprise-grade\nfrom day one."} />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-6">
          <p class="text-sm text-black/45 leading-relaxed">
            Every action is logged, every decision is traceable. Built for teams that need compliance without compromise.
          </p>
          <div class="space-y-4">
            {#each [
              { label: 'SOC 2 Type II', desc: 'Independently audited security controls' },
              { label: 'Full Audit Trail', desc: 'Every decision logged with full traceability' },
              { label: 'Real-time Observability', desc: 'Monitor, debug, and replay any execution' },
            ] as item}
              <div class="flex gap-4">
                <div class="w-1 bg-black/10 rounded-full shrink-0"></div>
                <div>
                  <h3 class="text-sm font-light mb-1">{item.label}</h3>
                  <p class="text-xs text-black/35">{item.desc}</p>
                </div>
              </div>
            {/each}
          </div>
          <div class="pt-4 flex flex-col gap-2">
            {#each ['SOC 2', 'GDPR', 'HIPAA Ready', 'ISO 27001'] as badge}
              <div class="flex items-center gap-2 text-xs text-black/25">
                <span class="w-1 h-1 rounded-full bg-black/25"></span>
                {badge}
              </div>
            {/each}
          </div>
        </div>

        <BentoCard class="p-6" delay={0}>
          <div class="text-xs text-black/30 tracking-widest uppercase mb-4">Live Audit Trail</div>
          <div class="space-y-2">
            {#each [
              { time: '12:34:21', action: 'agent_executed', status: 'success' },
              { time: '12:34:18', action: 'decision_logged', status: 'success' },
              { time: '12:34:15', action: 'tool_called', status: 'success' },
              { time: '12:34:12', action: 'memory_updated', status: 'success' },
              { time: '12:34:09', action: 'output_generated', status: 'success' },
            ] as log, i}
              <div
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-black/[0.02] hover:bg-black/[0.04] transition-colors border border-black/[0.04] group cursor-pointer"
                style="animation: fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) {i * 80}ms both;"
              >
                <span class="text-[10px] text-black/25 font-mono min-w-[60px]">{log.time}</span>
                <span class="text-[11px] text-black/50 font-light flex-1">{log.action}</span>
                <span class="w-1.5 h-1.5 rounded-full bg-green-500/60 group-hover:bg-green-500 transition-colors"></span>
              </div>
            {/each}
          </div>
        </BentoCard>
      </div>
    </div>
  </section>

  <!-- ── DEVELOPER EXPERIENCE ────────────────────────────────────────────── -->
  <DevExSection />

  <!-- ── MARQUEE CAPABILITIES ───────────────────────────────────────────── -->
  <section class="py-0 border-t border-black/[0.06] overflow-hidden select-none">
    <div class="flex border-b border-black/[0.06]" style="animation: marqueeLeft 28s linear infinite;">
      {#each [1, 2, 3] as _}
        <div class="flex shrink-0">
          {#each ['Web Research', 'Code Generation', 'Email Drafting', 'Data Analysis', 'PR Reviews', 'Scheduling', 'SQL Queries', 'API Calls', 'File Processing', 'Monitoring'] as cap}
            <div class="flex items-center gap-6 px-10 py-5 border-r border-black/[0.06] shrink-0">
              <span class="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0"></span>
              <span class="text-sm text-black/45 whitespace-nowrap tracking-wide">{cap}</span>
            </div>
          {/each}
        </div>
      {/each}
    </div>
    <div class="flex" style="animation: marqueeRight 22s linear infinite;">
      {#each [1, 2, 3] as _}
        <div class="flex shrink-0">
          {#each ['Report Writing', 'Slack Summaries', 'Lead Scoring', 'Image Tagging', 'Test Running', 'Deployment', 'Log Parsing', 'Invoice Processing', 'Meeting Notes', 'Sentiment Analysis'] as cap}
            <div class="flex items-center gap-6 px-10 py-5 border-r border-black/[0.06] shrink-0">
              <span class="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0"></span>
              <span class="text-sm text-black/30 whitespace-nowrap tracking-wide">{cap}</span>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </section>

  <!-- ── LIVE AGENTS ─────────────────────────────────────────────────────── -->
  <section id="live" class="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <PixelIcon type="agents" size={40} />
          <div class="mt-4">{@render tag('LIVE RIGHT NOW')}</div>
          <RevealText class="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]" text={"Agents working\n24 / 7, autonomously."} />
          <p class="mt-6 text-base text-black/40 leading-relaxed max-w-sm">
            At any moment, thousands of agents are running tasks on behalf of teams around the world — no human in the loop.
          </p>
          <div class="mt-10 flex items-end gap-2">
            <LiveAgentCounter />
            <span class="text-black/30 text-sm mb-1 tracking-wide">agents active globally</span>
          </div>
        </div>
        <div class="relative">
          <LiveAgentFeed />
        </div>
      </div>
    </div>
  </section>

  <!-- ── PRICING ─────────────────────────────────────────────────────────── -->
  <section id="pricing" class="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16 flex flex-col items-center">
        <PixelIcon type="pricing" size={40} />
        <div class="mt-4">{@render tag('PRICING')}</div>
        <RevealText class="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]" text={"Pay as your agents grow."} />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        {#each [
          { name: 'Sandbox', price: 'Free', sub: 'Start experimenting', features: ['5 agents', '1,000 tasks/mo', 'Community support', 'Basic traces'], delay: 0 },
          { name: 'Builder', price: '$49', period: '/mo', sub: 'For teams shipping fast', features: ['50 agents', '100K tasks/mo', 'Priority support', 'Full traces + replay', 'Custom tools', 'REST API'], highlight: true, delay: 80 },
          { name: 'Enterprise', price: 'Custom', sub: 'For orgs at scale', features: ['Unlimited agents', 'Unlimited tasks', 'Dedicated infra', 'SOC 2 / HIPAA', 'SLA guarantees', 'Custom contracts'], delay: 140 },
        ] as plan}
          <BentoCard class="p-8 flex flex-col {plan.highlight ? 'border-black/20 !bg-[#F0EEE8]' : ''}" delay={plan.delay}>
            <div class="mb-8">
              <div class="font-mono text-[11px] tracking-widest text-black/40 mb-4">{plan.name}</div>
              <div class="flex items-baseline gap-1 mb-1">
                <span class="text-4xl font-light">{plan.price}</span>
                {#if plan.period}<span class="text-black/40 text-sm">{plan.period}</span>{/if}
              </div>
              <p class="text-xs text-black/35 tracking-wide">{plan.sub}</p>
            </div>
            <ul class="space-y-3 flex-1 mb-8">
              {#each plan.features as f}
                <li class="flex items-center gap-3 text-sm text-black/55">
                  <div class="w-1 h-1 rounded-full bg-black/25 shrink-0"></div>
                  {f}
                </li>
              {/each}
            </ul>
            <button class="w-full py-3 rounded-xl text-sm tracking-widest transition-all duration-200 {plan.highlight ? 'bg-[#111] text-white hover:bg-[#333]' : 'border border-black/10 text-black/60 hover:border-black/25 hover:text-black hover:bg-black/[0.04]'}">
              {plan.name === 'Enterprise' ? 'CONTACT SALES' : 'GET STARTED'}
            </button>
          </BentoCard>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── CTA ─────────────────────────────────────────────────────────────── -->
  <section class="relative py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden">
    <img
      src="/images/agentic-footer.png"
      alt=""
      aria-hidden="true"
      class="absolute bottom-0 left-0 w-full object-cover object-bottom pointer-events-none select-none"
      style="opacity: 0.85;"
    />
    <div class="absolute inset-0 pointer-events-none" style="mask-image: linear-gradient(to top, transparent 0%, black 55%); -webkit-mask-image: linear-gradient(to top, transparent 0%, black 55%); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);"></div>
    <div class="absolute inset-0 pointer-events-none" style="background: linear-gradient(to top, rgb(245,244,240) 0%, rgba(245,244,240,0.92) 18%, rgba(245,244,240,0.55) 35%, transparent 55%);"></div>

    <div class="relative z-10 max-w-2xl mx-auto text-center">
      <h2 class="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] mb-6">
        Start building your<br />agent workforce.
      </h2>
      <p class="text-sm text-black/45 leading-relaxed mb-10">
        Join thousands of teams deploying AI agents that work around the clock, across every timezone.
      </p>
      {#if !submitted}
        <form onsubmit={handleSubmit} class="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            bind:value={email}
            required
            class="flex-1 bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-black/25 focus:outline-none focus:border-black/25 transition-colors"
          />
          <button type="submit" class="px-8 py-3 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors tracking-widest font-medium">
            JOIN
          </button>
        </form>
      {:else}
        <div class="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-emerald-600/20 bg-emerald-50 text-emerald-700 text-sm">
          <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          You're on the list. We'll be in touch.
        </div>
      {/if}
    </div>
  </section>

  <!-- ── FOOTER ──────────────────────────────────────────────────────────── -->
  <footer class="py-10 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
      <span class="font-mono text-xs tracking-[0.25em] text-black/50">AGENTIC</span>

      <div class="flex flex-wrap items-center gap-x-8 gap-y-3">
        {#each [
          { label: 'Platform',     href: '#platform' },
          { label: 'Agents',       href: '#agents' },
          { label: 'Workflow',     href: '#workflow' },
          { label: 'Integrations', href: '#integrations' },
          { label: 'Live',         href: '#live' },
          { label: 'Pricing',      href: '#pricing' },
        ] as l}
          <a href={l.href} class="text-xs text-black/35 hover:text-black/70 transition-colors tracking-widest">{l.label}</a>
        {/each}
      </div>

      <div class="flex items-center gap-6">
        {#each [
          { label: 'Privacy', href: '#' },
          { label: 'Terms',   href: '#' },
          { label: 'Docs',    href: '#' },
          { label: 'GitHub',  href: '#' },
        ] as l}
          <a href={l.href} class="text-xs text-black/25 hover:text-black/55 transition-colors tracking-widest">{l.label}</a>
        {/each}
      </div>
    </div>
    <div class="max-w-6xl mx-auto mt-8 pt-6 border-t border-black/[0.04]">
      <span class="text-xs text-black/20">© 2026 Agentic. All rights reserved.</span>
    </div>
  </footer>
</div>

<style>
  @keyframes marqueeLeft {
    from { transform: translateX(0); }
    to   { transform: translateX(-33.333%); }
  }
  @keyframes marqueeRight {
    from { transform: translateX(-33.333%); }
    to   { transform: translateX(0); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
