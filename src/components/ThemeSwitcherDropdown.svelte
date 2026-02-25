<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import {
    theme,
    mode,
    style,
    fraunces,
    schemas,
    uiStyles,
    frauncesPresets,
    initTheme,
    setSchema,
    setStyle,
    toggleMode,
    setFraunces,
  } from "../stores/themeStore";

  type Tab = "apariencia" | "tipografia";
  const tabs: Tab[] = ["apariencia", "tipografia"];
  let activeTab: Tab = "apariencia";
  let open = false;
  let wrapRef: HTMLDivElement;

  onMount(() => {
    initTheme();
    const handleOutside = (e: MouseEvent) => {
      if (open && wrapRef && !wrapRef.contains(e.target as Node)) open = false;
    };
    document.addEventListener("click", handleOutside);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") open = false;
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  });

  function toggle(e: MouseEvent) {
    e.stopPropagation();
    open = !open;
  }

  function applyPreset(p: (typeof frauncesPresets)[number]) {
    setFraunces(p.wonk, p.soft, p.opsz);
  }

  function onWonk(e: Event) {
    const v = parseFloat((e.target as HTMLInputElement).value);
    setFraunces(v, $fraunces.soft, $fraunces.opsz);
  }
  function onSoft(e: Event) {
    const v = parseFloat((e.target as HTMLInputElement).value);
    setFraunces($fraunces.wonk, v, $fraunces.opsz);
  }
  function onOpsz(e: Event) {
    const v = parseFloat((e.target as HTMLInputElement).value);
    setFraunces($fraunces.wonk, $fraunces.soft, v);
  }
</script>

<div class="relative inline-block text-left" bind:this={wrapRef}>
  <!-- Trigger -->
  <button
    on:click={toggle}
    class="flex items-center gap-2 px-3 py-1.5 bg-surface/50 border border-border-subtle hover:bg-surface hover:border-border transition-all duration-300 shadow-sm text-xs font-medium text-text-muted hover:text-text rounded-[var(--radius-md)] outline-none focus-visible:ring-1 focus-visible:ring-primary/20 backdrop-blur-sm group"
    aria-label="Abrir selector de tema"
    aria-expanded={open}
  >
    <div
      class="i-ph-paint-brush-duotone text-lg group-hover:rotate-12 transition-transform"
    ></div>
    <span class="hidden sm:inline">Tema</span>
  </button>

  {#if open}
    <div
      class="absolute right-0 mt-2 w-80 bg-surface border border-border origin-top-right z-[100] text-text shadow-xl rounded-[var(--radius-lg)] overflow-hidden"
      transition:fly={{ y: 8, duration: 200 }}
      role="dialog"
      aria-label="Opciones de apariencia"
    >
      <!-- Tab bar -->
      <div class="flex border-b border-border-subtle">
        {#each tabs as tab}
          <button
            class="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors
              {activeTab === tab
              ? 'text-primary border-b-2 border-primary -mb-px bg-bg-offset'
              : 'text-text-muted hover:text-text'}"
            on:click={() => (activeTab = tab)}
          >
            {tab === "apariencia" ? "Apariencia" : "Tipografía"}
          </button>
        {/each}
      </div>

      <!-- ── TAB: Apariencia ── -->
      {#if activeTab === "apariencia"}
        <div class="p-4 flex flex-col gap-5">
          <!-- Mode -->
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-bold uppercase tracking-widest text-text-muted"
              >Modo</span
            >
            <button
              on:click|preventDefault={toggleMode}
              class="flex items-center gap-2 px-2 py-1 rounded-[var(--radius-md)] hover:bg-bg-offset transition-colors text-xs font-medium text-text-muted hover:text-primary"
            >
              <span>{$mode === "light" ? "Claro" : "Oscuro"}</span>
              <div
                class="{$mode === 'light'
                  ? 'i-ph-sun-duotone'
                  : 'i-ph-moon-duotone'} text-sm"
              ></div>
            </button>
          </div>

          <!-- UI Style -->
          <div class="space-y-2">
            <span
              class="text-[10px] uppercase font-bold text-text-muted tracking-wide"
              >Estilo UI</span
            >
            <div class="grid grid-cols-4 gap-1">
              {#each uiStyles as s}
                <button
                  on:click|preventDefault={() => setStyle(s.id)}
                  class="flex flex-col items-center justify-center p-2 rounded-[var(--radius-md)] border border-transparent transition-all duration-200
                    {$style === s.id
                    ? 'bg-bg-offset border-border-subtle shadow-sm text-primary'
                    : 'hover:bg-bg-offset/50 text-text-muted hover:text-text'}"
                  title={s.label}
                >
                  <div class="{s.icon} text-lg mb-1"></div>
                  <span class="text-[10px] font-medium">{s.label}</span>
                </button>
              {/each}
            </div>
          </div>

          <!-- Theme collection — scrollable -->
          <div class="border-t border-border-subtle pt-4 space-y-2">
            <span
              class="text-[10px] uppercase font-bold text-text-muted tracking-wide block"
              >Colección</span
            >
            <div
              class="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1 scrollbar-thin"
            >
              {#each schemas as s}
                <button
                  on:click|preventDefault={() => setSchema(s.id)}
                  class="flex items-center gap-3 w-full p-2 rounded-[var(--radius-md)] transition-all duration-200 text-left group
                    {$theme === s.id
                    ? 'bg-bg-offset ring-1 ring-border shadow-sm'
                    : 'hover:bg-bg-offset/50'}"
                >
                  <div
                    class="flex shrink-0 -space-x-2"
                    data-theme={s.id}
                    data-mode={$mode}
                  >
                    <div
                      class="w-4 h-4 rounded-full border border-border-subtle z-30 bg-[var(--color-bg)]"
                    ></div>
                    <div
                      class="w-4 h-4 rounded-full border border-border-subtle z-20 bg-[var(--color-primary)]"
                    ></div>
                    <div
                      class="w-4 h-4 rounded-full border border-border-subtle z-10 bg-[var(--color-secondary)]"
                    ></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div
                      class="text-xs font-bold text-text group-hover:text-primary transition-colors flex items-center justify-between"
                    >
                      {s.label}
                      {#if $theme === s.id}<div
                          class="i-ph-check-bold text-secondary text-xs"
                        ></div>{/if}
                    </div>
                    <div class="text-[10px] text-text-muted truncate">
                      {s.description}
                    </div>
                  </div>
                </button>
              {/each}
            </div>
          </div>
        </div>

        <!-- ── TAB: Tipografía ── -->
      {:else}
        <div class="p-4 flex flex-col gap-5">
          <!-- Preview -->
          <div
            class="rounded-[var(--radius-md)] bg-bg-offset border border-border-subtle p-4 text-center"
          >
            <p
              class="font-display font-black text-2xl text-primary leading-tight"
            >
              Cristianamente
            </p>
            <p class="text-[10px] text-text-muted mt-1 font-mono">
              WONK {$fraunces.wonk} · SOFT {$fraunces.soft} · opsz {$fraunces.opsz}
            </p>
          </div>

          <!-- Presets -->
          <div class="space-y-2">
            <span
              class="text-[10px] uppercase font-bold text-text-muted tracking-wide"
              >Presets</span
            >
            <div class="grid grid-cols-2 gap-1.5">
              {#each frauncesPresets as p}
                <button
                  on:click={() => applyPreset(p)}
                  class="px-3 py-2 rounded-[var(--radius-md)] border text-xs font-bold transition-all
                    {$fraunces.wonk === p.wonk &&
                  $fraunces.soft === p.soft &&
                  $fraunces.opsz === p.opsz
                    ? 'bg-bg-offset border-border text-primary shadow-sm'
                    : 'border-border-subtle text-text-muted hover:bg-bg-offset/50 hover:text-text'}"
                >
                  <span
                    style="font-variation-settings: 'WONK' {p.wonk}, 'SOFT' {p.soft};"
                    >{p.label}</span
                  >
                </button>
              {/each}
            </div>
          </div>

          <!-- Sliders -->
          <div class="space-y-4">
            <span
              class="text-[10px] uppercase font-bold text-text-muted tracking-wide"
              >Ajuste fino</span
            >

            <!-- WONK -->
            <label class="block space-y-1.5">
              <div class="flex justify-between text-[10px]">
                <span class="font-bold text-text-muted uppercase tracking-wide"
                  >WONK</span
                >
                <span class="font-mono text-secondary"
                  >{$fraunces.wonk.toFixed(2)}</span
                >
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={$fraunces.wonk}
                on:input={onWonk}
                class="slider w-full"
              />
              <div class="flex justify-between text-[9px] text-text-muted/60">
                <span>Normal</span><span>Traviesa</span>
              </div>
            </label>

            <!-- SOFT -->
            <label class="block space-y-1.5">
              <div class="flex justify-between text-[10px]">
                <span class="font-bold text-text-muted uppercase tracking-wide"
                  >SOFT</span
                >
                <span class="font-mono text-secondary"
                  >{Math.round($fraunces.soft)}</span
                >
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={$fraunces.soft}
                on:input={onSoft}
                class="slider w-full"
              />
              <div class="flex justify-between text-[9px] text-text-muted/60">
                <span>Angular</span><span>Redonda</span>
              </div>
            </label>

            <!-- opsz -->
            <label class="block space-y-1.5">
              <div class="flex justify-between text-[10px]">
                <span class="font-bold text-text-muted uppercase tracking-wide"
                  >Tamaño óptico</span
                >
                <span class="font-mono text-secondary"
                  >{Math.round($fraunces.opsz)}</span
                >
              </div>
              <input
                type="range"
                min="12"
                max="144"
                step="1"
                value={$fraunces.opsz}
                on:input={onOpsz}
                class="slider w-full"
              />
              <div class="flex justify-between text-[9px] text-text-muted/60">
                <span>Compacta</span><span>Display</span>
              </div>
            </label>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: var(--color-border, #ccc) transparent;
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: var(--color-border, #ccc);
    border-radius: 2px;
  }

  /* Range slider */
  .slider {
    appearance: none;
    -webkit-appearance: none;
    height: 4px;
    border-radius: 2px;
    background: var(--color-border, #e0ddd8);
    outline: none;
    cursor: pointer;
    accent-color: var(--color-secondary, #b08d57);
  }
  .slider::-webkit-slider-thumb {
    appearance: none;
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-secondary, #b08d57);
    border: 2px solid var(--color-surface, white);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: transform 0.15s;
  }
  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }
  .slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-secondary, #b08d57);
    border: 2px solid var(--color-surface, white);
    cursor: pointer;
  }
</style>
