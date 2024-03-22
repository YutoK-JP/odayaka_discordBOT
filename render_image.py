import cv2
import numpy as np
import sys
from PIL import Image, ImageFont, ImageDraw
import textwrap
import re

def add_text(img, message, pos=(0,0), font="HGRSGU.TTC", size = 54):
    font_path = "/home/pi/MEIRYO.TTC"
    font_size = size
    font = ImageFont.truetype(font_path, font_size)
    img = Image.fromarray(img)                          # cv2(NumPy)型の画像をPIL型に変換
    draw = ImageDraw.Draw(img)

    draw.text(pos, message, font=font, fill=(255, 255, 255, 0))
    img = np.array(img, dtype=np.uint8) 
    return img


args = sys.argv
file_name = args[1]
user_img = args[2]
name_ = args[3]
text_ = args[4]
add_img = args[5]

if not("." in file_name):
    file_name+=".png"

img1 = np.array(cv2.resize(cv2.imread(user_img), (720, 720)), dtype=np.uint8)
img0 = np.full((720, 1280-720, 3), 255, dtype=np.uint8)
base = np.array(cv2.imread("/home/pi/odayaka/base.png"), dtype=np.float32)/255

img1 = cv2.hconcat([img1, img0])

img = img1 * base
img=np.array(img, dtype=np.uint8)

print(img.shape)

#Username
name = "- "+name_
size = 36
name_offset = size*len(name)//2
name_pos = 960 - name_offset

img = add_text(img=img, message=name, pos=(name_pos,640-size*1.5), size=size, font="meiryo.ttc")

if(add_img =="null" or add_img == "none"):
#Content
    text=text_
    text = re.sub('<.+>', '', text_)
    letters = 14 if (len(text_) < 200) else 28
    texts = text.split("\n")
    t = []
    for s in texts:
        print(s)

        t += textwrap.wrap(s, letters)
    #print(t)
    

    lengths = list(map(len, t))
    line_max = max(lengths)
    text = "\n".join(t)
    #print(text)
    size = 40 if (len(text_) < 200) else 20

    lines = text.count("\n")
    text_offset = size*min(letters, line_max) // 2
    text_pos = 980 - text_offset

    texty_pos =  170 - size*lines//4
    #print(lines, texty_pos)

    img = add_text(img=img, message=text, pos=(text_pos,texty_pos), size=size, font="meiryo.ttc")

    cv2.imwrite(file_name, cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))

else:
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    eximage = cv2.cvtColor(cv2.imread(add_img), cv2.COLOR_BGR2GRAY)
    aspect = eximage.shape[1]/eximage.shape[0]
    #500*375
    scale = 500/eximage.shape[1] if aspect>(500/375) else 375/eximage.shape[0]
    eximage = cv2.resize(eximage, dsize=None, fx=scale,  fy=scale)
    height, width = eximage.shape[:2]
    print(width,height)
    YleftTop = 320 - height//2
    XleftTop = 960 - width//2

    img[YleftTop:YleftTop+height, XleftTop:XleftTop+width] = eximage//1.2
    cv2.imwrite(file_name, img)
