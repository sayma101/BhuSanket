import sys,pathlib,subprocess
sys.path.insert(0,'.media-tools')
import imageio_ffmpeg
p=pathlib.Path('public/images/nasa-earthrise.mp4');src=pathlib.Path('tmp/nasa-earthrise-source.mp4');src.parent.mkdir(exist_ok=True);p.replace(src)
encoder=imageio_ffmpeg.get_ffmpeg_exe()
subprocess.run([encoder,'-hide_banner','-loglevel','error','-ss','45','-i',str(src),'-t','16','-an','-vf','fps=24,fade=t=in:st=0:d=0.5,fade=t=out:st=15.5:d=0.5','-c:v','libx264','-crf','25','-preset','fast','-movflags','+faststart',str(p)],check=True)
subprocess.run([encoder,'-hide_banner','-loglevel','error','-ss','2','-i',str(p),'-frames:v','1','-update','1','-y','public/images/nasa-earthrise-poster.jpg'],check=True)
print('Final 16-second video bytes:',p.stat().st_size)
