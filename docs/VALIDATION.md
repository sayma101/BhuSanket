# Executed validation — 11 November 2026

All results below refer to commands actually run in this working copy. Source edits were followed by the relevant checks; the last complete frontend run included the district picker, optional tools, local Manrope, case-card export and single-main-landmark changes.

| Check | Observed outcome |
|---|---|
| `npm run lint` | Passed, exit 0 |
| `npm run typecheck` | Passed, exit 0 |
| `npm run build` | Passed, exit 0; all 10 generated pages, including seven main product routes and routing utility pages |
| `npm run demo` | Started production Next.js on 127.0.0.1:3000 and Uvicorn on 127.0.0.1:8000 |
| `python scripts/smoke.py` | 21 HTTP integration checks passed; full details in `HTTP_SMOKE.json` |
| Backend pytest | 26 tests passed after final counter provenance/calendar-gap changes; see `SCIENCE_VALIDATION.md` |
| `scripts/reproduce.py data/metadata/demo-result.json` | Reproduced slope, p-value, CI, intercept and verdict within 1e-10 |
| PDF export | Generated from real cached result, rendered to three pages, all pages visually inspected; no clipping or overlap observed |
| `npm audit --json` | Zero vulnerabilities after a targeted override of the lint tooling's minimatch dependency; result in `npm-audit.json` |
| Source master PDF | Retained unchanged; SHA256 recorded in `MASTER_PLAN_LOCK.md` |

The HTTP smoke check verifies all seven main routes return 200 with a single main landmark; local imagery/font; 64 district geometries; frontend/API health; real cached record; chart-series length; passport numerical parity; selected-window recomputation/full-record parity; insufficient-evidence state; FDR comparison; claim/Court agreement and original scoring; explicit synthetic fixture label; and counter passport retrieval.

Backend tests cover rising, falling, flat, tied, seasonal, missing, short and autocorrelated series; trusted-library/known-probability agreement; actual-year slopes; annual/calendar-month/season aggregation; incomplete rain totals; physical/fill QC; FDR; cached-source parsing; window/comparison/claims/scoring/exports/passports; exact claim period; immutable snapshot hashes; omitted whole calendar dates; schema parity; and cached operation with network access explicitly forbidden.

## Limits of these checks

Browser visual/interaction QA, actual device responsiveness, one-page Case Card print pagination and measured animation performance were **not verified**. The browser-access host was unavailable; native browser observation returned no accessibility state, then Computer Use stopped because it could not verify the current URL. No alternate browser automation was used after that restriction. CSS breakpoints, reduced-motion code and successful HTML responses do not substitute for browser QA.

No first-time-user study, teacher review, domain-expert review, station comparison, homogenization/breakpoint analysis or external product validation was performed. Test fixtures are technical tests, never evidence of real-world educational improvement. NASA POWER is genuinely integrated; catalogue presence is not satellite-adapter validation.

The installed Node 20.10 runtime completed the checks, but one lint subdependency declares a newer Node engine. Node 22 LTS or newer is recommended for clean installations. Tailwind is locked to the tested compiler release in `package-lock.json`; use `npm ci` to reproduce it. The original latest compiler failed with this runtime and was replaced before the successful builds.

The local Git repository was initialized, but no remote/public repository, public deployment, NASA project submission or video was created. Those remain explicit delivery gates.

## Targeted premium visual refinement

The existing application was refined in place. Added the locally stored NASA Terra/MODIS Ganges Delta still (28 December 2000), full-width image composition, reduced-motion-aware transform parallax, schematic SVG signal trajectories, warm-paper floating evidence panel, distinct Research/Student/Court presentation, selected-map-marker feedback, trend/interval reveal styles and animated provenance connections. Asset credits are in ASSET_CREDITS.md. No backend statistical method or NASA observation was changed.

Re-executed after refinement: lint passed; TypeScript passed; production build passed (10 pages); 26 backend tests passed (one existing AnyIO deprecation warning); 21 HTTP checks passed against this checkout at http://127.0.0.1:3001. Independently checked six locations × five parameters, 12,419 daily rows per location, all64 district geometries and five teacher sheets. The new hero markup and local image returned200.

Discovered an existing port3000 server points to D:\bhusanket, a different checkout. It was left untouched. Added BACKEND_PORT support to the local launcher and BHU_BASE_URL support to the smoke script, so this workspace can be validated on isolated ports. This matters: checking another checkout is not proof this source works.

Current build targets backend8001. Launch this build with:

```powershell
Set-Location D:\MyProjects\BHUSanket
$env:PORT='3001'
$env:BACKEND_PORT='8001'
$env:BACKEND_URL='http://127.0.0.1:8001'
npm run demo
```

When rebuilding, set BACKEND_URL before npm run build. For development, use the same environment and npm run lab. The default launcher behavior remains3000/8000 when those ports are free and the build uses that backend address.

Browser host discovery again reported unavailable. Desktop1440×900, mobile visual layout, interaction appearance, reduced-motion appearance and frame-rate performance were not visually tested. No Playwright/browser fallback was improvised after this availability check. No verified video was added; the hero is explicitly historical still imagery. Satellite adapters and polygon averages remain unvalidated as before.


## Experience transformation verification

Implemented: switchable NASA Earthrise simulation / historical Bangladesh satellite scene;16-second locally compressed video436123bytes with32582-byte poster; five prepared POWER points colored by actual selected-year values with a temporal control, correct units/coverage and explicitly relative legend; variable-specific rainfall/soil-moisture/storage/temperature/vegetation explanations and true adapter availability; four bilingual chart-reading sections in Explore/Research/learning/Court charts and hot-day counts; interactive observation prompts before student/Court evidence; globally available Ask BhuSanket with verified-analysis context.

Re-executed: clean ESLint; TypeScript; production build including dynamic /api/assistant;26 backend tests (one existing AnyIO deprecation warning);21 HTTP smoke checks against this checkout on3001/8001; numerical reproduction within1e-10;7 mocked assistant boundary checks. Assistant tests cover missing configuration, invalid identity, server-side evidence lookup rather than client values, store:false, numerical-answer rejection, missing analysis and cross-origin rejection. No real OpenAI request was made: neither API key nor model is configured. An HTTP request confirmed explicit503 rather than a simulated answer. The configured provider request/response branch is mock-tested, not live-provider validated. Numeric filtering cannot prove every sentence scientifically correct.

Video and poster both returned200 with correct media MIME types; MP4 metadata confirms16seconds. Inspected the generated poster. Independently requested actual2024 JJAS rainfall values at all five Bangladesh prepared points: the API returned millimetres and full source-day coverage. These support point-marker values only; no spatial interpolation, GPM raster, SMAP, GRACE or MODIS measurement layer was introduced. Existing scientific engine and Data Passport methods remain unchanged.

Browser discovery again returned no browser surfaces and an unavailable access host. Desktop1440×900, mobile, actual animation/frame-rate behavior, autoplay and reduced-motion appearance remain unverified in-browser. Reduced-motion code avoids mounting/downloading the video and suppresses the added motion; this is source inspection, not a browser test.
