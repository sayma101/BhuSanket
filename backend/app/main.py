"""Run: python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"""
import json
import logging
from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from backend.app.api.exports import csv_bytes, pdf_bytes
from backend.app.claims.court import score_round, expected_verdict
from backend.app.data.catalogue import CATALOGUE, CLAIMS, LOCATIONS, VARIABLES
from backend.app.models.schemas import CompareRequest, CompareResult, CourtRequest, ExplainRequest, TrendRequest, TrendResult
from backend.app.service import VERSION, compare, get_result, investigate
from backend.app.data.power import load
from backend.app.service import resolve_location
from backend.app.compute.counters import count_hot_days
from pydantic import BaseModel, Field

app = FastAPI(title="BhuSanket Evidence API", version=VERSION, description="Deterministic NASA evidence. No forecasting or causal attribution.")
app.add_middleware(CORSMiddleware, allow_origins=["http://127.0.0.1:3000", "http://localhost:3000"], allow_methods=["GET", "POST"], allow_headers=["*"])
router = APIRouter()


def guarded(function, *args):
    try:
        return function(*args)
    except FileNotFoundError as error:
        raise HTTPException(404, str(error)) from error
    except ValueError as error:
        raise HTTPException(422, str(error)) from error
    except (OSError, KeyError) as error:
        logging.exception("NASA adapter failure")
        raise HTTPException(503, "NASA retrieval or cache parsing failed. Use a prepared cached location; no fixture substituted.") from error


@router.get("/health")
def health():
    return {"status": "ok", "schema_version": "1.0", "version": VERSION, "science": "deterministic Python", "default_mode": "cached"}


@router.get("/variables")
def variables():
    return VARIABLES


@router.get("/datasets")
def datasets():
    return CATALOGUE


@router.get("/locations")
def locations():
    return LOCATIONS


@router.get("/claims")
def claims():
    return CLAIMS


@router.post("/trend", response_model=TrendResult)
def trend(request: TrendRequest):
    return guarded(investigate, request)


@router.post("/compare", response_model=CompareResult)
def comparison(request: CompareRequest):
    return guarded(compare, request.left, request.right)


@router.get("/data-passport/{analysis_id}")
def passport(analysis_id: str):
    return guarded(get_result, analysis_id)["passport"]


@router.post("/court")
def court(request: CourtRequest):
    return guarded(score_round, request)


class ClaimCheckRequest(BaseModel):
    claim_id: str


@router.post("/claim-check")
def claim_check(request: ClaimCheckRequest):
    claim = next((item for item in CLAIMS if item["id"] == request.claim_id), None)
    if claim is None:
        raise HTTPException(422, "Unknown preset claim")
    result = guarded(investigate, TrendRequest(**{key: claim[key] for key in ["location_id", "variable", "aggregation", "start_year", "end_year"]}))
    return {"schema_version": "1.0", "claim": claim, "result": result, "claim_verdict": expected_verdict(result, claim)}


@router.post("/explain")
def explain(request: ExplainRequest):
    # Lookup verified persisted result; user-supplied numerical values are never accepted.
    result = guarded(get_result, request.analysis_id)
    return {"analysis_id": result["analysis_id"], "language": request.language,
            "explanation": result["interpretation"][request.language], "method": "Deterministic reviewed template; no generative AI"}


class HotDaysRequest(BaseModel):
    location_id: str = "dhaka"
    threshold_c: float = Field(default=35, ge=-50, le=65)
    mode: str = "cached"


@router.post("/hot-days")
def hot_days(request: HotDaysRequest):
    if request.mode not in ["cached", "fixture", "live"]:
        raise HTTPException(422, "Choose cached, live or fixture mode")
    location = resolve_location(TrendRequest(location_id=request.location_id))
    if location is None:
        raise HTTPException(422, "Unknown location")
    frame, meta, mode = guarded(load, location, request.mode)
    return count_hot_days(frame, meta, location, mode, request.threshold_c)


@router.get("/export/{analysis_id}.{format}")
def export(analysis_id: str, format: str):
    result = guarded(get_result, analysis_id)
    if analysis_id.startswith("bhu-hot-") and format != "json":
        raise HTTPException(422, "Threshold counter export supports JSON with complete Data Passport; trend CSV/PDF formats require a trend analysis")
    if format == "csv":
        body, media = csv_bytes(result), "text/csv"
    elif format == "json":
        body, media = json.dumps(result, ensure_ascii=False, indent=2).encode(), "application/json"
    elif format == "pdf":
        body, media = pdf_bytes(result), "application/pdf"
    else:
        raise HTTPException(422, "Choose csv, json or pdf")
    return Response(body, media_type=media, headers={"Content-Disposition": f'attachment; filename="{analysis_id}.{format}"'})


app.include_router(router, prefix="/api/v1")
app.include_router(router, include_in_schema=False)
