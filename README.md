# BHUSANKET

**Earth Systems Discovery & Evidence Lab**  
Read Earth's signals. Trace every change.

A Bangladesh-first NASA data investigation application with Explore Earth, Student Lab and Research Workspace, plus Claim Court. Built directly in this repository with Next.js/React/TypeScript/Tailwind, Leaflet/Recharts/Framer Motion and a deterministic FastAPI scientific backend.

The source master plan remains in `docs/BhuSanket_Master_Product_Build_Plan_NASA_Space_Apps_2026.pdf`. Read the [scope lock](docs/MASTER_PLAN_LOCK.md), [implementation checklist](docs/IMPLEMENTATION_CHECKLIST.md), [architecture](docs/ARCHITECTURE.md), [scientific validation](docs/SCIENCE_VALIDATION.md) and [demo walkthrough](docs/DEMO_WALKTHROUGH.md).

## Run in PowerShell

Node 22 LTS or newer is recommended; the build was also tested on installed Node 20.10. Python 3.13 was used. Dependencies and prepared NASA data are already present in this working copy. Start both servers with:

```powershell
Set-Location D:\MyProjects\BHUSanket
npm run lab
```

Open `http://127.0.0.1:3000`. The API is `http://127.0.0.1:8000`, with interactive documentation at `/docs`. Stop both servers with Ctrl+C. For recording, build once and use production mode:

```powershell
npm run build
npm run demo
```

If using a clean checkout, install first:

```powershell
Set-Location D:\MyProjects\BHUSanket
npm ci
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements-lock.txt
npm run lab
```

The launcher selects `.venv\Scripts\python.exe` when present; otherwise it uses Python plus the project-local `.python-packages` installed during development. No activation or system-wide configuration is required. `.env.example` documents the optional backend proxy URL; the defaults work locally.

To run separately in two terminals:

```powershell
# Terminal 1, repository root
$env:PYTHONPATH = "$PWD;$PWD\.python-packages"
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

```powershell
# Terminal 2, repository root
npm run dev
```

## Observatory experience update

The approved “From Orbit to Evidence” redesign is implemented locally. It includes the cinematic South Asia globe and genuine NASA ISS film, Bengal Delta chapter, source gallery, atlas background switch, fixed-domain point legends, chart-first Research workbench, readable slope intervals, mission-specific NASA imagery, an interactive Claim Court evidence board, and a contextual bilingual assistant with session question history and explicit reviewed summaries. See [implementation and validation](docs/EXPERIENCE_IMPLEMENTATION.md) and [new NASA asset credits](docs/OBSERVATORY_ASSETS.md).

The previous refinement stylesheet is no longer imported; shared tokens, scientific workspace styles, learning styles and assistant styles now have dedicated current definitions. All original routes, statistical tools and exports remain available.

## Implemented behavior

- Cinematic local NASA Earth imagery, orbit/signal motion, editorial layouts and responsive/reduced-motion styles.
- Question-first Explore, real maps and coordinate selection, prepared Bangladesh/global points, annual/MAM/JJAS/calendar-month analysis, year-window recomputation and full-record comparison.
- Deterministic Mann–Kendall, Theil–Sen slope/95% interval, missingness/coverage, serial-dependence handling, BH FDR for compatible two-place comparisons and separate insufficient/non-significant states.
- Complete Data Passport, NASA mission-to-evidence trail, qualified impact lens and CSV/JSON/chart/PDF exports.
- Preset Climate Claim Checker and playable Claim Court using the same backend results, evidence tokens, prediction/confidence and transparent server scoring.
- Student missions, hypothesis gate, chart-reading coach, English/Bangla glossary/explanation, actual local pre/post quiz records, reflections, levels and five teacher worksheets.
- Full planned NASA catalogue with honest availability labels. Optional extensions remain tracked individually.

## Genuine data

NASA POWER Daily API v2.10.3 responses were acquired for Dhaka, Rajshahi, Khulna, Sylhet, Sunamganj and Kathmandu, 1991–2024. Each has 12,419 daily records with T2M, T2M_MAX, PRECTOTCORR, RH2M and ALLSKY_SFC_SW_DWN. Raw JSON, source metadata and processed Parquet are included. Solar units follow the actual AG API metadata (MJ/m²/day). POWER meteorology is grid-supported model/reanalysis data; it is not a raw satellite photograph or district average.

Prepared cases compute entirely locally. Choose CACHED mode for venue-network failure; LIVE mode explicitly retrieves NASA data. FIXTURE is an explicit synthetic selection and never a fallback masquerading as NASA data. The local application servers must remain running; an installable service-worker offline shell is not claimed.

GPM IMERG and MODIS/VIIRS/SMAP/GRACE/MERRA-2/GLDAS/AIRS/OMI are retained in the catalogue. Their complete satellite/DAAC adapters have not been validated and cannot power scientific results. Polygon averages also remain unavailable pending raster QC and area-weighting validation.

## Validate and reproduce

```powershell
npm run lint
npm run typecheck
npm run build
$env:PYTHONPATH = "$PWD;$PWD\.python-packages"
python -m pytest backend\tests -q
python scripts\reproduce.py data\processed\analyses\YOUR_ANALYSIS_ID.json
```

Replace `YOUR_ANALYSIS_ID` with the actual exported case ID. The reproduction script verifies embedded-series slope, p-value, CI, intercept and verdict within 1e-10 tolerance. See the validation document for executed results and limits. A conventional slope CI assumes independent errors, even when the significance test receives a dependence correction; the interface warns accordingly. Lag-one dependence screening does not rule out higher-order dependence.

## Delivery boundaries

This repository is a functioning local prototype. Public hosting, a public GitHub repository, participant usability evaluation, video production and NASA project-page submission are not represented as completed. Browser visual/interaction QA could not be completed because the browser access host is unavailable; responsive CSS and successful page responses are not a substitute for that check. Review the release gates in the checklist before recording or publication.

## Credits and disclosure

NASA POWER: https://power.larc.nasa.gov/docs/services/api/temporal/daily/  
Earth imagery: NASA Blue Marble Next Generation, December 2004 historical composite; NASA Earth Observatory / Reto Stöckli and Robert Simmon.  
World map: Natural Earth, public domain. Bangladesh district cartography: geoBoundaries BGD ADM2, BBS/OCHA ROAP, CC BY 3.0 IGO; provenance in `data/metadata/bangladesh-boundaries.json`. Boundary outlines do not imply area-average measurements.  
Typeface: Manrope, SIL Open Font License (`public/fonts/OFL.txt`). Icons: Lucide, ISC.  
Scientific references: Hamed & Rao (1998), Sen (1968), SciPy, pyMannKendall and statsmodels documentation.

OpenAI Codex assisted implementation, documentation and testing; no AI runtime calculates observations, statistics or scientific verdicts. No educational impact or user study results are invented. Independent Space Apps team project; NASA endorsement is not implied.


## Ask BhuSanket configuration

The contextual assistant uses the server-side OpenAI Responses API. No API key or model was configured in this workspace during development. Free-form AI returns an explicit unavailable state. The separately labelled “Read verified summary” action uses the existing reviewed backend explanation, in English or Bangla, without a model call. In an ignored `.env.local` at the project root, set:

```dotenv
OPENAI_API_KEY=your_real_key
OPENAI_MODEL=your_enabled_Responses_API_model_id
BACKEND_URL=http://127.0.0.1:8001
```

Restart Next.js after configuring. Keep keys out of NEXT_PUBLIC variables and version control. Select a model enabled for your own API project; there is no assumed default model. Documentation: https://developers.openai.com/api/reference/resources/responses/methods/create

Only a saved analysis ID and question/language are accepted from the client. The server retrieves the authoritative result and metadata from FastAPI before calling OpenAI with `store:false`. AI text is explanatory, never the numerical source. Replies containing numeric digits are rejected; the exact values, source and period are rendered separately from verified evidence. This filter cannot prove the truth of every generated sentence. Review AI narration against the evidence; provider behavior has not been tested live without credentials. Concept questions without a selected result use the actual dataset catalogue and explicitly have no finding to interpret.

`node scripts/test-assistant.mjs` runs mocked boundary tests without a provider call. `BHU_BASE_URL` lets `scripts/smoke.py` target the correct local checkout.
