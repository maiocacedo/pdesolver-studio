import type { ReactNode } from "react";
import { Icon } from "../Icon";

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Drawer({ open, title, onClose, children }: DrawerProps) {
  return (
    <>
      <div className="drawer-backdrop" data-open={open ? "1" : "0"} onClick={onClose} />
      <div className="drawer" data-open={open ? "1" : "0"}>
        <div className="drawer-head">
          <span className="drawer-title">{title}</span>
          <button className="btn btn-icon" onClick={onClose}><Icon.Close /></button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </>
  );
}
