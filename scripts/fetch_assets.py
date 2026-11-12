from source_registry import source_url, template
import urllib.request, pathlib, json
from concurrent.futures import ThreadPoolExecutor
assets=[(source_url('asset-29','data_access_url'),'public/images/earth-december-2004.jpg'),('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson','public/maps/world.geojson')]
def get(pair):
 u,p=pair
 try:
  pathlib.Path(p).parent.mkdir(parents=True,exist_ok=True)
  b=urllib.request.urlopen(u,timeout=120).read();pathlib.Path(p).write_bytes(b);return p,len(b)
 except Exception as e:return p,str(e)
print(list(ThreadPoolExecutor(2).map(get,assets)))
