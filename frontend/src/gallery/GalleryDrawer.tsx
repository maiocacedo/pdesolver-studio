import { useMemo, useState, useEffect } from "react";
import { useStore } from "../state/store";
import { Heatmap } from "../viz/Heatmap";
import { PRESETS } from "./examples";
import type { FieldOut } from "../types";
import { useT } from "../i18n/i18n";

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
  const { t } = useT();
  const loadPreset = useStore((s) => s.loadPreset);
  const thumb = useMemo(makeThumb, []);

  const [tab, setTab] = useState<"examples" | "saved">("examples");
  const [saved, setSaved] = useState<any[]>([]);

  useEffect(() => {
    if (tab === "saved") {
      const presets = JSON.parse(localStorage.getItem("pdesolver_user_presets") || "[]");
      setSaved(presets);
    }
  }, [tab]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const presets = saved.filter(p => p.id !== id);
    localStorage.setItem("pdesolver_user_presets", JSON.stringify(presets));
    setSaved(presets);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
        <button 
          style={{ flex: 1, padding: 8, background: "none", border: "none", color: tab === "examples" ? "var(--accent)" : "inherit", borderBottom: tab === "examples" ? "2px solid var(--accent)" : "2px solid transparent", cursor: "pointer", fontWeight: "bold" }}
          onClick={() => setTab("examples")}
        >
          {t("gallery.tab.examples")}
        </button>
        <button 
          style={{ flex: 1, padding: 8, background: "none", border: "none", color: tab === "saved" ? "var(--accent)" : "inherit", borderBottom: tab === "saved" ? "2px solid var(--accent)" : "2px solid transparent", cursor: "pointer", fontWeight: "bold" }}
          onClick={() => setTab("saved")}
        >
          {t("gallery.tab.saved")}
        </button>
      </div>

      <div style={{ overflowY: "auto", flex: 1, paddingRight: 8 }}>
        {tab === "examples" ? (
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
        ) : (
          <>
            {saved.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: "var(--text-faint)" }}>
                {t("gallery.empty")}
              </div>
            ) : (
              saved.map((item) => (
                <div key={item.id} className="example-card"
                     onClick={() => { loadPreset(item.system); onClose(); }}>
                  <div className="example-thumb">
                    <Heatmap field={thumb} />
                  </div>
                  <div className="example-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <div>
                      <div className="example-title">{item.title}</div>
                      <div className="example-meta">{new Date(item.timestamp).toLocaleString()}</div>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, item.id)}
                      style={{ padding: "4px 8px", background: "none", color: "var(--danger, #dc3545)", border: "1px solid var(--danger, #dc3545)", borderRadius: 4, cursor: "pointer" }}
                    >
                      {t("gallery.delete")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
