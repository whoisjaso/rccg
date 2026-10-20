"""Final mix for the voice cut: Orpheus VO (Liquid Motion voice chain) over Pastor Joel Uzoma's own songs
("Tell Me" album, 2023), as instrumental stems (demucs htdemucs) ducked under the voice, then his sung vocal
rising on the end card. SFX follow the film's exported cue sheet (signatures on the visual peak, exits silent).

usage: python3 mix.py <cues.json> <out.wav>
"""
import json, subprocess, sys
import numpy as np, soundfile as sf, librosa
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
TL = json.load(open('vo/timeline.json'))
cues = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
DUR = TL['dur']; N = int(DUR * SR)
S0 = lambda i: TL['lines'][i]['on'][0]
E = lambda i: TL['lines'][i]['e']
rng = np.random.default_rng(78)
STEMS = 'work/songs/stems/'
lp = lambda x, f: sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x, axis=0)
hp = lambda x, f: sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x, axis=0)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x, axis=0)
db = lambda g: 10 ** (g / 20)


def load(f):
    y, sr = sf.read(f, dtype='float32', always_2d=True)
    return librosa.resample(y.T, orig_sr=sr, target_sr=SR).T


def smooth_env(points):
    tt = np.arange(N) / SR; env = np.zeros(N); pts = sorted(points)
    for (a, va), (b, vb) in zip(pts, pts[1:]):
        m = (tt >= a) & (tt < b); k = (tt[m] - a) / max(b - a, 1e-6)
        env[m] = va + (vb - va) * (0.5 - 0.5 * np.cos(np.pi * k))
    env[tt >= pts[-1][0]] = pts[-1][1]; env[tt < pts[0][0]] = pts[0][1]
    return env


def place(buf, x, t, g=1.0):
    i = int(round(t * SR))
    if i < 0: x, i = x[-i:], 0
    j = min(len(buf), i + len(x))
    if j > i: buf[i:j] += x[: j - i] * g


def loop_to(y, length, xf=1.2):
    """extend a stem to length by looping on a beat-aligned bar with a crossfade"""
    need = int(length * SR)
    if len(y) >= need: return y[:need]
    tempo, beats = librosa.beat.beat_track(y=y.mean(1), sr=SR, units='samples')
    out = y.copy(); k = int(xf * SR)
    loop_start = beats[min(4, len(beats) - 1)] if len(beats) else 0
    while len(out) < need:
        seg = y[loop_start:]
        fade = np.linspace(0, 1, k)[:, None]
        out[-k:] = out[-k:] * (1 - fade) + seg[:k] * fade
        out = np.concatenate([out, seg[k:]])
    return out[:need]


# ---------------- voice ----------------
vo_chain = ('highpass=f=80:poles=2,highpass=f=80:poles=2,equalizer=f=280:t=q:w=1:g=-2.5,equalizer=f=550:t=q:w=1:g=-1.5,'
            'equalizer=f=3400:t=q:w=1:g=2.5,highshelf=f=10000:g=1,deesser=i=0.5,'
            'acompressor=threshold=-24dB:ratio=3:attack=6:release=90:knee=6,aresample=48000')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'vo/vo_raw.wav', '-af', vo_chain, '-ar', '48000', '-ac', '1', 'vo/vo_proc.wav'], check=True)
vo, _ = sf.read('vo/vo_proc.wav', dtype='float32'); vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]
vo *= db(-3) / (np.percentile(np.abs(vo), 99.9) + 1e-9)  # VO peak ~ -3 dBFS before master

# VO activity envelope for ducking (50 ms attack, 300 ms release)
a = np.abs(vo); env = np.zeros(N); at, rl = np.exp(-1 / (0.05 * SR)), np.exp(-1 / (0.3 * SR))
# vectorised-ish peak follower on a decimated grid
hop = 240; dec = np.array([a[i:i + hop].max() for i in range(0, N, hop)]); fol = np.zeros_like(dec); v = 0
for i, x in enumerate(dec):
    c = np.exp(-hop / (0.05 * SR)) if x > v else np.exp(-hop / (0.3 * SR)); v = c * v + (1 - c) * x; fol[i] = v
voice_on = np.clip(np.repeat(fol, hop)[:N] / (db(-24)), 0, 1)  # 1 when voice is clearly present
duck = db(-4.5 * voice_on)

# ---------------- beds: Pastor Joel's songs ----------------
A1_end = S0('dawn') - 0.7             # dark act ends as the dawn starts rising
A2_end = S0('picture') - 0.35         # future pace starts
tail0 = E('where') + 0.25             # VO done: his voice comes up
music = np.zeros((N, 2), np.float32)

# Act 1: "Jesus Is Lord", instruments only, darkened (low-passed, wider room), dips out for the meaning pause
s1 = load(STEMS + '07-Jesus-Is-Lord.inst.wav')
b1 = loop_to(s1, A1_end + 1.5)
b1 = lp(b1, 1700) * 0.9
ir = rng.normal(0, 1, int(2.4 * SR)) * np.exp(-np.arange(int(2.4 * SR)) / SR * 2.4); ir = lp(ir, 4000); ir /= np.sqrt((ir ** 2).sum())
b1 = b1 + 0.35 * np.stack([fftconvolve(b1[:, c], ir)[: len(b1)] for c in (0, 1)], 1)
g1 = smooth_env([(0, 1), (E('ache') - 0.2, 1), (E('ache') + 0.25, 0.12), (S0('turn') - 0.1, 0.12), (S0('turn') + 0.6, 0.9),
                 (E('verse') - 0.4, 1.0), (E('verse') + 0.4, 0.0), (A1_end + 1.5, 0.0)])
music[: len(b1)] += b1 * g1[: len(b1), None]

# Act 2: "Tell Me" (the title track), instruments, opening with the dawn
s2 = load(STEMS + '04-Tell-Me.inst.wav')
L2 = A2_end - A1_end + 1.0
b2 = loop_to(s2, L2)
i0 = int(A1_end * SR); seg = music[i0:i0 + len(b2)]
g2 = smooth_env([(A1_end, 0), (A1_end + 1.8, 1), (A2_end - 0.3, 1), (A2_end + 0.7, 0)])[i0:i0 + len(b2)]
seg += b2[: len(seg)] * g2[: len(seg), None]

# Act 3: "I Know Jesus": instruments under the future pace + CTA, then the full song (his voice) on the end card.
s3i = load(STEMS + '01-I-Know-Jesus.inst.wav'); s3v = load(STEMS + '01-I-Know-Jesus.vocals.wav')
pre = tail0 - (A2_end - 0.3)
ve = librosa.feature.rms(y=s3v.mean(1), frame_length=2048, hop_length=480)[0]; vdb = 20 * np.log10(ve + 1e-9)
on = [i * 480 / SR for i in range(8, len(vdb)) if vdb[i] > -32 and vdb[i - 8:i].max() < -34]  # phrase starts after a breath
cands = [p for p in on if p >= pre + 0.2 and p - pre + (DUR - tail0) <= 29.9]
p = cands[0] if cands else min(29.9 - (DUR - (A2_end - 0.3)), max(pre, 0))
off = max(0.0, p - pre)
print(f"Act 3 offset {off:.2f}s into 'I Know Jesus', his vocal enters at {p:.2f}s of the clip (film {tail0:.2f}s)")
k0 = int((A2_end - 0.3) * SR); k1 = min(N, k0 + len(s3i) - int(off * SR))
inst = s3i[int(off * SR): int(off * SR) + (k1 - k0)]; vox = s3v[int(off * SR): int(off * SR) + (k1 - k0)]
g3 = smooth_env([(A2_end - 0.3, 0), (A2_end + 0.8, 1), (DUR - 1.4, 1), (DUR - 0.05, 0)])[k0:k1]
gv = smooth_env([(0, 0), (tail0 - 0.15, 0), (tail0 + 0.35, 1), (DUR - 1.4, 1), (DUR - 0.05, 0)])[k0:k1]
music[k0:k1] += inst * g3[:, None] + vox * (gv * db(1.5))[:, None]

# bed level: about -19 dB under the voice while it talks, 3-5 dB duck on syllables, fuller in the gaps and on the end card
vo_rms = np.sqrt(np.mean(vo[np.abs(vo) > db(-40)] ** 2))
m_rms = np.sqrt(np.mean(music[: int(A2_end * SR)] ** 2)) + 1e-9
base = vo_rms / m_rms * db(-17)
lift = smooth_env([(0, 1), (tail0 - 0.2, 1), (tail0 + 0.6, db(7)), (DUR, db(7))])
music *= (base * duck * lift)[:, None]

# ---------------- SFX (synthesized, original) ----------------
def tick():
    n = int(0.09 * SR); t = np.arange(n) / SR
    return 0.6 * np.sin(2 * np.pi * 2350 * t) * np.exp(-t * 75) + 0.4 * hp(rng.normal(0, 1, n), 3000) * np.exp(-t * 140)
def thump():
    n = int(0.5 * SR); t = np.arange(n) / SR; f = 92 * np.exp(-t * 9) + 46
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * np.minimum(1, t / 0.003)
def swell(d=0.42):
    n = int(d * SR); return bp(rng.normal(0, 1, n), 1500, 7000) * np.linspace(0, 1, n) ** 2.5
def bell(f, d=3.0):
    n = int(d * SR); t = np.arange(n) / SR; mod = 2.2 * np.exp(-t * 2.5) * np.sin(2 * np.pi * f * 3.5 * t)
    return (np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 1.4) + 0.25 * np.sin(4 * np.pi * f * t) * np.exp(-t * 2.6)) * np.minimum(1, t / 0.004)
def whoosh(pk=0.32, d=0.6):
    n = int(d * SR); k = int(pk * SR); nz = rng.normal(0, 1, n)
    env = np.concatenate([np.linspace(0, 1, k) ** 2.2, np.exp(-np.linspace(0, 5, n - k))]); mix = np.linspace(0, 1, n)
    return (bp(nz, 180, 900) * (1 - mix) + 0.6 * bp(nz, 700, 4200) * mix) * env, pk
def riser(d):
    n = int(d * SR); t = np.arange(n) / SR; k = t / d; x = np.zeros(n)
    for f0 in (293.66, 392.0, 587.33):  # D G D, sits in G with the songs
        x += np.sin(2 * np.pi * np.cumsum(f0 * (1 + 0.5 * k ** 2)) / SR)
    return x / 3 * k ** 2.2 + 0.5 * bp(rng.normal(0, 1, n), 2000, 9000) * k ** 3
G = [392.0, 493.88, 587.33, 783.99]  # G major bells, in key with the album
sfx = np.zeros(N); last = -9
for c in cues:
    t, ty = c['t'], c['type']
    if t < 0 or t > DUR: continue
    if ty == 'whoosh': x, pk = whoosh(); place(sfx, x, t - pk, 0.12 * c.get('gain', 1))
    elif ty == 'tick': place(sfx, tick(), t - 0.004, 0.05)
    elif ty == 'pluck': place(sfx, bell(G[c.get('i', 0) % 4] * 2, 1.2), t, 0.025)
    elif ty == 'hero':
        place(sfx, swell(), t - 0.42, 0.07)
        if t - last > 0.3: place(sfx, thump(), t, 0.22); last = t
    elif ty == 'bell': place(sfx, bell(G[2]), t, 0.08); place(sfx, bell(G[3]), t + 0.03, 0.04)
    elif ty == 'reveal':
        for i, f in enumerate(G): place(sfx, bell(f * 2, 4.0), t + i * 0.045, 0.045)
place(sfx, riser(1.3), E('verse') - 0.1, 0.09)            # rises out of the scripture...
place(sfx, thump(), S0('dawn') - 0.7, 0.16)                 # ...lands on the dawn
sfx *= duck * db(-1)

# ---------------- sum ----------------
mix = music + np.stack([vo, vo], 1) + np.stack([sfx, sfx], 1)
mix = hp(mix, 30)
fade = int(1.0 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix /= np.abs(mix).max() * 1.12
sf.write(OUT, mix.astype(np.float32), SR, subtype='PCM_24')
peak = np.abs(music + np.stack([vo, vo], 1) + np.stack([sfx, sfx], 1)).max() * 1.12
sf.write(OUT.replace('.wav', '.vo_only.wav'), (np.stack([vo, vo], 1) / peak).astype(np.float32), SR, subtype='PCM_24')
sf.write(OUT.replace('.wav', '.music_only.wav'), (music / peak).astype(np.float32), SR, subtype='PCM_24')
print('wrote', OUT, f'{DUR:.2f}s')
