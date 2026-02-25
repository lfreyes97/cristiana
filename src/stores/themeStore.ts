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

// Fraunces variable font axes
export const fraunces = writable({ wonk: 0, soft: 0, opsz: 72 });

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

function updateFrauncesDom(wonk: number, soft: number, opsz: number) {
  const root = document.documentElement;
  root.style.setProperty("--fr-wonk", String(wonk));
  root.style.setProperty("--fr-soft", String(soft));
  root.style.setProperty("--fr-opsz", String(opsz));
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

  // Fraunces axes
  const wonk = parseFloat(localStorage.getItem("fr-wonk") || "0");
  const soft = parseFloat(localStorage.getItem("fr-soft") || "0");
  const opsz = parseFloat(localStorage.getItem("fr-opsz") || "72");
  fraunces.set({ wonk, soft, opsz });
  updateFrauncesDom(wonk, soft, opsz);
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

export function setFraunces(wonk: number, soft: number, opsz: number) {
  fraunces.set({ wonk, soft, opsz });
  localStorage.setItem("fr-wonk", String(wonk));
  localStorage.setItem("fr-soft", String(soft));
  localStorage.setItem("fr-opsz", String(opsz));
  updateFrauncesDom(wonk, soft, opsz);
}

// Presets de personalidad tipográfica
export const frauncesPresets = [
  { id: "clasica", label: "Clásica", wonk: 0, soft: 0, opsz: 72 },
  { id: "suave", label: "Suave", wonk: 0, soft: 80, opsz: 72 },
  { id: "traviesa", label: "Traviesa", wonk: 1, soft: 0, opsz: 144 },
  { id: "onírica", label: "Onírica", wonk: 1, soft: 100, opsz: 36 },
];
