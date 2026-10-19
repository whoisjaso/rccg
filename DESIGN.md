---
name: RCCG Dayspring Chapel
description: A maison website for a church. White space, light uppercase titles, a quiet serif voice, warm taupe, full-bleed photography that stacks as you scroll.
colors:
  white: "#ffffff"
  paper: "#f7f6f4"
  ink: "#2e2e33"
  ink-soft: "#5c5b62"
  taupe: "#8a7965"
  taupe-deep: "#6e5f4e"
  taupe-press: "#5c4f41"
  line: "#e4e0da"
  night: "#1d1b1a"
  error: "#b3261e"
typography:
  display:
    fontFamily: "Open Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(28px, 3.1vw, 44px)"
    fontWeight: 300
    lineHeight: 1.15
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Open Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(24px, 2.2vw, 32px)"
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: "0.02em"
  title:
    fontFamily: "Open Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(17px, 1.3vw, 19px)"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "0.06em"
  body:
    fontFamily: "Lora, Georgia, Times New Roman, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "0.01em"
  label:
    fontFamily: "Open Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.12em"
rounded:
  none: "0px"
  pill: "999px"
  round: "50%"
spacing:
  gutter: "clamp(20px, 5.5vw, 80px)"
  section: "clamp(88px, 11vw, 160px)"
  feature-gap: "clamp(96px, 12vw, 180px)"
  column-gap: "clamp(24px, 3vw, 48px)"
  max: "1100px"
  wide: "1440px"
  header: "88px"
  header-sm: "64px"
components:
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.taupe-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "42px"
  button-outline-hover:
    backgroundColor: "{colors.taupe-deep}"
    textColor: "{colors.white}"
  button-solid:
    backgroundColor: "{colors.taupe-deep}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "42px"
  button-solid-hover:
    backgroundColor: "{colors.taupe-press}"
  button-white:
    backgroundColor: "{colors.white}"
    textColor: "{colors.taupe-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "42px"
  button-white-hover:
    backgroundColor: "{colors.paper}"
  button-glass:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "42px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "42px"
  chip-selected:
    backgroundColor: "{colors.taupe-deep}"
    textColor: "{colors.white}"
  input-field:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "10px 0"
    height: "48px"
  plan-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "clamp(28px, 3vw, 44px)"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "14px 20px"
---

# Design System: RCCG Dayspring Chapel

## Overview

**Creative North Star: "The Maison on Hartsook Street"**

The site is built the way a watch house presents itself, with patek.com as the binding reference (a user decision recorded in PRODUCT.md): full-bleed photography that holds the screen and stacks as you scroll, then calm white editorial spreads where a light uppercase title, a few lines of serif and one outline pill do all the talking. Opulence comes from restraint and finish, never from ornament. There are no cards in a grid, no banners, no announcement strips, no gradients for their own sake.

The surface is white, with one warm paper ground (#f7f6f4) as the only alternate. Ink is a soft charcoal, never black. Warm taupe is the single accent, and it is used the way a maison uses its house colour: on titles, the selected chip, the active nav item, icons and the focus ring. Behind photography the ground turns to night (#1d1b1a) so the slides read as one continuous dark film before the white begins.

Density is low and the rhythm is long: sections breathe at up to 160px top and bottom, features are separated by up to 180px, body text never runs past 58ch. Motion is slow, eased and interruptible; smooth scrolling (Lenis) runs on desktop and touch, the stacked slides recede as the next one rises, photographs open with a clip reveal. Sound is synthesized in the browser, off until chosen. Both sound and motion have visible toggles in the footer. An earlier direction (indigo grounds and white agbada embroidery) was rejected by the user as not premium and is not part of this system.

**Key Characteristics:**
- White plus one warm paper ground; charcoal ink; taupe as the only accent.
- Open Sans Light uppercase titles over Lora serif text.
- Outline pill buttons; square photographs; hairline rules instead of boxes.
- Full-bleed stacked photo slides with vertical dots on the home page; 82svh photo heroes on inner pages.
- Two-column editorial spreads on a 12-column grid, alternating sides.
- The RCCG emblem small and centred in the header, the loader and the footer.
- Every photograph lives in a named slot that the church can replace with a better image of the same name.

## Colors

A near-monochrome warm-neutral palette: white and paper grounds, charcoal ink, and one warm taupe accent in two strengths.

### Primary
- **Maison Taupe** (taupe-deep): the working accent and the only colour allowed at text size. Section headlines, label text, outline pill text and fill, the selected chip, the current nav item, the toggle when on, the active service row. Measures 6.2:1 on white, 5.7:1 on paper; white on it measures 6.2:1.
- **Pale Taupe** (taupe): the decorative strength. Icons in lists, contacts and FAQ, the select chevron, the loader progress line, the focus outline, the text selection and caret. 4.2:1 on white and 3.9:1 on paper, so it is for icons, rules and large display only, never for body or label text.
- **Pressed Taupe** (taupe-press): hover state of the solid pill only.

### Neutral
- **White** (white): the default ground for every page, the menu panel, the plan card and the solid header.
- **Warm Paper** (paper): the one alternate section ground (`section--paper`), the shelf behind book covers, the map placeholder.
- **Charcoal Ink** (ink): all body text and the solid header's text; the toast ground. 13.5:1 on white.
- **Soft Ink** (ink-soft): secondary text: service times, FAQ answers, footer legal, field labels, the plan card's time line. 6.7:1 on white.
- **Hairline** (line): every rule: list dividers, FAQ, footer, menu rows, the solid header's bottom edge, the loader track.
- **Night** (night): the ground behind the stacked slides and inner-page photo heroes, so photographs never sit on white while loading or receding. The menu scrim is night at 35%.
- **Error Red** (error): invalid field underline and its message; nowhere else.

Photo copy sits on a fixed warm-black overlay (rgb 20 18 17 at 45 to 62%, fading toward the right and the top), so white text on any slide holds contrast whatever image fills the slot.

### Named Rules
**The Two Taupes Rule.** Text-size taupe is always taupe-deep. Pale taupe is for icons, rules, focus and selection; it never carries a sentence or a label.

**The One Accent Rule.** Taupe is the only hue in the interface. New features get emphasis from size, weight, space or position, never from a new colour.

**The One Paper Rule.** White and #f7f6f4 are the only light grounds. No tinted cards, no third neutral, no coloured section bands; colour beyond these comes only from photography.

## Typography

**Display Font:** Open Sans 300/400 (with Helvetica Neue, Arial)
**Body Font:** Lora 400, 400 italic, 500 (with Georgia, Times New Roman)

**Character:** A light, widely tracked uppercase sans for every title, like engraving on a case back, over a warm book serif that does the speaking. The sans never carries paragraphs; the serif never goes uppercase.

### Hierarchy
- **Display** (Open Sans 300, clamp(28px, 3.1vw, 44px), 1.15, uppercase, 0.02em): slide and hero titles over photography only, white.
- **Headline** (Open Sans 300, clamp(24px, 2.2vw, 32px), 1.2, uppercase, 0.02em, taupe-deep): section and spread titles on white or paper.
- **Title** (Open Sans 400, clamp(17px, 1.3vw, 19px), 1.35, uppercase, 0.06em): sub-titles inside a spread or list. Related uppercase light names: service rows (17px, the first row 21 to 26px in taupe-deep), plan card date (22 to 28px), menu links (19px, 0.08em).
- **Body** (Lora 400, 16px, 1.75, 0.01em): all running text, max 58ch (62ch in FAQ answers, 46ch on slides). Secondary lines drop to 15px in ink-soft. Italic only for author bylines on the shelf.
- **Label** (Open Sans 400, 12px, 0.12em, uppercase): form legends, footer column heads, pill text (0.1em), the "next service" line, tabular service times. Labels name controls and columns; they never sit above a headline as a kicker.

Numbers that align (times, years) use lining tabular figures.

### Named Rules
**The Light Title Rule.** Every title is Open Sans, uppercase, weight 300 (400 only at the small Title step), with balanced wrapping. No bold titles, no serif titles, no mixed case.

**The No-Kicker Rule.** A headline stands alone. Do not stack a small uppercase label above it; the label style is reserved for form legends, column heads and controls.

## Layout

- **Container:** content max 1100px, wide max 1440px (footer, shelf), side gutter clamp(20px, 5.5vw, 80px).
- **Section rhythm:** clamp(88px, 11vw, 160px) top and bottom; consecutive features separated by clamp(96px, 12vw, 180px). Sections alternate white and paper.
- **Editorial spread:** a 12-column grid; media spans 6 columns at a 4:5 crop (5:4 for the wide variant), copy spans columns 8 to 12. The flip variant mirrors it. Spreads alternate sides down a page.
- **Statement:** a centred headline (max 26ch), one paragraph and centred pills, used to open lists such as services and the shelf.
- **Stacked slides:** each slide is 100svh (min 560px) and sticky at the top, so the next slide rises over it. Copy sits bottom-left, max 560px wide. A vertical rail of dots is pinned right of centre.
- **Full-bleed band:** 78svh photograph with copy bottom-left, max 640px.
- **Inner page hero:** 82svh photograph on night, same copy position.
- **Plan:** 6fr / 5fr columns; the plan card is sticky at 104px.
- **Header:** 88px, three columns (menu left, centred emblem and wordmark, sound, directions and call to action right); shrinks to 72px and turns solid white after the hero. 64px under 860px.
- **Breakpoints:** 1000px (shelf to 3 columns, footer to 2), 860px (everything single column and centred, mobile action bar appears, header CTA hides), 600px (shelf to 2 columns).
- **Mobile action bar:** under 860px a fixed 68px white bar carries the next service, a directions icon pill and a solid "Plan a visit" pill; the page reserves its height at the bottom.

### Named Rules
**The Glance Rule.** The next service is never more than one glance away: on slide one, in the mobile action bar, and in the footer.

## Elevation & Depth

Flat by default. Depth comes from photography, sticky layering and hairlines, not from shadow. The stacked slides create the main sense of depth: the covered slide scales down by up to 6%, lifts 4% and darkens under the one rising over it. Shadows exist in only three places, all soft and warm-ink based.

### Shadow Vocabulary
- **Plan card lift** (`box-shadow: 0 1px 0 #e4e0da, 0 30px 60px -36px rgb(46 46 51 / .35)`): the one floating container, the plan card.
- **Object shadow** (`box-shadow: 0 18px 30px -16px rgb(46 46 51 / .45)`): book and album covers on the shelf, as if resting on paper.
- **Toast shadow** (`box-shadow: 0 16px 40px -14px rgb(0 0 0 / .45)`): transient confirmation toasts.

The solid header uses a 1px hairline shadow plus 10px backdrop blur, not elevation.

### Named Rules
**The Hairline Rule.** Structure is drawn with 1px #e4e0da rules (top and bottom of lists, between rows), never with boxed cards or tinted panels.

## Shapes

Two shapes only: the square and the pill. Photographs, spreads, bands, the plan card, the map and form fields are square-cornered. Everything you press is a full pill (999px): buttons, chips, toasts. Circles appear only for icon buttons (44px), slide dots (8px) and the toggle thumb. Fields are a single bottom underline with no box. Pills draw their outline as an inset 1px shadow in currentColor so the stroke never changes the box size.

## Components

### Buttons
Quiet, engraved, never loud. Uppercase Open Sans 12px at 0.1em, 42px tall (minimum), 24px side padding, full pill.
- **Outline (default):** transparent with a 1px taupe-deep stroke and taupe-deep text. Hover fills taupe-deep with white text.
- **Solid:** taupe-deep with white text; hover deepens to taupe-press. Used for the one primary action in a context (mobile bar, plan card).
- **White:** white with taupe-deep text, for calls to action on photography; hover goes to paper.
- **Glass:** white text and a 75% white stroke on the transparent header over photography; turns into the outline style when the header goes solid.
- **Press:** every pill scales to 0.97 on press (160ms). Hover styles apply only on hover-capable fine pointers.
- **Icon buttons:** 44px circles with a 22px Phosphor regular icon; hover is a 14% grey wash, press scales to 0.94.

### Chips
- **Style:** pill, 42px, 20px side padding, 13px Open Sans at 0.04em in ink with a 1px #d6d0c6 inset stroke. Built on visually hidden radio inputs.
- **State:** hover strokes in pale taupe; selected fills taupe-deep with white text; focus shows a 1px pale taupe outline at 3px offset.

### Cards / Containers
- **Plan card:** the only card. White, square, clamp(28px, 3vw, 44px) padding, plan card lift shadow, sticky beside the planner. Inside: a light uppercase date, a soft time line, an icon list on a 22px icon column, then full-width stacked pills. When answers change, the body dims to 25% with a 2px blur, then returns.
- **Shelf work:** a paper 4:5 tile with the cover inset 14% and the object shadow; uppercase 12px title and an italic serif byline centred beneath. Hover lifts the cover 6px.

### Inputs / Fields
- **Style:** no box, transparent, 48px tall, a single bottom underline, 16px serif text. Labels above in 12px uppercase ink-soft.
- **Focus:** the underline turns taupe-deep; no glow.
- **Error:** underline and message turn error red, shown only after user interaction (`:user-invalid`).
- **Select:** the same underline with a small two-stroke chevron in pale taupe.

### Navigation
- **Header:** transparent white-on-photo at 88px; after the hero it becomes 96% white with blur, charcoal text, a hairline bottom and 72px height; it hides on scroll down and returns on scroll up. Left: "Menu" with a list icon (label hidden under 860px). Centre: the RCCG emblem (34px, 28px when solid) over "Dayspring Chapel" (15px, 0.14em) and "Houston" (11px, 0.32em). Right: the sound icon button, a directions icon button and a glass "Plan a visit" pill (the last two hidden under 860px).
- **Menu panel:** a left drawer up to 460px (full width on phones) over a night scrim, sliding in on the drawer curve over 550ms. Links are 19px light uppercase rows divided by hairlines, each with a small pale taupe caret; rows enter with a 30ms stagger; hover nudges the link 6px right in taupe-deep; the current page is taupe-deep. Contact details sit in the panel foot.

### Stacked Slides (signature)
Four full-bleed slides on night, each sticky so the next rises over it. Copy bottom-left: display title, one serif line at 92% white, a white pill; slide one adds the live "next service" line computed in Houston time. A vertical rail of 8px outlined dots sits right; the active dot fills white and scales to 1.2. The covered slide recedes (scale and shade).

### Services List
Gatherings in the order they come, each row on hairlines: a light uppercase name with its time beneath in soft ink, and on the right an uppercase "in X days" note in taupe-deep beside an outline "Add to calendar" pill that downloads a calendar entry. The next gathering is promoted: larger (21 to 26px) and in taupe-deep.

### FAQ
Native details on hairlines: 13px uppercase questions, a pale taupe plus icon that rotates 45 degrees when open, height animated to auto over 350ms, answers in soft ink at 62ch.

### Footer
Four columns of 12px taupe-deep uppercase heads over 14.5px serif lists, then a hairline and a three-part brand row: legal line left, centred emblem and wordmark, and two switches right: **Sound** and **Reduce motion**. Switches are 32 by 18px tracks, taupe-deep when on, with a white thumb; both choices are remembered.

### Loader
White screen, the emblem fading and settling in (76px), the wordmark in 20px light uppercase at 0.32em, and a 140px hairline that fills with pale taupe. Full length on first visit in a session, quick after that and under reduced motion.

### Toast
A charcoal pill, 13px sans at 0.03em, a warm pale icon, rising 14px into place at the bottom centre.

### Image Slots
Every photograph lives in `site/assets/img/slots/` under a fixed name and size family: `hero-*` (16:9, 2400 and 1280), `ed-*` (4:5, 1400 and 800), `band-*` (21:9, 2400 and 1280). Each file carries a `.json` provenance sidecar. These are placeholders the church replaces with its own rebuilt photographs of the same names (see docs/IMAGE-BRIEF.md); the layout, crops and copy positions are designed around the slot, not the current image.

### Motion
- **Curves:** out `cubic-bezier(0.23, 1, 0.32, 1)` for almost everything; in-out `cubic-bezier(0.77, 0, 0.175, 1)` for the loader line; drawer `cubic-bezier(0.32, 0.72, 0, 1)` for the menu and scrim.
- **Durations:** 160ms press, 200 to 300ms colour states, 400 to 550ms header and drawer, 1.2 to 1.6s photograph reveal.
- **Photograph reveal:** the one authored motion for imagery: the frame opens from an 8% top clip while the image settles from 1.06 scale.
- **Smooth scroll:** Lenis 1.1.13, duration 1.15 with expo easing, synced on touch. Stopped while the menu is open and disabled under reduced motion.
- **Reduced motion:** the system preference or the footer switch collapses all animation and transition to near zero and turns smooth scroll off.

### Named Rules
**The Slot Rule.** Photographs are replaceable by name. Reference images only through `assets/img/slots/` with the slot's name and sizes, never hard-wire a one-off file into a layout; when the church supplies a new image under the same name, it must drop in without code changes.

**The Opt-In Senses Rule.** Sound is off until the visitor turns it on, and both sound and motion can be switched off from every page. Any new motion or sound must respect both switches.

## Do's and Don'ts

### Do:
- **Do** set every title in Open Sans Light uppercase and every paragraph in Lora; keep running text at 16px, 1.75 line height, under 58ch.
- **Do** use taupe-deep (#6e5f4e) for any taupe text, and pale taupe (#8a7965) only for icons, rules, focus and selection.
- **Do** draw structure with 1px #e4e0da hairlines and generous white space instead of boxes.
- **Do** use outline pills by default, a white pill on photography, and a single solid pill for the primary action in a context.
- **Do** put photographs full-bleed on night, or square at 4:5 in a 6-of-12 column spread, and alternate spread sides down a page.
- **Do** place imagery through named slots in `site/assets/img/slots/` with a provenance `.json`, so the church's own replacements of the same name drop in.
- **Do** keep the RCCG emblem unaltered, small and centred.
- **Do** keep the next service visible within one glance, and end every page with a way to come on Sunday.
- **Do** respect reduced motion and keep sound opt-in, with both toggles in the footer.

### Don't:
- **Don't** introduce a second accent hue, a tinted card ground, or any light ground besides white and #f7f6f4.
- **Don't** use bold or mixed-case titles, serif titles, or uppercase serif.
- **Don't** add rounded-corner cards, card grids, banners or announcement strips; the only card is the plan card.
- **Don't** place a small uppercase label above a headline as a kicker.
- **Don't** put white text on a photograph without the warm overlay, or place photographs directly on white while loading.
- **Don't** use pale taupe (#8a7965) for body, label or button text.
- **Don't** recolour, redraw or enlarge the RCCG emblem into a hero graphic.
- **Don't** bring back the rejected indigo or agbada embroidery vocabulary.
