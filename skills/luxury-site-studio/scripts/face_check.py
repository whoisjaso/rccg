#!/usr/bin/env python3
"""Side-by-side identity check: source crops on top, generated crops below.

Usage:
  python face_check.py <source> <generated> <out.jpg> --boxes "sx0,sy0,sx1,sy1:gx0,gy0,gx1,gy1" [...]
Coordinates are pixels in each image (source box : generated box). One pair per face.
Tip: find coordinates by viewing a downscaled copy and multiplying back up.
"""
import sys
from PIL import Image

src, gen, out = Image.open(sys.argv[1]).convert("RGB"), Image.open(sys.argv[2]).convert("RGB"), sys.argv[3]
pairs = []
for arg in sys.argv[sys.argv.index("--boxes") + 1:]:
    s, g = arg.split(":")
    pairs.append((tuple(int(v) for v in s.split(",")), tuple(int(v) for v in g.split(","))))
T = 200
sheet = Image.new("RGB", (len(pairs) * (T + 8), 2 * T + 10), "white")
for i, (sb, gb) in enumerate(pairs):
    sheet.paste(src.crop(sb).resize((T, T)), (i * (T + 8), 0))
    sheet.paste(gen.crop(gb).resize((T, T)), (i * (T + 8), T + 10))
sheet.save(out, quality=88)
print("wrote", out)
