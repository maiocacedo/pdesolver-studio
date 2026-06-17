import { useEffect, useRef } from "react";
import type { FieldOut } from "../types";
import { colormap, type Palette } from "./colormap";

interface Props {
  field: FieldOut;
  palette?: Palette;
}

export function Heatmap({ field, palette = "viridis" }: Props) {
  const { xs, ts, grid, min, max } = field;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const W = 700, H = 360, padL = 50, padR = 70, padT = 22, padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const nx = xs.length, nt = ts.length;

  const norm = (v: number) => (v - min) / (max - min || 1);
  const xRange: [number, number] = [xs[0], xs[xs.length - 1]];
  const tRange: [number, number] = [ts[0], ts[ts.length - 1]];

  const mapX = (x: number) => padL + ((x - xRange[0]) / (xRange[1] - xRange[0])) * innerW;
  const mapY = (t: number) => padT + ((t - tRange[0]) / (tRange[1] - tRange[0])) * innerH;

  const xT = Array.from({ length: 6 }, (_, i) => xRange[0] + (i / 5) * (xRange[1] - xRange[0]));
  const yT = Array.from({ length: 5 }, (_, i) => tRange[0] + (i / 4) * (tRange[1] - tRange[0]));
  const stops = Array.from({ length: 8 }, (_, i) => i / 7);

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
    const cellH = innerH / nt;

    for (let j = 0; j < nt; j++) {
      const row = grid[j] || [];
      for (let i = 0; i < nx; i++) {
        const v = row[i] ?? 0;
        ctx.fillStyle = colormap(norm(v), palette);
        ctx.fillRect(i * cellW, j * cellH, cellW + 0.5, cellH + 0.5);
      }
    }
  }, [grid, nx, nt, min, max, palette, innerW, innerH]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", display: "block" }}>
      <foreignObject x={padL} y={padT} width={innerW} height={innerH}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </foreignObject>
      <rect x={padL} y={padT} width={innerW} height={innerH} fill="none" stroke="var(--border-strong)" strokeWidth="1" />
      {xT.map((x, i) => (
        <line key={`vx${i}`} x1={mapX(x)} x2={mapX(x)} y1={padT} y2={H - padB} stroke="var(--border-soft)" strokeWidth="1" />
      ))}
      {yT.map((t, i) => (
        <line key={`hy${i}`} x1={padL} x2={W - padR} y1={mapY(t)} y2={mapY(t)} stroke="var(--border-soft)" strokeWidth="1" />
      ))}
      {xT.map((x, i) => (
        <text key={`xl${i}`} x={mapX(x)} y={H - padB + 16} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {x.toFixed(2)}
        </text>
      ))}
      {yT.map((t, i) => (
        <text key={`yl${i}`} x={padL - 8} y={mapY(t) + 3} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {t.toFixed(3)}
        </text>
      ))}
      <text x={(padL + W - padR) / 2} y={H - 6} textAnchor="middle" fontSize="11" fontFamily="var(--font-math)" fontStyle="italic" fill="var(--text-muted)">x</text>
      <text x={14} y={(padT + H - padB) / 2} textAnchor="middle" fontSize="11" fontFamily="var(--font-math)" fontStyle="italic" fill="var(--text-muted)"
            transform={`rotate(-90 14 ${(padT + H - padB) / 2})`}>t</text>
      <g transform={`translate(${W - padR + 18}, ${padT})`}>
        <defs>
          <linearGradient id="cmap-grad" x1="0" y1="0" x2="0" y2="1">
            {stops.map((s) => (
              <stop key={s} offset={`${s * 100}%`} stopColor={colormap(1 - s, palette)} />
            ))}
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="14" height={innerH} fill="url(#cmap-grad)" stroke="var(--border-strong)" />
        <text x="20" y="6" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">{max.toFixed(2)}</text>
        <text x="20" y={innerH + 4} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">{min.toFixed(2)}</text>
        <text x="20" y={innerH / 2 + 4} fontSize="10" fontFamily="var(--font-math)" fontStyle="italic" fill="var(--text-muted)">u</text>
      </g>
    </svg>
  );
}
