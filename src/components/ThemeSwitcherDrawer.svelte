<script lang="ts">
  import { onMount } from "svelte";
  import { fly, fade } from "svelte/transition";
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

  onMount(() => {
    initTheme();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") open = false;
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
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

<!-- Trigger -->
<button
  on:click={toggle}
  class="flex items-center gap-2 px-3 py-1.5 bg-surface/50 border border-border-subtle hover:bg-surface hover:border-border transition-all duration-300 shadow-sm text-xs font-medium text-text-muted hover:text-text rounded-[var(--radius-md)] outline-none focus-visible:ring-1 focus-visible:ring-primary/20 backdrop-blur-sm group"
  aria-label="Abrir panel de tema"
  aria-expanded={open}
>
  <div
    class="i-ph-paint-brush-duotone text-lg group-hover:rotate-12 transition-transform"
  ></div>
  <span class="hidden sm:inline">Tema</span>
</button>

{#if open}
  <!-- Overlay -->
  <div
    class="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
    on:click={() => (open = false)}
    role="presentation"
  ></div>

  <!-- Drawer panel -->
  <div
    class="fixed top-0 right-0 h-full w-80 max-w-[90vw] z-[201] bg-surface border-l border-border shadow-2xl flex flex-col"
    transition:fly={{ x: 320, duration: 280, opacity: 1 }}
    role="dialog"
    aria-label="Panel de apariencia"
    aria-modal="true"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-5 py-4 border-b border-border-subtle shrink-0"
    >
      <span class="text-xs font-bold uppercase tracking-widest text-text-muted"
        >Apariencia</span
      >
      <button
        on:click={() => (open = false)}
        class="w-7 h-7 flex items-center justify-center rounded-[var(--radius-md)] hover:bg-bg-offset transition-colors text-text-muted hover:text-text"
        aria-label="Cerrar panel"
      >
        <div class="i-ph-x text-base"></div>
      </button>
    </div>

    <!-- Tab bar -->
    <div class="flex border-b border-border-subtle shrink-0">
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

    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto px-5 py-5">
      <!-- ── TAB: Apariencia ── -->
      {#if activeTab === "apariencia"}
        <div class="flex flex-col gap-6">
          <!-- Mode toggle -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-text">Modo</p>
              <p class="text-[10px] text-text-muted mt-0.5">
                {$mode === "light" ? "Tema claro" : "Tema oscuro"}
              </p>
            </div>
            <button
              on:click|preventDefault={toggleMode}
              class="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] border border-border hover:border-secondary hover:text-secondary bg-bg-offset transition-all text-xs font-medium text-text-muted"
            >
              <div
                class="{$mode === 'light'
                  ? 'i-ph-sun-duotone'
                  : 'i-ph-moon-duotone'} text-base"
              ></div>
              <span>{$mode === "light" ? "Claro" : "Oscuro"}</span>
            </button>
          </div>

          <!-- UI Style -->
          <div class="space-y-3">
            <p
              class="text-[10px] uppercase font-bold text-text-muted tracking-wide"
            >
              Estilo UI
            </p>
            <div class="grid grid-cols-4 gap-1.5">
              {#each uiStyles as s}
                <button
                  on:click|preventDefault={() => setStyle(s.id)}
                  class="flex flex-col items-center justify-center p-2.5 rounded-[var(--radius-md)] border transition-all duration-200
                    {$style === s.id
                    ? 'bg-bg-offset border-border shadow-sm text-primary'
                    : 'border-transparent hover:bg-bg-offset/60 text-text-muted hover:text-text'}"
                  title={s.label}
                >
                  <div class="{s.icon} text-xl mb-1"></div>
                  <span class="text-[10px] font-medium">{s.label}</span>
                </button>
              {/each}
            </div>
          </div>

          <div class="h-px bg-border-subtle"></div>

          <!-- Theme collection -->
          <div class="space-y-2">
            <p
              class="text-[10px] uppercase font-bold text-text-muted tracking-wide"
            >
              Colección
            </p>
            <div class="flex flex-col gap-1">
              {#each schemas as s}
                <button
                  on:click|preventDefault={() => setSchema(s.id)}
                  class="flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius-md)] transition-all duration-200 text-left group
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
                      class="w-5 h-5 rounded-full border-2 border-surface z-30 bg-[var(--color-bg)]"
                    ></div>
                    <div
                      class="w-5 h-5 rounded-full border-2 border-surface z-20 bg-[var(--color-primary)]"
                    ></div>
                    <div
                      class="w-5 h-5 rounded-full border-2 border-surface z-10 bg-[var(--color-secondary)]"
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
        <div class="flex flex-col gap-6">
          <!-- Live preview -->
          <div
            class="rounded-[var(--radius-md)] bg-bg-offset border border-border-subtle p-5 text-center"
          >
            <p
              class="font-display font-black text-3xl text-primary leading-tight"
            >
              Cristianamente
            </p>
            <p class="text-[10px] text-text-muted mt-2 font-mono">
              WONK {$fraunces.wonk.toFixed(2)} · SOFT {Math.round(
                $fraunces.soft,
              )} · opsz {Math.round($fraunces.opsz)}
            </p>
          </div>

          <!-- Presets -->
          <div class="space-y-3">
            <p
              class="text-[10px] uppercase font-bold text-text-muted tracking-wide"
            >
              Presets
            </p>
            <div class="grid grid-cols-2 gap-2">
              {#each frauncesPresets as p}
                <button
                  on:click={() => applyPreset(p)}
                  class="px-3 py-3 rounded-[var(--radius-md)] border text-sm font-bold transition-all text-left
                    {$fraunces.wonk === p.wonk &&
                  $fraunces.soft === p.soft &&
                  $fraunces.opsz === p.opsz
                    ? 'bg-bg-offset border-border text-primary shadow-sm'
                    : 'border-border-subtle text-text-muted hover:bg-bg-offset/50 hover:text-text'}"
                >
                  <span
                    style="font-family: 'Fraunces Variable', serif; font-variation-settings: 'WONK' {p.wonk}, 'SOFT' {p.soft};"
                  >
                    {p.label}
                  </span>
                  <p class="text-[9px] font-mono font-normal mt-0.5 opacity-60">
                    W:{p.wonk} S:{p.soft} O:{p.opsz}
                  </p>
                </button>
              {/each}
            </div>
          </div>

          <div class="h-px bg-border-subtle"></div>

          <!-- Fine-tune sliders -->
          <div class="space-y-5">
            <p
              class="text-[10px] uppercase font-bold text-text-muted tracking-wide"
            >
              Ajuste fino
            </p>

            <!-- WONK -->
            <label class="block space-y-2">
              <div class="flex justify-between items-baseline">
                <span class="text-xs font-bold text-text">WONK</span>
                <span class="text-xs font-mono text-secondary"
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
                <span>Normal</span><span>Traviesa ✦</span>
              </div>
            </label>

            <!-- SOFT -->
            <label class="block space-y-2">
              <div class="flex justify-between items-baseline">
                <span class="text-xs font-bold text-text">SOFT</span>
                <span class="text-xs font-mono text-secondary"
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
            <label class="block space-y-2">
              <div class="flex justify-between items-baseline">
                <span class="text-xs font-bold text-text">Tamaño óptico</span>
                <span class="text-xs font-mono text-secondary"
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
                <span>Compacta (12)</span><span>Display (144)</span>
              </div>
            </label>
          </div>
        </div>
      {/if}
    </div>

    <!-- Footer with current state -->
    <div class="shrink-0 px-5 py-4 border-t border-border-subtle">
      <p
        class="text-[10px] text-text-muted text-center font-mono uppercase tracking-widest"
      >
        {$theme} · {$mode} · {$style}
      </p>
    </div>
  </div>
{/if}

<style>
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
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-secondary, #b08d57);
    border: 2px solid var(--color-surface, white);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: transform 0.15s;
  }
  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }
  .slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-secondary, #b08d57);
    border: 2px solid var(--color-surface, white);
    cursor: pointer;
  }
</style>
