/**
 * Lightweight i18n dictionary. Keys are grouped by area; each has a pt and en
 * string. Default language is pt. Add keys here and use `useT()` / `t()`.
 *
 * This is an incremental migration — the most visible / mixed-language UI chrome
 * is covered first. Remaining prose (tour steps, About/Dictionary modals, menu
 * bar, console log lines) still lives inline and can be migrated later.
 */
export type Lang = "pt" | "en";

export const messages = {
  pt: {
    // Viz — tabs & layout
    "viz.tab.plot1d": "Perfil 1D",
    "viz.tab.heatmap": "Mapa de calor",
    "viz.tab.plot3d": "Superfície 3D",
    "viz.layout.tabs": "Abas",
    "viz.layout.grid": "Grade",
    "viz.layout.dashboard": "Painel em grade",
    // Viz — actions
    "viz.export": "Exportar",
    "viz.exportChart": "Exportar gráfico",
    "viz.maximize": "Maximizar",
    "viz.restore": "Restaurar",
    "viz.snapshot": "Instantâneo",
    "viz.allProfiles": "Todos os perfis",
    "viz.rec": "Gravar",
    "viz.loading3d": "Preparando engine 3D…",
    // Viz — panel titles
    "viz.panel.plot1d": "Perfil 1D",
    "viz.panel.heatmap": "Mapa de calor",
    "viz.panel.plot3d": "Superfície 3D",
    "viz.panel.console": "Estatísticas do Solver & Console",
    // Inspector
    "inspector.title": "Inspetor",
    "inspector.section.problem": "Problema",
    "inspector.section.mesh": "Malha",
    "inspector.section.solver": "Solver",
    "inspector.section.lastResult": "Último resultado",
    // Sidebar
    "sidebar.card.equations": "Equações",
    "sidebar.card.numeric": "Numérico",
    "sidebar.discretizeOnly": "Apenas discretizar",
    "sidebar.processing": "Processando…",
    // Tweaks
    "tweaks.language": "Idioma",
  },
  en: {
    "viz.tab.plot1d": "1D profile",
    "viz.tab.heatmap": "Heatmap",
    "viz.tab.plot3d": "Surface 3D",
    "viz.layout.tabs": "Tabs",
    "viz.layout.grid": "Grid",
    "viz.layout.dashboard": "Dashboard Grid",
    "viz.export": "Export",
    "viz.exportChart": "Export chart",
    "viz.maximize": "Maximize",
    "viz.restore": "Restore",
    "viz.snapshot": "Snapshot",
    "viz.allProfiles": "All profiles",
    "viz.rec": "Rec",
    "viz.loading3d": "Preparing 3D engine…",
    "viz.panel.plot1d": "1D Profile",
    "viz.panel.heatmap": "Heatmap",
    "viz.panel.plot3d": "Surface 3D",
    "viz.panel.console": "Solver Statistics & Console",
    "inspector.title": "Inspector",
    "inspector.section.problem": "Problem",
    "inspector.section.mesh": "Mesh",
    "inspector.section.solver": "Solver",
    "inspector.section.lastResult": "Last result",
    "sidebar.card.equations": "Equations",
    "sidebar.card.numeric": "Numeric",
    "sidebar.discretizeOnly": "Discretize only",
    "sidebar.processing": "Processing…",
    "tweaks.language": "Language",
  },
} as const;

export type MsgKey = keyof (typeof messages)["pt"];
