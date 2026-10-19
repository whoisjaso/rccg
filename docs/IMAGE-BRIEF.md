# Image brief: Patek-grade photography from the church's real photos

The site is built like patek.com: full-bleed cinematic slides, then calm white spreads. The design is finished. **The photography is what's left between this site and Patek.**

Each prompt below takes a real photo from `docs/reference/` and rebuilds it in ChatGPT as a campaign-grade image. Some prompts also create a new angle.

## How to run each one
1. Open ChatGPT (image generation) and **upload the source photo listed**.
2. Also upload `docs/reference/style-site-hero.png`, the site's current opening slide, so ChatGPT matches the mood.
3. Paste the prompt, then add the **house style line** below at the end.
4. Download the result (ChatGPT gives you a PNG) and name it after the slot, keeping the `.png` ending. For example, `hero-pastors-2400.png`. Put it in `docs/incoming/`.
5. Tell me it's in. I'll convert it to the site's format, make the phone and desktop sizes, check the crop, and swap it into the slot.

## House style line (end every prompt with this)
> Shot like a Patek Philippe campaign: medium-format photography, soft directional light, deep but clean shadows, rich natural colour (not desaturated, not HDR), refined and quiet. Generous empty space on the left third for headline text. No text, no logos added, no watermarks.

## Rules for real people
- **Keep every face exactly as in the source photo.** Same features, same skin tone, same age, same hair, same body. Change only the light, background, cleanliness and framing.
- Ask the pastors, and anyone recognisable, for their OK before publishing.
- If ChatGPT changes a face, regenerate. A wrong face is worse than an unimproved photo.

---

## The four opening slides (home page)
Size for all four: **2400×1350** (16:9). Keep the main subject in the right two-thirds.

### 1. `hero-pastors-2400.webp` ★ start here
**Upload:** `src-pastors-couple.png`
> Editorial portrait of this exact couple, faces and likeness unchanged. Place them on a deep warm charcoal seamless backdrop with a soft pool of light behind them. Use a large soft key light from the left, with gentle rim light on the shoulders. Refine the clothing: same colours and garments, pressed and immaculate. Frame from mid-thigh up, standing in the right half of a wide 16:9 frame, with calm empty space on the left.

### 2. `hero-worship-2400.webp`
**Upload:** `src-worship.jpg`
> The same worship moment, made cinematic. Keep the people, their clothing and their raised hands as they are. Remove the projector screen and its lyrics entirely and replace them with a soft wash of warm stage light falling from above. Add a gentle atmospheric haze in the light beams. Camera low behind the congregation, shallow depth of field, hands raised against the glow. Wide 16:9.

### 3. `hero-campus-1920.webp` (2400×1350 is fine; keep this filename)
**Upload:** `src-building-render.jpg`
> Turn this architectural render into a real photograph of the same building at blue hour. Same architecture, stone and roofline, and keep the circular RCCG emblem on the facade exactly. Show warm light glowing from the windows and a softly lit entrance canopy. A thin layer of rain on the forecourt reflects the lights. Lower, closer three-quarter angle than the render. Remove the parked cars. Deep blue sky with the last warmth on the horizon. Wide 16:9.

### 4. `hero-ribbon-2400.webp`
**Upload:** `src-ribbon.jpg`
> The same ribbon-cutting moment at the church doors, cleaned and relit. Keep every person, face and outfit exactly. Use warm late-afternoon sunlight raking across the glass doors. Remove the parked cars and street clutter in the reflections. The red ribbon and bow are crisp. Slight low angle, documentary but polished, like a luxury brand's opening-day photograph. Wide 16:9.

---

## Editorial spreads (white sections)
Size: **1400×1750** (4:5 portrait).

### 5. `ed-sanctuary-1400.webp` (the mission spread and the Give page)
**Upload:** `src-sanctuary-interior.jpg`
> This same sanctuary, empty, at first light. Turn off the screen and remove the "Welcome to our church" graphic; show a calm dark screen instead. Soft morning daylight comes from the side and the room glows in warm neutral tones. Rows of chairs are perfectly aligned. Symmetrical, centred view down the aisle. 4:5 portrait.

### 6. `ed-joel-800.webp` (save at 1000×1250)
**Upload:** `src-pastor-joel.jpg`
> Editorial portrait of this exact man, face unchanged. Warm light-grey seamless studio backdrop, soft window-style light from the left. Same blue suit, pressed. Calm, dignified, a slight smile, looking toward the camera. 4:5 portrait, head and shoulders with a little space above.

### 7. `ed-funmi-800.webp` (save at 1000×1250)
**Upload:** `src-pastor-funmi.png`
> Editorial portrait of this exact woman, face unchanged. Replace the lilac background with a warm light-grey seamless studio backdrop and soft window-style light from the left. Same outfit and necklace. Gracious and confident. 4:5 portrait.

### 8. `ed-ribbon-1400.webp`, a new angle (the "Visit us" spread)
**Upload:** `src-building-render.jpg`
> A close architectural detail of this building's main entrance: glass doors under the canopy at golden hour, the stone pillar texture in sharp focus, warm interior light visible through the glass. No people. Photographic, calm, like a flagship boutique entrance. 4:5 portrait.

---

## Full-width bands
Size: **2400×1030** (21:9).

### 9. `band-congregation-2400.webp` (the "A place for every season" band and the Ministries page)
**Upload:** `src-congregation-group.jpg`
> This same group of church members, every face and outfit unchanged. Clean up the background into the soft-lit interior of the new sanctuary. Warm, even light, with natural poses and a relaxed, joyful feeling. Wide 21:9, with the group in the right two-thirds and soft space on the left.

### 10. `band-family-2400.webp` (the "Watch and listen" band)
**Upload:** `src-leaders-group.jpg`
> This same group of church leaders and members, faces and native attire unchanged. Remove the projector screen and the text behind them; replace it with a softly lit warm wall. Gentle key light, rich fabric colour, dignified. Wide 21:9, with the group in the right two-thirds.

---

## Optional new angles (for future slides)
Each one becomes another stacked slide or spread. Save it into `site/assets/img/slots/` with the name shown and tell me where you want it.

- **`hero-aerial-2400.webp`** (upload `src-building-render.jpg`):
  > A drone view of this same campus at sunset, slightly elevated, warm light on the roof, long shadows across the grounds.
- **`detail-bible-1400.webp`:**
  > Macro photograph of an open Bible resting on a sanctuary chair, morning light across the pages, shallow depth of field.
- **`detail-hands-1400.webp`** (upload `src-worship.jpg`):
  > Close detail of two hands raised in worship against a warm haze of stage light, from the same congregation.
- **`hero-crossover-2400.webp`:**
  > Candles held in raised hands in a darkened sanctuary at midnight, warm gold bokeh. Hands and silhouettes only, no faces.

## Also needed from the church
- **A vector RCCG emblem (SVG or PDF)** for the header.
- **Real photos from one Sunday:** the pastors in the sanctuary, each fellowship candid, ushers at the door, and the building at golden hour. Real, well-lit photos beat every AI improvement.
