<script lang="ts">
  import { onMount } from 'svelte';

  type TagName = 'h1' | 'h2' | 'h3' | 'p' | 'span';

  let {
    text,
    class: className = '',
    as: tag = 'h2' as TagName,
    stagger = 80,
    duration = 700,
    delay = 0,
    threshold = 0.2,
  }: {
    text: string;
    class?: string;
    as?: TagName;
    stagger?: number;
    duration?: number;
    delay?: number;
    threshold?: number;
  } = $props();

  let el: HTMLElement | null = $state(null);
  let visible = $state(false);

  onMount(() => {
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { visible = true; obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  });

  type WordEntry = { word: string; index: number; isBr: boolean };

  const words = $derived((() => {
    const parts = text.split(/(\n)/g);
    const result: WordEntry[] = [];
    let wordIndex = 0;
    for (const part of parts) {
      if (part === '\n') {
        result.push({ word: '\n', index: wordIndex++, isBr: true });
      } else {
        const ws = part.split(' ');
        ws.forEach((w, i, arr) => {
          if (w) result.push({ word: i < arr.length - 1 ? w + '\u00A0' : w, index: wordIndex++, isBr: false });
        });
      }
    }
    return result;
  })());

  function spanStyle(index: number): string {
    const wordDelay = delay + index * stagger;
    return `display: inline-block; opacity: ${visible ? 1 : 0}; filter: ${visible ? 'blur(0px)' : 'blur(8px)'}; transform: ${visible ? 'translateY(0)' : 'translateY(12px)'}; transition: ${visible ? `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${wordDelay}ms, filter ${duration}ms cubic-bezier(0.16,1,0.3,1) ${wordDelay}ms, transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${wordDelay}ms` : 'none'};`;
  }
</script>

<svelte:element this={tag} bind:this={el} class={className} style="display: block; overflow: visible;">
  {#each words as { word, index, isBr }}
    {#if isBr}
      <br />
    {:else}
      <span style={spanStyle(index)}>{word}</span>
    {/if}
  {/each}
</svelte:element>
