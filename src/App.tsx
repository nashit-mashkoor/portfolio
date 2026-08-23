import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BootScreen } from "./components/BootScreen";
import { TerminalView } from "./components/TerminalView";
import {
  commandNames,
  executeCommand,
  introBannerLines,
} from "./commands";
import { soundEngine, usePrefersReducedMotion, useStoredBool, useStoredString } from "./hooks";
import { defaultTheme, isTheme, themeNames } from "./themes";
import type { CommandContext, CommandResult, Line } from "./types";

const TYPE_DELAY_MS = 26;
const HEADING_DELAY_MS = 110;

interface Job {
  lines: Line[];
  effect: "instant" | "typed";
}

let lineIdCounter = 0;
const nextLineId = () => ++lineIdCounter;

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function randomSession(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `#NM${n}`;
}

export default function App() {
  const reduced = usePrefersReducedMotion();

  const [booted, setBooted] = useState(false);
  const [themeName, setThemeName] = useStoredString("nm.theme", defaultTheme);
  const [crtEnabled, setCrtEnabled] = useStoredBool("nm.crt", true);
  const [soundEnabled, setSoundEnabled] = useStoredBool("nm.sound", false);

  const [lines, setLines] = useState<Line[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [statusIsError, setStatusIsError] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const queueRef = useRef<Job[]>([]);
  const drainingRef = useRef(false);
  const generationRef = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const session = useMemo(() => randomSession(), []);

  useEffect(() => {
    document.documentElement.dataset.theme = isTheme(themeName) ? themeName : defaultTheme;
  }, [themeName]);

  useEffect(() => {
    soundEngine.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // ---------------------------------------------------------------- reveal queue

  const appendLines = useCallback((newLines: Line[]) => {
    setLines((prev) => [...prev, ...newLines.map((l) => ({ ...l, id: nextLineId() }))]);
  }, []);

  const drain = useCallback(async () => {
    if (drainingRef.current) return;
    drainingRef.current = true;
    const gen = generationRef.current;
    try {
      while (queueRef.current.length > 0) {
        const job = queueRef.current.shift();
        if (!job) break;
        if (job.effect === "instant" || reduced || job.lines.length <= 1) {
          appendLines(job.lines);
          continue;
        }
        for (const line of job.lines) {
          if (gen !== generationRef.current) return; // wiped mid-reveal
          appendLines([line]);
          await sleep(line.kind === "heading" ? HEADING_DELAY_MS : TYPE_DELAY_MS);
        }
      }
    } finally {
      if (gen === generationRef.current) drainingRef.current = false;
    }
  }, [reduced, appendLines]);

  const enqueue = useCallback(
    (res: CommandResult) => {
      if (res.lines.length === 0) return;
      queueRef.current.push({ lines: res.lines, effect: res.effect });
      void drain();
    },
    [drain],
  );

  const wipe = useCallback(() => {
    queueRef.current = [];
    generationRef.current++;
    drainingRef.current = false;
    setLines([]);
  }, []);

  // ---------------------------------------------------------------- command flow

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      const echo: Line = { kind: "cmd", text: trimmed };
      if (trimmed === "") {
        setLines((prev) => [...prev, { ...echo, id: nextLineId() }]);
        return;
      }
      setHistory((prev) => (prev[prev.length - 1] === trimmed ? prev : [...prev, trimmed]));

      const ctx: CommandContext = {
        themeName,
        setTheme: (name) => {
          if (!isTheme(name)) return false;
          setThemeName(name);
          return true;
        },
        themeNames: () => themeNames(),
        crtEnabled,
        setCrt: (on) => setCrtEnabled(on),
        soundEnabled,
        setSound: (on) => setSoundEnabled(on),
        beep: () => soundEngine.beep(),
        buzz: () => soundEngine.buzz(),
        session,
      };

      const res = executeCommand(trimmed, ctx);
      if (res.clear) wipe();
      setLines((prev) => [...prev, { ...echo, id: nextLineId() }]);
      enqueue(res);
      if (res.status) {
        const isError =
          /^(command not found|no project|unknown|usage|rm —|sudo)/.test(res.status) ||
          res.lines.some((l) => l.kind === "err");
        setStatus(res.status);
        setStatusIsError(isError);
      }
    },
    [themeName, setThemeName, crtEnabled, setCrtEnabled, soundEnabled, setSoundEnabled, session, wipe, enqueue],
  );

  const onAmbiguousCompletion = useCallback((options: string[]) => {
    setLines((prev) => [
      ...prev,
      { kind: "dim", text: options.join("   "), id: nextLineId() },
    ]);
  }, []);

  const onBootDone = useCallback(() => {
    setBooted(true);
    enqueue({ lines: introBannerLines(), effect: reduced ? "instant" : "typed" });
    // focus slightly later so the keypress that skipped boot never lands in the input
    window.setTimeout(() => inputRef.current?.focus(), 80);
  }, [enqueue, reduced]);

  // ---------------------------------------------------------------- render

  return (
    <div className={`term-root${crtEnabled ? " crt-on" : " crt-off"}${reduced ? " reduced" : ""}`}>
      <div className="crt-flicker" aria-hidden="true" />
      <div className="crt-scanlines" aria-hidden="true" />
      <div className="crt-vignette" aria-hidden="true" />
      <TerminalView
        session={session}
        themeName={themeName}
        lines={lines}
        status={status}
        statusIsError={statusIsError}
        history={history}
        commandNamesForCompletion={commandNames()}
        onSubmitCommand={runCommand}
        onAmbiguousCompletion={onAmbiguousCompletion}
        onKeypressTick={() => soundEngine.tick()}
        inputRef={inputRef}
        booted={booted}
      >
        <BootScreen reduced={reduced} onDone={onBootDone} />
      </TerminalView>
    </div>
  );
}
