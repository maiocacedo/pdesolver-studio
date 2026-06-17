import { useRef, useState } from "react";
import type { ReactNode } from "react";

interface Props {
  width: number;
  setWidth: (w: number) => void;
  children: ReactNode;
}

export function ResizableSidebar({ width, setWidth, children }: Props) {
  const startRef = useRef({ x: 0, w: 0 });
  const [active, setActive] = useState(false);

  const onDown = (e: React.MouseEvent) => {
    startRef.current = { x: e.clientX, w: width };
    setActive(true);
    const move = (ev: MouseEvent) => {
      const next = Math.max(280, Math.min(600, startRef.current.w + (ev.clientX - startRef.current.x)));
      setWidth(next);
    };
    const up = () => {
      setActive(false);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div className="desktop-sidebar" style={{ width }}>
      {children}
      <div className="desktop-resize" data-active={active ? "1" : "0"} onMouseDown={onDown} />
    </div>
  );
}
