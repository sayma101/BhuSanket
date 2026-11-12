# Ask BhuSanket local repair

The latest default UI is the key-free prototype chatbot; see [current behavior](PROTOTYPE_CHAT.md). The provider-specific configuration below documents the separately retained optional AI endpoint.

## Root cause observed in the local application

The browser sent `Origin: http://127.0.0.1:3000`, but Next.js normalized the route-handler URL to `http://localhost:3000`. Comparing Origin only to that internal URL rejected legitimate local requests with HTTP 403. This was reproduced through the local preview and an HTTP request carrying a real Origin header. The shared check now compares Origin to the incoming Host/protocol, retains strict cross-origin rejection and does not trust an arbitrary forwarded host.

Separately, this checkout contains no configured OpenAI key/model. The old Send control was disabled and explanation shortcuts merely filled that unusable input. The attachment loader also swallowed failed requests and kept displaying “Opening the attached record…”.

## Result

- Explain this chart, uncertainty, limitations, verified summary and confidence-interval actions now call an explicit reviewed Evidence guide. They are labelled non-AI; no provider response is simulated.
- Chart/summary explanations use only the actual backend export for the selected analysis ID. An unavailable or mismatched record produces a recoverable error. Synthetic fixture records are explicitly labelled.
- The reviewed confidence-interval lesson works without a selected record or an AI provider. English and Bangla are available.
- Failed attachment loading stops, explains the error and offers Retry. An analysis is called verified only after the actual record loads.
- Closing the panel, browser Back, changing analysis or changing page cancels obsolete replies. Failed AI requests preserve the question draft. New replies scroll into view.
- Shortcuts open explanations directly. Duplicate guide shortcuts and an unusable unconfigured AI composer no longer occupy the compact conversation viewport.
- AI status refreshes when opening the companion and can be rechecked. Environment configuration is labelled “AI configured”, not falsely described as a verified live connection.
- Real AI follow-up requests include a bounded history scoped to the same analysis. General concept questions do not unnecessarily require the Python service. Place-specific findings still require verified evidence.
- Authentication, quota, model access, refusal, incomplete output and connection errors are distinguished. Unverified numeric AI narration remains rejected; numerical evidence is rendered directly from the backend.

## Real AI configuration

Put the actual `OPENAI_API_KEY` and an enabled Responses API `OPENAI_MODEL` in the ignored project-root `.env.local`, then restart `npm run lab`. Do not enter secrets in the browser chat or commit them. No key or model was created, guessed or installed by this repair. No live provider answer was tested in this unconfigured checkout.

The reviewed guide is an authored scientific teaching feature, not a fallback pretending to be an AI conversation.

## Files

- `src/components/ask-bhusanket.tsx`
- `src/styles/companion.css`
- `src/app/api/assistant/route.ts`
- `src/app/api/assistant/guide/route.ts`
- `src/lib/assistant-evidence.ts`
- `src/lib/evidence-guide.ts`
- `scripts/test-assistant.mjs`
- `scripts/check_assistant_local.py`
- `.env.example`
- This report and `ASSISTANT_LOCAL_CHECK.json`.

## Validation

The browser preview at `http://127.0.0.1:3000/explore` was inspected through the VS Code integrated preview. Explain this chart displayed the attached Dhaka precipitation record and its actual backend interpretation. Switching to Bangla and selecting the confidence-interval guide displayed the Bangla explanation. Both were visibly labelled “Reviewed evidence guide · no generative AI”. The compact preview layout was also inspected. This is specific local interaction verification, not a claim that a live AI provider or every viewport was tested.

The local API check exercises all five guide actions in both languages against an actual cached Dhaka analysis, compares their attached trend object with the backend, checks term help without a record and verifies missing/stale context recovery. It includes the browser Origin header so the original failure cannot be hidden by a headerless test. Provider tests use mocks; they never send a paid model request.

Reproduce with `node scripts/test-assistant.mjs` and `BHU_BASE_URL` plus `python scripts/check_assistant_local.py`. Passed: 28 assistant/guide checks, 18 navigation checks, 11 deployment/proxy checks, six Academy checks, TypeScript, ESLint and production build. All ten real bilingual guide requests passed on both local development (3000) and production (3002), with browser-style Origin headers; 21 production HTTP smoke checks also passed.

Official API references used: [Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create), [OpenAI error codes](https://developers.openai.com/api/docs/guides/error-codes).
