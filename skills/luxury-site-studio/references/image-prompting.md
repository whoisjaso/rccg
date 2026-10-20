# Image prompting for luxury websites

The goal is to take the client's own photos and have ChatGPT (or any image model) rebuild them as campaign photography, with first-try accuracy. Everything here was proven on real returns.

## Contents
1. Before writing: study the source
2. Prompt anatomy (copy this structure)
3. Slot shapes and safe zones
4. Templates by slot type
5. Correction lines that work
6. QA on every return

## 1. Before writing: study the source
Open each source photo and write down:
- **Count of people**, left to right, each with clothing, colours, accessories (glasses, headwraps, watches, bracelets, bags), pose, and what they hold.
- **What must go:** projector screens with lyrics or slides, donation text, parked cars, power lines, exit signs, stains, cables, stray equipment, background strangers.
- **What must stay:** architecture, materials, the logo position, garments.
- **Where the main subject sits**, so you can move it to the right two-thirds for a hero.

Miscounting is the most common failure: verify the count twice and state it in the prompt ("Keep all nine people").

## 2. Prompt anatomy
Write each prompt as one block the user pastes whole. Use these labelled sections in this order:

```
TASK: what to re-photograph, which attached image is the ONLY source of identity/architecture, which image is a mood reference only.

IDENTITY LOCK (highest priority): faces, skin tone, skin texture, age, hair, glasses, body shape, pose, height relationships. "Do not beautify, slim, smooth, lighten or darken skin, or make anyone look younger."

PEOPLE / ARCHITECTURE (keep exactly): left-to-right list with clothing; or materials, roof, windows, logo placement.

CHANGES / REMOVE: numbered list of removals and replacements.

LIGHTING: key direction and size, fill ratio, rim, colour temperature in K, shadow quality, catchlights.

CAMERA: body/lens look (e.g. medium format, 90mm), aperture, camera height and distance, perspective correction.

COMPOSITION (critical): aspect and exact pixel size; subject position as % of width and height; faces kept between X% and Y% of the width (the phone crop); which area stays dark/empty for headline text.

COLOUR AND GRADE: concrete targets (hex or descriptive), "no HDR, no orange-teal, fine film grain".

DO NOT: the specific failure list for this image (change faces, add text/logos, add or remove people, change clothing, CGI look).
```

End each prompt with the project's house style line, for example:
> Shot like a Patek Philippe campaign: medium-format photography, soft directional light, deep but clean shadows, rich natural colour (not desaturated, not HDR), refined and quiet. No text, no logos added, no watermarks.

## 3. Slot shapes and safe zones
| Slot | Shape | Size to request | Safe zones |
|---|---|---|---|
| `hero-*` (stacked slides, inner page heroes) | 16:9 | 2400 x 1350 | Headline lives in the lower-left third: keep it dark and calm. Subject centre at ~60% of width; faces between 50% and 75% of width (phone crop). |
| `ed-*` (editorial spreads, portraits) | 4:5 | 1400 x 1750 (portraits 1000 x 1250) | Clean, quiet background that sits on white. Eyes at ~35% of height. |
| `band-*` (full-width bands) | 21:9 or 2:1 | 2400 x 1030 | Left 30% empty for text; group in 32 to 98% of width; heads with headroom. |
| `detail-*` (macro moments) | 4:5 | 1400 x 1750 | No faces, no legible text. |

ChatGPT usually returns about 1672 x 941 for 16:9 and 1122 x 1402 for 4:5. Use it at native size (never upscale); ask for an upscale only if it looks soft on large screens.

## 4. Templates by slot type
**Couple or leader portrait (hero):** dark warm seamless sweep with a soft pool of light behind the heads; octabox key camera-left 45 degrees at 4300K, fill at a quarter, thin rim lights at 3800K; medium format 90mm f/5.6 at chest height; pair centred at 62% of width; crop top of head to mid-thigh; left 45% empty.

**Single portrait (ed):** seamless warm light-grey backdrop (#d9d4cd darkening to #c9c3bb), window-style key from the left at 5000K, subtle hair light, 105mm f/4 at eye level, head and chest, eyes at 35% height. Matching backdrops make portraits read as a set.

**Worship / event crowd (hero):** remove the screen and all text; replace with deep warm darkness and 3200K stage beams through haze; camera behind the crowd; focus on one expressive gesture; 70% of frame in shadow; lower-left dark.

**Building (hero):** turn the render into a real photo at blue hour (sky #1b2a4a fading to peach at the horizon), warm 2900K windows, uplit stone, wet reflective forecourt, no cars or people, 24mm tilt-shift with straight verticals, low three-quarter angle. Attach the official logo file and expect to composite it anyway.

**New angle from a render (ed):** a close architectural detail of the entrance at golden hour, stone texture in razor focus, glowing glass, no people.

**Group (band):** keep everyone in order; replace the corridor with a softly lit sanctuary/showroom/lobby; even front-left key so nobody is in shadow; 50mm f/5.6 at chest height; group in the right two-thirds.

**Atmosphere extras (no faces):** open book on a chair in morning light; raised hands with the same bracelet and sleeve as a source photo; candles held high in darkness (hands and silhouettes only). These need no identity checks and make strong spreads and seasonal bands.

## 5. Correction lines that work
Send one correction per message; never restart the conversation:
- "The woman's face changed. Restore her exact face from the source photo and change nothing else."
- "There should be nine people; you added one on the far right. Remove that person and change nothing else."
- "Remove all text from the screen behind them and change nothing else."
- "Upscale this exact image to 2400 x 1350 without changing anything."

## 6. QA on every return
1. **Faces:** side-by-side strip per person (`scripts/face_check.py`). Accept only if features, glasses, jewellery and headwear match.
2. **Count:** heads equal the source count.
3. **Lettering:** zoom 4x on every sign, logo, screen and bag. Garbled official logos get composited (`scripts/fix_logo.py`); tiny unreadable marks on props are acceptable.
4. **Composition:** install, then screenshot the actual section on desktop (1440 x 900) and phone (390 x 844); adjust `object-position` until faces and subject sit in frame and text sits on calm area.
5. **Provenance:** every shipped raster gets a `.json` sidecar naming source photo, prompt number, and where the original is kept.
