from source_registry import source_url, template
"""Acquire a verified NASA foundation film; never used as a measurement layer."""
from pathlib import Path
from urllib.request import urlopen
import hashlib, json, subprocess, sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = source_url('asset-25','data_access_url')
POSTER = source_url('asset-26','data_access_url')
work = ROOT / 'tmp/academy-media'
work.mkdir(parents=True, exist_ok=True)
for url, name in [(SOURCE, 'water-cycle-source.webm'), (POSTER, 'water-cycle-source.jpg')]:
    target = work / name
    if not target.exists():
        with urlopen(url, timeout=90) as response:
            target.write_bytes(response.read())
sys.path.insert(0, str(ROOT / '.media-tools'))
import imageio_ffmpeg
encoder = imageio_ffmpeg.get_ffmpeg_exe()
out = ROOT / 'public/images/academy-water-cycle-2009.mp4'
subprocess.run([encoder, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(work / 'water-cycle-source.webm'), '-an', '-vf', 'scale=960:-2', '-c:v', 'libx264', '-crf', '26', '-preset', 'fast', '-movflags', '+faststart', str(out)], check=True)
from PIL import Image
Image.open(work / 'water-cycle-source.jpg').save(ROOT / 'public/images/academy-water-cycle-poster.webp', 'WEBP', quality=85)
metadata = {'title':'The Water Cycle', 'source_page':source_url('water-cycle','data_access_url'), 'original_video':SOURCE, 'original_poster':POSTER, 'released':'2009-10-09', 'credit':'NASA/Goddard Space Flight Center', 'local_video':'public/images/academy-water-cycle-2009.mp4', 'edit':'Silent classroom encoding; full visual sequence retained, no narration claimed. BhuSanket provides a separate bilingual descriptive reading guide.', 'purpose':'Educational conceptual animation, not the mission measurement record', 'bytes':out.stat().st_size, 'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}
(ROOT / 'docs/ACADEMY_MEDIA.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')
print(json.dumps({'video_bytes':out.stat().st_size,'metadata':'docs/ACADEMY_MEDIA.json'}))
