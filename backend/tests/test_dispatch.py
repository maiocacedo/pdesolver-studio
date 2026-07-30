"""Tests for the solver dispatcher (classify + dispatch)."""
from __future__ import annotations

import copy

import pytest

from backend.solvers import classify, dispatch


def _payload_1d(**over):
    payload = {
        "pdes": [
            {
                "id": "pde-1",
                "name": "u",
                "eq": "du/dt = d2u/dx2",
                "func": "u",
                "sp_var": ["x"],
                "ivar": ["t"],
                "ivar_boundary": [(0.0, 1.0)],
                "expr_ic": "sin(pi*x)",
                "west_bd": "Dirichlet",
                "west_func_bd": "0",
                "east_bd": "Dirichlet",
                "east_func_bd": "0",
            }
        ],
        "disc_n": [20],
        "discretize": {"method": "central"},
        "solve": {"method": "bdf2", "tf": 0.1, "nt": 40},
    }
    payload.update(over)
    return copy.deepcopy(payload)


class TestClassify:
    def test_single_diffusion_is_heat(self):
        assert classify(_payload_1d()) == "heat"

    def test_multiple_pdes_route_to_reaction_diffusion(self):
        p = _payload_1d()
        p["pdes"].append(copy.deepcopy(p["pdes"][0]))
        assert classify(p) == "reaction_diffusion"

    def test_second_order_time_is_wave(self):
        p = _payload_1d()
        p["pdes"][0]["eq"] = "d2uxy/dt2 = d2uxy/dx2"
        assert classify(p) == "wave"

    def test_first_order_space_only_is_advection(self):
        p = _payload_1d()
        p["pdes"][0]["eq"] = "duxy/dt = duxy/dx"
        assert classify(p) == "advection"


def test_dispatch_unknown_family_returns_graceful_fallback():
    p = _payload_1d()
    p["pdes"][0]["eq"] = "d2uxy/dt2 = d2uxy/dx2"  # wave -> no registered adapter
    result = dispatch(p)
    assert result["fields"] == []
    assert result["meta"]["converged"] is False
    assert result["meta"]["backend"] == "numpy"


def test_dispatch_heat_produces_well_shaped_field():
    pytest.importorskip("pdesolver")
    result = dispatch(_payload_1d())

    assert result["meta"]["converged"] is True
    assert len(result["fields"]) == 1

    field = result["fields"]
    field = field[0]
    assert len(field["xs"]) == 20
    assert len(field["ts"]) == 41  # nt + 1
    assert len(field["grid"]) == 41
    assert all(len(row) == 20 for row in field["grid"])
    assert field["min"] <= field["max"]
