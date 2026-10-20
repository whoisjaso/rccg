#!/usr/bin/env python3
"""Replace garbled AI lettering on a round or rectangular sign with the official logo file.

Usage:
  python fix_logo.py <image> <logo.png> <out.png> --center CX,CY --size W,H [--warm 1.0] [--preview crop.png]

1. Zoom into the sign (crop 4x) to read it. 2. Measure the sign's visible width/height in pixels
   (for a round logo seen at an angle, W/H gives the perspective squash). 3. Run this.
Lighting: the logo is brightened toward the bottom and warmed slightly to sit under an uplight;
pass --warm 0 for neutral daylight.
"""
import argparse
import numpy as np
from PIL import Image, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument("image"); ap.add_argument("logo"); ap.add_argument("out")
ap.add_argument("--center", required=True); ap.add_argument("--size", required=True)
ap.add_argument("--warm", type=float, default=1.0); ap.add_argument("--preview")
a = ap.parse_args()
cx, cy = (int(v) for v in a.center.split(",")); W, H = (int(v) for v in a.size.split(","))
base = Image.open(a.image).convert("RGBA")
logo = Image.open(a.logo).convert("RGBA").resize((W * 4, H * 4), Image.LANCZOS)
arr = np.asarray(logo).astype(np.float32)
yy = np.linspace(0, 1, H * 4)[:, None]
light = 0.86 + 0.16 * yy
tint = np.array([1.0, 1 - 0.025 * a.warm, 1 - 0.08 * a.warm])
arr[..., :3] = np.clip(arr[..., :3] * light[..., None] * tint, 0, 255)
lit = Image.fromarray(arr.astype(np.uint8), "RGBA").resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.35))
base.alpha_composite(lit, (cx - W // 2, cy - H // 2))
out = base.convert("RGB"); out.save(a.out)
if a.preview:
    m = max(W, H)
    out.crop((cx - m, cy - m, cx + m, cy + m)).resize((560, 560), Image.LANCZOS).save(a.preview)
print("wrote", a.out)
