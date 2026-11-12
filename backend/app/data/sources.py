"""Shared attribution metadata only. No scientific data or computations are changed."""
import json
from pathlib import Path
_REGISTRY=json.loads((Path(__file__).resolve().parents[3]/'src/data/nasa-sources.json').read_text(encoding='utf-8'))
SOURCES={source['id']:source for source in _REGISTRY['sources']}
def source_record(source_id):
    return SOURCES[source_id]
def source_url(source_id,role='documentation_url'):
    return source_record(source_id)[role]
