<script lang="ts">
  import { onMount } from "svelte";
  import { fly, fade } from "svelte/transition";
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
    <!-- Drawer header -->
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

    <!-- Scrollable body -->
    <div class="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
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
          aria-label="Alternar modo oscuro"
        >
          {#if $mode === "light"}
            <div class="i-ph-sun-duotone text-base"></div>
            <span>Claro</span>
          {:else}
            <div class="i-ph-moon-duotone text-base"></div>
            <span>Oscuro</span>
          {/if}
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
              class="flex flex-col items-center justify-center p-2.5 rounded-[var(--radius-md)] border transition-all duration-200 {$style ===
              s.id
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

      <!-- Divider -->
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
              class="flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius-md)] transition-all duration-200 text-left group {$theme ===
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
                  class="w-5 h-5 rounded-full border-2 border-surface z-30 bg-[var(--color-bg)]"
                ></div>
                <div
                  class="w-5 h-5 rounded-full border-2 border-surface z-20 bg-[var(--color-primary)]"
                ></div>
                <div
                  class="w-5 h-5 rounded-full border-2 border-surface z-10 bg-[var(--color-secondary)]"
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

    <!-- Drawer footer -->
    <div class="shrink-0 px-5 py-4 border-t border-border-subtle">
      <p
        class="text-[10px] text-text-muted text-center font-mono uppercase tracking-widest"
      >
        {$theme} · {$mode} · {$style}
      </p>
    </div>
  </div>
{/if}
