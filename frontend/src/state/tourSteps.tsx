import type { ReactNode } from "react";
import { Icon } from "../components/Icon";
import type { UIState } from "./store";

export interface TourStepConfig {
  selector: string;
  title: string;
  /** SVG glyph shown next to the title (replaces the old emoji). */
  icon: ReactNode;
  desc: string;
  math?: string;
  arrowClass: string;
  fallbackPosition: { top: string; left: string };
  /** If set, scroll this selector into view before measuring */
  scrollIntoViewSelector?: string;
  /**
   * 0-based index of which .studio-sidebar .card should be expanded.
   * All other sidebar cards will be collapsed to maximize the visible area.
   */
  sidebarCardIndex?: number;
  /**
   * UI state to apply when this step becomes active (e.g. switch the viz tab or
   * layout so the highlighted target is actually on screen). Colocated here so
   * the choreography lives with the step instead of as magic indices in the
   * store's next/prev handlers.
   */
  onEnter?: Partial<UIState>;
}

export const TOUR_STEPS: TourStepConfig[] = [
  {
    selector: ".studio-sidebar .card:nth-of-type(1)",
    title: "Configuração das Equações",
    icon: <Icon.Function />,
    desc: "Aqui você define as equações diferenciais parciais (EDPs), a Condição Inicial u(x,0) e as Condições de Contorno nas extremidades Oeste (esquerda) e Leste (direita) da corda.",
    math: "∂u/∂t = v,   u(x,0) = e^{-200(x-0.5)²}",
    arrowClass: "arrow-left",
    scrollIntoViewSelector: ".studio-sidebar .card:nth-of-type(1) .card-head",
    sidebarCardIndex: 0,
    fallbackPosition: { top: "100px", left: "400px" }
  },
  {
    selector: ".studio-sidebar .card:nth-of-type(2)",
    title: "Configurações Numéricas",
    icon: <Icon.Mesh />,
    desc: "Neste card você parametriza os limites espaciais e temporais do domínio, a resolução da malha (nx, nt) e seleciona os esquemas matemáticos de discretização e integração.",
    math: "nx = 100,   nt = 300,   Δt, Δx",
    arrowClass: "arrow-left",
    scrollIntoViewSelector: ".studio-sidebar .card:nth-of-type(2) .card-head",
    sidebarCardIndex: 1,
    fallbackPosition: { top: "300px", left: "400px" }
  },
  {
    selector: '.toolbar button[title*="Run"]',
    title: "Executando o Solver",
    icon: <Icon.Run />,
    desc: "Clique em 'Run' (ou pressione F5) para resolver as equações numericamente. O sistema discretiza as derivadas e calcula a evolução temporal da onda.",
    arrowClass: "arrow-top",
    fallbackPosition: { top: "90px", left: "15px" }
  },
  {
    selector: ".desktop-main",
    title: "Perfil da Onda (1D)",
    icon: <Icon.Plot />,
    desc: "A aba Perfil 1D exibe a amplitude de oscilação da corda em tempo real. Você pode arrastar o controle deslizante (slider) na parte inferior para ver a onda viajar no tempo.",
    math: "u(x) no instante t",
    arrowClass: "arrow-top",
    onEnter: { vizTab: "plot1d", layoutMode: "tabs" },
    fallbackPosition: { top: "180px", left: "400px" }
  },
  {
    selector: ".desktop-main",
    title: "Histórico em Mapa de Calor",
    icon: <Icon.Heatmap />,
    desc: "O Mapa de Calor compacta toda a simulação espaço-temporal em um plano. O eixo horizontal é o tempo e o vertical é o espaço. A cor indica a amplitude da oscilação.",
    math: "Eixos: Tempo (t) × Espaço (x)",
    arrowClass: "arrow-top",
    onEnter: { vizTab: "heatmap", layoutMode: "tabs" },
    fallbackPosition: { top: "180px", left: "400px" }
  },
  {
    selector: ".desktop-main",
    title: "Superfície 3D (Espaço-Tempo)",
    icon: <Icon.Cube />,
    desc: "Como a simulação da corda é unidimensional, a Superfície 3D exibe u(x, t) em relevo. NOTA: Em problemas 2D, o gráfico muda de sentido e passa a mostrar u(x, y) espacial em um único instante (como ondas em uma lagoa).",
    math: "Altura z = u(x, t)",
    arrowClass: "arrow-top",
    onEnter: { vizTab: "plot3d", layoutMode: "tabs" },
    fallbackPosition: { top: "180px", left: "400px" }
  },
  {
    selector: ".desktop-main",
    title: "Visão em Grade (Grid View)",
    icon: <Icon.Gallery />,
    desc: "No modo grade, você visualiza simultaneamente o perfil de onda, o mapa de calor espaço-tempo, o relevo 3D e o console de estatísticas da simulação em um só painel.",
    arrowClass: "arrow-top",
    onEnter: { layoutMode: "grid", maximizedPanel: null },
    fallbackPosition: { top: "180px", left: "400px" }
  },
  {
    selector: ".inspector",
    title: "Inspetor Científico",
    icon: <Icon.Inspect />,
    desc: "Analise a estabilidade numérica (CFL), os métodos ativos do Solver e estatísticas detalhadas dos resultados (min, max, células calculadas e convergência).",
    math: "CFL = dt / dx² ≤ 0.5",
    arrowClass: "arrow-right",
    onEnter: { showInspector: true },
    fallbackPosition: { top: "120px", left: "430px" }
  },
  {
    selector: ".toolbar",
    title: "Arquivos e Exportações",
    icon: <Icon.Save />,
    desc: "Use a barra superior para salvar seu projeto em JSON, importar presets ou exportar tabelas de dados em formato CSV e imagens de alta qualidade em PNG.",
    arrowClass: "arrow-top",
    fallbackPosition: { top: "90px", left: "300px" }
  }
];
