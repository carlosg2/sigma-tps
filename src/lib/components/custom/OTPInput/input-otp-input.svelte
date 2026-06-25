<script lang="ts">
  import { focusedIndex, otpArray } from './input-otp-store.js';
  import type { inputProps } from './types.js';

  type $$Props = inputProps;

  export let index: $$Props['index'];
  export let className: $$Props['className'] = '';
  export let focusClassName: $$Props['focusClassName'] = '';

  let value = '';
  let isFocused = false;

  otpArray.subscribe((array) => {
    value = array[index] || '';
  });

  focusedIndex.subscribe((focusIndex) => {
    isFocused = focusIndex === index;
  });
</script>

<div class={`relative ${className} ${isFocused ? focusClassName : ''}`} tabindex="-1">
  {#if value}
    •
  {:else if isFocused}
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div class="h-6 w-0.5 bg-current animate-caret-blink"></div>
    </div>
  {/if}
</div>
