"""NASA POWER daily point adapter; immutable raw response and explicit provenance."""
from .sources import source_record
import json
import hashlib
import shutil
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"
METADATA = ROOT / "data" / "metadata"
PARAMETERS = ["T2M", "T2M_MAX", "PRECTOTCORR", "RH2M", "ALLSKY_SFC_SW_DWN"]


def request_url(lat, lon, start=1991, end=2024):
    return source_record("power")["api_base_url"] + "?" + urlencode({
        "parameters": ",".join(PARAMETERS), "community": "AG", "longitude": lon,
        "latitude": lat, "start": f"{start}0101", "end": f"{end}1231",
        "format": "JSON", "time-standard": "UTC",
    })


def parse_response(payload):
    values = payload["properties"]["parameter"]
    fill = float(payload.get("header", {}).get("fill_value", -999))
    frame = pd.DataFrame(values)
    frame.index = pd.to_datetime(frame.index, format="%Y%m%d")
    frame.index.name = "date"
    frame = frame.sort_index().apply(pd.to_numeric, errors="coerce")
    invalid = frame.eq(fill) | frame.eq(-999) | ~np.isfinite(frame)
    counts = invalid.sum().to_dict()
    frame = frame.mask(invalid)
    # Physically invalid daily rain/humidity/irradiance values are excluded, never interpolated.
    for key in ["PRECTOTCORR", "RH2M", "ALLSKY_SFC_SW_DWN"]:
        if key in frame:
            bad = frame[key] < 0
            if key == "RH2M":
                bad |= frame[key] > 100
            counts[key] += int(bad.sum())
            frame.loc[bad, key] = np.nan
    return frame, {"fill_value": fill, "excluded_values": {k: int(v) for k, v in counts.items()}}


def store_response(location, payload, source_url, retrieved_at=None, overwrite_raw=False):
    for folder in [RAW, PROCESSED, METADATA]:
        folder.mkdir(parents=True, exist_ok=True)
    loc_id = location["id"]
    frame, qc = parse_response(payload)
    raw_path = RAW / f"power-{loc_id}.json"
    if overwrite_raw or not raw_path.exists():
        raw_path.write_text(json.dumps(payload), encoding="utf-8")
    frame.to_parquet(PROCESSED / f"power-{loc_id}.parquet")
    raw_hash = hashlib.sha256(raw_path.read_bytes()).hexdigest()
    processed_hash = hashlib.sha256((PROCESSED / f"power-{loc_id}.parquet").read_bytes()).hexdigest()
    raw_snapshot = RAW / "snapshots" / f"power-{loc_id}-{raw_hash}.json"
    processed_snapshot = PROCESSED / "snapshots" / f"power-{loc_id}-{processed_hash}.parquet"
    raw_snapshot.parent.mkdir(parents=True, exist_ok=True)
    processed_snapshot.parent.mkdir(parents=True, exist_ok=True)
    if not raw_snapshot.exists():
        shutil.copyfile(raw_path, raw_snapshot)
    if not processed_snapshot.exists():
        shutil.copyfile(PROCESSED / f"power-{loc_id}.parquet", processed_snapshot)
    meta = {
        "location": location, "source_url": source_url,
        "retrieved_at": retrieved_at or datetime.now(timezone.utc).isoformat(),
        "header": payload.get("header", {}), "parameters": payload.get("parameters", {}),
        "geometry": payload.get("geometry", {}), "qc": qc,
        "source_type": "Analysis-ready gridded model/reanalysis meteorology; satellite-derived solar irradiance",
        "time_standard": payload.get("header", {}).get("time_standard", "UTC requested"),
        "source_sha256": raw_hash,
        "processed_sha256": processed_hash,
        "raw_snapshot": raw_snapshot.relative_to(ROOT).as_posix(),
        "processed_snapshot": processed_snapshot.relative_to(ROOT).as_posix(),
    }
    (METADATA / f"power-{loc_id}.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return frame, meta


def acquire(location, start=1991, end=2024):
    url = request_url(location["lat"], location["lon"], start, end)
    with urlopen(url, timeout=120) as response:
        payload = json.loads(response.read())
    return store_response(location, payload, url, overwrite_raw=True)


def load(location, mode="cached"):
    if mode == "live":
        frame, meta = acquire(location)
        return frame, meta, "LIVE"
    if mode == "fixture":
        # Synthetic measurements are explicit, deterministic and never substitute for missing NASA cache.
        dates = pd.date_range("1991-01-01", "2024-12-31", freq="D")
        rng = np.random.default_rng(2026)
        years = (dates.year - 1991).to_numpy()
        season = np.sin(2 * np.pi * dates.dayofyear.to_numpy() / 365.25)
        frame = pd.DataFrame({
            "T2M": 25 + 0.04 * years + 4 * season + rng.normal(0, 1, len(dates)),
            "T2M_MAX": 30 + 0.04 * years + 4 * season + rng.normal(0, 1, len(dates)),
            "PRECTOTCORR": np.maximum(0, 5 + 3 * season + rng.normal(0, 3, len(dates))),
            "RH2M": 65 + 10 * season,
            "ALLSKY_SFC_SW_DWN": 4 + season,
        }, index=dates)
        meta = {"location": location, "source_url": "fixture://deterministic-synthetic-v1", "retrieved_at": None,
                "header": {"title": "Synthetic demo fixture", "api": {"version": "fixture-v1"}}, "parameters": {},
                "qc": {"fill_value": -999, "excluded_values": {}}, "time_standard": "UTC", "source_type": "Synthetic fixture"}
        return frame, meta, "FIXTURE"
    cached = PROCESSED / f"power-{location['id']}.parquet"
    metadata = METADATA / f"power-{location['id']}.json"
    if not cached.exists() or not metadata.exists():
        raise FileNotFoundError("No NASA cache for this point. Retrieve live data first; fixtures require explicit selection.")
    return pd.read_parquet(cached), json.loads(metadata.read_text(encoding="utf-8")), "CACHED"
