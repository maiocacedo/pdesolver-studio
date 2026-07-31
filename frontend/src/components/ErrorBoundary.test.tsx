// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./ErrorBoundary";

function Boom({ crash }: { crash: boolean }) {
  if (crash) throw new Error("kaboom");
  return <div>healthy child</div>;
}

describe("ErrorBoundary", () => {
  it("renders children when nothing throws", () => {
    const container = document.createElement("div");
    const root = createRoot(container);
    act(() => root.render(<ErrorBoundary><div>ok</div></ErrorBoundary>));
    expect(container.textContent).toContain("ok");
    act(() => root.unmount());
  });

  it("shows a recoverable fallback when a child throws", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => root.render(<ErrorBoundary label="a visualização"><Boom crash /></ErrorBoundary>));
    expect(container.textContent).toContain("Algo quebrou em a visualização");
    expect(container.textContent).toContain("kaboom");

    // Swap to a healthy child (still masked by the fallback), then hit retry.
    act(() => root.render(<ErrorBoundary label="a visualização"><Boom crash={false} /></ErrorBoundary>));
    act(() => (container.querySelector("button") as HTMLButtonElement).click());
    expect(container.textContent).toContain("healthy child");

    act(() => root.unmount());
    spy.mockRestore();
  });

  it("auto-clears the error when resetKeys change", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(<ErrorBoundary resetKeys={[1]}><Boom crash /></ErrorBoundary>));
    expect(container.textContent).toContain("Tentar novamente");

    act(() => root.render(<ErrorBoundary resetKeys={[2]}><Boom crash={false} /></ErrorBoundary>));
    expect(container.textContent).toContain("healthy child");

    act(() => root.unmount());
    spy.mockRestore();
  });
});
