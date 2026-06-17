import { useStore } from "../../state/store";
import { Icon } from "../../components/Icon";

interface Props {
  onRun: () => void;
  onReset: () => void;
  onOpen: () => void;
  onSave: () => void;
  vizPalette: string;
  onPaletteChange?: (palette: string) => void;
  onExport: () => void;
}

export function Toolbar({ onRun, onReset, onOpen, onSave, vizPalette, onPaletteChange, onExport }: Props) {
  const status = useStore((s) => s.run.status);
  const domain = useStore((s) => s.system.domain);
  const mesh = useStore((s) => s.system.mesh);

  const is2D = !!domain.ymin && mesh.ny !== undefined;
  const dx = (parseFloat(domain.xmax) - parseFloat(domain.xmin)) / Math.max(1, mesh.nx - 1);
  const dy = is2D ? (parseFloat(domain.ymax!) - parseFloat(domain.ymin!)) / Math.max(1, mesh.ny! - 1) : null;
  const solving = status === "solving";

  const cyclePalette = () => {
    const palettes = ["viridis", "cool", "magma"];
    const nextIdx = (palettes.indexOf(vizPalette) + 1) % palettes.length;
    onPaletteChange?.(palettes[nextIdx]);
  };

  return (
    <div className="toolbar">
      <button className="tb-btn" data-primary="1" disabled={solving} onClick={onRun}
              title="Run solver (F5)">
        {solving ? (
          <>
            <span style={{
              width: 12, height: 12, borderRadius: "50%",
              border: "1.5px solid currentColor", borderTopColor: "transparent",
              animation: "spin 0.7s linear infinite", display: "inline-block",
            }} />
            Solving…
          </>
        ) : (
          <><Icon.Run /> Run</>
        )}
      </button>
      <button className="tb-btn" disabled title="Stop (Shift+F5)">
        <Icon.Stop /> Stop
      </button>
      <button className="tb-btn" onClick={onReset} title="Reset to defaults">
        <Icon.Reset /> Reset
      </button>

      <div className="tb-sep" />

      <button className="tb-btn" onClick={onOpen} title="Open .json (Ctrl+O)">
        <Icon.Open /> Open
      </button>
      <button className="tb-btn" onClick={onSave} title="Save (Ctrl+S)">
        <Icon.Save /> Save
      </button>

      <div className="tb-sep" />

      <button className="tb-btn" onClick={onExport} title="Export PNG">
        <Icon.Export /> Export
      </button>

      <div className="tb-sep" />

      <div className="tb-readout" title="Spatial discretization">
        Δx ≈ {dx.toFixed(4)}{dy !== null ? ` · Δy ≈ ${dy.toFixed(4)}` : ""}
      </div>
      <div className="tb-readout" title="Mesh">
        {mesh.nx} × {mesh.ny !== undefined ? `${mesh.ny} × ` : ""}{mesh.nt}
      </div>

      <div className="tb-spacer" />

      <div className="tb-readout" title="Current colormap (click to cycle)" onClick={cyclePalette} data-clickable="true">
        cmap: {vizPalette}
      </div>
    </div>
  );
}
