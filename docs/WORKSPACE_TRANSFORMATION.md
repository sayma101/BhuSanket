# BhuSanket — remaining workspace implementation

Implemented on 12 November 2026 in the existing Next.js application. No application dependencies were added. The scientific backend, API contracts, provider route and scoring algorithms were not edited.

## Research — the Evidence Bench

- Added an editorial Bengal-delta header, with instrument, date, historical-context label and original NASA source link.
- Reordered the workspace around the actual time-series chart. Geographical context and prepared-point records remain available in a disclosure instead of preceding the evidence.
- Added direct navigation to the Analysis-Window Slider, Trend Divergence Detector, Mission-to-Evidence Trail and Data Passport.
- Kept observed values, missing-year gaps, chart tooltips, trend toggle, optional slope-envelope display, the actual 95% slope interval and exports.
- Preserved full-record versus selected-window calculations and compatible comparisons with a common chart scale and existing FDR adjustment.
- Added an inspectable test/assumptions section and a visible distinction between statistical and practical significance. The API does not expose Mann–Kendall S; the interface says this rather than deriving or inventing a value.
- Added chart/record entry, uncertainty reveal and comparison transitions with reduced-motion alternatives.

## Student Lab — field school

- Added an imagery-led field-school introduction, learning objective and direct start action.
- Rebuilt the active mission into a vertical six-stage journey, central investigation activity and dated satellite-context rail.
- Added selectable hypothesis starting points while retaining the editable explanation.
- Preserved all mission content, four-question pre/post checks, real scores, verdict evaluation, reflection requirements, local session records, achievement conditions, evaluation exports, bilingual glossary and five printable worksheets.
- Added step transitions, keyboard focus transfer and a completion mark that appears only after the follow-up quiz is saved.
- Teaching-quiz synthetic values remain explicitly identified as synthetic. Context photographs are not used as measured data.

## Claim Court — the evidence case file

- Added a prominent warm-paper claim document with its actual location, measurement, aggregation and time window.
- Rebuilt the board into four selectable exhibits, preserving three-token rules, free reopening and backend scoring.
- Added an always-available case-quality dossier, using the actual series, missing-period count, source-day coverage and warnings.
- Each inspected exhibit carries its source and limits. Full-record, season and neighbour checks are labelled as context; the trend exhibit describes its relationship to the defined claim from the computed result.
- Preserved personal-confidence selection, explicitly separate from statistical confidence.
- Added a focused verdict reveal only after the scoring response. Existing states remain SUPPORTED, WINDOW-DEPENDENT, NOT SUPPORTED ON THIS RECORD and NOT ENOUGH EVIDENCE. No new “partially supported” outcome was invented.

## Ask BhuSanket — contextual science companion

- Added an expanded conversation layout, a compact mode and the existing Research docking option.
- Added an ISS context image, selected-record panel, actual period, dataset, slope, p-value, interval, missing-data information and limits.
- Added direct chart/passport access where the current workspace supports it, and verified-record/passport downloads from evidence attachments.
- Added English/Bangla suggested questions and retained both response languages.
- Preserved the existing OpenAI integration and its numerical-safety boundary. Message animations respect reduced motion.
- The local provider is currently unconfigured. The UI states that OPENAI_API_KEY and OPENAI_MODEL must be set server-side in .env.local and Next.js restarted. No AI reply is simulated. The separate reviewed-summary action remains labelled as a scientific template without generative AI.

## Files

New application files:

- src/components/research-bench.tsx
- src/styles/research.css
- src/styles/field-school.css
- src/styles/case-file.css
- src/styles/companion.css

Modified existing application files:

- src/components/evidence-workspace.tsx — conditional Research composition, signature links and explicit units in verdict summaries.
- src/components/evidence-chart.tsx — optional detailed statistical presentation, without numerical changes.
- src/components/student-lab.tsx — mission composition, hypothesis controls and focus/transition handling.
- src/components/claim-court.tsx — inspectable exhibits, quality dossier and returned-verdict presentation.
- src/components/ask-bhusanket.tsx — expanded context/conversation UI and evidence links.
- src/components/claim-checker.tsx — reduced-motion handling for the shared LearningChart.
- src/app/research/page.tsx — Research stylesheet.
- src/components/home.tsx — equivalent pure chart-path expression to resolve the pre-existing React immutability lint error. Homepage markup, design and resulting path behavior are preserved.

Explore-specific files were not edited during this remaining-workspace task. Its geographical presentation remains in place. Shared evidence components retain their original defaults unless Research explicitly opts in.

## Assets and provenance

No external assets were added for these four workspaces. They reuse repository assets documented in OBSERVATORY_ASSETS.md:

- Bengal delta: Terra MODIS, 28 December 2000.
- Dhaka: Landsat 8 OLI, 20 March 2022.
- Sundarbans: Landsat 7, 1999–2000 composite.
- Sylhet region: paired Terra/Aqua MODIS false-colour figure, May–June 2007.
- Earth from ISS: April 2016, NASA Johnson poster.

These are historical context, separate from NASA POWER point/grid measurements. No unvalidated satellite product was enabled.

## Verification

- TypeScript: passed.
- Full project ESLint: passed after fixing the pre-existing Home path-expression error.
- Production build: passed; final verification rerun recorded in delivery.
- Backend: 26 tests passed. One existing dependency deprecation warning about anyio BlockingPortal.
- HTTP integration: 21 checks passed, including source records, analysis-window recalculation, full-record parity, comparisons, passports and Court scoring.
- Assistant: 7 boundary checks passed using a mock provider; no live OpenAI request.
- Route/style checks: Research, Student Lab, Claim Court and Explore returned HTTP 200 with their workspace markup and stylesheets.
- Static-asset scan: no missing referenced local images, fonts or worksheet files.
- Backend source hashes: unchanged from the start of this task.

See WORKSPACE_CHECKS.json and HTTP_SMOKE.json for machine-readable results.

### Visual verification limitation

Computer Use could not reliably establish the active Windows browser URL and stopped the browser session. The four new layouts were not fully inspected in a rendered browser, and no new final screenshots are delivered. HTTP/style checks and build success do not establish visual QA. Desktop/mobile appearance and the complete click-through journeys still need a browser review.

## Run

From D:\MyProjects\BHUSanket:

```powershell
npm run lab
```

This starts Next.js on http://127.0.0.1:3000 and FastAPI on port 8000. Open /research, /student-lab or /claim-court. Ask BhuSanket is available from the launcher and contextual evidence buttons.

For a production run:

```powershell
npm run build
npm run demo
```

Stop existing local servers before starting another copy on the same ports.

Production verification also passed all 21 HTTP integration checks against http://127.0.0.1:3002. The four workspace routes served their compiled styles successfully. That production preview is currently running on port 3002 for review.
