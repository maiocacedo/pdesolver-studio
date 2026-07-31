import { describe, it, expect } from "vitest";
import { toPayload, type SystemConfig } from "./store";
import { payloadToSystemConfig } from "./payload";
import { heatPreset } from "../gallery/examples";

const config2D: SystemConfig = {
  pdes: [
    {
      id: "pde-1",
      name: "u",
      func: "u",
      eq: "du/dt = d2u/dx2 + d2u/dy2",
      ic: "sin(pi*x)*sin(pi*y)",
      west: { type: "Dirichlet", expr: "0" },
      east: { type: "Dirichlet", expr: "0" },
      north: { type: "Neumann", expr: "1" },
      south: { type: "Dirichlet", expr: "0" },
    },
  ],
  activePdeId: "pde-1",
  domain: { xmin: "0", xmax: "1", t0: "0", tf: "0.5", ymin: "0", ymax: "2" },
  mesh: { nx: 21, ny: 31, nt: 100 },
  scheme: { disc: "central", time: "CN" },
};

describe("payload round-trip", () => {
  it("preserves a 1D config through toPayload -> payloadToSystemConfig", () => {
    const cfg = heatPreset();
    const restored = payloadToSystemConfig(toPayload(cfg));
    expect(restored).toEqual(cfg);
  });

  it("preserves a 2D config, including y-domain, ny and north/south BCs", () => {
    const restored = payloadToSystemConfig(toPayload(config2D));
    expect(restored).toEqual(config2D);
  });

  it("maps disc_n length to 1D vs 2D correctly", () => {
    expect(toPayload(heatPreset()).disc_n).toEqual([50]);
    expect(toPayload(config2D).disc_n).toEqual([21, 31]);
  });
});

describe("payloadToSystemConfig", () => {
  it("generates an id and activePdeId when the payload omits ids", () => {
    const payload = toPayload(heatPreset());
    delete (payload.pdes[0] as { id?: string }).id;
    const cfg = payloadToSystemConfig(payload);
    expect(cfg.pdes[0].id).toBeTruthy();
    expect(cfg.activePdeId).toBe(cfg.pdes[0].id);
  });

  it("defaults north/south BCs when a 2D payload omits them", () => {
    const payload = toPayload(config2D);
    delete (payload.pdes[0] as unknown as Record<string, unknown>).north_bd;
    delete (payload.pdes[0] as unknown as Record<string, unknown>).north_func_bd;
    const cfg = payloadToSystemConfig(payload);
    expect(cfg.pdes[0].north).toEqual({ type: "Dirichlet", expr: "0" });
  });
});
