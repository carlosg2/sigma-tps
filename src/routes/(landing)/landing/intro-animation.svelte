<script module lang="ts">
  const LETTER_IN_STAGGER = 90;
  const LETTER_IN_DUR = 700;
  const HOLD_DURATION = 300;
  const N_LETTERS = 7; // "AGENTIC"
  const LETTERS_IN_TOTAL = LETTER_IN_STAGGER * (N_LETTERS - 1) + LETTER_IN_DUR + HOLD_DURATION;
  const LETTER_OUT_STAGGER = 55;
  const LETTER_OUT_DUR = 450;
  const CURTAIN_DELAY = LETTERS_IN_TOTAL + 100;
  const CURTAIN_DURATION = 1300;
  const ANIM_TOTAL = CURTAIN_DELAY + (LETTER_OUT_STAGGER * (N_LETTERS - 1) + LETTER_OUT_DUR) + 1400;

  export const INTRO_DURATION_MS = CURTAIN_DELAY + CURTAIN_DURATION;
  export const HERO_REVEAL_MS = CURTAIN_DELAY + CURTAIN_DURATION - 150;
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  const LETTERS = ['A', 'G', 'E', 'N', 'T', 'I', 'C'];
  type Phase = 'idle' | 'in' | 'out' | 'done';

  let { onDone }: { onDone: () => void } = $props();

  let phase = $state<Phase>('idle');
  let curtainUp = $state(false);

  onMount(() => {
    const t0 = setTimeout(() => (phase = 'in'), 80);
    const t1 = setTimeout(() => (phase = 'out'), LETTERS_IN_TOTAL);
    const t2 = setTimeout(() => (curtainUp = true), CURTAIN_DELAY);
    const t3 = setTimeout(() => onDone(), HERO_REVEAL_MS);
    const t4 = setTimeout(() => (phase = 'done'), ANIM_TOTAL);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  });

  function letterStyle(i: number): string {
    const inDelay = i * LETTER_IN_STAGGER;
    const outDelay = i * LETTER_OUT_STAGGER;
    const isIn = phase === 'in';
    const isOut = phase === 'out';
    const opacity = phase === 'idle' ? 0 : isIn ? 1 : 0;
    const blur = phase === 'idle' ? 36 : isIn ? 0 : 24;
    const ty = phase === 'idle' ? 48 : isIn ? 0 : -20;
    const transition = isOut
      ? `opacity ${LETTER_OUT_DUR}ms cubic-bezier(0.4,0,1,1) ${outDelay}ms, filter ${LETTER_OUT_DUR}ms cubic-bezier(0.4,0,1,1) ${outDelay}ms, transform ${LETTER_OUT_DUR}ms cubic-bezier(0.4,0,1,1) ${outDelay}ms`
      : isIn
      ? `opacity ${LETTER_IN_DUR}ms cubic-bezier(0.16,1,0.3,1) ${inDelay}ms, filter ${LETTER_IN_DUR}ms cubic-bezier(0.16,1,0.3,1) ${inDelay}ms, transform ${LETTER_IN_DUR}ms cubic-bezier(0.16,1,0.3,1) ${inDelay}ms`
      : 'none';
    return `font-size: calc((100vw - 64px) / ${LETTERS.length}); font-family: 'IBM Plex Sans Variable', sans-serif; letter-spacing: 0.05em; opacity: ${opacity}; filter: blur(${blur}px); transform: translateY(${ty}px); transition: ${transition}; will-change: opacity, filter, transform;`;
  }
</script>

{#if phase !== 'done'}
  <div class="fixed inset-0 z-[100] pointer-events-none" aria-hidden="true">
    <!-- Gradient curtain — retracts upward -->
    <div
      class="absolute inset-x-0 top-0"
      style="bottom: {curtainUp ? '100%' : '0%'}; transition: {curtainUp ? 'bottom 1.3s cubic-bezier(0.76, 0, 0.24, 1)' : 'none'}; background: #f5f4f1;"
    ></div>

    <!-- AGENTIC letters -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="flex" style="gap: 0.06em">
        {#each LETTERS as letter, i}
          <span class="font-bold text-[#111] leading-none select-none" style={letterStyle(i)}>{letter}</span>
        {/each}
      </div>
    </div>
  </div>
{/if}
