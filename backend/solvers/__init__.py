"""Solver adapters — one per equation family.

The registry below is the modularity hook. To add support for a new family:

    1. Drop a new file in this package (e.g. ``wave.py``).
    2. Implement ``solve(payload: PDESPayload) -> SolveResult``.
    3. Register the family in ``ADAPTERS`` below.
    4. (Optional) Adjust ``classify()`` so the dispatcher recognises it.

``api.py`` calls ``dispatch(payload)`` and never imports a specific adapter.
"""
from __future__ import annotations

from typing import Callable

from ..schema import PDESPayload, SolveResult
from . import heat


SolverFn = Callable[[PDESPayload], SolveResult]


ADAPTERS: dict[str, SolverFn] = {
    "heat": heat.solve,
    # Coupled diffusion-type systems (reaction-diffusion, predator-prey, etc.)
    # share the same finite-difference machinery — route through the heat adapter.
    "reaction_diffusion": heat.solve,
    # "wave": wave.solve,
    # "burgers": burgers.solve,
}


def classify(payload: PDESPayload) -> str:
    """Pick the right adapter for a payload.

    The default heuristic looks at the LHS of the first PDE's equation string
    and the operators on the RHS. Override this when you add nonlinear or
    coupled families.
    """
    if len(payload["pdes"]) > 1:
        return "reaction_diffusion"

    eq = payload["pdes"][0]["eq"]
    if "d2uxy/dt2" in eq:
        return "wave"
    if "duxy/dx" in eq and "d2uxy/dx2" not in eq:
        return "advection"
    return "heat"


def dispatch(payload: PDESPayload) -> SolveResult:
    family = classify(payload)
    adapter = ADAPTERS.get(family)
    if adapter is None:
        # Graceful fallback — tell the UI we don't know this family yet.
        return SolveResult(
            fields=[],
            meta={
                "converged": False,
                "elapsed_ms": 0,
                "backend": "numpy",
            },
        )
    return adapter(payload)
