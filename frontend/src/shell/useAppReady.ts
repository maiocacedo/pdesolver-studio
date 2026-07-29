import { useEffect, useState } from "react";

/**
 * Honest-hybrid startup readiness.
 *
 * Waits on *real* signals — web fonts finishing load and the pywebview bridge
 * becoming available — but also enforces a minimum on-screen time so the splash
 * reads as intentional rather than a flash. On the web/dev (no pywebview) the
 * bridge resolves via a short fallback timeout.
 */
export interface AppReady {
  ready: boolean;
  progress: number; // 0–100
  message: string;
}

const MIN_VISIBLE_MS = 1000;
const BRIDGE_FALLBACK_MS = 700;

export function useAppReady(): AppReady {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(8);
  const [message, setMessage] = useState("Inicializando…");

  useEffect(() => {
    let cancelled = false;
    const start = performance.now();

    const bump = (p: number, msg?: string) => {
      if (cancelled) return;
      setProgress((prev) => Math.max(prev, p));
      if (msg) setMessage(msg);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;

    const bridgeReady = new Promise<void>((resolve) => {
      if (w.pywebview?.api) return resolve();
      // pywebview fires this once its API is injected (desktop builds).
      window.addEventListener("pywebviewready", () => resolve(), { once: true });
      // Web/dev: nothing will fire it, so resolve after a short grace period.
      window.setTimeout(resolve, BRIDGE_FALLBACK_MS);
    });

    const fontsReady: Promise<unknown> =
      (document as any).fonts?.ready ?? Promise.resolve();

    bump(20, "Carregando recursos…");

    fontsReady.then(() => bump(55, "Conectando ao solver…"));
    bridgeReady.then(() => bump(85, "Preparando workspace…"));

    Promise.all([fontsReady, bridgeReady]).then(() => {
      if (cancelled) return;
      bump(100);
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - start));
      window.setTimeout(() => {
        if (cancelled) return;
        setMessage("Pronto");
        setReady(true);
      }, wait);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ready, progress, message };
}
