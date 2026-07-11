import { useEffect, useState, useRef } from "react";
import { useStore } from "../../state/store";

interface TourStepConfig {
  selector: string;
  title: string;
  desc: string;
  math?: string;
  arrowClass: string;
  fallbackPosition: { top: string; left: string };
}

const TOUR_STEPS: TourStepConfig[] = [
  {
    selector: ".studio-sidebar .card:nth-of-type(1)",
    title: "📝 Configuração das Equações",
    desc: "Aqui você define as equações diferenciais parciais (EDPs), a Condição Inicial u(x,0) e as Condições de Contorno nas extremidades Oeste (esquerda) e Leste (direita) da corda.",
    math: "∂u/∂t = v,   u(x,0) = e^{-200(x-0.5)²}",
    arrowClass: "arrow-left",
    fallbackPosition: { top: "100px", left: "400px" }
  },
  {
    selector: ".studio-sidebar .card:nth-of-type(2)",
    title: "🔢 Configurações Numéricas",
    desc: "Neste card você parametriza os limites espaciais e temporais do domínio, a resolução da malha (nx, nt) e seleciona os esquemas matemáticos de discretização e integração.",
    math: "nx = 100,   nt = 300,   Δt, Δx",
    arrowClass: "arrow-left",
    fallbackPosition: { top: "300px", left: "400px" }
  },
  {
    selector: '.toolbar button[title*="Run"]',
    title: "▶️ Executando o Solver",
    desc: "Clique em 'Run' (ou pressione F5) para resolver as equações numericamente. O sistema discretiza as derivadas e calcula a evolução temporal da onda.",
    arrowClass: "arrow-top",
    fallbackPosition: { top: "90px", left: "15px" }
  },
  {
    selector: ".viz-stage",
    title: "📈 Perfil da Onda (1D)",
    desc: "A aba Perfil 1D exibe a amplitude de oscilação da corda em tempo real. Você pode arrastar o controle deslizante (slider) na parte inferior para ver a onda viajar no tempo.",
    math: "u(x) no instante t",
    arrowClass: "arrow-top",
    fallbackPosition: { top: "180px", left: "400px" }
  },
  {
    selector: ".viz-stage",
    title: "🔥 Histórico em Mapa de Calor",
    desc: "O Mapa de Calor compacta toda a simulação espaço-temporal em um plano. O eixo horizontal é o tempo e o vertical é o espaço. A cor indica a amplitude da oscilação.",
    math: "Eixos: Tempo (t) × Espaço (x)",
    arrowClass: "arrow-top",
    fallbackPosition: { top: "180px", left: "400px" }
  },
  {
    selector: ".viz-stage",
    title: "📐 Superfície 3D (Espaço-Tempo)",
    desc: "Como a simulação da corda é unidimensional, a Superfície 3D exibe u(x, t) em relevo. NOTA: Em problemas 2D, o gráfico muda de sentido e passa a mostrar u(x, y) espacial em um único instante (como ondas em uma lagoa).",
    math: "Altura z = u(x, t)",
    arrowClass: "arrow-top",
    fallbackPosition: { top: "180px", left: "400px" }
  },
  {
    selector: ".viz-stage",
    title: "🎛️ Visão em Grade (Grid View)",
    desc: "No modo grade, você visualiza simultaneamente o perfil de onda, o mapa de calor espaço-tempo, o relevo 3D e o console de estatísticas da simulação em um só painel.",
    arrowClass: "arrow-top",
    fallbackPosition: { top: "180px", left: "400px" }
  },
  {
    selector: ".inspector",
    title: "🔍 Inspetor Científico",
    desc: "Analise a estabilidade numérica (CFL), os métodos ativos do Solver e estatísticas detalhadas dos resultados (min, max, células calculadas e convergência).",
    math: "CFL = dt / dx² ≤ 0.5",
    arrowClass: "arrow-right",
    fallbackPosition: { top: "120px", left: "430px" }
  },
  {
    selector: ".toolbar",
    title: "💾 Arquivos e Exportações",
    desc: "Use a barra superior para salvar seu projeto em JSON, importar presets ou exportar tabelas de dados em formato CSV e imagens de alta qualidade em PNG.",
    arrowClass: "arrow-top",
    fallbackPosition: { top: "90px", left: "300px" }
  }
];

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

  const updatePosition = () => {
    if (!step) return;
    const el = document.querySelector(step.selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        visible: true
      });

      // Calcular posição do popup
      setTimeout(() => {
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

        // Evitar estouro da tela
        leftVal = Math.max(10, Math.min(window.innerWidth - popRect.width - 10, leftVal));
        topVal = Math.max(10, Math.min(window.innerHeight - popRect.height - 10, topVal));

        setPopupPos({
          top: `${topVal}px`,
          left: `${leftVal}px`
        });
      }, 50);
    } else {
      setCoords((c) => ({ ...c, visible: false }));
      setPopupPos({
        top: step.fallbackPosition.top,
        left: step.fallbackPosition.left
      });
    }
  };

  useEffect(() => {
    if (tourActive) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      return () => window.removeEventListener("resize", updatePosition);
    }
  }, [tourActive, tourStep]);

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
          <div className="tour-title">{step.title}</div>
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
