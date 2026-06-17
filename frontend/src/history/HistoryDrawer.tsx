import { useStore } from "../state/store";
import { Icon } from "../components/Icon";

interface Props {
  onClose: () => void;
}

export function HistoryDrawer({ onClose }: Props) {
  const history = useStore((s) => s.run.history);
  const loadPreset = useStore((s) => s.loadPreset);

  if (history.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 32, color: "var(--text-faint)" }}>
        <Icon.History />
        <div style={{ marginTop: 8, fontSize: 13 }}>No runs yet</div>
        <div style={{ marginTop: 4, fontSize: 12 }}>Click Run to save a result here.</div>
      </div>
    );
  }

  return (
    <>
      {history.map((item, i) => (
        <div key={i} className="history-item">
          <div style={{
            width: 36, height: 36, borderRadius: 6, background: "var(--accent-soft)",
            color: "var(--accent)", display: "grid", placeItems: "center",
            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
          }}>
            {String(i + 1).padStart(2, "0")}
          </div>
          <div className="history-item-body">
            <div className="history-item-name">{item.name}</div>
            <div className="history-item-meta">
              {item.time} · {item.nx}{item.ny !== undefined ? `×${item.ny}` : ""}×{item.nt} · {item.method}
            </div>
          </div>
          <button className="btn btn-outline btn-sm"
                  onClick={() => { loadPreset(item.snapshot); onClose(); }}>
            Load
          </button>
        </div>
      ))}
    </>
  );
}
