import type { Term } from "./serialize";
import { TIME_OPS, SPACE_OPS } from "./registry";

interface MathEqProps {
  func: string;
  lhs: string;
  terms: Term[];
  source: string;
}

export function MathEq({ func, lhs, terms, source }: MathEqProps) {
  return (
    <div className="math">
      {TIME_OPS[lhs]?.render(func) ?? null}
      <span className="op">=</span>
      {terms.length === 0 && (
        <span className="faint" style={{ fontStyle: "normal" }}>(add a term)</span>
      )}
      {terms.map((t, i) => {
        const op = SPACE_OPS[t.op];
        if (!op) return null;
        const coef = (t.coef ?? "").toString().trim();
        const isFirst = i === 0;
        const sign = coef.startsWith("-") ? "−" : "+";
        const absCoef = coef.replace(/^-/, "");
        return (
          <span key={i} style={{ display: "contents" }}>
            {!isFirst && <span className="op">{sign}</span>}
            {isFirst && coef.startsWith("-") && <span className="op">−</span>}
            {absCoef && absCoef !== "1" && <span className="num">{absCoef}</span>}
            {op.render(func)}
          </span>
        );
      })}
      {source && source.trim() && (
        <>
          <span className="op">+</span>
          <span className="fn" style={{ fontFamily: "var(--font-math)" }}>{source}</span>
        </>
      )}
    </div>
  );
}
