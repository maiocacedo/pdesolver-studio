import { describe, it, expect } from "vitest";
import { validateSystemConfig, type SystemConfig } from "./store";
import { heatPreset } from "../gallery/examples";

const clone = (): SystemConfig => JSON.parse(JSON.stringify(heatPreset()));

describe("validateSystemConfig", () => {
  it("accepts a valid 1D preset", () => {
    expect(() => validateSystemConfig(heatPreset())).not.toThrow();
  });

  it("rejects an empty initial condition", () => {
    const cfg = clone();
    cfg.pdes[0].ic = "";
    expect(() => validateSystemConfig(cfg)).toThrow(/condição inicial/i);
  });

  it("rejects an empty boundary expression", () => {
    const cfg = clone();
    cfg.pdes[0].west.expr = "  ";
    expect(() => validateSystemConfig(cfg)).toThrow(/Oeste/i);
  });

  it("rejects xmin >= xmax", () => {
    const cfg = clone();
    cfg.domain.xmin = "1";
    cfg.domain.xmax = "0";
    expect(() => validateSystemConfig(cfg)).toThrow(/xmin/i);
  });

  it("rejects a non-numeric domain bound", () => {
    const cfg = clone();
    cfg.domain.xmax = "abc";
    expect(() => validateSystemConfig(cfg)).toThrow(/num[ée]ric/i);
  });

  it("rejects t0 >= tf", () => {
    const cfg = clone();
    cfg.domain.t0 = "1";
    cfg.domain.tf = "0.5";
    expect(() => validateSystemConfig(cfg)).toThrow(/t0/i);
  });

  it("rejects ymin >= ymax for a 2D config", () => {
    const cfg = clone();
    cfg.domain.ymin = "2";
    cfg.domain.ymax = "1";
    cfg.mesh.ny = 21;
    cfg.pdes[0].north = { type: "Dirichlet", expr: "0" };
    cfg.pdes[0].south = { type: "Dirichlet", expr: "0" };
    expect(() => validateSystemConfig(cfg)).toThrow(/ymin/i);
  });
});
