<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  let {
    class: className = '',
    delay = 0,
    children,
  }: {
    class?: string;
    delay?: number;
    children: Snippet;
  } = $props();

  let el: HTMLDivElement | null = $state(null);
  let inView = $state(false);
  let mouseX = $state('50%');
  let mouseY = $state('50%');

  onMount(() => {
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) inView = true; },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  });

  function handleMouseMove(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    mouseX = `${e.clientX - rect.left}px`;
    mouseY = `${e.clientY - rect.top}px`;
  }
</script>

<div
  bind:this={el}
  role="presentation"
  class="group relative rounded-2xl border border-black/[0.07] bg-white overflow-hidden hover:border-black/[0.15] hover:bg-[#fafaf8] {className}"
  style="opacity: {inView ? 1 : 0}; transform: translateY({inView ? 0 : 28}px); transition: opacity 0.7s ease {delay}ms, transform 0.7s ease {delay}ms, border-color 0.3s ease, background-color 0.3s ease;"
  onmousemove={handleMouseMove}
>
  <!-- Hover glow spot -->
  <div
    class="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
    style="background: radial-gradient(400px circle at {mouseX} {mouseY}, rgba(0,0,0,0.03), transparent 60%);"
  ></div>
  {@render children()}
</div>
