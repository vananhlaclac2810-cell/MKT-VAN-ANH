import sys
sys.stdout.reconfigure(encoding="utf-8")
from PIL import Image, ImageDraw, ImageFont, ImageFilter

EMOJI_FONT = "C:/Windows/Fonts/seguiemj.ttf"
OUT = "D:/SKILL MARKETING AGENT/video-raw/icons"

import os
os.makedirs(OUT, exist_ok=True)

def make_icon(emoji, bg_color, ring_color, filename, size=380):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    pad = 30
    sd.ellipse((pad+8, pad+12, size-pad+8, size-pad+12), fill=(0, 0, 0, 110))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=10))
    img.alpha_composite(shadow)

    draw.ellipse((pad-6, pad-6, size-pad+6, size-pad+6), fill=ring_color)
    draw.ellipse((pad, pad, size-pad, size-pad), fill=bg_color)

    emoji_size = int(size * 0.55)
    font = ImageFont.truetype(EMOJI_FONT, emoji_size)
    draw.text((size // 2, size // 2), emoji, font=font, embedded_color=True, anchor="mm")

    img.save(f"{OUT}/{filename}.png")
    print(f"saved {filename}.png")

make_icon("🚨",  (255, 245, 220, 255), (180, 30, 40, 255),   "warn")
make_icon("👶", (255, 182, 193, 255),  (192, 96, 138, 255),  "n1")
make_icon("💧", (135, 206, 250, 255),  (60, 130, 200, 255),  "n2")
make_icon("🦴", (255, 215, 200, 255),  (180, 100, 80, 255),  "n3")
make_icon("🧠", (200, 182, 229, 255),  (109, 77, 156, 255),  "n4")
make_icon("🚫", (255, 230, 100, 255),  (220, 150, 30, 255),  "intro_icon")

print("All icons done")
