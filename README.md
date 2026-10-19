# RCCG Dayspring Chapel: website

A luxury-grade rebuild of [rccgdayspring.org](https://rccgdayspring.org): static HTML, CSS and vanilla JS, with no CMS and no build dependencies.

- **`site/`** is the deployable website. It's already built, so open `site/index.html` or serve the folder.
- **`src/`** holds the page sources (`src/pages`) and the shared header, menu and footer (`src/partials`).
- **`build.py`** assembles `src` into `site/*.html`. Run `python3 build.py` after editing anything in `src/`.
- **`source-assets/originals/`** contains the untouched images pulled from the current site.
- **`docs/SITE-REVIEW.md`** is the audit of the current site, the design rationale and the open items for the church.
- **`docs/IMAGE-BRIEF.md`** has the ChatGPT prompts for generated assets and a shot list for a real photo shoot.

## Preview locally
```bash
python3 build.py
cd site && python3 -m http.server 8000   # http://localhost:8000
```

## Deploy
The output folder is `site`. `vercel.json` already points Vercel at it, and Netlify or Cloudflare Pages work with a publish directory of `site` and no build command.

## Editing
- **Service times** appear in four places:
  - the `.spec` rows in `src/pages/index.html` and `src/pages/visit.html`
  - the menu and footer partials
  - `upcomingGatherings()` in `site/assets/js/main.js`, which drives the live "Next gathering" clock
- **Colours and type** are the tokens at the top of `site/assets/css/main.css`.
- **The mark** is `site/assets/img/mark.svg`. The inline copy lives in `src/partials/mark.html`.
