import { useToastStore, type ToastType } from "./toastStore";
import { Icon } from "../Icon";

const ICON: Record<ToastType, JSX.Element> = {
  success: <Icon.Check />,
  error: <Icon.Alert />,
  info: <Icon.Inspect />,
};

/**
 * Renders the stack of active toasts (bottom-right). Mounted once near the top
 * of the shell. Toasts auto-dismiss (see toastStore) and can be closed early.
 */
export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-host" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast" data-type={t.type} role="status">
          <span className="toast-icon">{ICON[t.type]}</span>
          <span className="toast-msg">{t.message}</span>
          <button
            className="toast-close"
            onClick={() => dismiss(t.id)}
            aria-label="Fechar"
            title="Fechar"
          >
            <Icon.Close />
          </button>
        </div>
      ))}
    </div>
  );
}
