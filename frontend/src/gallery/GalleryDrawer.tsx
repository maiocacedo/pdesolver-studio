import { useMemo } from "react";
import { useStore } from "../state/store";
import { Heatmap } from "../viz/Heatmap";
import { PRESETS } from "./examples";
import type { FieldOut } from "../types";

interface Props {
  onClose: () => void;
}

function makeThumb(): FieldOut {
  const nx = 24, nt = 24, tf = 0.1;
  const xs = Array.from({ length: nx }, (_, i) => i / (nx - 1));
  const ts = Array.from({ length: nt }, (_, j) => (tf * j) / (nt - 1));
  const grid = ts.map((t) =>
    xs.map((x) => Math.sin(Math.PI * x) * Math.exp(-Math.PI * Math.PI * t))
  );
  let min = Infinity, max = -Infinity;
  for (const row of grid) for (const v of row) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { xs, ts, grid, min, max };
}

export function GalleryDrawer({ onClose }: Props) {
  const loadPreset = useStore((s) => s.loadPreset);
  const thumb = useMemo(makeThumb, []);

  return (
    <>
      {PRESETS.map((item) => (
        <div key={item.id} className="example-card"
             onClick={() => { loadPreset(item.build()); onClose(); }}>
          <div className="example-thumb">
            <Heatmap field={thumb} />
          </div>
          <div className="example-body">
            <div className="example-title">{item.title}</div>
            <div className="example-eq">{item.eq}</div>
            <div className="example-meta">{item.meta}</div>
          </div>
        </div>
      ))}
      <div style={{ textAlign: "center", padding: 12, color: "var(--text-faint)", fontSize: 12 }}>
        More examples — Burgers, Wave, Advection — coming soon
      </div>
    </>
  );
}
