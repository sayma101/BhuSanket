# Ask BhuSanket prototype chatbot

The default chat UI is now an explicitly labelled, rule-based prototype. The user can type questions, press Send/Enter, or select suggested questions. No OpenAI key, model, billing setup or AI provider is required. Existing optional AI API code remains separate and is not called by this prototype.

Supported questions cover greetings, BhuSanket, rainfall, temperature, weather/climate, NASA POWER, satellite context, p-values, Theil–Sen slopes, trends, confidence intervals, uncertainty, limitations, Data Passports, Student Lab and Claim Court. English and Bangla are supported; Bengali-script questions automatically receive Bengali answers. Unknown questions receive an honest explanation of the prototype's supported scope and suggested questions.

Try:

- What can BhuSanket do?
- What is rainfall?
- Which NASA data do you use?
- What is a p-value?
- বৃষ্টিপাত কী?
- Has rainfall in Dhaka increased? (after opening the matching actual analysis)

General answers come from reviewed educational text and do not need the Python service. A question about a selected finding uses the actual saved backend record. A question naming a different location/measurement cannot inherit the current record's finding. Unavailable evidence is explicitly disclosed; the response then provides general guidance instead of invented measurements. The backend's algorithms, NASA records, verdicts and scoring are unchanged.

## Run

Use `npm run lab` for the complete application. Open `http://127.0.0.1:3000`, launch Ask BhuSanket and type a supported question. `npm run dev` alone can demonstrate the general prototype Q&A; chart-specific evidence still needs Python. No `.env.local` is needed for prototype mode.

## Files

`src/lib/prototype-chat.ts` contains the reviewed topic matcher and bilingual answers. `src/app/api/assistant/prototype/route.ts` validates requests and loads saved evidence only for questions that need it. `src/components/ask-bhusanket.tsx` always sends this UI's messages to that prototype endpoint and visibly labels its answers as non-AI. The prior guide and optional AI endpoints remain available separately.

## Verification

`node scripts/test-prototype-chat.mjs` covers typed English/Bangla questions, unknown questions, no external calls for general help, saved-evidence parity, location/variable mismatch, stale evidence and invalid inputs. `python scripts/check_prototype_chat.py` runs real HTTP examples and verifies one actual cached NASA finding; set `BHU_BASE_URL` to select a local production server. Example replies are recorded in `PROTOTYPE_CHAT_CHECK.json`.

The prototype typing interaction could not be rechecked visually in this run: the native preview window was minimized and its accessibility state could not be restored through the available controls. This is distinct from the earlier, successfully inspected English/Bangla Evidence guide buttons. No new manual typing or screenshot verification is claimed.

Passed: 27 prototype checks, 28 existing assistant/guide checks, 18 navigation checks, TypeScript, ESLint and production build. Seven real typed-question HTTP examples and actual rainfall-evidence parity passed against both local development (3000) and production (3002); 21 production HTTP smoke checks passed. The active local development server includes this prototype without any AI credentials.
