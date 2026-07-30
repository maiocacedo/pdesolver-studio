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

if TYPE_CHECKING:
    import webview


def _validate_payload_shape(payload: object) -> None:
    """Minimal structural check for an imported PDES payload (see schema.PDESPayload).

    Raises ValueError with a user-facing message when the shape is wrong, so a
    malformed file fails loudly at import instead of deep inside the solver.
    """
    if not isinstance(payload, dict):
        raise ValueError("Payload inválido: esperado um objeto JSON.")
    pdes = payload.get("pdes")
    if not isinstance(pdes, list) or not pdes:
        raise ValueError("Payload inválido: 'pdes' deve ser uma lista não vazia.")
    if not isinstance(payload.get("disc_n"), list) or not payload["disc_n"]:
        raise ValueError("Payload inválido: 'disc_n' deve ser uma lista não vazia.")
    for key in ("discretize", "solve"):
        if not isinstance(payload.get(key), dict):
            raise ValueError(f"Payload inválido: faltando o objeto '{key}'.")
    for i, pde in enumerate(pdes):
        if not isinstance(pde, dict):
            raise ValueError(f"Payload inválido: pde[{i}] deve ser um objeto.")
        for field in ("eq", "func", "expr_ic"):
            if field not in pde:
                raise ValueError(f"Payload inválido: pde[{i}] sem o campo '{field}'.")


class Api:
    """Methods exposed as ``window.pywebview.api.*`` in the renderer."""

    def __init__(self) -> None:
        self._window: webview.Window | None = None

    def bind_window(self, window: webview.Window) -> None:
        self._window = window

    # ── solving ──────────────────────────────────────────────────────
    def solve(self, payload: PDESPayload) -> SolveResult:
        """Run the pdesolver pipeline. Returns the discretized field(s)."""
        from .solvers import dispatch
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
        if not isinstance(data, dict) or "payload" not in data:
            raise ValueError("Arquivo inválido: faltando o campo 'payload'.")
        _validate_payload_shape(data["payload"])
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

    def save_dialog(self, filename: str = "problem.json") -> str | None:
        if not self._window:
            return None
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        if ext == "json":
            file_types = ("pdesolver JSON (*.json)", "All files (*.*)")
        elif ext == "csv":
            file_types = ("CSV file (*.csv)", "All files (*.*)")
        elif ext == "png":
            file_types = ("PNG Image (*.png)", "All files (*.*)")
        else:
            file_types = ("All files (*.*)",)

        result = self._window.create_file_dialog(
            dialog_type=20,  # SAVE_DIALOG
            save_filename=filename,
            file_types=file_types,
        )
        return result if isinstance(result, str) else (result[0] if result else None)

    # ── window controls ──────────────────────────────────────────────
    def minimize(self) -> None:
        if self._window:
            self._window.minimize()

    def maximize(self) -> None:
        if self._window:
            if self._window.state == "maximized":
                self._window.restore()
            else:
                self._window.maximize()

    def close(self) -> None:
        if self._window:
            self._window.destroy()

    def resize(self, width: int, height: int) -> None:
        if self._window:
            self._window.resize(width, height)

    def save_csv(self, path: str, content: str) -> bool:
        Path(path).write_text(content, encoding="utf-8")
        return True

    def save_png(self, path: str, base64_content: str) -> bool:
        import base64
        if "," in base64_content:
            base64_content = base64_content.split(",", 1)[1]
        Path(path).write_bytes(base64.b64decode(base64_content))
        return True

    # ── environment probes ──────────────────────────────────────────
    def environment(self) -> dict:
        """Tell the UI what's available — used to hide unavailable solvers."""
        from .solvers import ADAPTERS
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
