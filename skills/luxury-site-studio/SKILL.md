---
name: luxury-site-studio
description: End-to-end studio for redesigning a business, church, dealership, clinic or personal-brand website into a luxury, maison-grade experience (Patek Philippe, Loro Piana, Brunello Cucinelli, Porsche register). Studies a live reference site the user loves, rebuilds the site from the client's real content and logo, then turns the client's real photos into campaign-grade imagery through precision ChatGPT prompts delivered on a labelled prompt page, and installs each returned image with face, lettering and crop checks. Use this whenever someone wants a site to look premium, opulent, luxurious, high-end, "like Patek/Rolex/Apple/Porsche", wants to redo or "make way better" an existing website, wants image-generation prompts for website photos, or asks to turn a brand's existing photos into luxury campaign images, even if they never say "skill" or "luxury".
---

# Luxury Site Studio

Turn an ordinary website into one that feels like a luxury maison, using the client's own truth: their real logo, real people, real content and real photos, elevated.

This skill encodes a workflow that was proven on a real client after two rejected attempts. The rejections are the most important part of it: read **What the client taught us** before designing anything.

## What the client taught us (read first)

1. **"Luxury" is a reference, not an adjective.** Two original concepts (a dark editorial site, then a cultural "embroidery" concept, first indigo and then white) were both rejected as "not premium". The win came the moment the user pinned a real site (patek.com) and the build copied its *system*: type, scroll behaviour, layout rhythm, minimalism. So **ask for a reference site early** (one question, offering three or four premium examples in their category), and when one is given it overrides your taste and any concept roll.
2. **Real faces stay real.** People photos get *rebuilt* (light, background, clutter, angle) but every face, skin tone, garment and person-count is locked. Verify every return against the source.
3. **AI lettering is always wrong.** Logos and signs in generated images come back garbled ("RIDEEMED"). Never ship them; composite the official logo file instead (`scripts/fix_logo.py`).
4. **The user sometimes prefers the original.** Keep every generated image *and* the clean-graded original; swapping back must take one minute.
5. **Deliver files where the user can touch them.** Reference photos sitting in a repo are invisible to the user. Put images *next to their prompts* in a published page with copy buttons and plain labels (`scripts/build_prompt_page.py`).
6. **Prompts must be hyper-detailed.** "Pinpoint accuracy" means: people listed left to right with exact clothing, identity lock, removals, light direction and colour temperature, lens and camera height, frame size, where faces sit as % of width, which area must stay empty for text, colour targets, and a do-not list.
7. **Keep moving.** The user sends images one at a time, mid-task, sometimes out of order. Install each as it arrives, show desktop + phone proof, commit, and name the next one.

## The workflow

### Phase 1. Harvest the existing site (truth)
- Download the current site HTML and every page; extract text, nav, contact details, schedules, products/books/media, social links (`curl -sL` + a small HTML-to-text pass; Firecrawl if credits exist).
- Download every original image at full size into `source-assets/originals/` (strip WordPress `-300x200` suffixes to get the originals). Download the official logo at the largest size available; sample its exact colours.
- Write `PRODUCT.md`: audience, purpose (the action the site must drive), facts, what must never be invented (testimonials, numbers, schedules, staff). Record the binding reference site once given.
- Audit the old site for real defects (broken pages, stale events, exposed admin links, stock photos, empty pages) and list them for the user; this builds trust and often justifies the rebuild.

### Phase 2. Study the reference site (system)
Run `scripts/capture_reference.mjs <url> <outdir>`: it dismisses the cookie banner, captures desktop and mobile scroll frames, and prints computed fonts, sizes, weights, letter-spacing and colours. Then write down the system you will reproduce, for example for patek.com:
- full-bleed photo slides that stick and stack as you scroll, vertical dots on the right
- transparent header over the hero: MENU left, small centred logo with wordmark, icons right; turns solid white after the hero
- light (300) uppercase sans titles bottom-left on slides, a serif body line, white pill button
- below the hero: white and one paper ground, two-column image/text spreads alternating sides, full-bleed photo bands, hairline rules, outline pills, a white multi-column footer with small accent headings and a reduce-motion toggle
- smooth inertial scroll on desktop and touch

See `references/maison-design-system.md` for the full token set, components and the patek-derived starter implementation in `assets/starter/`.

### Phase 3. Build (structure first, placeholder photos)
- Start from `assets/starter/` (copy `src/` and `site/` into the project and `scripts/build.py` to its root, then run `python build.py` from the root after every edit to `src/`; static HTML/CSS/vanilla JS, Lenis smooth scroll, Phosphor icons, Google Fonts). Adapt tokens and copy to the client; do not ship the starter's client content.
- Put every photo in a **named slot** under `site/assets/img/slots/` (`hero-*` 16:9, `ed-*` 4:5, `band-*` 21:9 or 2:1, `detail-*` 4:5). Fill slots with clean-graded originals first: `python scripts/prep_slots.py slots.json source-assets/originals site/assets/img/slots` (a small JSON names each slot's source photo, ratio and focus). The site works and looks right before any AI image exists.
- Keep conversion features in the luxury vocabulary: live "next appointment/service" line, list of upcoming times with real `.ics` calendar files, a 3-question "plan your visit" picker that ends in a personal plan card, FAQ from known facts only, a sticky mobile action bar (next + directions + primary action), schema.org structured data. Details in `references/maison-design-system.md`.
- Sound and a loader are allowed if the user asked for them, but stay subtle and opt-in.

### Phase 4. Image prompts (the deliverable the user runs)
- Copy the source photos into `docs/reference/` with plain names (`src-pastors-couple.png`, `src-building-render.jpg`, `emblem-official.png`, `style-site-hero.png` = a screenshot of the built hero as the mood reference).
- **Look at every source photo in detail before writing its prompt.** Count people. Note left-to-right order, clothing, accessories, what to remove (screens with text, cars, power lines, clutter).
- Write one prompt per slot following `references/image-prompting.md` (the exact anatomy, safe zones and phrasing that produced first-try results).
- Write the brief in the format shown in `assets/example-image-brief.md` (a real 10-prompt brief). Publish the prompt page: `python scripts/build_prompt_page.py docs/IMAGE-BRIEF.md docs/reference <out-dir> --title "<Brand> image prompts"` then publish `<out-dir>/index.html` as an artifact with its `img/` files. Each card: numbered title, where it appears on the site, step 1 images labelled "Upload 1/2" with kind + plain name + filename, step 2 the prompt with Copy button, step 3 the filename to send back with Copy button. Also send the reference images and a zip directly with the file tool.

### Phase 5. Install each returned image
For every image the user sends back:
1. Copy the original to `source-assets/generated/<slot>-chatgpt.webp`.
2. **People:** `scripts/face_check.py` side-by-side strips (source top, generated bottom) for every face; count heads. If wrong, tell the user the one-line correction to send ChatGPT ("Restore her exact face from the source photo, change nothing else").
3. **Logos/lettering:** zoom in (crop 4x). If garbled, measure the sign and composite the official file with `scripts/fix_logo.py`.
4. Install: `python scripts/install_slot.py <returned-image> site/assets/img/slots <slot-name> --sizes 2400,1280 --prompt "<provenance>"` (keeps native width under the largest slot name, never upscales, keeps the untouched original, writes `.json` provenance sidecars, and prints the true width to put in `srcset`). Update the `srcset` descriptors in the pages.
5. Set per-slot focal points with `object-position` classes for desktop and phone (faces, the subject, empty headline zone). Screenshot the exact section on desktop and phone with `scripts/shoot_section.mjs`; fix the crop until faces are fully in frame.
6. Commit, push, show the user the comparison and both screenshots, and name the next prompt.

When the user says "use the original for this one", regenerate that slot from the original with `prep_slots.py --only <slot>`, recrop so every head survives, keep the AI version on disk.

### Phase 6. Verify and finish
- `scripts/qa_sweep.mjs <base-url> <pages...>`: no page errors, no broken images, no horizontal overflow at 390 and 1440.
- Run an independent reviewer (fresh subagent) against the screenshots and the reference; fix material findings in one batch; at most two rounds.
- Record the built world in `DESIGN.md`. Write a short `docs/SITE-REVIEW.md` (old-site defects, new system, open items for the client).
- Deploy `site/` (Vercel config: `outputDirectory: site`). Open a PR if a base branch exists.

## Writing style for anything the visitor reads
No em dashes or en dashes anywhere visible. No eyebrow labels above headings, no section numbers, no scroll cues, no custom cursors, no fake stats or invented claims. Short, plain sentences in the client's voice. Every page ends with a clear next action.

## Files in this skill
- `references/maison-design-system.md`: tokens, type, components, motion, conversion features, responsive rules.
- `references/image-prompting.md`: prompt anatomy, safe zones, templates per slot type, correction lines, QA.
- `references/reference-study.md`: how to dissect a reference site and translate it into a system.
- `scripts/`: `capture_reference.mjs`, `build.py`, `prep_slots.py`, `install_slot.py`, `fix_logo.py`, `face_check.py`, `shoot_section.mjs`, `qa_sweep.mjs`, `build_prompt_page.py`.
- `assets/starter/`: the working patek-style implementation (partials, home page, CSS, JS) to adapt.
- `assets/prompt-page-template.html`: the labelled prompt page.
- `assets/example-image-brief.md`: a complete, proven brief to model new ones on.

Playwright scripts load from the global install (`createRequire('/opt/node22/lib/node_modules/')` style); if Playwright lives elsewhere, set `PW_PATH` to its `node_modules` directory.
