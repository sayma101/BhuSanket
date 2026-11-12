import numpy as np
import pandas as pd
import pymannkendall as mk
import pytest
from scipy import stats

from backend.app.compute.trend import aggregate, analyze, fdr
from backend.app.data.power import parse_response


def series(values, years=None):
    years = years if years is not None else range(1991, 1991 + len(values))
    return [{"year": int(year), "value": None if value is None else float(value), "coverage": 0 if value is None else 1} for year, value in zip(years, values)]


@pytest.mark.parametrize("values,expected", [
    (np.arange(34), "Significant increase"),
    (-np.arange(34), "Significant decrease"),
    (np.ones(34) * 12, "No significant trend detected"),
    (np.repeat(np.arange(17), 2), "Significant increase"),
])
def test_rising_falling_flat_ties_against_trusted_library(values, expected):
    trend, verdict, _ = analyze(series(values), 1991)
    assert verdict == expected
    trusted = mk.original_test(values)
    if "Original" in trend["test_variant"]:
        assert trend["p_value"] == pytest.approx(trusted.p, abs=1e-12)
    slope = stats.theilslopes(values, np.arange(1991, 2025))
    assert trend["slope_per_year"] == pytest.approx(slope.slope, abs=1e-12)
    assert trend["ci_95"] == pytest.approx([10 * slope.low_slope, 10 * slope.high_slope], abs=1e-12)


def test_gaps_use_actual_years_and_no_interpolation():
    values = [0, 2, None, 6, 8, 10, 12, 14, 16, 18, 20, 22]
    trend, verdict, warnings = analyze(series(values), 1991)
    assert trend["slope_per_year"] == pytest.approx(2)
    assert len(values) == 12
    assert "Missing" in " ".join(warnings)


def test_short_record_withholds():
    trend, verdict, _ = analyze(series(range(9)), 1991)
    assert verdict == "Not enough evidence"
    assert trend["p_value"] is None


def test_known_mann_kendall_p_value_formula():
    # Strictly rising 10-value series: S=45, variance=125, z=(45-1)/sqrt(125).
    trend, verdict, _ = analyze(series(np.arange(10)), 1991)
    expected_p = 2 * stats.norm.sf(44 / np.sqrt(125))
    assert trend["p_value"] == pytest.approx(expected_p, abs=1e-12)
    assert verdict == "Significant increase"


def test_large_gaps_withhold():
    _, verdict, _ = analyze(series([i if i % 2 == 0 else None for i in range(34)]), 1991)
    assert verdict == "Not enough evidence"


def test_serial_dependence_correction_matches_trusted():
    rng = np.random.default_rng(22)
    values = np.zeros(80)
    for i in range(1, 80):
        values[i] = 0.9 * values[i - 1] + rng.normal()
    trend, _, _ = analyze(series(values), 1991)
    assert "Hamed" in trend["test_variant"]
    assert trend["p_value"] == pytest.approx(mk.hamed_rao_modification_test(values).p, abs=1e-12)
    _, verdict, _ = analyze(series(values), 1991, "withhold")
    assert verdict == "Not enough evidence"


def test_seasonal_aggregation_defensible():
    dates = pd.date_range("1991-01-01", "2024-12-31")
    values = 10 + 8 * np.sin(dates.dayofyear.to_numpy() * 2 * np.pi / 365.25) + 0.1 * (dates.year.to_numpy() - 1991)
    frame = pd.DataFrame({"T2M": values}, index=dates)
    summer, quality = aggregate(frame, "T2M", "summer")
    manual = frame.loc[(frame.index.year == 1991) & frame.index.month.isin([3, 4, 5]), "T2M"].mean()
    assert summer[0]["value"] == pytest.approx(manual)
    assert quality["missing_daily_percent"] == 0
    trend, verdict, _ = analyze(summer, 1991)
    assert verdict == "Significant increase"
    assert trend["slope_per_year"] == pytest.approx(0.1, abs=0.001)


def test_rain_total_and_partial_sum_withheld():
    dates = pd.date_range("1991-01-01", "1992-12-31")
    frame = pd.DataFrame({"PRECTOTCORR": 1.0}, index=dates)
    output, _ = aggregate(frame, "PRECTOTCORR", start=1991, end=1992)
    assert output[0]["value"] == 365
    assert output[1]["value"] == 366
    frame.iloc[0] = np.nan
    output, _ = aggregate(frame, "PRECTOTCORR", start=1991, end=1992)
    assert output[0]["value"] is None
    assert output[0]["coverage"] < 1


def test_calendar_month():
    dates = pd.date_range("1991-01-01", "1992-12-31")
    frame = pd.DataFrame({"PRECTOTCORR": 1.0}, index=dates)
    output, _ = aggregate(frame, "PRECTOTCORR", "monthly", month=2, start=1991, end=1992)
    assert [row["value"] for row in output] == [28, 29]


def test_fill_and_physical_quality():
    raw = {"header": {"fill_value": -999}, "properties": {"parameter": {
        "T2M": {"19910101": -999, "19910102": 25},
        "PRECTOTCORR": {"19910101": -1, "19910102": 3},
        "RH2M": {"19910101": 101, "19910102": 80}}}}
    frame, qc = parse_response(raw)
    assert frame.iloc[0].isna().all()
    assert frame.iloc[1]["T2M"] == 25
    assert qc["excluded_values"] == {"T2M": 1, "PRECTOTCORR": 1, "RH2M": 1}


def test_fdr_reference():
    adjusted = fdr([0.01, 0.04, 0.03, None])
    assert adjusted[:3] == pytest.approx([0.03, 0.04, 0.04])
    assert adjusted[3] is None
