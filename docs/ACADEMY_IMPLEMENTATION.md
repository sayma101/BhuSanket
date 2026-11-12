> Content and quiz sections below describe the earlier implementation. Current mission-specific media and required comprehension flow: see [ACADEMY_CONTENT_AUDIT.md](ACADEMY_CONTENT_AUDIT.md).

# Earth Science Academy implementation

Student Lab now leads with a lesson before asking for a prediction. Its five stages are Watch, Learn, Explore, Test yourself and Your discovery. The original six scientific investigation steps remain: context (Watch and Learn), hypothesis, chart exploration, evidence examination, verdict and reflection. All four original mission requests, supported prepared points, data modes and aggregation definitions are retained.

## Components

- `src/components/student-lab.tsx`: mission selection, navigation, original investigation state, completion and local record exports.
- `src/components/academy/lesson.tsx`: actual local NASA film, bilingual visual reading guide, clearly labelled illustrated temperature fallback, four-section lesson reading and vocabulary.
- `src/components/academy/data-explorer.tsx`: existing observed-series chart, prepared-location selection, supported time windows, year/value inspection, coverage and original-record reset.
- `src/components/academy/quiz.tsx` and `src/lib/academy-quiz.ts`: five real scored questions, one at a time, answers hidden until submission, explanations for every answer and retry.
- `src/components/academy/resources.tsx`: preserved observation exercise, bilingual glossary, five printable worksheets, actual original achievement criteria and evaluation exports.
- `src/lib/academy-content.ts`: authored English/Bangla curriculum and attributed historical imagery.
- `src/styles/academy.css`: scoped reading/layout/motion styles and responsive layouts. Canonical palette aliases are additive in globals; other workspaces retain their existing tokens. The navigation override applies only to the Student Lab route.

## Scientific boundaries

The educational water-cycle animation and conceptual temperature drawings are not measured layers. Historical Landsat and MODIS images retain date, sensor, source and context labels. The Rajshahi image is explicitly regional Bengal-delta context, not a local Rajshahi observation. Sylhet's paired false-colour comparison remains uncropped with dates explained.

The actual NASA POWER chart is returned by the existing `/api/v1/trend` request. Location/year changes require explicit submission; the displayed record heading always identifies the currently rendered response. A side exploration never replaces the original mission result used for verdict scoring. Missing observations remain gaps. No backend algorithms, data files, API contracts or scientific outcomes were changed.

## Film and remaining media limitation

The rain, monsoon and northeastern rainfall lessons use NASA/Goddard's *The Water Cycle* (9 October 2009): https://svs.gsfc.nasa.gov/10501/ . The local MP4 retains the entire 83.08-second visual sequence at 960 x 540, encoded without sound, with no claim of narration. A visible English/Bangla descriptive guide is supplied; it is labelled as a BhuSanket guide based on NASA's description, not a verbatim narration transcript. Provenance and checksum: `docs/ACADEMY_MEDIA.json`. Acquisition/encoding script: `scripts/acquire_academy_media.py`.

The heat mission has an honest five-scene illustrated explanation. A dedicated captioned NASA air-temperature lesson is still needed and the UI states this. No fake video player is used. All media are served locally after acquisition, with no third-party embed or new runtime dependency.

## Scoring and compatibility

The original four chart/science concepts remain, with an additional true/false image-evidence question. The optional starting check lets beginners retain a before/after comparison without requiring a quiz before learning. If skipped, `pre` is null; no baseline score or learning gain is imputed.

New exported records use schema 2.0 and `question_set: academy-v1`; totals use actual answer counts. Original four-question records remain stored/exportable with their own answer count. A final retry updates the same session record and appends its real attempt to `post_attempts`, rather than adding another completed participant. Completed records are local browser sessions, not unique verified students or evidence of educational impact.

Detective still requires a correct scientific verdict and reflection of at least 30 characters. Chief Detective also requires the original cautious correct Court case with at least two evidence tools. Downloads contain actual session responses and analysis IDs. Browser storage failure is reported and the current record can still be downloaded.

## Accessibility and motion

Native video controls, no autoplay, descriptive transcript, keyboard radio controls, explicit disabled navigation, per-question status, focus on changing stages/questions and language controls preserve the current investigation. Educational copy uses dark ink on ivory; white primary buttons use a darker teal for contrast. Motion uses existing Framer Motion and CSS only. Reduced-motion preferences disable scene autoplay and transitions; manual previous/next scenes remain available. Video/scene playback pauses when offscreen or the document is hidden.

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `node --test scripts/test-academy.mjs`: actual score calculation, invalid/sparse input rejection, bilingual lesson completeness, visual question types and media attribution.
- `node --test scripts/test-assistant.mjs`: existing assistant boundary checks with a mock provider, no live AI call.
- `python -m pytest backend/tests -q`: existing scientific/API regression suite.
- `scripts/smoke.py`: existing HTTP integration checks through the frontend proxy.

Rendered-browser observations are recorded separately from automated/unit checks; the latter do not establish visual QA.
