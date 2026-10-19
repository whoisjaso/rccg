/* ==========================================================================
   RCCG Dayspring Chapel — experience layer
   No dependencies. Lenis smooth-scroll is used when its CDN script loads.
   ========================================================================== */
(() => {
  "use strict";

  const doc = document.documentElement;
  const body = document.body;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };

  /* ------------------------------------------------------------------------
     Sound — every tone is synthesized live, nothing to download.
     Off until the visitor chooses it; the choice persists.
     ------------------------------------------------------------------------ */
  const Sound = {
    ctx: null, master: null, pad: null, on: false, lastTick: 0,
    init() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      const comp = this.ctx.createDynamicsCompressor();
      this.master.connect(comp).connect(this.ctx.destination);
      this.reverb = this.makeReverb(3.2);
      this.reverb.connect(this.master);
      return true;
    },
    makeReverb(seconds) {
      const c = this.ctx, rate = c.sampleRate, len = rate * seconds;
      const buf = c.createBuffer(2, len, rate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      }
      const conv = c.createConvolver();
      conv.buffer = buf;
      const g = c.createGain(); g.gain.value = 0.5;
      g.connect(conv);
      return { connect: (n) => conv.connect(n), input: g };
    },
    route(node, wet = 0.4) {
      const dry = this.ctx.createGain(); dry.gain.value = 1 - wet;
      const w = this.ctx.createGain(); w.gain.value = wet;
      node.connect(dry).connect(this.master);
      node.connect(w).connect(this.reverb.input);
    },
    enable() {
      if (!this.init()) return;
      this.ctx.resume();
      this.on = true;
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(0.9, t, 0.4);
      this.startPad();
      store.set("ds-sound", "on");
      $$(".sound").forEach((b) => { b.classList.add("is-on"); b.setAttribute("aria-pressed", "true"); });
    },
    disable() {
      this.on = false;
      if (this.ctx) {
        const t = this.ctx.currentTime;
        this.master.gain.setTargetAtTime(0, t, 0.35);
        setTimeout(() => this.stopPad(), 1600);
      }
      store.set("ds-sound", "off");
      $$(".sound").forEach((b) => { b.classList.remove("is-on"); b.setAttribute("aria-pressed", "false"); });
    },
    toggle() { this.on ? this.disable() : (this.enable(), this.chime()); },

    /* A slow, warm organ-like bed: D major add 9, detuned and filtered. */
    startPad() {
      if (this.pad) return;
      const c = this.ctx, t = c.currentTime;
      const out = c.createGain(); out.gain.value = 0;
      out.gain.setTargetAtTime(0.05, t, 2.5);
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700; lp.Q.value = 0.4;
      const lfo = c.createOscillator(); lfo.frequency.value = 0.05;
      const lfoAmt = c.createGain(); lfoAmt.gain.value = 320;
      lfo.connect(lfoAmt).connect(lp.frequency); lfo.start();
      const oscs = [];
      [73.42, 146.83, 220.0, 293.66, 369.99, 659.25].forEach((f, i) => {
        [-5, 5].forEach((cents) => {
          const o = c.createOscillator();
          o.type = i < 2 ? "sine" : "triangle";
          o.frequency.value = f; o.detune.value = cents;
          const g = c.createGain(); g.gain.value = i === 0 ? 0.5 : 0.22 / (1 + i * 0.25);
          o.connect(g).connect(lp); o.start(); oscs.push(o);
        });
      });
      lp.connect(out);
      this.route(out, 0.55);
      this.pad = { out, oscs, lfo };
    },
    stopPad() {
      if (!this.pad || this.on) return;
      const { out, oscs, lfo } = this.pad;
      const t = this.ctx.currentTime;
      out.gain.setTargetAtTime(0, t, 0.3);
      setTimeout(() => { oscs.forEach((o) => o.stop()); lfo.stop(); }, 1500);
      this.pad = null;
    },
    tone(freq, { type = "sine", gain = 0.05, attack = 0.004, decay = 0.6, wet = 0.4, when = 0 } = {}) {
      if (!this.on || !this.ctx) return;
      const c = this.ctx, t = c.currentTime + when;
      const o = c.createOscillator(); o.type = type; o.frequency.value = freq;
      const g = c.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain, t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
      o.connect(g); this.route(g, wet);
      o.start(t); o.stop(t + attack + decay + 0.05);
    },
    /* Hover: a glassy tick, throttled so it never chatters. */
    tick() {
      const now = performance.now();
      if (now - this.lastTick < 70) return;
      this.lastTick = now;
      this.tone(2349.3, { gain: 0.012, decay: 0.09, wet: 0.2 });
    },
    /* Click: a small bell — fifth over root. */
    chime() {
      this.tone(880, { gain: 0.04, decay: 1.2 });
      this.tone(1318.5, { gain: 0.022, decay: 1.4, when: 0.03 });
      this.tone(2637, { gain: 0.006, decay: 0.8, when: 0.03 });
    },
    /* Menu / curtain: a breath of filtered air with a low swell under it. */
    whoosh(up = true) {
      if (!this.on || !this.ctx) return;
      const c = this.ctx, t = c.currentTime, dur = 1.1;
      const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource(); src.buffer = buf;
      const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 0.9;
      bp.frequency.setValueAtTime(up ? 300 : 2200, t);
      bp.frequency.exponentialRampToValueAtTime(up ? 2400 : 280, t + dur);
      const g = c.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.07, t + dur * 0.45);
      g.gain.linearRampToValueAtTime(0, t + dur);
      src.connect(bp).connect(g); this.route(g, 0.5);
      src.start(t);
      this.tone(up ? 110 : 98, { gain: 0.05, attack: 0.25, decay: 1.1, wet: 0.6 });
    },
    /* Arrival: a slow major arpeggio for entering the house. */
    arrive() {
      [293.66, 369.99, 440, 587.33].forEach((f, i) => this.tone(f, { gain: 0.03, attack: 0.02, decay: 2.2, when: i * 0.14, wet: 0.65 }));
    },
  };

  document.addEventListener("visibilitychange", () => {
    if (!Sound.ctx) return;
    if (document.hidden) Sound.ctx.suspend(); else if (Sound.on) Sound.ctx.resume();
  });

  /* ------------------------------------------------------------------------
     Smooth scroll
     ------------------------------------------------------------------------ */
  let lenis = null;
  const scrollSubs = [];
  const onScroll = (fn) => scrollSubs.push(fn);
  const emitScroll = () => { const y = window.scrollY; scrollSubs.forEach((fn) => fn(y)); };

  function initScroll() {
    if (!reduceMotion && window.Lenis) {
      lenis = new window.Lenis({ duration: 1.25, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      lenis.on("scroll", emitScroll);
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } else {
      window.addEventListener("scroll", emitScroll, { passive: true });
    }
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const el = $(id);
      if (!el) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(el, { offset: -40 }) : el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }));
  }
  const lockScroll = (lock) => {
    body.classList.toggle("is-locked", lock);
    if (lenis) lock ? lenis.stop() : lenis.start();
  };

  /* ------------------------------------------------------------------------
     Loader — full ceremony on first visit, a breath on every page after.
     ------------------------------------------------------------------------ */
  function runLoader() {
    const loader = $(".loader");
    const reveal = () => { body.classList.add("is-loaded"); };
    if (!loader) { reveal(); return; }

    const first = !store.sget("ds-visited");
    const soundPref = store.get("ds-sound");
    if (!first || reduceMotion) loader.classList.add("loader--short");
    lockScroll(true);

    const fill = $(".loader__fill", loader);
    const count = $(".loader__count", loader);
    const duration = reduceMotion ? 300 : first ? 3200 : 1100;
    const start = performance.now();
    let pageReady = document.readyState === "complete";
    window.addEventListener("load", () => { pageReady = true; }, { once: true });

    const finish = (withSound) => {
      store.sset("ds-visited", "1");
      if (withSound === true) { Sound.enable(); Sound.arrive(); Sound.whoosh(true); }
      else if (withSound === false) { Sound.disable(); }
      loader.classList.add("is-out");
      setTimeout(reveal, 250);
      setTimeout(() => { loader.classList.add("is-done"); lockScroll(false); }, 1500);
    };

    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const shown = pageReady ? eased : Math.min(eased, 0.92);
      if (fill) fill.style.transform = `scaleX(${shown})`;
      if (count) count.textContent = String(Math.round(shown * 100)).padStart(3, "0");
      if (shown < 1) { requestAnimationFrame(step); return; }
      if (first && !reduceMotion) {
        // The threshold: the visitor chooses how to enter.
        loader.classList.add("is-ready");
        const withBtn = $("[data-enter='sound']", loader);
        const quietBtn = $("[data-enter='quiet']", loader);
        withBtn && withBtn.focus({ preventScroll: true });
        withBtn && withBtn.addEventListener("click", () => finish(true), { once: true });
        quietBtn && quietBtn.addEventListener("click", () => finish(false), { once: true });
      } else {
        // Returning visitor: honour their earlier sound choice (needs a gesture to resume).
        if (soundPref === "on") {
          Sound.init();
          $$(".sound").forEach((b) => b.classList.add("is-on"));
          const resume = () => { Sound.enable(); window.removeEventListener("pointerdown", resume); window.removeEventListener("keydown", resume); };
          window.addEventListener("pointerdown", resume, { once: true });
          window.addEventListener("keydown", resume, { once: true });
        }
        finish(null);
      }
    };
    requestAnimationFrame(step);
  }

  /* ------------------------------------------------------------------------
     Page transitions — an ink curtain rises before every internal journey.
     ------------------------------------------------------------------------ */
  function initTransitions() {
    const curtain = $(".curtain");
    if (!curtain || reduceMotion) return;
    $$("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || a.target === "_blank") return;
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      a.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (url.pathname === location.pathname && url.hash) return;
        e.preventDefault();
        Sound.whoosh(true);
        curtain.classList.add("is-in");
        setTimeout(() => { location.href = url.href; }, 850);
      });
    });
    window.addEventListener("pageshow", (e) => { if (e.persisted) curtain.classList.remove("is-in"); });
  }

  /* ------------------------------------------------------------------------
     Header
     ------------------------------------------------------------------------ */
  function initHeader() {
    const header = $(".header");
    if (!header) return;
    let last = 0;
    onScroll((y) => {
      header.classList.toggle("is-solid", y > 40);
      if (!body.classList.contains("is-menu-open")) header.classList.toggle("is-hidden", y > last && y > 400);
      last = y;
    });
    $$(".sound").forEach((b) => b.addEventListener("click", () => Sound.toggle()));
  }

  /* ------------------------------------------------------------------------
     Menu
     ------------------------------------------------------------------------ */
  function initMenu() {
    const btn = $(".menu-btn");
    const menu = $(".menu");
    if (!btn || !menu) return;
    const imgs = $$(".menu__visual img", menu);
    const caption = $(".menu__caption", menu);
    const setVisual = (key) => {
      imgs.forEach((img) => img.classList.toggle("is-active", img.dataset.key === key));
      const link = $(`.menu__link[data-key="${key}"]`, menu);
      if (caption && link) caption.textContent = link.dataset.caption || "";
    };
    const current = $(".menu__link[aria-current='page']", menu);
    setVisual(current ? current.dataset.key : "home");

    const open = (state) => {
      body.classList.toggle("is-menu-open", state);
      btn.setAttribute("aria-expanded", String(state));
      menu.setAttribute("aria-hidden", String(!state));
      menu.inert = !state;
      lockScroll(state);
      Sound.whoosh(state);
      if (state) setTimeout(() => { const f = $(".menu__link", menu); f && f.focus({ preventScroll: true }); }, 500);
    };
    menu.inert = true;
    btn.addEventListener("click", () => open(!body.classList.contains("is-menu-open")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && body.classList.contains("is-menu-open")) { open(false); btn.focus(); } });
    $$(".menu__link", menu).forEach((l) => {
      l.addEventListener("mouseenter", () => setVisual(l.dataset.key));
      l.addEventListener("focus", () => setVisual(l.dataset.key));
    });
  }

  /* ------------------------------------------------------------------------
     Reveals
     ------------------------------------------------------------------------ */
  function initReveals() {
    const targets = $$(".reveal, .fade, .ln-group, .footer__word");
    if (!("IntersectionObserver" in window) || reduceMotion) { targets.forEach((t) => t.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.01 });
    targets.forEach((t) => {
      // Hero copy waits for the curtain.
      if (t.closest(".hero, .phero")) {
        const go = () => setTimeout(() => t.classList.add("in"), 500);
        body.classList.contains("is-loaded") ? go() : new MutationObserver((m, o) => { if (body.classList.contains("is-loaded")) { o.disconnect(); go(); } }).observe(body, { attributes: true, attributeFilter: ["class"] });
      } else io.observe(t);
    });
  }

  /* Manifesto: each word lights as it passes the reading line. */
  function initManifesto() {
    $$("[data-words]").forEach((el) => {
      const walk = (node) => {
        Array.from(node.childNodes).forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) walk(n);
        });
      };
      walk(el);
      const words = $$(".w", el);
      const update = () => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
        const lit = Math.floor(p * words.length * 1.08);
        words.forEach((w, i) => w.classList.toggle("on", i < lit));
      };
      onScroll(update); update();
    });
  }

  /* Pinned horizontal gallery driven by vertical scroll. */
  function initHScroll() {
    $$(".hscroll").forEach((sec) => {
      const track = $(".hscroll__track", sec);
      const bar = $(".hscroll__progress i", sec);
      if (!track) return;
      const mobile = () => window.innerWidth < 900;
      let dist = 0;
      const size = () => {
        if (mobile()) { sec.style.height = ""; track.style.transform = ""; track.style.overflowX = "auto"; return; }
        track.style.overflowX = "";
        dist = Math.max(0, track.scrollWidth - window.innerWidth);
        sec.style.height = `${window.innerHeight + dist}px`;
      };
      const update = () => {
        if (mobile()) return;
        const r = sec.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / Math.max(1, dist)));
        track.style.transform = `translate3d(${-p * dist}px,0,0)`;
        if (bar) bar.style.transform = `scaleX(${p})`;
      };
      size(); update();
      window.addEventListener("resize", () => { size(); update(); });
      window.addEventListener("load", () => { size(); update(); });
      onScroll(update);
    });
  }

  /* Gentle parallax on marked images. */
  function initParallax() {
    if (reduceMotion) return;
    const els = $$("[data-parallax]");
    if (!els.length) return;
    const update = () => {
      const vh = window.innerHeight;
      els.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const amt = parseFloat(el.dataset.parallax) || 0.12;
        const c = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0, ${c * amt * -100}%, 0) scale(1.1)`;
      });
    };
    onScroll(update); update();
  }

  /* ------------------------------------------------------------------------
     Cursor + magnetic + sound hooks
     ------------------------------------------------------------------------ */
  function initCursor() {
    if (!finePointer || reduceMotion) return;
    const ring = document.createElement("div"); ring.className = "cursor"; ring.innerHTML = "<span>View</span>";
    const dot = document.createElement("div"); dot.className = "cursor-dot";
    body.append(ring, dot);
    const label = $("span", ring);
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    window.addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; doc.classList.add("has-cursor"); }, { passive: true });
    document.addEventListener("pointerleave", () => doc.classList.remove("has-cursor"));
    const loop = () => {
      rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      dot.style.transform = `translate3d(${x}px,${y}px,0)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener("pointerover", (e) => {
      const v = e.target.closest("[data-cursor]");
      const l = e.target.closest("a, button, [role='button'], input, textarea, select");
      ring.classList.toggle("is-view", !!v);
      ring.classList.toggle("is-link", !v && !!l);
      if (v) label.textContent = v.dataset.cursor || "View";
    });
  }

  function initMagnetic() {
    if (!finePointer || reduceMotion) return;
    $$(".btn, .play, .menu-btn").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  function initSoundHooks() {
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("a, button, .spec, .ministry");
      if (t && !t.contains(e.relatedTarget)) Sound.tick();
    });
    document.addEventListener("click", (e) => {
      if (e.target.closest("a, button") && !e.target.closest(".sound, [data-enter]")) Sound.chime();
    });
  }

  /* Ministries: a portrait follows the pointer across the list. */
  function initMinistryFloat() {
    const float = $(".ministry__float");
    if (!float || !finePointer) return;
    const imgs = $$("img", float);
    let x = 0, y = 0, fx = 0, fy = 0, raf = null;
    const loop = () => {
      fx += (x - fx) * 0.12; fy += (y - fy) * 0.12;
      float.style.left = fx + "px"; float.style.top = fy + "px";
      raf = requestAnimationFrame(loop);
    };
    $$(".ministry").forEach((m) => {
      m.addEventListener("pointerenter", (e) => {
        if (!raf) { fx = x = e.clientX; fy = y = e.clientY; loop(); }
        float.classList.add("is-on");
        imgs.forEach((i) => i.classList.toggle("is-active", i.dataset.key === m.dataset.key));
      });
      m.addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; });
      m.addEventListener("pointerleave", () => { float.classList.remove("is-on"); });
    });
    const list = $(".ministries");
    list && list.addEventListener("pointerleave", () => { cancelAnimationFrame(raf); raf = null; });
  }

  /* ------------------------------------------------------------------------
     Time — the house keeps Houston time.
     ------------------------------------------------------------------------ */
  const TZ = "America/Chicago";
  // A Date whose UTC fields equal the current Houston wall clock.
  const houstonNow = () => {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" })
      .formatToParts(new Date()).reduce((o, p) => (o[p.type] = p.value, o), {});
    return new Date(Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour % 24, +parts.minute, +parts.second));
  };
  const wall = (y, m, d, h, mi) => new Date(Date.UTC(y, m, d, h, mi));
  const isLastFriday = (d) => d.getUTCDay() === 5 && new Date(d.getTime() + 7 * 864e5).getUTCMonth() !== d.getUTCMonth();

  function upcomingGatherings(now) {
    const list = [];
    for (let i = 0; i < 45; i++) {
      const d = new Date(now.getTime() + i * 864e5);
      const y = d.getUTCFullYear(), m = d.getUTCMonth(), dd = d.getUTCDate(), dow = d.getUTCDay();
      if (dow === 0) {
        list.push({ name: "Sunday School", start: wall(y, m, dd, 10, 0), end: wall(y, m, dd, 10, 30) });
        list.push({ name: "Sunday Worship Service", start: wall(y, m, dd, 10, 30), end: wall(y, m, dd, 12, 0) });
      }
      if (dow === 3) list.push({ name: "Bible Study & Prayer Warfare", start: wall(y, m, dd, 19, 0), end: wall(y, m, dd, 20, 30) });
      if (isLastFriday(d)) list.push({ name: "Holy Communion & Power Night", start: wall(y, m, dd, 20, 0), end: wall(y, m, dd, 22, 0) });
    }
    return list.filter((e) => e.end > now).sort((a, b) => a.start - b.start);
  }
  const fmtDay = (d) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
  const fmtTime = (d) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
  const span = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
  };

  function initClock() {
    const next = $("[data-next]");
    const cds = $$("[data-countdown]");
    const years = $$("[data-crossover-year]");
    const nowYear = $$("[data-year]");
    nowYear.forEach((n) => { n.textContent = new Date().getFullYear(); });
    if (!next && !cds.length && !years.length) return;

    const crossoverTarget = () => {
      const now = houstonNow();
      let y = now.getUTCFullYear();
      // Until 2am on New Year's Day the service just held is still "this" crossover.
      if (now.getUTCMonth() === 0 && now.getUTCDate() === 1 && now.getUTCHours() < 2) y -= 1;
      return wall(y, 11, 31, 22, 0);
    };
    const target = crossoverTarget();
    years.forEach((n) => { n.textContent = target.getUTCFullYear() + 1; });

    const tick = () => {
      const now = houstonNow();
      if (next) {
        const g = upcomingGatherings(now)[0];
        if (g) {
          const live = now >= g.start;
          const t = span(g.start - now);
          $("[data-next-label]", next).textContent = live ? "In session now" : "Next gathering";
          $("[data-next-name]", next).textContent = g.name;
          $("[data-next-time]", next).textContent = live
            ? `Until ${fmtTime(g.end)} · Houston`
            : `${fmtDay(g.start)} · ${fmtTime(g.start)} — in ${t.d ? t.d + "d " : ""}${t.h}h ${String(t.m).padStart(2, "0")}m`;
        }
      }
      cds.forEach((cd) => {
        const t = span(target - now);
        const set = (k, v) => { const el = $(`[data-cd="${k}"]`, cd); if (el) el.textContent = String(v).padStart(2, "0"); };
        set("d", t.d); set("h", t.h); set("m", t.m); set("s", t.s);
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* Visit form composes an email — no backend required. */
  function initForms() {
    $$("form[data-mailto]").forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(f);
      const subject = `${data.get("reason") || "Enquiry"} — ${data.get("name") || ""}`.trim();
      const lines = [`Name: ${data.get("name") || ""}`, `Email: ${data.get("email") || ""}`, `Phone: ${data.get("phone") || ""}`, "", data.get("message") || ""];
      location.href = `mailto:${f.dataset.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    }));
  }

  /* ------------------------------------------------------------------------ */
  function boot() {
    initScroll();
    runLoader();
    initTransitions();
    initHeader();
    initMenu();
    initReveals();
    initManifesto();
    initHScroll();
    initParallax();
    initCursor();
    initMagnetic();
    initSoundHooks();
    initMinistryFloat();
    initClock();
    initForms();
    emitScroll();
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();
