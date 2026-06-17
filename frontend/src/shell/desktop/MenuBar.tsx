import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface MenuActions {
  new: () => void;
  open: () => void;
  save: () => void;
  saveAs: () => void;
  importJson: () => void;
  exportJson: () => void;
  exportPng: () => void;
  exportCsv: () => void;
  quit: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: () => void;
  run: () => void;
  setMethod: (m: string) => void;
  setTab: (t: string) => void;
  toggleInspector: () => void;
  toggleAdvanced: () => void;
  gallery: () => void;
  history: () => void;
  about: () => void;
}

export interface MenuView {
  method: string;
  tab: string;
  showInspector: boolean;
  advanced: boolean;
}

interface Props {
  actions: MenuActions;
  view: MenuView;
}

export function MenuBar({ actions, view }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const Menu = ({ id, label, children }: { id: string; label: string; children: ReactNode }) => (
    <div className="menu">
      <button className="menu-trigger" data-open={open === id ? "1" : "0"}
              onMouseEnter={() => open !== null && setOpen(id)}
              onClick={() => setOpen(open === id ? null : id)}>
        <u>{label}</u>
      </button>
      {open === id && (
        <div className="menu-panel" onClick={() => setOpen(null)}>{children}</div>
      )}
    </div>
  );

  const Item = ({
    label, shortcut, onClick, checked = false, disabled = false,
  }: {
    label: string; shortcut?: string; onClick?: () => void;
    checked?: boolean; disabled?: boolean;
  }) => (
    <button className="menu-item" data-checked={checked ? "1" : "0"}
            data-disabled={disabled ? "1" : "0"}
            onClick={disabled ? undefined : onClick}>
      <span className="menu-icon" />
      {label}
      {shortcut && <span className="menu-shortcut">{shortcut}</span>}
    </button>
  );

  return (
    <nav className="menubar" ref={ref}>
      <Menu id="file" label="File">
        <Item label="New" shortcut="Ctrl+N" onClick={actions.new} />
        <Item label="Open…" shortcut="Ctrl+O" onClick={actions.open} />
        <Item label="Open recent" disabled />
        <div className="menu-sep" />
        <Item label="Save" shortcut="Ctrl+S" onClick={actions.save} />
        <Item label="Save as…" shortcut="Ctrl+Shift+S" onClick={actions.saveAs} />
        <div className="menu-sep" />
        <Item label="Import JSON…" onClick={actions.importJson} />
        <Item label="Export JSON…" onClick={actions.exportJson} />
        <Item label="Export PNG" onClick={actions.exportPng} />
        <Item label="Export CSV" onClick={actions.exportCsv} />
        <div className="menu-sep" />
        <Item label="Exit" shortcut="Alt+F4" onClick={actions.quit} />
      </Menu>
      <Menu id="edit" label="Edit">
        <Item label="Undo" shortcut="Ctrl+Z" onClick={actions.undo} disabled={!actions.canUndo} />
        <Item label="Redo" shortcut="Ctrl+Y" onClick={actions.redo} disabled={!actions.canRedo} />
        <div className="menu-sep" />
        <Item label="Reset to defaults" onClick={actions.reset} />
      </Menu>
      <Menu id="solve" label="Solve">
        <Item label="Run" shortcut="F5" onClick={actions.run} />
        <Item label="Stop" shortcut="Shift+F5" disabled />
        <div className="menu-sep" />
        <Item label="Discretize only" onClick={actions.run} />
        <div className="menu-sep" />
        <Item label="Method: BDF-2" checked={view.method === "bdf2"} onClick={() => actions.setMethod("bdf2")} />
        <Item label="Method: Crank–Nicolson" checked={view.method === "CN"} onClick={() => actions.setMethod("CN")} />
        <Item label="Method: RKF (CUDA)" checked={view.method === "RKF"} onClick={() => actions.setMethod("RKF")} />
      </Menu>
      <Menu id="view" label="View">
        <Item label="1D profile" shortcut="Ctrl+1" checked={view.tab === "plot1d"} onClick={() => actions.setTab("plot1d")} />
        <Item label="Heatmap" shortcut="Ctrl+2" checked={view.tab === "heatmap"} onClick={() => actions.setTab("heatmap")} />
        <Item label="Surface 3D" shortcut="Ctrl+3" checked={view.tab === "plot3d"} onClick={() => actions.setTab("plot3d")} />
        <div className="menu-sep" />
        <Item label="Inspector pane" checked={view.showInspector} onClick={actions.toggleInspector} />
        <Item label="Gallery…" onClick={actions.gallery} />
        <Item label="History…" onClick={actions.history} />
        <div className="menu-sep" />
        <Item label="Advanced mode" checked={view.advanced} onClick={actions.toggleAdvanced} />
      </Menu>
      <Menu id="help" label="Help">
        <Item label="Documentation" onClick={() => {}} />
        <Item label="Keyboard shortcuts" onClick={() => {}} />
        <div className="menu-sep" />
        <Item label="About pdesolver studio (em desenvolvimento)…" onClick={actions.about} />
      </Menu>
    </nav>
  );
}
