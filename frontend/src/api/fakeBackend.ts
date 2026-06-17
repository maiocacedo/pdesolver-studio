/**
 * JS-only fallback that runs the heat-equation analytic solution so the UI is
 * usable without a Python backend. Mirror of the prototype's `Viz.solveHeat`.
 *
 * Delete this file (or stub it to throw) once Phase 3 is complete and the
 * pywebview backend handles all real solving.
 */

import type { FieldOut, PDESPayload, SolveResult } from "../types";

export async function solve(payload: PDESPayload): Promise<SolveResult> {
  // Simulate a moment of "thinking" so the UI's loading state is visible.
  await new Promise((r) => setTimeout(r, 350));

  const nx = payload.disc_n[0] ?? 50;
  const nt = payload.solve.nt;
  const tf = payload.solve.tf;
  const fields: FieldOut[] = payload.pdes.map((pde) => {
    const xmin = pde.ivar_boundary[0]?.[0] ?? 0;
    const xmax = pde.ivar_boundary[0]?.[1] ?? 1;
    const L = xmax - xmin;
    const xs = Array.from({ length: nx }, (_, i) => xmin + (L * i) / (nx - 1));
    const ts = Array.from({ length: nt }, (_, j) => (tf * j) / (nt - 1));

    const ic = pde.expr_ic;
    const icKey: "gauss" | "triangle" | "sin" = ic.includes("exp(-")
      ? "gauss"
      : ic.includes("abs(")
      ? "triangle"
      : "sin";

    const grid = ts.map((t) =>
      xs.map((x) => {
        const xi = (x - xmin) / L;
        if (icKey === "gauss") {
          const sigma2 = 0.005 + 2 * t;
          const norm = Math.sqrt(0.005 / sigma2);
          return norm * Math.exp(-((xi - 0.5) ** 2) / sigma2);
        }
        if (icKey === "triangle") {
          let s = 0;
          for (let n = 1; n <= 7; n += 2) {
            const k = n * Math.PI;
            s +=
              ((8 / (k * k)) * (n % 4 === 1 ? 1 : -1)) *
              Math.sin(k * xi) *
              Math.exp(-k * k * t);
          }
          return s;
        }
        return Math.sin(Math.PI * xi) * Math.exp(-Math.PI * Math.PI * t);
      })
    );

    let min = Infinity;
    let max = -Infinity;
    for (const row of grid) {
      for (const v of row) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    return {
      xs,
      ts,
      grid,
      min,
      max,
      meta: { fieldName: pde.func },
    };
  });

  return {
    fields,
    meta: { converged: true, elapsed_ms: 350, backend: "numpy" },
  };
}

export async function placeholderPayload(): Promise<PDESPayload> {
  return {
    pdes: [],
    disc_n: [50],
    discretize: { method: "central" },
    solve: { method: "bdf2", tf: 0.1, nt: 100 },
  };
}
