# Studio Aesthetics — Design Spec

**Date:** 2026-07-29
**Branch:** `feat/studio-aesthetics`

Refinamentos estéticos no PDE Solver Studio (frontend React/TS). Sistema de
movimento coerente: easing `cubic-bezier(0.32, 0.72, 0.3, 1)` (o mesmo do
componente `Drawer`), durações 240–280ms.

## 1. Sidebar — animação de card (gaveta)
- `ConfigCard` renderiza o corpo **sempre**, dentro de `.card-body-wrap` que
  anima `grid-template-rows: 0fr → 1fr` + fade do conteúdo (~0.26s).
- Seta ▶ mantém o giro 0°→90° com o easing de gaveta.
- **Acoplamento:** o tour detectava card aberto por presença de `.card-body`.
  Como o corpo passa a existir sempre, o `.card` ganha `data-expanded` e o tour
  passa a detectar por esse atributo.

## 2. Inspetor — slide de gaveta + seta menor
- Inspetor sempre montado; anima `width: 280px → 0` com `overflow:hidden` e
  `.inspector-inner` de largura fixa (conteúdo desliza, não amassa). ~0.24s.
- Botão de toggle (`›/‹`): `font-size` 14px → 12px.

## 3. Grid view — fonte das estatísticas
- `.console-stat-value`: `font-weight:600` sans → `var(--font-mono)`,
  `font-weight:500`, `tabular-nums`. Coerente com console/inspetor.

## 4. Tour passos 4–7 — destaque maior
- `selector` dos passos 4–7 (índices 3–6): `.viz-stage` → `.desktop-main`
  (engloba a barra de abas + toggle Tabs/Grid + palco).
- Re-measure ~350ms após troca de passo, para o destaque assentar após
  animações de layout.

## 5. Emojis → ícones SVG
- Export: `📥` → `<Icon.Export/>`. `📹 Rec` → `<Icon.Record/>`.
- Tour: emojis dos títulos removidos; cada passo ganha `icon: ReactNode`.
  Reuso de ícones existentes + 2 novos: `Icon.Function` (fx) e `Icon.Inspect`
  (lupa).

## 6. Tela de carregamento (híbrido honesto)
- Novo `<LoadingScreen>` React, visual idêntico ao splash do `index.html`.
- Espera sinais reais: `document.fonts.ready` + bridge pronta
  (`window.pywebview` / evento `pywebviewready`; web resolve rápido), com
  duração mínima ~1s. Mensagens de estágio + barra de progresso.
- `App` monta `DesktopShell` por baixo e sobrepõe `LoadingScreen` (z acima do
  tour) até `ready`, então fade-out. `main.tsx`/`index.html` ajustados.

## 7. Relatório de revisão (entrega final)
- Artifact HTML navegável, lentes: Arquitetura, Correção/Bugs, Performance,
  Acessibilidade/UX, Manutenibilidade, Robustez, Testes. Severidade +
  sugestões priorizadas.

## Trade-offs aceitos
- Durante o slide do inspetor os gráficos WebGL re-layoutam uma vez (reflow real, suave).
- O loading é majoritariamente ~1s cosmético (boot real é rápido) — por isso
  sinais reais + mínimo, não duração fixa arbitrária.
