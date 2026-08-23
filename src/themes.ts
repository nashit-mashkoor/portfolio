export interface Theme {
  name: string;
  label: string;
  /** body/background */
  bg: string;
  bgPanel: string;
  border: string;
  fg: string;
  fgDim: string;
  accent: string;
  ok: string;
  warn: string;
  err: string;
  select: string;
  /** subtle phosphor glow for headings (rgba) */
  glow: string;
}

export const themes: Theme[] = [
  {
    name: "phosphor",
    label: "green phosphor",
    bg: "#050b07",
    bgPanel: "#081209",
    border: "#123c1e",
    fg: "#8af7a8",
    fgDim: "#3f7a52",
    accent: "#41ff7d",
    ok: "#41ff7d",
    warn: "#d8ff5e",
    err: "#ff5e5e",
    select: "#0f4020",
    glow: "rgba(65, 255, 125, 0.28)",
  },
  {
    name: "amber",
    label: "amber phosphor",
    bg: "#0b0703",
    bgPanel: "#120b05",
    border: "#4a2f10",
    fg: "#ffcf8f",
    fgDim: "#9a7340",
    accent: "#ffb000",
    ok: "#ffcf5e",
    warn: "#ffe08a",
    err: "#ff6a4a",
    select: "#4a3008",
    glow: "rgba(255, 176, 0, 0.26)",
  },
  {
    name: "ice",
    label: "ice blue",
    bg: "#04080f",
    bgPanel: "#070e1a",
    border: "#14304f",
    fg: "#bfe3ff",
    fgDim: "#5d84a8",
    accent: "#7fd6ff",
    ok: "#7fffd4",
    warn: "#ffe08a",
    err: "#ff7a9e",
    select: "#123a5c",
    glow: "rgba(127, 214, 255, 0.26)",
  },
  {
    name: "paper",
    label: "paper white",
    bg: "#f2efe6",
    bgPanel: "#e9e5d8",
    border: "#c9c2ad",
    fg: "#26251f",
    fgDim: "#6f6a58",
    accent: "#0f6b34",
    ok: "#0f6b34",
    warn: "#8a6d00",
    err: "#b3261e",
    select: "#d8e6cf",
    glow: "rgba(38, 37, 31, 0.08)",
  },
  {
    name: "plasma",
    label: "plasma magenta",
    bg: "#0a0510",
    bgPanel: "#100819",
    border: "#3c1a5c",
    fg: "#f0c8ff",
    fgDim: "#8f6aa8",
    accent: "#e05aff",
    ok: "#8affd4",
    warn: "#ffd45e",
    err: "#ff5e8a",
    select: "#3c1050",
    glow: "rgba(224, 90, 255, 0.26)",
  },
];

export const defaultTheme = "phosphor";

export function isTheme(name: string): boolean {
  return themes.some((t) => t.name === name);
}

export function themeNames(): string[] {
  return themes.map((t) => t.name);
}
