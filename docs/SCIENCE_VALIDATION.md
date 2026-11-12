# Scientific validation record

Status: runtime validation completed on 11 November 2026. **26 backend tests passed** after the final threshold-counter provenance and missing-date coverage changes. One dependency-level deprecation warning concerned AnyIO's BlockingPortal alias; no test failed.

## Real data acquired

NASA POWER Daily point responses were successfully downloaded for Dhaka, Rajshahi, Khulna, Sylhet, Sunamganj and Kathmandu. Each response covers 1991-01-01 through 2024-12-31, requested in UTC, with T2M, T2M_MAX, PRECTOTCORR, RH2M and ALLSKY_SFC_SW_DWN. Original response bytes and retrieval sidecars are in `data/raw/`.

Each location contains 12,419 daily rows. Normalized Parquet caches and metadata are present. Content-addressed immutable raw and processed snapshots, with both SHA256 values in each Data Passport, protect existing analyses from later live-cache refreshes.

The actual response header identifies POWER Daily API `v2.10.3`. This is an API version, not an invented underlying collection version. Upstream source names are preserved. Actual AG-community solar units are `MJ/m^2/day`; they are not silently treated as kWh.

## Implemented methods and interpretation limits

- Daily fill-value and physical-range exclusions; missing values remain missing.
- Annual, March-May pre-monsoon summer, June-September monsoon and like-for-like calendar-month aggregation.
- Arithmetic means require at least 90% daily coverage per period. Precipitation sums require complete periods, preventing partial totals from being interpreted as dry years.
- At least 10 valid years and 80% valid aggregate-period coverage are required for a significance verdict.
- Mann-Kendall with tie/continuity correction, or the trusted `pymannkendall` Hamed-Rao correction when the detrended rank lag-1 diagnostic identifies material dependence. Irregular gaps plus material dependence cause significance to be withheld.
- Theil-Sen uses actual calendar years. Slopes and 95% slope intervals are returned per decade; the fitted intercept is anchored at the requested start year.
- The conventional Theil-Sen interval assumes independent observations. It is explicitly warned as unadjusted when serial dependence is detected. The lag-1 diagnostic does not prove independence or rule out higher-order dependence.
- Two-location comparisons apply Benjamini-Hochberg FDR across the two defined tests. Adjusted comparison verdicts and passports are stored under distinct comparison analysis IDs. This is not a formal test of the difference between slopes.
- No causal attribution, forecasting, silent interpolation or AI-computed numerical values.

## Coverage and provenance

POWER responses are point/grid estimates, never district averages. Valid-pixel coverage and polygon boundary metadata are not applicable and remain null. The complete upstream source metadata, source URL, retrieval timestamp, software version and request are preserved in the Data Passport.

LIVE, CACHED and FIXTURE modes use the same response schema. A cache miss returns an explicit error. Synthetic fixtures are used only when explicitly requested and are visibly marked FIXTURE; they are never a hidden replacement for NASA data.

## Satellite extension status

GPM IMERG V07B Final and MOD11A2.061 remain **Not yet validated**. Other catalogue entries remain **Planned**. No satellite extension is claimed as integrated without a downloaded, opened and quality-checked measurement sample. NASA POWER is the genuinely integrated data path.

## Tests

Passed: synthetic rising, falling, flat, tied, seasonal, missing, short and autocorrelated series; trusted-library agreement; known Mann-Kendall probability; aggregation; rainfall coverage; fill/QC; FDR; real-cache API, window recalculation, comparison, provenance, CSV/JSON exports, Claim Court and bilingual deterministic explanations. Additional tests verify schema parity for cached/fixture responses, immutable snapshot hashes and successful cached operation with network access explicitly forbidden.

The backend started successfully under Uvicorn. An independent HTTP health request returned 200; real cached investigations worked for all six locations. `scripts/reproduce.py data/metadata/demo-result.json` reproduced slope, p-value, confidence interval, intercept and verdict at absolute/relative tolerance 1e-10.

The reproducibility PDF was generated from the actual result, rendered to three page PNGs and visually inspected. It includes observed series, fitted trend, computed statistics and complete Data Passport. No clipping or overlapping text was observed.

The optional Hot-days Counter also emits and persists a complete Data Passport, available through the shared passport endpoint and JSON export. It documents T2M_MAX, user threshold, source/version, coordinates/grid support, UTC calendar period, complete-year coverage rule, source/snapshot/software hashes and limitations. Slope, p-value and CI are explicitly null because no trend test is performed. A meaningful omitted-date test removes one entire source date and verifies that the calendar year's count becomes null rather than appearing complete.

## Verified demonstration result

For **Dhaka / T2M / March-May / 1991-2024**, the actual cached POWER record yields **Significant decrease**, slope **-0.4031832298 degrees C per decade**, 95% slope interval **[-0.7163043478, -0.0341897233] degrees C per decade**, Mann-Kendall p-value **0.02074391742**, and **34/34** valid seasonal periods. The preset increasing-temperature claim is therefore **NOT SUPPORTED ON THIS RECORD**. This is a finding about this specified gridded-product record, not a causal climate explanation; no station validation or breakpoint/homogeneity assessment was performed.

Selecting **2010-2024** gives **No significant trend detected**, p **0.4884223166**, and a window-sensitive comparison with the full record. Selecting **2019-2024** gives **Not enough evidence** because there are fewer than ten valid years.

The full-record Rajshahi annual rainfall-decrease claim is not supported; Khulna June-September rainfall-increase and Sylhet annual rainfall-increase claims are supported on their specified records. These cases are computed from NASA data and were not assigned verdicts in advance.

## Re-run commands

```powershell
$env:PYTHONPATH = '.python-packages'
python scripts/acquire_power.py
python -m pytest backend/tests -q
python scripts/reproduce.py data/metadata/demo-result.json
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

`backend/requirements-lock.txt` records the installed dependency versions. `scripts/download_power_raw.py` performs explicit NASA retrieval; `scripts/acquire_power.py` normalizes existing raw responses and preserves their retrieval timestamps.
