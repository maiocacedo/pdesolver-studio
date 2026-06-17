import { useStore, type PDEConfig } from "../state/store";
import { EquationBuilder } from "../equation/EquationBuilder";
import { Latex, pdeToLatex } from "../equation/Latex";
import { Field, NumberPair } from "../components/Field";
import { ConfigCard } from "../components/Card";
import { FEATURES } from "../features";
import type { BCType } from "../types";

type BCSide = "west" | "east" | "north" | "south";

interface BoundaryPanelProps {
  pde: PDEConfig;
  onChange: (patch: Partial<PDEConfig>) => void;
  is2D?: boolean;
}

function BoundaryPanel({ pde, onChange, is2D }: BoundaryPanelProps) {
  const types: BCType[] = ["Dirichlet", "Neumann", "Robin"];

  const BcCard = ({ side, label, arrow, axis }: { side: BCSide; label: string; arrow: string; axis: string }) => {
    const bc = pde[side] ?? { type: "Dirichlet" as BCType, expr: "0" };
    return (
      <div className="bc-card">
        <div className="bc-title">
          <span className="bc-arrow">{arrow}</span> {label} —{" "}
          <span className="mono" style={{ textTransform: "none", color: "var(--text-faint)" }}>
            {axis}
          </span>
        </div>
        <div className="seg" style={{ width: "100%" }}>
          {types.map((t) => (
            <button key={t} data-active={bc.type === t ? "1" : "0"}
                    onClick={() => onChange({ [side]: { ...bc, type: t } } as Partial<PDEConfig>)}>
              {t}
            </button>
          ))}
        </div>
        <div className="input-group">
          <span className="addon" style={{ borderLeft: 0, borderRight: "1px solid var(--border)" }}>
            {bc.type === "Dirichlet" ? `${pde.func} =` : bc.type === "Neumann" ? `∂${pde.func}/∂n =` : `a${pde.func}+b∂${pde.func}/∂n =`}
          </span>
          <input className="input input-mono" value={bc.expr}
                 onChange={(e) => onChange({ [side]: { ...bc, expr: e.target.value } } as Partial<PDEConfig>)}
                 placeholder={bc.type === "Neumann" ? `∂${pde.func}/∂n` : "value"} />
        </div>
      </div>
    );
  };

  return (
    <div className="bcs">
      <BcCard side="west" label="West" arrow="◀" axis="x = xₘᵢₙ" />
      <BcCard side="east" label="East" arrow="▶" axis="x = xₘₐₓ" />
      {is2D && <>
        <BcCard side="south" label="South" arrow="▼" axis="y = yₘᵢₙ" />
        <BcCard side="north" label="North" arrow="▲" axis="y = yₘₐₓ" />
      </>}
    </div>
  );
}

const IC_PRESETS = ["sin(pi*x)", "exp(-50*(x-0.5)**2)", "1 - abs(2*x - 1)", "0"];

export function Sidebar() {
  const system = useStore((s) => s.system);
  const uiMode = useStore((s) => s.ui.mode);
  const setPdeField = useStore((s) => s.setPdeField);
  const setDomain = useStore((s) => s.setDomain);
  const setMesh = useStore((s) => s.setMesh);
  const setScheme = useStore((s) => s.setScheme);
  const addPde = useStore((s) => s.addPde);
  const removePde = useStore((s) => s.removePde);
  const setActivePde = useStore((s) => s.setActivePde);
  const status = useStore((s) => s.run.status);
  const runError = useStore((s) => s.run.error);

  const activePde = system.pdes.find((p) => p.id === system.activePdeId) ?? system.pdes[0];
  const { domain, mesh, scheme } = system;

  const patchPde = (patch: Partial<PDEConfig>) => setPdeField(activePde.id, patch);

  const is2D = FEATURES.TWO_D && !!domain.ymin && mesh.ny !== undefined;
  const dx = (parseFloat(domain.xmax) - parseFloat(domain.xmin)) / Math.max(1, mesh.nx - 1);
  const dy = is2D && domain.ymax && mesh.ny
    ? (parseFloat(domain.ymax) - parseFloat(domain.ymin!)) / Math.max(1, mesh.ny - 1)
    : null;

  const pdeList = system.pdes.map((_p, i) => `pde${i + 1}`);
  const codePreview = [
    ...system.pdes.map((p, i) => [
      `${pdeList[i]} = PDE(`,
      `  eq="${p.eq}",`,
      `  func="${p.func}",`,
      `  sp_var=${is2D ? '["x", "y"]' : '["x"]'}, ivar=["t"],`,
      `  ivar_boundary=[(${domain.xmin}, ${domain.xmax})${is2D ? `, (${domain.ymin}, ${domain.ymax})` : ""}],`,
      `  expr_ic="${p.ic}",`,
      `  west_bd="${p.west.type}", west_func_bd="${p.west.expr}",`,
      `  east_bd="${p.east.type}", east_func_bd="${p.east.expr}",`,
      ...(is2D ? [
        `  north_bd="${p.north?.type ?? "Dirichlet"}", north_func_bd="${p.north?.expr ?? "0"}",`,
        `  south_bd="${p.south?.type ?? "Dirichlet"}", south_func_bd="${p.south?.expr ?? "0"}",`,
      ] : []),
      `)`,
    ].join("\n")),
    `sistema = PDES(pdes=[${pdeList.join(", ")}], disc_n=[${mesh.nx}${is2D ? `, ${mesh.ny}` : ""}])`,
    `sistema.discretize(method='${scheme.disc}')`,
    `sistema.solve(method='${scheme.time}', tf=${domain.tf}, nt=${mesh.nt})`,
  ].join("\n");

  return (
    <aside className="studio-sidebar">

      {FEATURES.PDE_SYSTEMS && (
        <ConfigCard step="1" title="System Functions" complete>
          <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%" }}>
            <div className="seg" style={{ flex: 1, overflowX: "auto" }}>
              {system.pdes.map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", position: "relative", flex: 1 }}>
                  <button
                    data-active={p.id === system.activePdeId ? "1" : "0"}
                    style={{
                      width: "100%",
                      paddingRight: system.pdes.length > 1 ? "24px" : "8px",
                      position: "relative",
                      fontFamily: "var(--font-mono)",
                    }}
                    onClick={() => setActivePde(p.id)}
                  >
                    {p.func}
                  </button>
                  {system.pdes.length > 1 && (
                    <button
                      style={{
                        position: "absolute",
                        right: 4,
                        top: "50%",
                        transform: "translateY(-50%)",
                        border: 0,
                        background: "none",
                        padding: "0 4px",
                        fontSize: 12,
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        lineHeight: 1,
                        zIndex: 10,
                      }}
                      title={`Remove ${p.func}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        removePde(p.id);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              className="btn-icon"
              style={{
                padding: "6px 10px",
                fontSize: 14,
                fontWeight: 600,
                border: "1px dashed var(--border)",
                background: "transparent",
                borderRadius: "var(--r-3)",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
              title="Add PDE to system"
              onClick={addPde}
            >
              +
            </button>
          </div>
        </ConfigCard>
      )}

      {status === "error" && runError && (
        <div style={{
          margin: "0 12px 14px",
          padding: "12px",
          background: "oklch(0.2 0.05 20)",
          border: "1px solid oklch(0.4 0.15 20)",
          borderRadius: 8,
          color: "oklch(0.85 0.08 25)",
          fontSize: "12px",
          lineHeight: "1.45",
        }}>
          <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span>⚠️</span> Solver Execution Failed
          </div>
          <div style={{ fontFamily: "var(--font-mono)", wordBreak: "break-all", opacity: 0.9 }}>
            {runError}
          </div>
        </div>
      )}

      <ConfigCard step="2" title="Equation" complete>
        <EquationBuilder
          config={{ func: activePde.func, eq: activePde.eq }}
          setConfig={(c) => patchPde(c)}
        />
      </ConfigCard>

      <ConfigCard step="3" title="Domain & initial condition" complete={!!activePde.ic}>
        <Field label="Spatial domain (x)">
          <NumberPair
            a={domain.xmin} b={domain.xmax}
            onA={(v) => setDomain({ xmin: v })} onB={(v) => setDomain({ xmax: v })}
            labelA="xₘᵢₙ" labelB="xₘₐₓ"
          />
        </Field>
        {FEATURES.TWO_D && (
          <Field label="Spatial domain (y)" hint="Leave blank for 1D">
            <NumberPair
              a={domain.ymin ?? ""} b={domain.ymax ?? ""}
              onA={(v) => setDomain({ ymin: v || undefined })} onB={(v) => setDomain({ ymax: v || undefined })}
              labelA="yₘᵢₙ" labelB="yₘₐₓ"
            />
          </Field>
        )}
        <Field label="Time interval">
          <NumberPair
            a={domain.t0} b={domain.tf}
            onA={(v) => setDomain({ t0: v })} onB={(v) => setDomain({ tf: v })}
            labelA="t₀" labelB="tƒ"
          />
        </Field>
        <Field label="Initial condition" hint={`${activePde.func}(x, 0) — symbolic expression.`}>
          <div className="input-group">
            <span className="addon" style={{ borderLeft: 0, borderRight: "1px solid var(--border)" }}>
              {activePde.func}(x,0) =
            </span>
            <input className="input input-mono" value={activePde.ic}
                   onChange={(e) => patchPde({ ic: e.target.value })} />
          </div>
          <div style={{
            marginTop: 8,
            padding: "8px 12px",
            background: "var(--surface-alt)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            minHeight: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflowX: "auto",
            fontSize: "13px",
            color: "var(--text)"
          }}>
            <Latex math={`${activePde.func}(${is2D ? "x, y" : "x"}, 0) = ${pdeToLatex(activePde.ic || " ")}`} block />
          </div>
        </Field>
        {uiMode === "advanced" && (
          <Field label="Suggested presets">
            <div className="chips">
              {IC_PRESETS.map((p) => (
                <button key={p} className="chip" onClick={() => patchPde({ ic: p })}>{p}</button>
              ))}
            </div>
          </Field>
        )}
      </ConfigCard>

      <ConfigCard step="4" title="Boundary conditions" complete>
        <BoundaryPanel pde={activePde} onChange={patchPde} is2D={is2D} />
      </ConfigCard>

      <ConfigCard step="5" title="Mesh & solver" complete>
        <Field label="Spatial points (nₓ)" hint={`Δx ≈ ${dx.toFixed(4)}`}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="range" min="10" max="400" step="1" value={mesh.nx}
                   onChange={(e) => setMesh({ nx: Number(e.target.value) })}
                   style={{ flex: 1 }} />
            <input className="input input-mono" style={{ width: 70, textAlign: "right" }}
                   value={mesh.nx}
                   onChange={(e) => setMesh({ nx: Number(e.target.value) || 50 })} />
          </div>
        </Field>
        {FEATURES.TWO_D && is2D && (
          <Field label="Spatial points (nᵧ)" hint={dy ? `Δy ≈ ${dy.toFixed(4)}` : "2D"}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="range" min="5" max="400" step="1" value={mesh.ny ?? 21}
                     onChange={(e) => setMesh({ ny: Number(e.target.value) })}
                     style={{ flex: 1 }} />
              <input className="input input-mono" style={{ width: 70, textAlign: "right" }}
                     value={mesh.ny ?? ""}
                     onChange={(e) => setMesh({ ny: Number(e.target.value) || undefined })} />
            </div>
          </Field>
        )}

        <Field label="Spatial discretization">
          <div className="seg" style={{ width: "100%" }}>
            {(["backward", "central", "forward"] as const).map((m) => (
              <button key={m} data-active={scheme.disc === m ? "1" : "0"}
                      onClick={() => setScheme({ disc: m })}>{m}</button>
            ))}
          </div>
        </Field>

        <Field label="Time integration">
          <div className="seg" style={{ width: "100%" }}>
            {([
              { v: "bdf2" as const, l: "BDF-2" },
              { v: "CN" as const, l: "CN" },
              { v: "RKF" as const, l: "RKF" },
            ]).map((m) => (
              <button key={m.v} data-active={scheme.time === m.v ? "1" : "0"}
                      onClick={() => setScheme({ time: m.v })}>{m.l}</button>
            ))}
          </div>
          <span className="field-hint">
            {scheme.time === "bdf2" ? "BDF-2: implicit, stiff-stable (default)" :
             scheme.time === "CN" ? "Crank–Nicolson: 2nd-order, A-stable" :
             "Runge–Kutta–Fehlberg 4(5) on CUDA — needs pdesolver[gpu]"}
          </span>
        </Field>

        <Field label="Time steps (nₜ)">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="range" min="10" max="4000" step="10" value={mesh.nt}
                   onChange={(e) => setMesh({ nt: Number(e.target.value) })}
                   style={{ flex: 1 }} />
            <input className="input input-mono" style={{ width: 70, textAlign: "right" }}
                   value={mesh.nt}
                   onChange={(e) => setMesh({ nt: Number(e.target.value) || 100 })} />
          </div>
        </Field>
      </ConfigCard>

      {uiMode === "advanced" && (
        <div className="card" style={{ background: "transparent", border: "1px dashed var(--border)" }}>
          <div className="card-body" style={{ padding: "14px", alignItems: "center", gap: 6 }}>
            <span className="mono faint" style={{ fontSize: 11 }}>Generated API call</span>
            <pre style={{
              margin: 0, fontFamily: "var(--font-mono)", fontSize: 11,
              color: "var(--text-muted)", whiteSpace: "pre-wrap", textAlign: "left",
              width: "100%", lineHeight: 1.6,
            }}>{codePreview}</pre>
          </div>
        </div>
      )}
    </aside>
  );
}
