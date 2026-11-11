import pdfplumber,io,re,json,zipfile,argparse
from PIL import Image,ImageDraw
from pathlib import Path
parser=argparse.ArgumentParser(description='Import user-supplied reference charts. Requires pdfplumber and Pillow.')
parser.add_argument('--pdf',required=True);parser.add_argument('--epub',required=True)
args=parser.parse_args()
Path('work').mkdir(exist_ok=True)
p=pdfplumber.open(args.pdf)
charts=[];headers=[]
ranks='AKQJT98765432'
hands=[a+b if i==j else a+b+'s' if i<j else b+a+'o' for i,a in enumerate(ranks) for j,b in enumerate(ranks)]
def color(c):
 r,g,b=c[:3]
 if r>130 and r>g*1.4 and r>b*1.4:return 'raise'
 if g>90 and g>r*1.15 and g>b*1.15:return 'call'
 if b>90 and b>r*1.2 and b>g*1.03:return 'fold'
 return None
for pageNo in [4,5,6,7,8,9,10,11,12,28,29,30,31,32]:
 page=p.pages[pageNo-1];text=page.extract_text();stack=100 if pageNo in [4,5,8,9,10,11,12] else 200
 titles=re.findall(r'(UTG\+1|UTG|LJ|HJ|CO|BTN|SB|BB)(?: vs (UTG\+1|UTG|LJ|HJ|CO|BTN|SB|BB))? · (RFI|Limp)',text)
 images=[x for x in page.images if x['width']>200]
 assert len(titles)==len(images),(pageNo,titles)
 for i,(title,imdata) in enumerate(zip(titles,images)):
  pos,opener,kind=title
  if kind=='Limp':continue
  im=Image.open(io.BytesIO(imdata['stream'].get_data())).convert('RGB');w,h=im.size
  # Chart fills occur in fourteen horizontal bands: header and thirteen rows.
  ys=[y for y in range(h) if sum(color(im.getpixel((x,y))) is not None for x in range(6,w-6,8))>(w/8)*.70]
  bands=[]
  for y in ys:
   if not bands or y>bands[-1][-1]+1:bands.append([y])
   else:bands[-1].append(y)
  bands=[b for b in bands if len(b)>12]
  gridtop=bands[1][0]; step=(h-gridtop)/13
  values={}
  for row in range(13):
   band=list(range(round(gridtop+row*step),round(gridtop+(row+1)*step)))
   for col in range(13):
    counts={'raise':0,'call':0,'fold':0}
    for x in range(round(col*w/13)+4,round((col+1)*w/13)-4):
     votes=[color(im.getpixel((x,band[0]+off))) for off in [6,8,len(band)-7,len(band)-9]]
     votes=[v for v in votes if v]
     if votes:counts[max(set(votes),key=votes.count)]+=1
    total=sum(counts.values());assert total>45
    # Remove four-pixel margins from proportion bias by assigning edges nearest color.
    for edge in [round(col*w/13)+4,round((col+1)*w/13)-5]:
     c=color(im.getpixel((edge,band[0]+8)))
     if c:counts[c]+=4
    total=sum(counts.values());freq={k:round(v/total,2) for k,v in counts.items()}
    # Derive fold remainder so probabilities always sum to one.
    freq['fold']=round(1-freq['raise']-freq['call'],2)
    values[hands[row*13+col]]=freq
  entry={'id':f'pdf-{pageNo}-{i}','source':'pdf','page':pageNo,'stack':stack,'position':pos,'opener':opener or None,'scenario':'response' if opener else 'open','frequencies':values}
  charts.append(entry)
  head=im.crop((0,0,w,bands[0][-1]+1));head.thumbnail((330,42));tile=Image.new('RGB',(340,67),'#eee');tile.paste(head,(0,23));ImageDraw.Draw(tile).text((2,3),f'{entry["id"]} {pos} vs {opener or "RFI"}',fill='black');headers.append(tile)
Path('src/reference-data.json').write_text(json.dumps(charts,separators=(',',':'))+'\n')
canvas=Image.new('RGB',(1360,67*((len(headers)+3)//4)),'white')
for i,im in enumerate(headers):canvas.paste(im,((i%4)*340,(i//4)*67))
canvas.save('work/headers.png')
print('PDF charts',len(charts))
# EPUB baseline first-in charts: preserve the author's EP/MP groups, not invented seat mappings.
z=zipfile.ZipFile(args.epub)
book=[]
for image,diagram,pos,depth,expected,chapter in [(7,1,'EP','deep',174,'Early Position Strategy: First In'),(9,3,'EP','medium',148,'Early Position Strategy: First In'),(13,7,'MP','deep',254,'Middle Position Strategy: First In'),(14,8,'MP','medium',226,'Middle Position Strategy: First In'),(20,14,'CO','deep',538,'Cutoff Strategy: First In'),(22,16,'CO','medium',538,'Cutoff Strategy: First In'),(25,19,'BTN','deep',658,'Button Strategy: First In'),(27,21,'BTN','medium',658,'Button Strategy: First In')]:
 im=Image.open(io.BytesIO(z.read(f'images/{image:05}.jpeg'))).convert('RGB');w,h=im.size
 # Grid bounding box from colored cells only, restricting to the first 85% to exclude summary.
 x0,y0,x1,y1=(10,5,492,487) if image==14 else (14,6,548,540) if image==27 else (0,0,520,520)
 included=[]
 for i,hand in enumerate(hands):
  row,col=divmod(i,13);x=round(x0+(col+.3)*(x1-x0)/13);y=round(y0+(row+.2)*(y1-y0)/13)
  if color(im.getpixel((x,y)))=='raise':included.append(hand)
 combo=sum(6 if len(h)==2 else 4 if h.endswith('s') else 12 for h in included)
 assert combo==expected,(image,combo,expected,included)
 book.append({'id':f'book-d{diagram}','source':'book','diagram':diagram,'position':pos,'depth':depth,'chapter':chapter,'hands':included,'combos':combo})
Path('src/book-data.json').write_text(json.dumps(book,separators=(',',':'))+'\n');print('Book charts',len(book),'all source combo counts match')
