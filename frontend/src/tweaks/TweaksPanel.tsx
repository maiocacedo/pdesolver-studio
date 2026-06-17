import { useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { Palette } from "../viz/colormap";

export interface TweakValues {
  accent: string;
  theme: "light" | "dark";
  vizPalette: Palette;
  engine3D: "auto" | "webgl" | "compat";
}

interface Props {
  open: boolean;
  onClose: () => void;
  values: TweakValues;
  onChange: (key: keyof TweakValues, value: string) => void;
}

const ACCENTS = ["indigo", "teal", "violet", "amber"] as const;
const THEMES = ["light", "dark"] as const;
const PALETTES: readonly Palette[] = ["viridis", "cool", "magma"];
const ENGINES = ["auto", "webgl", "compat"] as const;

type SegOption = string;

function Seg<T extends SegOption>({
  value, options, onChange,
}: { value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <div style={{
      display: "flex", background: "var(--surface-sunk)", borderRadius: 8,
      padding: 2, gap: 0, border: "1px solid var(--border-soft)",
    }}>
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)} style={{
          flex: 1, border: 0, borderRadius: 6, padding: "3px 8px",
          fontSize: 11, fontFamily: "inherit", cursor: "default",
          background: value === o ? "var(--surface)" : "transparent",
          boxShadow: value === o ? "var(--shadow-1)" : "none",
          fontWeight: value === o ? 600 : 400,
          color: value === o ? "var(--text)" : "var(--text-muted)",
        }}>
          {o}
        </button>
      ))}
    </div>
  );
}

export function TweaksPanel({ open, onClose, values, onChange }: Props) {
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 16, y: 16 });

  const clamp = useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(16, window.innerWidth - w - 16);
    const maxBottom = Math.max(16, window.innerHeight - h - 16);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(16, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(16, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + "px";
    panel.style.bottom = offsetRef.current.y + "px";
  }, []);

  useEffect(() => {
    if (!open) return;
    clamp();
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
  }, [open, clamp]);

  const onDragStart = (e: React.MouseEvent) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev: MouseEvent) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clamp();
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  if (!open) return null;

  const section = (label: string) => (
    <div style={{
      fontSize: 10, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" as const,
      color: "var(--text-faint)", paddingTop: 10,
    }}>{label}</div>
  );

  const row = (label: string, control: ReactNode) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>{label}</div>
      {control}
    </div>
  );

  return (
    <div ref={dragRef} style={{
      position: "fixed", right: offsetRef.current.x, bottom: offsetRef.current.y,
      zIndex: 9999, width: 240,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      boxShadow: "var(--shadow-3)",
      fontFamily: "var(--font-sans)",
      fontSize: 11.5, color: "var(--text)",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 8px 10px 14px", cursor: "move", userSelect: "none",
        borderBottom: "1px solid var(--border-soft)",
      }} onMouseDown={onDragStart}>
        <b style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".01em" }}>Tweaks</b>
        <button type="button" onClick={onClose} onMouseDown={(e) => e.stopPropagation()}
                style={{
                  appearance: "none", border: 0, background: "transparent",
                  color: "var(--text-muted)", width: 22, height: 22,
                  borderRadius: 6, cursor: "default", fontSize: 13,
                }}>✕</button>
      </div>
      <div style={{ padding: "2px 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {section("Theme")}
        {row("Mode", (
          <Seg<typeof THEMES[number]>
            value={values.theme as typeof THEMES[number]}
            options={THEMES}
            onChange={(v) => onChange("theme", v)}
          />
        ))}
        {row("Accent", (
          <Seg<typeof ACCENTS[number]>
            value={values.accent as typeof ACCENTS[number]}
            options={ACCENTS}
            onChange={(v) => onChange("accent", v)}
          />
        ))}
        {section("Visualization")}
        {row("Colormap", (
          <Seg<Palette>
            value={values.vizPalette}
            options={PALETTES}
            onChange={(v) => onChange("vizPalette", v)}
          />
        ))}
        {row("3D Engine", (
          <Seg<typeof ENGINES[number]>
            value={values.engine3D}
            options={ENGINES}
            onChange={(v) => onChange("engine3D", v)}
          />
        ))}
      </div>
    </div>
  );
}
