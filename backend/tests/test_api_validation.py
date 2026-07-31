"""Tests for the imported-payload structural validation (review S3)."""
from __future__ import annotations

import pytest

from backend.api import _validate_payload_shape


def _valid_payload():
    return {
        "pdes": [{"eq": "du/dt = d2u/dx2", "func": "u", "expr_ic": "sin(pi*x)"}],
        "disc_n": [20],
        "discretize": {"method": "central"},
        "solve": {"method": "bdf2", "tf": 0.1, "nt": 10},
    }


def test_valid_payload_passes():
    _validate_payload_shape(_valid_payload())  # should not raise


def test_non_dict_rejected():
    with pytest.raises(ValueError):
        _validate_payload_shape([1, 2, 3])


@pytest.mark.parametrize(
    "mutate, expected",
    [
        (lambda p: p.pop("pdes"), "pdes"),
        (lambda p: p.update(pdes=[]), "pdes"),
        (lambda p: p.pop("disc_n"), "disc_n"),
        (lambda p: p.pop("discretize"), "discretize"),
        (lambda p: p.pop("solve"), "solve"),
        (lambda p: p["pdes"][0].pop("eq"), "eq"),
        (lambda p: p["pdes"][0].pop("expr_ic"), "expr_ic"),
    ],
)
def test_malformed_payload_rejected(mutate, expected):
    payload = _valid_payload()
    mutate(payload)
    with pytest.raises(ValueError, match=expected):
        _validate_payload_shape(payload)
