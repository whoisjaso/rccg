#!/usr/bin/env python3
"""Generate the agbada yoke embroidery (src/partials/yoke.html).

Strictly mirror-symmetric thread geometry around the RCCG emblem.
Every visible stitch path has a twin in a reveal mask; CSS draws the mask
with --p (0..1) so the embroidery stitches itself in. Each element carries
--d, its start point in the sequence.
"""
import math
from pathlib import Path

W, H = 1000, 640
CX, CY = 500, 300           # emblem centre
items = []                  # (d, cls, delay)


def f(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


def add(d, cls, delay):
    items.append((d, cls, delay))


def circle(r):
    return f"M{f(CX)} {f(CY - r)}a{f(r)} {f(r)} 0 1 1 0 {f(2 * r)}a{f(r)} {f(r)} 0 1 1 0 {f(-2 * r)}"


def rot(x, y, a):
    c, s = math.cos(a), math.sin(a)
    x, y = x - CX, y - CY
    return CX + x * c - y * s, CY + x * s + y * c


def bez(p0, p1, p2, p3, t):
    u = 1 - t
    return tuple(u**3 * a + 3 * u * u * t * b + 3 * u * t * t * c + t**3 * d for a, b, c, d in zip(p0, p1, p2, p3))


# 1. Satin ring hugging the emblem, then a running-stitch ring
add(circle(104), "satin", 0.00)
add(circle(118), "run", 0.04)

# 2. Sixteen teardrop petals, 16-fold symmetry
for i in range(16):
    a = i * math.pi / 8
    tip = rot(CX, CY - 176, a)
    l1, r1 = rot(CX - 17, CY - 146, a), rot(CX + 17, CY - 146, a)
    base = rot(CX, CY - 128, a)
    d = (f"M{f(base[0])} {f(base[1])}C{f(l1[0])} {f(l1[1])} {f(tip[0])} {f(tip[1])} {f(tip[0])} {f(tip[1])}"
         f"C{f(tip[0])} {f(tip[1])} {f(r1[0])} {f(r1[1])} {f(base[0])} {f(base[1])}Z")
    add(d, "run", 0.10 + (min(i, 16 - i)) * 0.012)
    # French knot at each petal tip
    k = rot(CX, CY - 190, a)
    add(f"M{f(k[0] - 2.4)} {f(k[1])}a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0", "knot", 0.22 + (min(i, 16 - i)) * 0.01)

add(circle(206), "run", 0.26)

# 3. The yoke: two parallel U curves falling from the neckline, mirrored
def yoke(off):
    p0, p1, p2, p3 = (70 + off, -10), (90 + off, 330 - off * 0.2), (300, 560 - off), (CX, 560 - off)
    q = [(2 * CX - x, y) for x, y in (p0, p1, p2, p3)]
    return (p0, p1, p2, p3), q

for off, cls, dl in ((0, "satin", 0.30), (22, "run", 0.34)):
    (p0, p1, p2, p3), q = yoke(off)
    add(f"M{f(p0[0])} {f(p0[1])}C{f(p1[0])} {f(p1[1])} {f(p2[0])} {f(p2[1])} {f(p3[0])} {f(p3[1])}", cls, dl)
    add(f"M{f(q[0][0])} {f(q[0][1])}C{f(q[1][0])} {f(q[1][1])} {f(q[2][0])} {f(q[2][1])} {f(q[3][0])} {f(q[3][1])}", cls, dl)

# 4. Cross-stitch diamonds riding between the two yoke lines
(a0, a1, a2, a3), _ = yoke(11)
n = 15
for i in range(1, n + 1):
    t = i / (n + 0.6)
    x, y = bez(a0, a1, a2, a3, t)
    s = 6.5
    for xx in (x, 2 * CX - x):
        add(f"M{f(xx)} {f(y - s)}L{f(xx + s)} {f(y)}L{f(xx)} {f(y + s)}L{f(xx - s)} {f(y)}Z", "satin-thin", 0.40 + t * 0.30)

# 5. Spiral scrolls on each shoulder (the classic agbada swirl), mirrored
def spiral(cx, cy, turns, r0, r1, flip):
    pts = []
    steps = 90
    for k in range(steps + 1):
        t = k / steps
        a = t * turns * 2 * math.pi
        r = r0 + (r1 - r0) * t
        pts.append((cx + flip * r * math.cos(a), cy + r * math.sin(a)))
    return "M" + "L".join(f"{f(x)} {f(y)}" for x, y in pts)

for flip, cx in ((1, 250), (-1, 750)):
    add(spiral(cx, 150, 2.2, 6, 58, flip), "run", 0.46)
    add(spiral(cx, 150, 2.2, 10, 66, flip), "run-fine", 0.52)

# 6. Pendant: a stitched drop from the medallion into the yoke point
add(f"M{CX} {CY + 206}V{CY + 262}", "satin", 0.62)
for k, yy in enumerate((CY + 222, CY + 240)):
    add(f"M{CX} {yy - 7}L{CX + 7} {yy}L{CX} {yy + 7}L{CX - 7} {yy}Z", "satin-thin", 0.66 + k * 0.03)

# --- emit ---
vis, mask = [], []
for i, (d, cls, delay) in enumerate(items):
    vis.append(f'<path class="y-{cls}" d="{d}"/>')
    mask.append(f'<path d="{d}" pathLength="1" style="--d:{delay:.3f}"/>')

svg = f'''<svg class="yoke" viewBox="0 0 {W} {H}" fill="none" aria-hidden="true">
  <defs><mask id="yoke-reveal" maskUnits="userSpaceOnUse" x="0" y="-20" width="{W}" height="{H + 40}"><g class="yoke__mask" stroke="#fff" fill="none" stroke-width="16" stroke-linecap="round">{"".join(mask)}</g></mask></defs>
  <g class="yoke__thread" mask="url(#yoke-reveal)">{"".join(vis)}</g>
</svg>'''
out = Path(__file__).parent / "src" / "partials" / "yoke.html"
out.write_text(svg + "\n", encoding="utf-8")
print("yoke paths:", len(items), "bytes:", len(svg))
