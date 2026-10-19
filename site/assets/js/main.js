/* RCCG Dayspring Chapel. Behaviour layer.
   No dependencies; Lenis smooth scroll is used when its CDN script loads. */
(() => {
  "use strict";

  const doc = document.documentElement;
  const body = document.body;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };
  const systemReduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reduce = () => systemReduce || doc.classList.contains("reduce-motion");
  if (store.get("ds-reduce") === "on") doc.classList.add("reduce-motion");
  doc.classList.add("js");

  const CHURCH = {
    name: "RCCG Dayspring Chapel",
    address: "10788 Hartsook Street, Houston, TX 77034",
    maps: "https://maps.google.com/?q=10788+Hartsook+Street+Houston+TX+77034",
    email: "info@rccgdayspring.org",
  };

  /* ------------------------------------------------------------------------
     Sound. Synthesized in the browser, off until chosen, choice remembered.
     A quiet organ bed, a soft bell on press, a breath when the menu opens.
     ------------------------------------------------------------------------ */
  const Sound = {
    ctx: null, master: null, pad: null, on: false,
    init() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = 0;
      this.master.connect(this.ctx.createDynamicsCompressor()).connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 3, buf = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
      this.verb = this.ctx.createConvolver(); this.verb.buffer = buf; this.verb.connect(this.master);
      return true;
    },
    out(node, wet = 0.4) {
      const dry = this.ctx.createGain(); dry.gain.value = 1 - wet;
      const w = this.ctx.createGain(); w.gain.value = wet;
      node.connect(dry).connect(this.master); node.connect(w).connect(this.verb);
    },
    sync() { $$("[data-sound]").forEach((b) => { b.classList.toggle("is-on", this.on); b.setAttribute("aria-pressed", String(this.on)); }); },
    enable() {
      if (!this.init()) return;
      this.ctx.resume(); this.on = true;
      this.master.gain.setTargetAtTime(0.9, this.ctx.currentTime, 0.4);
      this.startPad(); store.set("ds-sound", "on"); this.sync();
    },
    disable() {
      this.on = false;
      if (this.ctx) { this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3); setTimeout(() => this.stopPad(), 1400); }
      store.set("ds-sound", "off"); this.sync();
    },
    toggle() { this.on ? this.disable() : (this.enable(), this.bell()); },
    startPad() {
      if (this.pad) return;
      const c = this.ctx, t = c.currentTime;
      const out = c.createGain(); out.gain.value = 0; out.gain.setTargetAtTime(0.04, t, 2.5);
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 600;
      const lfo = c.createOscillator(); lfo.frequency.value = 0.05;
      const amt = c.createGain(); amt.gain.value = 260; lfo.connect(amt).connect(lp.frequency); lfo.start();
      const oscs = [];
      [73.42, 146.83, 220, 293.66, 369.99, 659.25].forEach((f, i) => [-5, 5].forEach((cents) => {
        const o = c.createOscillator(); o.type = i < 2 ? "sine" : "triangle"; o.frequency.value = f; o.detune.value = cents;
        const g = c.createGain(); g.gain.value = i === 0 ? 0.5 : 0.22 / (1 + i * 0.25);
        o.connect(g).connect(lp); o.start(); oscs.push(o);
      }));
      lp.connect(out); this.out(out, 0.55); this.pad = { out, oscs, lfo };
    },
    stopPad() {
      if (!this.pad || this.on) return;
      const { out, oscs, lfo } = this.pad;
      out.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
      setTimeout(() => { oscs.forEach((o) => o.stop()); lfo.stop(); }, 1400);
      this.pad = null;
    },
    tone(freq, { gain = 0.03, attack = 0.004, decay = 0.6, wet = 0.4, when = 0 } = {}) {
      if (!this.on || !this.ctx) return;
      const c = this.ctx, t = c.currentTime + when;
      const o = c.createOscillator(); o.frequency.value = freq;
      const g = c.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
      o.connect(g); this.out(g, wet); o.start(t); o.stop(t + attack + decay + 0.05);
    },
    bell() { this.tone(880, { gain: 0.03, decay: 1.2 }); this.tone(1318.5, { gain: 0.016, decay: 1.4, when: 0.03 }); },
    breath(open = true) {
      if (!this.on || !this.ctx) return;
      const c = this.ctx, t = c.currentTime, dur = 0.7;
      const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate); const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const s = c.createBufferSource(); s.buffer = buf;
      const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 0.8;
      bp.frequency.setValueAtTime(open ? 400 : 1800, t); bp.frequency.exponentialRampToValueAtTime(open ? 1800 : 380, t + dur);
      const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.04, t + dur * 0.4); g.gain.linearRampToValueAtTime(0, t + dur);
      s.connect(bp).connect(g); this.out(g, 0.4); s.start(t);
    },
  };
  document.addEventListener("visibilitychange", () => { if (Sound.ctx) document.hidden ? Sound.ctx.suspend() : Sound.on && Sound.ctx.resume(); });

  /* ------------------------------------------------------------------------
     Smooth scroll, desktop and touch.
     ------------------------------------------------------------------------ */
  let lenis = null;
  const subs = [];
  const onScroll = (fn) => subs.push(fn);
  const emit = () => { const y = scrollY; subs.forEach((fn) => fn(y)); };
  let rafId = 0;
  function startLenis() {
    if (lenis || reduce() || !window.Lenis) return;
    lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, syncTouch: true, syncTouchLerp: 0.085, touchInertiaMultiplier: 28 });
    lenis.on("scroll", emit);
    const raf = (t) => { lenis.raf(t); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);
  }
  function stopLenis() { if (!lenis) return; cancelAnimationFrame(rafId); lenis.destroy(); lenis = null; }
  addEventListener("scroll", () => { if (!lenis) emit(); }, { passive: true });
  const lock = (on) => { body.classList.toggle("is-locked", on); lenis && (on ? lenis.stop() : lenis.start()); };
  const scrollToEl = (el, offset = 0) => {
    const y = el.getBoundingClientRect().top + scrollY + offset;
    lenis ? lenis.scrollTo(y, { duration: 1.3 }) : scrollTo({ top: y, behavior: reduce() ? "auto" : "smooth" });
  };

  /* ------------------------------------------------------------------------
     Toasts
     ------------------------------------------------------------------------ */
  function toast(msg, icon = "check-circle") {
    let host = $(".toasts");
    if (!host) { host = document.createElement("div"); host.className = "toasts"; host.setAttribute("role", "status"); host.setAttribute("aria-live", "polite"); body.append(host); }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<i class="ph ph-${icon}" aria-hidden="true"></i><span></span>`;
    $("span", t).textContent = msg;
    host.append(t);
    while (host.children.length > 3) host.firstElementChild.remove();
    setTimeout(() => { t.classList.add("is-leaving"); t.addEventListener("animationend", () => t.remove(), { once: true }); }, 3400);
  }

  /* ------------------------------------------------------------------------
     Loader
     ------------------------------------------------------------------------ */
  function initLoader() {
    const loader = $(".loader");
    const done = () => body.classList.add("is-loaded");
    if (!loader) return done();
    const first = !store.sget("ds-visited");
    store.sset("ds-visited", "1");
    if (!first || reduce()) loader.classList.add("loader--quick");
    const min = reduce() ? 0 : first ? 1500 : 500;
    const t0 = performance.now();
    const finish = () => setTimeout(done, Math.max(0, min - (performance.now() - t0)));
    document.readyState === "complete" ? finish() : addEventListener("load", finish, { once: true });
    setTimeout(done, 4000); // never hold the page hostage to a slow image
  }

  /* ------------------------------------------------------------------------
     Header and menu panel
     ------------------------------------------------------------------------ */
  function initHeader() {
    const header = $(".header");
    if (!header) return;
    const hero = $(".stack, .phero");
    let last = 0;
    onScroll((y) => {
      const past = hero ? y > hero.offsetTop + hero.offsetHeight - 90 : y > 24;
      header.classList.toggle("is-solid", past || !hero);
      if (!body.classList.contains("is-menu-open")) header.classList.toggle("is-hidden", past && y > last + 2 && y > 600);
      if (y < last - 2) header.classList.remove("is-hidden");
      last = y;
    });
    $$("[data-sound]").forEach((b) => b.addEventListener("click", () => Sound.toggle()));
    $$("[data-reduce]").forEach((b) => {
      const sync = () => b.setAttribute("aria-pressed", String(doc.classList.contains("reduce-motion")));
      sync();
      b.addEventListener("click", () => {
        const on = !doc.classList.contains("reduce-motion");
        doc.classList.toggle("reduce-motion", on); store.set("ds-reduce", on ? "on" : "off");
        on ? stopLenis() : startLenis(); sync();
      });
    });
  }

  function initPanel() {
    const panel = $(".panel"), scrim = $(".scrim");
    if (!panel) return;
    panel.inert = true;
    let opener = null;
    const set = (open) => {
      body.classList.toggle("is-menu-open", open);
      panel.inert = !open; panel.setAttribute("aria-hidden", String(!open));
      $$("[data-menu-open]").forEach((b) => b.setAttribute("aria-expanded", String(open)));
      lock(open); Sound.breath(open);
      if (open) setTimeout(() => { const f = $("[data-menu-close]", panel); f && f.focus({ preventScroll: true }); }, 80);
      else opener && opener.focus({ preventScroll: true });
    };
    $$("[data-menu-open]").forEach((b) => b.addEventListener("click", () => { opener = b; set(true); }));
    $$("[data-menu-close]").forEach((b) => b.addEventListener("click", () => set(false)));
    scrim && scrim.addEventListener("click", () => set(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && body.classList.contains("is-menu-open")) set(false); });
  }

  /* ------------------------------------------------------------------------
     The stack: each slide holds while the next rises over it.
     The covered slide recedes (scale, shade) and the dots follow.
     ------------------------------------------------------------------------ */
  function initStack() {
    const stack = $(".stack");
    if (!stack) return;
    const slides = $$(".slide", stack);
    const dots = $$(".dot-hit", stack);
    dots.forEach((d, i) => d.addEventListener("click", () => scrollToEl(slides[i])));
    const update = () => {
      const vh = innerHeight;
      let active = 0;
      slides.forEach((s, i) => {
        const next = slides[i + 1];
        const media = $(".slide__media", s), shade = $(".slide__shade", s);
        let p = 0;
        if (next) p = Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / vh));
        if (!reduce()) {
          media.style.transform = `scale(${(1 - p * 0.06).toFixed(4)}) translate3d(0, ${(-p * 4).toFixed(2)}%, 0)`;
          shade.style.opacity = (p * 0.55).toFixed(3);
        }
        if (s.getBoundingClientRect().top <= vh * 0.5) active = i;
      });
      dots.forEach((d, i) => { d.classList.toggle("is-active", i === active); d.setAttribute("aria-current", i === active ? "true" : "false"); });
    };
    onScroll(update); addEventListener("resize", update); update();
  }

  /* Image reveals and gentle parallax on bands. */
  function initReveals() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduce()) { els.forEach((e) => e.classList.add("is-in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -12% 0px" });
    els.forEach((e) => io.observe(e));
  }
  function initParallax() {
    const els = $$("[data-parallax]");
    if (!els.length) return;
    const update = () => {
      if (reduce()) return;
      const vh = innerHeight;
      els.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        el.style.transform = `translate3d(0, ${(((r.top + r.height / 2 - vh / 2) / vh) * -6).toFixed(2)}%, 0)`;
      });
    };
    onScroll(update); update();
  }

  /* ------------------------------------------------------------------------
     Time. The house keeps Houston time.
     ------------------------------------------------------------------------ */
  const TZ = "America/Chicago";
  const houstonNow = () => {
    const p = new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" })
      .formatToParts(new Date()).reduce((o, x) => ((o[x.type] = x.value), o), {});
    return new Date(Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second));
  };
  const wall = (y, m, d, h, mi) => new Date(Date.UTC(y, m, d, h, mi));
  const lastFriday = (d) => d.getUTCDay() === 5 && new Date(d.getTime() + 7 * 864e5).getUTCMonth() !== d.getUTCMonth();
  const SERVICES = [
    { id: "sunday", name: "Sunday Worship Service", short: "Sunday Worship", day: 0, sh: 10, sm: 30, eh: 12, em: 0, rrule: "FREQ=WEEKLY;BYDAY=SU", note: "Sunday School begins at 10:00 am" },
    { id: "school", name: "Sunday School", short: "Sunday School", day: 0, sh: 10, sm: 0, eh: 10, em: 30, rrule: "FREQ=WEEKLY;BYDAY=SU", note: "A study of the Word before worship" },
    { id: "wednesday", name: "Bible Study and Prayer Warfare", short: "Bible Study", day: 3, sh: 19, sm: 0, eh: 20, em: 30, rrule: "FREQ=WEEKLY;BYDAY=WE", note: "Every Wednesday" },
    { id: "power", name: "Holy Communion and Power Night", short: "Power Night", lastFri: true, sh: 20, sm: 0, eh: 22, em: 0, rrule: "FREQ=MONTHLY;BYDAY=-1FR", note: "The last Friday of every month" },
  ];
  function occurrences(now, horizon = 45) {
    const list = [];
    for (let i = 0; i < horizon; i++) {
      const d = new Date(now.getTime() + i * 864e5);
      const y = d.getUTCFullYear(), m = d.getUTCMonth(), dd = d.getUTCDate(), dow = d.getUTCDay();
      SERVICES.forEach((s) => { if ((s.lastFri && lastFriday(d)) || (!s.lastFri && s.day === dow)) list.push({ ...s, start: wall(y, m, dd, s.sh, s.sm), end: wall(y, m, dd, s.eh, s.em) }); });
    }
    return list.filter((e) => e.end > now).sort((a, b) => a.start - b.start);
  }
  const fmtDay = (d) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
  const fmtTime = (d) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).replace(":00", "").toLowerCase();
  const isToday = (d, now) => d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth() && d.getUTCDate() === now.getUTCDate();
  const until = (ms) => {
    const m = Math.max(0, Math.round(ms / 60000)); const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
    if (d >= 2) return `in ${d} days`; if (d === 1) return `in 1 day, ${h} hr`; if (h >= 1) return `in ${h} hr ${mm} min`; return `in ${mm} min`;
  };

  const pad = (n) => String(n).padStart(2, "0");
  const icsStamp = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00`;
  const VTZ = ["BEGIN:VTIMEZONE", "TZID:America/Chicago", "BEGIN:DAYLIGHT", "TZOFFSETFROM:-0600", "TZOFFSETTO:-0500", "TZNAME:CDT", "DTSTART:19700308T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU", "END:DAYLIGHT", "BEGIN:STANDARD", "TZOFFSETFROM:-0500", "TZOFFSETTO:-0600", "TZNAME:CST", "DTSTART:19701101T020000", "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU", "END:STANDARD", "END:VTIMEZONE"];
  function downloadICS(ev, { recurring = true, filename } = {}) {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//RCCG Dayspring Chapel//Website//EN", "CALSCALE:GREGORIAN", ...VTZ, "BEGIN:VEVENT",
      `UID:${ev.id}-${icsStamp(ev.start)}@rccgdayspring.org`, `DTSTAMP:${icsStamp(new Date())}Z`,
      `DTSTART;TZID=America/Chicago:${icsStamp(ev.start)}`, `DTEND;TZID=America/Chicago:${icsStamp(ev.end)}`,
      ...(recurring && ev.rrule ? [`RRULE:${ev.rrule}`] : []),
      `SUMMARY:${ev.name} at ${CHURCH.name}`, `LOCATION:${CHURCH.address.replace(/,/g, "\\,")}`,
      `DESCRIPTION:${(ev.note || "").replace(/,/g, "\\,")}. Directions: ${CHURCH.maps}`,
      "BEGIN:VALARM", "TRIGGER:-PT60M", "ACTION:DISPLAY", "DESCRIPTION:Church in one hour", "END:VALARM", "END:VEVENT", "END:VCALENDAR"];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" }));
    a.download = filename || `dayspring-${ev.id}.ics`;
    body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast(recurring ? `${ev.short} added to your calendar` : `${fmtDay(ev.start)} is in your calendar`, "calendar-check");
  }

  function initClock() {
    $$("[data-year]").forEach((n) => (n.textContent = new Date().getFullYear()));
    const now0 = houstonNow();
    let xy = now0.getUTCFullYear(); if (now0.getUTCMonth() === 0 && now0.getUTCDate() === 1 && now0.getUTCHours() < 2) xy -= 1;
    $$("[data-crossover-year]").forEach((n) => (n.textContent = xy + 1));
    const host = $("[data-services]");
    let lastKey = "";
    const tick = () => {
      const now = houstonNow();
      const g = occurrences(now).filter((e) => e.id !== "school")[0];
      if (g) {
        const live = now >= g.start;
        $$("[data-next]").forEach((el) => {
          const lab = $("[data-next-label]", el), name = $("[data-next-name]", el), when = $("[data-next-when]", el);
          const short = el.hasAttribute("data-short");
          const day = isToday(g.start, now) ? "Today" : g.start.toLocaleDateString("en-US", { weekday: short ? "short" : "long", timeZone: "UTC" });
          if (lab) lab.textContent = live ? "Happening now" : "Next service";
          if (name) name.textContent = g.short;
          if (when) when.textContent = live ? `until ${fmtTime(g.end)}` : short ? `${day}, ${fmtTime(g.start)}` : `${day} at ${fmtTime(g.start)}, ${until(g.start - now)}`;
        });
      }
      if (host) {
        const seen = new Set();
        const rows = occurrences(now).filter((e) => !seen.has(e.id) && seen.add(e.id));
        const key = rows.map((r) => r.id + r.start.getTime()).join();
        if (key !== lastKey) {
          lastKey = key;
          host.innerHTML = rows.map((r, i) => `
            <li class="svc" data-rank="${i}">
              <div><div class="svc__name">${r.name}</div><div class="svc__when">${fmtDay(r.start)}, ${fmtTime(r.start)} to ${fmtTime(r.end)}. ${r.note}.</div></div>
              <div class="svc__side"><span class="svc__in" data-in="${r.id}"></span><button class="pill" type="button" data-ics="${r.id}"><i class="ph ph-calendar-plus" aria-hidden="true"></i>Add to calendar</button></div>
            </li>`).join("");
          $$("[data-ics]", host).forEach((b) => b.addEventListener("click", () => downloadICS(rows.find((r) => r.id === b.dataset.ics))));
        }
        rows.forEach((r) => { const el = $(`[data-in="${r.id}"]`, host); if (el) el.textContent = now >= r.start ? "Happening now" : until(r.start - now); });
      }
    };
    tick(); setInterval(tick, 15000);
  }

  /* ------------------------------------------------------------------------
     Plan your Sunday
     ------------------------------------------------------------------------ */
  function initPlanner() {
    const form = $("[data-planner]"), card = $("[data-plancard]");
    if (!form || !card) return;
    const ICON = { arrive: "clock", child: "baby", family: "users-three", prayer: "hands-praying", pastors: "handshake", home: "house-line", seat: "armchair", welcome: "hand-waving", map: "map-pin" };
    const render = () => {
      const fd = new FormData(form);
      const who = fd.get("who"), when = fd.get("when"), need = fd.get("need");
      const id = when === "wednesday" ? "wednesday" : when === "power" ? "power" : "sunday";
      const ev = occurrences(houstonNow(), 62).find((e) => e.id === id);
      if (!ev) return;
      const arrive = new Date(ev.start.getTime() - (id === "sunday" ? 15 : 10) * 60000);
      const notes = [["arrive", id === "sunday" ? `Arrive around ${fmtTime(arrive)}. Sunday School starts at 10 am if you would like to come early.` : `Arrive around ${fmtTime(arrive)} to settle in before we begin.`]];
      if (who === "children") notes.push(["child", "Bringing children? Ask an usher at the door about Children's Church."]);
      if (who === "family") notes.push(["family", "Come as a family. Ushers will help you find seats together."]);
      if (who === "group") notes.push(["family", "Coming as a group? Send us a note first and we will have seats ready."]);
      if (who === "me") notes.push(["seat", "Coming on your own is completely normal. Ushers will greet you at the door and help you find a seat."]);
      if (need === "prayer") notes.push(["prayer", "Let an usher know you would like prayer, or send a request ahead of time."]);
      if (need === "pastors") notes.push(["pastors", "Ask to meet Pastors Joel and Funmi Uzoma after the service."]);
      if (need === "home") notes.push(["home", "Looking for a church home? Ask about the Men's, Women's, Youth and Seniors fellowships."]);
      if (need === "welcome") notes.push(["welcome", "Come as you are. You will be welcomed as family."]);
      notes.push(["map", `${CHURCH.address}.`]);
      card.classList.add("is-updating");
      setTimeout(() => {
        $("[data-p-date]", card).textContent = `${ev.short}, ${ev.start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })}`;
        $("[data-p-time]", card).textContent = `${fmtTime(ev.start)} to ${fmtTime(ev.end)}, Houston time`;
        $("[data-p-notes]", card).innerHTML = notes.map(([k, t]) => `<li><i class="ph ph-${ICON[k]}" aria-hidden="true"></i><span>${t}</span></li>`).join("");
        const whoWords = { me: "on my own", family: "with my family", children: "with my children", group: "with a group" }[who] || "";
        $("[data-p-mail]", card).href = `mailto:${CHURCH.email}?subject=${encodeURIComponent(`Planning to visit: ${fmtDay(ev.start)}`)}&body=${encodeURIComponent(`Hello Dayspring Chapel,\n\nI am planning to come to ${ev.name} on ${fmtDay(ev.start)} ${whoWords}.\n\nName:\nPhone:\n\nSee you then.`)}`;
        card._ev = ev;
        card.classList.remove("is-updating");
      }, reduce() ? 0 : 180);
    };
    form.addEventListener("change", render);
    $("[data-p-ics]", card).addEventListener("click", () => card._ev && downloadICS(card._ev, { recurring: false, filename: "dayspring-visit.ics" }));
    render();
  }

  function initForms() {
    $$("form[data-mailto]").forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!f.reportValidity()) return;
      const d = new FormData(f);
      const text = [`Name: ${d.get("name")}`, `Email: ${d.get("email")}`, `Phone: ${d.get("phone") || ""}`, "", d.get("message")].join("\n");
      location.href = `mailto:${f.dataset.mailto}?subject=${encodeURIComponent(`${d.get("reason") || "Message"}: ${d.get("name") || ""}`)}&body=${encodeURIComponent(text)}`;
      toast("Opening your email app with the message ready", "envelope-simple");
    }));
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const el = a.getAttribute("href").length > 1 && $(a.getAttribute("href"));
      if (!el) return;
      e.preventDefault(); scrollToEl(el, -72);
    }));
  }

  function initUiSound() {
    document.addEventListener("click", (e) => { if (e.target.closest("a, button") && !e.target.closest("[data-sound], [data-menu-open], [data-menu-close]")) Sound.bell(); });
    if (store.get("ds-sound") === "on") {
      $$("[data-sound]").forEach((b) => b.classList.add("is-on"));
      const go = () => { Sound.enable(); removeEventListener("pointerdown", go); removeEventListener("keydown", go); };
      addEventListener("pointerdown", go, { once: true }); addEventListener("keydown", go, { once: true });
    }
  }

  function boot() {
    startLenis();
    initLoader();
    initHeader();
    initPanel();
    initStack();
    initReveals();
    initParallax();
    initClock();
    initPlanner();
    initForms();
    initUiSound();
    emit();
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();
