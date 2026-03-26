<script lang="ts">
  export let fileName = "";
  export let content = "";
  export let onSave: (content: string) => void;

  let editableContent = content;

  $: {
    // When the content prop changes, reset editableContent
    // We add a tiny hack here to trigger the reactivity correctly for different files
    fileName;
    editableContent = content;
  }

  const handleSave = () => {
    onSave(editableContent);
  };
</script>

<div
  class="flex flex-col h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800"
>
  <div
    class="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800"
  >
    <div
      class="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 pt-1"
    >
      <div class="i-ph-file-text text-lg"></div>
      <h3 class="font-medium text-sm text-zinc-700 dark:text-zinc-300">
        {fileName}
      </h3>
    </div>
    <button
      on:click={handleSave}
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm transition font-medium flex items-center space-x-2"
    >
      <div class="i-ph-floppy-disk text-lg"></div>
      <span>Guardar</span>
    </button>
  </div>
  <div class="flex-1 w-full bg-zinc-50 dark:bg-zinc-950 p-6 overflow-hidden">
    <textarea
      class="w-full h-full bg-transparent text-zinc-800 dark:text-zinc-200 font-mono text-sm resize-none outline-none leading-relaxed"
      bind:value={editableContent}
      spellcheck="false"
      placeholder="Escribe tu contenido aquí..."
    ></textarea>
  </div>
</div>
