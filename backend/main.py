"""Entry point — launches the pywebview window."""
from __future__ import annotations

import os
import sys
from pathlib import Path

import webview

from .api import Api


def _resolve_url() -> str:
    """Pick the URL the window should load.

    Dev:   the Vite dev server at http://localhost:5173 (set $DEV=1).
    Prod:  the bundled frontend/dist/index.html shipped with the .exe.
    """
    if os.environ.get("DEV") == "1":
        return "http://localhost:5173"

    here = Path(__file__).resolve().parent.parent
    candidates = [
        here / "frontend" / "dist" / "index.html",
        Path(getattr(sys, "_MEIPASS", "")) / "frontend" / "dist" / "index.html",
    ]
    for c in candidates:
        if c.exists():
            return c.as_uri()
    raise SystemExit(
        "Built frontend not found. Run `npm run build` inside ./frontend, "
        "or set DEV=1 to use the Vite dev server."
    )


def main() -> None:
    api = Api()
    window = webview.create_window(
        title="pdesolver studio (em desenvolvimento)",
        url=_resolve_url(),
        js_api=api,
        width=1400,
        height=900,
        min_size=(1100, 700),
        resizable=True,
        # Set frameless=True if you want to use the custom title bar from the design.
        # frameless=True,
    )
    api.bind_window(window)
    webview.start(debug=os.environ.get("DEV") == "1")


if __name__ == "__main__":
    main()
