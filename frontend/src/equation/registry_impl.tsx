import type { ReactNode } from "react";

export type Axis = "x" | "y" | "z" | "t";

export interface DiffOp {
  key: string;
  api: string;
  glyph: string;
  label: string;
  render: (func: string) => ReactNode;
  axis: Axis;
  order: 0 | 1 | 2 | 3;
}

const Frac = ({ num, den }: { num: ReactNode; den: ReactNode }) => (
  <span className="frac">
    <span className="num-row">{num}</span>
    <span>{den}</span>
  </span>
);

const Var = ({ children }: { children: ReactNode }) => (
  <span className="var">{children}</span>
);

const Partial = () => <span className="partial">∂</span>;

export const TIME_OPS: Record<string, DiffOp> = {
  dt1: {
    key: "dt1",
    api: "duxy/dt",
    glyph: "∂u/∂t",
    label: "First-order in time (parabolic)",
    axis: "t",
    order: 1,
    render: (u) => (
      <Frac
        num={<><Partial /><Var>{u}</Var></>}
        den={<><Partial /><Var>t</Var></>}
      />
    ),
  },
  dt2: {
    key: "dt2",
    api: "d2uxy/dt2",
    glyph: "∂²u/∂t²",
    label: "Second-order in time (hyperbolic)",
    axis: "t",
    order: 2,
    render: (u) => (
      <Frac
        num={<><Partial /><sup>2</sup><Var>{u}</Var></>}
        den={<><Partial /><Var>t</Var><sup>2</sup></>}
      />
    ),
  },
};

export const SPACE_OPS: Record<string, DiffOp> = {
  u: {
    key: "u",
    api: "uxy",
    glyph: "u",
    label: "u (linear)",
    axis: "x",
    order: 0,
    render: (u) => <Var>{u}</Var>,
  },
  dx: {
    key: "dx",
    api: "duxy/dx",
    glyph: "∂u/∂x",
    label: "First derivative in x",
    axis: "x",
    order: 1,
    render: (u) => (
      <Frac
        num={<><Partial /><Var>{u}</Var></>}
        den={<><Partial /><Var>x</Var></>}
      />
    ),
  },
  d2x: {
    key: "d2x",
    api: "d2uxy/dx2",
    glyph: "∂²u/∂x²",
    label: "Second derivative in x",
    axis: "x",
    order: 2,
    render: (u) => (
      <Frac
        num={<><Partial /><sup>2</sup><Var>{u}</Var></>}
        den={<><Partial /><Var>x</Var><sup>2</sup></>}
      />
    ),
  },
  d2y: {
    key: "d2y",
    api: "d2uxy/dy2",
    glyph: "∂²u/∂y²",
    label: "Second derivative in y (2-D problems)",
    axis: "y",
    order: 2,
    render: (u) => (
      <Frac
        num={<><Partial /><sup>2</sup><Var>{u}</Var></>}
        den={<><Partial /><Var>y</Var><sup>2</sup></>}
      />
    ),
  },
};

export function spaceOpsForAxes(axes: Set<Axis>): DiffOp[] {
  return Object.values(SPACE_OPS).filter((op) => axes.has(op.axis));
}
