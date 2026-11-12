# Recording walkthrough — 12 November 2026

Prepare and rehearse the local application before starting a screen recording. The original plan's event submission dates require confirmation with the Local Lead; the user's schedule reserves 12 November for video production. Do not treat the old plan's timing table as a verified current deadline.

## Before recording

1. Run `npm run lint`, `npm run typecheck`, `npm run build`, then the backend tests. Resolve any failures.
2. Close old app servers if ports 3000 or 8000 are occupied, then run `npm run demo` from the root.
3. Open `http://127.0.0.1:3000` in a modern browser. Let local fonts and imagery load. Use 1440×900 or similar and check text/map/chart layout at the chosen recording size.
4. Open Explore, Research, Student Lab, Claims and Court once. Confirm no browser console errors, correct charts and readable controls. This browser QA remains a required human check because automated Computer Use was blocked in the implementation session.
5. Keep evidence mode CACHED. Disable external internet for a rehearsal while retaining both local servers. Reload and verify that prepared data, boundaries, imagery and computation still work. A newly requested coordinate needs a prior live retrieval.
6. Use actual numbers shown by the current software and cached record. Never pre-script an increasing trend or supported claim. The initial Dhaka summer case was computed as a decrease in this cached record; the warming claim therefore needs rejection on this record.

## A complete four-minute narrative

| Time | Screen and action | Narration / purpose |
|---|---|---|
| 0:00–0:25 | Home; Earth centered on South Asia, then Start an investigation | “A striking chart can make a climate claim look convincing. BhuSanket asks whether the whole record supports it.” Identify the image as a historical composite if discussing it. |
| 0:25–0:55 | Explore → select Dhaka → summer → 1991–2024 → cached | “We use NASA POWER T2M: a grid-supported estimate of air temperature at two metres. This is not a district average or a live satellite photograph.” |
| 0:55–1:30 | Read observed chart, units and verdict; open Evidence & methods | Name NASA POWER aloud. Show slope per decade, p-value, 95% slope interval, period coverage and limitations. Explain the actual result without causal attribution. |
| 1:30–1:55 | Move start year to 2010, retain 2024; wait for backend | Show the selected result beside 1991–2024. “A chosen window can change the evidence category. The app recalculates; it does not just crop a picture.” If no sensitivity occurs, report that honestly. Restore 1991. |
| 1:55–2:20 | Compare Rajshahi with the same variable/season/period | Show adjusted p-values, slope, CI and coverage. Differences in labels do not prove a statistically significant difference between slopes. |
| 2:20–3:00 | Claim Court, Dhaka summer claim → prediction → open → Trend test | Spend a token, read evidence, select confidence, choose the backend-supported court verdict and stamp. Explain +3 correct/+1 unused and the confident-misleading-support penalty. |
| 3:00–3:25 | Student Lab mission cards, glossary, five teacher sheets | Show hypothesis-first learning and real pre/post evaluation mechanism. Do not claim improved learning before real participants complete sessions. |
| 3:25–3:50 | Research → QC → Data Passport → download JSON/CSV/PDF | “A result comes with its source, retrieval time, processing choices, method and code identity.” Show the complete catalogue with truthful planned labels. |
| 3:50–4:00 | Closing homepage / brand | “Read Earth's signals. Trace every change.” State that forecasting and causation are outside scope. |

## Thirty-second global cut

0–5s: team identity and Earth/question. 5–11s: raw-data/claim interpretation problem. 11–22s: NASA POWER source → observed series → year slider → actual verdict. 22–30s: Student/Research value and Data Passport. Name the NASA source aloud, include English subtitles, and credit imagery/software/AI assistance.

## Court scoring rehearsal

Read the preset claim. Make a prediction before revealing evidence. At least one of the three tokens must be spent. Inspect a tool, choose one of the four court verdicts and confidence, then stamp. For a correct answer after one tool, the score is 3+2=5. A confident incorrect SUPPORTED choice (confidence ≥75) incurs −2 in addition to earning no correctness points. Reopening an inspected tool is free. The server resolves the expected verdict from the saved result.

## Reproducibility rehearsal

Download result JSON, series CSV, chart SVG and reproducibility PDF. Read the report and compare its numbers to the chart. Run `python scripts/reproduce.py <result-json>` with the project Python environment; it must report `reproduced: true`. Keep the result and original source metadata together. Do not edit the numerical object for presentation.

## Final submission gates still owned by the team

Public source repository; publicly accessible deployed web+Python API; real first-time-user task and quiz evaluation with sample size; finished videos/subtitles/team names; NASA data/source/AI disclosure; complete NASA project page; incognito access checks; exact Local Lead deadlines. No tool in this implementation session submitted the team to NASA or published the repository.
