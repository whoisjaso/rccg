"""Shortlist 3 ElevenLabs voices for the audition (voice-selection-sop.md §3): warm, expressive storytellers, not
announcers or customer service. Reads the account's voices with ELEVENLABS_API_KEY (never printed); prints id1,id2,id3.
Override any time with VOICES=... ./make.sh"""
import json, os, sys, urllib.request
req = urllib.request.Request('https://api.elevenlabs.io/v1/voices', headers={'xi-api-key': os.environ['ELEVENLABS_API_KEY']})
voices = json.loads(urllib.request.urlopen(req, timeout=60).read())['voices']
GOOD = {'warm': 3, 'deep': 2, 'calm': 2, 'soothing': 2, 'emotive': 3, 'expressive': 3, 'narration': 2, 'narrative': 2, 'storytelling': 3,
        'conversational': 1, 'gentle': 2, 'raspy': 1, 'mature': 1, 'resonant': 2, 'american': 1}
BAD = {'news': -3, 'announcer': -4, 'customer': -4, 'ad': -1, 'young': -1, 'kid': -5, 'child': -5, 'animation': -3, 'video games': -2, 'robot': -5}
def score(v):
    text = ' '.join([v.get('name', ''), json.dumps(v.get('labels') or {}), v.get('description') or '']).lower()
    return sum(w for k, w in GOOD.items() if k in text) + sum(w for k, w in BAD.items() if k in text)
ranked = sorted(voices, key=score, reverse=True)
# keep both registers in the audition: at least one male and one female voice if the account has them
pick, genders = [], set()
for v in ranked:
    g = (v.get('labels') or {}).get('gender', '?')
    if len(pick) < 2 or g not in genders or len(genders) > 1: pick.append(v); genders.add(g)
    if len(pick) == 3: break
for v in pick: print(f"  cast: {v['name']} ({(v.get('labels') or {}).get('gender', '?')}, {(v.get('labels') or {}).get('accent', '?')})", file=sys.stderr)
print(','.join(v['voice_id'] for v in pick))
