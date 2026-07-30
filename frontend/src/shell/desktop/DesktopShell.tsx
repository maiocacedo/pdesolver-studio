import { useCallback, useEffect, useState } from "react";
import { useStore, toPayload, TOUR_SEEN_KEY } from "../../state/store";
import { payloadToSystemConfig } from "../../state/payload";
import { heatPreset } from "../../gallery/examples";
import { Drawer } from "../../components/Drawer";
import { MenuBar, type MenuActions } from "./MenuBar";
import { Toolbar } from "./Toolbar";
import { Inspector } from "./Inspector";
import { StatusBar } from "./StatusBar";
import { AboutModal } from "./AboutModal";
import { DictionaryModal } from "./DictionaryModal";
import { ResizableSidebar } from "./ResizableSidebar";
import { TourOverlay } from "./TourOverlay";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ToastHost } from "../../components/toast/ToastHost";
import { toast } from "../../components/toast/toastStore";
import { Sidebar } from "../../panels/Sidebar";
import { VizPanel } from "../../viz/VizPanel";
import { GalleryDrawer } from "../../gallery/GalleryDrawer";
import { HistoryDrawer } from "../../history/HistoryDrawer";
import { TweaksPanel, type TweakValues } from "../../tweaks/TweaksPanel";
import { bridge } from "../../api/pywebview";
import { exportImage } from "../../viz/exportImage";
import type { Palette } from "../../viz/colormap";

const DEFAULT_TWEAKS: TweakValues = {
  accent: "indigo",
  theme: "light",
  vizPalette: "viridis",
  engine3D: "auto",
};

interface DesktopShellProps {
  /** Called once after the shell has mounted (used to lift the loading screen). */
  onReady?: () => void;
}

export function DesktopShell({ onReady }: DesktopShellProps = {}) {
  const system = useStore((s) => s.system);
  const ui = useStore((s) => s.ui);
  const runStatus = useStore((s) => s.run.status);
  const solve = useStore((s) => s.solve);
  const discretize = useStore((s) => s.discretize);
  const resetRun = useStore((s) => s.resetRun);
  const setUI = useStore((s) => s.setUI);
  const setScheme = useStore((s) => s.setScheme);
  const loadPreset = useStore((s) => s.loadPreset);
  const startTour = useStore((s) => s.startTour);

  // Signal the App that the studio has mounted, so the loading screen can lift.
  useEffect(() => { onReady?.(); }, [onReady]);

  // Auto-start the guided tour only on the very first launch. After it's been
  // finished or skipped once (endTour sets the flag), it stays available via the
  // Help menu but never forces itself on the user again.
  useEffect(() => {
    const seen = typeof localStorage !== "undefined" && localStorage.getItem(TOUR_SEEN_KEY);
    if (!seen) startTour();
  }, [startTour]);

  // Manual (re)launch from the menu: the tour loads the wave demo, so guard
  // against silently discarding unsaved edits.
  const handleStartTour = useCallback(() => {
    if (ui.dirty && !window.confirm(
      "O tour carrega o exemplo de onda e vai descartar as alterações não salvas. Continuar?"
    )) return;
    startTour();
  }, [ui.dirty, startTour]);

  const [projectPath] = useState("pdesolver studio (em desenvolvimento) — unsaved");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
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


  const actions: MenuActions = {
    new: () => { loadPreset(heatPreset()); setUI({ dirty: false }); },
    open: () => setUI({ drawer: "gallery" }),
    save: () => setUI({ dirty: false }),
    saveAs: () => setUI({ dirty: false }),
    importJson: async () => {
      if (bridge.isDesktop()) {
        try {
          const path = await bridge.openDialog();
          if (!path) return;
          const data = await bridge.loadJson(path);
          if (data && data.payload && Array.isArray(data.payload.pdes)) {
            const config = payloadToSystemConfig(data.payload);
            loadPreset(config);
            const res = data.result;
            if (res && res.fields) {
              useStore.setState((s) => ({
                run: {
                  ...s.run,
                  status: "solved",
                  fields: res.fields,
                  meta: res.meta,
                }
              }));
            }
            toast.success("Configuração importada com sucesso!");
          } else {
            toast.error("Formato de arquivo inválido.");
          }
        } catch (err) {
          toast.error("Erro ao importar arquivo: " + err);
        }
        return;
      }

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
              toast.error("Formato de arquivo de configuração inválido.");
            }
          } catch (err) {
            toast.error("Erro ao ler arquivo: " + err);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },
    exportJson: async () => {
      const sys = useStore.getState().system;
      const payload = toPayload(sys);
      const fields = useStore.getState().run.fields;
      const meta = useStore.getState().run.meta;
      const result = fields ? { fields, meta } : null;

      if (bridge.isDesktop()) {
        try {
          const path = await bridge.saveDialog("pdesolver_config.json");
          if (!path) return;
          const success = await bridge.saveJson(path, payload, result as any);
          if (success) {
            toast.success("Configuração salva com sucesso!");
          }
        } catch (err) {
          toast.error("Erro ao salvar configuração: " + err);
        }
        return;
      }

      const jsonString = JSON.stringify({ payload, result }, null, 2);
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
    exportPng: async () => {
      const canvas = document.querySelector(
        ".viz-frame canvas, .viz-stage canvas, .grid-panel canvas",
      ) as HTMLCanvasElement | null;
      const svg = document.querySelector(
        ".viz-stage svg, .grid-panel svg",
      ) as SVGGraphicsElement | null;
      await exportImage(canvas ?? svg, "pde_visualization.png");
    },
    exportCsv: async () => {
      const fields = useStore.getState().run.fields;
      if (!fields || fields.length === 0) {
        toast.error("Nenhum resultado de simulação disponível. Execute a simulação antes de exportar.");
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

      if (bridge.isDesktop()) {
        try {
          const path = await bridge.saveDialog("simulation_data.csv");
          if (!path) return;
          const success = await bridge.saveCsv(path, csvContent);
          if (success) {
            toast.success("Dados CSV exportados com sucesso!");
          }
        } catch (err) {
          toast.error("Erro ao exportar CSV: " + err);
        }
        return;
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
    quit: () => bridge.close(),
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
    dictionary: () => setDictionaryOpen(true),
    discretize: useCallback(() => { void discretize(); }, [discretize]),
    startTour: handleStartTour,
  };

  const menuView = {
    method: system.scheme.time,
    tab: ui.vizTab,
    showInspector: ui.showInspector,
    advanced: ui.mode === "advanced",
  };

  return (
    <div className="desktop">
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

        <main className="desktop-main" style={{ position: "relative" }}>
          <ErrorBoundary label="a visualização" resetKeys={[ui.vizTab, ui.layoutMode, runStatus]}>
            <VizPanel palette={tweaks.vizPalette as Palette} engine3D={tweaks.engine3D} />
          </ErrorBoundary>
          <button
            className="inspector-toggle-btn"
            onClick={actions.toggleInspector}
            title={ui.showInspector ? "Esconder Inspetor" : "Mostrar Inspetor"}
          >
            {ui.showInspector ? "›" : "‹"}
          </button>
        </main>

        <Inspector open={ui.showInspector} onClose={() => setUI({ showInspector: false })} />
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
      {dictionaryOpen && <DictionaryModal onClose={() => setDictionaryOpen(false)} />}
      <TourOverlay />
      <ToastHost />

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
