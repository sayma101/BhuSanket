# Next-chat deployment handoff

## Deploy this code

Repository: https://github.com/sayma101/BhuSanket — use `main` after the final push. The separate `v0/fix-student-lab-assistant` branch retains an earlier AI Gateway experiment; it is not the default prototype version. Its useful `pypdf` dependency fix was carried into main without replacing the key-free prototype.

No live deployment was performed in this preparation task. Do not call the application publicly deployed until the real hosting URLs and end-to-end checks pass.

## Architecture and settings

1. Deploy the Python API from the repository root using `render.yaml` (Python 3.13.0). Build: `pip install -r backend/requirements-lock.txt`. Start: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`. Health path: `/api/v1/health`. The repository root is required because the API reads `src/data/nasa-sources.json` and the included `data/` records.
2. Verify the actual backend HTTPS origin: `/api/v1/health` should return `status: ok`, and `/api/v1/claims` should list four missions. The included NASA cached records require no NASA API key.
3. Deploy the Next.js frontend from the same `main` on v0/Vercel. Use `npm ci`, `npm run build`, and the Next.js framework preset. Set server-only `BACKEND_URL` to the actual backend origin, without `/api/v1`, `/docs` or `/health`. Development is needed for the v0 preview panel; Preview and Production apply to their corresponding deployments. Sync the latest code before redeploying.
4. Ask BhuSanket defaults to the reviewed prototype: typed English/Bangla questions and suggestions need no OpenAI key, model, AI Gateway or billing. General Q&A needs only Next.js. Answers about an actual investigation still require the Python API. Do not enable a paid provider merely to make this prototype work.
5. Verify the frontend proxy `/api/v1/health`, mission walkthroughs, Court, Research, exports and prototype chat. Browser interaction and mobile checks on the actual public origin are still required.

Do not set `NEXT_PUBLIC_BACKEND_URL` or put credentials in Git. The same-origin server proxy handles browser-to-backend communication; permissive CORS is unnecessary. A missing backend must remain an explicit error, not trigger fabricated measurements.

## Pre-push checks completed

- 30 backend tests.
- 27 prototype chatbot checks, 28 assistant/guide checks, 18 navigation checks, 11 proxy/deployment checks and six Academy tests.
- TypeScript, ESLint and production build.
- All four actual cached NASA missions through trend, claim check, backend-scored Court, Data Passport, PDF and JSON exports.
- Seven real typed-question prototype examples and actual saved-rainfall evidence parity; ten bilingual evidence-guide API checks; 21 production HTTP smoke checks.
- Public PyPI metadata for all 34 pinned packages: compatible Linux x86_64 / CPython 3.13 wheels available, no declared baseline dependency conflicts. See `BACKEND_WHEEL_CHECK.json`. This is metadata validation, not a completed Linux package installation or hosting build.

The existing backend tests used the prepared local Python environment. A Windows production build worker crashed on the first attempt; the clean retry passed. No scientific algorithm or numerical dataset changed.

## Persistence boundary

The supplied free Render service can sleep and has ephemeral storage. Runtime analysis/report records may disappear on restart; rerun an investigation to regenerate its exports. Use a single API instance for this prototype. Durable, shared result storage is required before promising persistent reports or multiple backend instances. Do not add a paid disk/service without the user's hosting choice.

## Commands after real URLs exist

```powershell
$env:BHU_BASE_URL='ACTUAL_FRONTEND_HTTPS_ORIGIN'
python scripts/smoke.py
python scripts/check_academy_deployment.py
python scripts/check_prototype_chat.py
python scripts/check_assistant_local.py
```

The scripts do HTTP validation; they do not replace browser interaction, media playback or responsive visual checks. Read `DEPLOYMENT.md` and `PROTOTYPE_CHAT.md` for detailed behavior and known limits.
