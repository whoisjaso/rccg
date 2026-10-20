# Studying a reference site

When the user names a site they love ("make it like patek.com"), that site is the brief. Copy its system, never its content or brand.

## Capture
```
node scripts/capture_reference.mjs https://www.patek.com/en ./ref-capture
```
Outputs `d-00..` desktop and `m-00..` mobile scroll frames, `d-menu.png`, and `metrics.json` (fonts loaded, computed h1/h2/p/nav styles, body background). The script clicks common consent buttons ("Allow all", "Accept all", "Accept"); if frames still show a banner, add the site's button text with `--consent "Text"`.

Build a contact sheet and look at every frame on both widths.

## Extract the system (write these down)
1. **Hero mechanics:** static, carousel, video, or stacked sticky slides? Where does copy sit? How big is the title, what weight, uppercase or not?
2. **Header:** transparent or solid, logo position, what is on each side, when it changes.
3. **Type:** families (from `metrics.json`), weights, sizes, tracking, case for titles vs body vs labels.
4. **Rhythm:** section types in order (spreads, bands, statements, lists, grids), grounds used, spacing between sections.
5. **Controls:** button shape and fill, link style, icons.
6. **Menu:** overlay, panel, or drawer; how links are styled.
7. **Footer:** columns, heading style, utilities (language, reduce motion).
8. **Motion:** scroll smoothing, reveals, parallax, what moves and what does not.
9. **Mobile:** what collapses, what stays, hero crop behaviour.

## Translate
Map each element to a component in `maison-design-system.md`, adapting fonts when the reference uses proprietary faces (pick the closest Google Font). Keep the client's own conversion needs (next appointment, plan a visit, directions) inside the reference's vocabulary rather than adding a different style of UI.

## Pitfalls seen in practice
- A cookie banner hides half the frames; recapture after dismissing it.
- Reference sites carry lots of products; a small business has few. Use fewer, bigger moments instead of padding with filler sections.
- Do not copy the reference's colours if they clash with the client's logo; keep the system, borrow the logo's quietest hue for accents.
