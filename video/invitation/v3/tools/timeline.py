"""Timeline for the v3 film, two modes, same output (work/timeline.json + work/words_sync.json):

  scratch : estimated from beats.json (word length + punctuation + the beat gaps), for designing and reviewing
            the picture before the voice exists. Never ships.
  vo DIR  : the real read. DIR is assemble_vo.py's output (vo.wav, vo_words.json, vo_place.json). Whisper word starts
            are refined on the voice envelope by the standard's word_sync.py and snapped to the 60 fps grid, then every
            script token of every beat is matched to its spoken word (difflib), so the film's words land on their frames.

usage: python3 tools/timeline.py scratch
       python3 tools/timeline.py vo work/vo
"""
import difflib, json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)) + '/../'
os.chdir(HERE)
STD = os.environ.get('VIDEO_STANDARD', '/home/user/video-editing-standard')
sys.path.insert(0, STD + '/tools/voice'); import beats as B
BD = json.load(open('beats.json')); BEATS = B.load('beats.json')
TAIL = 5.0   # end card holds while Pastor Joel sings
norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
NUM = {'1995': ['nineteen', 'ninety', 'five'], '1030': ['ten', 'thirty'], 'rccg': ['r', 'c', 'c', 'g'],
       'rccgdayspring': ['r', 'c', 'c', 'g', 'dayspring'], 'ninetyfive': ['ninety', 'five'], 'day': ['dayspring'], 'labor': ['labour']}


def toks(w):
    n = norm(w)
    return NUM.get(n, [n]) if n else []


def words_of(b):
    return B.spoken(b['text']).split()


def scratch():
    t = 0.0; lines = {}
    for b in BEATS:
        t += b.get('gap', 0.3)
        ws = words_of(b); on = []
        for w in ws:
            on.append(round(t * 60) / 60)
            t += 0.16 + 0.055 * len(norm(w))
            if w.endswith('...'): t += 0.55
            elif w.endswith(('.', '?')): t += 0.22
            elif w.endswith(','): t += 0.12
        lines[b['id']] = dict(s=on[0], e=round(t, 3), words=ws, on=on, word_idx=[None] * len(ws))
    return lines, []


def from_vo(d):
    place = json.load(open(f'{d}/vo_place.json'))['lines']
    raw = json.load(open(f'{d}/vo_words.json'))
    words = [dict(w=w[2], s=w[0], e=w[1]) if isinstance(w, list) else w for w in raw]
    json.dump(words, open('work/words.json', 'w'), indent=0)
    subprocess.run([sys.executable, f'{STD}/tools/word_sync.py', 'refine', f'{d}/vo.wav', 'work/words.json', 'work/words_sync.json'], check=True)
    WS = json.load(open('work/words_sync.json'))
    ids = [b['id'] for b in BEATS]; lines = {}
    for k, b in enumerate(BEATS):
        a = place[b['id']]['s'] if isinstance(place[b['id']], dict) else place[b['id']]
        nxt = place[ids[k + 1]] if k + 1 < len(ids) else None
        z = (nxt['s'] if isinstance(nxt, dict) else nxt) if nxt is not None else 1e9
        idx = [i for i, w in enumerate(WS) if a - 0.12 <= w['s_ref'] < z - 0.05]
        got, gi = [], []
        for i in idx:
            for tk in toks(WS[i]['w']): got.append(tk); gi.append(i)
        disp = words_of(b); want, owner = [], []
        for j, w in enumerate(disp):
            for tk in toks(w): want.append(tk); owner.append(j)
        on, widx = [None] * len(disp), [None] * len(disp)
        for blk in difflib.SequenceMatcher(None, want, got, autojunk=False).get_matching_blocks():
            for q in range(blk.size):
                j = owner[blk.a + q]
                if on[j] is None: on[j] = WS[gi[blk.b + q]]['s']; widx[j] = gi[blk.b + q]
        known = [(j, v) for j, v in enumerate(on) if v is not None] or [(0, a)]
        for j in range(len(on)):
            if on[j] is None:
                p = max((kv for kv in known if kv[0] < j), default=None, key=lambda kv: kv[0])
                n = min((kv for kv in known if kv[0] > j), default=None, key=lambda kv: kv[0])
                v = p[1] + (n[1] - p[1]) * (j - p[0]) / (n[0] - p[0]) if p and n else (p[1] + 0.25 * (j - p[0]) if p else n[1] - 0.25 * (n[0] - j))
                on[j] = round(v * 60) / 60
        on = [max(x, round((a + 0.02) * 60) / 60) for x in on]   # a word can't start before its own take
        e = max([WS[i]['e'] for i in idx] or [on[-1] + 0.3])
        lines[b['id']] = dict(s=round(a, 3), e=round(e, 3), words=disp, on=[round(x, 4) for x in on], word_idx=widx)
    for l in lines.values():   # keep the sync reference consistent with the clamp above
        for on, wi in zip(l['on'], l['word_idx']):
            if wi is not None and WS[wi]['s'] < on - 1e-6:
                WS[wi].update(s=on, s_ref=on, s_frame=round(on * 60), method='clamped to take start (whisper onset fell in silence)')
    json.dump(WS, open('work/words_sync.json', 'w'), indent=0)
    return lines, WS


if __name__ == '__main__':
    os.makedirs('work', exist_ok=True)
    lines, _ = scratch() if sys.argv[1] == 'scratch' else from_vo(sys.argv[2])
    last = BEATS[-1]['id']
    TL = dict(mode=sys.argv[1], dur=round((lines[last]['e'] + TAIL) * 60) / 60, lines=lines)
    json.dump(TL, open('work/timeline.json', 'w'), indent=1)
    print(json.dumps(dict(mode=TL['mode'], duration=TL['dur'], beats=len(lines))))
