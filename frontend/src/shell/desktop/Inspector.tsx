import { useStore } from "../../state/store";
import { Icon } from "../../components/Icon";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Inspector({ open, onClose }: Props) {
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
    <aside className="inspector" data-open={open ? "1" : "0"} aria-hidden={!open}>
      <div className="inspector-inner">
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
            <span className="k" title="A Equação Diferencial Parcial sendo resolvida">Equation</span>
            <span className="v" style={{ wordBreak: "break-all", whiteSpace: "normal", fontFamily: "var(--font-mono)", fontSize: 11 }}>{activePde.eq}</span>
            <span className="k" title="A função incógnita a ser resolvida (ex: u(x,t))">Function</span>
            <span className="v">{activePde.func}({is2D ? "x, y" : "x"}, t)</span>
            <span className="k" title="O domínio espacial e temporal: [xmin, xmax] x [t0, tf]">Domain</span>
            <span className="v">[{domain.xmin}, {domain.xmax}]{is2D ? ` × [${domain.ymin}, ${domain.ymax}]` : ""} × [{domain.t0}, {domain.tf}]</span>
            <span className="k" title="Condição Inicial: o perfil espacial em t = 0">IC</span>
            <span className="v" style={{ whiteSpace: "normal", wordBreak: "break-all" }}>
              {activePde.ic}
            </span>
            <span className="k" title="Condição de contorno na borda oeste (x = xmin)">West BC</span>
            <span className="v">{activePde.west.type} = {activePde.west.expr}</span>
            <span className="k" title="Condição de contorno na borda leste (x = xmax)">East BC</span>
            <span className="v">{activePde.east.type} = {activePde.east.expr}</span>
          </div>
        </div>

        <div className="inspector-section">
          <div className="inspector-section-title">Mesh</div>
          <div className="inspector-kv">
            <span className="k" title="Número de pontos de malha na direção x">nₓ</span><span className="v">{mesh.nx}</span>
            {is2D && (
              <>
                <span className="k" title="Número de pontos de malha na direção y">nᵧ</span><span className="v">{mesh.ny}</span>
              </>
            )}
            <span className="k" title="Número de pontos/passos na direção temporal t">nₜ</span><span className="v">{mesh.nt}</span>
            <span className="k" title="Espaçamento da malha espacial em x (dx)">Δx</span><span className="v">{dx.toExponential(3)}</span>
            {is2D && dy !== null && (
              <>
                <span className="k" title="Espaçamento da malha espacial em y (dy)">Δy</span><span className="v">{dy.toExponential(3)}</span>
              </>
            )}
            <span className="k" title="Tamanho do passo no tempo (dt)">Δt</span><span className="v">{dt.toExponential(3)}</span>
            <span className="k" title="Parâmetro Courant-Friedrichs-Lewy (estabilidade explícita CFL = dt/dx² <= 0.5)">CFL</span>
            <span className="v" style={{ color: cflOk ? "var(--success)" : "var(--warning)" }} title={cflOk ? "Estabilidade explícita garantida (CFL <= 0.5)" : "Instabilidade numérica possível para esquemas explícitos (CFL > 0.5)"}>
              {cfl.toFixed(3)} {cflOk ? "✓" : "⚠"}
            </span>
          </div>
        </div>

        <div className="inspector-section">
          <div className="inspector-section-title">Solver</div>
          <div className="inspector-kv">
            <span className="k" title="Método de aproximação das derivadas espaciais">Discretization</span><span className="v">{scheme.disc}</span>
            <span className="k" title="Método de integração temporal">Integrator</span><span className="v">{scheme.time}</span>
            <span className="k" title="Motor de cálculo utilizado">Backend</span>
            <span className="v">{scheme.time === "RKF" ? "CUDA / cupy" : "numpy"}</span>
          </div>
        </div>

        {field && (
          <div className="inspector-section">
            <div className="inspector-section-title">Last result</div>
            <div className="inspector-kv">
              <span className="k" title="Valor mínimo calculado do campo em todo o domínio">min(u)</span><span className="v">{field.min.toExponential(3)}</span>
              <span className="k" title="Valor máximo calculado do campo em todo o domínio">max(u)</span><span className="v">{field.max.toExponential(3)}</span>
              <span className="k" title="Número total de células da malha espacial-temporal (nx * nt)">Cells</span><span className="v">{field.xs.length * field.ts.length}</span>
              <span className="k" title="Status de convergência do solver">Status</span>
              <span className="v" style={{ color: "var(--success)" }} title="A simulação convergiu com sucesso">converged</span>
            </div>
          </div>
        )}
      </div>
      </div>
    </aside>
  );
}
