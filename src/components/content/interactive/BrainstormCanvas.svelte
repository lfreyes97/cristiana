<script>
  import { onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import CanvasControls from './CanvasControls.svelte';

  let frames = [];
  let currentIndex = writable(0);
  let canvasElement;
  let viewportWidth = 0;
  let viewportHeight = 0;

  // Camera state
  const cameraX = tweened(0, { duration: 800, easing: cubicOut });
  const cameraY = tweened(0, { duration: 800, easing: cubicOut });
  const cameraScale = tweened(1, { duration: 800, easing: cubicOut });

  function scanFrames() {
    if (!canvasElement) return;
    const frameElements = canvasElement.querySelectorAll('[data-frame]');
    frames = Array.from(frameElements).map((el, i) => {
      const isAuto = el.getAttribute('data-auto') === 'true';
      let x = parseFloat(el.getAttribute('data-x') || '0');
      let y = parseFloat(el.getAttribute('data-y') || '0');
      let scale = parseFloat(el.getAttribute('data-scale') || '1');
      let rotate = parseFloat(el.getAttribute('data-rotate') || '0');
      
      if (isAuto && i > 0) {
        // Auto-layout de zig-zag amplio para evitar overlaps
        x = i * 1400; 
        y = (i % 2 !== 0 ? -1 : 1) * 800;
        
        // Auto-rotación sutil y oscilante
        if (el.getAttribute('data-rotate') === null) {
          rotate = (i % 2 === 0 ? 1 : -1) * (5 + (i * 3) % 10);
        }
        
        // Aplicamos el nuevo cálculo al DOM directamente para que se vea
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`;
      }

      return {
        x,
        y,
        scale,
        rotate,
        id: el.getAttribute('data-id')
      };
    });
  }

  function goToFrame(index) {
    if (index < 0 || index >= frames.length) return;
    $currentIndex = index;
    const frame = frames[index];
    
    cameraX.set(-frame.x);
    cameraY.set(-frame.y);
    cameraScale.set(1 / (frame.scale || 1));
  }

  function next() {
    if (frames.length === 0) scanFrames();
    goToFrame(($currentIndex + 1) % frames.length);
  }

  function prev() {
    if (frames.length === 0) scanFrames();
    goToFrame(($currentIndex - 1 + frames.length) % frames.length);
  }

  onMount(() => {
    scanFrames();
    if (frames.length > 0) {
      setTimeout(() => goToFrame(0), 100);
    }

    const handleKeydown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      if (e.key === 'ArrowLeft') prev();
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<div 
  class="presentation-viewport" 
  bind:clientWidth={viewportWidth} 
  bind:clientHeight={viewportHeight}
>
  <div 
    class="presentation-canvas"
    style="transform: scale({$cameraScale}) translate({$cameraX}px, {$cameraY}px); transform-origin: 0 0;"
    bind:this={canvasElement}
  >
    <slot />
  </div>

  <CanvasControls 
    {currentIndex} 
    total={frames.length} 
    on:next={next} 
    on:prev={prev} 
    on:go={(e) => goToFrame(e.detail)}
  />
</div>

<style>
  .presentation-viewport {
    position: relative;
    width: 100%;
    height: 700px;
    background-color: var(--color-bg);
    background-image: radial-gradient(var(--color-border) 1px, transparent 1px);
    background-size: 24px 24px;
    background-position: 0 0;
    overflow: hidden;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg);
    margin: 3rem 0;
    cursor: grab;
  }

  .presentation-viewport:active {
    cursor: grabbing;
  }

  .presentation-canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1px;
    height: 1px;
    transition: none; /* Transition handled by tweened stores */
    will-change: transform;
  }

  :global(.presentation-viewport *) {
    user-select: none;
  }
</style>
