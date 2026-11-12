import hashlib
import json
from pathlib import Path

from backend.app.compute.trend import aggregate, analyze, fdr
from backend.app.data.catalogue import LOCATIONS, VARIABLES
from backend.app.data.power import ROOT, load
from backend.app.models.schemas import TrendRequest

VERSION = "0.1.0"
RESULTS = ROOT / "data/processed/analyses"


def persist(result):
    RESULTS.mkdir(parents=True, exist_ok=True)
    (RESULTS / f"{result['analysis_id']}.json").write_text(json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8")


def get_result(analysis_id):
    if not analysis_id.startswith("bhu-") or not all(c.isalnum() or c == "-" for c in analysis_id):
        raise FileNotFoundError("Unknown analysis")
    path = RESULTS / f"{analysis_id}.json"
    if analysis_id.startswith("bhu-hot-"):
        path = ROOT / "data/processed/counters" / f"{analysis_id}.json"
    return json.loads(path.read_text(encoding="utf-8"))


def resolve_location(request):
    if request.lat is not None:
        return {"id": f"point-{request.lat:.4f}-{request.lon:.4f}", "label": f"{request.lat:.4f}, {request.lon:.4f}", "lat": request.lat, "lon": request.lon, "type": "point"}
    return next((x.copy() for x in LOCATIONS if x["id"] == request.location_id), None)


def summary(frame, request, start, end):
    series, daily_quality = aggregate(frame, request.variable, request.aggregation, request.month, start, end)
    trend, verdict, alerts = analyze(series, start, request.autocorrelation)
    n = sum(x["value"] is not None for x in series)
    quality = {"valid_observations": n, "total_observations": len(series),
               "missing_percent": float(100 * (1 - n / len(series))) if series else 100.0,
               "valid_pixel_coverage": None, "warnings": alerts, **daily_quality}
    return {"period": {"start_year": start, "end_year": end}, "series": series,
            "trend": trend, "verdict": verdict, "quality": quality}


def investigate(request: TrendRequest):
    location = resolve_location(request)
    if location is None:
        raise ValueError("Unknown location. Choose a supported location or provide point coordinates.")
    variable = next((v.copy() for v in VARIABLES if v["id"] == request.variable), None)
    if variable is None:
        raise ValueError("Variable adapter is not validated. Select a compatible NASA POWER parameter.")
    frame, meta, mode = load(location, request.mode)
    source_start, source_end = int(frame.index.year.min()), int(frame.index.year.max())
    selected = summary(frame, request, request.start_year, request.end_year)
    full = summary(frame, request, source_start, source_end)
    if request.start_year < source_start or request.end_year > source_end:
        selected["quality"]["warnings"].append(f"Requested range extends outside available source record {source_start}-{source_end}; unavailable days remain missing.")
    window_sensitive = selected["verdict"] != full["verdict"] and "Not enough evidence" not in [selected["verdict"], full["verdict"]]
    version = meta.get("header", {}).get("api", {}).get("version", "not recorded")
    source_type = "Synthetic fixture" if mode == "FIXTURE" else ("Satellite-derived solar estimate (POWER gridded product)" if request.variable == "ALLSKY_SFC_SW_DWN" else "Gridded model/reanalysis-derived meteorology (POWER)")
    dataset = {"short_name": "SYNTHETIC_FIXTURE" if mode == "FIXTURE" else "POWER_DAILY", "version": version, "source_type": source_type}
    definition = {"annual": "January–December", "summer": "March–May pre-monsoon summer", "monsoon": "June–September monsoon", "monthly": f"Calendar month {request.month}, compared across years"}[request.aggregation]
    rule = "sum of daily precipitation; complete periods required" if request.variable == "PRECTOTCORR" else "arithmetic mean of valid daily values; >=90% period coverage"
    provenance = {"source_url": meta["source_url"], "retrieved_at": meta["retrieved_at"], "mode": mode, "software_version": VERSION}
    engine_sha = hashlib.sha256((Path(__file__).parent / "compute/trend.py").read_bytes()).hexdigest()
    digest = hashlib.sha256(json.dumps({"request": request.model_dump(), "retrieval": meta["retrieved_at"], "source_sha256": meta.get("source_sha256"), "version": VERSION, "compute_source_sha256": engine_sha}, sort_keys=True).encode()).hexdigest()[:16]
    analysis_id = "bhu-" + digest
    en = {
        "Significant increase": "The selected record supports an increasing monotonic trend. This is evidence of change, not its cause or a forecast.",
        "Significant decrease": "The selected record supports a decreasing monotonic trend. This is evidence of change, not its cause or a forecast.",
        "No significant trend detected": "This test did not find sufficient evidence of a monotonic trend. This does not prove that nothing changed.",
        "Not enough evidence": "Record length, gaps or unresolved statistical assumptions prevent a defensible significance verdict.",
    }[selected["verdict"]]
    bn = {
        "Significant increase": "নির্বাচিত রেকর্ডে বৃদ্ধির প্রবণতার পরিসংখ্যানগত প্রমাণ আছে। এটি কারণ নির্ধারণ বা ভবিষ্যদ্বাণী নয়।",
        "Significant decrease": "নির্বাচিত রেকর্ডে হ্রাসের প্রবণতার পরিসংখ্যানগত প্রমাণ আছে। এটি কারণ নির্ধারণ বা ভবিষ্যদ্বাণী নয়।",
        "No significant trend detected": "এই পরীক্ষায় একমুখী প্রবণতার যথেষ্ট প্রমাণ মেলেনি। এর অর্থ কোনো পরিবর্তন হয়নি, তা নয়।",
        "Not enough evidence": "রেকর্ডের দৈর্ঘ্য, অনুপস্থিত তথ্য বা পরীক্ষার সীমাবদ্ধতার জন্য নির্ভরযোগ্য সিদ্ধান্ত দেওয়া যাচ্ছে না।",
    }[selected["verdict"]]
    assumptions = ["No missing values interpolated.", "Point/grid estimate, never a district average.",
                   "At least 10 valid annual/seasonal periods and 80% aggregate coverage required.",
                   "Mann–Kendall tests a monotonic trend, not causation or a forecast.",
                   "Theil–Sen 95% CI is in units per decade and assumes independent errors.",
                   "Autocorrelation screen uses detrended rank lag-1 correlation and approximate 1.96/sqrt(n) threshold.",
                   "Higher-order dependence can remain undetected by the lag-1 screen.",
                   "No station validation or breakpoint/homogeneity assessment performed; this gridded-product trend is not proof of a trend in every local observation."]
    passport = {
        "schema_version": "1.0", "analysis_id": analysis_id,
        "identity": {"dataset_name": dataset["short_name"], "version": version, "version_scope": "POWER API version recorded from response; underlying source processing versions are not returned by this response", "upstream_sources": meta.get("header", {}).get("sources", []), "nasa_daac_api": "NASA Langley POWER API" if mode != "FIXTURE" else "None; synthetic fixture", "source_url": meta["source_url"]},
        "measurement": {"variable": variable["label"], "parameter_band": request.variable, "units": variable["unit"], "source_units": meta.get("parameters", {}).get(request.variable, {}).get("units", variable["unit"]), "scale_factor": 1, "source_type": source_type},
        "space_time": {"location": location, "geometry": meta.get("geometry"), "spatial_resolution": "Meteorology native MERRA-2 grid approximately 0.5° latitude × 0.625° longitude; solar grid approximately 1° × 1°; source-dependent", "temporal_resolution": "daily source → one value per year for selected period", "start_date": f"{request.start_year}-01-01", "end_date": f"{request.end_year}-12-31", "time_standard": meta.get("time_standard", "UTC"), "boundary_source": None, "area_weighting": "not applicable; point/grid estimate"},
        "processing": {"quality_flags": "POWER fill-value and physical-range inspection; source QC performed upstream; no satellite pixel QA supplied by point API", "fill_values_removed": meta.get("qc", {}).get("excluded_values", {}).get(request.variable, 0), "fill_value_count_scope": "Complete cached source record, including physical-range exclusions", "fill_value": meta.get("qc", {}).get("fill_value"), "aggregation_rule": rule, "seasonal_definition": definition, "missing_data_percent": selected["quality"]["missing_daily_percent"], "valid_pixel_coverage": None, "coverage_explanation": "Not supplied for POWER point requests; do not interpret as 100% raster-pixel coverage.", "period_coverage_threshold": selected["quality"]["minimum_period_coverage"]},
        "statistics": {"test_variant": selected["trend"]["test_variant"], "slope_method": "SciPy Theil–Sen using actual calendar years", "slope_per_year": selected["trend"]["slope_per_year"], "slope_per_decade": selected["trend"]["slope_per_decade"], "p_value": selected["trend"]["p_value"], "confidence_interval_95_per_decade": selected["trend"]["ci_95"], "autocorrelation_decision": selected["trend"]["autocorrelation"], "multiple_testing_adjustment": "None: single pre-specified investigation", "alpha": 0.05},
        "reproducibility": {**provenance, "compute_source_sha256": engine_sha, "source_sha256": meta.get("source_sha256"), "processed_sha256": meta.get("processed_sha256"), "assumptions": assumptions, "limitations": selected["quality"]["warnings"], "request": request.model_dump(), "raw_data_reference": meta.get("raw_snapshot") if mode != "FIXTURE" else "backend/app/data/power.py deterministic fixture seed 2026", "processed_data_reference": meta.get("processed_snapshot") if mode != "FIXTURE" else None},
    }
    result = {"schema_version": "1.0", "analysis_id": analysis_id, "dataset": dataset,
              "variable": {k: variable[k] for k in ["id", "label", "unit"]}, "location": location,
              "aggregation": request.aggregation, **selected, "interpretation": {"en": en, "bn": bn},
              "provenance": provenance, "passport": passport,
              "full_record": {k: full[k] for k in ["period", "trend", "quality", "verdict"]}, "window_sensitive": window_sensitive}
    persist(result)
    return result


def compare(left_request, right_request):
    if (left_request.variable, left_request.aggregation, left_request.month, left_request.start_year, left_request.end_year) != (right_request.variable, right_request.aggregation, right_request.month, right_request.start_year, right_request.end_year):
        raise ValueError("Comparison requires the same variable, season/month and time period.")
    left, right = investigate(left_request), investigate(right_request)
    if left["dataset"] != right["dataset"] or (left["provenance"]["mode"] == "FIXTURE") != (right["provenance"]["mode"] == "FIXTURE"):
        raise ValueError("Comparison requires compatible products and source types.")
    adjusted = fdr([left["trend"]["p_value"], right["trend"]["p_value"]])
    family = hashlib.sha256((left["analysis_id"] + right["analysis_id"]).encode()).hexdigest()[:8]
    for item, p in zip([left, right], adjusted):
        original_id = item["analysis_id"]
        item["analysis_id"] = original_id + "-cmp-" + family
        item["passport"]["analysis_id"] = item["analysis_id"]
        item["passport"]["reproducibility"]["single_investigation_analysis_id"] = original_id
        item["trend"]["p_adjusted"] = p
        item["passport"]["statistics"]["multiple_testing_adjustment"] = "Benjamini–Hochberg FDR across this two-location family"
        item["passport"]["statistics"]["p_adjusted"] = p
        item["comparison_verdict"] = item["verdict"] if p is None or p < 0.05 else "No significant trend detected"
        persist(item)
    a, b = left["comparison_verdict"], right["comparison_verdict"]
    divergence = "Different evidence patterns" if a != b else "Same evidence category"
    return {"schema_version": "1.0", "left": left, "right": right, "divergence": divergence, "adjustment": "Benjamini–Hochberg FDR across two pre-specified location tests; compare adjusted p-values at 0.05. No test of difference between slopes."}
