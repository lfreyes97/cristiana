<script lang="ts">
  export let collection: string = "Collección";
  export let files: { path: string; data: any; effectiveStatus?: string }[] = [];
  export let onOpenFile: (filePath: string) => void;
  export let onBack: () => void;
  export let onCreateNew: () => void;
  export let isDarkMode: boolean = true;

  let searchQuery = "";
  let statusFilter = "all";

  // Filter files that belong to this collection
  $: collectionFiles = files.filter((f) => {
    const parent = f.path.split("/")[0];
    const col = parent && f.path.includes("/") ? parent : "otros";
    return col === collection;
  });

  $: filteredFiles = collectionFiles
    .filter((f) => {
      const title = f.data?.title || f.path.split("/").pop() || "";
      const status = f.effectiveStatus || (f.data?.draft ? "draft" : "published");
      const matchesSearch = title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => compareEditorialOrder(a, b));

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const editorialOrder = {
    scheduled: 0,
    draft: 1,
    review: 2,
    approved: 3,
    published: 4,
  } as Record<string, number>;

  const getStatus = (file: { data: any; effectiveStatus?: string }) =>
    file.effectiveStatus || (file.data?.draft ? "draft" : "published");

  const compareEditorialOrder = (
    a: { data: any; effectiveStatus?: string },
    b: { data: any; effectiveStatus?: string },
  ) => {
    const statusA = getStatus(a);
    const statusB = getStatus(b);
    if (statusA === "scheduled" && statusB === "scheduled") {
      const at = new Date(a.data?.publishAt || 0).getTime();
      const bt = new Date(b.data?.publishAt || 0).getTime();
      return at - bt;
    }
    return (editorialOrder[statusA] ?? 99) - (editorialOrder[statusB] ?? 99);
  };
</script>

<div
  class={`h-full w-full ${isDarkMode ? "dark" : ""} bg-white dark:bg-zinc-950 flex flex-col transition-colors duration-500`}
>
  <!-- Header Bar -->
  <header
    class="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10"
  >
    <div class="flex items-center space-x-6">
      <button
        on:click={onBack}
        class="flex items-center space-x-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition"
      >
        <div class="i-ph-arrow-left"></div>
        <span>Atrás</span>
      </button>
      <div class="h-6 w-px bg-zinc-200 dark:bg-zinc-800"></div>
      <h1 class="text-2xl font-serif text-zinc-900 dark:text-white capitalize">
        {collection}
      </h1>
    </div>

    <div class="flex items-center space-x-4">
      <!-- Search Bar -->
      <div class="relative flex items-center">
        <div class="i-ph-magnifying-glass absolute left-3 text-zinc-400"></div>
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Buscar..."
          class="pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white w-64 transition-all focus:w-80"
        />
      </div>

      <select
        bind:value={statusFilter}
        class="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-lg dark:text-white"
      >
        <option value="all">Todos los estados</option>
        <option value="scheduled">Scheduled</option>
        <option value="draft">Draft</option>
        <option value="review">Review</option>
        <option value="approved">Approved</option>
        <option value="published">Published</option>
      </select>

      <button
        class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
      >
        <div class="i-ph-export"></div>
        <span>Exportar</span>
      </button>

      <button
        on:click={onCreateNew}
        class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
      >
        <div class="i-ph-plus font-bold"></div>
        <span>Nueva Entrada</span>
      </button>
    </div>
  </header>

  <!-- Table Content -->
  <div class="flex-1 overflow-auto p-6 bg-[#fcfcfc] dark:bg-[#121214]">
    <div
      class="min-w-full bg-white dark:bg-[#1c1c1e] rounded-2xl border border-zinc-200 dark:border-white/5 overflow-hidden shadow-sm"
    >
      <!-- Table Header -->
      <div
        class="grid grid-cols-12 gap-4 p-4 border-b border-zinc-200 dark:border-white/5 text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-50/50 dark:bg-white/5"
      >
        <div class="col-span-4 flex items-center space-x-4 pl-2">
          <input
            type="checkbox"
            class="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 bg-transparent"
          />
          <span>Nombre</span>
        </div>
        <div class="col-span-2 flex items-center">Categoría</div>
        <div class="col-span-2 flex items-center">Autor</div>
        <div class="col-span-2 flex items-center">Estado</div>
        <div class="col-span-2 flex items-center justify-between pr-2">
          <span>Última Actualización</span>
          <div class="i-ph-gear text-lg font-normal"></div>
        </div>
      </div>

      <!-- Table Rows -->
      <div class="divide-y divide-zinc-100 dark:divide-white/5">
        {#each filteredFiles as file}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            on:click={() => onOpenFile(file.path)}
            class="grid grid-cols-12 gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-white/5 transition text-left items-center w-full group cursor-pointer"
          >
            <!-- Name -->
            <div class="col-span-4 flex items-center space-x-4 pl-2">
              <input
                type="checkbox"
                on:click|stopPropagation
                class="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 bg-transparent cursor-pointer"
              />
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                >
                  {file.data?.title ||
                    file.path
                      .split("/")
                      .pop()
                      ?.replace(".md", "")
                      ?.replace(".mdx", "")}
                </p>
                <p class="text-xs text-zinc-500 truncate mt-0.5">{file.path}</p>
              </div>
            </div>

            <!-- Category -->
            <div
              class="col-span-2 text-sm text-zinc-600 dark:text-zinc-400 truncate"
            >
              {file.data?.category || file.data?.categories?.[0] || "General"}
            </div>

            <!-- Author -->
            <div
              class="col-span-2 text-sm text-zinc-600 dark:text-zinc-400 truncate"
            >
              {file.data?.author || "Anónimo"}
            </div>

            <!-- Status -->
            <div class="col-span-2 flex items-center">
              {#if getStatus(file) === "draft"}
                <span
                  class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>Borrador</span>
                </span>
              {:else if getStatus(file) === "scheduled"}
                <span
                  class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 border border-sky-200 dark:border-sky-800/50"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                  <span>Programado</span>
                </span>
              {:else if getStatus(file) === "review"}
                <span
                  class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400 border border-violet-200 dark:border-violet-800/50"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                  <span>Revisión</span>
                </span>
              {:else if getStatus(file) === "approved"}
                <span
                  class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>Aprobado</span>
                </span>
              {:else}
                <span
                  class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Publicado</span>
                </span>
              {/if}
            </div>

            <!-- Last Update -->
            <div
              class="col-span-2 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400 pr-2"
            >
              <span>{formatDate(file.data?.updatedDate || file.data?.pubDate)}</span>
              <button
                on:click|stopPropagation
                class="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition opacity-0 group-hover:opacity-100"
                aria-label="Opciones de archivo"
              >
                <div class="i-ph-dots-three-vertical font-bold"></div>
              </button>
            </div>
          </div>
        {/each}

        {#if filteredFiles.length === 0}
          <div
            class="p-12 text-center flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400"
          >
            <div class="i-ph-magnifying-glass text-4xl mb-4 opacity-50"></div>
            <p class="text-sm">No se encontraron archivos en esta colección.</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
