<script>
  import { createEventDispatcher } from 'svelte';
  
  export let currentIndex;
  export let total;

  const dispatch = createEventDispatcher();
</script>

<div class="canvas-controls">
  <button 
    class="control-btn" 
    on:click={() => dispatch('prev')} 
    disabled={$currentIndex === 0}
    aria-label="Previous frame"
  >
    <div class="i-ph-arrow-left"></div>
  </button>
  
  <div class="frame-indicator">
    <span class="handwritten">{$currentIndex + 1} / {total}</span>
  </div>

  <button 
    class="control-btn" 
    on:click={() => dispatch('next')} 
    disabled={$currentIndex === total - 1}
    aria-label="Next frame"
  >
    <div class="i-ph-arrow-right"></div>
  </button>
</div>

<style>
  .canvas-controls {
    position: absolute;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 1rem;
    background: color-mix(in srgb, var(--color-bg), transparent 20%);
    backdrop-filter: blur(8px);
    padding: 0.5rem 1rem;
    border-radius: var(--radius-pill);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-lg);
    z-index: 100;
    filter: url(#filter-sketch);
  }

  .control-btn {
    background: none;
    border: none;
    color: var(--color-text);
    cursor: pointer;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    transition: all 0.2s ease;
    opacity: 0.7;
  }

  .control-btn:hover:not(:disabled) {
    opacity: 1;
    transform: scale(1.1);
    color: var(--color-secondary);
  }

  .control-btn:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }

  .frame-indicator {
    padding: 0 0.5rem;
    font-size: 0.9rem;
    min-width: 3rem;
    text-align: center;
    color: var(--color-text);
    opacity: 0.8;
  }

  .handwritten {
    font-family: "Architects Daughter", cursive;
  }
</style>
