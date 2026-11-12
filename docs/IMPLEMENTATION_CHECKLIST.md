# Implementation checklist

Updated 11 November 2026, Asia/Dhaka. Status describes actual implementation and validation, not a reduction of the original product scope. Original priorities are locked in `MASTER_PLAN_LOCK.md`. `[x]` means implemented; release/human verification limits are stated separately.

## P0 — shared scientific investigation

- [x] Root Next.js App Router/TypeScript/Tailwind/ESLint project; npm; modular monorepo structure.
- [x] FastAPI/NumPy/Pandas/SciPy/pyMannKendall/statsmodels scientific backend.
- [x] Versioned request/result schemas, OpenAPI and all seven original API routes; optional explanation uses verified stored results.
- [x] Navigation, cinematic homepage, question-first entry, three workspaces and Data & Methods.
- [x] NASA POWER Daily ingestion: T2M, T2M_MAX, PRECTOTCORR, RH2M, ALLSKY_SFC_SW_DWN.
- [x] Real 1991–2024 records for Dhaka, Rajshahi, Khulna, Sylhet, Sunamganj and Kathmandu; source headers and actual units preserved.
- [x] Raw JSON + immutable content-addressed snapshots + Parquet + source/processed/code hashes.
- [x] Explicit LIVE / CACHED / FIXTURE labels; shared schemas; cached execution with network access forbidden in tests.
- [x] Fill/physical QC, no interpolation, complete-period rain sums, coverage thresholds, missing data and valid-pixel null where not applicable.
- [x] Annual, MAM summer, JJAS monsoon and same-calendar-month analysis; aggregation rules visible.
- [x] Mann–Kendall/ties/continuity, Theil–Sen/calendar years, 95% slope interval, serial diagnostic, Hamed–Rao or significance withheld.
- [x] BH FDR for two-location family; raw/adjusted evidence distinguished; comparison passport persisted separately.
- [x] Separate significant increase/decrease, non-significance and insufficient evidence; selected/full-record window sensitivity.
- [x] Shared observed series, fit, slope interval illustration, gap markers, verdict, comparisons, game and exports.
- [x] Mandatory Data Passport groups: identity; measurement; geography/time; processing; statistics; reproducibility.
- [x] English/Bangla scientific interpretation, glossary and reviewed template explanations; no AI statistics.
- [x] Real world/Bangladesh Leaflet maps, 64-district representative-point selection, coordinate selection, global view.
- [x] Point/grid support and district-boundary source attribution; no invented polygon averages.
- [x] Prepared offline demo case, reproduction CLI, walkthrough and exact PowerShell commands.
- [ ] First-time student completes an investigation unaided — human usability release gate, not yet observed.
- [ ] Public repository, public hosted web/API, videos and submitted NASA project page — team/external delivery gates, not completed by this local build.

## P1 — signature interactions

- [x] Analysis-Window Slider — start/end years recompute backend analysis; full-record summary remains; real 2010–2024 case demonstrates sensitivity.
- [x] Trend Divergence Detector — same variable/source/period/season, slope, uncertainty, coverage, FDR; no formal slope-difference claim.
- [x] Climate Claim Checker — preset-to-location/parameter/season/period mapping; authoritative backend claim verdict.
- [x] Claim Court — claim, prior prediction, three tokens, actual full-record/season/test/neighbour evidence, confidence and stamp.
- [x] Court scoring — +3 correct; +1 unused; at least one tool; −2 confident misleading SUPPORTED; visible explanation; server checks claim/result identity and period.
- [x] NASA Mission-to-Evidence Trail (original P1/P2) — product → variable → QC → aggregation → test → verdict → passport.

## P2 and strong-if-time — preserved original category

- [x] Earth Impact Lens — qualified agriculture/water/education/planning context, no causal or policy advice.
- [x] Student Lab missions, hypothesis-before-reveal, chart coach, reflection, evidence-based level unlocks.
- [x] Actual local pre/post chart-reading responses/scores/time and JSON export; no invented educational improvement.
- [x] Rookie, Detective, Chief Detective paths; five printable teacher worksheets.
- [x] Reproducibility PDF, JSON, CSV, chart SVG, shareable HTML Case Card with print layout.
- [x] Verified global point — Kathmandu follows same NASA adapter, processing and schema.
- [ ] GPM IMERG V07B Final satellite extension — next original priority; no authenticated/granule/QC sample validated.
- [ ] Terra MODIS MOD11A2.061 / MOD13Q1.061 adapter — retained, not enabled; download/QC/scaling validation outstanding.

## Complete Research catalogue

| Dataset | Actual status |
|---|---|
| NASA POWER Daily | Available and validated for five parameters and prepared points |
| NASA POWER Monthly endpoint | Planned; current monthly metric aggregates daily data |
| GPM IMERG V07B Final | Not yet validated |
| MOD11A2.061 | Not yet validated / planned adapter |
| MOD13Q1.061 | Planned |
| VIIRS | Not yet validated exact collection/version; planned adapter |
| SMAP | Planned |
| GRACE / GRACE-FO | Planned |
| MERRA-2 | Planned direct adapter; POWER source attribution does not equal a direct adapter |
| GLDAS | Planned |
| AIRS / CLIMCAPS | Planned |
| OMI / Aura | Planned |

- [x] Research dataset/variable search; only compatible validated POWER selectable; all other products retained with disabled/availability explanations.
- [x] Point/source-grid controls, time, season, QC, dependence handling, comparison and exports.
- [ ] Polygon raster aggregation, valid-pixel/area weighting, xarray/rasterio/GeoPandas adapters, Zarr/NetCDF persistence — preserved architecture; not implemented or misrepresented by district outlines.
- [ ] Independent station validation and breakpoint/homogeneity assessment — scientific limitation, never claimed.

## Optional extensions — preserved individually

- [x] Hot-days Counter — explicit T2M_MAX threshold, full daily period, completeness, source/provenance and export; not an official heatwave definition.
- [x] Shareable Case Card — actual chart, computed result, provenance, caveats, downloadable standalone HTML with one-page print styling. Print pagination still needs browser QA.
- [x] Daily Case — date-based rotation of defined real-record presets, actual verdict computed on opening.
- [ ] AI Variable Helper — planned; no generative service configured. May suggest variables only, with user confirmation; never statistics/verdicts.

## Visual and interaction requirements

- [x] Original palette, locally bundled Manrope, oversized typography, Earth imagery, orbital/signal motion, floating evidence panel and asymmetric/full-width sections.
- [x] NASA historical-image context and credits, authentic geographic vectors and local font/assets.
- [x] Map fly-to, line drawing, selected-window transitions, evidence-trail reveal and Court stamp.
- [x] Reduced-motion CSS/map behavior/Framer preference and responsive breakpoints; keyboard labels, visible focus and single main landmark.
- [ ] Browser responsive/visual/interaction QA and measured motion performance — blocked: browser host unavailable; Computer Use stopped because current URL could not be verified. Do not treat passing builds/HTTP checks as visual QA.

## Executed validation and remaining release gates

- [x] Production Next.js build and full TypeScript checking passed; final-source verification recorded in `VALIDATION.md`.
- [x] ESLint passed.
- [x] Seven main routes returned HTTP 200; frontend-to-backend proxy returned an actual cached analysis.
- [x] Backend startup/health and scientific/API tests passed; exact latest count and command in `SCIENCE_VALIDATION.md`.
- [x] Trusted-library agreement for rising/falling/flat/tied/autocorrelated series; seasonal/missing/coverage/FDR/window/claim/provenance/offline tests.
- [x] Reproduction recovered slope/p/CI/intercept/verdict within 1e-10.
- [x] Three-page report rendered and all pages inspected; no clipping/overlap observed.
- [x] Dependency audit after targeted lint dependency fix: zero vulnerabilities.
- [ ] Complete human browser/device QA, actual student/teacher evaluation and expert case review.
- [ ] Confirm Local Lead deadlines; record/subtitle/credit videos; deploy public web/API; publish source; complete NASA page; verify all public links without login.

## Explicitly out of scope — unchanged

Forecasting/early warning; causal attribution; policy prescriptions from a trend; a general climate chatbot; every NASA adapter/variable/polygon in the first release; social/accounts/complex orchestration without a concrete tested need. These exclusions come from the original PDF and have not been silently expanded.


## Experience upgrade status

- [x] Local16-second NASA SVS Earthrise simulation with poster, fallback, scene selector and reduced-motion code.
- [x] Actual prepared-point values and temporal inspection, with units/coverage/relative legend; no interpolated raster.
- [x] Separate variable-specific explanations and true satellite adapter status.
- [x] Four bilingual teaching sections for major charts; student/Court observation interaction.
- [x] Global Ask BhuSanket UI and real server-side OpenAI provider integration; verified-ID context and7 mocked boundary tests.
- [ ] Configure OPENAI_API_KEY and OPENAI_MODEL and validate real provider answers. No generated responses are claimed yet.
- [ ] Browser visual/interaction/autoplay/reduced-motion/performance QA remains unavailable in this tool session.
