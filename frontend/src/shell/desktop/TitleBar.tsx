import { bridge } from "../../api/pywebview";

interface Props {
  projectName: string;
  dirty: boolean;
}

export function TitleBar({ projectName, dirty }: Props) {
  return (
    <div className="titlebar" onDoubleClick={() => bridge.maximize()}>
      <div className="titlebar-icon">∂</div>
      <span className="pywebview-drag" style={{ display: "flex", alignItems: "center", flex: 1, height: "100%" }}>
        <span style={{ color: "var(--text)" }}>pdesolver studio (em desenvolvimento)</span>
        {" — "}{projectName}{dirty && " •"}
      </span>
      <div className="titlebar-spacer pywebview-drag" style={{ height: "100%" }} />
      <div className="titlebar-controls">
        <button aria-label="Minimize" onClick={() => bridge.minimize()}>
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect x="1" y="5" width="8" height="0.7" fill="currentColor" />
          </svg>
        </button>
        <button aria-label="Maximize" onClick={() => bridge.maximize()}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="0.7" />
          </svg>
        </button>
        <button data-action="close" aria-label="Close" onClick={() => bridge.close()}>
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="0.9" />
          </svg>
        </button>
      </div>
    </div>
  );
}
