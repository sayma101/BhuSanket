# Deploy BhuSanket from GitHub to v0 / Vercel

## Why the Student Lab failed after import

This repository has two runtimes: the Next.js interface and a Python/FastAPI scientific service. Student Lab loads its mission definitions from `/api/v1/claims`, then submits its original mission request to `/api/v1/trend`. Importing the Next.js project does not start `npm run lab`'s second Python process on a separate host. The previous rewrite defaulted to `127.0.0.1:8000`; this address only works when the Python server runs beside Next.js locally.

The current application proxies science requests through `src/app/api/v1/[...path]/route.ts` and reads `BACKEND_URL` at request time. Missing or unreachable hosted APIs return an explicit, retryable error. It never returns fictional missions, statistics or a synthetic replacement analysis. The assistant uses the same backend configuration.

## 1. Deploy the scientific API

The root `render.yaml` is a Render Blueprint for a Python web service. In Render, create a Blueprint from `https://github.com/sayma101/BhuSanket`, review its free-service settings and deploy it. Keep the repository root as the service root; backend source, the shared NASA source registry, immutable raw records, metadata and prepared Parquet files must all be available. Do not select `backend/` as the root directory.

Manual equivalent:

- Runtime: Python, version `3.13.0`.
- Build: `pip install -r backend/requirements-lock.txt`
- Start: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
- Health check: `/api/v1/health`

Copy the service's actual HTTPS URL from Render after deployment. Open `YOUR_ACTUAL_BACKEND_URL/api/v1/health`; it must return `status: ok`. Open `/api/v1/claims`; it must return the four defined missions. No NASA API key is needed for the included cached mission records. Do not put an invented example hostname into the environment.

The supplied free service has an ephemeral filesystem and can sleep when idle. Saved analysis exports may need to be regenerated after a restart. It is intended for a prototype with one API service instance; durable exports and multiple-instance hosting require shared result storage. No durable hosting, account creation or successful remote deployment is claimed by this configuration file.

## 2. Connect v0 and the deployed frontend

In the v0 project, open **Project menu → Settings → Environment Variables** and add:

```dotenv
BACKEND_URL=the_actual_HTTPS_origin_of_your_running_Python_service
```

Use the origin without `/api/v1`, `/docs`, or `/health`. Configure **Development** for the v0 preview panel, **Preview** for preview deployments and **Production** for the published site. Restart the preview / redeploy after changing the environment. Do not use `NEXT_PUBLIC_BACKEND_URL`; the browser calls the same-origin Next.js proxy. No permissive CORS change is needed for that server-to-server connection.

GitHub updates do not necessarily replace an already-imported v0 working copy. Sync/pull the latest `main`, or re-import it, before redeploying. Retain any intentional changes made in v0 rather than replacing them blindly.

## 3. Verify the complete mission

Against the frontend URL, check `/api/v1/health` and `/api/v1/claims` first. Then open Student Lab and complete Watch → Learn → the mission comprehension questions → hypothesis → real chart → evidence → verdict → reflection/final assessment → discovery. Check Back/Forward and report downloads. The same backend connection powers Explore, Research, Claim Court and reviewed assistant evidence.

For a repeatable API walk against either the frontend proxy or backend origin:

```powershell
$env:BHU_BASE_URL='YOUR_ACTUAL_FRONTEND_OR_BACKEND_ORIGIN'
python scripts/check_academy_deployment.py
```

The script checks every mission's actual cached NASA analysis, claim-check result, Court score and exports. It does not claim visual, video playback or browser-interaction verification.

## Local development

`npm run lab` remains the two-server local launcher. Local `next start` can still reach `127.0.0.1:8000` when Python is running. Hosted Vercel environments reject that loopback setting rather than pretending it is a deployed service. The original scientific algorithms, numerical datasets and API request/response contracts are unchanged.

Official platform references: [v0 external APIs and environment scopes](https://v0.app/docs/external-apis), [Render Blueprint specification](https://render.com/docs/blueprint-spec), [Render web-service port binding](https://render.com/docs/web-services).


## Validation of this fix

TypeScript, ESLint, production build, 11 proxy/configuration checks, 18 navigation checks, 7 assistant boundary checks, the Academy checks, 30 backend tests and 21 production HTTP smoke checks passed. All four real cached missions passed the complete trend/claim-check/Court/Passport/PDF/JSON API walk through the production Next.js proxy; see `ACADEMY_DEPLOYMENT_CHECK.json`. This was a local production-server check. Render provisioning/build, the user?s v0 environment and rendered browser interaction have not been verified.
