import { Component, type ErrorInfo, type ReactNode } from "react";
import { Icon } from "./Icon";

interface Props {
  children: ReactNode;
  /** Short label for what failed, e.g. "a visualização". */
  label?: string;
  /** When any of these values change, a caught error is cleared automatically. */
  resetKeys?: unknown[];
}

interface State {
  error: Error | null;
}

/**
 * Catches render/lifecycle errors in its subtree (e.g. a Three.js/WebGL crash)
 * and shows a recoverable fallback instead of white-screening the whole app.
 * `resetKeys` lets a parent auto-clear the error when context changes (tab
 * switch, re-solve), and the button offers a manual retry.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && !shallowEqual(prev.resetKeys, this.props.resetKeys)) {
      this.setState({ error: null });
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-icon"><Icon.Alert /></div>
          <div className="error-boundary-title">
            Algo quebrou {this.props.label ? `em ${this.props.label}` : "aqui"}
          </div>
          <div className="error-boundary-msg">{this.state.error.message}</div>
          <button className="btn btn-outline btn-sm" onClick={this.reset}>
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function shallowEqual(a?: unknown[], b?: unknown[]): boolean {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  return a.every((v, i) => Object.is(v, b[i]));
}
