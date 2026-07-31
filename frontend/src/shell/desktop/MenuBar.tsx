import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useT } from "../../i18n/i18n";

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
  dictionary: () => void;
  discretize: () => void;
  startTour?: () => void;
  docs: () => void;
  shortcuts: () => void;
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
  const { t } = useT();
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
      <Menu id="file" label={t("menu.file")}>
        <Item label={t("menu.file.new")} shortcut="Ctrl+N" onClick={actions.new} />
        <Item label={t("menu.file.open")} shortcut="Ctrl+O" onClick={actions.open} />
        <Item label={t("menu.file.openRecent")} disabled />
        <div className="menu-sep" />
        <Item label={t("menu.file.save")} shortcut="Ctrl+S" onClick={actions.save} />
        <Item label={t("menu.file.saveAs")} shortcut="Ctrl+Shift+S" onClick={actions.saveAs} />
        <div className="menu-sep" />
        <Item label={t("menu.file.importJson")} onClick={actions.importJson} />
        <Item label={t("menu.file.exportJson")} onClick={actions.exportJson} />
        <Item label={t("menu.file.exportPng")} onClick={actions.exportPng} />
        <Item label={t("menu.file.exportCsv")} onClick={actions.exportCsv} />
        <div className="menu-sep" />
        <Item label={t("menu.file.exit")} shortcut="Alt+F4" onClick={actions.quit} />
      </Menu>
      <Menu id="edit" label={t("menu.edit")}>
        <Item label={t("menu.edit.undo")} shortcut="Ctrl+Z" onClick={actions.undo} disabled={!actions.canUndo} />
        <Item label={t("menu.edit.redo")} shortcut="Ctrl+Y" onClick={actions.redo} disabled={!actions.canRedo} />
        <div className="menu-sep" />
        <Item label={t("menu.edit.reset")} onClick={actions.reset} />
      </Menu>
      <Menu id="solve" label={t("menu.solve")}>
        <Item label={t("menu.solve.run")} shortcut="F5" onClick={actions.run} />
        <Item label={t("menu.solve.stop")} shortcut="Shift+F5" disabled />
        <div className="menu-sep" />
        <Item label={t("menu.solve.discretizeOnly")} onClick={actions.discretize} />
        <div className="menu-sep" />
        <Item label={t("menu.solve.methodBdf2")} checked={view.method === "bdf2"} onClick={() => actions.setMethod("bdf2")} />
        <Item label={t("menu.solve.methodCn")} checked={view.method === "CN"} onClick={() => actions.setMethod("CN")} />
        <Item label={t("menu.solve.methodRkf")} checked={view.method === "RKF"} onClick={() => actions.setMethod("RKF")} />
      </Menu>
      <Menu id="view" label={t("menu.view")}>
        <Item label={t("menu.view.plot1d")} shortcut="Ctrl+1" checked={view.tab === "plot1d"} onClick={() => actions.setTab("plot1d")} />
        <Item label={t("menu.view.heatmap")} shortcut="Ctrl+2" checked={view.tab === "heatmap"} onClick={() => actions.setTab("heatmap")} />
        <Item label={t("menu.view.plot3d")} shortcut="Ctrl+3" checked={view.tab === "plot3d"} onClick={() => actions.setTab("plot3d")} />
        <div className="menu-sep" />
        <Item label={t("menu.view.inspector")} checked={view.showInspector} onClick={actions.toggleInspector} />
        <Item label={t("menu.view.gallery")} onClick={actions.gallery} />
        <Item label={t("menu.view.history")} onClick={actions.history} />
        <div className="menu-sep" />
        <Item label={t("menu.view.advanced")} checked={view.advanced} onClick={actions.toggleAdvanced} />
      </Menu>
      <Menu id="help" label={t("menu.help")}>
        <Item label={t("menu.help.tour")} onClick={actions.startTour} />
        <Item label={t("menu.help.docs")} onClick={actions.docs} />
        <Item label={t("menu.help.shortcuts")} onClick={actions.shortcuts} />
        <Item label={t("menu.help.dictionary")} onClick={actions.dictionary} />
        <div className="menu-sep" />
        <Item label={t("menu.help.about")} onClick={actions.about} />
      </Menu>
    </nav>
  );
}
