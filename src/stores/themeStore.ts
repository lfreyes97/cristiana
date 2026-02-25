import { writable, get } from "svelte/store";

// ── Types ────────────────────────────────────────────────────────
export interface Schema {
  id: string;
  label: string;
  description: string;
}

export interface UIStyle {
  id: string;
  label: string;
  icon: string;
}

// ── Catalog ──────────────────────────────────────────────────────
export const schemas: Schema[] = [
  { id: "paper", label: "Paper", description: "Editorial y cálido" },
  { id: "midnight", label: "Midnight", description: "Oscuro y sofisticado" },
  { id: "tokyo-night", label: "Tokyo", description: "Digital y vibrante" },
  { id: "gruvbox", label: "Gruvbox", description: "Retro y nostálgico" },
  { id: "nord", label: "Nord", description: "Fresco y polar" },
  { id: "pastel", label: "Pastel", description: "Suave y onírico" },
  { id: "earth", label: "Tierras", description: "Natural y cálido" },
  { id: "neutral", label: "Neutral", description: "Tailwind monocromo" },
];

export const uiStyles: UIStyle[] = [
  { id: "modern", label: "Moderno", icon: "i-ph-circle" },
  { id: "brutal", label: "Brutal", icon: "i-ph-square" },
  { id: "glass", label: "Glass", icon: "i-ph-drop" },
  { id: "pop", label: "Pop", icon: "i-ph-star-four" },
];

// ── Stores ───────────────────────────────────────────────────────
export const theme = writable<string>("paper");
export const mode = writable<string>("light");
export const style = writable<string>("modern");

// ── DOM sync ─────────────────────────────────────────────────────
function updateDOM(t: string, m: string, s: string) {
  document.documentElement.dataset.theme = t;
  document.documentElement.dataset.mode = m;
  document.documentElement.dataset.style = s;
  if (m === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

// ── Actions ──────────────────────────────────────────────────────
export function initTheme() {
  const t = localStorage.getItem("theme") || "paper";
  const m = localStorage.getItem("mode") || "light";
  const s = localStorage.getItem("style") || "modern";
  theme.set(t);
  mode.set(m);
  style.set(s);
  updateDOM(t, m, s);
}

export function setSchema(newTheme: string) {
  theme.set(newTheme);
  localStorage.setItem("theme", newTheme);
  updateDOM(newTheme, get(mode), get(style));
}

export function setStyle(newStyle: string) {
  style.set(newStyle);
  localStorage.setItem("style", newStyle);
  updateDOM(get(theme), get(mode), newStyle);
}

export function toggleMode() {
  const next = get(mode) === "light" ? "dark" : "light";
  mode.set(next);
  localStorage.setItem("mode", next);
  updateDOM(get(theme), next, get(style));
}
