<script lang="ts">
  const NAV_LINKS = [
    { label: 'Platform',     href: '#platform' },
    { label: 'Agents',       href: '#agents' },
    { label: 'Workflow',     href: '#workflow' },
    { label: 'Integrations', href: '#integrations' },
    { label: 'Pricing',      href: '#pricing' },
  ];

  let open = $state(false);

  const navStyle = 'backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); background: rgba(245,244,240,0.30); box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06);';

  function close() { open = false; }
</script>

<div class="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
  <div class="pointer-events-auto w-full max-w-3xl">

    <!-- Main bar -->
    <nav
      class="flex items-center justify-between px-5 py-3 rounded-2xl border border-black/[0.06]"
      style={navStyle}
    >
      <span class="font-mono text-xs tracking-[0.25em] text-black/70">AGENTIC</span>

      <!-- Desktop links -->
      <div class="hidden md:flex items-center gap-7">
        {#each NAV_LINKS as l}
          <a href={l.href} class="text-[11px] text-black/60 hover:text-black transition-colors duration-200 tracking-wide">{l.label}</a>
        {/each}
      </div>

      <div class="flex items-center gap-2">
        <button class="text-[11px] px-4 py-2 rounded-xl border border-black/10 text-black/60 hover:text-black hover:border-black/20 hover:bg-black/[0.03] transition-all duration-200 tracking-wide hidden md:block">
          START BUILDING
        </button>

        <!-- Burger — mobile only -->
        <button
          onclick={() => (open = !open)}
          class="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] rounded-lg hover:bg-black/[0.04] transition-colors"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span class="block h-px bg-black/60 transition-all duration-300 origin-center" style="width: 18px; transform: {open ? 'translateY(6px) rotate(45deg)' : 'none'}"></span>
          <span class="block h-px bg-black/60 transition-all duration-300" style="width: 18px; opacity: {open ? 0 : 1}; transform: {open ? 'scaleX(0)' : 'none'}"></span>
          <span class="block h-px bg-black/60 transition-all duration-300 origin-center" style="width: 18px; transform: {open ? 'translateY(-6px) rotate(-45deg)' : 'none'}"></span>
        </button>
      </div>
    </nav>

    <!-- Mobile dropdown -->
    <div
      class="md:hidden mt-2 overflow-hidden transition-all duration-300 ease-in-out"
      style="max-height: {open ? '320px' : '0px'}; opacity: {open ? 1 : 0};"
    >
      <div class="rounded-2xl border border-black/[0.06] px-2 py-2 flex flex-col" style={navStyle}>
        {#each NAV_LINKS as l}
          <a
            href={l.href}
            onclick={close}
            class="px-4 py-3 text-sm text-black/60 hover:text-black hover:bg-black/[0.03] rounded-xl transition-colors tracking-wide"
          >{l.label}</a>
        {/each}
        <div class="mt-1 px-2 pb-1">
          <button class="w-full text-[11px] px-4 py-2.5 rounded-xl border border-black/10 text-black/60 hover:text-black hover:border-black/20 hover:bg-black/[0.03] transition-all duration-200 tracking-wide">
            START BUILDING
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
