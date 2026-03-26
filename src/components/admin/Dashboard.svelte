<script lang="ts">
  export let files: { path: string; data: any; effectiveStatus?: string }[] = [];
  export let onCreateNew: () => void;
  export let onOpenFile: (filePath: string) => void;
  export let onSelectCollection: (collection: string) => void = () => {};
  export let isDarkMode: boolean = true;
  export let onToggleTheme: () => void = () => {};

  $: totalFiles = files.length;
  $: groupedStats = files.reduce(
    (acc, file) => {
      const parent = file.path.split("/")[0];
      const collection = parent && file.path.includes("/") ? parent : "otros";
      acc[collection] = (acc[collection] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  $: filesByCollection = files.reduce(
    (acc, file) => {
      const parent = file.path.split("/")[0];
      const collection = parent && file.path.includes("/") ? parent : "otros";
      if (!acc[collection]) acc[collection] = [];
      acc[collection].push(file);
      return acc;
    },
    {} as Record<string, { path: string; data: any; effectiveStatus?: string }[]>,
  );

  $: blogCount = groupedStats["blog"] || 0;
  $: collectionsCount = Object.keys(groupedStats).length;
  $: statusStats = files.reduce(
    (acc, file) => {
      const status =
        file.effectiveStatus || (file.data?.draft ? "draft" : "published");
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  $: scheduledInSevenDays = files.filter((file) => {
    if ((file.effectiveStatus || file.data?.status) !== "scheduled") return false;
    const time = new Date(file.data?.publishAt || 0).getTime();
    if (!Number.isFinite(time)) return false;
    const now = Date.now();
    const diff = time - now;
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  let calendarDate = new Date();
  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];
  const pad2 = (n: number) => `${n}`.padStart(2, "0");
  const toDateKey = (d: Date) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const changeMonth = (offset: number) => {
    calendarDate = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth() + offset,
      1,
    );
  };

  $: scheduledItems = files
    .filter((file) => {
      const status = file.effectiveStatus || file.data?.status;
      const time = new Date(file.data?.publishAt || 0).getTime();
      return status === "scheduled" && Number.isFinite(time);
    })
    .sort(
      (a, b) =>
        new Date(a.data?.publishAt || 0).getTime() -
        new Date(b.data?.publishAt || 0).getTime(),
    );

  $: calendarYear = calendarDate.getFullYear();
  $: calendarMonth = calendarDate.getMonth();
  $: calendarLabel = calendarDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  $: daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  $: firstWeekday = (new Date(calendarYear, calendarMonth, 1).getDay() + 6) % 7;
  $: calendarCells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  $: scheduleCountByDay = scheduledItems.reduce(
    (acc, file) => {
      const d = new Date(file.data?.publishAt);
      if (d.getFullYear() !== calendarYear || d.getMonth() !== calendarMonth) {
        return acc;
      }
      const key = toDateKey(d);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  $: bgBase = isDarkMode ? "bg-[#121214]" : "bg-slate-50";
  $: cardBg = isDarkMode
    ? "bg-[#1c1c1e]/70 border-white/5"
    : "bg-white/80 border-slate-200/70";
  $: textTitle = isDarkMode ? "text-white" : "text-slate-900";
  $: textSub = isDarkMode ? "text-zinc-400" : "text-slate-600";
  $: textMuted = isDarkMode ? "text-zinc-500" : "text-slate-500";
</script>

<div class={`h-full w-full overflow-y-auto ${bgBase} transition-colors duration-500`}>
  <div class="max-w-7xl mx-auto p-5 md:p-8 min-h-full">
    <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class={`text-3xl md:text-4xl font-serif tracking-tight ${textTitle} flex items-center gap-3`}>
          Panel de Control
          <span class="px-3 py-1 text-[10px] font-sans tracking-widest uppercase rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">Admin</span>
        </h1>
        <p class={`text-sm mt-1 ${textMuted}`}>Sistema de Gestión de Contenido</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          on:click={onCreateNew}
          class={`px-4 py-2.5 rounded-xl text-sm font-medium border transition ${isDarkMode ? "bg-white text-black border-white hover:bg-zinc-100" : "bg-slate-900 text-white border-slate-900 hover:bg-slate-700"}`}
        >
          Nueva entrada
        </button>
        <button
          on:click={onToggleTheme}
          class={`h-10 w-10 rounded-full border flex items-center justify-center transition ${isDarkMode ? "bg-[#2c2c2e] border-white/10 text-yellow-400 hover:bg-white/10" : "bg-white border-zinc-200 text-indigo-600 hover:bg-indigo-50"}`}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          <div class={`text-xl ${isDarkMode ? "i-ph-moon-stars-fill" : "i-ph-sun-fill"}`}></div>
        </button>
      </div>
    </header>

    <section class="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-5">
      <div class="xl:col-span-4 space-y-5">
        <div class={`rounded-3xl border p-5 ${cardBg}`}>
          <div class="grid grid-cols-2 gap-3">
            <div class={`rounded-2xl p-4 ${isDarkMode ? "bg-indigo-400/20" : "bg-indigo-100"}`}>
              <p class={`text-xs uppercase tracking-wider ${textMuted}`}>Archivos</p>
              <p class={`text-2xl font-semibold mt-1 ${textTitle}`}>{totalFiles}</p>
            </div>
            <div class={`rounded-2xl p-4 ${isDarkMode ? "bg-zinc-900" : "bg-slate-100"}`}>
              <p class={`text-xs uppercase tracking-wider ${textMuted}`}>Colecciones</p>
              <p class={`text-2xl font-semibold mt-1 ${textTitle}`}>{collectionsCount}</p>
            </div>
            <div class={`rounded-2xl p-4 ${isDarkMode ? "bg-zinc-900" : "bg-slate-100"}`}>
              <p class={`text-xs uppercase tracking-wider ${textMuted}`}>Blog</p>
              <p class={`text-2xl font-semibold mt-1 ${textTitle}`}>{blogCount}</p>
            </div>
            <div class={`rounded-2xl p-4 ${isDarkMode ? "bg-zinc-900" : "bg-slate-100"}`}>
              <p class={`text-xs uppercase tracking-wider ${textMuted}`}>Programados (7d)</p>
              <p class={`text-2xl font-semibold mt-1 ${textTitle}`}>{scheduledInSevenDays}</p>
            </div>
          </div>
        </div>

        <div class={`rounded-3xl border p-5 ${cardBg}`}>
          <div class="flex items-center justify-between mb-4">
            <h2 class={`text-base font-semibold ${textTitle}`}>Estados editoriales</h2>
            <div class={`i-ph-check-square ${textMuted}`}></div>
          </div>
          <div class="space-y-2.5">
            {#each ["draft", "review", "approved", "scheduled", "published"] as status}
              <div class="flex items-center justify-between">
                <span class={`text-sm capitalize ${textSub}`}>{status}</span>
                <span class={`text-sm font-semibold ${textTitle}`}>{statusStats[status] || 0}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="xl:col-span-8 space-y-5">
        <div class={`rounded-3xl border p-5 ${cardBg}`}>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class={`text-base font-semibold ${textTitle}`}>Calendario editorial</h2>
              <p class={`text-xs mt-0.5 ${textMuted}`}>Publicaciones programadas por día</p>
            </div>
            <div class="flex items-center gap-2">
              <button
                class={`h-8 w-8 rounded-full border flex items-center justify-center ${isDarkMode ? "border-white/10 hover:bg-white/10" : "border-slate-200 hover:bg-slate-100"}`}
                on:click={() => changeMonth(-1)}
                aria-label="Mes anterior"
              >
                <div class="i-ph-caret-left"></div>
              </button>
              <span class={`text-sm font-semibold capitalize ${textTitle}`}>{calendarLabel}</span>
              <button
                class={`h-8 w-8 rounded-full border flex items-center justify-center ${isDarkMode ? "border-white/10 hover:bg-white/10" : "border-slate-200 hover:bg-slate-100"}`}
                on:click={() => changeMonth(1)}
                aria-label="Mes siguiente"
              >
                <div class="i-ph-caret-right"></div>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-7 gap-2 mb-2">
            {#each weekDays as day}
              <div class={`text-center text-xs font-semibold ${textMuted}`}>{day}</div>
            {/each}
          </div>
          <div class="grid grid-cols-7 gap-2">
            {#each calendarCells as day}
              {#if day === null}
                <div class={`h-12 rounded-lg ${isDarkMode ? "bg-white/[0.02]" : "bg-slate-100/60"}`}></div>
              {:else}
                {@const cellDate = new Date(calendarYear, calendarMonth, day)}
                {@const key = toDateKey(cellDate)}
                {@const count = scheduleCountByDay[key] || 0}
                <div
                  class={`h-12 rounded-lg border p-1.5 flex items-start justify-between ${count > 0 ? (isDarkMode ? "border-indigo-400/30 bg-indigo-500/10" : "border-indigo-300 bg-indigo-50") : (isDarkMode ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-white")}`}
                >
                  <span class={`text-xs ${textSub}`}>{day}</span>
                  {#if count > 0}
                    <span class={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${isDarkMode ? "bg-indigo-400/20 text-indigo-200" : "bg-indigo-100 text-indigo-700"}`}>{count}</span>
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
        </div>

        <div class={`rounded-3xl border p-5 ${isDarkMode ? "bg-[#cabdfd] text-[#1c1340] border-white/20" : "bg-[#1c1340] text-indigo-50 border-transparent"}`}>
          <div class="flex items-center justify-between mb-2">
            <span class={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${isDarkMode ? "bg-white/40" : "bg-white/10"}`}>
              Acción rápida
            </span>
            <div class="i-ph-star-four-fill opacity-50"></div>
          </div>
          <h2 class="text-2xl font-medium leading-tight mb-2">Comienza a redactar ahora mismo</h2>
          <p class="text-sm opacity-85 mb-5 max-w-xl">Crea un archivo limpio listo para revisión, programación o publicación directa.</p>
          <button
            on:click={onCreateNew}
            class={`px-4 py-2.5 rounded-xl text-sm font-medium border inline-flex items-center gap-2 transition ${isDarkMode ? "bg-[#121214] text-white hover:bg-black border-[#303030]" : "bg-white text-indigo-900 hover:bg-slate-50 border-white"}`}
          >
            Escribir entrada
            <div class="i-ph-arrow-right"></div>
          </button>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {#each Object.entries(filesByCollection) as [collection, cFiles]}
        <div class={`rounded-3xl border p-5 ${cardBg}`}>
          <div class="flex items-center justify-between mb-4">
            <h2 class={`text-lg font-medium capitalize ${textTitle}`}>
              {collection}
              <span class={`ml-2 text-xs px-2 py-0.5 rounded-md ${isDarkMode ? "bg-indigo-400/20 text-indigo-200" : "bg-indigo-100 text-indigo-700"}`}>{cFiles.length}</span>
            </h2>
            <button
              on:click={() => onSelectCollection(collection)}
              class={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${isDarkMode ? "bg-[#2c2c2e] text-white border-white/10 hover:bg-white hover:text-black" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-800 hover:text-white"}`}
            >
              Ver todos
            </button>
          </div>

          <div class="space-y-2.5">
            {#each cFiles.slice(0, 3) as file}
              <button
                on:click={() => onOpenFile(file.path)}
                class={`w-full flex items-center p-3 rounded-2xl border text-left transition ${isDarkMode ? "bg-[#121214]/60 border-white/5 hover:border-indigo-400/30" : "bg-white/80 border-slate-200/50 hover:border-indigo-400/50"}`}
              >
                <div class={`w-9 h-9 rounded-xl mr-3 flex items-center justify-center ${isDarkMode ? "bg-zinc-800 text-zinc-300" : "bg-slate-100 text-slate-600"}`}>
                  <div class="i-ph-file-text-fill"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class={`text-sm font-medium truncate ${textTitle}`}>
                    {file.data?.title ||
                      file.path
                        .split("/")
                        .pop()
                        ?.replace(".md", "")
                        ?.replace(".mdx", "")}
                  </p>
                  <p class={`text-xs truncate ${textMuted}`}>{file.path}</p>
                </div>
                <div class={`i-ph-pencil-simple ml-2 ${textMuted}`}></div>
              </button>
            {/each}
            {#if cFiles.length > 3}
              <p class={`text-xs italic text-center pt-1 ${textMuted}`}>Y {cFiles.length - 3} archivos más...</p>
            {/if}
          </div>
        </div>
      {/each}

      {#if Object.keys(filesByCollection).length === 0}
        <div class={`lg:col-span-2 text-center text-sm py-12 rounded-3xl border ${cardBg} ${textMuted}`}>
          Ningún archivo encontrado en las colecciones.
        </div>
      {/if}
    </section>
  </div>
</div>
