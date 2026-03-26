import { defineConfig } from "astro/config";
import UnoCSS from "@unocss/astro";
import svelte from "@astrojs/svelte";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel";

import rehypeTypst from "@myriaddreamin/rehype-typst";
import remarkMath from "remark-math";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://cristianamente.com",
  output: "server",
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),

  integrations: [mdx(), UnoCSS(), svelte(), sitemap()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeTypst],
  },
  vite: {
    ssr: {
      noExternal: ["bits-ui", "@internationalized/date", /\.svelte$/],
    },
  },
});
