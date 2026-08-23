import type { Command, CommandContext, CommandResult, Line } from "./types";
import {
  asciiBanner,
  bioParagraphs,
  identity,
  projects,
  resume,
  skillGroups,
  socials,
} from "./content";
import { defaultTheme } from "./themes";

const out = (text: string): Line => ({ kind: "out", text });
const dim = (text: string): Line => ({ kind: "dim", text });
const ok = (text: string): Line => ({ kind: "ok", text });
const err = (text: string): Line => ({ kind: "err", text });
const warn = (text: string): Line => ({ kind: "warn", text });
const heading = (text: string): Line => ({ kind: "heading", text });
const link = (text: string, url: string): Line => ({ kind: "link", text, url });

const instant = (lines: Line[], status?: string, isError?: boolean): CommandResult => ({
  lines,
  effect: "instant",
  status,
  isError,
});

const typed = (lines: Line[], status?: string, isError?: boolean): CommandResult => ({
  lines,
  effect: "typed",
  status,
  isError,
});

const pad = (s: string, width: number): string => s.padEnd(width, " ");

const bar = (level: number, width = 10): string =>
  "█".repeat(level) + "░".repeat(Math.max(0, width - level));

// --------------------------------------------------------------------------- commands

const helpCommand: Command = {
  name: "help",
  description: "list available commands",
  run: (_args, ctx) => {
    const lines: Line[] = [heading("available commands"), dim("")];
    lines.push(
      ...registry
        .filter((c) => !c.hidden)
        .map((c) => {
          const usage = c.usage ? ` ${c.usage}` : "";
          return out(`${pad(c.name + usage, 18)} ${c.description}`);
        }),
    );
    lines.push(dim(""));
    lines.push(
      dim(`tips: ↑/↓ recall history · Tab completes · theme is currently '${ctx.themeName}'`),
    );
    return instant(lines, `help — ${registry.filter((c) => !c.hidden).length} commands`);
  },
};

const aboutCommand: Command = {
  name: "about",
  description: "who I am & what I do",
  run: () => {
    const lines: Line[] = [
      heading(`${identity.name} — about`),
      out(bioParagraphs[0]),
      out(""),
      out(bioParagraphs[1]),
      out(""),
      out(`${pad("location", 12)} ${identity.location}`),
      out(`${pad("role", 12)} ${identity.role}`),
      out(`${pad("status", 12)} ${identity.status}`),
      out(""),
      dim("elsewhere on the wire:"),
      ...socials.map((s) => out(`  ${pad(s.label, 10)} ${s.handle}  ${s.url}`)),
    ];
    return typed(lines, "about — loaded");
  },
};

const projectsCommand: Command = {
  name: "projects",
  description: "selected work (fictional samples)",
  run: () => {
    const lines: Line[] = [
      heading("projects"),
      dim(`${pad("id", 16)}${pad("title", 16)}${pad("category", 12)}year`),
      dim(""),
      ...projects.map(
        (p) => out(`${pad(p.id, 16)}${pad(p.title, 16)}${pad(p.category, 12)}${p.year}`),
      ),
      dim(""),
      dim("run 'project <id>' for details — e.g. project quantum-cart"),
    ];
    return instant(lines, `projects — ${projects.length} records`);
  },
};

const projectCommand: Command = {
  name: "project",
  usage: "<id>",
  description: "detail view for one project",
  run: (args) => {
    if (args.length === 0) {
      return instant(
        [
          err("usage: project <id>"),
          dim(`known ids: ${projects.map((p) => p.id).join(", ")}`),
        ],
        "project — missing id",
        true,
      );
    }
    const id = args[0].toLowerCase();
    const p = projects.find((pr) => pr.id === id);
    if (!p) {
      return instant(
        [
          err(`no project named '${args[0]}'`),
          dim(`known ids: ${projects.map((pr) => pr.id).join(", ")}`),
        ],
        `project — unknown id '${args[0]}'`,
        true,
      );
    }
    return instant(
      [
        heading(p.title),
        dim(`${p.category} · ${p.year} · status: ${p.status}`),
        out(""),
        out(p.description),
        out(""),
        dim(`tags: ${p.tags.join(" · ")}`),
        ...p.links.map((l) => out(`  ${pad(l.label, 10)} ${l.url}`)),
      ],
      `project ${p.id} — loaded`,
    );
  },
};

const skillsCommand: Command = {
  name: "skills",
  description: "my toolbox, honestly rated",
  run: () => {
    const lines: Line[] = [heading("skills")];
    for (const g of skillGroups) {
      lines.push(out(""));
      lines.push(dim(`── ${g.group}`));
      for (const s of g.skills) {
        lines.push(out(`  ${pad(s.name, 14)} ${bar(s.level)} ${s.level}/5`));
      }
    }
    lines.push(out(""));
    lines.push(dim("levels are self-reported; dispute resolution via pull request."));
    return typed(lines, "skills — loaded");
  },
};

const contactCommand: Command = {
  name: "contact",
  description: "say hi",
  run: () => {
    const lines: Line[] = [
      heading("contact"),
      out("fastest way to reach me:"),
      ...socials.map((s) => link(`  ${pad(s.label, 10)} ${s.url}`, s.url)),
      out(""),
      dim("response time: [placeholder] within 48 hours, usually faster."),
    ];
    return typed(lines, "contact — channels open");
  },
};

const resumeCommand: Command = {
  name: "resume",
  description: "grab my résumé",
  run: () => {
    return instant(
      [
        warn(resume.note),
        link(`  download: ${resume.url}`, resume.url),
        dim("(placeholder link — a real PDF will land here later)"),
      ],
      "resume — notice printed",
    );
  },
};

const themesCommand: Command = {
  name: "themes",
  description: "list phosphor color schemes",
  run: (_args, ctx) => {
    const lines: Line[] = [
      heading("themes"),
      ...ctx.themeNames().map((n) =>
        n === ctx.themeName ? ok(`  * ${n}   (current)`) : out(`    ${n}`),
      ),
      dim(""),
      dim("switch with: theme <name>"),
    ];
    return instant(lines, "themes — listed");
  },
};

const themeCommand: Command = {
  name: "theme",
  usage: "<name>",
  description: "switch color scheme",
  run: (args, ctx) => {
    if (args.length === 0) {
      return instant(
        [err("usage: theme <name>"), dim(`available: ${ctx.themeNames().join(", ")}`)],
        "theme — missing name",
        true,
      );
    }
    const name = args[0].toLowerCase();
    if (!ctx.setTheme(name)) {
      return instant(
        [err(`unknown theme '${name}'`), dim(`available: ${ctx.themeNames().join(", ")}`)],
        `theme — unknown '${name}'`,
        true,
      );
    }
    ctx.beep();
    return instant([ok(`theme set: ${name}`)], `theme — ${name}`);
  },
};

const crtCommand: Command = {
  name: "crt",
  usage: "[on|off]",
  description: "toggle scanlines & flicker",
  run: (args, ctx) => {
    if (args.length > 0 && args[0].toLowerCase() !== "on" && args[0].toLowerCase() !== "off") {
      return instant(
        [err(`usage: crt [on|off] (got '${args[0]}')`)],
        "crt — bad argument",
        true,
      );
    }
    const on = args.length === 0 ? !ctx.crtEnabled : args[0].toLowerCase() === "on";
    ctx.setCrt(on);
    ctx.beep();
    return instant(
      [ok(`crt effects ${on ? "enabled" : "disabled"}`)],
      `crt — ${on ? "on" : "off"}`,
    );
  },
};

const soundCommand: Command = {
  name: "sound",
  usage: "[on|off]",
  description: "toggle keypress beeps",
  run: (args, ctx) => {
    if (args.length > 0 && args[0].toLowerCase() !== "on" && args[0].toLowerCase() !== "off") {
      return instant(
        [err(`usage: sound [on|off] (got '${args[0]}')`)],
        "sound — bad argument",
        true,
      );
    }
    const on = args.length === 0 ? !ctx.soundEnabled : args[0].toLowerCase() === "on";
    ctx.setSound(on);
    if (on) ctx.beep();
    return instant(
      [ok(`sound ${on ? "enabled" : "disabled"}`)],
      `sound — ${on ? "on" : "off"}`,
    );
  },
};

const clearCommand: Command = {
  name: "clear",
  description: "wipe the scrollback",
  run: () => ({ lines: [], effect: "instant", clear: true, status: "clear — screen wiped" }),
};

const whoamiCommand: Command = {
  name: "whoami",
  description: "check your session identity",
  run: (_args, ctx) => {
    return typed(
      [
        out(`guest (session ${ctx.session})`),
        out("but the real question is: who are ~you~?"),
        dim(`this terminal belongs to ${identity.name} — try 'about'.`),
      ],
      "whoami — guest",
    );
  },
};

const bannerCommand: Command = {
  name: "banner",
  description: "redraw the intro banner",
  hidden: true,
  run: () => typed(introBannerLines(), "banner — redrawn"),
};

// ------------------------------------------------------------------ easter eggs (hidden)

const sudoCommand: Command = {
  name: "sudo",
  description: "",
  hidden: true,
  run: (_args, ctx) => {
    ctx.buzz();
    return typed(
      [
        err(`[sudo] password for guest: ********`),
        err(`Sorry, guest is not in the sudoers file.`),
        dim("This incident will be reported to absolutely no one."),
      ],
      "sudo — nice try",
      true,
    );
  },
};

const rmCommand: Command = {
  name: "rm",
  description: "",
  hidden: true,
  run: (args, ctx) => {
    ctx.buzz();
    const target = args.join(" ");
    if (target.startsWith("-rf") || target.startsWith("-fr")) {
      return typed(
        [
          err(`rm: cannot remove '/': portfolio is load-bearing`),
          dim("Permission denied. The phosphor must flow."),
        ],
        "rm — denied",
        true,
      );
    }
    return instant([err(`rm: missing operand (and missing permission)`)], "rm — denied", true);
  },
};

const exitCommand: Command = {
  name: "exit",
  description: "",
  hidden: true,
  run: (_args, ctx) => {
    ctx.beep();
    return typed(
      [dim("There is no escape. The terminal is a state of mind."), dim("Type 'help' instead.")],
      "exit — denied",
      true,
    );
  },
};

const helloCommand: Command = {
  name: "hello",
  description: "",
  hidden: true,
  run: (_args, ctx) => {
    ctx.beep();
    return typed([ok("Well hello there. Type 'help' to look around.")], "hello — waved back");
  },
};

// --------------------------------------------------------------------------- registry

export const registry: Command[] = [
  helpCommand,
  aboutCommand,
  projectsCommand,
  projectCommand,
  skillsCommand,
  contactCommand,
  resumeCommand,
  themesCommand,
  themeCommand,
  crtCommand,
  soundCommand,
  whoamiCommand,
  clearCommand,
  bannerCommand,
  sudoCommand,
  rmCommand,
  exitCommand,
  helloCommand,
];

const registryByName = new Map(registry.map((c) => [c.name, c]));

export function commandNames(): string[] {
  return registry.map((c) => c.name);
}

export function visibleCommandNames(): string[] {
  return registry.filter((c) => !c.hidden).map((c) => c.name);
}

export function introBannerLines(): Line[] {
  return [
    { kind: "raw", text: asciiBanner.join("\n") },
    out(""),
    { kind: "heading", text: `${identity.name} — terminal portfolio` },
    dim(`${identity.tagline} · v1.0 [placeholder build]`),
    out(""),
    out(`type 'help' to list commands · 'themes' to recolor the phosphor`),
  ];
}

export function executeCommand(input: string, ctx: CommandContext): CommandResult {
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (trimmed === "") return { lines: [], effect: "instant" };
  const parts = trimmed.split(" ");
  const name = parts[0].toLowerCase();
  const args = parts.slice(1);
  const cmd = registryByName.get(name);
  if (!cmd) {
    ctx.buzz();
    return instant(
      [err(`command not found: ${parts[0]} — type 'help'`)],
      `command not found: ${parts[0]}`,
      true,
    );
  }
  return cmd.run(args, ctx);
}

export { defaultTheme };
