"""Draws the app icon: the colour-block cover from the dictionary page (charcoal, spruce, sage, navy, lilac) on cool paper."""
import sys
from PIL import Image, ImageDraw
out = sys.argv[1]
def icon(size, pad_frac, radius_frac=0.0):
    S = size * 4
    im = Image.new("RGB", (S, S), "#ECEBE6")
    d = ImageDraw.Draw(im)
    p = int(S * pad_frac); g = int(S * 0.025)
    x0, y0, x1, y1 = p, p, S - p, S - p
    w, h = x1 - x0, y1 - y0
    cx = x0 + int(w * 1 / 2.4)            # columns 1 : 1.4
    r1 = y0 + int(h * 1.3 / 2.75); r2 = y0 + int(h * 1.75 / 2.75)   # rows 1.3 : .45 : 1
    d.rectangle([x0, y0, cx - g // 2, r2 - g // 2], fill="#4A4E54")
    d.rectangle([cx + g // 2, y0, x1, r1 - g // 2], fill="#2F4F45")
    d.rectangle([cx + g // 2, r1 + g // 2, x1, r2 - g // 2], fill="#9CAF9A")
    d.rectangle([x0, r2 + g // 2, cx - g // 2, y1], fill="#2E3A55")
    d.rectangle([cx + g // 2, r2 + g // 2, x1, y1], fill="#B7A9C9")
    return im.resize((size, size), Image.LANCZOS)
icon(192, .14).save(f"{out}/icon-192.png")
icon(512, .14).save(f"{out}/icon-512.png")
icon(512, .22).save(f"{out}/icon-maskable-512.png")
icon(180, .14).save(f"{out}/apple-touch-icon.png")
