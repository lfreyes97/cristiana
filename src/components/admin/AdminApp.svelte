<script lang="ts">
  import { onMount } from "svelte";
  import FileExplorer from "./FileExplorer.svelte";
  import FrontmatterEditor from "./FrontmatterEditor.svelte";
  import Dashboard from "./Dashboard.svelte";
  import CollectionTable from "./CollectionTable.svelte";
  import type { ComponentType } from "svelte";

  let authenticated = false;
  let password = "";
  let error = "";

  let currentFile = "";
  let currentCollection = "";
  let currentContent = "";
  let currentData: Record<string, any> = {};
  let files: { path: string; data: any; effectiveStatus?: string }[] = [];
  let fieldErrors: Record<string, string> = {};
  let isSaving = false;
  let hasUnsavedChanges = false;
  let toast = "";

  let isDarkMode = true; // Global theme state
  let sidebarCollapsed = false;

  // Custom Modal State
  let isCreateModalOpen = false;
  let newFileName = "";
  let newFileCollection = "blog";
  let RichMarkdownEditor: ComponentType | null = null;
  let loadingEditor = false;

  const ensureEditorLoaded = async () => {
    if (RichMarkdownEditor || loadingEditor) return;
    loadingEditor = true;
    try {
      const mod = await import("./RichMarkdownEditor.svelte");
      RichMarkdownEditor = mod.default;
    } finally {
      loadingEditor = false;
    }
  };

  const login = async () => {
    try {
      const response = await fetch("/api/cms/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        authenticated = true;
        fetchFiles();
      } else {
        if (response.status === 429) {
          error = "Demasiados intentos. Intenta de nuevo en unos minutos.";
        } else {
          error = "Contraseña incorrecta";
        }
      }
    } catch (err) {
      error = "Error de conexión";
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/cms/content");
      if (response.ok) {
        const data = await response.json();
        files = data.files || [];
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadFile = async (filePath: string) => {
    try {
      const response = await fetch(
        `/api/cms/content?file=${encodeURIComponent(filePath)}`,
      );
      if (response.ok) {
        const json = await response.json();
        currentFile = filePath;
        currentContent = json.content;
        currentData = json.data || {};
        fieldErrors = {};
        hasUnsavedChanges = false;
        ensureEditorLoaded();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadCollection = (collectionName: string) => {
    currentFile = "";
    currentCollection = collectionName;
  };
  const goDashboard = () => {
    currentFile = "";
    currentCollection = "";
  };

  // Triggered from Dashboard or FileExplorer
  const openCreateModal = (suggestedCollection?: string) => {
    newFileCollection =
      suggestedCollection && typeof suggestedCollection === "string"
        ? suggestedCollection
        : "blog";
    newFileName = "";
    isCreateModalOpen = true;
  };

  const confirmCreateFile = () => {
    if (!newFileName.trim()) return;

    // Format filename securely (no spaces, lowercase)
    const formattedName = newFileName.trim().toLowerCase().replace(/\s+/g, "-");
    const fullPath = `${newFileCollection}/${formattedName}`;

    currentFile =
      fullPath.endsWith(".md") || fullPath.endsWith(".mdx")
        ? fullPath
        : `${fullPath}.md`;

    currentContent = `# ${newFileName}\n\nComienza a escribir aquí...`;

    // Default schema based on collection
    const dateStr = new Date().toISOString().split("T")[0];

    let defaultData: Record<string, any> = {
      title: newFileName,
      draft: true,
      status: "draft",
    };

    if (newFileCollection === "blog") {
      defaultData = {
        title: newFileName,
        description: "",
        category: "General",
        author: "Anónimo",
        pubDate: dateStr,
        tags: [],
        draft: true,
        status: "draft",
      };
    } else if (newFileCollection === "autores") {
      defaultData = {
        title: newFileName,
        description: "Biografía del autor",
        pubDate: dateStr,
        tags: ["autor"],
        draft: true,
        status: "draft",
      };
    } else if (newFileCollection === "citas") {
      defaultData = {
        title: newFileName,
        quote: "Escribe la cita aquí...",
        category: "Inspiración",
        author: "Autor de la cita",
        source: "",
        pubDate: dateStr,
        draft: true,
        status: "draft",
      };
    } else {
      defaultData = {
        title: newFileName,
        description: "",
        pubDate: dateStr,
        draft: true,
        status: "draft",
      };
    }

    currentData = defaultData;

    isCreateModalOpen = false;
    saveFile();
  };

  const saveFile = async () => {
    if (!currentFile) return;
    isSaving = true;
    fieldErrors = {};
    try {
      const response = await fetch("/api/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: currentFile,
          content: currentContent,
          data: currentData,
        }),
      });
      if (response.ok) {
        toast = "Archivo guardado correctamente";
        hasUnsavedChanges = false;
        fetchFiles();
      } else {
        const json = await response.json().catch(() => ({}));
        if (response.status === 422 && json.fieldErrors) {
          fieldErrors = json.fieldErrors;
          toast = "Revisa los campos con error.";
        } else {
          toast = "Error al guardar archivo";
        }
      }
    } catch (err) {
      toast = "Error al guardar archivo";
    } finally {
      isSaving = false;
      if (toast) {
        setTimeout(() => {
          toast = "";
        }, 2500);
      }
    }
  };

  // Try mapping on mount to see if session is already active
  onMount(() => {
    fetchFiles().then(() => {
      if (files.length > 0) authenticated = true;
    });
  });
</script>

{#if !authenticated}
  <div
    class="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950"
  >
    <div
      class="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-xl w-full max-w-md border border-zinc-200 dark:border-zinc-800"
    >
      <h1
        class="text-2xl font-bold mb-6 text-center text-zinc-900 dark:text-white"
      >
        CMS Login
      </h1>
      <form on:submit|preventDefault={login} class="space-y-4">
        <div>
          <input
            type="password"
            bind:value={password}
            placeholder="Contraseña de admin"
            class="w-full p-3 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200"
          />
        </div>
        {#if error}
          <p class="text-red-500 text-sm">{error}</p>
        {/if}
        <button
          type="submit"
          class="w-full bg-black dark:bg-white text-white dark:text-black p-3 rounded font-medium hover:opacity-90 transition"
          >Entrar</button
        >
      </form>
    </div>
  </div>
{:else}
  <div
    class={`flex h-screen overflow-hidden ${isDarkMode ? "dark" : ""} bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500`}
  >
    <!-- Left Column: Explorer (Hidden in Level 1 - Dashboard) -->
    {#if currentFile || currentCollection}
      <div
        class={`${sidebarCollapsed ? "w-16" : "w-64"} flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto transition-all duration-300`}
      >
        <FileExplorer
          {files}
          {currentFile}
          {isDarkMode}
          collapsed={sidebarCollapsed}
          onSelect={loadFile}
          onCreateNew={openCreateModal}
          onSelectCollection={loadCollection}
          onGoDashboard={goDashboard}
          onToggleTheme={() => (isDarkMode = !isDarkMode)}
          onToggleCollapse={() => (sidebarCollapsed = !sidebarCollapsed)}
        />
      </div>
    {/if}

    <!-- Middle Column: Editor or Dashboard or Collection -->
    <div class="flex-1 overflow-hidden relative">
      {#if currentFile}
        {#if RichMarkdownEditor}
          <svelte:component
            this={RichMarkdownEditor}
            fileName={currentFile}
            content={currentContent}
            onChange={(newContent) => {
              currentContent = newContent;
              hasUnsavedChanges = true;
            }}
            onSave={saveFile}
            {isSaving}
            {hasUnsavedChanges}
          />
        {:else}
          <div
            class="h-full w-full flex items-center justify-center bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-300"
          >
            Cargando editor...
          </div>
        {/if}
      {:else if currentCollection}
        <CollectionTable
          collection={currentCollection}
          {files}
          {isDarkMode}
          onOpenFile={loadFile}
          onBack={() => (currentCollection = "")}
          onCreateNew={() => openCreateModal(currentCollection)}
        />
      {:else}
        <Dashboard
          {files}
          {isDarkMode}
          onToggleTheme={() => (isDarkMode = !isDarkMode)}
          onCreateNew={openCreateModal}
          onOpenFile={loadFile}
          onSelectCollection={loadCollection}
        />
      {/if}
    </div>

    <!-- Right Column: Metadata -->
    {#if currentFile}
      <div
        class="w-80 flex-shrink-0 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <FrontmatterEditor
          data={currentData}
          {fieldErrors}
          onChange={(newData) => {
            currentData = newData;
            hasUnsavedChanges = true;
          }}
        />
      </div>
    {/if}
  </div>

  <!-- Create New File Modal -->
  {#if isCreateModalOpen}
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
    >
      <div
        class="bg-white dark:bg-[#1c1c1e] w-full max-w-md p-6 rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 transform transition-all scale-100"
      >
        <div class="flex items-center justify-between mb-5">
          <h3
            class="text-xl font-semibold text-zinc-900 dark:text-white flex items-center"
          >
            <div class="i-ph-file-plus mr-2 text-indigo-500"></div>
            Nuevo Archivo
          </h3>
          <button
            on:click={() => (isCreateModalOpen = false)}
            class="text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"
            aria-label="Cerrar modal"
          >
            <div class="i-ph-x text-xl"></div>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label
              for="collection-input"
              class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >Colección</label
            >
            <div class="flex items-center space-x-2">
              <div class="i-ph-folder text-zinc-400"></div>
              <input
                id="collection-input"
                type="text"
                bind:value={newFileCollection}
                placeholder="Ej: blog, citas, autores..."
                class="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label
              for="filename-input"
              class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >Título del Artículo</label
            >
            <!-- svelte-ignore a11y-autofocus -->
            <input
              id="filename-input"
              type="text"
              bind:value={newFileName}
              on:keydown={(e) => e.key === "Enter" && confirmCreateFile()}
              placeholder="Mi increíble post..."
              class="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              autofocus
            />
            <div class="text-[10px] text-zinc-500 mt-1.5 flex items-center">
              <div class="i-ph-info mr-1"></div>
              El nombre del archivo se generará automáticamente a partir del título.
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-end space-x-3">
          <button
            on:click={() => (isCreateModalOpen = false)}
            class="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >Cancelar</button
          >
          <button
            on:click={confirmCreateFile}
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center"
          >
            Crear <div class="i-ph-arrow-right ml-1"></div>
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if toast}
    <div
      class="fixed bottom-5 right-5 z-[60] rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-black px-4 py-2 text-sm shadow-lg"
    >
      {toast}
    </div>
  {/if}
{/if}
