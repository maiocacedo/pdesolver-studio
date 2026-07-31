interface ConsoleProps {
  status: "pristine" | "solving" | "solved" | "error";
  lastRunMs: number;
  error: string | null;
  meta?: { converged: boolean; elapsed_ms: number; backend: string; approximate?: boolean } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  system: any;
}

import { useT } from "../i18n/i18n";

export function SolverConsole({ status, lastRunMs, error, meta, system }: ConsoleProps) {
  const { t } = useT();
  const is2D = !!system.domain.ymin && system.mesh.ny !== undefined;

  const statStatus = status.toUpperCase();
  const statBackend = meta?.approximate
    ? "APROX (JS)"
    : meta?.backend ? meta.backend.toUpperCase() : "N/A";
  const statTime = status === "solved" ? `${lastRunMs.toFixed(1)} ms` : "N/A";
  const statConverged = meta?.converged !== undefined ? (meta.converged ? t("console.log.yes") : t("console.log.no")) : "N/A";
  const statGrid = is2D
    ? `${system.mesh.nx} × ${system.mesh.ny} × ${system.mesh.nt}`
    : `${system.mesh.nx} × ${system.mesh.nt}`;

  const lines: Array<{ text: string; type: "info" | "success" | "error" | "default" }> = [];
  lines.push({ text: t("console.log.init"), type: "default" });

  if (status === "pristine") {
    lines.push({ text: t("console.log.ready"), type: "info" });
  } else {
    lines.push({ text: t("console.log.launching"), type: "info" });
    lines.push({
      text: `${t("console.log.domain")} X=[${system.domain.xmin}, ${system.domain.xmax}]${is2D ? ` Y=[${system.domain.ymin}, ${system.domain.ymax}]` : ""}`,
      type: "default",
    });
    lines.push({
      text: `${t("console.log.disc")} ${system.scheme.disc.toUpperCase()} (mesh: ${statGrid})`,
      type: "default",
    });
    lines.push({
      text: `${t("console.log.timeInt")} ${system.scheme.time.toUpperCase()} (t0=${system.domain.t0}, tf=${system.domain.tf})`,
      type: "default",
    });

    if (status === "solving") {
      lines.push({ text: t("console.log.solving"), type: "info" });
    } else if (status === "solved") {
      lines.push({ text: t("console.log.success"), type: "success" });
      if (meta?.approximate) {
        lines.push({ text: t("console.log.warnJs"), type: "error" });
      }
      if (meta) {
        lines.push({ text: `[SUCCESS] ${t("console.log.backend")} ${meta.approximate ? "aprox (JS)" : meta.backend} | ${t("console.log.solverElapsed")} ${meta.elapsed_ms.toFixed(2)} ms`, type: "success" });
        lines.push({ text: `[SUCCESS] ${t("console.log.converged")} ${meta.converged ? t("console.log.yes") : t("console.log.no")}`, type: "success" });
      }
      lines.push({ text: `${t("console.log.clientExec")} ${lastRunMs.toFixed(1)} ms. ${t("console.log.readyViz")}`, type: "success" });
    } else if (status === "error") {
      lines.push({ text: t("console.log.error"), type: "error" });
      lines.push({ text: `${t("console.log.errorDetails")} ${error}`, type: "error" });
    }
  }

  return (
    <div className="console-container">
      <div className="console-stats">
        <div className="console-stat-card">
          <div className="console-stat-label">{t("console.stat.status")}</div>
          <div className="console-stat-value" style={{
            color: status === "solved" ? "var(--success)" : status === "error" ? "oklch(0.65 0.2 20)" : "var(--text)",
          }}>{statStatus}</div>
        </div>
        <div className="console-stat-card">
          <div className="console-stat-label">{t("console.stat.gridSize")}</div>
          <div className="console-stat-value">{statGrid}</div>
        </div>
        <div className="console-stat-card">
          <div className="console-stat-label">{t("console.stat.execTime")}</div>
          <div className="console-stat-value">{statTime}</div>
        </div>
        <div className="console-stat-card">
          <div className="console-stat-label">{t("console.stat.converged")}</div>
          <div className="console-stat-value">{statConverged}</div>
        </div>
        <div className="console-stat-card">
          <div className="console-stat-label">{t("console.stat.backend")}</div>
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
