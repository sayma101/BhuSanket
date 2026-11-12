"""Run from repository root: python scripts/acquire_power.py [location ids]."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from backend.app.data.catalogue import LOCATIONS
from backend.app.data.power import RAW, acquire, request_url, store_response

ids = set(sys.argv[1:])
for location in LOCATIONS:
    if ids and location["id"] not in ids:
        continue
    raw = RAW / f"power-{location['id']}.json"
    if raw.exists():
        retrieval_path = RAW / f"power-{location['id']}.retrieval.json"
        retrieval = json.loads(retrieval_path.read_text(encoding="utf-8")) if retrieval_path.exists() else {}
        frame, meta = store_response(location, json.loads(raw.read_text(encoding="utf-8")), request_url(location["lat"], location["lon"]), retrieval.get("retrieved_at"))
    else:
        frame, meta = acquire(location)
    print(location["id"], len(frame), meta["retrieved_at"], flush=True)
