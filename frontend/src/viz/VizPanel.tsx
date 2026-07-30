import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useStore } from "../state/store";
import type { FieldOut } from "../types";
import { Icon } from "../components/Icon";
import { Plot1D } from "./Plot1D";
import { Heatmap } from "./Heatmap";
import { Heatmap2D } from "./Heatmap2D";
import { SolverConsole } from "./SolverConsole";
import { exportContainerImage } from "./exportImage";
import type { Palette } from "./colormap";

// 3D surfaces (and their Three.js dependency) are code-split: the chunk loads
// only when a 3D view is first opened, keeping it out of the initial bundle.
const Surface3D = lazy(() => import("./Surface3D").then((m) => ({ default: m.Surface3D })));
const Surface3DWebGL = lazy(() => import("./Surface3DWebGL").then((m) => ({ default: m.Surface3DWebGL })));

type VizTab = "plot1d" | "heatmap" | "plot3d";

interface Props {
  palette?: Palette;
  tab?: VizTab;
  onTabChange?: (t: VizTab) => void;
  engine3D?: "auto" | "webgl" | "compat";
}

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

const isWebGLSupported = typeof window !== "undefined" ? checkWebGLSupport() : false;

function EmptyState({ solving }: { solving: boolean }) {
  if (solving) {
    return (
      <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", margin: "0 auto 14px",
          border: "2.5px solid var(--accent-faint)", borderTopColor: "var(--accent)",
          animation: "spin 0.7s linear infinite",
        }} />
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Solving…</div>
        <div style={{ fontSize: 12, marginTop: 4, fontFamily: "var(--font-mono)" }}>
          discretize → step → assemble
        </div>
      </div>
    );
  }
  return (
    <div style={{ textAlign: "center", color: "var(--text-faint)", maxWidth: 360 }}>
      <div style={{
        width: 56, height: 56, margin: "0 auto 16px",
        borderRadius: 14, background: "var(--surface-alt)",
        display: "grid", placeItems: "center", color: "var(--accent)",
      }}>
        <Icon.Plot />
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 6 }}>
        Run the solver to see results
      </div>
      <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
        Press <span className="kbd">F5</span> or click{" "}
        <span className="kbd">▶ Run</span> to discretize and integrate.
      </div>
    </div>
  );
}

function Loading3D() {
  return (
    <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", margin: "0 auto 12px",
        border: "2.5px solid var(--accent-faint)", borderTopColor: "var(--accent)",
        animation: "spin 0.7s linear infinite",
      }} />
      <div style={{ fontSize: 12.5 }}>Preparando engine 3D…</div>
    </div>
  );
}

const TABS: Array<{ id: VizTab; label: string; glyph: ReactNode }> = [
  { id: "plot1d", label: "1D profile", glyph: <Icon.Plot /> },
  { id: "heatmap", label: "Heatmap", glyph: <Icon.Heatmap /> },
  { id: "plot3d", label: "Surface 3D", glyph: <Icon.Cube /> },
];

export function VizPanel({ palette = "viridis", tab: tabProp, onTabChange, engine3D = "auto" }: Props) {
  const storeTab = useStore((s) => s.ui.vizTab);
  const setUI = useStore((s) => s.setUI);
  const status = useStore((s) => s.run.status);
  const fields = useStore((s) => s.run.fields);
  const activeFieldIndex = useStore((s) => s.run.activeFieldIndex);

  const layoutMode = useStore((s) => s.ui.layoutMode);
  const maximizedPanel = useStore((s) => s.ui.maximizedPanel);
  const toggleLayoutMode = useStore((s) => s.toggleLayoutMode);
  const toggleMaximizedPanel = useStore((s) => s.toggleMaximizedPanel);
  const runMeta = useStore((s) => s.run.meta);
  const system = useStore((s) => s.system);
  const runError = useStore((s) => s.run.error);
  const lastRunMs = useStore((s) => s.run.lastRunMs);
  const visibleFieldIndices = useStore((s) => s.run.visibleFieldIndices);
  const toggleVisibleField = useStore((s) => s.toggleVisibleField);

  // Approximate-result banner: shown when the in-browser JS fallback produced the
  // current result (no real backend). Reappears on every new approximate solve.
  const [approxDismissed, setApproxDismissed] = useState(false);
  useEffect(() => {
    if (runMeta?.approximate) setApproxDismissed(false);
  }, [runMeta]);

  const exportPanelImage = async (panelId: "plot1d" | "heatmap" | "plot3d") => {
    const container = document.querySelector(`.grid-panel[data-panel="${panelId}"]`)
      ?? document.querySelector(".viz-frame");
    if (!container) return;
    await exportContainerImage(container, `${panelId}.png`);
  };

  // Allow controlled tab from parent (DesktopShell menu) or fall back to store
  const tab: VizTab = tabProp ?? storeTab;
  const setTab = (t: VizTab) => {
    setUI({ vizTab: t });
    onTabChange?.(t);
  };

  const field: FieldOut | null = fields?.[activeFieldIndex] ?? null;
  const is2D = !!field?.ys;
  const isCurrent2D = field ? is2D : (!!system.domain.ymin && system.mesh.ny !== undefined);

  useEffect(() => {
    if (isCurrent2D && tab === "plot1d") {
      setTab("heatmap");
    }
  }, [isCurrent2D, tab]);

  const visiblePanels: Array<"plot1d" | "heatmap" | "plot3d" | "console"> = [];
  if (!is2D) {
    visiblePanels.push("plot1d", "heatmap", "plot3d", "console");
  } else {
    // For 2D fields: heatmap shows u(x,y) slice, plot3d shows surface u(x,y,t)
    visiblePanels.push("heatmap", "plot3d", "console");
  }

  const [tIndex, setTIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [plotMode, setPlotMode] = useState<"snapshots" | "all">("snapshots");

  const useWebGL = engine3D === "webgl" || (engine3D === "auto" && isWebGLSupported);

  const render3DPlot = () => {
    const surface = useWebGL
      ? <Surface3DWebGL field={field!} palette={palette} tIndex={tIndex} />
      : <Surface3D field={field!} palette={palette} tIndex={tIndex} />;
    return <Suspense fallback={<Loading3D />}>{surface}</Suspense>;
  };

  const [recording, setRecording] = useState(false);
  const [recStartStep, setRecStartStep] = useState<number>(1);
  const [recEndStep, setRecEndStep] = useState<number | null>(null);

  useEffect(() => {
    if (fields && fields[activeFieldIndex]) {
      const len = fields[activeFieldIndex].ts.length;
      setRecEndStep(len);
    }
  }, [fields, activeFieldIndex]);

  const startRecording = async () => {
    let canvas: HTMLCanvasElement | null = null;
    if (layoutMode === "tabs") {
      canvas = document.querySelector(".viz-frame canvas") as HTMLCanvasElement;
    } else {
      if (maximizedPanel) {
        canvas = document.querySelector(`.grid-panel[data-panel="${maximizedPanel}"] canvas`) as HTMLCanvasElement;
      }
      if (!canvas) {
        canvas = document.querySelector(".grid-panel[data-panel=\"plot3d\"] canvas") as HTMLCanvasElement 
          || document.querySelector(".grid-panel[data-panel=\"heatmap\"] canvas") as HTMLCanvasElement;
      }
    }

    if (!canvas) {
      alert("No canvas found to record! Video recording is optimized for canvas-based views (Heatmaps, 2D simulation, and 3D surface). Please switch tab/view to record.");
      return;
    }

    setPlaying(false);

    try {
      const stream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : null;
      if (!stream) {
        alert("Canvas recording is not supported in this browser.");
        return;
      }

      const chunks: Blob[] = [];
      let mimeType = "video/webm; codecs=vp9";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm; codecs=vp8";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm";
      }
      const options = MediaRecorder.isTypeSupported(mimeType) ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "simulation_video.webm";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      setRecording(true);
      recorder.start();

      const start = Math.max(0, recStartStep - 1);
      const end = Math.min(field!.ts.length - 1, (recEndStep ?? field!.ts.length) - 1);

      for (let i = start; i <= end; i++) {
        setTIndex(i);
        await new Promise((resolve) => setTimeout(resolve, 80));
      }

      recorder.stop();
    } catch (err) {
      console.error("Recording failed", err);
      alert("Recording failed: " + err);
    } finally {
      setRecording(false);
    }
  };



  const timeRef = useRef(0);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (field) {
      timeRef.current = field.ts[tIndex] ?? field.ts[0];
    }
  }, [tIndex, field]);

  useEffect(() => {
    if (!playing || !field) {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      previousTimeRef.current = null;
      return;
    }

    const t0 = field.ts[0];
    const tf = field.ts[field.ts.length - 1];
    const physicalDuration = tf - t0;
    const playbackDurationSeconds = 6.0 / speed;
    const speedFactor = physicalDuration / playbackDurationSeconds;

    const animate = (realTimeMs: number) => {
      if (previousTimeRef.current !== null) {
        const deltaRealTimeSeconds = (realTimeMs - previousTimeRef.current) / 1000;
        const deltaPhysicalTime = deltaRealTimeSeconds * speedFactor;
        
        let targetPhysicalTime = timeRef.current + deltaPhysicalTime;
        if (targetPhysicalTime >= tf) {
          targetPhysicalTime = t0;
        }
        timeRef.current = targetPhysicalTime;

        const ts = field.ts;
        let closestIdx = 0;
        let minDiff = Infinity;
        for (let i = 0; i < ts.length; i++) {
          const diff = Math.abs(ts[i] - targetPhysicalTime);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = i;
          }
        }
        setTIndex(closestIdx);
      }
      previousTimeRef.current = realTimeMs;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [playing, field, speed]);

  useEffect(() => { setTIndex(0); }, [field]);

  const empty = !field;
  const solving = status === "solving";
  const showSlider = !empty && (
    (layoutMode === "tabs" && (
      (tab === "plot1d" && plotMode !== "all") ||
      tab === "plot3d" ||
      (tab === "heatmap" && is2D)
    )) ||
    (layoutMode === "grid" && (
      maximizedPanel === null ||
      maximizedPanel === "plot1d" ||
      maximizedPanel === "plot3d" ||
      (maximizedPanel === "heatmap" && is2D)
    ))
  );

  const fn = field?.meta?.fieldName ?? "u";
  const frameTitle = empty
    ? "Nothing to plot yet"
    : is2D
      ? tab === "heatmap"
        ? `${fn}(x, y) — t = ${field.ts[tIndex].toFixed(4)}`
        : tab === "plot3d"
          ? `Surface ${fn}(x, y) — t = ${field.ts[tIndex].toFixed(4)}`
          : "Not available for 2D fields"
      : tab === "plot1d"
        ? plotMode === "all" ? `Profiles for ${fn}(x, t)` : `${fn}(x, t = ${field.ts[tIndex].toFixed(4)})`
        : tab === "heatmap" ? `${fn}(x, t) over the (x, t) plane`
        : `Surface ${fn}(x, t) — t = ${field.ts[tIndex].toFixed(4)}`;

  const frameSub = empty
    ? "—"
    : is2D
      ? tab === "heatmap" ? "mode='heatmap2d'" : tab === "plot3d" ? "mode='plot3d'" : "—"
      : tab === "plot1d" ? `mode='plot1d${plotMode === "all" ? "_all" : ""}'`
        : tab === "heatmap" ? "mode='heatmap1d'"
        : "mode='plot3d'";

  const getPanelTitle = (panelId: "plot1d" | "heatmap" | "plot3d" | "console") => {
    switch (panelId) {
      case "plot1d":
        return "1D Profile";
      case "heatmap":
        return is2D ? "Heatmap 2D — u(x,y)" : "Heatmap 1D";
      case "plot3d":
        return is2D ? "Surface 3D — u(x,y,t)" : "Surface 3D";
      case "console":
        return "Solver Statistics & Console";
    }
  };

  const renderFieldSelectors = () => {
    if (!fields || fields.length <= 1) return null;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 12 }}>
        {fields.map((f, idx) => {
          const name = f.meta?.fieldName || `Field ${idx + 1}`;
          const isChecked = visibleFieldIndices.includes(idx);
          return (
            <label key={idx} style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 12,
              fontWeight: 500, color: "var(--text-muted)", cursor: "pointer",
              userSelect: "none"
            }}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleVisibleField(idx)}
                style={{
                  accentColor: "var(--accent)",
                  cursor: "pointer",
                }}
              />
              <span style={{ color: isChecked ? "var(--text)" : "var(--text-faint)" }}>{name}</span>
            </label>
          );
        })}
      </div>
    );
  };

  const renderPanelHeader = (panelId: "plot1d" | "heatmap" | "plot3d" | "console") => {
    const title = getPanelTitle(panelId);
    const isMax = maximizedPanel === panelId;
    return (
      <div className="panel-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="panel-title">{title}</span>
          {panelId === "plot1d" && renderFieldSelectors()}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {panelId !== "console" && (
            <button
              className="panel-action"
              onClick={() => exportPanelImage(panelId as any)}
              title="Export Image"
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <Icon.Export /> Exportar
            </button>
          )}
          <button
            className="panel-action"
            onClick={() => toggleMaximizedPanel(panelId)}
            title={isMax ? "Restore grid layout" : "Maximize panel"}
          >
            {isMax ? "↙ Restore" : "↗ Maximize"}
          </button>
        </div>
      </div>
    );
  };

  const renderPanelBody = (panelId: "plot1d" | "heatmap" | "plot3d" | "console") => {
    if (solving && panelId !== "console") {
      return <EmptyState solving={true} />;
    }
    if (empty && panelId !== "console") {
      return <EmptyState solving={false} />;
    }

    switch (panelId) {
      case "plot1d":
        if (is2D) {
          return (
            <div style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 13 }}>
              Not available for 2D fields
            </div>
          );
        }
        return <Plot1D fields={fields!} visibleFieldIndices={visibleFieldIndices} mode={plotMode} tIndex={tIndex} palette={palette} />;
      case "heatmap":
        if (is2D) {
          return <Heatmap2D field={field!} tIndex={tIndex} palette={palette} />;
        }
        return <Heatmap field={field!} palette={palette} />;
      case "plot3d":
        return render3DPlot();
      case "console":
        return (
          <SolverConsole
            status={status}
            lastRunMs={lastRunMs}
            error={runError}
            meta={runMeta}
            system={system}
          />
        );
    }
  };

  return (
    <>
      {runMeta?.approximate && !approxDismissed && (
        <div className="viz-approx-banner" role="status">
          <span className="viz-approx-icon"><Icon.Alert /></span>
          <span className="viz-approx-text">
            Sem backend real conectado — <b>resultado aproximado</b>. O solver JS reconhece
            apenas alguns perfis de difusão e ignora a EDP e as condições de contorno.
          </span>
          <button
            className="viz-approx-close"
            onClick={() => setApproxDismissed(true)}
            aria-label="Dispensar aviso"
            title="Dispensar"
          >
            <Icon.Close />
          </button>
        </div>
      )}
      <div className="tabs">
        {layoutMode === "tabs" ? (
          TABS.filter((tb) => !(isCurrent2D && tb.id === "plot1d")).map((tb) => (
            <button key={tb.id} className="tab" data-active={tab === tb.id ? "1" : "0"}
                    onClick={() => setTab(tb.id)}>
              <span className="tab-glyph">{tb.glyph}</span>
              {tb.label}
            </button>
          ))
        ) : (
          <div className="tab" data-active="1" style={{ cursor: "default" }}>
            <span className="tab-glyph"><Icon.Gallery /></span>
            Dashboard Grid
          </div>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 12 }}>
          {layoutMode === "tabs" && tab === "plot1d" && !empty && renderFieldSelectors()}
          {layoutMode === "tabs" && tab === "plot1d" && !empty && (
            <div className="seg" style={{ marginRight: 8, marginLeft: 8 }}>
              <button data-active={plotMode === "snapshots" ? "1" : "0"}
                      onClick={() => setPlotMode("snapshots")}>Snapshot</button>
              <button data-active={plotMode === "all" ? "1" : "0"}
                      onClick={() => setPlotMode("all")}>All profiles</button>
            </div>
          )}
          
          <div className="seg">
            <button data-active={layoutMode === "tabs" ? "1" : "0"}
                    onClick={() => {
                      if (layoutMode === "grid") toggleLayoutMode();
                    }}>Tabs View</button>
            <button data-active={layoutMode === "grid" ? "1" : "0"}
                    onClick={() => {
                      if (layoutMode === "tabs") toggleLayoutMode();
                    }}>Grid View</button>
          </div>
        </div>
      </div>

      <div className="viz-stage">
        {layoutMode === "grid" ? (
          maximizedPanel ? (
            <div className="grid-panel" data-panel={maximizedPanel} style={{ width: "100%", height: "100%" }}>
              {renderPanelHeader(maximizedPanel)}
              <div className="panel-body">
                {renderPanelBody(maximizedPanel)}
              </div>
            </div>
          ) : (
            <div className="viz-grid-layout" style={{
              gridTemplateColumns: visiblePanels.length <= 2 ? "1fr 1fr" : "repeat(2, 1fr)",
              gridTemplateRows: visiblePanels.length <= 2 ? "1fr" : "repeat(2, 1fr)"
            }}>
              {visiblePanels.map((panelId) => (
                <div key={panelId} className="grid-panel" data-panel={panelId}>
                  {renderPanelHeader(panelId)}
                  <div className="panel-body">
                    {renderPanelBody(panelId)}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="viz-frame">
            <div className="viz-frame-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className="viz-frame-title">{frameTitle}</span>
                <span className="viz-frame-sub">{frameSub}</span>
              </div>
              {!empty && (
                <button
                  className="panel-action"
                  onClick={() => exportPanelImage(tab)}
                  title="Export Image"
                  style={{ display: "flex", alignItems: "center", gap: 5, height: "fit-content" }}
                >
                  <Icon.Export /> Exportar Gráfico
                </button>
              )}
            </div>
            <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {empty ? (
                <EmptyState solving={solving} />
              ) : is2D ? (
                tab === "heatmap" ? (
                  <Heatmap2D field={field} tIndex={tIndex} palette={palette} />
                ) : tab === "plot3d" ? (
                  render3DPlot()
                ) : (
                  <div style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 13 }}>
                    Not available for 2D fields — switch to Heatmap or Surface 3D
                  </div>
                )
              ) : tab === "plot1d" ? (
                <Plot1D fields={fields!} visibleFieldIndices={visibleFieldIndices} mode={plotMode} tIndex={tIndex} palette={palette} />
              ) : tab === "heatmap" ? (
                <Heatmap field={field} palette={palette} />
              ) : (
                render3DPlot()
              )}
            </div>
          </div>
        )}

        {showSlider && field && (
          <div className="bottom-rail" style={{ padding: 0 }}>
            <div className="time-slider">
              <button className="play" aria-label={playing ? "Pause" : "Play"}
                      disabled={recording}
                      onClick={() => setPlaying(!playing)}>
                {playing ? <Icon.Pause /> : <Icon.Run />}
              </button>
              <select
                value={speed}
                disabled={recording}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="speed-select"
                aria-label="Playback speed"
              >
                <option value="0.25">0.25x</option>
                <option value="0.5">0.5x</option>
                <option value="1">1.0x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2.0x</option>
                <option value="4">4.0x</option>
              </select>
              <div className="label">t = {field.ts[tIndex].toFixed(4)}</div>
              <div className="time-track"
                   onClick={(e) => {
                     if (recording) return; // Prevent clicks during recording
                     const r = e.currentTarget.getBoundingClientRect();
                     const f = (e.clientX - r.left) / r.width;
                     const t0 = field.ts[0];
                     const tf = field.ts[field.ts.length - 1];
                     const targetTime = t0 + f * (tf - t0);
                     
                     let closestIdx = 0;
                     let minDiff = Infinity;
                     for (let i = 0; i < field.ts.length; i++) {
                       const diff = Math.abs(field.ts[i] - targetTime);
                       if (diff < minDiff) {
                         minDiff = diff;
                         closestIdx = i;
                       }
                     }
                     setTIndex(closestIdx);
                   }}>
                {(() => {
                  const t0 = field.ts[0];
                  const tf = field.ts[field.ts.length - 1];
                  const pct = ((field.ts[tIndex] - t0) / Math.max(1e-9, tf - t0)) * 100;
                  return (
                    <>
                      <div className="time-track-fill" style={{ width: `${pct}%` }} />
                      <div className="time-track-thumb" style={{ left: `${pct}%` }} />
                    </>
                  );
                })()}
              </div>
              <div className="label" style={{ textAlign: "left" }}>
                step {tIndex + 1}/{field.ts.length}
              </div>
              <button className="play" aria-label="Reset"
                      disabled={recording}
                      onClick={() => { setTIndex(0); setPlaying(false); }}>
                <Icon.Reset />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 6 }}>
                <span style={{ fontSize: 10, color: "var(--text-faint)" }}>De:</span>
                <input
                  type="number"
                  min="1"
                  max={field.ts.length}
                  value={recStartStep}
                  onChange={(e) => setRecStartStep(Math.max(1, Math.min(field.ts.length, Number(e.target.value) || 1)))}
                  style={{
                    width: 44,
                    height: 22,
                    background: "var(--surface-sunk)",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    color: "var(--text)",
                    fontSize: 10,
                    textAlign: "center",
                    padding: "2px 4px",
                    fontFamily: "var(--font-mono)",
                  }}
                  disabled={recording}
                />
                <span style={{ fontSize: 10, color: "var(--text-faint)" }}>Até:</span>
                <input
                  type="number"
                  min="1"
                  max={field.ts.length}
                  value={recEndStep ?? field.ts.length}
                  onChange={(e) => setRecEndStep(Math.max(1, Math.min(field.ts.length, Number(e.target.value) || field.ts.length)))}
                  style={{
                    width: 44,
                    height: 22,
                    background: "var(--surface-sunk)",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    color: "var(--text)",
                    fontSize: 10,
                    textAlign: "center",
                    padding: "2px 4px",
                    fontFamily: "var(--font-mono)",
                  }}
                  disabled={recording}
                />
              </div>
              <button className="play" aria-label="Record simulation video"
                      onClick={startRecording}
                      disabled={recording}
                      style={{
                        marginLeft: 6,
                        color: recording ? "oklch(0.65 0.25 20)" : "inherit",
                        position: "relative"
                      }}>
                {recording ? (
                  <span style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "oklch(0.65 0.25 20)",
                    boxShadow: "0 0 8px oklch(0.65 0.25 20)"
                  }} />
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}><Icon.Record /> Rec</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
