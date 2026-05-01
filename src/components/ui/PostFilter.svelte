<script>
  export let posts = [];

  let searchTerm = "";
  let selectedCategory = "Todas";

  $: categories = ["Todas", ...new Set(posts.map((p) => p.category))];

  $: filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todas" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
</script>

<div class="flex flex-col md:flex-row gap-4 mb-8">
  <div class="relative flex-grow">
    <div
      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
    >
      <div class="i-ph-magnifying-glass text-slate-400 text-lg"></div>
    </div>
    <input
      type="text"
      bind:value={searchTerm}
      placeholder="Buscar ensayos..."
      class="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent bg-white text-slate-900 shadow-sm transition-shadow"
    />
  </div>

  <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0">
    {#each categories as category}
      <button
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap border border-slate-200 {selectedCategory ===
        category
          ? 'bg-secondary text-white border-secondary'
          : 'bg-white text-slate-600 hover:bg-slate-50'}"
        on:click={() => (selectedCategory = category)}
      >
        {category}
      </button>
    {/each}
  </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
  {#if filteredPosts.length === 0}
    <div class="col-span-full py-12 text-center text-slate-500">
      <div class="i-ph-file-search text-4xl mb-2 mx-auto opacity-50"></div>
      <p>No se encontraron ensayos que coincidan con tu búsqueda.</p>
    </div>
  {/if}

  {#each filteredPosts as post}
    <article
      class="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:border-secondary/40 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group relative flex flex-col h-full"
    >
      <div
        class="absolute top-6 right-6 text-slate-100 group-hover:text-secondary/10 transition-colors"
      >
        <div class="{post.icon} text-5xl"></div>
      </div>
      <div class="flex justify-between items-center mb-2">
        <span class="text-xs font-bold text-secondary uppercase tracking-wider"
          >{post.category}</span
        >
      </div>
      <h3
        class="text-lg font-heading font-bold text-slate-900 mb-2 group-hover:text-secondary transition-colors"
      >
        <a href={`/blog/${post.slug}`} class="focus:outline-none">
          <span class="absolute inset-0" aria-hidden="true"></span>
          {post.title}
        </a>
      </h3>
      <p class="text-slate-600 text-sm mb-4 line-clamp-2 flex-grow">
        {post.excerpt}
      </p>
      <div class="flex items-center gap-4 text-xs text-slate-400 mt-auto">
        <span class="flex items-center gap-1"
          ><div class="i-ph-calendar-blank"></div>
          {post.date}</span
        >
        <span class="flex items-center gap-1"
          ><div class="i-ph-clock"></div>
          {post.readTime}</span
        >
      </div>
    </article>
  {/each}
</div>
