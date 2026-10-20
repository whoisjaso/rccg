# QA: "The Dayspring" voice cut v2 (2026-10-20)

**Voice:** Orpheus-3B (canopylabs fine-tune, unsloth Q6_K GGUF) run locally on CPU via llama.cpp, decoded by SNAC 24 kHz, voice "tara". Two takes per line; the best one was chosen by whisper match and confidence (`tools/orpheus_tts.py`, `tools/build_timeline.py`). Dead air inside takes was cut to 0.36 s (0.6 s on the "..." lines), the read was sped up 7% with rubberband (pitch kept), and the Liquid Motion voice chain was applied.
**Music:** Pastor Joel Uzoma, *Tell Me* (2023), 30-second previews from the Deezer public catalog, split into instruments and vocals with demucs htdemucs (`tools/mix.py`):
- **0:00 to 0:28 "Jesus Is Lord".** Instruments only, low-passed and roomy for the dark act. It dips for the meaning pause and drops out before the dawn.
- **0:28 to 0:51 "Tell Me" (title track).** Instruments, opening with the dawn.
- **0:51 to end "I Know Jesus".** Instruments under the future pace, then his own sung vocal rises as the voiceover finishes (1:11).

All three are in G major, so the act changes don't clash. The SFX are synthesized and tuned to G.

| Gate | 9:16 (720x1280) | 16:9 (1280x720) | Target |
|---|---|---|---|
| Frame rate | 60/1 exactly | 60/1 exactly | 60/1 |
| Frames | 4522 (75.37 s) | 4522 | duration x 60 |
| Loudness | -14.0 LUFS | -14.0 LUFS | -14 ±0.5 |
| True peak | -1.5 dBTP | -1.5 dBTP | ≤ -1 (music master) |
| Word sync (skill word_sync.py check) | PASS, 139/139 exact frame | PASS, 129/129 exact frame | ≤ 1 frame |
| VO over music per word | p5 14.9 dB, min 12.2 dB | same mix | p5 ≥ 12, min ≥ 8 |
| Whisper intelligibility | 97.5% (hook 100%) | same audio | ≥ 98% |
| Cadence jitter | 0.136 | 0.115 | ≤ 0.35 |
| dup_ratio | 0.083 (advisory) | 0.105 (advisory) | ≤ 0.02 |

**Whisper 97.5% note:** every mismatch is whisper misreading the clean voice-only reference ("I'll ye" for "all ye", "comes you are" for "come as you are"). The final mix transcribes those lines correctly. That makes it a reference-transcription limit, not masking by the music.

**dup_ratio note:** same as v1. Slow drifts on the held scripture and the white end card read as still at the checker's 180 px scale. There are no identical frames.

**Fixed during the build:**
- "Hartsook" mispronounced in 3 of 3 takes, so the street was dropped from the voice (it stays on screen).
- Breath and hiss before takes delayed the first words; now trimmed by a sustained-onset detector.
- 13 whisper onsets that fell in silence before a take were clamped to the take start.

**Rights:** the songs are Pastor Joel's own recordings, used for the church's own invitation. Before a *paid* boost, confirm the distributor (1319051 Records DK) allows it or upload with the original masters. The previews are 128 kbps, so the church's master WAVs would sound better and allow full-length beds.
