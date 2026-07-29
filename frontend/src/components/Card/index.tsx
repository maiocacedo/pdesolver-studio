import { useState, type ReactNode } from "react";

interface ConfigCardProps {
  step: string | number;
  title: string;
  status?: string;
  complete?: boolean;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function ConfigCard({ step, title, status, complete, children, defaultExpanded = true }: ConfigCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div className="card" data-expanded={expanded ? "1" : "0"}>
      <div className="card-head" onClick={() => setExpanded(!expanded)} style={{ cursor: "pointer", userSelect: "none" }}>
        <div className="card-step" data-complete={complete ? "1" : "0"}>{step}</div>
        <div className="card-title">{title}</div>
        {status && <div className="card-status">{status}</div>}
        <div className="card-chevron">▶</div>
      </div>
      {/* Body is always mounted; the wrapper animates open/close like a drawer. */}
      <div className="card-body-wrap">
        <div className="card-body">{children}</div>
      </div>
    </div>
  );
}
