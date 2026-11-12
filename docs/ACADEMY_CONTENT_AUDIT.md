# Student Lab content audit and repair

## What was actually present

The repository contains four supported missions, not separate Extreme Weather, River Systems or Vegetation missions. Their existing scientific requests remain unchanged. Before this repair, Rajshahi, Khulna and Sylhet all rendered the same NASA Water Cycle film. Heat had an illustrated explanation. Every mission used the same five generic quiz questions. Existing written lessons were distinct, but lacked explicit misconceptions, media-comprehension checks and dataset bridges.

| Existing mission | Learning objective | Original media | Context image | Actual data connection |
|---|---|---|---|---|
| Heat in the Delta | Separate air/surface temperature and compare the same season | Five-scene BhuSanket illustrated fallback | Dhaka Landsat 8 OLI, 20 March 2022 | POWER T2M, March–May mean, Dhaka, 1991–2024 |
| Is Rainfall Changing? | Interpret complete annual totals and coverage | Shared The Water Cycle, NASA SVS 10501 | Regional Bengal delta MODIS, 28 December 2000; not local Rajshahi imagery | POWER PRECTOTCORR annual accumulation, Rajshahi, 1991–2024 |
| Follow the Monsoon | Define June–September consistently; separate rain/river/tide | Same shared Water Cycle film | Sundarbans Landsat 7, 1999–2000 composite | POWER PRECTOTCORR June–September accumulation, Khulna, 1991–2024 |
| Rain in the Northeast | Distinguish dated imagery from rainfall records | Same shared Water Cycle film | Paired false-colour Terra/Aqua MODIS, May–June 2007 | POWER PRECTOTCORR annual accumulation, Sylhet, 1991–2024 |

The earlier five-question set is retained as an optional, explicitly shared chart-skills exercise. Existing saved records are not regraded or deleted.

## Final mission-by-mission audit

| Mission | Video / animated lesson title | Source | Unique video verified? | Lesson complete? | Quiz verified? |
|---|---|---|---|---|---|
| Heat in the Delta | Heat: from the ground to the air | BhuSanket authored three-chapter animation; attributed Landsat context; NASA surface/air-temperature definitions | No dedicated NASA video attached; unique authored animation, explicitly labelled | English/Bangla objectives, viewing questions, transcript, four reading sections, vocabulary, examples, misconceptions, takeaways, dataset bridge | Automated scoring/content checks: 3 comprehension + 8 final questions |
| Is Rainfall Changing? | The Water Cycle | NASA/Goddard, 9 October 2009; https://svs.gsfc.nasa.gov/10501/ | Yes: source page checked, local MP4 range delivery 206 and MP4 signature checked; no reuse by another mission | English/Bangla complete lesson and descriptive guide; silent conceptual film distinguished from local observations | Automated scoring/content checks: 3 comprehension + 8 final questions |
| Follow the Monsoon | Life of the Monsoon — full visualization only, without narration | NASA/Goddard; Greg Shirah and Kel Elkins; 23 June 2016; https://svs.gsfc.nasa.gov/12254/ | Yes: downloaded the source visualization linked by NASA, successfully encoded the complete sequence, local delivery 206 and MP4 signature checked | English/Bangla complete lesson and descriptive guide; regional satellite/model visualization distinguished from the Khulna POWER point series | Automated scoring/content checks: 3 comprehension + 8 final questions |
| Rain in the Northeast | Northeast rain: read the image, test the record | BhuSanket authored three-chapter animation using attributed paired NASA MODIS context | No dedicated NASA video attached; unique authored animation, explicitly labelled | English/Bangla complete lesson with date/false-colour reading, misconceptions and actual-data bridge | Automated scoring/content checks: 3 comprehension + 8 final questions |

The two NASA movies are silent classroom encodings, not narrated videos. Their descriptive English/Bangla guides are authored by BhuSanket and labelled accordingly; they are not fabricated verbatim transcripts. The authored lessons provide chapter navigation, previous/next, play/pause, full text and pause-and-think questions. No timestamps were guessed. Reduced-motion users retain manual chapter navigation.

## Verified sources and provenance

- NASA Water Cycle source and attribution: https://svs.gsfc.nasa.gov/10501/ . Encoding and hash: `ACADEMY_MEDIA.json`.
- Monsoon source: https://svs.gsfc.nasa.gov/12254/ . The downloaded asset is `4397_Monsoon_w_Tour_prores.webm`, the visualization-only version, not the narrated production containing additional third-party footage. Encoding and hash: `ACADEMY_MONSOON_MEDIA.json`. The complete visual sequence is retained without audio.
- Monsoon conceptual explanation: https://gpm.nasa.gov/science/monsoons-wet-dry-repeat . Regional satellite/model visualizations do not enable an IMERG or MERRA adapter in this application.
- Surface temperature versus air temperature: https://science.nasa.gov/earth/earth-observatory/global-maps/land-surface-temperature-anomaly/ . Heat continues to analyse POWER T2M air temperature, not satellite LST or urban heat-island attribution.
- Sundarbans imagery: https://science.nasa.gov/earth/earth-observatory/sundarbans-bangladesh-7028/ .
- Northeast image pair: https://science.nasa.gov/earth/earth-observatory/floods-in-bangladesh-18490/ .
- Dhaka image: https://science.nasa.gov/earth/earth-observatory/rising-flood-risks-in-bangladesh-150274/ .

## Workflow and compatibility

Watch and Learn now precede a required three-question comprehension check. Submission unlocks hypothesis formation; a perfect score is not required. Students receive explanations and can retry. The original context, hypothesis, data exploration, evidence, verdict and reflection steps remain. The final eight-question set contains the three media concepts, three topic concepts, an image question and an actual-chart question generated from a returned non-missing NASA observation. Questions mix multiple choice and true/false.

New records include mission-specific version IDs and the exact question snapshot, so feedback and downloads retain the actual displayed question and answer key. Final scoring is recomputed against the original mission response. Old academy-v1 records remain readable/exportable with their original question set. Comprehension and final totals differ and are not described as a measured learning gain. Retry keeps the same mission session rather than adding fake participants.

No backend algorithms, datasets, contracts, verdict logic, worksheets, glossary or achievements changed. No unvalidated flood, NDVI or land-surface-temperature adapter is presented as available.

## Validation evidence

`ACADEMY_CONTENT_AUDIT.json` is generated by `node scripts/audit-academy.mjs`: it checks all four actual backend mission requests, distinct media paths, local video range responses, MP4 signatures, bilingual curriculum metadata and actual-chart question construction. `node --test scripts/test-academy.mjs` checks legacy scoring, invalid/sparse submissions, mission-specific assessments, question snapshots and unique media routing. TypeScript, lint, production build and existing backend/assistant regressions are run separately.

Browser observations and any remaining manual-QA limits are recorded with the delivery report; automated checks do not establish visual or complete interactive QA.

### Rendered review in this repair

Heat's authored diagram and chapter controls, Khulna's distinct NASA monsoon title/viewing questions/native video control, and Sylhet's distinct image-reading lesson and chapter entries were inspected in the native browser. Heat and monsoon screens were visually inspected; the northeast entry was also visually inspected. Repeated native-tool user-input guards interrupted the remaining Rajshahi recheck and new mobile/complete quiz/retry walkthrough. These manual checks remain partial. The unchanged Water Cycle film had been played in a previous iteration; this is not a claim that all new flows were manually retested. Current production HTTP checks and all four real mission requests are recorded separately in the JSON audit.
