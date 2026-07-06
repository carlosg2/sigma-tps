<script lang="ts">
  import { onMount } from 'svelte';

  let count = $state(3847);

  onMount(() => {
    const t = setInterval(() => {
      count = count + Math.floor(Math.random() * 3 - 1);
    }, 1200);
    return () => clearInterval(t);
  });
</script>

<span style="font-family: monospace; font-size: clamp(3rem, 6vw, 5rem); font-weight: 300; color: rgba(0,0,0,0.85); line-height: 1; letter-spacing: -0.02em; transition: color 0.3s ease;">
  {count.toLocaleString('en-US')}
</span>
