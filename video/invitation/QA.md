# QA: "The Dayspring" invitation film v1 (2026-10-20)

| Gate | 9:16 (720x1280) | 16:9 (1280x720) | Target |
|---|---|---|---|
| Frame rate | 60/1 exactly | 60/1 exactly | 60/1 |
| Frames | 3360 (56.0 s x 60) | 3360 | duration x 60, none dropped |
| Loudness | -13.9 LUFS | -13.8 LUFS | -14 ±0.5 |
| True peak | -4.2 dBTP | -4.2 dBTP | ≤ -4 (no-music master) |
| Identical frames | 0 | 0 | 0 |
| Cadence jitter | 0.099 | 0.089 | ≤ 0.35 PASS |
| dup_ratio (smoothness_check) | 0.082 | 0.076 | ≤ 0.02, advisory CHECK |
| First text | frame 0 | frame 0 | ≤ 0.1 s |

**dup_ratio note:** the flagged frames are slow drifts (scripture holds, the end card), not held frames. At the checker's 180 px scale a 1.03 scale drift reads as "still". The benchmark clip01 Liquid Motion v2 shipped with the same advisory CHECK (0.132). The end card got a moving warm light and a 6% push after the first pass flagged 404 near-still frames.

**Word sync:** no VO (text-led film), so on-screen words follow the score. Every word's sound cue sits on its visual peak (onset + 0.37 x entrance); exits are silent.

**Build:** `film.html` (deterministic timeline; Chromium renders each frame at t = n/60 at native size) → `tools/render.mjs` (4 workers, lossless) → `tools/score.py` (original synthesized score + SFX from the exported cue sheet) → `tools/finish.sh` (two-pass loudnorm, H.264 High CRF 15, AAC 384k, metadata stripped). The site scene is a frame-exact 60 fps capture of the live site (`tools/capture_site.mjs`), not a screen recording.

**Compliance:** scripture is KJV (public domain), quoted exactly (Luke 1:78 is excerpted, opening word capitalised). Every fact comes from PRODUCT.md and the site: address, 10:30 am, Pastors Joel and Funmi Uzoma, "since 1995". The RCCG emblem is unaltered. There are no invented testimonials or numbers, and no third-party audio or footage. Nothing posts without the owner's OK.

**Pre-production score:** P1 5 · P2 4 · P3 4 · P4 5 (brief.md).
