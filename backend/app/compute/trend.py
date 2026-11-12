"""Deterministic trend calculations; no imputation, forecasts or causal inference."""
import warnings
import numpy as np
import pandas as pd
import pymannkendall as mk
from scipy import stats
from statsmodels.stats.multitest import multipletests

MIN_YEARS = 10
MIN_COVERAGE = 0.90


def aggregate(frame, variable, aggregation="annual", month=1, start=1991, end=2024):
    source = frame[variable].reindex(pd.date_range(f"{start}-01-01", f"{end}-12-31", freq="D"))
    months = {"summer": [3, 4, 5], "monsoon": [6, 7, 8, 9], "monthly": [month]}.get(aggregation, list(range(1, 13)))
    selected = source[source.index.month.isin(months)]
    output = []
    # Rainfall totals require complete records: a partial sum can bias low and is never scaled.
    required_coverage = 1.0 if variable == "PRECTOTCORR" else MIN_COVERAGE
    for year, group in selected.groupby(selected.index.year):
        coverage = float(group.notna().mean())
        value = None
        if coverage >= required_coverage:
            value = float(group.sum() if variable == "PRECTOTCORR" else group.mean())
        output.append({"year": int(year), "value": value, "coverage": coverage})
    valid = int(selected.notna().sum())
    return output, {
        "valid_daily_observations": valid, "total_daily_observations": len(selected),
        "missing_daily_percent": float(100 * (1 - valid / len(selected))) if len(selected) else 100.0,
        "minimum_period_coverage": required_coverage,
        "excluded_periods": sum(x["value"] is None for x in output),
    }


def analyze(series, start_year, autocorrelation="auto"):
    valid = [x for x in series if x["value"] is not None and np.isfinite(x["value"])]
    n = len(valid)
    x = np.array([row["year"] for row in valid], dtype=float)
    y = np.array([row["value"] for row in valid], dtype=float)
    result = {"direction": "undetermined", "slope_per_year": None, "slope_per_decade": None,
              "ci_95": None, "p_value": None, "intercept": None, "test_variant": "not run",
              "autocorrelation": {"lag1": None, "decision": "insufficient observations"}}
    alerts = []
    if n < 2:
        return result, "Not enough evidence", ["Fewer than two valid periods; slope cannot be estimated."]
    slope, intercept, low, high = stats.theilslopes(y, x, alpha=0.95, method="separate")
    result.update(slope_per_year=float(slope), slope_per_decade=float(slope * 10),
                  ci_95=[float(low * 10), float(high * 10)], intercept=float(intercept + slope * start_year))
    if n < MIN_YEARS or n / len(series) < 0.8:
        return result, "Not enough evidence", ["Need at least 10 valid years and 80% valid aggregate-period coverage."]
    residual = y - (intercept + slope * x)
    # Diagnose residual ranks, not the raw trending series. Missing years break adjacency.
    consecutive = np.diff(x) == 1
    pairs = int(consecutive.sum())
    if np.std(residual) < 1e-12:
        lag1 = 0.0
    elif pairs >= 5 and np.std(residual[:-1][consecutive]) > 1e-12 and np.std(residual[1:][consecutive]) > 1e-12:
        lag1 = float(np.corrcoef(stats.rankdata(residual[:-1][consecutive]), stats.rankdata(residual[1:][consecutive]))[0, 1])
    else:
        lag1 = 0.0
    material = abs(lag1) > 1.96 / np.sqrt(max(pairs, 1))
    result["autocorrelation"]["lag1"] = lag1
    gaps = not bool(np.all(consecutive))
    if material and (autocorrelation == "withhold" or gaps):
        result["autocorrelation"]["decision"] = "Significance withheld: serial dependence with unresolved correction or irregular gaps"
        return result, "Not enough evidence", ["Serial dependence detected; significance withheld."]
    if material:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", RuntimeWarning)
            test = mk.hamed_rao_modification_test(y, alpha=0.05)
        result["test_variant"] = "Hamed–Rao modified Mann–Kendall (all significant rank-autocorrelation lags)"
        result["autocorrelation"]["decision"] = "Material residual lag-1 dependence; Hamed–Rao correction applied"
        # Theil–Sen's conventional CI is not serial-dependence adjusted; disclose this explicitly.
        alerts.append("95% Theil–Sen slope CI assumes independent observations; interpret cautiously after autocorrelation correction.")
    else:
        test = mk.original_test(y, alpha=0.05)
        result["test_variant"] = "Original Mann–Kendall with tie and continuity correction"
        result["autocorrelation"]["decision"] = "No material detrended rank lag-1 dependence detected (screen, not proof of independence)"
    p = float(test.p)
    if not np.isfinite(p):
        return result, "Not enough evidence", alerts + ["Corrected Mann–Kendall variance was invalid; significance withheld."]
    result["p_value"] = p
    if p < 0.05 and slope != 0:
        result["direction"] = "increasing" if slope > 0 else "decreasing"
        verdict = "Significant increase" if slope > 0 else "Significant decrease"
    else:
        result["direction"] = "no significant trend"
        verdict = "No significant trend detected"
    if gaps:
        alerts.append("Missing aggregate periods omitted; no interpolation. Theil–Sen uses actual calendar years.")
    return result, verdict, alerts


def fdr(p_values):
    """Benjamini–Hochberg; unavailable tests retain null and are not counted."""
    output = [None] * len(p_values)
    indices = [i for i, p in enumerate(p_values) if p is not None]
    if indices:
        adjusted = multipletests([p_values[i] for i in indices], method="fdr_bh")[1]
        for i, p in zip(indices, adjusted):
            output[i] = float(p)
    return output
