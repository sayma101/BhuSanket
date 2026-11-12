from source_registry import source_url, template
import urllib.request,pathlib
root=template('earthrise_asset_base')
for source,target in [('earthrise_720p30.mp4','public/images/nasa-earthrise.mp4'),('earthrise.2400.jpg','public/images/nasa-earthrise-poster.jpg')]:
 data=urllib.request.urlopen(root+source,timeout=60).read(15000001)
 if len(data)>15000000:raise ValueError('Asset exceeds 15MB download limit')
 pathlib.Path(target).write_bytes(data)
 print(target,len(data))
