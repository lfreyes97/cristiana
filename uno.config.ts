import {
  defineConfig,
  presetTypography,
  presetWebFonts,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
  presetWind4,
} from "unocss";

export default defineConfig({
  presets: [
    presetWind4(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      cdn: "https://esm.sh/",
    }),
    presetTypography(),
    presetWebFonts({
      provider: "none",
      fonts: {
        sans: "Urbanist",
        serif: "EB Garamond",
        display: "Fraunces Variable",
        mono: "Iosevka",
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      bg: "var(--color-bg)",
      "bg-offset": "var(--color-bg-offset)",
      text: "var(--color-text)",
      "text-muted": "var(--color-text-muted)",
      primary: "var(--color-primary)",
      "primary-dark": "var(--color-primary-dark)",
      secondary: "var(--color-secondary)",
      "secondary-light": "var(--color-secondary-light)",
      accent: "var(--color-accent)",
      border: "var(--color-border)",
      "border-subtle": "var(--color-border-subtle)",
      surface: "var(--color-surface)",
    },
  },
  shortcuts: [
    [
      "btn",
      "px-6 py-2.5 rounded-[var(--radius-md)] inline-flex items-center justify-center gap-2 bg-primary text-bg font-medium text-sm tracking-wide cursor-pointer hover:opacity-90 active:scale-95 transition-all duration-200 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
    ],
    [
      "btn-secondary",
      "px-6 py-2.5 rounded-[var(--radius-md)] inline-flex items-center justify-center gap-2 bg-secondary text-white font-medium text-sm tracking-wide cursor-pointer hover:bg-secondary-light active:scale-95 transition-all duration-200 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
    ],
    [
      "btn-outline",
      "px-6 py-2.5 rounded-[var(--radius-md)] inline-flex items-center justify-center gap-2 border border-border-subtle bg-transparent text-text font-medium text-sm tracking-wide hover:border-primary hover:text-primary active:scale-95 transition-all duration-200",
    ],
    [
      "btn-ghost",
      "px-4 py-2 rounded-[var(--radius-md)] inline-flex items-center justify-center gap-2 text-text-muted hover:text-primary hover:bg-bg-offset transition-all duration-200",
    ],
    [
      "card",
      "bg-surface border border-border-subtle p-6 rounded-[var(--radius-lg)] hover:shadow-[var(--shadow-md)] transition-all duration-300",
    ],
    ["wrapper", "max-w-6xl mx-auto px-6 sm:px-8 lg:px-12"],
    ["text-display", "font-serif font-bold tracking-tight"],
    ["text-body", "font-sans text-lg leading-relaxed"],
  ],
});
