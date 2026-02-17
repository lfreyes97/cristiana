<script lang="ts">
  import { onMount } from "svelte";
  import ThemeSwitcher from "./ThemeSwitcher.svelte";

  export let title: string;
  export let headings: { depth: number; slug: string; text: string }[] = [];

  let scrollY = 0;
  let progress = 0;
  let tocOpen = false;

  const threshold = 200; // Show reading bar after this many pixels

  onMount(() => {
    const updateProgress = () => {
      scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      progress = (scrollY / docHeight) * 100;
    };

    window.addEventListener("scroll", updateProgress);
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  });

  $: isReadingMode = scrollY > threshold;

  function toggleToc() {
    tocOpen = !tocOpen;
  }
</script>

<!-- INITIAL HEADER (Scrolls away) -->
<header
  class="relative w-full py-12 px-6 bg-[var(--color-bg)] flex flex-col gap-8 mb-8 border-b border-transparent"
>
  <!-- Top Row: Socials - Branding - Tools -->
  <div
    class="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-4"
  >
    <!-- Socials (Left) -->
    <div class="hidden md:flex gap-4 text-[var(--color-text)] opacity-60">
      <div
        class="i-ph-instagram-logo text-xl hover:text-[var(--color-primary)] transition-colors cursor-pointer"
      ></div>
      <div
        class="i-ph-twitter-logo text-xl hover:text-[var(--color-primary)] transition-colors cursor-pointer"
      ></div>
      <div
        class="i-ph-pinterest-logo text-xl hover:text-[var(--color-primary)] transition-colors cursor-pointer"
      ></div>
    </div>

    <!-- Centers Logo -->
    <div class="text-center">
      <a
        href="/"
        class="text-4xl md:text-5xl font-serif font-black tracking-tighter text-[var(--color-primary)]"
      >
        Cristianamente.
      </a>
    </div>

    <!-- Tools (Right) -->
    <div class="flex justify-center md:justify-end items-center gap-4">
      <div
        class="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[var(--color-text)] opacity-60"
      >
        <div class="i-ph-magnifying-glass text-lg"></div>
        <span class="hidden lg:inline">Buscar</span>
      </div>
      <ThemeSwitcher />
    </div>
  </div>

  <!-- Bottom Row: Floating Pill Nav -->
  <nav
    class="
        mx-auto w-full md:w-auto overflow-x-auto
        px-8 py-4
        bg-[var(--color-surface)]
        border-[length:var(--border-width)] border-[var(--color-border)]
        rounded-[var(--radius-pill)]
        shadow-[var(--shadow-md)]
        flex items-center gap-8 justify-center
    "
  >
    <a
      href="/"
      class="text-sm font-black uppercase tracking-widest text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap"
      >Home</a
    >
    <div class="w-1.5 h-1.5 bg-[var(--color-border)] rotate-45"></div>
    <a
      href="/blog"
      class="text-sm font-black uppercase tracking-widest text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap"
      >Ensayos</a
    >
    <div class="w-1.5 h-1.5 bg-[var(--color-border)] rotate-45"></div>
    <a
      href="/blog"
      class="text-sm font-black uppercase tracking-widest text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap"
      >Notas</a
    >
    <div class="w-1.5 h-1.5 bg-[var(--color-border)] rotate-45"></div>
    <a
      href="/about"
      class="text-sm font-black uppercase tracking-widest text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap"
      >Acerca</a
    >
  </nav>
</header>

<!-- STICKY READING BAR (Slides in) -->
<div
  class="fixed top-0 left-0 w-full z-50 bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-[var(--color-border)] transition-all duration-500 ease-out shadow-sm transform"
  class:translate-y-0={isReadingMode}
  class:-translate-y-full={!isReadingMode}
  class:opacity-0={!isReadingMode}
  class:invisible={!isReadingMode}
>
  <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
    <!-- Left Side: Title -->
    <div class="flex items-center gap-4 flex-1 min-w-0">
      <div class="flex items-center gap-3 overflow-hidden">
        <span
          class="hidden md:inline-flex text-[10px] uppercase font-bold tracking-widest text-[var(--color-secondary)] whitespace-nowrap"
        >
          Now Reading:
        </span>
        <span
          class="text-sm font-serif font-bold text-[var(--color-primary)] truncate"
        >
          {title}
        </span>
      </div>
    </div>

    <!-- Right Side: Interaction -->
    <div class="flex items-center gap-4 shrink-0">
      <!-- TOC Button -->
      {#if headings.length > 0}
        <div class="relative">
          <button
            on:click={toggleToc}
            class="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-pill)] bg-[var(--color-bg-offset)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors text-xs font-bold uppercase tracking-wider text-[var(--color-text)]"
          >
            <div class="i-ph-list-bullets text-lg"></div>
            <span class="hidden md:inline">Índice</span>
          </button>

          {#if tocOpen}
            <!-- TOC Dropdown -->
            <div
              class="absolute top-full right-0 mt-3 w-80 max-h-[60vh] overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] p-5 z-50 flex flex-col gap-2"
            >
              <div
                class="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-3 pb-2 border-b border-[var(--color-border-subtle)]"
              >
                Contenido
              </div>
              {#each headings as heading}
                <a
                  href={`#${heading.slug}`}
                  on:click={() => (tocOpen = false)}
                  class="block text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] hover:translate-x-1 transition-all py-1.5 pl-2 border-l-2 border-transparent hover:border-[var(--color-secondary)]"
                  class:ml-4={heading.depth > 2}
                >
                  {heading.text}
                </a>
              {/each}
            </div>

            <!-- Backdrop -->
            <div
              class="fixed inset-0 z-40 bg-transparent"
              on:click={() => (tocOpen = false)}
              aria-hidden="true"
            ></div>
          {/if}
        </div>
      {/if}

      <div class="w-px h-6 bg-[var(--color-border)] hidden md:block"></div>
      <ThemeSwitcher />
    </div>
  </div>

  <!-- Progress Bar -->
  <div
    class="absolute bottom-0 left-0 h-[3px] bg-[var(--color-secondary)] transition-all duration-100 ease-out z-50"
    style="width: {progress}%"
  ></div>
</div>
