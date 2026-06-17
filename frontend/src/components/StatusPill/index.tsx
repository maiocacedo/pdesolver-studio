interface StatusPillProps {
  ok?: boolean;
  pending?: boolean;
  label: string;
}

export function StatusPill({ ok, pending, label }: StatusPillProps) {
  const state = pending ? "pending" : ok ? "ok" : "";
  return (
    <span className="status-pill" data-state={state}>
      <span className="status-dot" />
      {label}
    </span>
  );
}
