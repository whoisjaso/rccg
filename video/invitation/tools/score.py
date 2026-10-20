"""Original score + sound design for "The Dayspring", synthesized from scratch (no samples, fully cleared).

Arc: a dark D-minor pad under the burdens, silence for the meaning pause, a warmer turn, a riser that drops
out right before the dawn, then D major for the dayspring, the proof and the future pace, resolving on the
end card. SFX follow the cue sheet the renderer exports (one cue per word on its visual peak, whooshes on
blur transitions; exits are silent).

usage: python3 score.py <cues.json> <out.wav> [duration_s]
"""
import json
import sys

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
cues = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
DUR = float(sys.argv[3]) if len(sys.argv) > 3 else 56.0
N = int(DUR * SR)
rng = np.random.default_rng(1078)  # Hartsook


def hz(n):  # MIDI note to Hz
    return 440.0 * 2 ** ((n - 69) / 12)


def t_axis(n):
    return np.arange(n) / SR


def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def place(buf, x, t, gain=1.0):
    i = int(round(t * SR))
    if i < 0:
        x, i = x[-i:], 0
    j = min(len(buf), i + len(x))
    if j > i:
        buf[i:j] += x[: j - i] * gain


def smooth_env(points, n):
    """piecewise env from (t, value) points with raised-cosine segments"""
    tt = t_axis(n)
    env = np.zeros(n)
    pts = sorted(points)
    for (a, va), (b, vb) in zip(pts, pts[1:]):
        m = (tt >= a) & (tt < b)
        k = (tt[m] - a) / max(b - a, 1e-6)
        env[m] = va + (vb - va) * (0.5 - 0.5 * np.cos(np.pi * k))
    env[tt >= pts[-1][0]] = pts[-1][1]
    return env


# ---------------- harmony ----------------
D, F, A, Bb, C, G, E, Fs, Cs, B = 62, 65, 69, 70, 72, 67, 64, 66, 61, 71
CHORDS = [  # (start, end, notes)  pads voiced low-mid
    (-0.5, 3.4, [50, 57, 62, 65]),        # Dm
    (3.4, 6.05, [46, 53, 58, 62]),        # Bb
    (6.05, 8.8, [43, 50, 55, 58]),        # Gm
    (8.8, 11.35, [45, 52, 57, 61, 64]),   # A (tension)
    (12.3, 14.2, [46, 53, 58, 62, 65]),   # Bb add
    (14.2, 16.4, [41, 53, 57, 60]),       # F
    (16.4, 18.0, [46, 53, 58, 62]),       # Bb
    (18.0, 19.6, [41, 53, 57, 60, 65]),   # F
    (19.6, 21.2, [43, 50, 55, 58, 62]),   # Gm
    (21.6, 24.9, [38, 50, 57, 62, 66, 69]),   # D (dawn)
    (24.9, 27.4, [38, 50, 57, 62, 66, 69, 74]),
    (27.4, 30.1, [38, 50, 57, 62, 66]),   # D
    (30.1, 32.8, [37, 49, 57, 61, 64]),   # A/C#
    (32.8, 35.5, [35, 47, 54, 59, 62]),   # Bm
    (35.5, 38.0, [43, 50, 55, 59, 62]),   # G
    (38.0, 40.4, [43, 50, 55, 59, 62]),   # G
    (40.4, 42.5, [42, 50, 57, 62, 66]),   # D/F#
    (42.5, 44.6, [40, 52, 55, 59, 64]),   # Em
    (44.6, 46.8, [45, 52, 57, 61, 64]),   # A
    (46.8, 48.8, [43, 50, 55, 59, 62, 67]),  # G (lift)
    (48.8, 57.0, [38, 50, 57, 62, 66, 69, 74]),  # D home
]


def chord_at(t):
    for a, b, notes in CHORDS:
        if a <= t < b:
            return notes
    return [50, 57, 62]


def pad_voice(f, n, bright=1.0):
    tt = t_axis(n)
    x = np.zeros(n)
    for det in (-0.07, 0.0, 0.06):  # gently detuned choir-ish stack
        ff = f * 2 ** (det / 12)
        ph = 2 * np.pi * ff * tt + rng.uniform(0, 6.28)
        x += np.sin(ph) + 0.28 * np.sin(2 * ph) * bright + 0.12 * np.sin(3 * ph) * bright
    vib = 1 + 0.004 * np.sin(2 * np.pi * 0.21 * tt + rng.uniform(0, 6))
    return x * vib / 3


pad = np.zeros(N)
for a, b, notes in CHORDS:
    a0, b0 = max(a, 0), min(b, DUR)
    if b0 <= a0:
        continue
    xf = 0.9  # crossfade overlap so chords breathe into each other
    seg_n = int((b0 - a0 + xf) * SR)
    seg = np.zeros(seg_n)
    bright = 0.6 if a < 21.5 else 1.0
    for nt in notes:
        seg += pad_voice(hz(nt), seg_n, bright) * (0.9 if nt < 48 else 0.6)
    env = np.ones(seg_n)
    k = int(xf * SR)
    env[:k] = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, k))
    env[-k:] = 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, k))
    place(pad, seg * env, a0 - (xf / 2 if a0 > 0 else 0))
pad = lp(pad, 2600)

# Pad level over time: rises, cuts for the meaning pause, swells, drops out before dawn, opens up.
pad_env = smooth_env([
    (0, 0.55), (3.4, 0.6), (10.6, 0.72), (11.25, 0.0), (12.3, 0.0), (13.0, 0.55), (16.4, 0.62),
    (20.9, 0.7), (21.18, 0.0), (21.6, 0.0), (21.75, 0.9), (27.4, 0.72), (38.0, 0.8), (46.8, 0.95),
    (49.0, 0.85), (54.0, 0.6), (DUR, 0.0)], N)
pad *= pad_env

# Low drone on D (sub) through the dark half, then root support in the major half
tt = t_axis(N)
drone = 0.5 * np.sin(2 * np.pi * hz(38) * tt) + 0.2 * np.sin(2 * np.pi * hz(26) * tt)
drone *= smooth_env([(0, 0.6), (11.2, 0.6), (11.3, 0), (12.3, 0), (13.5, 0.4), (21.15, 0.45), (21.2, 0),
                     (21.6, 0), (22.5, 0.35), (49, 0.35), (DUR, 0)], N)


# ---------------- instruments ----------------
def pluck(f, dur=1.6, damp=0.996):
    """Karplus-Strong string, warm"""
    n = int(dur * SR)
    p = int(SR / f)
    buf = rng.uniform(-1, 1, p)
    buf = lp(np.concatenate([buf, buf]), 3500)[:p]
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = damp * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out * np.exp(-t_axis(n) * 1.2)


def bell(f, dur=3.5):
    n = int(dur * SR)
    tt = t_axis(n)
    mod = 2.2 * np.exp(-tt * 2.5) * np.sin(2 * np.pi * f * 3.5 * tt)
    x = np.sin(2 * np.pi * f * tt + mod) * np.exp(-tt * 1.4)
    x += 0.25 * np.sin(2 * np.pi * f * 2.0 * tt) * np.exp(-tt * 2.6)
    att = np.minimum(1, tt / 0.004)
    return x * att


def whoosh(peak_at=0.32, dur=0.6):
    n = int(dur * SR)
    tt = t_axis(n)
    nz = rng.normal(0, 1, n)
    k = int(peak_at * SR)
    env = np.concatenate([np.linspace(0, 1, k) ** 2.2, np.exp(-np.linspace(0, 5, n - k))])
    # sweep: blend a low band into a higher band across the peak
    lo, hi = bp(nz, 180, 900), bp(nz, 700, 4200)
    mix = np.clip(tt / dur, 0, 1)
    return (lo * (1 - mix) + 0.6 * hi * mix) * env, peak_at


def tick():
    n = int(0.09 * SR)
    tt = t_axis(n)
    x = 0.6 * np.sin(2 * np.pi * 2350 * tt) * np.exp(-tt * 75) + 0.4 * hp(rng.normal(0, 1, n), 3000) * np.exp(-tt * 140)
    return x


def thump():
    n = int(0.5 * SR)
    tt = t_axis(n)
    f = 92 * np.exp(-tt * 9) + 46
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7) * np.minimum(1, tt / 0.003)


def swell(dur=0.45):
    n = int(dur * SR)
    x = bp(rng.normal(0, 1, n), 1500, 7000) * np.linspace(0, 1, n) ** 2.5
    return x


def riser(dur):
    n = int(dur * SR)
    tt = t_axis(n)
    k = tt / dur
    x = np.zeros(n)
    for f0 in (hz(62), hz(69), hz(74)):
        f = f0 * (1 + 0.5 * k ** 2)
        x += np.sin(2 * np.pi * np.cumsum(f) / SR)
    x = x / 3 * k ** 2.2 + 0.5 * bp(rng.normal(0, 1, n), 2000, 9000) * k ** 3
    return x


# ---------------- arrange SFX from the cue sheet ----------------
sfx = np.zeros(N)
music_fx = np.zeros(N)
last_thump = -9
for c in cues:
    t = c['t']
    if t < 0 or t > DUR:
        continue
    ty = c['type']
    tones = [n for n in chord_at(t) if n >= 57] or [62]
    if ty == 'whoosh':
        x, pk = whoosh()
        place(sfx, x, t - pk, 0.16 * c.get('gain', 1))
    elif ty == 'tick':
        place(sfx, tick(), t - 0.004, 0.07)
    elif ty == 'pluck':
        nt = tones[(c.get('i', 0) * 2) % len(tones)] + 12
        place(music_fx, pluck(hz(nt), 1.4), t - 0.002, 0.10)
    elif ty == 'hero':
        sw = swell(0.42)
        place(sfx, sw, t - 0.42, 0.10)
        if t - last_thump > 0.3:
            place(sfx, thump(), t, 0.30)
            last_thump = t
        place(music_fx, bell(hz(tones[-1] + 12), 2.8), t, 0.06)
    elif ty == 'bell':
        place(music_fx, bell(hz(74), 4.0), t, 0.12)
        place(music_fx, bell(hz(81), 4.0), t + 0.03, 0.06)
    elif ty == 'reveal':
        for i, nt in enumerate((74, 78, 81, 86)):
            place(music_fx, bell(hz(nt), 4.5), t + i * 0.045, 0.07)
        place(sfx, swell(0.6), t - 0.6, 0.08)

# the turn into dawn: riser 19.9 -> 21.15, dropout, then the bloom at 21.6
place(sfx, riser(1.25), 19.9, 0.12)
for i, nt in enumerate((50, 57, 62, 66, 69, 74)):
    place(music_fx, bell(hz(nt + 12), 5.0), 21.62 + i * 0.06, 0.05)
place(sfx, thump(), 21.6, 0.22)

# gentle pulse under proof + future pace: plucked chord tones on eighths at 84 bpm
step = 60 / 84 / 2
t = 27.6
i = 0
while t < 48.6:
    notes = [n for n in chord_at(t) if 50 <= n <= 69]
    nt = notes[i % len(notes)] + 12
    lvl = 0.035 + 0.02 * min(1, max(0, (t - 38) / 8))
    place(music_fx, pluck(hz(nt), 0.9, 0.994), t, lvl * (1.25 if i % 4 == 0 else 1))
    t += step
    i += 1

# room tone (never digital zero), very low
room = lp(rng.normal(0, 1, N), 500) * 0.0025

# ---------------- reverb + mix ----------------
ir_n = int(3.2 * SR)
ir = rng.normal(0, 1, ir_n) * np.exp(-t_axis(ir_n) * 2.1)
ir = lp(ir, 5000)
ir /= np.sqrt(np.sum(ir ** 2))


def verb(x, wet):
    return x + wet * fftconvolve(x, ir)[: len(x)]


music = verb(pad * 0.22 + drone * 0.12, 0.35) + verb(music_fx, 0.6)
mix = music + verb(sfx, 0.25) + room
mix = hp(mix, 28)
st = np.stack([mix, mix], 1)
# a touch of width on the music bus
d = int(0.011 * SR)
st[d:, 1] = 0.85 * st[d:, 1] + 0.15 * music[:-d] * 0.5
st /= np.max(np.abs(st)) * 1.05
fade = int(1.2 * SR)
st[-fade:] *= np.linspace(1, 0, fade)[:, None]
import wave
pcm = (np.clip(st, -1, 1) * 32767).astype('<i2')
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', OUT, len(cues), 'cues')
