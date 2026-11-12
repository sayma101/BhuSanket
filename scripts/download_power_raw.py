from source_registry import source_url, template
"""Dependency-free NASA acquisition preserving exact response bytes and retrieval metadata."""
import json
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from backend.app.data.catalogue import LOCATIONS


def download(location):
    path = ROOT / "data/raw" / f"power-{location['id']}.json"
    url = source_url('power','api_base_url')+'?' + urlencode({
        "parameters": "T2M,T2M_MAX,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN",
        "community": "AG", "latitude": location["lat"], "longitude": location["lon"],
        "start": "19910101", "end": "20241231", "format": "JSON", "time-standard": "UTC",
    })
    if not path.exists():
        with urlopen(url, timeout=180) as response:
            path.write_bytes(response.read())
    meta = {"source_url": url, "retrieved_at": datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat()}
    (ROOT / "data/raw" / f"power-{location['id']}.retrieval.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(location["id"], path.stat().st_size, flush=True)


if __name__ == "__main__":
    ids = set(sys.argv[1:])
    sites = [x for x in LOCATIONS if not ids or x["id"] in ids]
    with ThreadPoolExecutor(max_workers=3) as pool:
        list(pool.map(download, sites))
