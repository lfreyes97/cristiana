<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import {
    theme,
    mode,
    style,
    schemas,
    uiStyles,
    initTheme,
    setSchema,
    setStyle,
    toggleMode,
  } from "../stores/themeStore";

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
      class="absolute right-0 mt-2 w-72 p-4 bg-surface border border-border origin-top-right z-[100] text-text shadow-xl rounded-[var(--radius-lg)] flex flex-col gap-5"
      transition:fly={{ y: 8, duration: 200 }}
      role="dialog"
      aria-label="Opciones de apariencia"
    >
      <!-- Header / Mode Toggle -->
      <div class="flex items-center justify-between">
        <span
          class="text-xs font-bold uppercase tracking-widest text-text-muted"
          >Apariencia</span
        >
        <button
          on:click|preventDefault={toggleMode}
          class="flex items-center gap-2 px-2 py-1 rounded-[var(--radius-md)] hover:bg-bg-offset transition-colors text-xs font-medium text-text-muted hover:text-primary"
          aria-label="Alternar modo oscuro"
        >
          <span>{$mode === "light" ? "Claro" : "Oscuro"}</span>
          {#if $mode === "light"}
            <div class="i-ph-sun-duotone text-sm"></div>
          {:else}
            <div class="i-ph-moon-duotone text-sm"></div>
          {/if}
        </button>
      </div>

      <!-- UI Style grid -->
      <div class="space-y-2">
        <span
          class="text-[10px] uppercase font-bold text-text-muted tracking-wide"
          >Estilo UI</span
        >
        <div class="grid grid-cols-4 gap-1">
          {#each uiStyles as s}
            <button
              on:click|preventDefault={() => setStyle(s.id)}
              class="flex flex-col items-center justify-center p-2 rounded-[var(--radius-md)] border border-transparent transition-all duration-200 {$style ===
              s.id
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

      <!-- Theme list — scrollable -->
      <div class="border-t border-border-subtle pt-4 space-y-2">
        <span
          class="text-[10px] uppercase font-bold text-text-muted tracking-wide block"
          >Colección</span
        >
        <div
          class="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin"
        >
          {#each schemas as s}
            <button
              on:click|preventDefault={() => setSchema(s.id)}
              class="flex items-center gap-3 w-full p-2 rounded-[var(--radius-md)] transition-all duration-200 text-left group {$theme ===
              s.id
                ? 'bg-bg-offset ring-1 ring-border shadow-sm'
                : 'hover:bg-bg-offset/50'}"
              aria-label="Aplicar tema {s.label}"
            >
              <!-- Color swatches -->
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
              <!-- Meta -->
              <div class="flex-1 min-w-0">
                <div
                  class="text-xs font-bold text-text group-hover:text-primary transition-colors flex items-center justify-between"
                >
                  {s.label}
                  {#if $theme === s.id}
                    <div class="i-ph-check-bold text-secondary text-xs"></div>
                  {/if}
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
  {/if}
</div>

<style>
  /* Thin scrollbar for the theme list */
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
</style>
