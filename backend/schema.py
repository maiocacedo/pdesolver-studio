"""Typed payload shapes for the JS↔Python bridge.

Mirrors `frontend/src/types.ts`. **Both files must change together.**
"""
from __future__ import annotations

from typing import Literal, TypedDict


BCType = Literal["Dirichlet", "Neumann", "Robin"]
DiscMethod = Literal["central", "forward", "backward"]
TimeMethod = Literal["bdf2", "CN", "RKF"]


class BCSpec(TypedDict):
    type: BCType
    expr: str


class PDEPayload(TypedDict, total=False):
    """A single PDE inside a system."""
    id: str
    name: str
    eq: str                                # full eq string in the library's grammar
    func: str                              # "u"
    sp_var: list[str]                      # ["x"] or ["x", "y"]
    ivar: list[str]                        # ["t"]
    ivar_boundary: list[tuple[float, float]]
    expr_ic: str
    west_bd: BCType
    west_func_bd: str
    east_bd: BCType
    east_func_bd: str
    # 2-D only
    north_bd: BCType
    north_func_bd: str
    south_bd: BCType
    south_func_bd: str


class DiscretizeSpec(TypedDict):
    method: DiscMethod


class SolveSpec(TypedDict):
    method: TimeMethod
    tf: float
    nt: int


class PDESPayload(TypedDict):
    """A system of PDEs + the run config that applies to all of them."""
    pdes: list[PDEPayload]                 # always length ≥ 1
    disc_n: list[int]                      # one entry per spatial variable
    discretize: DiscretizeSpec
    solve: SolveSpec


class FieldMeta(TypedDict, total=False):
    fieldName: str                          # "u", or "u_1" / "v" for systems


class FieldOut(TypedDict, total=False):
    xs: list[float]
    ts: list[float]
    ys: list[float]                         # present for 2-D spatial problems
    grid: list[list[float]]                 # [t][x] for 1-D; [t][ix*ny + iy] for 2-D
    min: float
    max: float
    meta: FieldMeta


class ResultMeta(TypedDict, total=False):
    converged: bool
    elapsed_ms: int
    backend: Literal["numpy", "cupy"]


class SolveResult(TypedDict):
    fields: list[FieldOut]                  # one entry per PDE in the system
    meta: ResultMeta
