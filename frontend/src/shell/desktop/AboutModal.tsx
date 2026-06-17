import { Icon } from "../../components/Icon";

interface Props {
  onClose: () => void;
}

export function AboutModal({ onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">About pdesolver studio (em desenvolvimento)</div>
          <button className="btn btn-icon" onClick={onClose}><Icon.Close /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 14,
              background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
              color: "#fff", display: "grid", placeItems: "center",
              fontFamily: "var(--font-math)", fontStyle: "italic",
              fontSize: 36, fontWeight: 500, flexShrink: 0,
            }}>∂</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>
                pdesolver studio (em desenvolvimento)
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
                Version 0.1.0 · MIT License
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 14, lineHeight: 1.55 }}>
                Symbolic PDE solver using finite differences. Built on the pdesolver Python
                library, wrapped in a native window via pywebview.
              </div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 11.5, marginTop: 14,
                color: "var(--text-faint)", lineHeight: 1.7,
              }}>
                Python 3.9+ · numpy · sympy<br />
                Optional: cupy (CUDA 12) for GPU acceleration
              </div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-outline btn-sm">View on PyPI</button>
          <button className="btn btn-primary btn-sm" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}
