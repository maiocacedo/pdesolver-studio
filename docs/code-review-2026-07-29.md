# PDE Solver Studio — Revisão de Código & Plano de Execução

**Data:** 2026-07-29 · **Branch de origem:** `feat/studio-aesthetics`
**Artifact visual:** https://claude.ai/code/artifact/016fcb95-492e-4ba4-a3ef-61375d1bcbc1

Revisão em 7 lentes: 18 achados + 5 pontos fortes. Este documento é a fonte de
verdade para "arrumar tudo" — marcamos cada item conforme executamos.

## Métricas do estado atual

| Métrica | Valor |
|---|---|
| Frontend | ~5.532 LOC (49 arquivos TS/TSX) |
| Backend | ~456 LOC Python |
| Testes automatizados | **0** |
| Bundle JS | **1.05 MB** (291 KB gzip), chunk único |
| TypeScript | `strict` + `noUnusedLocals` + `noUnusedParameters` ✓ |

---

## Ordem de execução (maior retorno primeiro)

1. **T1 / A2** — Testar round-trip de payload + validação
2. **C1** — Banner de "aproximação (dev)" no solver falso
3. **P1** — Lazy-load de Three.js e KaTeX
4. **M1 / A2** — Quebrar `VizPanel.tsx` + utilitário de export compartilhado
5. **C2** — Persistir "tour visto"
6. **C4** — Error Boundary nas visualizações
7. Restantes: **M2, M3, C3, P2, U1, U2, U3, S1, S2, S3**

---

## Achados

### 01 · Arquitetura & estrutura

- [~] **A1 (Média)** — Lógica de I/O embutida no shell. _Parcial:_ `payloadToSystemConfig`
  extraído para `state/payload.ts` (Item 1). Falta mover import/export JSON/PNG/CSV.
  `shell/desktop/DesktopShell.tsx`.
  **Sugestão:** extrair o restante para módulo `io/` (ou hooks `useProjectIO`).
- [x] **A2 (Média)** — ~~Exportação de imagem duplicada.~~ **FEITO (Item 4).**
  Util única `viz/exportImage.ts` (`exportImage` + `exportContainerImage`); `DesktopShell`
  e `VizPanel` agora a consomem. Nome de arquivo unificado (`<panel>.png`).
- [x] **A3 (Positivo)** — Ponte tipada com fallback falso (`api/pywebview.ts` + `api/fakeBackend.ts`). Preservar.

### 02 · Manutenibilidade

- [~] **M1 (Alta)** — Componente-Deus `VizPanel`. _Parcial (Item 4, escopo focado):_
  `SolverConsole` → `viz/SolverConsole.tsx`; export → `viz/exportImage.ts`.
  **839 → 728 linhas.** Falta extrair `useTimePlayback` (loop rAF) e `useCanvasRecorder`
  (gravação) num passo futuro.
- [ ] **M2 (Média)** — Coreografia do tour com índices mágicos.
  `state/store.ts` (`nextTourStep`/`prevTourStep`, `nextStep === 3…7`) ↔ `TourOverlay.tsx` (`TOUR_STEPS`).
  **Sugestão:** colocar efeitos de UI junto de cada passo (campo `onEnter`).
- [ ] **M3 (Baixa)** — Estilos inline pervasivos (`Sidebar`, `VizPanel`, `Inspector`).
  **Sugestão:** migrar blocos repetidos para classes/CSS-modules usando `tokens.css`.

### 03 · Correção & comportamento

- [x] **C1 (Alta)** — ~~Solver falso engana no modo web/dev.~~ **FEITO (Item 2).**
  `fakeBackend` marca `meta.approximate`; banner dismissível no topo da visualização
  (reaparece a cada solve aproximado), rótulo do console → "APROX (JS)" + linha `[WARN]`.
  Flag adicionada a `types.ts` e `schema.py` em sincronia.
- [x] **C2 (Média)** — ~~Tour força-inicia e descarta estado.~~ **FEITO (Item 5).**
  Auto-start só no 1º acesso (`localStorage` `pde-tour-seen`, marcada em `endTour`);
  re-abertura manual pelo menu Help; confirmação antes de resetar o preset quando
  há alterações não salvas (`ui.dirty`).
- [x] **C4 (Média)** — ~~Sem Error Boundary.~~ **FEITO (Item 6).**
  `components/ErrorBoundary.tsx` (fallback recuperável + "Tentar novamente" +
  auto-reset por `resetKeys`) envolvendo o `VizPanel` no `DesktopShell`
  (`resetKeys=[vizTab, layoutMode, runStatus]`). 3 testes jsdom cobrindo
  fallback/recuperação. Sidebar/inspetor/menus seguem vivos num crash de gráfico.
- [ ] **C3 (Baixa)** — CFL exibido para esquemas implícitos (`Inspector.tsx`, `cfl ≤ 0.5`).
  **Sugestão:** contextualizar o indicador conforme o integrador (informativo p/ BDF-2/CN).

### 04 · Performance

- [x] **P1 (Média)** — ~~Bundle único de 1.05 MB.~~ **FEITO (Item 3).**
  Superfícies 3D via `React.lazy` (Three.js só baixa ao abrir 3D) + KaTeX isolado
  via `manualChunks`. **Boot: 1045 KB → ~497 KB** (main 243 + katex 254); Three.js
  (526 KB) agora lazy. Fallback `Preparando engine 3D…` via Suspense.
- [ ] **P2 (Baixa)** — Busca linear O(n) no loop de reprodução (`viz/VizPanel.tsx`, `animate()`).
  **Sugestão:** busca binária sobre `field.ts`.

### 05 · Acessibilidade & UX

- [ ] **U1 (Média)** — `alert()` para todo feedback (`DesktopShell`, `VizPanel`).
  **Sugestão:** sistema de toasts/notificações inline coerente com o tema.
- [ ] **U2 (Média)** — Mistura de idiomas PT/EN na mesma tela.
  **Sugestão:** padronizar um idioma ou camada i18n leve com dicionário único.
- [ ] **U3 (Baixa)** — Movimento sem guarda global (`globals.css`).
  **Sugestão:** bloco global sob `prefers-reduced-motion: reduce`.
- [x] **U4 (Positivo)** — Atalhos e affordances sólidos (F5, Ctrl+1/2/3, aria-labels). Preservar.

### 06 · Segurança & robustez

- [ ] **S1 (Média)** — Fronteira de confiança das expressões.
  `backend/solvers/heat.py` → lib `pdesolver`; rota `backend.py /solve_json` (localhost:8000) aceita payload arbitrário.
  **Sugestão:** verificar como `pdesolver` avalia expressões; manter servidor em localhost e nunca expor.
- [ ] **S2 (Baixa)** — `reload=True` no entrypoint (`backend.py`, `uvicorn.run`).
  **Sugestão:** condicionar a `DEV=1`.
- [ ] **S3 (Baixa)** — Import sem validação de esquema (`backend/api.py`, `load_json`).
  **Sugestão:** validar contra `schema.py` antes de devolver ao frontend.

### 07 · Testes & CI

- [x] **T1 (Alta)** — ~~Nenhum teste automatizado; CI só faz build.~~ **FEITO (Item 1).**
  Vitest (18 testes: round-trip 1D/2D, `validateSystemConfig`, reducers do store) +
  pytest (6 testes: classify/dispatch + solver heat). Workflow `.github/workflows/test.yml`
  roda ambos em push/PR. Scripts: `npm test` · `py -m pytest`.

---

## Pontos fortes a preservar

- TypeScript rigoroso (`strict` + `noUnused*`).
- Estrutura por feature com store Zustand documentado.
- Camada de ponte com fallback falso.
- Automação de build (PyInstaller + GitHub Actions multiplataforma).
- Andaime de UX (tour, inspetor, galeria, histórico).
