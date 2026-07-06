<script lang="ts">
  import { onMount } from 'svelte';

  const AGENTS = [
    {
      label: 'RESEARCHER',
      title: 'Web & data research',
      desc: 'Autonomously browses the web, extracts structured data, synthesizes reports from multiple sources with citations.',
      stats: [{ v: '2.4M', l: 'tasks run' }, { v: '98.2%', l: 'accuracy' }],
      img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/researcher-CvhqOuV6irGwBOnJoTGFlXdbyYBRjb.png',
    },
    {
      label: 'CODER',
      title: 'Code generation & review',
      desc: 'Writes, refactors, and reviews code across 40+ languages. Runs tests, fixes bugs, opens pull requests automatically.',
      stats: [{ v: '1.1M', l: 'PRs merged' }, { v: '3.2s', l: 'avg response' }],
      img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/coder-9bItvCegU6TXUqbX3tUXGBAtvkBkXp.png',
    },
    {
      label: 'ANALYST',
      title: 'Data analysis & insights',
      desc: 'Connects to your databases, runs queries, visualizes trends, and surfaces anomalies before they become problems.',
      stats: [{ v: '880K', l: 'reports' }, { v: '12x', l: 'faster' }],
      img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/analyst-Ysxnqg7Fpy2cfA56PiIttv1KximMhT.png',
    },
    {
      label: 'EXECUTOR',
      title: 'Workflow automation',
      desc: 'Takes actions across APIs: sends messages, creates calendar events, triggers webhooks, and manages third-party apps.',
      stats: [{ v: '5.6M', l: 'executions' }, { v: '99.9%', l: 'uptime' }],
      img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/executor-o1q6509qMLXMtpBIGo49vcgOu34sI1.png',
    },
  ];

  const STICKY_TOP = 80;
  const STICKY_STEP = 16;
  const SCALE_STEP = 0.04;
  const OFFSET_STEP = 8;

  let cardEls: (HTMLDivElement | null)[] = Array(AGENTS.length).fill(null);
  let depth = $state<number[]>(AGENTS.map(() => 0));

  onMount(() => {
    function onScroll() {
      depth = AGENTS.map((_, i) => {
        let count = 0;
        for (let j = i + 1; j < AGENTS.length; j++) {
          const el = cardEls[j];
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const stickyTopJ = STICKY_TOP + j * STICKY_STEP;
          if (rect.top <= stickyTopJ + 2) count++;
        }
        return count;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  });
</script>

<div class="flex flex-col" style="perspective: 1400px; perspective-origin: 50% 0%;">
  {#each AGENTS as agent, i}
    {@const d = depth[i]}
    {@const scale = 1 - d * SCALE_STEP}
    {@const translateY = d * OFFSET_STEP}
    <div
      bind:this={cardEls[i]}
      class="sticky mb-4"
      style="top: {STICKY_TOP + i * STICKY_STEP}px; z-index: {10 + i};"
    >
      <div
        style="transform: scale({scale}) translateY({translateY}px); transform-origin: top center; transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); will-change: transform;"
      >
        <div class="group relative bg-[#faf9f7] rounded-2xl border border-black/[0.07] overflow-hidden cursor-pointer">

          <!-- Mobile: image top -->
          {#if agent.img}
            <div class="relative w-full h-52 pointer-events-none md:hidden">
              <img
                src={agent.img}
                alt={agent.label}
                class="absolute inset-0 w-full h-full object-cover object-center"
                style="mask-image: linear-gradient(to bottom, black 0%, black 35%, transparent 85%); -webkit-mask-image: linear-gradient(to bottom, black 0%, black 35%, transparent 85%);"
              />
            </div>
          {/if}

          <!-- Desktop: image right -->
          {#if agent.img}
            <div class="hidden md:block absolute inset-y-0 right-0 w-1/2 pointer-events-none">
              <img src={agent.img} alt={agent.label} class="w-full h-full object-cover object-center" />
              <div class="absolute inset-0" style="background: linear-gradient(to right, #faf9f7 0%, transparent 55%);"></div>
            </div>
          {/if}

          <!-- Text content -->
          <div class="relative z-10 p-8">
            <div class="md:max-w-[60%]">
              <div class="flex items-start justify-between mb-6">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] tracking-widest text-black/40 bg-black/[0.04]">{agent.label}</span>
              </div>
              <h3 class="text-xl font-light mb-3">{agent.title}</h3>
              <p class="text-sm text-black/45 leading-relaxed mb-8">{agent.desc}</p>
            </div>
            <div class="flex gap-8 pt-6 border-t border-black/[0.06]">
              {#each agent.stats as s}
                <div>
                  <div class="text-2xl font-light">{s.v}</div>
                  <div class="text-[11px] text-black/35 tracking-widest mt-0.5">{s.l}</div>
                </div>
              {/each}
            </div>
          </div>

        </div>
      </div>
    </div>
  {/each}
</div>
