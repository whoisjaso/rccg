---
name: RCCG Dayspring Chapel
description: The white agbada. A porcelain garment embroidered in gold around the RCCG emblem, for a Houston parish.
colors:
  emblem-indigo: "#291871"
  ink-indigo: "#1c1546"
  ink-soft: "#57507c"
  ink-soft-warm: "#5d4e5b"
  embroidery-gold: "#b08b40"
  gold-text: "#7d5d22"
  gold-text-deep: "#6c4f1a"
  gold-pale: "#e2d1a6"
  porcelain-ground: "#fcfbf7"
  pearl-raised: "#f7f6f9"
  pearl-field: "#f8f6f1"
  lining: "#faf8f3"
  lining-deep: "#f4f0e7"
  woven-label: "#f6ecd4"
  night-indigo: "#15103a"
  night-indigo-raised: "#1d1650"
  night-text: "#f5efe3"
  night-text-soft: "#c3bddf"
  night-gold: "#d8b56a"
typography:
  display:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, serif"
    fontSize: "clamp(46px, 7.2vw, 96px)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.02em"
    fontVariation: "\"opsz\" 96"
  headline:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, serif"
    fontSize: "clamp(36px, 4.8vw, 68px)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.015em"
    fontVariation: "\"opsz\" 72"
  title:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, serif"
    fontSize: "clamp(24px, 2.3vw, 32px)"
    fontWeight: 400
    lineHeight: 1.15
    fontVariation: "\"opsz\" 36"
  lede:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, serif"
    fontSize: "clamp(21px, 2vw, 27px)"
    fontWeight: 400
    lineHeight: 1.4
    fontVariation: "\"opsz\" 24"
  body:
    fontFamily: "Hanken Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Hanken Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    letterSpacing: "0.02em"
  numeral:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, serif"
    fontSize: "clamp(36px, 3.6vw, 52px)"
    fontWeight: 400
    lineHeight: 1
    fontFeature: "\"lnum\", \"tnum\""
rounded:
  hairline: "1px"
  cut: "2px"
  toast: "4px"
  sheet: "18px"
  round: "50%"
spacing:
  gutter: "clamp(20px, 4.5vw, 72px)"
  max: "1360px"
  stack: "24px"
  stack-lg: "40px"
  section: "clamp(80px, 10vw, 144px)"
  section-snug: "clamp(64px, 8vw, 112px)"
  grid-gap: "clamp(24px, 3vw, 48px)"
components:
  button-primary:
    backgroundColor: "{colors.gold-text}"
    textColor: "{colors.porcelain-ground}"
    typography: "{typography.label}"
    rounded: "{rounded.cut}"
    padding: "0 26px"
    height: "54px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-indigo}"
    typography: "{typography.label}"
    rounded: "{rounded.cut}"
    padding: "0 26px"
    height: "54px"
  button-small:
    backgroundColor: "{colors.gold-text}"
    textColor: "{colors.porcelain-ground}"
    rounded: "{rounded.cut}"
    padding: "0 16px"
    height: "42px"
  button-emblem:
    backgroundColor: "{colors.emblem-indigo}"
    textColor: "{colors.porcelain-ground}"
    typography: "{typography.label}"
    rounded: "{rounded.cut}"
    padding: "0 26px"
    height: "54px"
  chip:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink-indigo}"
    rounded: "{rounded.cut}"
    padding: "0 20px"
    height: "48px"
  chip-selected:
    backgroundColor: "{colors.woven-label}"
    textColor: "{colors.emblem-indigo}"
    rounded: "{rounded.cut}"
    padding: "0 20px"
    height: "48px"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink-indigo}"
    typography: "{typography.body}"
    rounded: "{rounded.cut}"
    padding: "12px 16px"
    height: "52px"
  card-panel:
    backgroundColor: "{colors.pearl-raised}"
    textColor: "{colors.ink-indigo}"
    rounded: "{rounded.cut}"
    padding: "clamp(28px, 3vw, 44px)"
  verdict-card:
    backgroundColor: "{colors.woven-label}"
    textColor: "{colors.emblem-indigo}"
    rounded: "{rounded.cut}"
    padding: "34px 32px 30px"
  toast:
    backgroundColor: "{colors.woven-label}"
    textColor: "{colors.emblem-indigo}"
    rounded: "{rounded.toast}"
    padding: "14px 18px"
  footer:
    backgroundColor: "{colors.night-indigo}"
    textColor: "{colors.night-text}"
---

# Design System: RCCG Dayspring Chapel

## Overview

**Creative North Star: "The White Agbada"**

The page is a ceremonial garment. A white agbada of porcelain and pearl cloth, embroidered in gold thread around the RCCG emblem at its neckline, worn on the day a congregation dedicates its own house. Everything visible is cloth, thread, or label: grounds are woven fabric with a faint indigo-and-gold twill, separators are running stitches, buttons are garment labels with a basted inner edge, and the one deep surface (the footer) is the indigo lining that shows at the hem. Opulence comes from restraint and handwork, never from clutter or decoration for its own sake.

The emblem's own indigo (#291871 family) is the system's ink; gold is the system's thread. White is not empty space here but the fabric itself: it carries a 45-degree twill weave and, on pointer devices, a soft gold sheen that follows the hand. Type speaks in two registers: Bodoni Moda for the voice (names, headlines, verses, the address), Hanken Grotesk for everything a visitor reads to act or presses. Motion is spring-tactile and interruptible; the hero yoke is sewn in on load by a single progress variable, seams sew themselves closed as they scroll in, and sound is a strictly opt-in needle click.

The built world diverges from the direction contract written before the white switch: that contract originally named indigo twill grounds and wine linings and has since been updated to the white world. The shipped world is white. Indigo survives as ink, emblem accent and the deep footer; "wine" survives only as legacy modifier names whose values are now warm pearl.

**Key Characteristics:**
- Porcelain and pearl cloth grounds with a woven twill texture, never flat white boxes.
- Gold for thread (strokes, stitches, ornament) and a darker text-safe gold for words and primary actions.
- The emblem's indigo as ink and as the one deep anchor (footer, `.theme-deep`).
- Dashed running-stitch rules instead of solid borders; basted inner outlines inside buttons, cards and labels.
- Near-square corners (2px) everywhere; the only curves are the embroidery itself and round icon buttons.
- Bodoni Moda display with optical sizing over Hanken Grotesk at 17px.

## Colors

A white garment with gold embroidery and indigo ink: two warm-white grounds, a pale indigo-tinted raise, gold in three strengths, and the emblem's indigo for text and accent.

### Primary
- **Text-Safe Gold** (#7d5d22): the colour of words and actions on white. Primary buttons (as a vertical gradient from #86662a to #6b501c), text links, `.live` next-service line, icons in contact lists, focus outlines, selection highlight, caret. Passes AA on porcelain and pearl.
- **Deep Gold** (#6c4f1a): emphasis gold. Hover colour for links, the first-ranked gathering name, pledge and timeline headings, the large numerals in fact rows.
- **Embroidery Gold** (#b08b40): thread only. Strokes of the yoke embroidery, the seal rings, the pastors' arch. Never used for body text (it fails AA on white).
- **Pale Gold** (#e2d1a6): scrollbar thumb and the softest gold surface tint.

### Secondary
- **Emblem Indigo** (#291871): the RCCG emblem's own field colour. Text on woven labels, the verdict card and toasts; the filled button inside the verdict card (hover #3a27a0); every shadow and twill tint is built from its RGB (41 24 113).

### Neutral
- **Ink Indigo** (#1c1546): primary text on all light grounds.
- **Soft Ink** (#57507c): secondary text, captions, metadata, body paragraphs.
- **Warm Soft Ink** (#5d4e5b): secondary text on the lining (warm pearl) grounds and in verses.
- **Porcelain Ground** (#fcfbf7): page background, header veil (as `rgb(252 251 247 / .88)` with 14px blur).
- **Pearl Field** (#f8f6f1): alternate cloth band (`.cloth--deep`).
- **Raised Pearl** (#f7f6f9): cool-tinted raise for channel cards, ways panels, the drawer.
- **Lining** (#faf8f3) and **Deep Lining** (#f4f0e7): warm bands and warm cards (`.cloth--lining`, `.channel--lining`).
- **Woven Label** (#f6ecd4): the gold-cream of a garment label: labels, selected chips, toasts. The verdict card sits on a near-white pearl (#fbf8f1) so it never becomes a cream plane on the white page.
- **Stitch Line** (rgb 160 125 55 at .22 to .55 alpha): every dashed rule, ghost-button edge and input outline.

### Deep anchor (token override)
- **Night Indigo** (#15103a) with **Raised Night** (#1d1650), **Night Text** (#f5efe3), **Night Soft Text** (#c3bddf), **Night Gold** (#d8b56a, deep #f1d99c): the footer and any `.theme-deep` block redefine the same semantic tokens rather than introducing new classes. Sheen switches from `multiply` to `screen` and the twill strengthens.

### Named Rules
**The Thread and Ink Rule.** Gold that must be read is #7d5d22 or darker; #b08b40 is thread and only ever strokes ornament. If a gold element carries words, it uses the text-safe gold.

**The One Lining Rule.** There is exactly one dark surface family, the indigo lining, and it is reached only by overriding tokens (`.footer`, `.theme-deep`). Light sections never invent their own dark fills.

**The Emblem Is Untouched Rule.** The RCCG emblem appears as the supplied raster, unrecoloured, always on a white disc or white ground. The palette borrows from it; it never paints over it.

## Typography

**Display Font:** Bodoni Moda (with Didot, Bodoni 72, serif), variable optical size 6 to 96, weights 400 to 700, italic for verses.
**Body Font:** Hanken Grotesk (with Helvetica Neue, Arial, sans-serif), weights 400, 500, 600.

**Character:** A high-contrast Didone at hairline weight is the voice of a tailor's label and a hymn book; a plain, warm grotesk carries times, addresses and buttons so older visitors on phones read them without effort.

### Hierarchy
- **Display** (400, clamp(46px, 7.2vw, 96px), 0.98, -0.02em, opsz 96): page H1s and the hero name only.
- **Headline** (400, clamp(36px, 4.8vw, 68px), 1.04, -0.015em, opsz 72): section H2s; also the pull quote at up to 64px.
- **Title** (400, clamp(24px, 2.3vw, 32px), 1.15, opsz 36): card and group titles, FAQ heading. Ranked gathering names scale from 72px (next up) down to 21px by rank.
- **Lede** (400, clamp(21px, 2vw, 27px), 1.4): opening paragraph in the display face; the address and the threshold question use the same register.
- **Body** (400, 17px, 1.65): Hanken Grotesk, soft ink, max 62ch.
- **Label** (600, 15px, 0.02em): buttons, nav, footer headings, `.small` metadata (15px), captions (15px), fine print (13px). Nothing interactive drops below 15px.
- **Numerals** (Bodoni 400, clamp(36px, 3.6vw, 52px), deep gold): fact figures; times use `lining-nums tabular-nums`.

### Named Rules
**The Two Voices Rule.** Bodoni speaks (names, headings, verses, the address, the quote); Hanken works (anything read to act, anything pressed). Bodoni is never used for a button or a form field.

**The Optical Size Rule.** Every Bodoni setting declares `font-variation-settings: "opsz"` matched to its size (18 to 96), so hairlines stay intact at display and sturdy at 17px.

## Layout

A centred column of cloth bands. Content sits in `.wrap` (max 1360px) with a fluid gutter (clamp(20px, 4.5vw, 72px)). Sections breathe at clamp(80px, 10vw, 144px) vertical padding (snug: clamp(64px, 8vw, 112px)). Two-column compositions use a 12-column grid (gap clamp(24px, 3vw, 48px)) with an asymmetric 6 / gap / 5 split, or 7fr / 5fr for planner, inner-page heroes, visit and give panels. Vertical rhythm inside blocks is 24px (`.stack`) and 40px (`.stack-lg`).

The home hero is strictly symmetric: the yoke embroidery is centred at up to 860px wide (aspect 1000 / 640, shrinking with viewport height), emblem at its heart, with the name, church line, next-service line and two actions centred beneath. The ministries groups step down diagonally (0, 64px, 128px offsets). "The house" is a sticky horizontal photo strip driven by scroll with a stitched progress rule.

Breakpoints: 1100px (footer to 2 columns, shelf to 3), 900px (header 64px, everything single column, drawer becomes a bottom sheet, fixed 72px action bar appears with next service + Plan + Directions), 600px (shelf 2 columns, hero buttons full width, footer 1 column).

**The Next Service Rule.** The next gathering and the address are never more than one glance away: in the hero on desktop, in the fixed action bar on phones.

## Elevation & Depth

Depth is textile, not material-design. Surfaces are flat cloth separated by tone (porcelain, pearl, lining) and by stitched seams; shadows appear only where a real object lifts off the fabric (a book, a card held out, the emblem on its disc, a sliding drawer). All shadows are tinted with the emblem's indigo, long and soft with negative spread, never grey and never hard-offset.

### Shadow Vocabulary
- **Emblem lift** (`box-shadow: 0 22px 50px -16px rgb(41 24 113 / .3), 0 0 0 10px rgb(255 255 255 / .9)`): the emblem in the hero, with its white collar ring.
- **Object** (`box-shadow: 0 24px 34px -18px rgb(41 24 113 / .26), 0 2px 4px rgb(41 24 113 / .12)`): book and album covers; deepens on hover to `0 34px 44px -20px rgb(41 24 113 / .3)` with an 8px rise.
- **Held card** (`box-shadow: 0 30px 60px -28px rgb(41 24 113 / .26)`): the sticky verdict card.
- **Drawer** (`box-shadow: 18px 0 60px -20px rgb(41 24 113 / .2)`; on phones `0 -18px 60px -20px`): menu panel over a `rgb(28 21 70 / .32)` scrim.
- **Toast** (`box-shadow: 0 16px 40px -12px rgb(41 24 113 / .2)`).

### Named Rules
**The Cloth Is Flat Rule.** Bands and panels never take shadows; they are separated by tone and seams. A shadow means a physical object resting on the cloth.

**The Sheen Rule.** Light, not elevation, answers the hand: on fine pointers a 520px radial gold glow follows the cursor across `.cloth` (multiply on white, screen on the indigo lining).

## Shapes

Tailored and nearly square. The working radius is 2px (buttons, chips, inputs, cards, photographs) and 1px for book covers and inner basting. Round shapes are reserved for 44px icon buttons (sound, close), the emblem disc and the embroidery itself. The phone drawer is the single soft shape (18px top corners, with a 44 x 5px handle).

Two recurring silhouettes carry the world:
- **The basted edge:** a 1px dashed outline inset 4 to 10px inside a filled shape (buttons, cards, verdict, photo frames).
- **The label notch:** woven labels and planner chips are clipped with V-notched ends (`polygon(0 0, 100% 0, calc(100% - 10px) 50%, 100% 100%, 0 100%, 10px 50%)`, 7px on chips).

**The Running Stitch Rule.** Rules and borders are dashed stitch, never solid: `repeating-linear-gradient` dashes (9/6, 6/5, 4/3 px) or `1px dashed rgb(var(--line) / .22 to .4)`. Seams between sections (`.hem`) sew themselves left to right as they enter the viewport.

## Components

### Buttons
Garment labels: firm, square, with a basted inner edge.
- **Shape:** near-square (2px), min-height 54px, padding 0 26px, gap 12px for a trailing or leading Phosphor icon (19px).
- **Primary:** text-safe gold gradient (#86662a to #6b501c) with #fffaf0 text, 15px / 600 / 0.02em; inner dashed edge `inset 4px, 1px dashed rgb(255 246 222 / .5)`.
- **Hover / Focus / Active:** hover lifts the gradient a step (#93722f to #77591f), fine pointers only; focus is a 2px text-safe gold outline at 3px offset; active presses to scale(0.97) in 160ms on the `out` curve.
- **Ghost:** transparent with ink text and a 1px inset stitch-line edge (`rgb(var(--line) / .55)`); hover tints the cloth `rgb(var(--line) / .1)`.
- **Small:** 42px high, 0 16px. **Emblem:** inside the verdict card, buttons fill with emblem indigo (hover #3a27a0).

### Chips
- **Style:** white with a 1px inset stitch-line edge, V-notched ends, 48px high, 15px / 500.
- **State:** selected becomes a woven label (cream #f6ecd4 with fine indigo warp lines, emblem-indigo text, 600, dashed inner rules top and bottom). Radio inputs, so the planner reads as questions with one answer each.

### Cards / Containers
- **Corner Style:** 2px.
- **Background:** raised pearl (channels, ways), deep lining (warm channel), porcelain.
- **Shadow Strategy:** none; see The Cloth Is Flat Rule.
- **Border:** a basted inner outline inset 8px (`1px dashed rgb(var(--line) / .28 to .35)`).
- **Internal Padding:** clamp(28px, 3vw, 44px) to clamp(28px, 3.4vw, 48px).

### Inputs / Fields
- **Style:** white fill, 52px min-height, 12px 16px padding, 2px radius, 1px inset stitch-line edge at .45; label above in 15px / 600 soft ink.
- **Focus:** the edge thickens to a 2px inset text-safe gold ring; no outer glow.
- **Error:** `:user-invalid` swaps to a 2px #c0392b ring with a 13px #a52a1f message beneath. Select arrows are drawn in gold with two gradients.

### Navigation
- **Header (the neckline):** fixed, 76px (64px on phones), three-column grid with Menu + two links left, emblem and Bodoni wordmark centred, sound toggle, Give and a small primary button right. Transparent over the hero; becomes a porcelain veil (88%, 14px blur) with a stitched bottom seam once scrolled; hides on scroll down.
- **Links:** 15px / 500; a 4/3 dashed gold underline draws in from the left on hover and stays for `aria-current`.
- **Drawer:** side panel (max 520px) on desktop, bottom sheet on phones (88svh, draggable), raised-pearl ground. Items are Bodoni at clamp(30px, 4.2vh, 40px) with a Hanken sub-line, separated by dashed rules, staggering in by 30ms; current page is gold.
- **Mobile action bar:** fixed 72px porcelain veil with stitched top seam: next service on the left, Plan (primary) and Directions (ghost) right.

### Yoke Embroidery (signature)
The hero ornament is an SVG agbada yoke (generated by `tools_yoke.py`): satin strokes (3.2px), thin satin (2px), running stitch (2.1px, 7/5 dash), fine running stitch (1.4px, 4/4, 75% opacity) and knots, all in embroidery gold with round caps and joins. A single `--p` progress variable sews every stitch in through masked stroke-dashoffsets with per-path delays, and the emblem fades and settles from 0.92 scale as it completes. Its concentric rings return as the **seal** (168px, three rings, emblem at the centre) at the close of the give section.

### Woven Label (signature)
A garment label used sparingly (Crossover date, visit page): cream ground with indigo warp lines, V-notched ends, dashed inner rules, Bodoni 17px / 600 uppercase at 0.14em over a 13px Hanken line. It is a standalone object, never a heading prefix.

### Ranked Gatherings
The schedule is ordered by how soon each gathering comes, and type size follows rank: the next one is set at clamp(38px, 5vw, 72px) in deep gold, then 40px, 30px, 24px. Each row is separated by dashed rules, with time detail in 15px soft ink and a gold "in N days" countdown.

### Verdict Card
The planner's answer: a woven-label cream card with a dashed inner edge inset 8px, Bodoni title, a checklist with indigo Phosphor icons, and full-width emblem-indigo buttons (add to calendar, email). Sticks beside the questions on desktop; blurs to 20% opacity for 250ms while it recomposes.

## Do's and Don'ts

### Do:
- **Do** treat every light surface as cloth: give bands `.cloth` (twill at .022 / .03 alpha and pointer sheen) and alternate porcelain #fcfbf7, pearl #f8f6f1 and lining #faf8f3.
- **Do** set gold words in #7d5d22 (or #6c4f1a for emphasis) and reserve #b08b40 for embroidery strokes.
- **Do** separate content with dashed running-stitch rules in `rgb(160 125 55 / .22 to .4)` and baste filled shapes with an inset dashed edge.
- **Do** tint every shadow with the emblem's indigo `rgb(41 24 113)` and keep them long, soft and negatively spread.
- **Do** reach the dark world only by overriding tokens on a container (`.footer`, `.theme-deep`), so components stay the same and only the cloth changes.
- **Do** keep interactive targets at least 44px (buttons 54px, chips 48px, inputs 52px) and interactive text at 15px or larger.
- **Do** use the `out` curve `cubic-bezier(0.23, 1, 0.32, 1)` for state changes, the `drawer` curve `cubic-bezier(0.32, 0.72, 0, 1)` for panels, scale(0.97) on press, and collapse motion entirely under `prefers-reduced-motion`.

### Don't:
- **Don't** recolour, redraw or place the RCCG emblem on a coloured fill; it sits on white.
- **Don't** use solid 1px borders or grey hairlines; seams are stitched.
- **Don't** round corners beyond 2px on buttons, cards, chips, inputs or photographs.
- **Don't** set body text, buttons or form fields in Bodoni Moda, or headings in Hanken Grotesk.
- **Don't** add dark section fills, gradients or new accent hues to the light pages; the palette is white cloth, gold thread, indigo ink.
- **Don't** put drop shadows on flat bands or panels; shadows belong to objects (covers, the emblem, held cards, sheets).
- **Don't** make sound play without the visitor turning it on.
