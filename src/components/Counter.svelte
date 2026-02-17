<script lang="ts">
    let count = 0;
</script>

<div
    class="flex items-center gap-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 my-8"
>
    <button
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        on:click={() => (count += 1)}
    >
        Incrementar
    </button>
    <span class="text-xl font-bold">
        Contador: {count}
    </span>
</div>
