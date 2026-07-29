interface Props {
  message: string;
  progress: number; // 0–100
  hiding: boolean;
}

/**
 * Full-screen branded splash shown during startup. Visually mirrors the static
 * splash in index.html so the hand-off from first paint to React is seamless,
 * then continues until real readiness signals resolve (see useAppReady).
 */
export function LoadingScreen({ message, progress, hiding }: Props) {
  return (
    <div className="loading-screen" data-hiding={hiding ? "1" : "0"}>
      <div className="loading-glyph">∂</div>
      <div className="loading-wordmark">pdesolver studio</div>

      <div className="loading-track">
        <div className="loading-track-fill" style={{ width: `${progress}%` }} />
        <div className="loading-track-shimmer" />
      </div>

      <div className="loading-message">{message}</div>
    </div>
  );
}
