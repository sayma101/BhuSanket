# Reference composition refinement

This revision brings Research Workspace, Student Lab and Claim Court closer to the two supplied reference compositions. It changes the layouts, not the scientific calculations.

- Research: compact Earth-observation header; direct location/variable/period/aggregation setup; large warm-ivory chart; a separate compact statistical evidence panel; three instrument tiles underneath. Full controls, analysis-window slider, geographical context, comparison, source trail and exports remain available.
- Student Lab: connected cream field-school sheet; compact landscape header; visual mission series; vertical six-stage journey; three desktop hypothesis choices and a context-image rail. Quizzes, worksheets, glossary, reflection and real local scoring remain intact. The starting quiz opens from an explicit prerequisite disclosure.
- Claim Court: burgundy evidence room; clipped-paper claim; three main exhibit cards plus regional cross-check; warm-paper jury desk; wide bottom verdict strip. The verdict remains pending until the scoring response. Only inspected, backend-loaded evidence can populate exhibit previews.
- Navigation: a serif BhuSanket wordmark and teal active-workspace pills apply only to these three routes. Home, Explore Earth and Ask retain their established layouts.
- Phone layouts stack the Research setup and evidence, use readable Court cards and turn hypothesis options into larger vertical selections.

## Modified application files

- src/components/research-bench.tsx
- src/components/evidence-workspace.tsx
- src/components/evidence-chart.tsx
- src/components/student-lab.tsx
- src/components/claim-court.tsx
- src/components/site-nav.tsx
- src/styles/research.css
- src/styles/field-school.css
- src/styles/case-file.css
- src/styles/workspace-nav.css (new)
- public/images/claim-court-desk-v2.webp (new)

## Artwork

The decorative Court desk image was generated using the built-in image_gen.imagegen tool. Saved asset: public/images/claim-court-desk-v2.webp, 1774 by 887, 135576 bytes. It is labelled editorial illustration, not NASA imagery. No geographic or measurement data is encoded in it. The complete production prompt and generation provenance are recorded in REFERENCE_ARTWORK.json. Existing dated NASA imagery remains separate from actual POWER measurements.

## Verification

TypeScript, full-project ESLint and the final production build passed. The backend suite passed 26 tests, HTTP integration passed 21 checks, and assistant boundary tests passed 7 checks with a mock provider. No numerical algorithms or provider configuration were changed.

Rendered desktop inspection covered all three pages, including the Student hypothesis board and Court's computed statistical exhibit. Phone inspection used the browser's responsive viewport set to 390 CSS pixels. These were actual native-browser screenshots, not generated UI mockups. The full end-to-end student completion and all Court verdict states were not replayed manually; existing automated scoring and scientific checks were retained.

The final production preview is running at http://127.0.0.1:3002. Production routes, compiled styles, the new artwork and all 21 HTTP integration checks were verified after restart.
