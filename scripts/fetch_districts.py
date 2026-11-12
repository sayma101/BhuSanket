import json, pathlib, urllib.request
meta=json.load(urllib.request.urlopen('https://www.geoboundaries.org/api/current/gbOpen/BGD/ADM2/',timeout=60))
url=meta['simplifiedGeometryGeoJSON'].replace('https://github.com/wmgeolab/geoBoundaries/raw/','https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/')
b=urllib.request.urlopen(url,timeout=120).read()
p=pathlib.Path('public/maps/bangladesh-districts.geojson');p.write_bytes(b)
pathlib.Path('data/metadata/bangladesh-boundaries.json').write_text(json.dumps(meta,indent=2),encoding='utf-8')
print(len(b));print(json.loads(b)['features'][0]['properties'])
