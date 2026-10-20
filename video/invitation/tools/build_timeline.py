"""Pick the best Orpheus take per line, lay the lines out with meaning pauses, then lock every script word
to its spoken frame (whisper word starts refined on the voice envelope by the skill's word_sync.py, 60 fps grid).

usage: python3 build_timeline.py   (reads vo/script.json + vo/takes, writes vo/vo_raw.wav, vo/words*.json, vo/timeline.json)
"""
import difflib, glob, json, os, re, subprocess, sys
import numpy as np, soundfile as sf, librosa
from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__)) + '/../'
os.chdir(HERE)
SKILL = '/root/.claude/skills/synced/eef816e8-d115-4a05-bc84-c2f8253c3700_ccc48eee-1e53-44b4-84ac-49e9dcd5ee77/video-editing-standard'
SR = 48000
S = json.load(open('vo/script.json'))
# pause AFTER each line (s): tight inside the burden run, meaning pauses at the turn and before the dawn
GAP = dict(hook=0.55, b1=0.3, b2=0.3, b3=0.3, b4=0.3, b5=0.45, ache=1.15, turn=0.3, turn2=0.75, verse=1.0, dawn=0.45,
           name=0.5, home=0.45, pastors=0.4, family=0.75, picture=0.35, door=0.4, song=0.4, sit=0.5, bring=0.85, come=0.45, where=0.0)
TAIL = 4.6  # end card holds while Pastor Joel sings
START = 0.02
asr = WhisperModel('small.en', device='cpu', compute_type='float32')
norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
NUM = {'1995': ['nineteen', 'ninety', 'five'], '1030': ['ten', 'thirty'], 'rccg': ['r', 'c', 'c', 'g'], 'rccgdayspring': ['r', 'c', 'c', 'g', 'dayspring'],
       'ccgdayspring': ['c', 'c', 'g', 'dayspring'], 'dayspring': ['dayspring']}


def toks(text):
    out = []
    for w in text.split():
        n = norm(w)
        out += NUM.get(n, [n]) if n else []
    return out


def transcribe(y16):
    segs, _ = asr.transcribe(y16, word_timestamps=True, beam_size=5, language='en')
    return [dict(w=w.word.strip(), s=w.start, e=w.end, p=w.probability) for s in segs for w in s.words]


def tighten(y, sr, keep=0.36, longest=0.5):
    """dead air inside a take: any silence longer than `longest` s is cut down to `keep` s (meaning pauses keep more)"""
    e = librosa.feature.rms(y=y, frame_length=int(0.02 * sr), hop_length=int(0.01 * sr))[0]
    quiet = 20 * np.log10(e + 1e-9) < -42
    out, i, hop = [], 0, int(0.01 * sr); runs = []
    k = 0
    while k < len(quiet):
        if quiet[k]:
            j = k
            while j < len(quiet) and quiet[j]: j += 1
            if (j - k) * 0.01 > longest and k > 0 and j < len(quiet): runs.append((k * hop, j * hop))
            k = j
        else: k += 1
    if not runs: return y
    f = int(0.015 * sr); segs = []; last = 0
    for a, b in runs:
        mid = (a + b) // 2; half = int(keep * sr / 2)
        segs.append(y[last:mid - half]); last = mid + half
    segs.append(y[last:])
    out = segs[0]
    for sg in segs[1:]:
        if len(out) > f and len(sg) > f:
            fade = np.linspace(0, 1, f)
            out = np.concatenate([out[:-f], out[-f:] * (1 - fade) + sg[:f] * fade, sg[f:]])
        else: out = np.concatenate([out, sg])
    return out


TEMPO = 1.07


def stretch(y, sr):
    """rubberband time-stretch (formant/pitch preserved) for a slightly brisker read"""
    import tempfile
    with tempfile.TemporaryDirectory() as d:
        sf.write(f'{d}/a.wav', y, sr)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{d}/a.wav', '-af', f'rubberband=tempo={TEMPO}:pitchq=quality:transients=smooth', f'{d}/b.wav'], check=True)
        return sf.read(f'{d}/b.wav', dtype='float32')[0]


def trim(y, sr):
    # speech onset/offset relative to the take's own peak (breaths and room noise sit > 30 dB below it)
    hop = int(0.005 * sr)
    e = librosa.feature.rms(y=y, frame_length=int(0.02 * sr), hop_length=hop, center=True)[0]
    edb = 20 * np.log10(e + 1e-9); thr = edb.max() - 24
    on = np.where(edb > thr)[0]
    # sustained: first frame above threshold that stays above (thr - 6) for 40 ms
    good = [k for k in on if np.all(edb[k:k + 8] > thr - 6)]
    idx = np.array([good[0] * hop, on[-1] * hop]) if good else np.array([0, len(y) - 1])
    if not len(idx): return y
    a, b = max(0, idx[0] - int(0.05 * sr)), min(len(y), idx[-1] + int(0.16 * sr))
    y = y[a:b].copy()
    f = int(0.012 * sr); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    return y


# 1. choose takes
choice = {}
for line in S['lines']:
    want = toks(line['text'])
    best = None
    for f in sorted(glob.glob(f"vo/takes/{line['id']}_t*.wav")):
        y, sr = sf.read(f, dtype='float32')
        keep = 0.6 if '...' in line['text'] else 0.36
        y48 = librosa.resample(stretch(tighten(trim(y, sr), sr, keep=keep), sr), orig_sr=sr, target_sr=SR)
        words = transcribe(librosa.resample(y48, orig_sr=SR, target_sr=16000))
        got = [t for w in words for t in toks(w['w'])]
        match = difflib.SequenceMatcher(None, want, got).ratio()
        conf = float(np.mean([w['p'] for w in words])) if words else 0
        dur = len(y48) / SR
        expect = 0.33 * len(want) + 0.4
        sane = 0.5 * expect < dur < 2.2 * expect
        score = match * 2 + conf + (0 if sane else -5)
        print(f"{f:28s} match {match:.2f} conf {conf:.2f} dur {dur:5.2f}s  | {' '.join(w['w'] for w in words)}")
        if best is None or score > best[0]: best = (score, f, y48, match)
    if best is None: sys.exit(f"no take for {line['id']}")
    if best[3] < 0.85: print(f"  !! {line['id']} best take only matches {best[3]:.2f}")
    choice[line['id']] = best

# 2. lay out
t = START; parts = []; spans = {}
for line in S['lines']:
    y = choice[line['id']][2]
    spans[line['id']] = [t, t + len(y) / SR]
    parts.append((t, y)); t += len(y) / SR + GAP[line['id']]
DUR = round((t + TAIL) * 60) / 60
vo = np.zeros(int(DUR * SR) + SR, np.float32)
for a, y in parts:
    i = int(round(a * SR)); vo[i:i + len(y)] += y
vo = vo[:int(DUR * SR)]
sf.write('vo/vo_raw.wav', vo, SR)

# 3. words on the assembled track, refined with the skill's word_sync.py
words = transcribe(librosa.resample(vo, orig_sr=SR, target_sr=16000))
json.dump([dict(w=w['w'], s=round(w['s'], 3), e=round(w['e'], 3)) for w in words], open('vo/words.json', 'w'), indent=0)
subprocess.run([sys.executable, f'{SKILL}/tools/word_sync.py', 'refine', 'vo/vo_raw.wav', 'vo/words.json', 'vo/words_sync.json'], check=True)
WS = json.load(open('vo/words_sync.json'))

# 4. map every script token of every line to a refined word onset
TL = dict(dur=DUR, lines={})
for line in S['lines']:
    a, b = spans[line['id']]
    idx = [i for i, w in enumerate(WS) if a - 0.15 <= w['s_ref'] <= b + 0.05]
    # expand ASR words into tokens (numbers, letters) keeping their word index
    got, gi = [], []
    for i in idx:
        for tk in toks(WS[i]['w']): got.append(tk); gi.append(i)
    disp = line['text'].split()
    want, owner = [], []
    for k, w in enumerate(disp):
        n = norm(w)
        for tk in (NUM.get(n, [n]) if n else []): want.append(tk); owner.append(k)
    on = [None] * len(disp); widx = [None] * len(disp)
    sm = difflib.SequenceMatcher(None, want, got, autojunk=False)
    for blk in sm.get_matching_blocks():
        for j in range(blk.size):
            k = owner[blk.a + j]
            if on[k] is None:
                wi = gi[blk.b + j]; on[k] = WS[wi]['s']; widx[k] = wi
    # fill gaps by interpolation inside the line span
    known = [(k, v) for k, v in enumerate(on) if v is not None]
    if not known: known = [(0, a)]
    for k in range(len(on)):
        if on[k] is None:
            prev = max([kv for kv in known if kv[0] < k], default=None, key=lambda kv: kv[0])
            nxt = min([kv for kv in known if kv[0] > k], default=None, key=lambda kv: kv[0])
            if prev and nxt: on[k] = prev[1] + (nxt[1] - prev[1]) * (k - prev[0]) / (nxt[0] - prev[0])
            elif prev: on[k] = prev[1] + 0.25 * (k - prev[0])
            else: on[k] = max(a, nxt[1] - 0.25 * (nxt[0] - k))
            on[k] = round(on[k] * 60) / 60
    on = [max(x, round((a + 0.05) * 60) / 60) for x in on]  # a word can't start before its own take
    TL['lines'][line['id']] = dict(s=round(a, 3), e=round(b, 3), words=disp, on=[round(x, 4) for x in on], word_idx=widx, take=choice[line['id']][1])
json.dump(TL, open('vo/timeline.json', 'w'), indent=1)
# keep the sync reference consistent: a whisper onset that falls in the silence before a take is clamped to the take start
for l in TL['lines'].values():
    for on, wi in zip(l['on'], l['word_idx']):
        if wi is not None and WS[wi]['s'] < on - 1e-6:
            WS[wi].update(s=on, s_ref=on, s_frame=round(on * 60), method='clamped to take start (whisper onset fell in silence)')
json.dump(WS, open('vo/words_sync.json', 'w'), indent=0)
print(json.dumps(dict(duration=DUR, lines=len(TL['lines']), unmatched=sum(x is None for l in TL['lines'].values() for x in l['word_idx']))))
