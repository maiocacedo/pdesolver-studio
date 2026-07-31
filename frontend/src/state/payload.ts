/**
 * Payload (de)serialization between the UI-facing `SystemConfig` and the
 * `PDESPayload` wire shape consumed by the Python bridge.
 *
 * `toPayload` lives in `store.ts` (co-located with the mutations that build it);
 * `payloadToSystemConfig` is the inverse, used when importing a saved project.
 * They are the two hand-maintained mappers the review flagged (A2/T1) — kept
 * here so the round-trip can be unit-tested in isolation.
 */
import type { SystemConfig, PDEConfig } from "./store";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function payloadToSystemConfig(payload: any): SystemConfig {
  const is2D = payload.disc_n.length > 1;
  const pdes: PDEConfig[] = payload.pdes.map((p: any) => ({
    id: p.id || `pde-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: p.name || p.func,
    func: p.func,
    eq: p.eq,
    ic: p.expr_ic,
    west: { type: p.west_bd, expr: p.west_func_bd },
    east: { type: p.east_bd, expr: p.east_func_bd },
    ...(is2D && {
      north: { type: p.north_bd || "Dirichlet", expr: p.north_func_bd || "0" },
      south: { type: p.south_bd || "Dirichlet", expr: p.south_func_bd || "0" },
    }),
  }));

  const xBoundary = payload.pdes[0]?.ivar_boundary?.[0] ?? [0, 1];
  const yBoundary = is2D ? (payload.pdes[0]?.ivar_boundary?.[1] ?? [0, 1]) : undefined;

  return {
    pdes,
    activePdeId: pdes[0].id,
    domain: {
      xmin: String(xBoundary[0]),
      xmax: String(xBoundary[1]),
      t0: "0",
      tf: String(payload.solve.tf),
      ...(is2D && {
        ymin: String(yBoundary![0]),
        ymax: String(yBoundary![1]),
      }),
    },
    mesh: {
      nx: payload.disc_n[0],
      nt: payload.solve.nt,
      ...(is2D && {
        ny: payload.disc_n[1],
      }),
    },
    scheme: {
      disc: payload.discretize.method,
      time: payload.solve.method,
    },
  };
}
