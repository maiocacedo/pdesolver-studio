import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

interface NumberPairProps {
  a: string;
  b: string;
  onA: (v: string) => void;
  onB: (v: string) => void;
  labelA?: string;
  labelB?: string;
}

export function NumberPair({ a, b, onA, onB, labelA = "a", labelB = "b" }: NumberPairProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <div className="input-group">
        <input className="input input-mono" value={a} onChange={(e) => onA(e.target.value)} />
        <span className="addon">{labelA}</span>
      </div>
      <div className="input-group">
        <input className="input input-mono" value={b} onChange={(e) => onB(e.target.value)} />
        <span className="addon">{labelB}</span>
      </div>
    </div>
  );
}
