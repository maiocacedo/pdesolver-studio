# Guided Tour (Tutorial Interativo) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a step-by-step guided tour of the PDE Solver Studio with highlights (spotlights), a glassmorphic description popup, a custom 1D Wave preset loaded on start, and navigation/skip options.

**Architecture:** Extend the Zustand store (`store.ts`) with tour state (`tourActive`, `tourStep`) and transition effects. Build a React component (`TourOverlay.tsx`) that computes spotlight coordinates via `getBoundingClientRect` of target DOM elements. Render it on the main desktop shell (`DesktopShell.tsx`) when the tour is active, and trigger it automatically on mount.

**Tech Stack:** React, TypeScript, Zustand, Vanilla CSS.

---

### Task 1: Adicionar Preset "Onda 1D" Acoplada

**Files:**
- Modify: [examples.ts](file:///c:/Projetos/pdessolver-studio/frontend/src/gallery/examples.ts)

- [ ] **Step 1: Adicionar a função do preset e registrá-la no array `PRESETS`**
  Modificar o arquivo `frontend/src/gallery/examples.ts` para adicionar o novo preset de Onda 1D e adicioná-lo ao array `PRESETS`.

  ```typescript
  // Adicionar no final do arquivo frontend/src/gallery/examples.ts
  export function wave1DPreset(): SystemConfig {
    return {
      pdes: [
        {
          id: "wave-u",
          name: "u",
          func: "u",
          eq: "du/dt = v",
          ic: "exp(-200*(x-0.5)**2)",
          west: { type: "Dirichlet", expr: "0" },
          east: { type: "Dirichlet", expr: "0" },
        },
        {
          id: "wave-v",
          name: "v",
          func: "v",
          eq: "dv/dt = 2.25*d2u/dx2 - 0.05*v",
          ic: "0",
          west: { type: "Dirichlet", expr: "0" },
          east: { type: "Dirichlet", expr: "0" },
        }
      ],
      activePdeId: "wave-u",
      domain: { xmin: "0", xmax: "1", t0: "0", tf: "1.0" },
      mesh: { nx: 100, nt: 300 },
      scheme: { disc: "central", time: "CN" }
    };
  }
  ```

  Registrar no array `PRESETS`:
  ```typescript
  // Localize a declaração de PRESETS e adicione o item:
  export const PRESETS: GalleryItem[] = [
    {
      id: "wave-1d-coupled",
      title: "Wave — 1D coupled pulse",
      eq: "∂u/∂t = v,  ∂v/∂t = c²∂²u/∂x²",
      meta: "Hyperbolic · 1D · Gaussian IC",
      description: "A 1-D wave equation modeled as a coupled first-order system. Ideal for visualizing propagation, reflection and conservation of energy.",
      build: wave1DPreset,
    },
    // ... itens existentes ...
  ];
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/gallery/examples.ts
  git commit -m "feat: add 1D coupled wave preset to gallery examples"
  ```

---

### Task 2: Extensões do Zustand Store

**Files:**
- Modify: [store.ts](file:///c:/Projetos/pdessolver-studio/frontend/src/state/store.ts)

- [ ] **Step 1: Adicionar tipos de estado e ações em `UIState` e `Store`**
  Modificar as interfaces em `frontend/src/state/store.ts`:
  ```typescript
  // Adicionar na interface UIState
  export interface UIState {
    // ... campos existentes ...
    tourActive: boolean;
    tourStep: number;
  }

  // Adicionar na interface Store
  interface Store {
    // ... ações existentes ...
    startTour(): void;
    endTour(): void;
    nextTourStep(): void;
    prevTourStep(): void;
  }
  ```

- [ ] **Step 2: Implementar as ações no Zustand store**
  Adicionar a lógica de inicialização de valores e implementação das ações na declaração `useStore`:
  ```typescript
  // No valor inicial de ui:
  ui: {
    // ... valores existentes ...
    tourActive: false,
    tourStep: 0,
  },

  // E implementar as ações na store:
  startTour: () => {
    const wavePreset = wave1DPreset(); // Usar o novo preset
    set((s) => ({
      system: wavePreset,
      ui: {
        ...s.ui,
        tourActive: true,
        tourStep: 0,
        vizTab: "plot1d",
        layoutMode: "tabs",
        showInspector: false,
        maximizedPanel: null,
      },
      run: {
        ...s.run,
        status: "pristine",
        fields: null,
        activeFieldIndex: 0,
        visibleFieldIndices: [0],
        error: null,
        meta: null,
      }
    }));
  },

  endTour: () => set((s) => ({
    ui: { ...s.ui, tourActive: false, tourStep: 0 }
  })),

  nextTourStep: () => set((s) => {
    const nextStep = s.ui.tourStep + 1;
    let patch: Partial<UIState> = { tourStep: nextStep };

    // Efeitos colaterais com base no passo de destino
    if (nextStep === 3) {
      patch.vizTab = "plot1d";
      patch.layoutMode = "tabs";
    } else if (nextStep === 4) {
      patch.vizTab = "heatmap";
      patch.layoutMode = "tabs";
    } else if (nextStep === 5) {
      patch.vizTab = "plot3d";
      patch.layoutMode = "tabs";
    } else if (nextStep === 6) {
      patch.layoutMode = "grid";
      patch.maximizedPanel = null;
    } else if (nextStep === 7) {
      patch.showInspector = true;
    }

    return { ui: { ...s.ui, ...patch } };
  }),

  prevTourStep: () => set((s) => {
    const prevStep = Math.max(0, s.ui.tourStep - 1);
    let patch: Partial<UIState> = { tourStep: prevStep };

    if (prevStep === 3) {
      patch.vizTab = "plot1d";
      patch.layoutMode = "tabs";
    } else if (prevStep === 4) {
      patch.vizTab = "heatmap";
      patch.layoutMode = "tabs";
    } else if (prevStep === 5) {
      patch.vizTab = "plot3d";
      patch.layoutMode = "tabs";
    } else if (prevStep === 6) {
      patch.layoutMode = "grid";
      patch.maximizedPanel = null;
    } else if (prevStep === 7) {
      patch.showInspector = true;
    }

    return { ui: { ...s.ui, ...patch } };
  }),
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add frontend/src/state/store.ts
  git commit -m "feat: implement tour state and transitions in Zustand store"
  ```

---

### Task 3: Criar o Componente React `TourOverlay.tsx`

**Files:**
- Create: [TourOverlay.tsx](file:///c:/Projetos/pdessolver-studio/frontend/src/shell/desktop/TourOverlay.tsx)

- [ ] **Step 1: Escrever o código do componente de overlay e pop-up**
  Criar o arquivo `frontend/src/shell/desktop/TourOverlay.tsx` contendo a renderização e posicionamento do destaque e do popup.

  ```typescript
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
      desc: "No modo grade, você visualiza simultaneamente o perfil de onda, o heatmap espaço-tempo, o relevo 3D e o console de estatísticas da simulação em um só painel.",
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

    return (
      <div className="tour-overlay-root">
        {/* Backdrop escurecido */}
        <div className="tour-backdrop-bg" onClick={endTour} />

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
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/shell/desktop/TourOverlay.tsx
  git commit -m "feat: create TourOverlay react component"
  ```

---

### Task 4: Adicionar Estilos Globais do Tour no CSS

**Files:**
- Modify: [globals.css](file:///c:/Projetos/pdessolver-studio/frontend/src/styles/globals.css)

- [ ] **Step 1: Inserir regras CSS para o tour no final de `globals.css`**
  Modificar `frontend/src/styles/globals.css` para adicionar os estilos necessários do layout do tour (backdrop, spotlight e glassmorphism).

  ```css
  /* Tour Guided Overlay & Spotlight Styles */
  .tour-overlay-root {
    position: fixed;
    inset: 0;
    z-index: 99990;
    pointer-events: none;
  }

  .tour-backdrop-bg {
    position: fixed;
    inset: 0;
    background: rgba(8, 9, 14, 0.65);
    backdrop-filter: blur(2px);
    pointer-events: auto;
  }

  .tour-spotlight-box {
    position: fixed;
    border: 2px solid var(--accent);
    border-radius: 8px;
    box-shadow: 0 0 0 9999px rgba(8, 9, 14, 0.65), 0 0 15px rgba(100, 100, 255, 0.3);
    z-index: 99991;
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .tour-popup-card {
    position: fixed;
    z-index: 99992;
    width: 320px;
    border-radius: var(--r-3);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    pointer-events: auto;
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Style Glassmorphic */
  .tour-popup-card.style-glass {
    background: rgba(22, 25, 36, 0.85);
    backdrop-filter: blur(16px) saturate(140%);
    -webkit-backdrop-filter: blur(16px) saturate(140%);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .tour-popup-arrow {
    position: absolute;
    width: 10px;
    height: 10px;
    background: rgb(22, 25, 36);
    transform: rotate(45deg);
    border: 1px solid transparent;
    z-index: -1;
  }

  .tour-popup-arrow.arrow-left {
    left: -5px;
    top: 30px;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .tour-popup-arrow.arrow-right {
    right: -5px;
    top: 30px;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .tour-popup-arrow.arrow-top {
    top: -5px;
    left: calc(50% - 5px);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .tour-popup-arrow.arrow-bottom {
    bottom: -5px;
    left: calc(50% - 5px);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .tour-body {
    padding: 18px 20px;
  }

  .tour-title {
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 8px;
  }

  .tour-desc {
    font-size: 12.5px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .tour-math {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    background: rgba(0, 0, 0, 0.35);
    padding: 6px 10px;
    border-radius: var(--r-1);
    color: #a5b4fc;
    margin-top: 10px;
    border: 1px solid rgba(255, 255, 255, 0.04);
    word-break: break-all;
  }

  .tour-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding: 12px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .btn-skip {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 12px;
    padding: 4px 8px;
    transition: color 0.15s;
  }
  .btn-skip:hover {
    color: #f43f5e;
  }

  .btn-prev {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: var(--r-2);
    padding: 6px 12px;
    cursor: pointer;
    font-size: 12px;
    transition: border-color 0.15s;
  }
  .btn-prev:hover {
    border-color: var(--border-strong);
  }

  .btn-next {
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--r-2);
    padding: 6px 14px;
    font-weight: 500;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.15s;
  }
  .btn-next:hover {
    background: var(--accent-hover);
  }

  .tour-pagination {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .tour-dots {
    display: flex;
    gap: 4px;
  }

  .tour-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.2s ease;
  }

  .tour-dot.active {
    background: var(--accent);
    width: 12px;
    border-radius: 3px;
  }

  .tour-progress-text {
    font-size: 10px;
    color: var(--text-faint);
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/styles/globals.css
  git commit -m "style: add guided tour styles to globals.css"
  ```

---

### Task 5: Integração no MenuBar & DesktopShell

**Files:**
- Modify: [MenuBar.tsx](file:///c:/Projetos/pdessolver-studio/frontend/src/shell/desktop/MenuBar.tsx)
- Modify: [DesktopShell.tsx](file:///c:/Projetos/pdessolver-studio/frontend/src/shell/desktop/DesktopShell.tsx)

- [ ] **Step 1: Adicionar a ação `startTour` em `MenuActions` e no Menu de Help**
  Modificar `frontend/src/shell/desktop/MenuBar.tsx` para declarar e injetar o gatilho de Iniciar Tour:
  
  ```typescript
  // Na interface MenuActions (linhas 4-29)
  export interface MenuActions {
    // ... existentes ...
    startTour?: () => void; // Ação opcional
  }

  // E no menu de Help (linhas 127-133)
  <Menu id="help" label="Help">
    <Item label="Interactive Tour" onClick={actions.startTour} />
    <Item label="Documentation" onClick={() => {}} />
    <Item label="Keyboard shortcuts" onClick={() => {}} />
    <Item label="Inspector dictionary" onClick={actions.dictionary} />
    <div className="menu-sep" />
    <Item label="About pdesolver studio (em desenvolvimento)…" onClick={actions.about} />
  </Menu>
  ```

- [ ] **Step 2: Adicionar a ação no objeto `actions` do `DesktopShell.tsx`**
  Modificar `frontend/src/shell/desktop/DesktopShell.tsx` para passar `startTour` do store e renderizar o `<TourOverlay />`.

  ```typescript
  // Importar o novo componente
  import { TourOverlay } from "./TourOverlay";

  // E extrair startTour no início de DesktopShell():
  const startTour = useStore((s) => s.startTour);
  const tourActive = useStore((s) => s.ui.tourActive);

  // No objeto actions (linhas 82-241), adicione o mapeamento:
  const actions: MenuActions = {
    // ... existentes ...
    startTour,
  };

  // No final do retorno HTML de DesktopShell(), logo acima do rodapé ou como sibling direto:
  return (
    <>
      <div className="desktop-shell">
        {/* ... layout normal ... */}
      </div>

      {/* Renderizar o Overlay de Tour */}
      <TourOverlay />

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
      {dictionaryOpen && <DictionaryModal onClose={() => setDictionaryOpen(false)} />}
    </>
  );
  ```

- [ ] **Step 3: Adicionar gatilho automático de montagem (primeira carga)**
  Para fins de testes, adicione o `useEffect` para iniciar o tour na montagem inicial do `DesktopShell.tsx`:
  ```typescript
  useEffect(() => {
    // Disparar o tour imediatamente na carga da página para possibilitar testes rápidos via recarga F5
    startTour();
  }, [startTour]);
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add frontend/src/shell/desktop/MenuBar.tsx frontend/src/shell/desktop/DesktopShell.tsx
  git commit -m "feat: integrate interactive tour trigger and overlay in DesktopShell"
  ```

---

## Plano de Verificação Manual

1. **Recarregamento Automático:** Recarregue a janela (`F5` ou pelo navegador) e certifique-se de que o tour inicia sozinho.
2. **Preset de Onda 1D:** Verifique se as equações do sistema foram alteradas para $u$ e $v$, e se o domínio e intervalos mudaram para $[0, 1.0]$.
3. **Navegação (Seguir/Voltar/Pular):** Verifique se o botão "Seguir" altera a aba e layout, e se "Pular" encerra o tour.
4. **Trigger Manual:** Clique no menu `Help` -> `Interactive Tour` para relançar o tutorial.
5. **Destaque Spotlight:** Verifique visualmente se o spotlight alinha perfeitamente nos contornos dos cards da barra lateral de 2 abas.
