from PIL import Image, ImageDraw, ImageFont
import math
from pathlib import Path
W,H=640,480
font_path='C:/Windows/Fonts/georgia.ttf'
font=ImageFont.truetype(font_path,55)
small=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',15)
frames=[]
for frame in range(60):
 t=frame/60*2*math.pi
 im=Image.new('RGB',(W,H)); pix=im.load()
 for y in range(H):
  for x in range(W):
   glow=max(0,1-math.hypot((x-320)/480,(y-220)/350))
   pix[x,y]=(int(7+glow*12),int(28+glow*42),int(26+glow*35))
 d=ImageDraw.Draw(im)
 for j in range(7):
  pts=[(x,340+j*23+18*math.sin(x/105+t+j*.4)) for x in range(-5,W+6,5)]
  d.line(pts,fill=(25+j*2,75+j*5,66+j*4),width=2)
 for j in range(18):
  x=(j*137)%640; y=(j*83)%480
  dx=7*math.sin(t+j); dy=8*math.cos(t+j*.8)
  d.ellipse((x+dx,y+dy,x+dx+2,y+dy+2),fill=(87,151,126))
 # Animated circular leaf emblem, with typography in a quiet central area.
 cy=154+4*math.sin(t)
 d.ellipse((285,cy-35,355,cy+35),outline=(123,201,160),width=2)
 d.ellipse((305,cy-19,335,cy+12),fill=(126,209,165))
 d.line((307,cy+20,330,cy-12),fill=(17,57,43),width=3)
 d.text((320,219),'Verdanta',font=font,fill=(241,250,235),anchor='mm')
 d.text((320,270),'GROW TOGETHER. BELONG HERE.',font=small,fill=(161,209,183),anchor='mm')
 frames.append(im.quantize(colors=96))
Path('public').mkdir(exist_ok=True)
frames[0].save('public/verdanta-default.gif',save_all=True,append_images=frames[1:],duration=100,loop=0,optimize=True)
frames[0].convert('RGB').save('public/verdanta-default.png')
