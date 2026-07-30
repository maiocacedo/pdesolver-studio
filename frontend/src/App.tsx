import { useCallback, useEffect, useState } from "react";
import { DesktopShell } from "./shell/desktop/DesktopShell";
import { LoadingScreen } from "./shell/desktop/LoadingScreen";
import { useAppReady } from "./shell/useAppReady";

export function App() {
  const { ready, progress, message } = useAppReady();
  const [mountShell, setMountShell] = useState(false);
  const [shellMounted, setShellMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // The loading screen renders alone on the first commit so it paints fast.
  // After that paint we (a) hand off from the static index.html splash and
  // (b) mount the heavy studio *behind* the loading screen, so its mount cost
  // is masked instead of leaving a blank screen. (Previously the shell rendered
  // in the same commit as the loading screen, so the screen could only appear
  // after the studio had already rendered.)
  useEffect(() => {
    const staticSplash = document.getElementById("splash");
    if (staticSplash) {
      staticSplash.style.transition = "opacity 0.3s ease-out";
      staticSplash.style.opacity = "0";
      window.setTimeout(() => staticSplash.remove(), 300);
    }
    // Defer with a macrotask (not rAF): this effect already runs after the
    // loading screen's first paint, and setTimeout fires even when the page
    // isn't compositing (e.g. launched minimized) — rAF would not, which could
    // strand the app on the splash.
    const id = window.setTimeout(() => setMountShell(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const onShellReady = useCallback(() => setShellMounted(true), []);

  // Reveal only once real readiness signals resolved AND the studio has painted.
  const canReveal = ready && shellMounted;

  // Keep the loading screen mounted through its fade-out, then remove it.
  useEffect(() => {
    if (!canReveal) return;
    const t = window.setTimeout(() => setShowSplash(false), 440);
    return () => window.clearTimeout(t);
  }, [canReveal]);

  return (
    <>
      {mountShell && <DesktopShell onReady={onShellReady} />}
      {showSplash && (
        <LoadingScreen message={message} progress={progress} hiding={canReveal} />
      )}
    </>
  );
}
