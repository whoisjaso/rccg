# Maison design system (patek-derived)

The system the client approved, implemented in `assets/starter/`. Adapt tokens and copy per client; keep the grammar.

## Tokens
```css
--white: #ffffff;  --paper: #f7f6f4;       /* one alternate ground, never cream */
--ink: #2e2e33;    --ink-soft: #5c5b62;    /* text */
--taupe: #8a7965;  --taupe-deep: #6e5f4e;  /* the only accent: icons/rules, and AA text */
--line: #e4e0da;   --night: #1d1b1a;       /* hairlines; behind photo slides */
--sans: "Open Sans";  --serif: "Lora";     /* Patek's own pairing */
--out: cubic-bezier(.23,1,.32,1); --drawer: cubic-bezier(.32,.72,0,1);
```
Swap the accent to the client's brand hue only if it stays muted and passes 4.5:1 for text.

## Type
- Titles: sans weight 300, uppercase, letter-spacing .02em; display clamp(28px, 3.1vw, 44px); section titles clamp(24px, 2.2vw, 32px) in the accent colour.
- Text: serif 16px / 1.75, max 58ch.
- Labels and buttons: sans 12px, .1em tracking, uppercase.
- Tabular figures for times and prices.

## Components
- **Header:** transparent over the hero (MENU + icon left; small centred logo above the uppercase wordmark and a spaced city line; icons right), soft drop-shadow on its contents so it reads on bright photos; turns solid white with a hairline once past the hero; the primary CTA pill appears only when solid; hides on scroll down, returns on scroll up.
- **Menu panel:** white panel sliding from the left, uppercase light links with chevrons and hairlines, next appointment and directions at the foot.
- **Stacked hero:** 3 to 5 `position: sticky` full-viewport slides; the covered slide scales to 0.94 and darkens as the next rises; vertical dot rail on the right (clickable); each slide: title, one serif line, one white pill; first slide also shows the live next-appointment line on desktop. Gradients: lower-left and a soft top shade so header and copy read on any photo.
- **Editorial spread:** 12-column grid, image 6 columns at 4:5, copy 5 columns, alternate sides; clip-path reveal on scroll; centred stack on phones.
- **Band:** full-bleed photo (78svh) with copy bottom-left and white pills; slow parallax.
- **Statement:** centred accent title, one soft line, pills.
- **Rows:** title left, description right, hairline separated (for ministries/services/products lists instead of card grids).
- **Shelf:** products/books at one object scale on paper tiles, uppercase caption plus italic byline on one baseline.
- **Pills:** outline (accent), solid (accent fill), white (on photos), glass (outline white on photos).
- **Footer:** four columns with small accent headings, a brand row with the logo centred, and toggles for sound and reduce motion.

## Conversion features in the same vocabulary
- **Live next appointment** line (hero, menu, mobile bar), computed in the business's timezone, switching to "Happening now".
- **Upcoming list** sorted by what comes next, nearest emphasised, each with "Add to calendar" producing a real `.ics` (VTIMEZONE, RRULE for recurring, 1-hour alarm).
- **Plan your visit** picker: three chip questions (who, which, what would help) producing a plan card (date, arrive-by time, tailored notes, Add to calendar, Directions, prefilled email). Hairline card on paper, not a floating shadow card.
- **FAQ** from facts only, animated details with `interpolate-size`.
- **Mobile action bar** below 860px: short next-appointment text, a directions icon pill, the primary solid pill.
- **schema.org** structured data with address, phone, opening hours, parent organisation, sameAs socials.
- **Media:** YouTube/Facebook/books/products wired to the real URLs from the old site.

## Motion and sound
- Lenis 1.1.x smooth scroll for wheel and touch (`syncTouch: true`, lerp ~0.085) because users explicitly asked for smooth scroll on mobile; reduce-motion toggle destroys it.
- Loader: logo, wordmark and a hairline that fills, ~1.5s first visit, ~0.5s after; never blocks more than 4s.
- Sound (only if requested): synthesized Web Audio pad and soft bell, off by default, remembered, paused when the tab hides.
- Button press scale .97, 160ms ease-out; nothing bounces.

## Responsive
Breakpoints 1000 / 860 / 600. On phones: hide the city line, 24px logo, single-column footer, centred spreads, per-slot `object-position` classes so faces stay in frame, no horizontal overflow at 390px.

## Bans
Em dashes, eyebrow kickers, section numbers, scroll cues, custom cursors, three equal feature cards, invented stats/testimonials, stock people, AI lettering.
