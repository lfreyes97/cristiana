import { defineConfig } from "astro/config";
import UnoCSS from "@unocss/astro";
import svelte from "@astrojs/svelte";
import mdx from "@astrojs/mdx";

import rehypeTypst from "@myriaddreamin/rehype-typst";
import remarkMath from "remark-math";

// https://astro.build/config
export default defineConfig({
  site: "https://cristianamente.com",
  output: "static",

  integrations: [mdx(), UnoCSS(), svelte()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeTypst],
  },
  vite: {
    ssr: {
      noExternal: ["bits-ui", "@internationalized/date"],
    },
  },
});
