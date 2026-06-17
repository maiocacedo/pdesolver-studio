/** Assemble a payload-ready equation string from a builder config. */

import { SPACE_OPS, TIME_OPS } from "./registry";

export interface Term {
  coef: string;
  op: string;
}

export interface EqConfig {
  lhs: string;
  terms: Term[];
  source: string;
}

export function eqToApi({ lhs, terms, source }: EqConfig): string {
  const left = TIME_OPS[lhs]?.api ?? "duxy/dt";

  const rightParts = terms.map((t, i) => {
    const op = SPACE_OPS[t.op];
    if (!op) return "";
    const coefRaw = (t.coef ?? "").toString().trim() || "1";
    const isNeg = coefRaw.startsWith("-");
    const absCoef = coefRaw.replace(/^-/, "") || "1";
    const sign = i === 0 ? (isNeg ? "-" : "") : isNeg ? " - " : " + ";
    const c = absCoef === "1" ? "" : `${absCoef}*`;
    return `${sign}${c}${op.api}`;
  });

  let right = rightParts.join("");
  if (source && source.trim()) right += ` + ${source.trim()}`;
  if (!right) right = "0";
  return `${left} = ${right}`;
}
