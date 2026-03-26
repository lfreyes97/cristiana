<script lang="ts">
  export let data: Record<string, any> = {};
  export let fieldErrors: Record<string, string> = {};
  export let onChange: (newData: Record<string, any>) => void;

  const editorialStatuses = [
    "draft",
    "review",
    "approved",
    "scheduled",
    "published",
  ];
  const iconOptions = [
    "i-ph-file-text-duotone",
    "i-ph-books-duotone",
    "i-ph-brain-duotone",
    "i-ph-flower-lotus-duotone",
    "i-ph-paint-brush-duotone",
    "i-ph-lightbulb-duotone",
    "i-ph-cross-duotone",
    "i-ph-atom-duotone",
    "i-ph-clock-duotone",
    "i-ph-link-break-duotone",
    "i-ph-prohibit-duotone",
    "i-ph-sparkle-duotone",
    "i-ph-book-open-text",
    "i-ph-book-bookmark",
    "i-ph-scroll",
    "i-ph-quotes",
    "i-ph-article",
    "i-ph-note-pencil",
    "i-ph-warning",
    "i-ph-microphone-stage",
    "i-ph-tag",
    "i-ph-house-duotone",
    "i-ph-compass-rose-duotone",
    "i-ph-star-four",
    "i-ph-circle",
    "i-ph-square",
    "i-ph-drop",
  ];
  let iconSearch = "";

  const updateField = (key: string, value: any) => {
    if ((key === "tags" || key === "categories") && typeof value === "string") {
      const arr = value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      onChange({ ...data, [key]: arr });
      return;
    }

    if (key === "status") {
      const next = { ...data, status: value, draft: value !== "published" };
      if (value !== "scheduled") delete next.publishAt;
      onChange(next);
      return;
    }

    onChange({ ...data, [key]: value });
  };

  const getFieldValue = (key: string) => {
    const val = data[key];
    if (Array.isArray(val)) return val.join(", ");
    if (val instanceof Date) return val.toISOString().split("T")[0];
    return val;
  };

  const addField = () => {
    const key = prompt("Nombre del nuevo campo (ej. author, heroImage):");
    if (key && !data[key]) {
      onChange({ ...data, [key]: "" });
    }
  };

  const removeField = (key: string) => {
    if (confirm(`¿Eliminar el campo "${key}"?`)) {
      const newData = { ...data };
      delete newData[key];
      onChange(newData);
    }
  };

  const updateSeo = (key: string, value: string) => {
    onChange({
      ...data,
      seo: {
        ...(data.seo || {}),
        [key]: value,
      },
    });
  };

  $: safeStatus = editorialStatuses.includes(data.status) ? data.status : "draft";
  $: filteredIconOptions = iconOptions.filter((icon) =>
    icon.toLowerCase().includes(iconSearch.toLowerCase()),
  );
</script>

<div
  class="h-full flex flex-col p-4 bg-zinc-50 dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 overflow-y-auto"
>
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-xs uppercase tracking-wider text-zinc-500 font-bold">
      Metadata
    </h2>
  </div>

  <div class="space-y-4">
    <div class="space-y-1">
      <label
        for="editorial-status"
        class="text-xs font-semibold text-zinc-600 dark:text-zinc-400"
      >
        Estado editorial
      </label>
      <select
        id="editorial-status"
        class="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-sm outline-none focus:border-blue-500 dark:text-zinc-200"
        value={safeStatus}
        on:change={(e) => updateField("status", e.currentTarget.value)}
      >
        {#each editorialStatuses as status}
          <option value={status}>{status}</option>
        {/each}
      </select>
      {#if fieldErrors.status}
        <p class="text-xs text-red-500">{fieldErrors.status}</p>
      {/if}
    </div>

    {#if safeStatus === "scheduled"}
      <div class="space-y-1">
        <label
          for="publish-at"
          class="text-xs font-semibold text-zinc-600 dark:text-zinc-400"
        >
          Fecha de publicación
        </label>
        <input
          id="publish-at"
          type="datetime-local"
          class="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-sm outline-none focus:border-blue-500 dark:text-zinc-200"
          value={data.publishAt || ""}
          on:input={(e) => updateField("publishAt", e.currentTarget.value)}
        />
        {#if fieldErrors.publishAt}
          <p class="text-xs text-red-500">{fieldErrors.publishAt}</p>
        {/if}
      </div>
    {/if}

    <div class="space-y-2 rounded border border-zinc-200 dark:border-zinc-800 p-3">
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Icono
        </h3>
        {#if data.icon}
          <button
            class="text-xs text-zinc-500 hover:text-red-500 transition"
            on:click={() => updateField("icon", "")}
            type="button"
          >
            Limpiar
          </button>
        {/if}
      </div>

      <div class="flex items-center gap-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-2">
        <div class={`${data.icon || "i-ph-file-text-duotone"} text-base text-zinc-700 dark:text-zinc-200`}></div>
        <input
          type="text"
          class="w-full bg-transparent text-sm outline-none dark:text-zinc-200"
          placeholder="Buscar icono..."
          bind:value={iconSearch}
        />
      </div>

      <input
        type="text"
        class="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-sm outline-none focus:border-blue-500 dark:text-zinc-200"
        value={data.icon || ""}
        placeholder="Valor icono (ej: i-ph-books-duotone)"
        on:input={(e) => updateField("icon", e.currentTarget.value)}
      />

      <div class="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto pr-1">
        {#each filteredIconOptions as icon}
          <button
            type="button"
            class={`h-9 rounded border text-lg flex items-center justify-center transition ${
              data.icon === icon
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300"
                : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-blue-400"
            }`}
            title={icon}
            on:click={() => updateField("icon", icon)}
          >
            <div class={icon}></div>
          </button>
        {/each}
      </div>
    </div>

    {#each Object.keys(data).filter((key) => !["status", "publishAt", "draft", "seo", "icon"].includes(key)) as key}
      <div class="space-y-1 relative group">
        <label
          class="text-xs font-semibold text-zinc-600 dark:text-zinc-400 capitalize flex justify-between"
        >
          <span>{key}</span>
          <button
            on:click={() => removeField(key)}
            class="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition"
            aria-label="Eliminar campo"
          >
            <div class="i-ph-x"></div>
          </button>
        </label>

        {#if typeof data[key] === "boolean"}
          <label class="flex items-center space-x-2 cursor-pointer">
            <div class="relative">
              <input
                type="checkbox"
                class="sr-only"
                checked={data[key]}
                on:change={(e) => updateField(key, e.currentTarget.checked)}
              />
              <div
                class={`block w-10 h-6 rounded-full transition ${data[key] ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
              ></div>
              <div
                class={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${data[key] ? "translate-x-4" : ""}`}
              ></div>
            </div>
            <span class="text-sm text-zinc-700 dark:text-zinc-300"
              >{data[key] ? "Activado" : "Desactivado"}</span
            >
          </label>
        {:else if key === "date" || key === "pubDate" || key === "updatedDate"}
          <input
            type="date"
            class="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-sm outline-none focus:border-blue-500 dark:text-zinc-200"
            value={getFieldValue(key)}
            on:input={(e) => updateField(key, e.currentTarget.value)}
          />
        {:else if key === "description" || key === "excerpt"}
          <textarea
            class="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-sm outline-none focus:border-blue-500 min-h-[80px] dark:text-zinc-200 resize-y"
            value={getFieldValue(key)}
            on:input={(e) => updateField(key, e.currentTarget.value)}
          ></textarea>
        {:else}
          <input
            type="text"
            class="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-sm outline-none focus:border-blue-500 dark:text-zinc-200"
            value={getFieldValue(key)}
            on:input={(e) => updateField(key, e.currentTarget.value)}
            placeholder={key === "tags" ? "ej. religión, filosofía, arte..." : ""}
          />
        {/if}
        {#if fieldErrors[key]}
          <p class="text-xs text-red-500">{fieldErrors[key]}</p>
        {/if}
      </div>
    {/each}

    <div class="space-y-2 rounded border border-zinc-200 dark:border-zinc-800 p-3">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        SEO
      </h3>
      <input
        type="text"
        placeholder="SEO title"
        class="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-sm outline-none focus:border-blue-500 dark:text-zinc-200"
        value={data.seo?.title || ""}
        on:input={(e) => updateSeo("title", e.currentTarget.value)}
      />
      {#if fieldErrors["seo.title"]}
        <p class="text-xs text-red-500">{fieldErrors["seo.title"]}</p>
      {/if}
      <textarea
        placeholder="SEO description"
        class="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-sm outline-none focus:border-blue-500 min-h-[70px] dark:text-zinc-200 resize-y"
        value={data.seo?.description || ""}
        on:input={(e) => updateSeo("description", e.currentTarget.value)}
      ></textarea>
      {#if fieldErrors["seo.description"]}
        <p class="text-xs text-red-500">{fieldErrors["seo.description"]}</p>
      {/if}
      <input
        type="text"
        placeholder="Canonical URL"
        class="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-sm outline-none focus:border-blue-500 dark:text-zinc-200"
        value={data.seo?.canonical || ""}
        on:input={(e) => updateSeo("canonical", e.currentTarget.value)}
      />
      <input
        type="text"
        placeholder="OG Image URL"
        class="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-sm outline-none focus:border-blue-500 dark:text-zinc-200"
        value={data.seo?.ogImage || ""}
        on:input={(e) => updateSeo("ogImage", e.currentTarget.value)}
      />
    </div>

    {#if Object.keys(data).length === 0}
      <p class="text-sm text-zinc-400 italic">No hay metadatos</p>
    {/if}

    <button
      on:click={addField}
      class="w-full py-2 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-500 rounded text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 transition text-sm flex justify-center items-center space-x-1 mt-4"
    >
      <div class="i-ph-plus"></div>
      <span>Agregar Campo</span>
    </button>
  </div>
</div>
