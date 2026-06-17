/**
 * Typed bridge to the Python side.
 *
 * In dev (or whenever pywebview isn't present, e.g. a plain `npm run dev` in a
 * browser), every call falls through to `fakeBackend.ts` so the UI stays usable.
 *
 * Every method must declare its types here — the underlying `window.pywebview.api`
 * is `unknown` at the boundary.
 */

import type {
  Environment, PDESPayload, SolveResult,
} from "../types";
import * as fake from "./fakeBackend";

interface PywebviewApi {
  solve: (payload: PDESPayload) => Promise<SolveResult>;
  save_json: (path: string, payload: PDESPayload, result: SolveResult) => Promise<boolean>;
  load_json: (path: string) => Promise<{ payload: PDESPayload; result: SolveResult | null }>;
  open_dialog: () => Promise<string | null>;
  save_dialog: () => Promise<string | null>;
  environment: () => Promise<Environment>;
}

function api(): PywebviewApi | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.pywebview?.api ?? null;
}

export const bridge = {
  isDesktop(): boolean {
    return api() !== null;
  },

  async solve(payload: PDESPayload): Promise<SolveResult> {
    const a = api();
    if (a) return a.solve(payload);

    // Web mode: attempt to call the FastAPI server
    try {
      const host = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? window.location.origin
        : "http://localhost:8000";

      const response = await fetch(`${host}/solve_json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        return await response.json() as SolveResult;
      }
    } catch (e) {
      console.warn("FastAPI solve_json not available, falling back to local JS heat solver.", e);
    }

    return fake.solve(payload);
  },

  async saveJson(path: string, payload: PDESPayload, result: SolveResult): Promise<boolean> {
    return api()?.save_json(path, payload, result) ?? false;
  },

  async loadJson(path: string): Promise<{ payload: PDESPayload; result: SolveResult | null }> {
    const a = api();
    if (!a) return { payload: await fake.placeholderPayload(), result: null };
    return a.load_json(path);
  },

  async openDialog(): Promise<string | null> {
    return api()?.open_dialog() ?? null;
  },

  async saveDialog(): Promise<string | null> {
    return api()?.save_dialog() ?? null;
  },

  async environment(): Promise<Environment> {
    return (
      api()?.environment() ??
      Promise.resolve({
        python: "browser",
        gpu_available: false,
        solvers: ["heat"],
      })
    );
  },
};
