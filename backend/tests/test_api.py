import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def request(**kwargs):
    return {"location_id": "dhaka", "variable": "T2M", "start_year": 1991, "end_year": 2024, "aggregation": "summer", "mode": "cached", **kwargs}


def test_health_and_catalogue():
    assert client.get("/api/v1/health").json()["status"] == "ok"
    assert len(client.get("/api/v1/datasets").json()) == 11
    assert len(client.get("/api/v1/locations").json()) == 6


def test_real_nasa_offline_case_passport_and_exports():
    response = client.post("/api/v1/trend", json=request())
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["provenance"]["mode"] == "CACHED"
    assert result["dataset"]["short_name"] == "POWER_DAILY"
    assert len(result["series"]) == 34
    assert result["quality"]["valid_observations"] >= 30
    assert result["trend"]["p_value"] is not None
    identity = result["analysis_id"]
    passport = client.get(f"/api/v1/data-passport/{identity}").json()
    assert passport["statistics"]["p_value"] == result["trend"]["p_value"]
    assert passport["reproducibility"]["request"]["location_id"] == "dhaka"
    csv = client.get(f"/api/v1/export/{identity}.csv")
    assert csv.status_code == 200 and len(csv.text.splitlines()) == 35
    export = client.get(f"/api/v1/export/{identity}.json").json()
    assert export["trend"] == result["trend"]
    repeated = client.post("/api/v1/trend", json=request()).json()
    assert repeated["analysis_id"] == result["analysis_id"]
    assert repeated["trend"] == result["trend"]


def test_window_recalculation_same_full_record():
    full = client.post("/api/v1/trend", json=request()).json()
    window = client.post("/api/v1/trend", json=request(start_year=2010)).json()
    assert len(window["series"]) == 15
    assert window["full_record"]["trend"] == full["trend"]
    assert window["trend"]["slope_per_year"] != full["trend"]["slope_per_year"]


def test_comparison_and_incompatibility():
    response = client.post("/api/v1/compare", json={"left": request(), "right": request(location_id="rajshahi")})
    assert response.status_code == 200, response.text
    comparison = response.json()
    assert "Benjamini" in comparison["adjustment"]
    assert comparison["left"]["trend"]["p_adjusted"] is not None
    bad = client.post("/api/v1/compare", json={"left": request(), "right": request(variable="PRECTOTCORR")})
    assert bad.status_code == 422


def test_fixture_is_explicit_and_invalid_cache_never_substitutes():
    result = client.post("/api/v1/trend", json=request(mode="fixture")).json()
    assert result["provenance"]["mode"] == "FIXTURE"
    assert result["dataset"]["short_name"] == "SYNTHETIC_FIXTURE"
    response = client.post("/api/v1/trend", json=request(lat=0, lon=0))
    assert response.status_code == 404


def test_court_uses_result_and_scoring_rules():
    result = client.post("/api/v1/trend", json=request()).json()
    base = {"analysis_id": result["analysis_id"], "claim_id": "dhaka-summer", "confidence": 50, "tools": ["trend-test"], "verdict": "SUPPORTED"}
    response = client.post("/api/v1/court", json=base)
    assert response.status_code == 200
    expected = response.json()["expected_verdict"]
    correct = client.post("/api/v1/court", json={**base, "verdict": expected}).json()
    assert correct["correct"] and correct["score"] == 5
    invalid = client.post("/api/v1/court", json={**base, "tools": []})
    assert invalid.status_code == 422
    wrong_period = client.post("/api/v1/trend", json=request(start_year=2005)).json()
    assert client.post("/api/v1/court", json={**base, "analysis_id": wrong_period["analysis_id"]}).status_code == 422


def test_explanation_only_verified_result():
    result = client.post("/api/v1/trend", json=request()).json()
    en = client.post("/api/v1/explain", json={"analysis_id": result["analysis_id"], "language": "en"}).json()
    bn = client.post("/api/v1/explain", json={"analysis_id": result["analysis_id"], "language": "bn"}).json()
    assert en["explanation"] == result["interpretation"]["en"]
    assert bn["explanation"] == result["interpretation"]["bn"]


def test_hot_days_counts_actual_daily_maxima():
    result = client.post("/api/v1/hot-days", json={"location_id": "dhaka", "threshold_c": 35}).json()
    assert len(result["series"]) == 34
    assert result["provenance"]["mode"] == "CACHED"
    assert all(row["days_above_threshold"] is None or 0 <= row["days_above_threshold"] <= 366 for row in result["series"])
    passport = client.get(f"/api/v1/data-passport/{result['analysis_id']}").json()
    assert passport["measurement"]["parameter_band"] == "T2M_MAX"
    assert passport["statistics"]["p_value"] is None
    assert passport["processing"]["completeness_threshold"] == 1.0
    assert passport["reproducibility"]["source_sha256"]
    export = client.get(f"/api/v1/export/{result['analysis_id']}.json").json()
    assert export["passport"] == passport


def test_hot_days_omitted_calendar_date_withholds_year(monkeypatch):
    from backend.app.data.power import load
    from backend.app.data.catalogue import LOCATIONS
    import backend.app.main as main
    frame, metadata, mode = load(LOCATIONS[0])
    omitted = frame.drop(frame.index[0])
    monkeypatch.setattr(main, "load", lambda *args: (omitted, metadata, mode))
    response = client.post("/api/v1/hot-days", json={"location_id": "dhaka", "threshold_c": 35})
    assert response.status_code == 200
    first = response.json()["series"][0]
    assert first["days_above_threshold"] is None
    assert first["valid_daily_observations"] == 364
    assert first["expected_daily_observations"] == 365


def test_comparison_passport_adjustment_is_persisted():
    result = client.post("/api/v1/compare", json={"left": request(), "right": request(location_id="khulna")}).json()
    left = result["left"]
    passport = client.get(f"/api/v1/data-passport/{left['analysis_id']}").json()
    assert "Benjamini" in passport["statistics"]["multiple_testing_adjustment"]
    assert passport["statistics"]["p_adjusted"] == left["trend"]["p_adjusted"]


def test_cached_case_works_with_network_forbidden(monkeypatch):
    from backend.app.data import power
    def forbidden(*args, **kwargs):
        raise AssertionError("Offline mode must not contact the network")
    monkeypatch.setattr(power, "urlopen", forbidden)
    response = client.post("/api/v1/trend", json=request())
    assert response.status_code == 200
    result = response.json()
    raw_path = power.ROOT / result["passport"]["reproducibility"]["raw_data_reference"]
    import hashlib
    assert hashlib.sha256(raw_path.read_bytes()).hexdigest() == result["passport"]["reproducibility"]["source_sha256"]
    processed_path = power.ROOT / result["passport"]["reproducibility"]["processed_data_reference"]
    assert hashlib.sha256(processed_path.read_bytes()).hexdigest() == result["passport"]["reproducibility"]["processed_sha256"]


def test_fixture_and_cache_share_validated_response_schema():
    from backend.app.models.schemas import TrendResult
    cached = client.post("/api/v1/trend", json=request()).json()
    fixture = client.post("/api/v1/trend", json=request(mode="fixture")).json()
    assert set(cached) == set(fixture)
    TrendResult.model_validate(cached)
    TrendResult.model_validate(fixture)
