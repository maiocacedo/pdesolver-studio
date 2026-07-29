import { useEffect, useState } from "react";
import { DesktopShell } from "./shell/desktop/DesktopShell";
import { LoadingScreen } from "./shell/desktop/LoadingScreen";
import { useAppReady } from "./shell/useAppReady";

export function App() {
  const { ready, progress, message } = useAppReady();
  const [showSplash, setShowSplash] = useState(true);

  // Keep the splash mounted through its fade-out, then remove it.
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setShowSplash(false), 440);
    return () => window.clearTimeout(t);
  }, [ready]);

  return (
    <>
      <DesktopShell />
      {showSplash && (
        <LoadingScreen message={message} progress={progress} hiding={ready} />
      )}
    </>
  );
}
