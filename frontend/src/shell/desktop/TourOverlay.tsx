import { useEffect, useState, useRef, useCallback } from "react";
import { useStore } from "../../state/store";
import { TOUR_STEPS } from "../../state/tourSteps";

export function TourOverlay() {
  const tourActive = useStore((s) => s.ui.tourActive);
  const tourStep = useStore((s) => s.ui.tourStep);
  const nextTourStep = useStore((s) => s.nextTourStep);
  const prevTourStep = useStore((s) => s.prevTourStep);
  const endTour = useStore((s) => s.endTour);

  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0, visible: false });
  const [popupPos, setPopupPos] = useState({ top: "0px", left: "0px" });
  const popupRef = useRef<HTMLDivElement>(null);

  const step = TOUR_STEPS[tourStep];

  /**
   * Expand the sidebar card at `targetIndex` and collapse all others.
   * Detects current state by checking for the presence of `.card-body`.
   */
  const manageSidebarCards = useCallback((targetIndex: number) => {
    const cards = document.querySelectorAll<HTMLElement>(".studio-sidebar .card");
    cards.forEach((card, i) => {
      // The card body is always mounted now; expansion is tracked via data-expanded.
      const isExpanded = card.dataset.expanded === "1";
      const shouldExpand = i === targetIndex;
      if (isExpanded !== shouldExpand) {
        const head = card.querySelector<HTMLElement>(".card-head");
        head?.click();
      }
    });
  }, []);

  const measureAndPosition = useCallback(() => {
    if (!step) return;
    const el = document.querySelector<HTMLElement>(step.selector);
    if (!el) {
      setCoords((c) => ({ ...c, visible: false }));
      setPopupPos({ top: step.fallbackPosition.top, left: step.fallbackPosition.left });
      return;
    }

    const doScrollAndMeasure = () => {
      // Bring the target into the scrollable sidebar viewport
      const scrollTarget = step.scrollIntoViewSelector
        ? document.querySelector<HTMLElement>(step.scrollIntoViewSelector)
        : el;
      if (scrollTarget) {
        scrollTarget.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }

      // Wait for scroll + any layout shifts to settle before measuring
      setTimeout(() => {
        const rect = el.getBoundingClientRect();

        // Clamp the highlight box to the visible viewport (in case card is partially off-screen)
        const visTop = Math.max(rect.top, 0);
        const visBottom = Math.min(rect.bottom, window.innerHeight);
        const visLeft = Math.max(rect.left, 0);
        const visRight = Math.min(rect.right, window.innerWidth);
        const visWidth = Math.max(visRight - visLeft, 0);
        const visHeight = Math.max(visBottom - visTop, 0);

        const isVisible = visWidth > 10 && visHeight > 10;

        setCoords({
          top: isVisible ? visTop : rect.top,
          left: isVisible ? visLeft : rect.left,
          width: isVisible ? visWidth : rect.width,
          height: isVisible ? visHeight : rect.height,
          visible: isVisible,
        });

        // Calculate popup position based on full rect (where element actually is)
        if (!popupRef.current) return;
        const popRect = popupRef.current.getBoundingClientRect();
        let topVal = rect.top;
        let leftVal = rect.left;

        if (step.arrowClass === "arrow-left") {
          leftVal = rect.right + 20;
          topVal = rect.top + (rect.height / 2) - (popRect.height / 2);
        } else if (step.arrowClass === "arrow-right") {
          leftVal = rect.left - popRect.width - 20;
          topVal = rect.top + (rect.height / 2) - (popRect.height / 2);
        } else if (step.arrowClass === "arrow-top") {
          leftVal = rect.left + (rect.width / 2) - (popRect.width / 2);
          topVal = rect.bottom + 20;
        } else if (step.arrowClass === "arrow-bottom") {
          leftVal = rect.left + (rect.width / 2) - (popRect.width / 2);
          topVal = rect.top - popRect.height - 20;
        }

        // Hard clamp: keep popup fully on-screen
        leftVal = Math.max(10, Math.min(window.innerWidth - popRect.width - 10, leftVal));
        topVal = Math.max(10, Math.min(window.innerHeight - popRect.height - 10, topVal));

        setPopupPos({ top: `${topVal}px`, left: `${leftVal}px` });
      }, 180);
    };

    if (step.sidebarCardIndex !== undefined) {
      // First toggle the cards to the right state, then wait for React re-render
      manageSidebarCards(step.sidebarCardIndex);
      setTimeout(doScrollAndMeasure, 120);
    } else {
      doScrollAndMeasure();
    }
  }, [step, manageSidebarCards]);

  useEffect(() => {
    if (tourActive) {
      measureAndPosition();
      // Re-measure after layout-changing animations (inspector slide, sidebar
      // card drawers) have settled, so the spotlight lands on the final rect.
      const settleTimer = window.setTimeout(measureAndPosition, 380);
      window.addEventListener("resize", measureAndPosition);
      return () => {
        window.clearTimeout(settleTimer);
        window.removeEventListener("resize", measureAndPosition);
      };
    }
  }, [tourActive, tourStep, measureAndPosition]);


  if (!tourActive || !step) return null;

  const isLast = tourStep === TOUR_STEPS.length - 1;

  const getClipPath = () => {
    if (!coords.visible) return "none";
    const l = coords.left - 4;
    const t = coords.top - 4;
    const r = coords.left + coords.width + 4;
    const b = coords.top + coords.height + 4;
    return `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${l}px ${t}px, ${l}px ${b}px, ${r}px ${b}px, ${r}px ${t}px, ${l}px ${t}px)`;
  };

  return (
    <div className="tour-overlay-root">
      {/* Backdrop escurecido */}
      <div 
        className="tour-backdrop-bg" 
        style={{ clipPath: getClipPath() }}
        onClick={endTour} 
      />

      {/* Spotlight Highlighter */}
      {coords.visible && (
        <div
          className="tour-spotlight-box"
          style={{
            top: coords.top - 4,
            left: coords.left - 4,
            width: coords.width + 8,
            height: coords.height + 8,
          }}
        />
      )}

      {/* Popup Glassmorphic */}
      <div
        ref={popupRef}
        className="tour-popup-card style-glass"
        style={{
          top: popupPos.top,
          left: popupPos.left,
        }}
      >
        <div className={`tour-popup-arrow ${step.arrowClass}`} />
        
        <div className="tour-body">
          <div className="tour-title">
            <span className="tour-title-icon">{step.icon}</span>
            {step.title}
          </div>
          <div className="tour-desc">{step.desc}</div>
          {step.math && <div className="tour-math">{step.math}</div>}
        </div>

        <div className="tour-footer">
          <button className="btn-skip" onClick={endTour}>Pular</button>
          
          <div className="tour-pagination">
            <div className="tour-dots">
              {TOUR_STEPS.map((_, i) => (
                <span key={i} className={`tour-dot${i === tourStep ? " active" : ""}`} />
              ))}
            </div>
            <span className="tour-progress-text">Passo {tourStep + 1} de {TOUR_STEPS.length}</span>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {tourStep > 0 && (
              <button className="btn-prev" onClick={prevTourStep}>Voltar</button>
            )}
            <button
              className="btn-next"
              onClick={isLast ? endTour : nextTourStep}
            >
              {isLast ? "Finalizar" : "Seguir"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
