import { useStore } from "../../state/store";

export function StatusBar({ projectPath }: { projectPath: string }) {
  const status = useStore((s) => s.run.status);
  const mesh = useStore((s) => s.system.mesh);
  const scheme = useStore((s) => s.system.scheme);
  const lastRunMs = useStore((s) => s.run.lastRunMs);

  const stateAttr = status === "solving" ? "pending" : status === "solved" ? "ok" : "";
  const stateLabel = status === "solving" ? "Solving…" : status === "solved" ? "Ready" : "Idle";

  return (
    <div className="statusbar">
      <span className="statusbar-state" data-state={stateAttr}>
        <span className="dot" />
        {stateLabel}
      </span>
      <span className="statusbar-sep" />
      <span>{projectPath}</span>
      <span className="statusbar-sep" />
      <span>nx={mesh.nx}{mesh.ny !== undefined ? ` · ny=${mesh.ny}` : ""} · nt={mesh.nt}</span>
      <span className="statusbar-sep" />
      <span>method={scheme.time}</span>
      <div className="statusbar-spacer" />
      {lastRunMs > 0 && <span>last run: {(lastRunMs / 1000).toFixed(2)}s</span>}
      <span className="statusbar-sep" />
      <span>pdesolver studio v0.1.6 (em desenvolvimento)</span>
      <span className="statusbar-sep" />
      <span style={{ color: "var(--success)" }}>● python ready</span>
    </div>
  );
}
