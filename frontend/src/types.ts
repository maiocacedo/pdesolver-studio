/**
 * Bridge payloads — single source of truth on the TS side.
 *
 * Must stay in sync with `backend/schema.py`. When you change one, change the
 * other in the same commit and run `python -m mypy backend/` as a sanity check.
 */

export type BCType = "Dirichlet" | "Neumann" | "Robin";
export type DiscMethod = "central" | "forward" | "backward";
export type TimeMethod = "bdf2" | "CN" | "RKF";

export interface BCSpec {
  type: BCType;
  expr: string;
}

/** A single PDE inside a system. */
export interface PDEPayload {
  id: string;
  name: string;
  eq: string;
  func: string;
  sp_var: string[];
  ivar: string[];
  ivar_boundary: Array<[number, number]>;
  expr_ic: string;
  west_bd: BCType;
  west_func_bd: string;
  east_bd: BCType;
  east_func_bd: string;
  // 2-D only
  north_bd?: BCType;
  north_func_bd?: string;
  south_bd?: BCType;
  south_func_bd?: string;
}

export interface DiscretizeSpec {
  method: DiscMethod;
}

export interface SolveSpec {
  method: TimeMethod;
  tf: number;
  nt: number;
}

/** A system of PDEs plus run config. `pdes.length >= 1` always. */
export interface PDESPayload {
  pdes: PDEPayload[];
  disc_n: number[];
  discretize: DiscretizeSpec;
  solve: SolveSpec;
}

export interface FieldOut {
  xs: number[];
  ts: number[];
  ys?: number[];          // present for 2D spatial problems
  grid: number[][];       // [t][x] for 1D; [t][ix*ny + iy] for 2D
  min: number;
  max: number;
  meta?: { fieldName?: string };
}

export interface SolveResult {
  fields: FieldOut[];
  meta: {
    converged: boolean;
    elapsed_ms: number;
    backend: "numpy" | "cupy";
  };
}

export interface Environment {
  python: string;
  gpu_available: boolean;
  solvers: string[];
}
