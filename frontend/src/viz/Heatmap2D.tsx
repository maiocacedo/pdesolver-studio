import { useEffect, useRef } from "react";
import type { FieldOut } from "../types";
import { colormap, type Palette } from "./colormap";

interface Props {
  field: FieldOut;
  tIndex: number;
  palette?: Palette;
}

export function Heatmap2D({ field, tIndex, palette = "viridis" }: Props) {
  const { xs, ys, grid, min, max } = field;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!ys) return null;

  const nx = xs.length, ny = ys.length;
  const W = 560, H = 480, padL = 44, padR = 74, padT = 22, padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const snapshot = grid[tIndex] ?? [];
  const norm = (v: number) => (v - min) / (max - min || 1);

  const xT = Array.from({ length: 6 }, (_, i) => xs[0] + (i / 5) * (xs[nx - 1] - xs[0]));
  const yT = Array.from({ length: 5 }, (_, i) => ys[0] + (i / 4) * (ys[ny - 1] - ys[0]));
  const stops = Array.from({ length: 8 }, (_, i) => i / 7);

  const mapX = (x: number) => padL + ((x - xs[0]) / (xs[nx - 1] - xs[0])) * innerW;
  const mapY = (y: number) => padT + (1 - (y - ys[0]) / (ys[ny - 1] - ys[0])) * innerH;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerW * dpr;
    canvas.height = innerH * dpr;
    ctx.scale(dpr, dpr);

    const cellW = innerW / nx;
    const cellH = innerH / ny;

    for (let ix = 0; ix < nx; ix++) {
      for (let iy = 0; iy < ny; iy++) {
        const v = snapshot[ix * ny + iy] ?? 0;
        ctx.fillStyle = colormap(norm(v), palette);
        ctx.fillRect(
          ix * cellW,
          (ny - 1 - iy) * cellH,
          cellW + 0.5,
          cellH + 0.5
        );
      }
    }
  }, [snapshot, nx, ny, min, max, palette, innerW, innerH]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", display: "block" }}>
      <foreignObject x={padL} y={padT} width={innerW} height={innerH}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </foreignObject>
      <rect x={padL} y={padT} width={innerW} height={innerH}
            fill="none" stroke="var(--border-strong)" strokeWidth="1" />
      {xT.map((x, i) => (
        <text key={i} x={mapX(x)} y={H - padB + 16}
              textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {x.toFixed(2)}
        </text>
      ))}
      {yT.map((y, i) => (
        <text key={i} x={padL - 8} y={mapY(y) + 3}
              textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {y.toFixed(2)}
        </text>
      ))}
      <text x={(padL + W - padR) / 2} y={H - 6}
            textAnchor="middle" fontSize="11" fontFamily="var(--font-math)" fontStyle="italic" fill="var(--text-muted)">x</text>
      <text x={14} y={(padT + H - padB) / 2}
            textAnchor="middle" fontSize="11" fontFamily="var(--font-math)" fontStyle="italic" fill="var(--text-muted)"
            transform={`rotate(-90 14 ${(padT + H - padB) / 2})`}>y</text>
      <g transform={`translate(${W - padR + 18}, ${padT})`}>
        <defs>
          <linearGradient id="cmap2d-grad" x1="0" y1="0" x2="0" y2="1">
            {stops.map((s) => (
              <stop key={s} offset={`${s * 100}%`} stopColor={colormap(1 - s, palette)} />
            ))}
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="14" height={innerH}
              fill="url(#cmap2d-grad)" stroke="var(--border-strong)" />
        <text x="20" y="6" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">{max.toFixed(3)}</text>
        <text x="20" y={innerH + 4} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">{min.toFixed(3)}</text>
      </g>
    </svg>
  );
}
