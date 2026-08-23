// ============================================================================
// Content layer — the ONLY file that needs editing to update site content.
// Every placeholder value is marked with a `// PLACEHOLDER:` comment and the
// user-visible text carries obvious `[placeholder]` markers so a later
// content pass can find and replace them mechanically.
// ============================================================================

export const identity = {
  /** Real value — keep. */
  name: "Nashit Mashkoor",
  // PLACEHOLDER: short tagline shown under the ASCII banner
  tagline: "[placeholder] full-stack developer · terminal dweller",
  // PLACEHOLDER: current role / employer line in the hero
  role: "[placeholder] software engineer @ somewhere",
  // PLACEHOLDER: availability / status line in the hero
  status: "[placeholder] open to interesting problems",
  // PLACEHOLDER: where you are based
  location: "[placeholder] Earth, third rock from the sun",
  // PLACEHOLDER: public contact email (replace with a real address)
  email: "[placeholder] hello@example.com",
} as const;

// PLACEHOLDER: two short bio paragraphs shown by `about` — replace with real copy
export const bioParagraphs: string[] = [
  "[placeholder] I'm Nashit — a developer who enjoys living close to the metal of the web: fast pages, honest error messages, and interfaces that respect the person on the other side. Most days you'll find me turning vague ideas into shipped, measurable things.",
  "[placeholder] Away from the keyboard I collect terminal themes, argue about tabs versus spaces, and go on long walks that are really architecture reviews. This site is a terminal because menus are for restaurants.",
];

// PLACEHOLDER: social links — swap every `#` for a real URL and real handle
export const socials: { label: string; handle: string; url: string }[] = [
  { label: "github", handle: "[placeholder] @nashit", url: "#" },
  { label: "linkedin", handle: "[placeholder] /in/nashit", url: "#" },
  { label: "email", handle: "[placeholder] hello@example.com", url: "#" },
];

// PLACEHOLDER: skill groups — levels are 1..5 and render as block bars
export const skillGroups: { group: string; skills: { name: string; level: number }[] }[] = [
  {
    group: "languages",
    skills: [
      { name: "typescript", level: 4 },
      { name: "python", level: 4 },
      { name: "sql", level: 3 },
      { name: "go", level: 2 },
    ],
  },
  {
    group: "frontend",
    skills: [
      { name: "react", level: 4 },
      { name: "css", level: 4 },
      { name: "vite", level: 3 },
    ],
  },
  {
    group: "backend & data",
    skills: [
      { name: "node", level: 4 },
      { name: "postgres", level: 3 },
      { name: "redis", level: 3 },
    ],
  },
  {
    group: "tooling",
    skills: [
      { name: "git", level: 5 },
      { name: "docker", level: 3 },
      { name: "linux", level: 4 },
    ],
  },
];

export interface Project {
  id: string;
  title: string;
  year: string;
  category: string;
  // PLACEHOLDER: one-line status such as "shipped", "wip", "archived"
  status: string;
  description: string;
  tags: string[];
  // PLACEHOLDER: demo/source links — replace `#` with real URLs
  links: { label: string; url: string }[];
}

// PLACEHOLDER: all projects below are fictional samples — replace with real work
export const projects: Project[] = [
  {
    id: "quantum-cart",
    title: "QuantumCart",
    year: "2026",
    category: "web app",
    status: "[placeholder] shipped",
    description:
      "[placeholder] A demo e-commerce engine with optimistic cart updates, offline-first catalog caching, and a checkout flow that survives a train tunnel. Built to prove that 'fast enough' is a choice, not an accident.",
    tags: ["react", "typescript", "service-worker", "stripe-sandbox"],
    links: [
      { label: "demo", url: "#" },
      { label: "source", url: "#" },
    ],
  },
  {
    id: "pixel-forge",
    title: "PixelForge",
    year: "2025",
    category: "tool",
    status: "[placeholder] wip",
    description:
      "[placeholder] A browser-based sprite editor with onion-skinning, palette locking, and a custom canvas renderer that stays smooth at 4K frames. Keyboard-first, because artists hate menus too.",
    tags: ["canvas", "webgl", "typescript"],
    links: [
      { label: "demo", url: "#" },
      { label: "source", url: "#" },
    ],
  },
  {
    id: "hyperlog",
    title: "HyperLog",
    year: "2025",
    category: "devtools",
    status: "[placeholder] shipped",
    description:
      "[placeholder] A log-tailing dashboard that ingests a million lines without breaking a sweat, with saved queries and a query language that forgives typos. The demo data is 100% synthetic and 100% dramatic.",
    tags: ["go", "clickhouse", "react", "websockets"],
    links: [{ label: "source", url: "#" }],
  },
  {
    id: "meander",
    title: "Meander",
    year: "2024",
    category: "web app",
    status: "[placeholder] archived",
    description:
      "[placeholder] A trip planner that stitches points of interest into walking routes sorted by shade, coffee quality, or both. Sunset feature: arguing with the route optimizer until it agrees with you.",
    tags: ["maps", "routing", "python", "fastapi"],
    links: [{ label: "source", url: "#" }],
  },
  {
    id: "synthwave-fm",
    title: "Synthwave FM",
    year: "2024",
    category: "toy",
    status: "[placeholder] shipped",
    description:
      "[placeholder] A WebAudio synth station in the browser: preset pads, a step sequencer, and just enough reverb to make three notes sound like a decision. Zero audio assets — every sound is synthesized live.",
    tags: ["webaudio", "react", "midi"],
    links: [
      { label: "demo", url: "#" },
      { label: "source", url: "#" },
    ],
  },
  {
    id: "ledger-lantern",
    title: "Ledger Lantern",
    year: "2023",
    category: "web app",
    status: "[placeholder] wip",
    description:
      "[placeholder] Personal finance for people who dislike spreadsheets but trust plain-text files. Local-first ledger with plain-text export and charts that only appear when invited.",
    tags: ["local-first", "sqlite", "wasm"],
    links: [{ label: "source", url: "#" }],
  },
  {
    id: "orbit-desk",
    title: "OrbitDesk",
    year: "2023",
    category: "devtools",
    status: "[placeholder] archived",
    description:
      "[placeholder] A tiny support-desk bot that triages tickets by mood and urgency, then gets out of the way. Its escalation haiku feature remains the peak achievement of this portfolio.",
    tags: ["node", "nlp", "webhooks"],
    links: [{ label: "source", url: "#" }],
  },
  {
    id: "mosaic-cms",
    title: "Mosaic CMS",
    year: "2022",
    category: "library",
    status: "[placeholder] archived",
    description:
      "[placeholder] A headless CMS experiment where content is a git repository and the admin UI is optional. Proved that merge conflicts are a universal constant, even for blog posts.",
    tags: ["git", "markdown", "api"],
    links: [{ label: "source", url: "#" }],
  },
];

// PLACEHOLDER: résumé — replace `#` with the real file URL when published
export const resume = {
  url: "#",
  note: "[placeholder] the real résumé is not published yet",
} as const;

// PLACEHOLDER: ASCII banner shown in the hero (keep lines short & monospace-safe)
export const asciiBanner: string[] = [
  " __  __ ",
  "|  \\/  |",
  "| |\\/| |",
  "|_|  |_|",
];
