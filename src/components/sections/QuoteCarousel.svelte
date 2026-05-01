<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  interface Quote {
    text: string;
    author: string;
    source?: string;
    year?: string;
    category?: string;
  }

  export let quotes: Quote[] = [];
  export let autoplayMs: number = 6000;
  export let label: string = "Voces que inspiran";

  let current = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  let transitioning = false;

  function goto(index: number) {
    if (transitioning || index === current) return;
    transitioning = true;
    current = (index + quotes.length) % quotes.length;
    setTimeout(() => (transitioning = false), 400);
    resetTimer();
  }

  function next() {
    goto(current + 1);
  }
  function prev() {
    goto(current - 1);
  }

  function resetTimer() {
    if (timer) clearInterval(timer);
    if (autoplayMs > 0) {
      timer = setInterval(next, autoplayMs);
    }
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  }

  onMount(() => resetTimer());
  onDestroy(() => {
    if (timer) clearInterval(timer);
  });
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<section class="quote-carousel" aria-label={label}>
  <div class="carousel-inner" tabindex="0" role="group" on:keydown={handleKey}>
    <!-- Label -->
    <p class="carousel-label">{label}</p>

    <!-- Stage -->
    <div class="carousel-stage">
      <!-- Decorative left quote mark -->
      <span class="deco-mark deco-left" aria-hidden="true">&ldquo;</span>

      {#each quotes as q, i}
        <div
          class="carousel-slide"
          class:active={i === current}
          class:fading={transitioning && i === current}
          aria-hidden={i !== current}
          role="group"
          aria-label="Cita {i + 1} de {quotes.length}"
        >
          {#if q.category}
            <span class="quote-category">{q.category}</span>
          {/if}

          <blockquote class="quote-text">
            &ldquo;{q.text}&rdquo;
          </blockquote>

          <footer class="quote-footer">
            <div class="footer-line"></div>
            <div class="footer-meta">
              <span class="author">{q.author}</span>
              {#if q.source || q.year}
                <span class="meta-sep">·</span>
                <span class="source-year">
                  {#if q.source}{q.source}{/if}
                  {#if q.source && q.year},
                  {/if}
                  {#if q.year}{q.year}{/if}
                </span>
              {/if}
            </div>
          </footer>
        </div>
      {/each}

      <!-- Decorative right quote mark -->
      <span class="deco-mark deco-right" aria-hidden="true">&rdquo;</span>
    </div>

    <!-- Controls -->
    <div class="carousel-controls">
      <button class="nav-btn" on:click={prev} aria-label="Cita anterior">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div class="dots" role="tablist">
        {#each quotes as _, i}
          <button
            class="dot"
            class:dot-active={i === current}
            role="tab"
            aria-selected={i === current}
            aria-label="Ir a cita {i + 1}"
            on:click={() => goto(i)}
          ></button>
        {/each}
      </div>

      <button class="nav-btn" on:click={next} aria-label="Cita siguiente">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>

    <!-- Progress bar -->
    {#if autoplayMs > 0}
      <div class="progress-track" aria-hidden="true">
        {#key current}
          <div
            class="progress-bar"
            style="animation-duration: {autoplayMs}ms;"
          ></div>
        {/key}
      </div>
    {/if}
  </div>
</section>

<style>
  .quote-carousel {
    padding: 4rem 1.5rem;
    max-width: 56rem;
    margin-inline: auto;
    position: relative;
  }

  .carousel-inner {
    outline: none;
    position: relative;
  }

  .carousel-inner:focus-visible {
    outline: 2px solid var(--color-secondary, #b08d57);
    outline-offset: 4px;
    border-radius: 4px;
  }

  .carousel-label {
    text-align: center;
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-secondary, #b08d57);
    margin-bottom: 2.5rem;
  }

  /* ── Stage ─────────────────────────────────────────── */
  .carousel-stage {
    position: relative;
    min-height: 16rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .deco-mark {
    position: absolute;
    font-family: var(--font-serif, Georgia, serif);
    font-size: 8rem;
    line-height: 1;
    color: var(--color-secondary, #b08d57);
    opacity: 0.12;
    user-select: none;
    pointer-events: none;
  }
  .deco-left {
    top: -1.5rem;
    left: 0;
  }
  .deco-right {
    bottom: -3rem;
    right: 0;
  }

  /* ── Slide ──────────────────────────────────────────── */
  .carousel-slide {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    opacity: 0;
    transform: translateY(0.75rem);
    transition:
      opacity 0.4s ease,
      transform 0.4s ease;
    pointer-events: none;
  }

  .carousel-slide.active {
    opacity: 1;
    transform: translateY(0);
    position: relative;
    pointer-events: auto;
  }

  .carousel-slide.fading {
    opacity: 0;
    transform: translateY(-0.5rem);
  }

  /* ── Category pill ──────────────────────────────────── */
  .quote-category {
    font-family: var(--font-mono, monospace);
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-secondary, #b08d57);
    background: color-mix(
      in srgb,
      var(--color-secondary, #b08d57) 10%,
      transparent
    );
    border: 1px solid
      color-mix(in srgb, var(--color-secondary, #b08d57) 25%, transparent);
    padding: 0.2rem 0.75rem;
    border-radius: 999px;
  }

  /* ── Blockquote ─────────────────────────────────────── */
  .quote-text {
    font-family: var(--font-serif, Georgia, serif);
    font-size: clamp(1.25rem, 3vw, 2rem);
    font-style: italic;
    line-height: 1.5;
    text-align: center;
    color: var(--color-text, #1a1a1a);
    max-width: 48rem;
    margin: 0;
    padding: 0 2rem;
  }

  /* ── Footer ─────────────────────────────────────────── */
  .quote-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    max-width: 24rem;
  }

  .footer-line {
    width: 3rem;
    height: 1px;
    background: var(--color-secondary, #b08d57);
    opacity: 0.4;
  }

  .footer-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .author {
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-text, #1a1a1a);
  }

  .meta-sep {
    color: var(--color-secondary, #b08d57);
    opacity: 0.6;
    font-size: 0.75rem;
  }

  .source-year {
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    color: var(--color-text-muted, #888);
    text-transform: uppercase;
  }

  /* ── Controls ───────────────────────────────────────── */
  .carousel-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 3rem;
  }

  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    border: 1px solid var(--color-border, #e0ddd8);
    background: transparent;
    color: var(--color-text-muted, #888);
    cursor: pointer;
    transition:
      border-color 0.2s,
      color 0.2s,
      background 0.2s;
  }

  .nav-btn:hover {
    border-color: var(--color-secondary, #b08d57);
    color: var(--color-secondary, #b08d57);
    background: color-mix(
      in srgb,
      var(--color-secondary, #b08d57) 6%,
      transparent
    );
  }

  .dots {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .dot {
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    border: none;
    background: var(--color-border, #e0ddd8);
    cursor: pointer;
    transition:
      background 0.25s,
      transform 0.25s,
      width 0.25s;
    padding: 0;
  }

  .dot-active {
    background: var(--color-secondary, #b08d57);
    transform: scale(1.25);
    width: 1.25rem;
    border-radius: 999px;
  }

  /* ── Progress bar ───────────────────────────────────── */
  .progress-track {
    width: 100%;
    height: 2px;
    background: var(--color-border, #e0ddd8);
    border-radius: 1px;
    overflow: hidden;
    margin-top: 2rem;
  }

  .progress-bar {
    height: 100%;
    background: var(--color-secondary, #b08d57);
    width: 0%;
    animation: progress-fill linear forwards;
  }

  @keyframes progress-fill {
    from {
      width: 0%;
    }
    to {
      width: 100%;
    }
  }

  /* ── Responsive ─────────────────────────────────────── */
  @media (max-width: 640px) {
    .quote-carousel {
      padding: 3rem 1rem;
    }
    .quote-text {
      padding: 0 0.5rem;
    }
    .deco-left,
    .deco-right {
      font-size: 5rem;
    }
  }
</style>
