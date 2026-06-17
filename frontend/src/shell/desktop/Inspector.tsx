import { useStore } from "../../state/store";
import { Icon } from "../../components/Icon";

interface Props {
  onClose: () => void;
}

export function Inspector({ onClose }: Props) {
  const system = useStore((s) => s.system);
  const run = useStore((s) => s.run);

  const { domain, mesh, scheme } = system;
  const activePde = system.pdes.find((p) => p.id === system.activePdeId) ?? system.pdes[0];
  const field = run.fields?.[run.activeFieldIndex] ?? null;

  const is2D = !!domain.ymin && mesh.ny !== undefined;
  const xmin = parseFloat(domain.xmin) || 0;
  const xmax = parseFloat(domain.xmax) || 1;
  const ymin = is2D ? parseFloat(domain.ymin!) || 0 : 0;
  const ymax = is2D ? parseFloat(domain.ymax!) || 1 : 1;
  const t0 = parseFloat(domain.t0) || 0;
  const tf = parseFloat(domain.tf) || 0.1;

  const dx = (xmax - xmin) / Math.max(1, mesh.nx - 1);
  const dy = is2D && mesh.ny ? (ymax - ymin) / Math.max(1, mesh.ny - 1) : null;
  const dt = (tf - t0) / Math.max(1, mesh.nt - 1);
  const cfl = dt / (dx * dx);
  const cflOk = cfl <= 0.5;

  return (
    <aside className="inspector">
      <div className="inspector-head">
        Inspector
        <span className="pin" onClick={onClose} title="Hide inspector">
          <Icon.Close />
        </span>
      </div>
      <div className="inspector-body">
        <div className="inspector-section">
          <div className="inspector-section-title">Problem</div>
          <div className="inspector-kv">
            <span className="k">Equation</span>
            <span className="v" style={{ wordBreak: "break-all", whiteSpace: "normal", fontFamily: "var(--font-mono)", fontSize: 11 }}>{activePde.eq}</span>
            <span className="k">Function</span>
            <span className="v">{activePde.func}({is2D ? "x, y" : "x"}, t)</span>
            <span className="k">Domain</span>
            <span className="v">[{domain.xmin}, {domain.xmax}]{is2D ? ` × [${domain.ymin}, ${domain.ymax}]` : ""} × [{domain.t0}, {domain.tf}]</span>
            <span className="k">IC</span>
            <span className="v" style={{ whiteSpace: "normal", wordBreak: "break-all" }}>
              {activePde.ic}
            </span>
            <span className="k">West BC</span>
            <span className="v">{activePde.west.type} = {activePde.west.expr}</span>
            <span className="k">East BC</span>
            <span className="v">{activePde.east.type} = {activePde.east.expr}</span>
          </div>
        </div>

        <div className="inspector-section">
          <div className="inspector-section-title">Mesh</div>
          <div className="inspector-kv">
            <span className="k">nₓ</span><span className="v">{mesh.nx}</span>
            {is2D && (
              <>
                <span className="k">nᵧ</span><span className="v">{mesh.ny}</span>
              </>
            )}
            <span className="k">nₜ</span><span className="v">{mesh.nt}</span>
            <span className="k">Δx</span><span className="v">{dx.toExponential(3)}</span>
            {is2D && dy !== null && (
              <>
                <span className="k">Δy</span><span className="v">{dy.toExponential(3)}</span>
              </>
            )}
            <span className="k">Δt</span><span className="v">{dt.toExponential(3)}</span>
            <span className="k">CFL</span>
            <span className="v" style={{ color: cflOk ? "var(--success)" : "var(--warning)" }}>
              {cfl.toFixed(3)} {cflOk ? "✓" : "⚠"}
            </span>
          </div>
        </div>

        <div className="inspector-section">
          <div className="inspector-section-title">Solver</div>
          <div className="inspector-kv">
            <span className="k">Discretization</span><span className="v">{scheme.disc}</span>
            <span className="k">Integrator</span><span className="v">{scheme.time}</span>
            <span className="k">Backend</span>
            <span className="v">{scheme.time === "RKF" ? "CUDA / cupy" : "numpy"}</span>
          </div>
        </div>

        {field && (
          <div className="inspector-section">
            <div className="inspector-section-title">Last result</div>
            <div className="inspector-kv">
              <span className="k">min(u)</span><span className="v">{field.min.toExponential(3)}</span>
              <span className="k">max(u)</span><span className="v">{field.max.toExponential(3)}</span>
              <span className="k">Cells</span><span className="v">{field.xs.length * field.ts.length}</span>
              <span className="k">Status</span>
              <span className="v" style={{ color: "var(--success)" }}>converged</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
