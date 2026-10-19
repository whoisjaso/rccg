# RCCG Dayspring Chapel: site review and redesign rationale

Audit of **rccgdayspring.org** as of 19 Oct 2026, and the reasoning behind the new site in `/site`.

---

## 1. What the current site gets wrong

### Critical (fix these regardless of design)
| # | Issue | Evidence | Impact |
|---|---|---|---|
| 1 | **The Contact page is broken.** It returns `403 Forbidden`. | `GET /contact/` shows "Access to this page is forbidden." | Every visitor who tries to reach the church through the nav hits a dead end. |
| 2 | **The event listing is stale.** "Crossover 2026 – Time 10:00pm" is still up in October 2026. | Homepage, "Upcoming Events" | Tells visitors nobody maintains the site. |
| 3 | **The copyright reads 2023.** | Footer | Same signal: the site looks abandoned. |
| 4 | **A public "Login" link points to `/wp-admin/`.** | Footer | Invites brute-force attempts and looks amateur. |
| 5 | **The fellowship pages are empty.** Men's, Women's, Youth and Seniors each have a title and one stock photo, with no text, times or contact. | `/mens-fellowship/` and the others | Four of the nine nav items lead nowhere. |

### Brand and perception
- **Stock photography carries the ministry pages.** Every fellowship and church-group image is generic stock (smiling models with Bibles, a cartoonish "children's church" shot). Visitors recognise stock instantly, and it reads as "not real".
- **There is no real identity.** The "logo" is a 400×116 px blue/purple banner. The site uses the denomination's emblem, but Dayspring itself has no mark of its own.
- **The colours are default-WordPress blue and purple.** Nothing about the palette is owned or deliberate.
- **Typography is default Divi sans-serif.** It has no hierarchy and no voice.
- **One block repeats on every page.** "Worship Ministry Material" (books and CDs) appears at the bottom of all nine pages, so the site feels like a template.

### Experience and structure
- **The menu is nine items in two dropdowns** (Our Pastors ▸, Fellowships ▸). There is no "Plan a Visit" and no "Give" in the main nav. The two actions that matter most are buried in the footer.
- **Nothing tells a first-time guest what to expect.** There is no parking or arrival information and no welcome flow.
- **YouTube appears only as "Subscribe" text links.** The Faith Declarations devotional, one of the church's strongest assets, is invisible.
- **The PayPal link carries about 600 characters of email-campaign tracking parameters.**
- **There is no map, no structured data for Google, and no Open Graph images.** When someone shares the link on WhatsApp or Facebook, the preview is plain.
- **The page is heavy.** It's built on WordPress + Divi + SiteGround optimiser, and the homepage HTML alone is about 248 KB before any assets.

### What is genuinely strong (and is kept)
- **The 2025 documentary photographs of the new building's dedication.** The ribbon cutting, worship and the congregation are real, warm and multinational. That is your best proof of life.
- **The studio portraits of the pastors.** The couple cut-out in particular is excellent.
- **The pastors' story** is substantial: an engineer turned theologian, an accountant turned ordained pastor, churches planted on two continents, books and albums.
- **The new permanent campus.** It's a milestone worth building the story around.
- **The name itself.** *Dayspring* comes from Luke 1:78: "the dayspring from on high hath visited us". It's one of the most beautiful words in Scripture, and the old site never used it.

---

## 2. The new direction: "The House"

**Positioning:** the restraint of Loro Piana and Brunello Cucinelli, the ceremony of Patek Philippe, the threshold moment of Porsche and Ferrari.
Luxury here doesn't mean gold everywhere. It means confidence, space, slowness and craft.

### Identity
- **The mark** is a new vector monogram: a sun rising over still water with a cross at its zenith, set in a fine ring. It's drawn directly from Luke 1:78. It works at 16 px as a favicon and at billboard size. File: `site/assets/img/mark.svg`.
- **The wordmark** is **DAYSPRING** in wide-tracked Cormorant Garamond, with *Chapel · Houston* beneath it.
- **The denomination** is honoured, not hidden. The RCCG emblem sits in the footer as "A parish of The Redeemed Christian Church of God".

### Palette
| Token | Hex | Use |
|---|---|---|
| Ink | `#0E0D0B` | Primary ground: warm near-black, never pure black |
| Bone | `#F2EDE4` | Light sections, text on ink |
| Ivory | `#F9F6F0` | Light editorial sections |
| Brass | `#C9A96E` | The only accent: hairlines, numerals, italics |
| Stone | `#A69D90` | Secondary text |

### Typography
- **Cormorant Garamond.** Light weights for display and italic for emphasis. This is the voice of the house.
- **Manrope.** Small, wide-tracked uppercase for labels. This is the detail, like a watch dial's minute track.
- **Roman numerals (I–X)** structure every section, the way a maison numbers its collections.

### Photography
Every photograph was re-graded for one look: desaturated, warm split-tone, lifted blacks, fine film grain and a soft vignette. The documentary gallery runs in toned monochrome and **blooms into colour on hover**, so the phone photos read as campaign images.

### The experience: what makes it memorable
1. **The threshold.** On the first visit, the monogram draws itself line by line, the letters of DAYSPRING resolve out of blur, Luke 1:78 fades in and a brass progress line fills. Then the visitor chooses: **"Enter with sound"** or **"Enter in silence"**. The screen splits like a curtain and the house opens. Returning visitors get a one-second version.
2. **Sound design.** Every sound is synthesised live in the browser, so there are no files to download:
   - an ambient organ-like pad (D major add 9, slowly breathing through a filter)
   - a glassy tick on hover
   - a small two-note bell on click
   - a breath of air when the menu or a page transition opens
   - a rising arpeggio on arrival

   It's off by default, the visitor's choice is remembered, and it pauses when the tab is hidden.
3. **A live clock.** The hero always shows the *next* gathering in Houston time ("Bible Study & Prayer Warfare: Wednesday 7:00 PM, in 2d 2h 34m"). It switches to "In session now" during services, and handles the last Friday of the month for Power Night.
4. **The Crossover countdown** rolls over to the next year automatically. It never goes stale again.
5. **The mandate reveal.** The mission statement lights up word by word as the visitor reads down the page.
6. **The pinned gallery.** Scrolling down moves the dedication story sideways, frame by frame, with a brass progress line.
7. **The menu.** It's a full-screen ink overlay with numbered serif chapters. Hovering a chapter crossfades a photograph on the right with a one-line italic caption.
8. **Page transitions.** An ink curtain rises with the monogram before every page change.
9. **Details:** a custom brass cursor that becomes "View", "Listen", "Acquire" or "Watch" over the right objects; magnetic buttons; book covers that turn toward you on hover; a portrait that follows the cursor through the fellowship list; film grain over everything; and a giant outlined "Dayspring" signing off every page.

### Structure: six chapters instead of nine scattered pages
| | Page | Purpose |
|---|---|---|
| I | Welcome | Hero, live service clock, mandate, pastors, the new house, gatherings, Crossover, library, broadcast, visit, give |
| II | The Pastors | Full editorial biographies, timelines, scripture interlude |
| III | Ministries | Four fellowships and three church groups, with real copy |
| IV | The Library | The three books and two albums, each presented like a product |
| V | Plan a Visit | Schedule, first-Sunday guide, live map, contact form |
| VI | Give | PayPal (clean link), giving in service, partnership |

### Technical
- **Static HTML, CSS and vanilla JS.** There's no WordPress, no plugins, no database and nothing to hack. It loads fast and hosts free on Vercel, Netlify or Cloudflare Pages.
- **Lenis smooth-scroll from CDN is optional.** The site works fully without it.
- **Accessibility is built in:** a skip link, `prefers-reduced-motion` respected (animations collapse, the loader shortens), focus states, alt text, an inert menu when closed, and Escape to close.
- **SEO and sharing:** `Church` structured data (address, phone, parent organisation), Open Graph images and canonical URLs on every page.
- **Images are 4.8 MB total in WebP**, served at multiple sizes with `srcset`.

---

## 3. Open items for the church to confirm

- [ ] **Fellowship meeting days and times, and a leader name for each.** The new pages have descriptive copy but no schedule, because none was published.
- [ ] **Whether the next Crossover service follows the same 10:00 pm format.** The countdown assumes 31 Dec at 10:00 pm, Houston time.
- [ ] **The founding year of the Dayspring parish**, for a possible "Est." line.
- [ ] **Instagram and Spotify URLs**, if they exist, so they can be added to the footer.
- [ ] **A contact form backend.** The form currently opens the visitor's email app pre-filled to info@rccgdayspring.org. A service like Formspree or Netlify Forms would make it submit in place.
- [ ] **A photo shoot.** See `IMAGE-BRIEF.md`. This is the single biggest upgrade still available.
