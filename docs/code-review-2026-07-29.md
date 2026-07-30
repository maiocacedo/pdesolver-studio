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

- [ ] **A1 (Média)** — Lógica de I/O embutida no shell.
  `shell/desktop/DesktopShell.tsx` (~200 linhas no objeto `actions`).
  *Import/export JSON/PNG/CSV + `payloadToSystemConfig` inline no componente de layout.*
  **Sugestão:** extrair para módulo `io/` (ou hooks `useProjectIO`).
- [ ] **A2 (Média)** — Exportação de imagem duplicada.
  `DesktopShell.exportPng` ↔ `VizPanel.exportPanelImage` (helper `downloadUri` copiado; fallback 800×500 repetido).
  **Sugestão:** um único `exportImage(container, name)` em `viz/exportImage.ts`.
- [x] **A3 (Positivo)** — Ponte tipada com fallback falso (`api/pywebview.ts` + `api/fakeBackend.ts`). Preservar.

### 02 · Manutenibilidade

- [ ] **M1 (Alta)** — Componente-Deus `VizPanel` (`viz/VizPanel.tsx`, 839 linhas).
  *Abas, `SolverConsole`, `EmptyState`, export, gravação de vídeo, loop rAF e roteamento 1D/2D/3D num só arquivo.*
  **Sugestão:** decompor em `SolverConsole`, `useTimePlayback`, `useCanvasRecorder`, `exportImage`.
- [ ] **M2 (Média)** — Coreografia do tour com índices mágicos.
  `state/store.ts` (`nextTourStep`/`prevTourStep`, `nextStep === 3…7`) ↔ `TourOverlay.tsx` (`TOUR_STEPS`).
  **Sugestão:** colocar efeitos de UI junto de cada passo (campo `onEnter`).
- [ ] **M3 (Baixa)** — Estilos inline pervasivos (`Sidebar`, `VizPanel`, `Inspector`).
  **Sugestão:** migrar blocos repetidos para classes/CSS-modules usando `tokens.css`.

### 03 · Correção & comportamento

- [ ] **C1 (Alta)** — Solver falso engana no modo web/dev (`api/fakeBackend.ts`).
  *Reconhece só 3 ICs por string-match e devolve difusão fixa, ignorando a EDP/BCs reais.*
  **Sugestão:** aviso "resultado aproximado (sem backend)" quando este caminho for usado.
- [ ] **C2 (Média)** — Tour força-inicia e descarta estado.
  `DesktopShell.tsx` `useEffect(startTour)` + `store.startTour` (substitui por `wave1DPreset()`).
  **Sugestão:** gate por `localStorage`; só resetar preset após confirmação.
- [ ] **C4 (Média)** — Sem Error Boundary (`App.tsx` / `viz/Surface3D*.tsx`).
  **Sugestão:** boundary com fallback + "tentar de novo" em volta das visualizações.
- [ ] **C3 (Baixa)** — CFL exibido para esquemas implícitos (`Inspector.tsx`, `cfl ≤ 0.5`).
  **Sugestão:** contextualizar o indicador conforme o integrador (informativo p/ BDF-2/CN).

### 04 · Performance

- [ ] **P1 (Média)** — Bundle único de 1.05 MB (`dist/assets/index-*.js`).
  *Three.js e KaTeX no chunk inicial.*
  **Sugestão:** `React.lazy` nas superfícies 3D e KaTeX + `manualChunks`.
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

- [ ] **T1 (Alta)** — Nenhum teste automatizado; CI só faz build.
  **Alvos:** round-trip `toPayload`↔`payloadToSystemConfig`, `validateSystemConfig`, dispatch dos solvers.
  **Sugestão:** Vitest (frontend) + pytest (backend), começando pelos mapeadores; passo de teste no GitHub Actions.

---

## Pontos fortes a preservar

- TypeScript rigoroso (`strict` + `noUnused*`).
- Estrutura por feature com store Zustand documentado.
- Camada de ponte com fallback falso.
- Automação de build (PyInstaller + GitHub Actions multiplataforma).
- Andaime de UX (tour, inspetor, galeria, histórico).
