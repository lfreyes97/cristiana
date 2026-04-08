<script>
  import { onMount, getContext } from 'svelte';

  export let x = 0;
  export let y = 0;
  export let scale = 1;
  export let rotate = 0;

  const { registerFrame, currentIndex } = getContext('canvas');
  
  let frameId = Math.random().toString(36).substr(2, 9);
  let isActive = false;

  onMount(() => {
    const unregister = registerFrame({ x, y, scale, rotate, id: frameId });
    return unregister;
  });

  // Check if this frame is currently active
  // Note: frames are registered in order of appearance in slots
</script>

<div 
  class="canvas-frame" 
  style="transform: translate({x}px, {y}px) scale({scale}) rotate({rotate}deg);"
>
  <div class="frame-content">
    <slot />
  </div>
</div>

<style>
  .canvas-frame {
    position: absolute;
    top: 50%;
    left: 50%;
    width: auto;
    min-width: 300px;
    transform-origin: center center;
    pointer-events: auto;
  }

  .frame-content {
    background: var(--color-bg);
    padding: 2rem;
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-md);
    border-radius: var(--radius-md);
    filter: url(#filter-sketch);
  }

  /* Paper look for frames */
  .frame-content::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
      transparent,
      transparent 23px,
      rgba(var(--color-primary-rgb), 0.05) 23px,
      rgba(var(--color-primary-rgb), 0.05) 24px
    );
    background-size: 100% 24px;
    z-index: -1;
    pointer-events: none;
    opacity: 0.5;
  }
</style>
