import type { FieldOut } from "../types";
import { colormap, type Palette } from "./colormap";

import { Heatmap2D } from "./Heatmap2D";

interface Props {
  field: FieldOut;
  palette?: Palette;
  rot?: number;
  tIndex?: number;
}

export function Surface3D({ field, palette = "viridis", rot = 0.35, tIndex = 0 }: Props) {
  if (field.ys) {
    return <Heatmap2D field={field} tIndex={tIndex} palette={palette} />;
  }

  const { xs, ts, grid, min, max } = field;
  const W = 700, H = 380;
  const cx = W / 2;
  const cy = H * 0.72;

  const stride = Math.max(1, Math.floor(xs.length / 40));
  const xis: number[] = [];
  for (let i = 0; i < xs.length; i += stride) xis.push(i);
  if (xis[xis.length - 1] !== xs.length - 1) xis.push(xs.length - 1);

  const tStride = Math.max(1, Math.floor(ts.length / 30));
  const tis: number[] = [];
  for (let j = 0; j < ts.length; j += tStride) tis.push(j);
  if (tis[tis.length - 1] !== ts.length - 1) tis.push(ts.length - 1);

  const nx = xis.length, nt = tis.length;
  const scale = 220;
  const heightScale = 110;
  const ang = rot;
  const xSpan = xs[xs.length - 1] - xs[0] || 1;
  const tSpan = ts[ts.length - 1] - ts[0] || 1;
  const uRange = max - min || 1;

  const project = (xn: number, tn: number, u: number): [number, number] => {
    const x3 = (xn - 0.5) * scale;
    const z3 = (tn - 0.5) * scale * 0.85;
    const y3 = -((u - min) / uRange) * heightScale;
    const xr = x3 * Math.cos(ang) - z3 * Math.sin(ang);
    const zr = x3 * Math.sin(ang) + z3 * Math.cos(ang);
    return [cx + xr, cy + y3 + zr * 0.45];
  };

  const norm = (v: number) => (v - min) / uRange;

  interface Poly { d: number; pts: [number, number][]; color: string }
  const polys: Poly[] = [];

  let activeNt = 0;
  for (let j = 0; j < nt; j++) {
    if (tis[j] <= tIndex) {
      activeNt = j + 1;
    } else {
      break;
    }
  }

  for (let j = 0; j < activeNt - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const j0 = tis[j], j1 = tis[j + 1];
      const i0 = xis[i], i1 = xis[i + 1];
      const xn0 = (xs[i0] - xs[0]) / xSpan;
      const xn1 = (xs[i1] - xs[0]) / xSpan;
      const tn0 = (ts[j0] - ts[0]) / tSpan;
      const tn1 = (ts[j1] - ts[0]) / tSpan;
      const u00 = grid[j0][i0], u10 = grid[j0][i1];
      const u01 = grid[j1][i0], u11 = grid[j1][i1];
      const pts: [number, number][] = [
        project(xn0, tn0, u00), project(xn1, tn0, u10),
        project(xn1, tn1, u11), project(xn0, tn1, u01),
      ];
      const avgU = (u00 + u10 + u01 + u11) / 4;
      polys.push({ d: tn0 + tn1, pts, color: colormap(norm(avgU), palette) });
    }
  }
  polys.sort((a, b) => a.d - b.d);

  const floorPts: [number, number][] = [
    project(0, 0, min), project(1, 0, min), project(1, 1, min), project(0, 1, min),
  ];

  const xLabel = project(1.05, 0, min);
  const tLabel = project(0, 1.07, min);
  const uLabel = project(0, 0, max);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", display: "block" }}>
      <polygon points={floorPts.map((p) => p.join(",")).join(" ")}
               fill="var(--surface-alt)" stroke="var(--border)" strokeWidth="1" />
      {Array.from({ length: 6 }).map((_, k) => {
        const a = k / 5;
        const p1 = project(a, 0, min), p2 = project(a, 1, min);
        const p3 = project(0, a, min), p4 = project(1, a, min);
        return (
          <g key={k}>
            <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke="var(--border)" strokeWidth="0.5" />
            <line x1={p3[0]} y1={p3[1]} x2={p4[0]} y2={p4[1]} stroke="var(--border)" strokeWidth="0.5" />
          </g>
        );
      })}
      {polys.map((p, i) => (
        <polygon key={i} points={p.pts.map((q) => q.join(",")).join(" ")}
                 fill={p.color} stroke={p.color} strokeWidth="0.4" opacity="0.95" />
      ))}
      <text x={xLabel[0]} y={xLabel[1] + 4} fontSize="11" fontFamily="var(--font-math)"
            fontStyle="italic" fill="var(--text-muted)">x</text>
      <text x={tLabel[0] - 6} y={tLabel[1] + 4} fontSize="11" fontFamily="var(--font-math)"
            fontStyle="italic" fill="var(--text-muted)">t</text>
      <text x={uLabel[0] - 12} y={uLabel[1]} fontSize="11" fontFamily="var(--font-math)"
            fontStyle="italic" fill="var(--text-muted)">u</text>
    </svg>
  );
}
