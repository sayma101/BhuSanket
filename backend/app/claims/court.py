from backend.app.data.catalogue import CLAIMS
from backend.app.service import get_result


def expected_verdict(result, claim):
    if result["verdict"] == "Not enough evidence":
        return "NOT ENOUGH EVIDENCE"
    if result.get("window_sensitive"):
        return "WINDOW-DEPENDENT"
    target = "Significant increase" if claim["direction"] == "increase" else "Significant decrease"
    return "SUPPORTED" if result["verdict"] == target else "NOT SUPPORTED ON THIS RECORD"


def score_round(request):
    tools = set(request.tools)
    if not 1 <= len(tools) <= 3:
        raise ValueError("Use at least one distinct evidence tool; only three evidence tokens are available.")
    result = get_result(request.analysis_id)
    claim = next((c for c in CLAIMS if c["id"] == request.claim_id), None)
    if claim is None:
        raise ValueError("Unknown preset claim")
    if any(result[key]["id"] != claim[c_key] for key, c_key in [("location", "location_id"), ("variable", "variable")]) or result["aggregation"] != claim["aggregation"]:
        raise ValueError("The analysis must match the preset claim's place, measurement and season.")
    if result["period"]["start_year"] != claim["start_year"] or result["period"]["end_year"] != claim["end_year"]:
        raise ValueError("The analysis period must match the preset claim's defined period.")
    expected = expected_verdict(result, claim)
    correct = expected == request.verdict
    unused = 3 - len(tools)
    penalty = 2 if request.confidence >= 75 and request.verdict == "SUPPORTED" and not correct else 0
    return {"schema_version": "1.0", "correct": correct, "expected_verdict": expected,
            "score": (3 if correct else 0) + unused - penalty,
            "explanation": f"{'Correct verdict +3' if correct else 'Incorrect verdict +0'}; {unused} unspent token(s) +{unused}; confident misleading support penalty -{penalty}. Confidence threshold: 75/100.",
            "analysis_id": request.analysis_id}
