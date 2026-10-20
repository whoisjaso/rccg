"""Orpheus-3B text-to-speech, fully local on CPU (llama.cpp GGUF + SNAC 24 kHz decoder).

usage: python3 orpheus_tts.py <script.json> <out_dir> [--model path.gguf] [--only id1,id2] [--takes N] [--voice tara]
Writes <out_dir>/<id>_t<k>.wav (24 kHz mono) per take.
"""
import argparse, json, os, time, wave
import numpy as np
import torch
from llama_cpp import Llama
from snac import SNAC

ap = argparse.ArgumentParser()
ap.add_argument('script'); ap.add_argument('out')
ap.add_argument('--model', default='/home/user/models/orpheus-3b-0.1-ft-Q6_K.gguf')
ap.add_argument('--only', default=''); ap.add_argument('--takes', type=int, default=1)
ap.add_argument('--voice', default=None); ap.add_argument('--temp', type=float, default=0.6)
a = ap.parse_args()
S = json.load(open(a.script)); voice = a.voice or S['voice']
os.makedirs(a.out, exist_ok=True)
llm = Llama(model_path=a.model, n_ctx=4096, n_threads=os.cpu_count(), n_batch=512, verbose=False)
snac = SNAC.from_pretrained('hubertsiuzdak/snac_24khz').eval()
AUDIO0 = 128266  # first <custom_token_10>

def codes_to_audio(ids):
    n = len(ids) // 7 * 7; ids = ids[:n]
    l1, l2, l3 = [], [], []
    for i in range(0, n, 7):
        c = [ids[i + j] - AUDIO0 - j * 4096 for j in range(7)]
        if min(c) < 0 or max(c) > 4095: continue
        l1.append(c[0]); l2 += [c[1], c[4]]; l3 += [c[2], c[3], c[5], c[6]]
    with torch.inference_mode():
        audio = snac.decode([torch.tensor([l1]), torch.tensor([l2]), torch.tensor([l3])])
    return audio.squeeze().numpy()

for line in S['lines']:
    if a.only and line['id'] not in a.only.split(','): continue
    for k in range(a.takes):
        if os.path.exists(f"{a.out}/{line['id']}_t{k}.wav"): continue  # resume after an interruption
        t0 = time.time()
        prompt = [128259] + llm.tokenize(f"{voice}: {line['text']}".encode(), add_bos=True, special=False) + [128009, 128260]
        out = []
        for tok in llm.generate(prompt, temp=a.temp, top_p=0.9, top_k=40, repeat_penalty=1.1, reset=True):
            if tok in (128258, 128009) and len(out) > 7: break
            out.append(tok)
            if len(out) > 2400: break
        aud = [t for t in out if t >= AUDIO0]
        y = codes_to_audio(aud)
        pcm = (np.clip(y, -1, 1) * 32767).astype('<i2')
        fn = f"{a.out}/{line['id']}_t{k}.wav"
        with wave.open(fn, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm.tobytes())
        print(f"{fn}  {len(y)/24000:.2f}s audio  {len(aud)} codes  {time.time()-t0:.1f}s", flush=True)
