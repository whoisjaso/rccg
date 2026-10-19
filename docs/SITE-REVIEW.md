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

## 2. The new direction: The White Agbada

**The idea.** The site is a garment. A white ceremonial agbada, the garment worn to celebrations across the Nigerian diaspora, with gold embroidery stitched around the **official RCCG emblem**. Newcomers see a calm, opulent, light-filled house. Diaspora visitors recognise the emblem and the cloth instantly.

**Identity.**
- **The RCCG emblem leads**, unaltered.
- **"Dayspring Chapel"** is set in Bodoni Moda, a couture serif.
- **Interface text** is Hanken Grotesk.
- **Icons** come from the Phosphor set.

**Palette.** Every colour comes from the cloth and the emblem:

| Role | Hex |
|---|---|
| Porcelain ground | `#FCFBF7` |
| Lilac pearl | `#F2EFF8` |
| Warm pearl | `#F5EFE3` |
| Embroidery gold | `#B08B40` |
| Text-safe gold | `#7D5D22` |
| Ink, the emblem's own field | `#291871` family, `#1C1546` |
| Footer, the one dark anchor | Deep indigo `#15103A` |

**Signature moments.**
- **The threshold.** On a first visit, 76 gold threads embroider the yoke around the emblem. Each stitch makes a needle sound if sound is on. Then the visitor chooses "Enter with sound" or "Enter in silence". All sound is synthesised live in the browser and is strictly opt-in.
- **Sheen.** Soft light follows the pointer across the cloth.
- **Stitched hems.** The seams between sections sew themselves in as you scroll.
- **Motion.** In the spirit of Emil Kowalski: short ease-out transitions, buttons that press (scale 0.97), and a draggable bottom-sheet menu on phones. Toasts confirm actions like "Added to your calendar".

**What drives attendance ("occupancy").**
1. **A live "Next service" line** in the opening screen, the menu and a sticky phone bar. It reads, for example, "Bible Study, Wed 7 pm, in 2 days" in Houston time, and switches to "Happening now".
2. **A services list ranked by what comes next.** The nearest service is set largest, with one-tap **Add to calendar**: real `.ics` files with weekly or last-Friday repeats and a one-hour reminder.
3. **Plan your Sunday.** Three taps (who is coming, which gathering, what would help) produce a personal plan card with:
   - the date
   - an arrival time
   - notes for families, children, prayer or meeting the pastors
   - Add to calendar, Directions, and "Let us know you are coming" (a pre-written email)
4. **First-visit questions**, answered from known facts only.
5. **Directions everywhere.** One tap to Google Maps from the opening screen, the menu, the phone bar and the visit page.
6. **Google structured data** for the church, its address and its Sunday and Wednesday hours, so "church near me" searches can show service times.
7. **A sticky phone bar.** Next service, Directions and Plan a visit are always one thumb away.

**Pages:** Welcome, Plan a visit, The pastors, Ministries, Books and music, Give.

## 3. Open items for the church to confirm

- [ ] **Fellowship meeting days, times and leaders.** The pages say times are shared in church; send them and they go live.
- [ ] **The Crossover format.** The countdown assumes 31 December, 10 pm, Houston time.
- [ ] **A vector RCCG emblem (SVG or PDF)** for maximum sharpness.
- [ ] **Instagram, Spotify and WhatsApp links**, if they exist. A WhatsApp "message us" button would help diaspora visitors most.
- [ ] **A form backend** (Formspree or Netlify Forms) so messages send in place instead of opening the visitor's email app.
- [ ] **A Google Business Profile with service times and photos.** This is the biggest free attendance lever outside the site.
- [ ] **The photo shoot and the generated images.** See `IMAGE-BRIEF.md`.
