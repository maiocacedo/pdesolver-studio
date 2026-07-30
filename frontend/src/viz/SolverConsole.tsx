interface ConsoleProps {
  status: "pristine" | "solving" | "solved" | "error";
  lastRunMs: number;
  error: string | null;
  meta?: { converged: boolean; elapsed_ms: number; backend: string; approximate?: boolean } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  system: any;
}

export function SolverConsole({ status, lastRunMs, error, meta, system }: ConsoleProps) {
  const is2D = !!system.domain.ymin && system.mesh.ny !== undefined;

  const statStatus = status.toUpperCase();
  const statBackend = meta?.approximate
    ? "APROX (JS)"
    : meta?.backend ? meta.backend.toUpperCase() : "N/A";
  const statTime = status === "solved" ? `${lastRunMs.toFixed(1)} ms` : "N/A";
  const statConverged = meta?.converged !== undefined ? (meta.converged ? "YES" : "NO") : "N/A";
  const statGrid = is2D
    ? `${system.mesh.nx} × ${system.mesh.ny} × ${system.mesh.nt}`
    : `${system.mesh.nx} × ${system.mesh.nt}`;

  const lines: Array<{ text: string; type: "info" | "success" | "error" | "default" }> = [];
  lines.push({ text: `[SYSTEM] Initialized PDESolver Studio (em desenvolvimento).`, type: "default" });

  if (status === "pristine") {
    lines.push({ text: `[INFO] Ready to solve. Click "Run" or press F5 to start.`, type: "info" });
  } else {
    lines.push({ text: `[INFO] Launching solver backend...`, type: "info" });
    lines.push({
      text: `[INFO] Domain boundaries: X=[${system.domain.xmin}, ${system.domain.xmax}]${is2D ? ` Y=[${system.domain.ymin}, ${system.domain.ymax}]` : ""}`,
      type: "default",
    });
    lines.push({
      text: `[INFO] Discretization scheme: ${system.scheme.disc.toUpperCase()} (mesh: ${statGrid})`,
      type: "default",
    });
    lines.push({
      text: `[INFO] Time integration scheme: ${system.scheme.time.toUpperCase()} (t0=${system.domain.t0}, tf=${system.domain.tf})`,
      type: "default",
    });

    if (status === "solving") {
      lines.push({ text: `[INFO] Solving system equations...`, type: "info" });
    } else if (status === "solved") {
      lines.push({ text: `[SUCCESS] Simulation finished successfully.`, type: "success" });
      if (meta?.approximate) {
        lines.push({ text: `[WARN] Backend real ausente — solver JS aproximado (apenas difusão; ignora a EDP e as condições de contorno).`, type: "error" });
      }
      if (meta) {
        lines.push({ text: `[SUCCESS] Backend: ${meta.approximate ? "aprox (JS)" : meta.backend} | Solver elapsed: ${meta.elapsed_ms.toFixed(2)} ms`, type: "success" });
        lines.push({ text: `[SUCCESS] Converged: ${meta.converged ? "Yes" : "No"}`, type: "success" });
      }
      lines.push({ text: `[SUCCESS] Total client execution: ${lastRunMs.toFixed(1)} ms. Ready for visualization.`, type: "success" });
    } else if (status === "error") {
      lines.push({ text: `[ERROR] Simulation failed!`, type: "error" });
      lines.push({ text: `[ERROR] Details: ${error}`, type: "error" });
    }
  }

  return (
    <div className="console-container">
      <div className="console-stats">
        <div className="console-stat-card">
          <div className="console-stat-label">Status</div>
          <div className="console-stat-value" style={{
            color: status === "solved" ? "var(--success)" : status === "error" ? "oklch(0.65 0.2 20)" : "var(--text)",
          }}>{statStatus}</div>
        </div>
        <div className="console-stat-card">
          <div className="console-stat-label">Grid Size</div>
          <div className="console-stat-value">{statGrid}</div>
        </div>
        <div className="console-stat-card">
          <div className="console-stat-label">Execution Time</div>
          <div className="console-stat-value">{statTime}</div>
        </div>
        <div className="console-stat-card">
          <div className="console-stat-label">Converged</div>
          <div className="console-stat-value">{statConverged}</div>
        </div>
        <div className="console-stat-card">
          <div className="console-stat-label">Backend</div>
          <div className="console-stat-value">{statBackend}</div>
        </div>
      </div>
      <div className="console-log">
        {lines.map((line, idx) => (
          <div key={idx} className="console-log-line" data-type={line.type}>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}
