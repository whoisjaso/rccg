"""Transcribe takes with word timestamps (faster-whisper, float32 for deterministic decodes)."""
import sys, json
import librosa
from faster_whisper import WhisperModel
m = WhisperModel('small.en', device='cpu', compute_type='float32')
out = {}
for f in sys.argv[1:]:
    y, _ = librosa.load(f, sr=16000, mono=True)
    segs, _ = m.transcribe(y, word_timestamps=True, beam_size=5)
    words = [dict(w=w.word.strip(), s=round(w.start, 3), e=round(w.end, 3), p=round(w.probability, 3)) for s in segs for w in s.words]
    out[f] = words
    print(f, '|', ' '.join(w['w'] for w in words), '|', f"{min([w['p'] for w in words] or [0]):.2f}")
json.dump(out, open('vo/asr.json' if len(sys.argv) > 2 else '/dev/null', 'w'), indent=1)
