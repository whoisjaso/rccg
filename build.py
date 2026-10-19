#!/usr/bin/env python3
"""Assemble site/*.html from src/partials + src/pages. No dependencies.

Each page in src/pages starts with a front-matter comment:
<!--
title: ...
description: ...
page: home
og: ribbon-1600.webp
-->
Tokens: {{title}} {{description}} {{page}} {{path}} {{og}}
        {{cur:key}}         -> aria-current="page" when key == page
        {{mark:class:width}} -> inline Dayspring monogram
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC, OUT = ROOT / "src", ROOT / "site"
part = lambda n: (SRC / "partials" / f"{n}.html").read_text(encoding="utf-8")
MARK = part("mark").strip()


def render(tpl, meta):
    tpl = re.sub(r"\{\{mark:([\w-]*):([\d.]+)\}\}",
                 lambda m: MARK.replace("{{cls}}", m.group(1)).replace("{{sw}}", m.group(2)), tpl)
    tpl = re.sub(r"\{\{cur:(\w+)\}\}",
                 lambda m: ' aria-current="page"' if m.group(1) == meta["page"] else "", tpl)
    return re.sub(r"\{\{(\w+)\}\}", lambda m: meta.get(m.group(1), m.group(0)), tpl)


for page in sorted((SRC / "pages").glob("*.html")):
    raw = page.read_text(encoding="utf-8")
    fm = re.match(r"\s*<!--(.*?)-->", raw, re.S)
    meta = dict(re.findall(r"^\s*(\w+):\s*(.+?)\s*$", fm.group(1), re.M))
    meta.setdefault("og", "ribbon-1600.webp")
    meta["path"] = "" if page.stem == "index" else page.name
    body = raw[fm.end():]
    html = render(part("head") + part("header") + '<main id="main">' + body + "</main>\n" + part("footer"), meta)
    if page.stem == "404":  # served from arbitrary paths; anchor relative URLs at the root
        html = html.replace("<head>\n", '<head>\n<base href="/">\n', 1)
    (OUT / page.name).write_text(html, encoding="utf-8")
    print("built", page.name)
