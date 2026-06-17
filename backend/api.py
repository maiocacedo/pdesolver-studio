"""JS-facing API for the pywebview bridge.

Every public method maps 1:1 to a call from `frontend/src/api/pywebview.ts`.
Keep the payload shapes in sync with `backend/schema.py` and `frontend/src/types.ts`.
"""
from __future__ import annotations

import json
import time
from pathlib import Path
from typing import TYPE_CHECKING

from .schema import PDESPayload, SolveResult
from .solvers import ADAPTERS, dispatch

if TYPE_CHECKING:
    import webview


class Api:
    """Methods exposed as ``window.pywebview.api.*`` in the renderer."""

    def __init__(self) -> None:
        self._window: webview.Window | None = None

    def bind_window(self, window: webview.Window) -> None:
        self._window = window

    # ── solving ──────────────────────────────────────────────────────
    def solve(self, payload: PDESPayload) -> SolveResult:
        """Run the pdesolver pipeline. Returns the discretized field(s)."""
        t0 = time.perf_counter()
        result = dispatch(payload)
        result["meta"]["elapsed_ms"] = int((time.perf_counter() - t0) * 1000)
        return result

    # ── persistence ──────────────────────────────────────────────────
    def save_json(self, path: str, payload: PDESPayload, result: SolveResult) -> bool:
        Path(path).write_text(
            json.dumps({"payload": payload, "result": result}, indent=2)
        )
        return True

    def load_json(self, path: str) -> dict:
        data = json.loads(Path(path).read_text())
        return {"payload": data["payload"], "result": data.get("result")}

    # ── dialogs (use the OS file picker) ─────────────────────────────
    def open_dialog(self) -> str | None:
        if not self._window:
            return None
        result = self._window.create_file_dialog(
            dialog_type=10,  # OPEN_DIALOG
            file_types=("pdesolver JSON (*.json)", "All files (*.*)"),
        )
        return result[0] if result else None

    def save_dialog(self) -> str | None:
        if not self._window:
            return None
        result = self._window.create_file_dialog(
            dialog_type=20,  # SAVE_DIALOG
            save_filename="problem.json",
        )
        return result if isinstance(result, str) else (result[0] if result else None)

    # ── environment probes ──────────────────────────────────────────
    def environment(self) -> dict:
        """Tell the UI what's available — used to hide unavailable solvers."""
        gpu_available = False
        try:
            import cupy  # noqa: F401
            gpu_available = True
        except ImportError:
            pass
        return {
            "python": ".".join(map(str, __import__("sys").version_info[:3])),
            "gpu_available": gpu_available,
            "solvers": list(ADAPTERS.keys()),
        }
