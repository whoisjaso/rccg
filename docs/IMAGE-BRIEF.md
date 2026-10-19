# Image brief: generated and photographed assets

The site already runs on the church's real photos, re-graded. This brief covers what will take it from *excellent* to *unforgettable*.

## Ground rule: what AI should and shouldn't make
**Use AI for atmosphere:** light, architecture, still life, texture and hands. These carry mood and never claim to be a specific person.

**Don't use AI for people who would be read as real members or as the pastors.** A generated "Women's Fellowship" photo is a stock photo with extra steps, and visitors who arrive on Sunday will notice the difference. Faces should come from a real photographer at a real service (see Part B).

## House style: paste this at the end of every prompt
> Shot on medium format film, Hasselblad, 80mm lens. Warm, desaturated palette of ink black, bone, warm ivory and aged brass. Soft directional natural light, deep shadows, lifted blacks, fine film grain. Quiet, reverent, expensive. Editorial luxury campaign in the style of Loro Piana and Brunello Cucinelli. No text, no logos, no watermarks.

**Reference images to upload alongside each prompt** (all in this repo):
- Grading and tone reference: `site/assets/img/worship-mono-1600.webp` and `site/assets/img/ribbon-mono-1600.webp`
- Colour reference: `site/assets/img/ribbon-1600.webp`
- The building, for any exterior work: `source-assets/originals/orig-RCCG-Dayspring-Chapel.jpg`
- The mark, for any embossing or brass work: `site/assets/img/mark.svg` (export it to PNG first)

---

## Part A: AI-generated assets (prompt ChatGPT with these)

Save each output as WebP at the size listed, into `site/assets/img/`, using the exact filename. Then tell me and I'll wire it in.

### 1. Hero: "The Dayspring" ★ highest impact
**Files:** `hero-dawn-2400.webp` (2400×1350) and `hero-dawn-mobile-1200.webp` (1200×2133)
**Replaces:** the worship photo behind "The Dayspring from on high". The current photo shows a lyric screen ("I stand in awe of you (2x)") that I've had to bury under shadow.
> A vast, quiet interior of a modern sanctuary at first light. A single tall window on the right lets in a low golden beam of dawn that falls across rows of empty upholstered chairs and a polished floor. Dust motes hang in the beam. The rest of the room falls into deep warm shadow. The camera sits low at the back of the room, symmetrical, with a lot of negative space in the upper half for headline text. Mood: the moment before the congregation arrives, expectant and holy. [house style]

**Mobile version:** the same scene, vertical 9:16, with the beam crossing the lower third.

**Optional upgrade:** the same prompt as a 6–8 second seamless loop in Sora or Runway (the beam slowly brightening, dust drifting). Export `hero-dawn.mp4` at 1920×1080, H.264, under 6 MB, muted. I'll add video support.

### 2. Crossover night
**File:** `crossover-2400.webp` (2400×1350)
**Replaces:** the backdrop of the Crossover countdown section.
> Close-up of hundreds of small candle flames held in raised hands in a dark sanctuary at midnight. The hands are silhouetted, with no faces visible. Shallow depth of field, so the flames melt into warm golden bokeh across the frame. Near-black surroundings, brass and amber light only. Mood: anticipation at the threshold of a new year. [house style]

### 3. The Library still life
**File:** `library-still-2400.webp` (2400×1350)
**Used for:** the Library page hero, which currently reuses the worship photo.
> Overhead still life on heavy natural linen: an open leather-bound Bible with gilt page edges, a pair of reading glasses, a brass bookmark, and a small sprig of olive. Soft window light from the upper left, long gentle shadows, a calm composition with generous empty space on the left. [house style]

### 4. Give: the offering
**File:** `give-2400.webp` (2400×1350)
**Used for:** the Give page hero, which currently uses the sanctuary photo.
> Two cupped hands, seen from the side and slightly below, raised in an offering posture against a deep ink-black background. A thin shaft of warm light catches the fingertips and palms. No face, no jewellery, no objects. Minimal, sculptural, devotional, like a Renaissance painting photographed today. [house style]

### 5. Fellowship atmosphere: four images, no faces
**Files:** `fellow-men-1000.webp`, `fellow-women-1000.webp`, `fellow-youth-1000.webp` and `fellow-seniors-1000.webp` (all 1000×1250, 4:5 portrait)
**Used for:** the floating preview on the Ministries page, until a real shoot replaces it.

- **Men:**
  > Close-up of a man's strong hands resting on an open Bible on a dark walnut table, a cup of black coffee beside it, early morning light, the sleeve of a navy wool suit visible. No face. [house style]
- **Women:**
  > Close-up of a woman's hands with a simple gold ring holding a well-worn Bible on her lap, a richly patterned West African ankara fabric skirt in muted gold and indigo, warm window light. No face. [house style]
- **Youth:**
  > Close-up of a young person's hands holding a phone showing a scripture and a paper notebook with handwritten notes, sneakers and denim in soft focus, warm evening light in a modern room. No face. [house style]
- **Seniors:**
  > Close-up of two elderly hands clasped in prayer, deep lines and texture, resting on the back of a sanctuary chair, soft golden side light, dark background. No face. [house style]

### 6. Social share card
**File:** `og-1200.webp` (1200×630)
> A deep ink-black field with a soft golden dawn glow rising from the bottom centre, like a sunrise over a dark horizon. Very subtle film grain. A large calm empty space in the centre for a logo. [house style]

I'll composite the Dayspring mark and wordmark onto it myself, so the vector logo stays crisp.

### 7. Embossed mark (optional, for print and loading)
**File:** `mark-emboss-1600.webp` (1600×1600)
> A blind-embossed circular emblem pressed into thick cream cotton paper: a rising sun over three lines of water with a small cross at the zenith, inside a thin circle (match the attached mark exactly). Raking light from the left reveals the relief. Macro photograph, luxury stationery. [house style]

Upload `mark.svg` exported as a PNG as the reference.

---

## Part B: real photography (book a photographer for one Sunday)

This is the most valuable money the church can spend on the site. Brief the photographer with these three rules:

- **Light:** natural window light or a single soft key light. No on-camera flash.
- **Grade:** warm and desaturated. Send them `worship-mono-1600.webp` as the target look.
- **Avoid:** projector screens with lyrics, exit signs, and cluttered backgrounds.

**Shot list:**
1. **Pastors Joel & Funmi together.** A new environmental portrait inside the new sanctuary, with no backdrop: both standing, natural light, 4:5 and 16:9. The current solo portrait of Pastor Joel is only 800 px wide and soft when enlarged.
2. **Each pastor alone, preaching.** Mid-gesture, a long lens from the side aisle, with the congregation out of focus.
3. **Each fellowship.** Four groups of 6–10 people, *candid*: talking, laughing, praying. Never lined up facing the camera.
4. **Children's church.** Hands, crafts and Bibles. Use wide or back-of-head shots, and get parental consent if faces appear.
5. **Details.** The communion table, a Bible on a chair, the door handle of the new building, hands raised in worship, the brass and wood textures of the space.
6. **The building at golden hour.** Exterior, from the same angle as the current render, at sunset with interior lights on.
7. **Arrival.** Ushers greeting at the door, a handshake. This is the image that sells "Plan a Visit".

**Deliver:** full-resolution JPEGs. I'll grade them to the house look and slot them in.
