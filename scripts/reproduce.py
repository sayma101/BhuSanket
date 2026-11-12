"""Verify exported evidence JSON using the deterministic engine and embedded series.

Usage: python scripts/reproduce.py path/to/exported-result.json
"""
import json
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from backend.app.compute.trend import analyze


def reproduce(path):
    result = json.loads(Path(path).read_text(encoding="utf-8-sig"))
    request = result["passport"]["reproducibility"]["request"]
    actual, verdict, warnings = analyze(result["series"], result["period"]["start_year"], request.get("autocorrelation", "auto"))
    for key in ["slope_per_year", "slope_per_decade", "p_value", "intercept"]:
        expected = result["trend"][key]
        observed = actual[key]
        if expected is None or observed is None:
            assert expected is observed, (key, expected, observed)
        else:
            assert math.isclose(expected, observed, rel_tol=1e-10, abs_tol=1e-10), (key, expected, observed)
    if result["trend"]["ci_95"] is not None:
        assert all(math.isclose(a, b, rel_tol=1e-10, abs_tol=1e-10) for a, b in zip(result["trend"]["ci_95"], actual["ci_95"]))
    assert verdict == result["verdict"], (verdict, result["verdict"])
    print(json.dumps({"analysis_id": result["analysis_id"], "reproduced": True, "absolute_tolerance": 1e-10, "verdict": verdict}, indent=2))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/reproduce.py path/to/result.json")
    reproduce(sys.argv[1])
