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
    <div className="card">
      <div className="card-head" onClick={() => setExpanded(!expanded)} style={{ cursor: "pointer", userSelect: "none" }}>
        <div className="card-step" data-complete={complete ? "1" : "0"}>{step}</div>
        <div className="card-title">{title}</div>
        {status && <div className="card-status">{status}</div>}
        <div style={{
          marginLeft: "auto",
          fontSize: 10,
          transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.15s ease",
          color: "var(--text-faint)",
          paddingRight: 4
        }}>
          ▶
        </div>
      </div>
      {expanded && <div className="card-body">{children}</div>}
    </div>
  );
}
