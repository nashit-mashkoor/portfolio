import { useEffect, useRef, useState } from "react";
import type { Line } from "../types";
import { asciiBanner, bioParagraphs, identity } from "../content";
import { visibleCommandNames } from "../commands";

const CHIPS = [
  "help",
  "about",
  "projects",
  "skills",
  "contact",
  "resume",
  "themes",
  "clear",
] as const;

const PROMPT = "guest@nashit:~$";

interface TerminalViewProps {
  session: string;
  themeName: string;
  lines: Line[];
  status: string | null;
  statusIsError: boolean;
  history: string[];
  commandNamesForCompletion: string[];
  onSubmitCommand: (raw: string) => void;
  onAmbiguousCompletion: (options: string[]) => void;
  onKeypressTick: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  booted: boolean;
  children?: React.ReactNode; // boot screen, shown instead of hero/output
}

function RenderedLine({ line }: { line: Line }) {
  const cls = `ln ln-${line.kind}`;
  if (line.kind === "link" && line.url) {
    return (
      <div className={cls}>
        <a href={line.url} target="_blank" rel="noreferrer">
          {line.text}
        </a>
      </div>
    );
  }
  if (line.kind === "raw") {
    return <pre className={cls}>{line.text}</pre>;
  }
  return <div className={cls}>{line.text || "\u00A0"}</div>;
}

export function TerminalView({
  session,
  themeName,
  lines,
  status,
  statusIsError,
  history,
  commandNamesForCompletion,
  onSubmitCommand,
  onAmbiguousCompletion,
  onKeypressTick,
  inputRef,
  booted,
  children,
}: TerminalViewProps) {
  const [value, setValue] = useState("");
  const [caret, setCaret] = useState(0);
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const syncCaret = () => {
    const el = inputRef.current;
    if (el) setCaret(el.selectionStart ?? el.value.length);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, booted]);

  const focusInput = () => {
    if (booted) inputRef.current?.focus();
  };

  const submit = () => {
    const raw = value;
    setValue("");
    setCaret(0);
    setHistIdx(null);
    onSubmitCommand(raw);
    requestAnimationFrame(focusInput);
  };

  const recall = (dir: -1 | 1) => {
    if (history.length === 0) return;
    let idx = histIdx === null ? history.length : histIdx;
    idx = Math.min(history.length, Math.max(0, idx + dir));
    if (idx === history.length) {
      setHistIdx(null);
      setValue("");
      setCaret(0);
    } else {
      setHistIdx(idx);
      const v = history[idx];
      setValue(v);
      setCaret(v.length);
    }
  };

  const complete = () => {
    const parts = value.split(/\s+/);
    if (parts.length > 1) return;
    const prefix = parts[0].toLowerCase();
    if (!prefix) return;
    const matches = commandNamesForCompletion.filter((c) => c.startsWith(prefix));
    if (matches.length === 1) {
      const v = matches[0] + " ";
      setValue(v);
      setCaret(v.length);
    } else if (matches.length > 1) {
      onAmbiguousCompletion(matches);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      recall(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      recall(1);
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else {
      onKeypressTick();
    }
  };

  const runChip = (cmd: string) => {
    onSubmitCommand(cmd);
    requestAnimationFrame(focusInput);
  };

  return (
    <div className="term-window" onClick={(e) => {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, input")) return;
      focusInput();
    }}>
      <header className="titlebar">
        <div className="dots" aria-hidden="true">
          <span className="dot dot-r" />
          <span className="dot dot-y" />
          <span className="dot dot-g" />
        </div>
        <div className="titlebar-title">
          nashit://portfolio — session {session}
        </div>
        <div className="titlebar-right">
          <span className="dim">{themeName}</span>
          <span className="online">● ONLINE</span>
        </div>
      </header>

      <nav className="chips" aria-label="command shortcuts">
        <span className="chips-label dim">CMD ›</span>
        {CHIPS.map((c) => (
          <button key={c} type="button" className="chip" onClick={() => runChip(c)}>
            {c}
          </button>
        ))}
      </nav>

      <main className="scrollback" ref={scrollRef} role="log" aria-live="polite">
        {!booted && children}
        {booted && (
          <>
            <section className="hero">
              <div className="hero-top">
                <pre className="ascii" aria-hidden="true">
                  {asciiBanner.join("\n")}
                </pre>
                <div className="hero-text">
                  <div className="tagline dim">{identity.tagline}</div>
                  <h1 className="name">{identity.name}</h1>
                  <div className="role dim">{identity.role}</div>
                  <div className="status">
                    <span className="ok">STATUS:</span> {identity.status}
                  </div>
                </div>
              </div>
              <div className="hero-bio">
                <p>{bioParagraphs[0]}</p>
              </div>
              <p className="hint">
                type a command or tap one above — <span className="accent">help</span> lists them
                all.
              </p>
            </section>

            <section className="output">
              {lines.map((line) => (
                <RenderedLine key={line.id} line={line} />
              ))}
            </section>
          </>
        )}
      </main>

      {booted && (
        <footer className="prompt-area">
          <div className="statusline">
            {status ? (
              <span className={statusIsError ? "err" : "ok"}>
                {statusIsError ? "✗ " : "✓ "}
                {status}
              </span>
            ) : (
              <span className="dim">ready — {visibleCommandNames().length} commands, type 'help'</span>
            )}
          </div>
          <div className="prompt-row" onClick={focusInput}>
            <label className="prompt-text" htmlFor="term-input">
              {PROMPT}
            </label>
            <span className="mirror" aria-hidden="true">
              <span>{value.slice(0, caret)}</span>
              <span className="cursor">{value[caret] ?? " "}</span>
              <span>{value.slice(caret + 1)}</span>
            </span>
            <input
              id="term-input"
              ref={inputRef}
              className="prompt-real"
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                requestAnimationFrame(syncCaret);
              }}
              onKeyUp={syncCaret}
              onSelect={syncCaret}
              onKeyDown={onKeyDown}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              aria-label="terminal input"
            />
          </div>
        </footer>
      )}
    </div>
  );
}
