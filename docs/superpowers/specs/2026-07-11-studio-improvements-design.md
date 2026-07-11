# Spec: PDESolver Studio — Visual & Functional Improvements (Phase 2)

**Date**: 2026-07-11  
**Status**: APPROVED (Awaiting Implementation)  
**Author**: Antigravity

---

## 1. Goal

Implement a set of critical layout reorganizations, bug fixes, video recording improvements, and academic visualization updates to enhance the usability and stability of `pdesolver-studio`.

---

## 2. Proposed Design & Changes

### Component 1: Window & Dragging Behavior (Frameless Fix)
- **Problem**: In frameless mode, clicking and dragging anywhere inside the application drags the window. This makes range sliders unusable and blocks 3D surface rotation.
- **Solution**: Explicitly set `-webkit-app-region: no-drag` on the root elements and restrict the drag region to the custom title bar.
- **Files to Modify**:
  - [globals.css](file:///c:/Projetos/pdessolver-studio/frontend/src/styles/globals.css):
    ```css
    html, body, #root, .desktop {
      -webkit-app-region: no-drag;
      user-select: none;
    }
    .titlebar {
      -webkit-app-region: drag;
    }
    .titlebar-controls {
      -webkit-app-region: no-drag;
    }
    ```

---

### Component 2: Deferring Heavy Imports (Splash Delay Fix)
- **Problem**: There is an invisible delay of ~2 seconds before the window displays because python imports heavy packages (numpy, sympy, scipy) at boot time.
- **Solution**: Defer imports of heavy libraries to function-local scopes.
- **Files to Modify**:
  - [api.py](file:///c:/Projetos/pdessolver-studio/backend/api.py): Import `dispatch` inside the `solve()` method instead of at the top of the file.
  - [__init__.py (solvers)](file:///c:/Projetos/pdessolver-studio/backend/solvers/__init__.py): Import `heat` inside the `dispatch()` method.
  - [heat.py](file:///c:/Projetos/pdessolver-studio/backend/solvers/heat.py): Move `import numpy as np` and `from pdesolver import PDE, PDES` inside the `solve()` function.

---

### Component 3: Sidebar Layout Reorganization
- **Problem**: Five cards in the sidebar cause too much vertical scrolling. Initial conditions and boundaries are split.
- **Solution**: Consolidate into 2 collapsible cards: **Equations** and **Numeric**.

#### 1. "Equations" Card
- Combines the PDE switcher tabs, equation input text fields, Initial Condition (IC) input, and Boundary Conditions (BCs).
- Collapsible inline boundary condition section:
  - Group of 4 buttons: `[ O ]` (West/Oeste), `[ L ]` (East/Leste), `[ N ]` (North/Norte), `[ S ]` (South/Sul).
  - Hide `N` and `S` buttons if the domain is 1D.
  - Clicking a button marks it active. Render only the active boundary's type (Dirichlet/Neumann/Robin) and expression input fields below it.
- **Initial Condition (IC)** input is moved here, complete with its LaTeX preview.

#### 2. "Numeric" Card (formerly "Mesh & solver")
- Houses all domain intervals and mesh settings:
  - Spatial domain fields `x` (`xmin` to `xmax`) and `y` (`ymin` to `ymax` - 2D only).
  - Time domain fields `t0` and `tf` (tempo final).
  - Sliders + number inputs for `nx`, `ny` (2D), and `nt`.
  - Discretization method selectors (backward, central, forward).
  - Integration method selectors (BDF-2, CN, RKF).
  - "Apenas Discretizar" button at the bottom of the card.

#### 3. Collapsible Card Support
- Add collapse/expand toggle on the header of the `ConfigCard` component. Clicking the header toggles a state to expand/collapse the card's body independently.
- **Files to Modify**:
  - [Card/index.tsx](file:///c:/Projetos/pdessolver-studio/frontend/src/components/Card/index.tsx): Add collapse state.
  - [Sidebar.tsx](file:///c:/Projetos/pdessolver-studio/frontend/src/panels/Sidebar.tsx): Refactor contents into two cards ("Equations" and "Numeric") and map domains, IC, and BCs accordingly.

---

### Component 4: Font Bundling
- Local font loading is already complete. Update [index.html](file:///c:/Projetos/pdessolver-studio/frontend/index.html) to clean up preconnect and stylesheet imports.

---

### Component 5: 3D Visualization XYZ Eixos
- **Problem**: Default RGB axes are distracting and do not coordinate with dark mode.
- **Solution**: Customize `THREE.AxesHelper` to render monochrome lines corresponding to the theme (dark lines in light mode, light lines in dark mode). Add floating labels `X`, `Y`, `Z`.
- **Files to Modify**:
  - [Surface3DWebGL.tsx](file:///c:/Projetos/pdessolver-studio/frontend/src/viz/Surface3DWebGL.tsx): Customize axis lines color and labels.

---

### Component 6: Native Save/Open pickers & Graph Export
- **Problem**: Blob download links do not function correctly in pywebview WebView2 wrappers on Windows. Toolbar-based export is not intuitive.
- **Solution**:
  - Move the "Export Graph Image" button from the main Toolbar to the header of the active chart panel in `VizPanel.tsx` (next to the tabs/headers).
  - Leverage pywebview's native file save picker (`bridge.saveDialog()` / `bridge.openDialog()`) on desktop for JSON, CSV, and PNG exports, writing files directly via Python APIs.
- **Files to Modify**:
  - [VizPanel.tsx](file:///c:/Projetos/pdessolver-studio/frontend/src/viz/VizPanel.tsx): Render graph export button inside panel headers.
  - [DesktopShell.tsx](file:///c:/Projetos/pdessolver-studio/frontend/src/shell/desktop/DesktopShell.tsx): Bind native dialog wrappers to open, save JSON, and export CSV/PNG.
  - [api.py](file:///c:/Projetos/pdessolver-studio/backend/api.py): Implement python-side file saving methods for CSV and PNG images.

---

### Component 7: Input Validation
- **Problem**: Submitting empty/invalid fields might cause backend crashes or run with stale settings.
- **Solution**: Add validation in the Zustand store prior to executing `solve()` or `discretize()`. Validate that equation, IC, boundary expressions are not empty, and domain values are numbers. If validation fails, set the store's status to `error` and display the error message.
- **Files to Modify**:
  - [store.ts](file:///c:/Projetos/pdessolver-studio/frontend/src/state/store.ts): Implement `validateSystemConfig(sys)` check before execution.

---

### Component 8: Video Recording Interval
- **Problem**: The recording feature does not work reliably, and you cannot select a sub-interval.
- **Solution**: Add mimeType fallback selection to `MediaRecorder` setup. Render "De passo" and "Até passo" input fields in the bottom time-slider panel. Record only frames belonging to the defined step range.
- **Files to Modify**:
  - [VizPanel.tsx](file:///c:/Projetos/pdessolver-studio/frontend/src/viz/VizPanel.tsx): Implement step range selection inputs and constraint loop recorder.

---

### Component 9: New PDE Function Name Indexing
- **Problem**: PDE names default to sequential length + 1, causing naming conflicts if intermediate items are removed.
- **Solution**: Inspect existing function names (`u1`, `u2`, etc.) and find the lowest available index `i` that does not exist.
- **Files to Modify**:
  - [store.ts](file:///c:/Projetos/pdessolver-studio/frontend/src/state/store.ts): Adjust `addPde` logic.

---

## 3. Verification & Build
- Verify TypeScript builds: `npm run build`
- Package with PyInstaller: `py build_studio.py`
