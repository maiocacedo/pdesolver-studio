import type { ReactNode } from "react";

interface ConfigCardProps {
  step: string | number;
  title: string;
  status?: string;
  complete?: boolean;
  children: ReactNode;
}

export function ConfigCard({ step, title, status, complete, children }: ConfigCardProps) {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-step" data-complete={complete ? "1" : "0"}>{step}</div>
        <div className="card-title">{title}</div>
        {status && <div className="card-status">{status}</div>}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}
