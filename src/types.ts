export type LineKind =
  | "cmd" // echoed "guest@host:~$ command"
  | "out" // normal output
  | "dim" // secondary text
  | "ok" // success / accent
  | "err" // error
  | "warn" // warning
  | "heading" // bright section header
  | "link" // clickable
  | "raw"; // preformatted (ascii art)

export interface Line {
  /** runtime-assigned render key (set by the app when enqueued) */
  id?: number;
  kind: LineKind;
  text: string;
  url?: string;
}

export interface CommandResult {
  lines: Line[];
  /** "typed" reveals lines one-by-one; "instant" renders the block at once. */
  effect: "instant" | "typed";
  /** Wipe the scrollback before rendering this result. */
  clear?: boolean;
  /** Status-strip text; defaults to a ✓ line. */
  status?: string;
  /** Marks the result as a failure for status-strip styling. */
  isError?: boolean;
}

export interface CommandContext {
  themeName: string;
  setTheme(name: string): boolean;
  themeNames(): string[];
  crtEnabled: boolean;
  setCrt(on: boolean): void;
  soundEnabled: boolean;
  setSound(on: boolean): void;
  beep(): void;
  buzz(): void;
  session: string;
}

export interface Command {
  name: string;
  description: string;
  usage?: string;
  hidden?: boolean;
  run(args: string[], ctx: CommandContext): CommandResult;
}
