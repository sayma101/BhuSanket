from source_registry import source_url, template
"""Cache geographically registered NASA display tiles for Explore's Bangladesh view.

Display imagery only. No scientific values or analytical rasters are produced.
"""
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
import json
import math
from pathlib import Path
from urllib.request import urlopen

DATE = "2004 composite (not a single-date observation)"
LAYER = "BlueMarble_ShadedRelief_Bathymetry"
MATRIX = "GoogleMapsCompatible_Level8"
ROOT = Path(__file__).resolve().parents[1] / "public/maps/blue-marble-context"
BASE = template('gibs_blue_marble').split('/{z}')[0]


def tile(lat, lon, zoom):
    count = 2 ** zoom
    x = math.floor((lon + 180) / 360 * count)
    y = math.floor((1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * count)
    return x, y


def acquire(item):
    zoom, y, x = item
    target = ROOT / str(zoom) / str(y) / f"{x}.jpeg"
    source = f"{BASE}/{zoom}/{y}/{x}.jpeg"
    try:
        if target.exists():
            data = target.read_bytes()
        else:
            with urlopen(source, timeout=25) as response:
                data = response.read()
                if response.status != 200 or data[:2] != b"\xff\xd8":
                    raise ValueError("Expected a NASA JPEG display tile")
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
        return {"key": f"{zoom}/{y}/{x}", "source_url": source, "bytes": len(data), "sha256": sha256(data).hexdigest()}
    except Exception as error:
        return {"failed": f"{zoom}/{y}/{x}", "error": str(error)}


if __name__ == "__main__":
    requests = []
    for zoom in (4, 5, 6, 7):
        west, north = tile(30, 85, zoom)
        east, south = tile(18, 96, zoom)
        requests.extend((zoom, y, x) for y in range(north, south + 1) for x in range(west, east + 1))
    ROOT.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(acquire, requests))
    manifest = {
        "purpose": "Historical satellite context only; not a measurement layer",
        "layer": LAYER, "date": DATE, "projection": "EPSG:3857", "tile_matrix_set": MATRIX,
        "credit": "NASA Earth Observatory / NASA GIBS / Blue Marble, shaded relief and bathymetry",
        "source": source_url('blue-marble','data_access_url'),
        "bounds": {"west": 85, "south": 18, "east": 96, "north": 30},
        "tiles": [entry for entry in results if "key" in entry],
        "failures": [entry for entry in results if "failed" in entry],
    }
    (ROOT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(json.dumps({"cached": len(manifest["tiles"]), "failed": len(manifest["failures"]), "bytes": sum(entry["bytes"] for entry in manifest["tiles"])}))
