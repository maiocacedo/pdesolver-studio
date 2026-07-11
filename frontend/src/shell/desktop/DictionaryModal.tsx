import { Icon } from "../../components/Icon";

interface Props {
  onClose: () => void;
}

export function DictionaryModal({ onClose }: Props) {
  const definitions = [
    { category: "Problem", term: "Equation", desc: "The Partial Differential Equation being solved, in the form ∂u/∂t = F(u, x, t)." },
    { category: "Problem", term: "Function", desc: "The unknown field variable (e.g., u(x,t) or F(x,y,t)) to be solved for." },
    { category: "Problem", term: "Domain", desc: "The spatial and temporal intervals: [xmin, xmax] × [t0, tf]." },
    { category: "Problem", term: "IC", desc: "Initial Condition: the spatial profile at time t = 0 (e.g., u(x, 0) = f(x))." },
    { category: "Problem", term: "West / East BC", desc: "Boundary conditions enforced at x = xmin (West) and x = xmax (East)." },
    { category: "Mesh", term: "nₓ", desc: "Number of spatial grid points in the x-direction." },
    { category: "Mesh", term: "nᵧ", desc: "Number of spatial grid points in the y-direction (for 2-D systems)." },
    { category: "Mesh", term: "nₜ", desc: "Number of time steps/grid points in the temporal direction." },
    { category: "Mesh", term: "Δx", desc: "Spatial grid spacing: Δx = (xmax − xmin) / (nₓ − 1)." },
    { category: "Mesh", term: "Δy", desc: "Spatial grid spacing in y: Δy = (ymax − ymin) / (nᵧ − 1)." },
    { category: "Mesh", term: "Δt", desc: "Temporal step size: Δt = (tf − t0) / (nₜ − 1)." },
    { category: "Mesh", term: "CFL", desc: "Courant-Friedrichs-Lewy stability parameter (CFL = Δt/Δx²). A value ≤ 0.5 is required for explicit stability (✓). Values > 0.5 (⚠) indicate numerical instability risk, requiring Crank-Nicolson or BDF-2." },
    { category: "Solver", term: "Discretization", desc: "Spatial derivative approximation method (central, forward, backward)." },
    { category: "Solver", term: "Integrator", desc: "Time integration scheme: BDF-2 (stiff-stable), Crank-Nicolson (A-stable), or Runge-Kutta-Fehlberg 4(5) (adaptive)." },
    { category: "Solver", term: "Backend", desc: "Computation engine: numpy (CPU-bound) or cupy (CUDA-accelerated GPU execution)." },
    { category: "Result", term: "min(u)", desc: "Minimum field value computed across all spatial and temporal grid cells." },
    { category: "Result", term: "max(u)", desc: "Maximum field value computed across all spatial and temporal grid cells." },
    { category: "Result", term: "Cells", desc: "Total number of spatial-temporal mesh grid points (e.g. nₓ × nₜ or nₓ × nᵧ × nₜ)." },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 620 }}>
        <div className="modal-head">
          <div className="modal-title">Dicionário do Inspetor</div>
          <button className="btn btn-icon" onClick={onClose}><Icon.Close /></button>
        </div>
        <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>
            Explicação detalhada de cada métrica exibida no painel lateral do Inspetor.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {definitions.map((def, idx) => (
              <div key={idx} style={{
                display: "grid",
                gridTemplateColumns: "130px 1fr",
                gap: 12,
                borderBottom: "1px solid var(--border-soft)",
                paddingBottom: 10
              }}>
                <div>
                  <span style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-faint)",
                    display: "block",
                    fontWeight: 600
                  }}>{def.category}</span>
                  <span style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    fontSize: 13,
                    color: "var(--accent)"
                  }}>{def.term}</span>
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--text)" }}>
                  {def.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-primary btn-sm" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
