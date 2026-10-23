"""Render licensed nature footage into the Verdanta banner assets.
Usage: python scripts/create-brand-banner.py --input clip.mp4 --ffmpeg /path/to/ffmpeg
Requires FFmpeg with libx264, libvpx-vp9, libwebp and drawtext support.
The original footage is NOT included in the repository; see public/MEDIA-LICENSE.md.
"""
import argparse, subprocess, shutil
from pathlib import Path
parser=argparse.ArgumentParser()
parser.add_argument('--input', required=True)
parser.add_argument('--ffmpeg', default='ffmpeg')
parser.add_argument('--serif', default='C:/Windows/Fonts/georgia.ttf')
parser.add_argument('--sans', default='C:/Windows/Fonts/segoeui.ttf')
a=parser.parse_args()
root=Path(__file__).resolve().parent.parent
work=root/'.local'/'media'; work.mkdir(parents=True,exist_ok=True)
shutil.copyfile(a.serif,work/'serif.ttf'); shutil.copyfile(a.sans,work/'sans.ttf')
def run(*args):
 subprocess.run([a.ffmpeg,'-hide_banner','-loglevel','warning','-y',*args],cwd=root,check=True)
# Native 4:3 crop, full source frame rate, no synthesized frames or reversed motion.
# Play seconds 1..11, dissolving the last second into 0..1. The boundary then
# continues into second 1 without a cut, flash, freeze, or change of direction.
graph=(
 '[0:v]trim=start=0:end=11,setpts=PTS-STARTPTS,crop=1440:1080,setsar=1,fps=30,split=2[a][b];'
 '[a]trim=start=1:end=11,setpts=PTS-STARTPTS,fps=30,settb=AVTB[body];'
 '[b]trim=start=0:end=1,setpts=PTS-STARTPTS,fps=30,settb=AVTB[head];'
 '[body][head]xfade=transition=fade:duration=1:offset=9,'
 'eq=brightness=-0.035:saturation=0.94,'
 'drawbox=x=0:y=0:w=iw:h=ih:color=black@0.12:t=fill,'
 "drawtext=fontfile=.local/media/serif.ttf:text='Verdanta':fontsize=112:fontcolor=0xF8F7EC:"
 'x=(w-text_w)/2:y=h*0.43:shadowcolor=black@0.55:shadowx=0:shadowy=3,'
 "drawtext=fontfile=.local/media/sans.ttf:text='G R O W   T O G E T H E R .   B E L O N G   H E R E .':fontsize=22:fontcolor=0xF8F7EC:"
 'x=(w-text_w)/2:y=h*0.58:shadowcolor=black@0.7:shadowx=0:shadowy=2,format=yuv420p[v]')
run('-i',str(Path(a.input).resolve()),'-filter_complex',graph,'-map','[v]','-an','-t','10',
 '-c:v','libx264','-preset','slow','-crf','27','-movflags','+faststart','public/verdanta-default.mp4')
run('-i','public/verdanta-default.mp4','-an','-c:v','libvpx-vp9','-b:v','0','-crf','40','-cpu-used','4',
 '-row-mt','1','-threads','4','public/verdanta-default.webm')
# GIF retained for download/legacy fallback; primary playback uses the much smaller video.
run('-i','public/verdanta-default.mp4','-filter_complex',
 'fps=15,scale=640:480:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle',
 '-loop','0','public/verdanta-default.gif')
run('-i','public/verdanta-default.mp4','-frames:v','1','-update','1','public/verdanta-default.png')
run('-i','public/verdanta-default.mp4','-frames:v','1','-c:v','libwebp','-quality','88','public/verdanta-default.webp')
for file in (root/'public').glob('verdanta-default.*'): print(file.name,round(file.stat().st_size/1024),'KiB')
