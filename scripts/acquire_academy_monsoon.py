from source_registry import source_url, template
from pathlib import Path
from urllib.request import urlopen
import hashlib,json,subprocess,sys
root=Path.cwd();work=root/'tmp/academy-media';work.mkdir(exist_ok=True,parents=True)
base=template('monsoon_asset_base')
for filename,local in [('4397_Monsoon_w_Tour_prores.webm','monsoon-source.webm'),('4397_Monsoon_w_Tour.00200_print.jpg','monsoon-source.jpg')]:
 path=work/local
 if not path.exists():
  with urlopen(base+filename,timeout=90) as response:path.write_bytes(response.read())
sys.path.insert(0,str(root/'.media-tools'));import imageio_ffmpeg
out=root/'public/images/academy-monsoon-2016.mp4'
subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-loglevel','error','-y','-i',str(work/'monsoon-source.webm'),'-an','-vf','scale=960:-2','-c:v','libx264','-crf','26','-preset','fast','-movflags','+faststart',str(out)],check=True)
from PIL import Image
Image.open(work/'monsoon-source.jpg').save(root/'public/images/academy-monsoon-poster.webp','WEBP',quality=85)
metadata=dict(title='Monsoons: Wet, Dry, Repeat — full visualization without narration',source_page=source_url('monsoon-film','data_access_url'),original_video=base+'4397_Monsoon_w_Tour_prores.webm',credit="NASA/Goddard Space Flight Center; visualization: Greg Shirah and Kel Elkins",released='2016-06-23',local_video=str(out.relative_to(root)),purpose='Regional educational visualization using satellite data and models; not the Khulna POWER analysis',edit='Entire silent visualization re-encoded, no narration claimed; bilingual BhuSanket descriptive guide supplied',bytes=out.stat().st_size,sha256=hashlib.sha256(out.read_bytes()).hexdigest())
(root/'docs/ACADEMY_MONSOON_MEDIA.json').write_text(json.dumps(metadata,indent=2),encoding='utf-8');print(json.dumps(metadata))
