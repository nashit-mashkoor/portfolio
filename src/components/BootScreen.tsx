import { useEffect, useRef, useState } from "react";

interface BootLine {
  text: string;
  delay: number; // ms after previous line
}

const BOOT_LINES: BootLine[] = [
  { text: "nashit/os v1.0.0 — bios handshake [placeholder build]", delay: 120 },
  { text: "mem check: 640K conventional memory .......... OK", delay: 140 },
  { text: "mem check: infinite curiosity ............... OK", delay: 120 },
  { text: "loading identity.module ..................... OK", delay: 150 },
  { text: "loading projects.db [8 records] ............. OK", delay: 140 },
  { text: "loading skills.manifest ..................... OK", delay: 130 },
  { text: "loading phosphor.display .................... OK", delay: 150 },
  { text: "mounting /dev/creativity .................... OK", delay: 130 },
  { text: "starting portfolio shell .................... DONE", delay: 160 },
];

const PROGRESS_MS = 520; // percent ticker duration after the log
const READY_PAUSE_MS = 850; // linger on "ready" before auto-continue

interface BootScreenProps {
  reduced: boolean;
  onDone: () => void;
}

export function BootScreen({ reduced, onDone }: BootScreenProps) {
  const [shown, setShown] = useState(() => (reduced ? BOOT_LINES.length : 0));
  const [percent, setPercent] = useState<number | null>(() => (reduced ? 100 : null));
  const doneRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    timersRef.current.forEach((t) => window.clearTimeout(t));
    onDone();
  };

  useEffect(() => {
    const timers = timersRef.current;
    if (reduced) {
      timers.push(window.setTimeout(finish, 600));
    } else {
      if (shown === 0) {
        let acc = 220;
        BOOT_LINES.forEach((line, i) => {
          acc += line.delay;
          timers.push(window.setTimeout(() => setShown(i + 1), acc));
        });
        // percent ticker after the log lines
        const tickStart = acc + 120;
        const steps = 20;
        for (let i = 1; i <= steps; i++) {
          timers.push(
            window.setTimeout(
              () => setPercent(Math.round((i / steps) * 100)),
              tickStart + (i * PROGRESS_MS) / steps,
            ),
          );
        }
        timers.push(window.setTimeout(finish, tickStart + PROGRESS_MS + READY_PAUSE_MS));
      }
    }

    const skip = (e: Event) => {
      // swallow the skipping keypress/click so it doesn't type into the prompt
      e.preventDefault();
      finish();
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const ready = percent !== null;

  return (
    <div className="boot" aria-label="boot sequence">
      <div className="boot-head">
        NASHIT/OS <span className="dim">// PERSONAL TERMINAL</span> v1.0.0
      </div>
      <div className="boot-lines">
        {BOOT_LINES.slice(0, shown).map((l) => (
          <div key={l.text} className="boot-line">
            {l.text}
          </div>
        ))}
        {ready && (
          <div className="boot-line ok">portfolio v1.0 ready — {percent}%</div>
        )}
        {!ready && <span className="boot-caret" aria-hidden="true" />}
      </div>
      <div className="boot-skip dim">press any key to skip</div>
    </div>
  );
}
