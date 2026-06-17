import { useCallback, useEffect, useState } from "react";
import { useStore } from "../../state/store";
import { heatPreset } from "../../gallery/examples";
import { Drawer } from "../../components/Drawer";
import { TitleBar } from "./TitleBar";
import { MenuBar, type MenuActions } from "./MenuBar";
import { Toolbar } from "./Toolbar";
import { Inspector } from "./Inspector";
import { StatusBar } from "./StatusBar";
import { AboutModal } from "./AboutModal";
import { ResizableSidebar } from "./ResizableSidebar";
import { Sidebar } from "../../panels/Sidebar";
import { VizPanel } from "../../viz/VizPanel";
import { GalleryDrawer } from "../../gallery/GalleryDrawer";
import { HistoryDrawer } from "../../history/HistoryDrawer";
import { TweaksPanel, type TweakValues } from "../../tweaks/TweaksPanel";
import type { Palette } from "../../viz/colormap";

const DEFAULT_TWEAKS: TweakValues = {
  accent: "indigo",
  theme: "light",
  vizPalette: "viridis",
  engine3D: "auto",
};

export function DesktopShell() {
  const system = useStore((s) => s.system);
  const ui = useStore((s) => s.ui);
  const solve = useStore((s) => s.solve);
  const resetRun = useStore((s) => s.resetRun);
  const setUI = useStore((s) => s.setUI);
  const setScheme = useStore((s) => s.setScheme);
  const loadPreset = useStore((s) => s.loadPreset);

  const [projectPath] = useState("pdesolver studio (em desenvolvimento) — unsaved");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [tweaks, setTweaks] = useState<TweakValues>(DEFAULT_TWEAKS);

  const handleTweakChange = (key: keyof TweakValues, value: string) => {
    setTweaks((prev) => ({ ...prev, [key]: value } as TweakValues));
  };

  useEffect(() => {
    document.documentElement.dataset.density = "compact";
    document.documentElement.dataset.theme = tweaks.theme;
    document.documentElement.dataset.accent = tweaks.accent;
  }, [tweaks.theme, tweaks.accent]);

  const handleRun = useCallback(() => { void solve(); }, [solve]);

  const handleReset = useCallback(() => {
    resetRun();
    setUI({ dirty: false });
  }, [resetRun, setUI]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inField = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (e.key === "F5" && !e.shiftKey) { e.preventDefault(); handleRun(); return; }
      if ((e.ctrlKey || e.metaKey) && !inField) {
        switch (e.key) {
          case "1": e.preventDefault(); setUI({ vizTab: "plot1d" }); break;
          case "2": e.preventDefault(); setUI({ vizTab: "heatmap" }); break;
          case "3": e.preventDefault(); setUI({ vizTab: "plot3d" }); break;
          case "s": e.preventDefault(); setUI({ dirty: false }); break;
          case ",": e.preventDefault(); setTweaksOpen((o) => !o); break;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleRun, setUI]);

  const projectName = system.pdes.map((p) => p.name).join(" + ") + " — heat equation";

  const actions: MenuActions = {
    new: () => { loadPreset(heatPreset()); setUI({ dirty: false }); },
    open: () => setUI({ drawer: "gallery" }),
    save: () => setUI({ dirty: false }),
    saveAs: () => setUI({ dirty: false }),
    importJson: () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target?.result as string);
            const config = data.system || data.payload || data;
            if (config && Array.isArray(config.pdes)) {
              loadPreset(config);
            } else {
              alert("Invalid configuration file format.");
            }
          } catch (err) {
            alert("Error reading file: " + err);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },
    exportJson: () => {
      const sys = useStore.getState().system;
      const jsonString = JSON.stringify(sys, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "pdesolver_config.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    exportPng: () => {
      const canvas = document.querySelector(".viz-stage canvas") as HTMLCanvasElement;
      const svg = document.querySelector(".viz-stage svg") as SVGGraphicsElement;

      const downloadUri = (uri: string, name: string) => {
        const link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      if (canvas) {
        try {
          const dataUrl = canvas.toDataURL("image/png");
          downloadUri(dataUrl, "pde_visualization.png");
        } catch (err) {
          console.error("Failed to export canvas image", err);
        }
      } else if (svg) {
        try {
          const svgString = new XMLSerializer().serializeToString(svg);
          const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
          const blobURL = URL.createObjectURL(svgBlob);
          const image = new Image();
          image.onload = () => {
            const canvas2 = document.createElement("canvas");
            canvas2.width = svg.clientWidth || 800;
            canvas2.height = svg.clientHeight || 500;
            const context = canvas2.getContext("2d");
            if (context) {
              context.fillStyle = "rgba(20, 20, 20, 1)"; // dark background matching studio
              context.fillRect(0, 0, canvas2.width, canvas2.height);
              context.drawImage(image, 0, 0);
            }
            const png = canvas2.toDataURL("image/png");
            downloadUri(png, "pde_plot.png");
            URL.revokeObjectURL(blobURL);
          };
          image.src = blobURL;
        } catch (err) {
          console.error("Failed to export SVG image", err);
        }
      } else {
        alert("No active visualization found to export.");
      }
    },
    exportCsv: () => {
      const fields = useStore.getState().run.fields;
      if (!fields || fields.length === 0) {
        alert("No simulation data available to export. Please run the simulation first.");
        return;
      }
      const firstField = fields[0];
      const nt = firstField.ts.length;
      const nx = firstField.xs.length;
      const hasY = !!firstField.ys;
      const ny = hasY ? firstField.ys!.length : 0;

      let csvContent = "";
      const fieldNames = fields.map((f, i) => f.meta?.fieldName || `field_${i}`);
      if (hasY) {
        csvContent += `t,x,y,${fieldNames.join(",")}\n`;
        for (let t = 0; t < nt; t++) {
          const timeVal = firstField.ts[t];
          for (let y = 0; y < ny; y++) {
            const yVal = firstField.ys![y];
            for (let x = 0; x < nx; x++) {
              const xVal = firstField.xs[x];
              const rowVals = fields.map((f) => {
                const idx = y * nx + x;
                return f.grid[t][idx];
              });
              csvContent += `${timeVal},${xVal},${yVal},${rowVals.join(",")}\n`;
            }
          }
        }
      } else {
        csvContent += `t,x,${fieldNames.join(",")}\n`;
        for (let t = 0; t < nt; t++) {
          const timeVal = firstField.ts[t];
          for (let x = 0; x < nx; x++) {
            const xVal = firstField.xs[x];
            const rowVals = fields.map((f) => f.grid[t][x]);
            csvContent += `${timeVal},${xVal},${rowVals.join(",")}\n`;
          }
        }
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `simulation_data.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    quit: () => {},
    undo: () => {},
    redo: () => {},
    canUndo: false,
    canRedo: false,
    reset: handleReset,
    run: handleRun,
    setMethod: (m) => setScheme({ time: m as "bdf2" | "CN" | "RKF" }),
    setTab: (t) => setUI({ vizTab: t as "plot1d" | "heatmap" | "plot3d" }),
    toggleInspector: () => setUI({ showInspector: !ui.showInspector }),
    toggleAdvanced: () => setUI({ mode: ui.mode === "advanced" ? "simple" : "advanced" }),
    gallery: () => setUI({ drawer: "gallery" }),
    history: () => setUI({ drawer: "history" }),
    about: () => setAboutOpen(true),
  };

  const menuView = {
    method: system.scheme.time,
    tab: ui.vizTab,
    showInspector: ui.showInspector,
    advanced: ui.mode === "advanced",
  };

  return (
    <div className="desktop">
      <TitleBar projectName={projectName} dirty={ui.dirty} />
      <MenuBar actions={actions} view={menuView} />
      <Toolbar
        onRun={handleRun}
        onReset={handleReset}
        onOpen={() => setUI({ drawer: "gallery" })}
        onSave={() => setUI({ dirty: false })}
        vizPalette={tweaks.vizPalette}
        onPaletteChange={(p) => handleTweakChange("vizPalette", p)}
        onExport={actions.exportPng}
      />

      <div className="desktop-body">
        <ResizableSidebar
          width={ui.sidebarWidth}
          setWidth={(w) => setUI({ sidebarWidth: w })}
        >
          <Sidebar />
        </ResizableSidebar>

        <main className="desktop-main">
          <VizPanel palette={tweaks.vizPalette as Palette} engine3D={tweaks.engine3D} />
        </main>

        {ui.showInspector && (
          <Inspector onClose={() => setUI({ showInspector: false })} />
        )}
      </div>

      <StatusBar projectPath={projectPath} />

      <Drawer open={ui.drawer === "gallery"} title="Examples gallery"
              onClose={() => setUI({ drawer: null })}>
        <GalleryDrawer onClose={() => setUI({ drawer: null })} />
      </Drawer>
      <Drawer open={ui.drawer === "history"} title="Run history"
              onClose={() => setUI({ drawer: null })}>
        <HistoryDrawer onClose={() => setUI({ drawer: null })} />
      </Drawer>

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}

      <TweaksPanel
        open={tweaksOpen}
        onClose={() => setTweaksOpen(false)}
        values={tweaks}
        onChange={handleTweakChange}
      />

      <div style={{ position: "fixed", bottom: 44, right: 16, zIndex: 8999 }}>
        <button className="btn btn-outline btn-sm"
                onClick={() => setTweaksOpen(!tweaksOpen)}
                title="Tweaks — accent, theme, colormap (Ctrl+,)"
                style={{ fontSize: 11, opacity: 0.65 }}>
          ⚙ Tweaks
        </button>
      </div>
    </div>
  );
}
