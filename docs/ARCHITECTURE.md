# Architecture

## Shared path

NASA POWER / future NASA DAACs → modular Python adapters → immutable raw JSON + metadata + Parquet cache → QC and aggregation → deterministic trend engine → FastAPI `/api/v1` → Next.js App Router.

Frontend: React, TypeScript, Tailwind CSS, Leaflet, Recharts, Framer Motion, CSS/SVG motion. The homepage renders a South-Asia-centered sphere from a locally stored NASA December 2004 texture. Real Natural Earth GeoJSON supports offline cartography. Network tiles and fonts are not required for prepared cases.

Backend: FastAPI, Pandas, NumPy, SciPy, pyMannKendall, statsmodels. Raw source records and timestamps stay in `data/raw` and `data/metadata`; cleaned daily records use Parquet in `data/processed`; JSON analyses persist under `data/processed/analyses`. Synthetic fixtures are deterministic and explicitly labeled. xarray/rasterio/GeoPandas and Zarr/NetCDF belong to the future validated satellite/polygon adapter layer; they are not needed for point POWER data and are not represented as integrated.

## Workspaces

Explore and Research use the same `EvidenceWorkspace`, `EvidenceChart`, `EarthMap`, API client and versioned TypeScript result types. Research adds quality/statistical/geographic controls and the complete source catalogue. Student Lab and Claim Court call the same trend and comparison endpoints. Court scoring resolves the persisted backend analysis; it cannot invent a scientific answer. The optional explanation endpoint looks up an existing verified result and returns reviewed English/Bangla templates. No AI runtime, numerical rewriting or generative verdicts.

Every response includes an analysis ID, series, source, units, period, aggregation, quality, statistical evidence, verdict, retrieval status and Data Passport. Full-record summaries accompany selected-window results. CSV/JSON/SVG/PDF exports derive from those same values. The interface handles loading/failure and distinguishes LIVE, CACHED and FIXTURE modes.

## API contract 1.0

`GET /health`, `/variables`, `/locations`, `/claims`, `/datasets`; `POST /trend`, `/compare`, `/court`, `/explain`; `GET /data-passport/{analysis_id}` and `/export/{analysis_id}.{csv|json|pdf}`. An optional `/hot-days` endpoint counts threshold exceedances from daily T2M_MAX. API documentation: `http://127.0.0.1:8000/docs`. Required original unprefixed routes remain aliases; use versioned routes in clients.

`TrendRequest`: location ID or lat/lon, compatible parameter, start/end year, aggregation, calendar month, evidence mode, dependence handling. Output includes `schema_version=1.0`. A `series` row is `{year,value,coverage}`; `value=null` marks missing/excluded periods. Slopes are per calendar year and decade; `ci_95` is per decade. Chart intercept is at the selected start year. `window_sensitive` flags disagreement with the full-record evidence category; it does not imply a formal difference-of-slopes test.

Comparison requires matching parameter, source, period and aggregation. Raw and BH-adjusted p-values are distinguished. Differences in category are descriptive; a difference between two significance labels is not itself evidence that slopes differ.

## Provenance and reproducibility

Data Passport groups identity, measurement, space/time, processing, statistics and reproducibility. Pixel coverage is null where POWER does not supply it, never a fabricated 100%. Product source types remain explicit. Raw source metadata includes NASA's actual parameter units. Local software version is recorded; no nonexistent git commit is invented.

## Geographic and extension boundaries

Prepared sites: Dhaka, Rajshahi, Khulna, Sylhet, Sunamganj, Kathmandu. New global coordinates use the same POWER adapter when a live retrieval succeeds. Place names are representative points. Bangladesh district-name selections use point support; polygon averaging remains disabled until a validated boundary/raster pipeline exists.

GPM IMERG, both MODIS products, VIIRS, SMAP, GRACE, MERRA-2, GLDAS, AIRS/CLIMCAPS and OMI remain catalogue entries. Each future adapter must supply product/version/band/QC/scaling/coverage/credential/redistribution checks before enabling analysis. IMERG has priority over MODIS under the original sequence.

Optional modules: Hot-days Counter uses daily maxima with explicit threshold/completeness; Case Card uses the same export/report objects; Daily Case selects a verified existing case; AI Variable Helper may only propose a parameter for confirmation. None may generate observations or statistics.

## Deployment and offline operation

This task implements the user's existing local project root and two local servers; it does not publish the private workspace or claim a public demo exists. Next proxies `/api/v1` to `BACKEND_URL`. Prepared investigations run without external network while both servers are active. A browser service-worker installable/offline shell is not currently claimed. Development must be compiled before recording; production runs use the validated build.

## Accessibility and privacy

Keyboard controls, labeled inputs, textual evidence states, responsive media queries, reduced-motion styles and user-preference Framer Motion controls. Learning evaluations remain browser-local and can be exported deliberately; no user-test impact is inferred. No accounts, analytics, user data service or external messaging.


## Experience upgrade additions

Ask BhuSanket is a separate Next.js server route at `/api/assistant`, using the OpenAI Responses REST API only after OPENAI_API_KEY and OPENAI_MODEL are configured server-side. The scientific `/explain` template endpoint remains intact. The browser publishes only a current analysis ID; the server reloads the authoritative persisted result before provider invocation. AI text has no write access to the numerical engine. Model output containing numeric digits is rejected and exact statistics are rendered from the verified record separately. Missing provider configuration returns503 with an honest UI state. See README configuration; live provider behavior is not yet validated.

The environmental map adds observed-year values at five prepared POWER points, fetched through the existing trend adapter. The legend is relative to these valid points for that year, with unavailable data gray. It does not imply a district raster or validate the satellite extensions. Contextual historical imagery is rendered separately from measured points. Bilingual chart guides and observation prompts explain measurements before and alongside the evidence. NASA video is a compressed, explicitly labeled historical reconstruction, not a data layer or live imagery.
