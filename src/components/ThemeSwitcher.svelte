<script>
  import { onMount } from "svelte";
  import { DropdownMenu } from "bits-ui";
  import { fly } from "svelte/transition";

  let theme = "paper";
  let mode = "light";
  let style = "modern";
  let styles = ["modern", "brutal", "glass", "pop"];
  const schemas = [
    {
      id: "paper",
      label: "Paper",
      description: "Editorial y cálido",
    },
    {
      id: "midnight",
      label: "Midnight",
      description: "Oscuro y sofisticado",
    },
    {
      id: "tokyo-night",
      label: "Tokyo",
      description: "Digital y vibrante",
    },
    {
      id: "gruvbox",
      label: "Gruvbox",
      description: "Retro y nostálgico",
    },
    {
      id: "nord",
      label: "Nord",
      description: "Fresco y polar",
    },
    {
      id: "pastel",
      label: "Pastel",
      description: "Suave y onírico",
    },
    {
      id: "earth",
      label: "Tierras",
      description: "Natural y cálido",
    },
    {
      id: "neutral",
      label: "Neutral",
      description: "Tailwind monocromo",
    },
  ];

  const uiStyles = [
    { id: "modern", label: "Moderno", icon: "i-ph-circle" },
    { id: "brutal", label: "Brutal", icon: "i-ph-square" },
    { id: "glass", label: "Glass", icon: "i-ph-drop" },
    { id: "pop", label: "Pop", icon: "i-ph-star-four" },
  ];

  onMount(() => {
    theme = localStorage.getItem("theme") || "paper";
    mode = localStorage.getItem("mode") || "light";
    style = localStorage.getItem("style") || "modern";
    updateDOM();
  });

  function updateDOM() {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.mode = mode;
    document.documentElement.dataset.style = style;

    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function setSchema(newTheme) {
    theme = newTheme;
    localStorage.setItem("theme", theme);
    updateDOM();
  }

  function setStyle(newStyle) {
    style = newStyle;
    localStorage.setItem("style", style);
    updateDOM();
  }

  function toggleMode() {
    mode = mode === "light" ? "dark" : "light";
    localStorage.setItem("mode", mode);
    updateDOM();
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class="flex items-center gap-2 px-3 py-1.5 bg-surface/50 border border-border-subtle hover:bg-surface hover:border-border transition-all duration-300 shadow-sm text-xs font-medium text-text-muted hover:text-text rounded-[var(--radius-md)] outline-none focus-visible:ring-1 focus-visible:ring-primary/20 backdrop-blur-sm group"
    aria-label="Toggle theme settings"
  >
    <div
      class="i-ph-paint-brush-duotone text-lg group-hover:rotate-12 transition-transform"
    ></div>
    <span class="hidden sm:inline">Tema</span>
  </DropdownMenu.Trigger>

  <DropdownMenu.Content
    class="w-72 p-4 bg-surface border border-border transition-all duration-300 origin-top-right z-[100] text-text shadow-xl rounded-[var(--radius-lg)]"
    transition={fly}
    transitionConfig={{ y: 8, duration: 200 }}
    sideOffset={8}
    align="end"
  >
    <div class="flex flex-col gap-5">
      <!-- Header / Mode Toggle -->
      <div class="flex items-center justify-between">
        <span
          class="text-xs font-bold uppercase tracking-widest text-text-muted"
          >Apariencia</span
        >
        <button
          on:click|preventDefault={toggleMode}
          class="flex items-center gap-2 px-2 py-1 rounded-[var(--radius-md)] hover:bg-bg-offset transition-colors text-xs font-medium text-text-muted hover:text-primary"
          aria-label="Toggle dark mode"
        >
          <span>{mode === "light" ? "Claro" : "Oscuro"}</span>
          {#if mode === "light"}
            <div class="i-ph-sun-duotone text-sm"></div>
          {:else}
            <div class="i-ph-moon-duotone text-sm"></div>
          {/if}
        </button>
      </div>

      <!-- Style Select -->
      <div class="space-y-2">
        <span
          class="text-[10px] uppercase font-bold text-text-muted tracking-wide"
          >Estilo UI</span
        >
        <div class="grid grid-cols-4 gap-1">
          {#each uiStyles as s}
            <button
              on:click|preventDefault={() => setStyle(s.id)}
              class="flex flex-col items-center justify-center p-2 rounded-[var(--radius-md)] border border-transparent transition-all duration-200 {style ===
              s.id
                ? 'bg-bg-offset border-border-subtle shadow-sm text-primary'
                : 'hover:bg-bg-offset/50 text-text-muted hover:text-text'}"
              title={s.label}
            >
              <div class={s.icon + " text-lg mb-1"}></div>
              <span class="text-[10px] font-medium">{s.label}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Theme List -->
      <div class="pt-4 border-t border-border-subtle">
        <span
          class="text-[10px] uppercase font-bold text-text-muted tracking-wide block mb-3"
          >Colección</span
        >
        <div class="flex flex-col gap-1">
          {#each schemas as s}
            <button
              on:click|preventDefault={() => setSchema(s.id)}
              class="flex items-center gap-3 w-full p-2 rounded-[var(--radius-md)] transition-all duration-200 text-left group {theme ===
              s.id
                ? 'bg-bg-offset ring-1 ring-border shadow-sm'
                : 'hover:bg-bg-offset/50'}"
              aria-label="Set {s.label} theme"
            >
              <!-- Color Preview -->
              <div
                class="flex shrink-0 -space-x-2"
                data-theme={s.id}
                data-mode={mode}
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

              <!-- Text Info -->
              <div class="flex-1 min-w-0">
                <div
                  class="text-xs font-bold text-text group-hover:text-primary transition-colors flex items-center justify-between"
                >
                  {s.label}
                  {#if theme === s.id}
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
  </DropdownMenu.Content>
</DropdownMenu.Root>
