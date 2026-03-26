<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import Placeholder from "@tiptap/extension-placeholder";
  import { Markdown } from "tiptap-markdown";

  export let content = "";
  export let onChange: (content: string) => void;
  export let fileName = "";
  export let onSave: () => void;
  export let isSaving = false;
  export let hasUnsavedChanges = false;

  let element: HTMLElement;
  let editor: Editor;

  $: if (
    editor &&
    (editor.storage?.markdown?.getMarkdown() as string) !== content &&
    !editor.isFocused
  ) {
    // Only update content from outside if the editor is not currently being typed in
    editor.commands.setContent(content);
  }

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [
        StarterKit,
        Markdown, // Allows the editor to input/output Markdown
        Placeholder.configure({
          placeholder: "Escribe tu contenido aquí...",
        }),
      ],
      content: content,
      editorProps: {
        attributes: {
          class:
            "prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[500px]",
        },
      },
      onUpdate: ({ editor }) => {
        onChange((editor.storage?.markdown?.getMarkdown() as string) || "");
      },
    });
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });
</script>

<div
  class="flex flex-col h-full bg-white dark:bg-zinc-900 shadow-sm border-x border-zinc-200 dark:border-zinc-800"
>
  <div
    class="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10"
  >
    <div class="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400">
      <div class="i-ph-file-text text-lg"></div>
      <h3 class="font-medium text-sm text-zinc-700 dark:text-zinc-300">
        {fileName}
      </h3>
      {#if hasUnsavedChanges}
        <span class="text-xs text-amber-500">Sin guardar</span>
      {/if}
    </div>

    <div class="flex space-x-2">
      <!-- Toolbar basic actions -->
      <div
        class="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded p-1 mr-4"
      >
        <button
          on:click={() => editor.chain().focus().toggleBold().run()}
          class={`p-1.5 rounded transition ${editor?.isActive("bold") ? "bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"}`}
          title="Bold"
        >
          <div class="i-ph-text-b"></div>
        </button>
        <button
          on:click={() => editor.chain().focus().toggleItalic().run()}
          class={`p-1.5 rounded transition ${editor?.isActive("italic") ? "bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"}`}
          title="Italic"
        >
          <div class="i-ph-text-italic"></div>
        </button>
        <div class="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
        <button
          on:click={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()}
          class={`p-1.5 rounded transition ${editor?.isActive("heading", { level: 2 }) ? "bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"}`}
          title="Heading 2"
        >
          <div class="i-ph-text-h-two"></div>
        </button>
        <button
          on:click={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()}
          class={`p-1.5 rounded transition ${editor?.isActive("heading", { level: 3 }) ? "bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"}`}
          title="Heading 3"
        >
          <div class="i-ph-text-h-three"></div>
        </button>
        <div class="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
        <button
          on:click={() => editor.chain().focus().toggleBulletList().run()}
          class={`p-1.5 rounded transition ${editor?.isActive("bulletList") ? "bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"}`}
          title="Bullet List"
        >
          <div class="i-ph-list-bullets"></div>
        </button>
        <button
          on:click={() => editor.chain().focus().toggleBlockquote().run()}
          class={`p-1.5 rounded transition ${editor?.isActive("blockquote") ? "bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"}`}
          title="Blockquote"
        >
          <div class="i-ph-quotes"></div>
        </button>
      </div>

      <button
        on:click={onSave}
        disabled={isSaving}
        class="bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-1.5 rounded text-sm transition font-medium flex items-center space-x-2"
      >
        <div class="i-ph-floppy-disk text-lg"></div>
        <span>{isSaving ? "Guardando..." : "Guardar"}</span>
      </button>
    </div>
  </div>

  <!-- Editor container -->
  <div
    class="flex-1 overflow-y-auto editor-scrollbar p-8 lg:p-12 xl:p-16 w-full max-w-4xl mx-auto"
  >
    <div bind:this={element} class="tiptap-wrapper w-full pb-32"></div>
  </div>
</div>

<style>
  /* Tiptap removes default margins, so we rely on Tailwind Prose classes injected above.
     But we can add a few specific tweaks if necessary */
  :global(.tiptap p.is-editor-empty:first-child::before) {
    color: #a1a1aa; /* zinc-400 */
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
  :global(.dark .tiptap p.is-editor-empty:first-child::before) {
    color: #52525b; /* zinc-600 */
  }
</style>
