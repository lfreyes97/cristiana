<script lang="ts">
  export let files: { path: string; data: any }[] = [];
  export let currentFile = "";
  export let onSelect: (file: string) => void;
  export let onCreateNew: () => void;
  export let onSelectCollection: (collectionName: string) => void = () => {};
  export let onGoDashboard: () => void = () => {};
  export let onToggleTheme: () => void = () => {};
  export let onToggleCollapse: () => void = () => {};
  export let isDarkMode: boolean = true;
  export let collapsed: boolean = false;

  $: sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

  $: groupedFiles = sortedFiles.reduce(
    (acc, file) => {
      const parts = file.path.split("/");
      const collection = parts.length > 1 ? parts[0] : "Otros";
      if (!acc[collection]) acc[collection] = [];
      acc[collection].push({
        fullPath: file.path,
        name: file.data?.title || parts.slice(1).join("/") || file.path,
      });
      return acc;
    },
    {} as Record<string, { fullPath: string; name: string }[]>,
  );

  let openCategories: Record<string, boolean> = {};
  const toggleCategory = (cat: string) => {
    openCategories[cat] = !openCategories[cat];
  };

  $: {
    Object.keys(groupedFiles).forEach((cat) => {
      if (openCategories[cat] === undefined) openCategories[cat] = true;
    });
  }
</script>

<div class="p-3 h-full flex flex-col">
  <div class="flex items-center justify-between mb-3">
    {#if !collapsed}
      <h2 class="text-xs uppercase tracking-wider text-zinc-500 font-bold">
        Navegación
      </h2>
    {/if}
    <button
      on:click={onToggleCollapse}
      class="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors p-1 rounded"
      title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
    >
      <div class={`text-lg ${collapsed ? "i-ph-sidebar-simple" : "i-ph-sidebar-simple-fill"}`}></div>
    </button>
  </div>

  <div class="space-y-2 mb-4">
    <button
      on:click={onGoDashboard}
      class={`w-full rounded px-2.5 py-2 text-left text-sm transition flex items-center ${collapsed ? "justify-center" : ""} text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800`}
      title="Dashboard"
    >
      <div class={`i-ph-squares-four text-base ${collapsed ? "" : "mr-2"} text-indigo-600 dark:text-indigo-300`}></div>
      {#if !collapsed}<span>Dashboard</span>{/if}
    </button>
    <button
      on:click={() => onSelectCollection("blog")}
      class={`w-full rounded px-2.5 py-2 text-left text-sm transition flex items-center ${collapsed ? "justify-center" : ""} text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800`}
      title="Colección blog"
    >
      <div class={`i-ph-article text-base ${collapsed ? "" : "mr-2"} text-sky-600 dark:text-sky-300`}></div>
      {#if !collapsed}<span>Blog</span>{/if}
    </button>
    <button
      on:click={() => onSelectCollection("citas")}
      class={`w-full rounded px-2.5 py-2 text-left text-sm transition flex items-center ${collapsed ? "justify-center" : ""} text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800`}
      title="Colección citas"
    >
      <div class={`i-ph-quotes text-base ${collapsed ? "" : "mr-2"} text-violet-600 dark:text-violet-300`}></div>
      {#if !collapsed}<span>Citas</span>{/if}
    </button>
    <button
      on:click={onCreateNew}
      class={`w-full rounded px-2.5 py-2 text-left text-sm transition flex items-center ${collapsed ? "justify-center" : ""} bg-indigo-600 text-white hover:bg-indigo-700`}
      title="Nueva entrada"
    >
      <div class={`i-ph-plus text-base ${collapsed ? "" : "mr-2"}`}></div>
      {#if !collapsed}<span>Nueva entrada</span>{/if}
    </button>
    <button
      on:click={onToggleTheme}
      class={`w-full rounded px-2.5 py-2 text-left text-sm transition flex items-center ${collapsed ? "justify-center" : ""} text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800`}
      title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <div class={`${collapsed ? "" : "mr-2"} text-base text-amber-500 dark:text-amber-300 ${isDarkMode ? "i-ph-sun" : "i-ph-moon"}`}></div>
      {#if !collapsed}
        <span>{isDarkMode ? "Modo claro" : "Modo oscuro"}</span>
      {/if}
    </button>
  </div>

  <div class="h-px bg-zinc-200 dark:bg-zinc-800 mb-3"></div>

  {#if !collapsed}
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-xs uppercase tracking-wider text-zinc-500 font-bold">
        Archivos
      </h3>
    </div>
  {/if}

  <div class="flex-1 overflow-y-auto pr-1">
    <div class="space-y-3">
      {#each Object.entries(groupedFiles) as [category, items]}
        <div>
          <div class="flex items-center justify-between mb-1 group">
            <button
              class={`flex items-center flex-1 text-left text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:text-indigo-500 transition-colors ${collapsed ? "justify-center" : ""}`}
              on:click={() => toggleCategory(category)}
              title={category}
            >
              {#if !collapsed}
                <div
                  class={`transition-transform text-xs mr-1 opacity-50 ${openCategories[category] ? "i-ph-caret-down" : "i-ph-caret-right"}`}
                ></div>
                <span class="capitalize">{category}</span>
              {:else}
                <div class="i-ph-folder-simple text-base text-zinc-700 dark:text-zinc-200"></div>
              {/if}
            </button>
            {#if !collapsed}
              <button
                title="Ver colección"
                on:click={() => onSelectCollection(category)}
                class="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-indigo-500 rounded"
              >
                <div class="i-ph-arrows-out-simple"></div>
              </button>
            {/if}
          </div>

          {#if openCategories[category] && !collapsed}
            <ul class="space-y-0.5 ml-2 border-l border-zinc-200 dark:border-zinc-800 pl-2">
              {#each items as item}
                <li>
                  <button
                    class={`w-full text-left px-2 py-1.5 rounded text-sm truncate transition-colors ${
                      currentFile === item.fullPath
                        ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white font-medium border-l-2 border-indigo-500"
                        : "text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                    on:click={() => onSelect(item.fullPath)}
                    title={item.name}
                  >
                    {item.name}
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
      {#if sortedFiles.length === 0}
        <div class="text-sm text-zinc-400 p-2">No se encontraron archivos</div>
      {/if}
    </div>
  </div>
</div>
