"""Heat / wave / reaction-diffusion adapter.

Handles both 1-D (disc_n=[nx]) and 2-D (disc_n=[nx, ny]) problems.
"""
from __future__ import annotations

import time
import numpy as np

from ..schema import PDESPayload, SolveResult, FieldOut


def solve(payload: PDESPayload) -> SolveResult:
    try:
        from pdesolver import PDE, PDES  # type: ignore[import]
    except ImportError:
        return _stub(payload)

    t0 = time.perf_counter()
    is_2d = len(payload["disc_n"]) > 1

    pdes = []
    for spec in payload["pdes"]:
        kwargs = dict(
            eq=spec["eq"],
            func=spec["func"],
            sp_var=spec["sp_var"],
            ivar=spec["ivar"],
            ivar_boundary=[tuple(b) for b in spec["ivar_boundary"]],
            expr_ic=spec["expr_ic"],
            west_bd=spec["west_bd"],
            west_func_bd=spec["west_func_bd"],
            east_bd=spec["east_bd"],
            east_func_bd=spec["east_func_bd"],
        )
        if is_2d:
            kwargs["north_bd"] = spec.get("north_bd", "Dirichlet")
            kwargs["north_func_bd"] = spec.get("north_func_bd", "0")
            kwargs["south_bd"] = spec.get("south_bd", "Dirichlet")
            kwargs["south_func_bd"] = spec.get("south_func_bd", "0")
        pdes.append(PDE(**kwargs))

    sistema = PDES(pdes=pdes, disc_n=payload["disc_n"])
    sistema.discretize(method=payload["discretize"]["method"])
    sistema.solve(
        method=payload["solve"]["method"],
        tf=payload["solve"]["tf"],
        nt=payload["solve"]["nt"],
    )

    _u_final, final_list = sistema.results

    tf = payload["solve"]["tf"]
    nt = payload["solve"]["nt"]
    ts = np.linspace(0.0, tf, nt + 1).tolist()

    if is_2d:
        nx, ny = payload["disc_n"]
        ax, bx = pdes[0].ivar_boundary[0]
        ay, by = pdes[0].ivar_boundary[1]
        xs = np.linspace(ax, bx, nx).tolist()
        ys = np.linspace(ay, by, ny).tolist()

        fields: list[FieldOut] = []
        for i, spec in enumerate(payload["pdes"]):
            # final_list[i]: [nt+1] snapshots, each flat [nx*ny]
            grid: list[list[float]] = final_list[i]
            flat = [v for row in grid for v in row]
            fields.append({
                "xs": xs,
                "ys": ys,
                "ts": ts,
                "grid": grid,
                "min": float(min(flat)),
                "max": float(max(flat)),
                "meta": {"fieldName": spec["func"]},
            })
    else:
        nx = payload["disc_n"][0]
        a, b = pdes[0].ivar_boundary[0]
        xs = np.linspace(a, b, nx).tolist()

        fields = []
        for i, spec in enumerate(payload["pdes"]):
            grid = final_list[i]  # [nt+1][nx]
            flat = [v for row in grid for v in row]
            fields.append({
                "xs": xs,
                "ts": ts,
                "grid": grid,
                "min": float(min(flat)),
                "max": float(max(flat)),
                "meta": {"fieldName": spec["func"]},
            })

    elapsed_ms = int((time.perf_counter() - t0) * 1000)
    return {
        "fields": fields,
        "meta": {"converged": True, "elapsed_ms": elapsed_ms, "backend": "numpy"},
    }


def _stub(payload: PDESPayload) -> SolveResult:
    """Fallback when pdesolver is not installed."""
    nx = payload["disc_n"][0] if payload["disc_n"] else 10
    nt = payload["solve"]["nt"]
    tf = payload["solve"]["tf"]
    xs = [i / (nx - 1) for i in range(nx)]
    ts = [tf * i / nt for i in range(nt + 1)]
    fields: list[FieldOut] = [
        {
            "xs": xs,
            "ts": ts,
            "grid": [[0.0] * nx for _ in range(nt + 1)],
            "min": 0.0,
            "max": 0.0,
            "meta": {"fieldName": spec["func"]},
        }
        for spec in payload["pdes"]
    ]
    return {
        "fields": fields,
        "meta": {"converged": False, "elapsed_ms": 0, "backend": "numpy"},
    }
