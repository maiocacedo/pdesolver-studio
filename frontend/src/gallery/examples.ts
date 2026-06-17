import type { SystemConfig } from "../state/store";

export interface GalleryItem {
  id: string;
  title: string;
  eq: string;
  meta: string;
  description: string;
  build: () => SystemConfig;
}

export function heatPreset(): SystemConfig {
  return {
    pdes: [
      {
        id: "pde-1",
        name: "u",
        func: "u",
        eq: "du/dt = d2u/dx2",
        ic: "sin(pi*x)",
        west: { type: "Dirichlet", expr: "0" },
        east: { type: "Dirichlet", expr: "0" },
      },
    ],
    activePdeId: "pde-1",
    domain: { xmin: "0", xmax: "1", t0: "0", tf: "0.1" },
    mesh: { nx: 50, nt: 100 },
    scheme: { disc: "central", time: "bdf2" },
  };
}

export const PRESETS: GalleryItem[] = [
  {
    id: "heat-sin",
    title: "Diffusion — sinusoidal IC",
    eq: "∂u/∂t = ∂²u/∂x²",
    meta: "Parabolic · Dirichlet · sin IC",
    description:
      "Classical 1-D heat diffusion on [0, 1] with zero Dirichlet boundaries and a sinusoidal initial profile.",
    build: heatPreset,
  },
  {
    id: "heat-gaussian",
    title: "Diffusion — Gaussian pulse",
    eq: "∂u/∂t = ∂²u/∂x²",
    meta: "Parabolic · Dirichlet · Gaussian IC",
    description:
      "A narrow Gaussian pulse spreads via diffusion. Dirichlet zero boundaries on [0, 1].",
    build: (): SystemConfig => ({
      pdes: [
        {
          id: "pde-1",
          name: "u",
          func: "u",
          eq: "du/dt = d2u/dx2",
          ic: "exp(-200*(x-0.5)**2)",
          west: { type: "Dirichlet", expr: "0" },
          east: { type: "Dirichlet", expr: "0" },
        },
      ],
      activePdeId: "pde-1",
      domain: { xmin: "0", xmax: "1", t0: "0", tf: "0.05" },
      mesh: { nx: 80, nt: 200 },
      scheme: { disc: "central", time: "bdf2" },
    }),
  },
  {
    id: "heat-neumann",
    title: "Diffusion — insulated ends",
    eq: "∂u/∂t = ∂²u/∂x²",
    meta: "Parabolic · Neumann · sin IC",
    description:
      "Zero-flux (insulated) Neumann boundary conditions. The total heat is conserved over time.",
    build: (): SystemConfig => ({
      pdes: [
        {
          id: "pde-1",
          name: "u",
          func: "u",
          eq: "du/dt = d2u/dx2",
          ic: "sin(pi*x)",
          west: { type: "Neumann", expr: "0" },
          east: { type: "Neumann", expr: "0" },
        },
      ],
      activePdeId: "pde-1",
      domain: { xmin: "0", xmax: "1", t0: "0", tf: "0.2" },
      mesh: { nx: 50, nt: 200 },
      scheme: { disc: "central", time: "bdf2" },
    }),
  },
  {
    id: "advection-diffusion",
    title: "Advection-diffusion",
    eq: "∂u/∂t = ∂²u/∂x² − ∂u/∂x",
    meta: "Parabolic · Dirichlet · Gaussian IC",
    description:
      "Gaussian pulse transported and diffused. Combines a first-order convection term with diffusion.",
    build: (): SystemConfig => ({
      pdes: [
        {
          id: "pde-1",
          name: "u",
          func: "u",
          eq: "du/dt = d2u/dx2 - du/dx",
          ic: "exp(-200*(x-0.2)**2)",
          west: { type: "Dirichlet", expr: "0" },
          east: { type: "Dirichlet", expr: "0" },
        },
      ],
      activePdeId: "pde-1",
      domain: { xmin: "0", xmax: "1", t0: "0", tf: "0.1" },
      mesh: { nx: 80, nt: 200 },
      scheme: { disc: "central", time: "CN" },
    }),
  },
  {
    id: "onda-impulso-2d",
    title: "Wave — 2D impulse (F, G)",
    eq: "∂²F/∂t² = C²(∂²F/∂x² + ∂²F/∂y²) + source",
    meta: "Hyperbolic · 2D · coupled · impulse",
    description:
      "2D wave equation with Gaussian impulse at (0.5, 0.5). Split into coupled system: dF/dt = G and dG/dt = C²∇²F + source. C = 10.",
    build: (): SystemConfig => ({
      pdes: [
        {
          id: "pde-1",
          name: "F",
          func: "F",
          eq: "dF/dt = G",
          ic: "0",
          west: { type: "Dirichlet", expr: "0" },
          east: { type: "Dirichlet", expr: "0" },
          north: { type: "Dirichlet", expr: "0" },
          south: { type: "Dirichlet", expr: "0" },
        },
        {
          id: "pde-2",
          name: "G",
          func: "G",
          eq: "dG/dt = 100.0*(d2F/dx2 + d2F/dy2) + -5000.0*exp(-((x-0.5)**2 + (y-0.5)**2)/0.0004)*exp(-(t-0.01)**2/2.5e-05)",
          ic: "0",
          west: { type: "Dirichlet", expr: "0" },
          east: { type: "Dirichlet", expr: "0" },
          north: { type: "Dirichlet", expr: "0" },
          south: { type: "Dirichlet", expr: "0" },
        },
      ],
      activePdeId: "pde-1",
      domain: { xmin: "0", xmax: "1", t0: "0", tf: "2.0", ymin: "0", ymax: "1" },
      mesh: { nx: 21, ny: 21, nt: 2000 },
      scheme: { disc: "central", time: "bdf2" },
    }),
  },
];
