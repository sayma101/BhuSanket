import json
from pathlib import Path
REGISTRY=json.loads((Path(__file__).resolve().parents[1]/'src/data/nasa-sources.json').read_text(encoding='utf-8'))
def source_url(id,role='documentation_url'):
 return next(source for source in REGISTRY['sources'] if source['id']==id)[role]
def template(id):
 return REGISTRY['templates'][id]
def asset_url(url):
 return next(source['data_access_url'] for source in REGISTRY['sources'] if source['data_access_url']==url)
