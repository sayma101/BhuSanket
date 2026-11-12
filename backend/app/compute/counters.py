"""Daily temperature threshold counts with complete calendar coverage and provenance."""
import hashlib
import json
from pathlib import Path

import pandas as pd

from backend.app.data.power import ROOT
from backend.app.service import VERSION


def count_hot_days(frame, meta, location, mode, threshold_c):
    start_year, end_year = int(frame.index.year.min()), int(frame.index.year.max())
    calendar = pd.date_range(f"{start_year}-01-01", f"{end_year}-12-31", freq="D")
    daily = frame["T2M_MAX"].reindex(calendar)
    rows = []
    for year, group in daily.groupby(daily.index.year):
        coverage = float(group.notna().mean())
        rows.append({"year": int(year), "days_above_threshold": int((group > threshold_c).sum()) if coverage == 1 else None,
                     "coverage": coverage, "valid_daily_observations": int(group.notna().sum()), "expected_daily_observations": len(group)})
    source_version = meta.get("header", {}).get("api", {}).get("version", "not recorded")
    code_hash = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    identity = {"location": location, "mode": mode, "threshold_c": threshold_c, "source_sha256": meta.get("source_sha256"),
                "retrieved_at": meta["retrieved_at"], "counter_source_sha256": code_hash,
                "count_series_sha256": hashlib.sha256(json.dumps(rows, sort_keys=True).encode()).hexdigest()}
    analysis_id = "bhu-hot-" + hashlib.sha256(json.dumps(identity, sort_keys=True).encode()).hexdigest()[:16]
    definition = "Count of days whose daily maximum 2-m air temperature strictly exceeds the stated threshold; not an official heatwave definition. Incomplete calendar years withheld."
    provenance = {"source_url": meta["source_url"], "retrieved_at": meta["retrieved_at"], "mode": mode, "software_version": VERSION}
    passport = {
        "schema_version": "1.0", "analysis_id": analysis_id,
        "identity": {"dataset_name": "SYNTHETIC_FIXTURE" if mode == "FIXTURE" else "POWER_DAILY", "version": source_version,
                     "version_scope": "POWER API response version; underlying processing versions not returned", "nasa_daac_api": "None; synthetic fixture" if mode == "FIXTURE" else "NASA Langley POWER API", "source_url": meta["source_url"]},
        "measurement": {"variable": "Daily maximum 2-m air temperature", "parameter_band": "T2M_MAX", "units": "degrees C", "output_units": "days per year", "scale_factor": 1,
                        "source_type": "Synthetic fixture" if mode == "FIXTURE" else "Gridded model/reanalysis-derived meteorology", "threshold_c": threshold_c, "comparison_operator": ">"},
        "space_time": {"location": location, "geometry": meta.get("geometry"), "spatial_resolution": "Native meteorology grid approximately 0.5 degrees latitude x 0.625 degrees longitude; point/grid estimate, not district average",
                       "temporal_resolution": "Daily source; annual count", "start_date": f"{start_year}-01-01", "end_date": f"{end_year}-12-31", "time_standard": meta.get("time_standard", "UTC"), "boundary_source": None, "area_weighting": "Not applicable; point/grid estimate"},
        "processing": {"quality_flags": "POWER fill-value/physical-range cleaning; upstream source QC; no pixel QA supplied", "fill_value": meta.get("qc", {}).get("fill_value"),
                       "fill_values_removed": meta.get("qc", {}).get("excluded_values", {}).get("T2M_MAX", 0), "aggregation_rule": definition,
                       "seasonal_definition": "January-December calendar year", "completeness_threshold": 1.0,
                       "missing_data_percent": float(100 * daily.isna().mean()), "valid_pixel_coverage": None,
                       "calendar_rule": "Reindex every year to all expected calendar dates, including leap days; omitted source dates count as missing"},
        "statistics": {"test_variant": "Not performed; descriptive threshold count only", "theil_sen_slope": None, "slope_per_decade": None,
                       "p_value": None, "confidence_interval_95": None, "autocorrelation_decision": "Not assessed; no significance verdict", "multiple_testing_adjustment": "Not applicable; no hypothesis tests performed"},
        "reproducibility": {**provenance, "counter_source_sha256": code_hash, "source_sha256": meta.get("source_sha256"), "processed_sha256": meta.get("processed_sha256"),
                            "raw_data_reference": meta.get("raw_snapshot") if mode != "FIXTURE" else "backend/app/data/power.py deterministic fixture seed 2026", "processed_data_reference": meta.get("processed_snapshot"),
                            "request": {"location_id": location["id"], "threshold_c": threshold_c, "mode": mode.lower()},
                            "assumptions": ["No interpolation or scaling of incomplete-year counts", "Threshold is user-defined, not an official heatwave definition", "No trend test, causal attribution, forecast or local-health conclusion is produced", "Point/grid estimate is not a district average"],
                            "limitations": ["No station validation or homogeneity assessment performed", "Valid-pixel coverage is not supplied by POWER point API"]},
    }
    result = {"schema_version": "1.0", "analysis_id": analysis_id, "location": location, "threshold_c": threshold_c,
              "definition": definition, "series": rows, "provenance": provenance, "passport": passport}
    output = ROOT / "data/processed/counters"
    output.mkdir(parents=True, exist_ok=True)
    (output / f"{analysis_id}.json").write_text(json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8")
    return result
