# From Orbit to Evidence — implementation record

Implemented locally on 12 November 2026. This update changes presentation and interaction, and preserves the existing deterministic scientific backend.

## Delivered

- A South Asia globe rendered from the existing NASA December 2004 texture, with a geographically positioned Bangladesh marker. The orbit graphic is schematic. The source texture uses the Next image optimizer, reducing the validated 1920px response to approximately 182KB.
- Genuine historical ISS footage from April 2016, a still fallback, scene selection, pause controls, reduced-motion support and offscreen/background playback suspension.
- A Bengal Delta editorial chapter, question destinations, a real backend-derived Dhaka case preview, workspace destinations and visible NASA source gallery.
- Explore Earth with local geographic boundaries, district representative-point selection, optional registered NASA GIBS satellite context, a location inspector, observed-year controls and a fixed-domain numerical legend.
- The map's six prepared-point records are explicitly cached NASA POWER estimates, or explicitly synthetic fixtures. The observed-year slider is independent of the analytical window. Point values are never interpolated into a raster.
- Research with persistent controls, a chart and statistical panel, slope interval plots, optional fixed-intercept slope shading, numerical tooltips with source-day coverage, preset analytical windows and comparison charts with a common y-axis domain.
- The full record summary, Trend Divergence Detector, Climate Claim Checker, NASA Mission-to-Evidence Trail, Earth Impact Lens, Data Passport, JSON/CSV/SVG/HTML/PDF exports, Daily Case and Hot-days Counter remain accessible.
- Data Passport now has readable identity, measurement, space/time, processing, statistics and reproducibility groups, alongside its original complete JSON and exports.
- Student Lab with distinct, dated NASA mission imagery, field journal layout, hypothesis gate, chart coaching, original pre/post quizzes, reflection, levels, glossary, worksheets and local session records.
- Claim Court with an evidence board, labelled relationships, three visible tokens, four original inspection tools, server-scored verdict animation and free reopening of inspected evidence. The original observation exercise remains available in a labelled disclosure.
- Ask BhuSanket with an optional docked layout, session question history, analysis-bound evidence attachments, English/Bangla selection, source links and a separately labelled deterministic reviewed-summary action. Answers from older analysis records retain their identity.

## Scientific boundaries

No analytical adapter, statistic, observed value, threshold rule, scientific verdict or court scoring formula was changed. The analytical numerical engine remains in Python.

NASA GIBS is an optional display background. The verified layer is `MODIS_Terra_CorrectedReflectance_TrueColor`, EPSG:3857, `GoogleMapsCompatible_Level9`, dated 15 January 2024. Its date is deliberately independent of the POWER analytical interval. A failed imagery request returns to local cartography with a visible message. Natural Earth and geoBoundaries source acknowledgements remain visible.

The slope interval uses the existing backend interval. Optional shading holds the fitted intercept fixed; it is explicitly labelled and is not a mean confidence band or prediction interval. Missing observations remain disconnected. Differing significance labels are not represented as a formal difference-of-slopes test.

Unvalidated GPM/MODIS/VIIRS/SMAP/GRACE/MERRA-2/GLDAS/AIRS/OMI adapters and polygon averages retain their availability restrictions. POWER meteorology and satellite-derived solar products keep their source types. Satellite context does not imply a direct spacecraft-to-POWER measurement chain.

## Validation

- `npm run typecheck`: passed.
- `npm run build`: passed; all existing page routes generated successfully.
- `python -m pytest backend/tests -q`: 26 passed. One existing dependency deprecation warning concerns AnyIO's BlockingPortal alias.
- `node scripts/test-assistant.mjs`: 7 boundary checks passed with a mocked provider. No live AI provider call was made.
- `scripts/smoke.py`: 21 HTTP integration checks passed, including page responses, real cached NASA results, window recalculation, full-record parity, insufficient evidence, FDR comparison, server court scoring, fixture labels and passport parity.
- Server-rendered page audit: no duplicate IDs and no images missing alt attributes on the seven primary routes; local page destinations returned successful responses.
- New local NASA assets returned the correct image/video content types. Optimized globe and Dhaka image requests returned successful image responses.
- Additional runtime checks: English/Bangla reviewed summaries match their verified analysis, PDF export has a valid PDF header, CSV spans the prepared period, and the unconfigured AI state is explicit. All five checks passed; results are recorded in `EXPERIENCE_CHECKS.json`.
- Public GIBS capabilities confirmed the exact layer and tile matrix; a Bangladesh-area tile returned HTTP 200 and valid JPEG content.

Browser visual and interactive QA could not be performed: the browser access host reports unavailable. HTTP checks and responsive stylesheet review do not replace rendered desktop/mobile inspection. No claim of measured Core Web Vitals or frame-rate performance is made.

## Provider and local operation

No `.env.local` or AI credentials were present during implementation. Free-form AI remains honestly unavailable until valid server-side `OPENAI_API_KEY` and `OPENAI_MODEL` values are supplied. Reviewed summaries work through the existing `/api/v1/explain` endpoint and are explicitly labelled as non-generative.

Run `npm run lab`, or build and run `npm run demo`, from the project root. The existing application URL is `http://127.0.0.1:3000`. No public deployment was created.

New imagery provenance is recorded in [OBSERVATORY_ASSETS.md](OBSERVATORY_ASSETS.md). Earlier assets remain documented in [ASSET_CREDITS.md](ASSET_CREDITS.md).
