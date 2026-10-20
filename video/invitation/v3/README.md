# "The Dayspring" v3: emotional voice + dual-font motion graphics

Built from the source standard (`whoisjaso/video-editing-standard` @ 080ac2d): `SKILL.md`, voice SOP, dual-font system, motion colour combos, tagged SFX catalog, measured text presets, word-sync and QA gates.

## What changed from v2 (owner notes: "didn't like the voice, didn't like the SFX")
- **Voice: ElevenLabs** (the standard's default engine), model `eleven_v4`, stability 0.0 (Creative). The script (`beats.json`) carries a direction tag on every line:
  - **Pain:** heavy-hearted, aching, ashamed, voice catching, bitter, hollow, sorrowful.
  - **Turn:** stern, firm, skeptical, certain.
  - **Scripture and dawn:** reverent, tender, awed.
  - **Proof:** proud, inviting, respectful, joyful.
  - **Future pace:** curious, gentle, excited, relieved, encouraging, warm, upbeat.
  - **Sounds:** two `{sigh}` marks.

  Three voices × two seeds are auditioned and scored by `score_takes.py` (Whisper accuracy + pitch range), and the best take is kept per beat. The read is never sped up (SOP §5).
- **Type: the dual-font system** (`docs/carousel-system.md`, OFL twin):
  - Dela Gothic One caps for heroes.
  - **One Pinyon Script word per scene** at about 3.9x the caps: the most emotional word (alone, nights, hide, back, empty, ache, gone, rest, dayspring, Houston, family, Sunday, song, breathe, you).
  - Inter for body text and Anton on the punch beats (FINE, BUT HEAR ME, IT'S NOT, 10:30, 1995, SET IT DOWN).
- **Colour: two motion combos** (`docs/color-combos.md`):
  - **Crimson Night** (#0E0606, white, #E10304) for the weight.
  - **Espresso Gold** (#1A0F0A, white, #FFBF0B) from "But hear me" onward.
- **Motion: one illustration per spoken point** (Liquid Motion):
  - **The weight:** caps that sink under the weight; a 2:47 clock; a panel hiding the habit; a sent message the cursor can't delete; FINE cracking in two; party lights dying; a heartbeat that slows and flatlines into the pause.
  - **The turn:** a white flash on "BUT HEAR ME"; a gold seam of light breaking the dark; "TOO LATE?" tilting and being struck through by "IT'S NOT."
  - **Scripture, dawn and proof:** scripture over raised hands; sunrise rays on "dayspring"; the campus; the real site in a desktop window with checklist chips; PASTORS behind the pastors with 1995 counting up; the congregation.
  - **Sunday:** an iris opening onto the entrance; doors parting with warm light; gold music bars; a breathing ring.
  - **The release:** every burden word from act 1 falls on "SET IT DOWN" and dissolves into light.
- **SFX: from the standard's tagged catalog** (`sfx-library/catalog.jsonl`, posted-OK only: Kenney CC0 + house synth; rows in `sfx_used.json`). Each sound is placed by its catalog sync point, with variety rotation and a voice duck. One energy-5 hit in the film ("HEAR ME"). The heartbeat and flatline are synthesized because the library has none. The creator packs (Subhan, Ahmad, Pixabay) live on the owner's box and are not in the repo; with them present (`VIDEO_STANDARD_SFX`), swap the `ROLE` table in `tools/mix.py`.
- **Music: Pastor Joel Uzoma's "Tell Me" album** (instrumental stems), with his own voice singing on the end card.
- **Master:** 1080x1920 and 1920x1080, exactly 60/1 (the standard's gate).

## Run
```bash
# once: ELEVENLABS_API_KEY set as an environment secret (new session picks it up)
cd video/invitation/v3 && ./make.sh                 # or VOICES=id1,id2,id3 ./make.sh
```
Design without the voice: `python3 tools/timeline.py scratch`, then `node tools/render.mjs stills v work/stills 1,5,9`.

## Files
- `beats.json`: the tagged script.
- `film.html`: the motion piece (deterministic, frame n = t n/60).
- `tools/timeline.py`: scratch or real-VO word timing, using word_sync refine.
- `tools/render.mjs`: 1080p60 renderer.
- `tools/mix.py`: VO, songs and library SFX.
- `tools/cast.py`: voice shortlist.
- `make.sh`: the whole run.
- `sfx_used.json`: the catalog rows of every sound used, with licence.
