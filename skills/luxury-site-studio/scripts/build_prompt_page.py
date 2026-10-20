#!/usr/bin/env python3
"""Build the labelled prompt page (images next to the prompts they go with).

Usage:
  python build_prompt_page.py <IMAGE-BRIEF.md> <reference-dir> <out-dir> [--title "Brand image prompts"]

Then publish <out-dir>/index.html as an artifact with every file in <out-dir>/img as supporting files.

Brief format (one section per image):
  ## #1 The pastors (opening slide)
  **Upload:** `src-pastors-couple.png` + `style-site-hero.png`
  **Save as:** `hero-pastors-2400.png`
  **Where:** Opening slide on the home page            <- optional, shown under the title
  ```
  ...prompt...
  ```
Optional extras section:
  ## Optional new angles
  **`detail-bible-1400.png`** (upload `src-worship.jpg`):
  ```
  ...prompt...
  ```
Image labels: a markdown table in the brief whose first column is a backticked filename and
second column a plain description is used for captions; otherwise the filename is prettified.
"""
import argparse, html, re, shutil
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("brief"); ap.add_argument("refdir"); ap.add_argument("out")
ap.add_argument("--title", default="Image prompts")
ap.add_argument("--lead", default="Each card shows exactly which images to upload, the prompt to paste, and the name to send the result back under.")
a = ap.parse_args()

src = Path(a.brief).read_text(encoding="utf-8")
out = Path(a.out); (out / "img").mkdir(parents=True, exist_ok=True)
template = (Path(__file__).resolve().parent.parent / "assets" / "prompt-page-template.html").read_text(encoding="utf-8")

labels = {m.group(1): re.sub(r"[*_`]", "", m.group(2)).strip() for m in re.finditer(r"^\|\s*`([^`]+)`\s*\|\s*([^|]+)\|", src, re.M)}
pretty = lambda f: labels.get(f) or re.sub(r"^(src|ref)-", "", f.rsplit(".", 1)[0]).replace("-", " ").capitalize()
kind = lambda f: "Style reference" if f.startswith("style") else ("Logo" if any(k in f for k in ("emblem", "logo")) else "Source photo")
used = set()


def figs(files):
    o = []
    for i, f in enumerate(files, 1):
        used.add(f)
        o.append(f'''<figure class="ref"><div class="ref__img"><img src="img/{html.escape(f)}" alt="{html.escape(pretty(f))}" loading="lazy"></div>
<figcaption><span class="ref__n">Upload {i}</span><span class="ref__kind">{kind(f)}</span><b>{html.escape(pretty(f))}</b><code>{html.escape(f)}</code></figcaption></figure>''')
    return "\n".join(o)


def card(num, title, where, files, prompt, save, idx, first=False):
    pid = f"p{idx}"; anchor = f"prompt-{num or idx}"
    return f'''<article class="card{' card--first' if first else ''}" id="{anchor}">
  <header class="card__head"><span class="card__num">{'#' + num if num else 'Extra'}</span>
    <div class="card__titles"><h2>{html.escape(title)}{' <span class="badge">Start here</span>' if first else ''}</h2><p>{html.escape(where)}</p></div></header>
  <div class="card__body">
    <section class="step"><h3><span class="step__n">1</span>Upload these {len(files)} images</h3>
      <p class="hint">Drag each image straight into the chat, or right-click (long-press on a phone) and save it first.</p>
      <div class="refs">{figs(files)}</div></section>
    <section class="step"><div class="step__row"><h3><span class="step__n">2</span>Paste this prompt</h3><button class="copy" type="button" data-copy="{pid}">Copy prompt</button></div>
      <pre class="prompt" id="{pid}">{html.escape(prompt)}</pre></section>
    <section class="step step--save"><h3><span class="step__n">3</span>Send the result back, labelled</h3>
      <p class="save"><code>{html.escape(save)}</code> <button class="copy copy--small" type="button" data-copy-text="{html.escape(save)}">Copy name</button></p></section>
  </div></article>'''


main_part, _, extra_part = src.partition("## Optional new angles")
cards, nav = [], []
for i, s in enumerate(re.split(r"\n## #", main_part)[1:], 1):
    head, body = s.split("\n", 1)
    num, title = head.split(" ", 1)
    where_m = re.search(r"\*\*Where[^:]*:\*\*\s*(.+)", body)
    paren = re.search(r"\(([^)]*)\)", title)
    where = where_m.group(1).strip() if where_m else (paren.group(1) if paren else "")
    title = re.sub(r"\s*\(.*?\)\s*", " ", title).replace("★", "").replace("Do this first.", "").strip(" .")
    files = re.findall(r"`([^`]+\.(?:png|jpe?g|webp))`", re.search(r"\*\*Upload:\*\*\s*(.+)", body).group(1))
    save = re.search(r"\*\*Save as:\*\*\s*`([^`]+)`", body).group(1)
    prompt = re.search(r"```\n(.*?)\n```", body, re.S).group(1)
    cards.append(card(num, title, where, files, prompt, save, i, first=(i == 1)))
    nav.append(f'<a href="#prompt-{num}"><span>#{num}</span>{html.escape(title)}</a>')

extras = []
style = next((f for f in labels if f.startswith("style")), "style-site-hero.png")
for j, m in enumerate(re.finditer(r"\*\*`([^`]+)`:?\*\*(?:\s*\(upload `([^`]+)`\))?:?\s*\n```\n(.*?)\n```", extra_part, re.S), 1):
    save, srcf, prompt = m.groups()
    files = ([srcf] if srcf else []) + [style]
    title = re.sub(r"-\d+$", "", save.rsplit(".", 1)[0]).replace("-", " ").capitalize()
    extras.append(card("", title, "Optional new angle", files, prompt, save, 100 + j))

for f in used:
    p = Path(a.refdir) / f
    if p.exists():
        shutil.copy(p, out / "img" / f)
    else:
        print("WARNING missing reference image:", p)

page = (template.replace("{{TITLE}}", html.escape(a.title)).replace("{{LEAD}}", html.escape(a.lead))
        .replace("{{NAV}}", "".join(nav)).replace("{{CARDS}}", "".join(cards))
        .replace("{{EXTRAS}}", "".join(extras) if extras else "<p class=\"foot\">No optional angles in this brief.</p>"))
(out / "index.html").write_text(page, encoding="utf-8")
print(f"{len(cards)} cards, {len(extras)} extras -> {out/'index.html'}; images in {out/'img'}")
