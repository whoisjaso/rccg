"""v3 mix: ElevenLabs VO (when present) + Pastor Joel Uzoma's own songs ("Tell Me", 2023; instrumental stems) +
SFX from the video standard's tagged library (Kenney CC0 + house synth, posted-OK), placed by each file's catalog
sync point (sfx-library/AGENTS-SFX.md §5) and levelled against the VO peak; heartbeat/flatline are synthesized
(the standard's fallback: the library has no heartbeat). Never the same sound twice in a row (§6).

usage: python3 tools/mix.py <cues.json> <out.wav> [--vo work/vo/vo.wav]
"""
import argparse, json, os
import numpy as np, soundfile as sf, librosa
from scipy.signal import butter, sosfilt, fftconvolve

ap = argparse.ArgumentParser(); ap.add_argument('cues'); ap.add_argument('out'); ap.add_argument('--vo', default=None)
a = ap.parse_args()
SR = 48000
TL = json.load(open('work/timeline.json')); DUR = TL['dur']; N = int(DUR * SR)
S0 = lambda b: TL['lines'][b]['on'][0]; E = lambda b: TL['lines'][b]['e']; Wd = lambda b, i: TL['lines'][b]['on'][i]
CAT = json.load(open('sfx_used.json')); SFXDIR = 'work/sfx/'
SONGS = '../work/songs/stems/'
rng = np.random.default_rng(1078)
db = lambda g: 10 ** (g / 20)
lp = lambda x, f: sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x, axis=0)
hp = lambda x, f: sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x, axis=0)


def load(f, mono=False):
    y, sr = librosa.load(f, sr=SR, mono=mono)
    return y if mono else (y.T if y.ndim > 1 else np.stack([y, y], 1))


def env(points):
    tt = np.arange(N) / SR; out = np.zeros(N); pts = sorted(points)
    for (t0, v0), (t1, v1) in zip(pts, pts[1:]):
        m = (tt >= t0) & (tt < t1); k = (tt[m] - t0) / max(t1 - t0, 1e-6); out[m] = v0 + (v1 - v0) * (0.5 - 0.5 * np.cos(np.pi * k))
    out[tt >= pts[-1][0]] = pts[-1][1]; out[tt < pts[0][0]] = pts[0][1]; return out


def place(buf, x, t, g=1.0):
    i = int(round(t * SR))
    if i < 0: x, i = x[-i:], 0
    j = min(len(buf), i + len(x))
    if j > i: buf[i:j] += x[: j - i] * g


# ---------------- voice ----------------
if a.vo and os.path.exists(a.vo):
    vo = load(a.vo, mono=True); vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]
else:
    vo = np.zeros(N)
VO_PEAK = 10 ** (-3 / 20)           # VO is normalized so its peak sits at -3 dBFS; SFX levels are set against it
if np.abs(vo).max() > 0: vo *= VO_PEAK / np.abs(vo).max()
hop = 240; dec = np.array([np.abs(vo[i:i + hop]).max() for i in range(0, N, hop)]); fol = np.zeros_like(dec); v = 0.0
for i, x in enumerate(dec):
    c = np.exp(-hop / (0.005 * SR)) if x > v else np.exp(-hop / (0.12 * SR)); v = c * v + (1 - c) * x; fol[i] = v
voice_on = np.clip(np.repeat(fol, hop)[:N] / db(-24), 0, 1)

# ---------------- SFX from the library ----------------
ROLE = {   # role -> rotation of library files (variety rule), level re VO peak (dB)
    'whoosh': (['whoosh-swipe/orig_whoosh_long.wav', 'whoosh-swipe/orig_whoosh_soft_down.wav', 'whoosh-swipe/orig_swipe_short.wav'], -18),
    'whoosh_up': (['whoosh-swipe/orig_whoosh_soft_up.wav'], -16),
    'hero': (['tick-click/orig_tick_word_1.wav', 'tick-click/orig_tick_word_2.wav', 'tick-click/orig_tick_word_3.wav'], -21),
    'script': (['_sources/kenney/impact-sounds/Audio/impactGlass_light_000.ogg', '_sources/kenney/impact-sounds/Audio/impactGlass_light_001.ogg', '_sources/kenney/impact-sounds/Audio/impactGlass_light_002.ogg'], -17),
    'stamp': (['_sources/kenney/impact-sounds/Audio/impactPunch_medium_000.ogg', '_sources/kenney/impact-sounds/Audio/impactPunch_heavy_000.ogg'], -15),
    'slam': (['hit-boom/orig_impact_cinematic.wav'], -12),          # the one energy-5 hit ("HEAR ME")
    'slam_soft': (['hit-boom/orig_impact_boom.wav'], -15),
    'land': (['hit-boom/orig_impact_boom.wav'], -16),
    'clock': (['tick-click/orig_tick_word_2.wav', 'tick-click/orig_tick_word_3.wav'], -23),
    'swipe': (['whoosh-swipe/orig_swipe_short.wav'], -18),
    'key': (['typewriter/orig_typewriter_key_1.wav', 'typewriter/orig_typewriter_key_2.wav', 'typewriter/orig_typewriter_key_3.wav', 'typewriter/orig_typewriter_key_4.wav'], -24),
    'glitch': (['glitch/orig_glitch_stab_1.wav'], -18),
    'crack': (['_sources/kenney/impact-sounds/Audio/impactGlass_heavy_000.ogg'], -14),
    'rise_soft': (['riser/orig_riser_1s_noise.wav'], -20),
    'bell': (['_sources/kenney/interface-sounds/Audio/glass_004.ogg'], -16),
    'reveal': (['whoosh-swipe/orig_shimmer_chars.wav'], -18),
    'chime': (['_sources/kenney/impact-sounds/Audio/impactBell_heavy_000.ogg'], -17),
    'tick': (['tick-click/orig_tick_word_1.wav', 'tick-click/orig_tick_word_3.wav'], -20),
    'ding': (['notification-ios-style/orig_notif_ding_single.wav'], -17),
    'door': (['_sources/kenney/interface-sounds/Audio/open_001.ogg'], -19),
    'cta': (['_sources/kenney/impact-sounds/Audio/impactGlass_medium_000.ogg'], -15),
}
cache = {}
def clip(f):
    if f not in cache:
        y = load(SFXDIR + f, mono=True); y = hp(y, 60); pk = np.abs(y).max() + 1e-9
        cache[f] = y / pk     # peak-normalized: the gain below sets its peak re the VO peak
    return cache[f]

def heartbeat():
    n = int(0.62 * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for t0, f0, g in ((0.0, 58, 1.0), (0.21, 52, 0.75)):           # lub ... dub
        m = t >= t0; tt = t[m] - t0; y[m] += g * np.sin(2 * np.pi * np.cumsum(f0 * (1 + 0.6 * np.exp(-tt * 40))) / SR) * np.exp(-tt * 16) * np.minimum(1, tt / 0.004)
    return lp(y, 400) / np.abs(y).max()

def flatline(d=2.4):
    n = int(d * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 988 * t) * np.minimum(1, t / 0.02) * np.minimum(1, (d - t) / 0.6) * 0.6

cues = json.load(open(a.cues)); sfx = np.zeros(N); last_group = None; rot = {}; log = []
for c in cues:
    t, role = c['t'], c['role']
    if t < 0 or t > DUR: continue
    if role == 'heartbeat': place(sfx, heartbeat(), t - 0.004, VO_PEAK * db(-13) * c.get('gain', 1)); log.append((t, role, 'synth')); continue
    if role == 'flatline': place(sfx, flatline(), t, VO_PEAK * db(-26)); log.append((t, role, 'synth')); continue
    if role == 'riser_to':
        f = 'riser/orig_riser_2s.wav'; y = clip(f); sync = CAT[f]['sync_ms'] / 1000
        place(sfx, y, c['at'] - sync, VO_PEAK * db(-19)); log.append((c['at'], role, f)); continue
    if role not in ROLE: continue
    files, lvl = ROLE[role]; k = rot.get(role, 0); f = files[k % len(files)]
    if CAT[f]['sound_group'] == last_group and len(files) > 1: k += 1; f = files[k % len(files)]
    rot[role] = k + 1; last_group = CAT[f]['sound_group']
    y = clip(f); sync = CAT[f]['sync_ms'] / 1000
    hum = rng.uniform(-1, 1) if role in ('key', 'hero', 'clock', 'tick') else 0   # ±1 dB humanising on per-unit cues
    if role == 'crack': y = y * np.linspace(1, 0, len(y)) ** 0.5   # glass tail faded before the next cut
    place(sfx, y, t - sync + (rng.uniform(-0.012, 0.012) if role == 'key' else 0), VO_PEAK * db(lvl + hum))
    log.append((round(t, 3), role, f))
# SFX bus: sidechain duck by the voice (about 2.5 dB on syllables)
sfx = sfx * db(-2.5 * voice_on)

# ---------------- music: Pastor Joel's songs ----------------
A1 = S0('b07') - 0.15          # dark act ends on "But hear me"
A2 = S0('b18') - 0.35          # future pace starts
tail0 = E('b24') + 0.25
music = np.zeros((N, 2))
s1 = load(SONGS + '07-Jesus-Is-Lord.inst.wav'); s2 = load(SONGS + '04-Tell-Me.inst.wav')
s3i = load(SONGS + '01-I-Know-Jesus.inst.wav'); s3v = load(SONGS + '01-I-Know-Jesus.vocals.wav')
def fit(y, L):
    need = int(L * SR)
    if len(y) >= need: return y[:need]
    out = y.copy(); k = int(1.2 * SR)
    while len(out) < need:
        f = np.linspace(0, 1, k)[:, None]; seg = y[int(2 * SR):]
        out[-k:] = out[-k:] * (1 - f) + seg[:k] * f; out = np.concatenate([out, seg[k:]])
    return out[:need]
ir = rng.normal(0, 1, int(2.6 * SR)) * np.exp(-np.arange(int(2.6 * SR)) / SR * 2.2); ir = lp(ir, 3500); ir /= np.sqrt((ir ** 2).sum())
b1 = lp(fit(s1, A1 + 1.0), 1500); b1 = b1 + 0.4 * np.stack([fftconvolve(b1[:, c], ir)[: len(b1)] for c in (0, 1)], 1)
g1 = env([(0, 1), (E('b06') - 0.3, 1), (E('b06') + 0.3, 0.0), (A1 + 1, 0.0)])   # out for the flatline / meaning pause
music[: len(b1)] += b1 * g1[: len(b1), None]
i0 = int((A1 - 0.1) * SR); b2 = fit(s2, A2 - A1 + 1.2)
g2 = env([(A1 - 0.1, 0), (A1 + 0.25, 1), (A2 - 0.2, 1), (A2 + 0.8, 0)])[i0:i0 + len(b2)]
music[i0:i0 + len(b2)] += b2[: len(g2)] * g2[:, None]
pre = tail0 - (A2 - 0.3)
ve = librosa.feature.rms(y=s3v.mean(1), frame_length=2048, hop_length=480)[0]; vdb = 20 * np.log10(ve + 1e-9)
ons = [i * 480 / SR for i in range(8, len(vdb)) if vdb[i] > -32 and vdb[i - 8:i].max() < -34]
cand = [p for p in ons if p >= pre + 0.2 and p - pre + (DUR - tail0) <= 29.9]
off = max(0.0, (cand[0] if cand else pre) - pre) if pre < 29 else 0.0
k0 = int((A2 - 0.3) * SR); k1 = min(N, k0 + len(s3i) - int(off * SR))
g3 = env([(A2 - 0.3, 0), (A2 + 0.8, 1), (DUR - 1.4, 1), (DUR - 0.05, 0)])[k0:k1]
gv = env([(0, 0), (tail0 - 0.15, 0), (tail0 + 0.35, 1), (DUR - 1.4, 1), (DUR - 0.05, 0)])[k0:k1]
o = int(off * SR); music[k0:k1] += s3i[o:o + (k1 - k0)] * g3[:, None] + s3v[o:o + (k1 - k0)] * (gv * db(1.5))[:, None]
# bed: about -19 dB under the voice while it talks, 3-5 dB duck on syllables, fuller in gaps and on the end card
ref = np.sqrt(np.mean(vo[np.abs(vo) > db(-40)] ** 2)) if np.abs(vo).max() > 0 else VO_PEAK * db(-15)
base = ref / (np.sqrt(np.mean(music[: int(A2 * SR)] ** 2)) + 1e-9) * db(-17)
music *= (base * db(-4.5 * voice_on) * env([(0, 1), (tail0 - 0.2, 1), (tail0 + 0.6, db(7)), (DUR, db(7))]))[:, None]

mix = music + np.stack([vo, vo], 1) + np.stack([sfx, sfx], 1)
mix = hp(mix, 30); f = int(1.0 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
pk = np.abs(mix).max() * 1.12; mix /= pk
sf.write(a.out, mix.astype(np.float32), SR, subtype='PCM_24')
sf.write(a.out.replace('.wav', '.vo_only.wav'), (np.stack([vo, vo], 1) / pk).astype(np.float32), SR, subtype='PCM_24')
sf.write(a.out.replace('.wav', '.music_only.wav'), (music / pk).astype(np.float32), SR, subtype='PCM_24')
json.dump(log, open(a.out.replace('.wav', '.sfxlog.json'), 'w'), indent=0)
print(f'wrote {a.out} {DUR:.2f}s, {len(log)} SFX cues, Act 3 offset {off:.2f}s, voice {"yes" if np.abs(vo).max() > 0 else "NO (draft)"}')
