# Landing hero and Back navigation refinement

## Hero

The opening retains the NASA Blue Marble globe centred on South Asia, with the existing dark, teal and amber identity. The copy is now exactly the requested headline and Bangladesh-focused paragraph, followed by Explore Earth and Start Learning. Coordinates, repeated eyebrows, field-note statistics, reticles, orbit diagrams, scene selectors and the hero footer were removed from the opening. Source records and provenance remain in the following source gallery and methodology directory. No measurements or source imagery were replaced or fabricated.

The desktop composition places a large, cropped globe on the right with editorial copy on the left. Below 800px the copy and buttons precede the globe. Atmospheric motion has a pause button and respects reduced-motion preferences. No dependencies were added.

## Navigation behavior

| Case | Implementation |
|---|---|
| Page-to-page Back | Header Back follows app-owned history. Direct entries safely fall back to Home; the reusable button also accepts an explicit internal fallback. External history length is not used as proof of an internal previous page. |
| Browser Back/Forward | Local journeys have real history entries. Existing Next router fields are retained. Cross-route entries do not copy the previous page's local view/draft snapshots. |
| Academy six-step investigation | Mission, Watch/Learn stage, hypothesis, chart, evidence, verdict and discovery navigation participate in history. Explicit Back returns to the logical preceding view and consumes matching history rather than pushing a backward loop. |
| Academy quiz | Previous/Next question transitions participate in history; answers are retained. Existing quizzes and scoring remain intact. |
| Academy animated lesson | Manual chapters participate in history; autoplay replaces its current entry instead of creating a history entry every nine seconds. |
| Court | Case opening, evidence exhibits and verdict review participate in history. Added Back to evidence exhibits. The result still comes from the existing backend score. |
| Ask BhuSanket | Back closes the drawer before leaving the investigation; Forward can restore it. Existing conversation stays in the mounted companion. Close and Escape consume the matching entry. |
| Atlas dialogs | Analysis controls and satellite-image dialogs close on browser Back, close button, backdrop or Escape, and reopen on Forward. Native dialog focus restoration remains available. |
| Mobile navigation | Menu opening participates in history. Following a route closes the menu without adding an extra close entry. |
| Chart reading guide | Opening the guide participates in history; its Close action returns to the chart. |
| Returning to Explore/Research | Location, variable, period, aggregation, evidence mode, comparison, completed result and related controls recover from history/session storage. Explicit launch query parameters apply on a fresh entry, without overriding a restored entry. |
| Returning to a mission | Prediction, reflection, assessments, original analysis and side-exploration selections recover from the corresponding history snapshot. Starting a different mission does not overwrite the older mission entry's draft. |
| Back during a request | Academy requests abort; Explore/Research and Court invalidate obsolete operations. Late results cannot push a new local view after leaving the workspace. Court ignores obsolete results before publishing analysis context. |

Draft recovery uses session storage and per-entry history snapshots, with an in-memory fallback if storage is unavailable. Completed mission/round records retain their existing local-storage behavior. No server API schema, algorithm, statistical method or numerical dataset changed. A browser restart or unavailable storage can limit draft recovery; this is not a server-side account/synchronization feature.

## Exact files changed

- `src/components/home.tsx` — minimal hero composition and requested copy/CTAs.
- `src/components/cinematic-earth.tsx` — uncluttered Earth scene and motion control.
- `src/styles/hero.css` — desktop/mobile hero composition, typography, atmosphere and reduced motion.
- `src/lib/navigation.tsx` — reusable history ownership, logical journeys, session/history drafts, safe Back and native dialog adapter.
- `src/app/layout.tsx` — history integration and shared navigation styles.
- `src/styles/navigation.css` — shared Back controls.
- `src/components/site-nav.tsx` — page Back and history-aware mobile menu.
- `src/components/evidence-workspace.tsx` — Explore/Research context recovery and request invalidation.
- `src/components/evidence-chart.tsx` — chart-reading panel history.
- `src/components/explore-atlas.tsx` — native atlas dialog history.
- `src/components/student-lab.tsx` — logical Academy history, draft recovery and request cancellation.
- `src/components/academy/quiz.tsx` — quiz question history and answer recovery.
- `src/components/academy/topic-lesson.tsx` — chapter history and autoplay replacement.
- `src/components/academy/data-explorer.tsx` — mission side-exploration recovery.
- `src/components/claim-court.tsx` — case/exhibit/verdict history, recovery and obsolete-request guards.
- `src/components/claim-checker.tsx` — selected claim/result recovery; optional publication control for guarded Court requests.
- `src/components/ask-bhusanket.tsx` — drawer history and closing behavior.
- `scripts/test-navigation.mjs` — deterministic production-hook history tests.
- `docs/HERO_NAVIGATION_REFINEMENT.md` — this report.

## Validation

Commands:

```powershell
npm run typecheck
npm run lint
npm run build
node scripts/test-navigation.mjs
node --test scripts/test-academy.mjs scripts/test-assistant.mjs
$env:PYTHONPATH="$PWD;$PWD/.python-packages"
python -m pytest backend/tests -q
$env:BHU_BASE_URL='http://127.0.0.1:3002'
python scripts/smoke.py
```

The navigation checks execute the production hooks using deterministic hook/storage/history adapters. They test ownership, batched transitions, mission draft snapshots, Back/Forward, explicit Back without loops, assistant closing, native dialog Back/Forward/Escape, route snapshot isolation, safe fallback routes and corrupt-storage recovery. These tests are not a substitute for a real browser.

TypeScript, ESLint, production build, 18 navigation checks, the existing Academy and assistant checks, 30 backend tests, and 21 production HTTP smoke checks passed. Hero HTML and the local Earth image endpoint were checked against the production server.

**Visual/manual QA limitation:** Computer Use could not confidently identify the current Windows browser URL and stopped browser interaction. Desktop/mobile rendered hero inspection and manual browser navigation walks were therefore not performed for this change. They remain unverified; no visual QA or screenshot evidence is claimed. The desktop/mobile layouts are implemented in CSS, not certified by rendered inspection.
