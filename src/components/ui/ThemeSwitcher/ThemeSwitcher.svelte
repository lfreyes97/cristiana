<script lang="ts">
  import ThemeSwitcherDropdown from "./ThemeSwitcherDropdown.svelte";
  import ThemeSwitcherDrawer from "./ThemeSwitcherDrawer.svelte";

  /**
   * variant — selects the display mode:
   *   "dropdown" (default) — floating panel below the trigger button
   *   "drawer"             — full-height side panel sliding from the right
   */
  export let variant: "dropdown" | "drawer" = "dropdown";
</script>

{#if variant === "drawer"}
  <ThemeSwitcherDrawer />
{:else}
  <ThemeSwitcherDropdown />
{/if}
