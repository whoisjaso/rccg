/* RCCG Dayspring Chapel. Behaviour layer.
   No dependencies; Lenis smooth scroll is used when its CDN script loads. */
(() => {
  "use strict";

  const doc = document.documentElement;
  const body = document.body;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };

  const CHURCH = {
    name: "RCCG Dayspring Chapel",
    address: "10788 Hartsook Street, Houston, TX 77034",
    maps: "https://maps.google.com/?q=10788+Hartsook+Street+Houston+TX+77034",
    email: "info@rccgdayspring.org",
  };

  /* ------------------------------------------------------------------------
     Sound. Every tone is synthesized in the browser; nothing is downloaded.
     Off until the visitor chooses it, and the choice is remembered.
     ------------------------------------------------------------------------ */
  const Sound = {
    ctx: null, master: null, pad: null, on: false, last: 0,
    init() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.createDynamicsCompressor()).connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 3;
      const buf = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
      this.verb = this.ctx.createConvolver(); this.verb.buffer = buf; this.verb.connect(this.master);
      return true;
    },
    out(node, wet = 0.4) {
      const dry = this.ctx.createGain(); dry.gain.value = 1 - wet;
      const w = this.ctx.createGain(); w.gain.value = wet;
      node.connect(dry).connect(this.master); node.connect(w).connect(this.verb);
    },
    enable() {
      if (!this.init()) return;
      this.ctx.resume(); this.on = true;
      this.master.gain.setTargetAtTime(0.9, this.ctx.currentTime, 0.4);
      this.startPad();
      store.set("ds-sound", "on");
      $$(".sound").forEach((b) => { b.classList.add("is-on"); b.setAttribute("aria-pressed", "true"); });
    },
    disable() {
      this.on = false;
      if (this.ctx) { this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3); setTimeout(() => this.stopPad(), 1500); }
      store.set("ds-sound", "off");
      $$(".sound").forEach((b) => { b.classList.remove("is-on"); b.setAttribute("aria-pressed", "false"); });
    },
    toggle() { this.on ? this.disable() : (this.enable(), this.bell()); },
    startPad() {
      if (this.pad) return;
      const c = this.ctx, t = c.currentTime;
      const out = c.createGain(); out.gain.value = 0; out.gain.setTargetAtTime(0.05, t, 2.5);
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 650;
      const lfo = c.createOscillator(); lfo.frequency.value = 0.05;
      const amt = c.createGain(); amt.gain.value = 300; lfo.connect(amt).connect(lp.frequency); lfo.start();
      const oscs = [];
      [73.42, 146.83, 220, 293.66, 369.99, 659.25].forEach((f, i) => [-5, 5].forEach((cents) => {
        const o = c.createOscillator(); o.type = i < 2 ? "sine" : "triangle"; o.frequency.value = f; o.detune.value = cents;
        const g = c.createGain(); g.gain.value = i === 0 ? 0.5 : 0.22 / (1 + i * 0.25);
        o.connect(g).connect(lp); o.start(); oscs.push(o);
      }));
      lp.connect(out); this.out(out, 0.55);
      this.pad = { out, oscs, lfo };
    },
    stopPad() {
      if (!this.pad || this.on) return;
      const { out, oscs, lfo } = this.pad;
      out.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
      setTimeout(() => { oscs.forEach((o) => o.stop()); lfo.stop(); }, 1400);
      this.pad = null;
    },
    tone(freq, { type = "sine", gain = 0.04, attack = 0.004, decay = 0.6, wet = 0.4, when = 0 } = {}) {
      if (!this.on || !this.ctx) return;
      const c = this.ctx, t = c.currentTime + when;
      const o = c.createOscillator(); o.type = type; o.frequency.value = freq;
      const g = c.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
      o.connect(g); this.out(g, wet); o.start(t); o.stop(t + attack + decay + 0.05);
    },
    /* A needle pulled through cloth: a tiny filtered click. */
    stitch() {
      if (!this.on || !this.ctx) return;
      const now = performance.now(); if (now - this.last < 55) return; this.last = now;
      const c = this.ctx, t = c.currentTime;
      const buf = c.createBuffer(1, c.sampleRate * 0.03, c.sampleRate); const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 6);
      const s = c.createBufferSource(); s.buffer = buf;
      const hp = c.createBiquadFilter(); hp.type = "bandpass"; hp.frequency.value = 3200 + Math.random() * 1400; hp.Q.value = 2;
      const g = c.createGain(); g.gain.value = 0.06;
      s.connect(hp).connect(g); this.out(g, 0.15); s.start(t);
    },
    bell() { this.tone(880, { gain: 0.035, decay: 1.2 }); this.tone(1318.5, { gain: 0.02, decay: 1.4, when: 0.03 }); },
    arrive() { [293.66, 369.99, 440, 587.33].forEach((f, i) => this.tone(f, { gain: 0.03, attack: 0.02, decay: 2.2, when: i * 0.14, wet: 0.65 })); },
    breath(open = true) {
      if (!this.on || !this.ctx) return;
      const c = this.ctx, t = c.currentTime, dur = 0.7;
      const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate); const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const s = c.createBufferSource(); s.buffer = buf;
      const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 0.8;
      bp.frequency.setValueAtTime(open ? 400 : 1800, t); bp.frequency.exponentialRampToValueAtTime(open ? 1800 : 380, t + dur);
      const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + dur * 0.4); g.gain.linearRampToValueAtTime(0, t + dur);
      s.connect(bp).connect(g); this.out(g, 0.4); s.start(t);
    },
  };
  document.addEventListener("visibilitychange", () => {
    if (!Sound.ctx) return;
    document.hidden ? Sound.ctx.suspend() : Sound.on && Sound.ctx.resume();
  });

  /* ------------------------------------------------------------------------
     Scroll
     ------------------------------------------------------------------------ */
  let lenis = null;
  const subs = [];
  const onScroll = (fn) => subs.push(fn);
  const emit = () => { const y = scrollY; subs.forEach((fn) => fn(y)); };
  function initScroll() {
    if (!reduceMotion && window.Lenis) {
      lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on("scroll", emit);
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } else addEventListener("scroll", emit, { passive: true });
  }
  const lock = (on) => { body.classList.toggle("is-locked", on); lenis && (on ? lenis.stop() : lenis.start()); };

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
    setTimeout(() => { t.classList.add("is-leaving"); t.addEventListener("animationend", () => t.remove(), { once: true }); }, 3600);
  }

  /* ------------------------------------------------------------------------
     The yoke: embroidery that stitches itself in.
     ------------------------------------------------------------------------ */
  function stitchYoke(svg, duration, done) {
    const host = svg.closest(".hero__garment");
    const masks = $$(".yoke__mask path", svg);
    if (reduceMotion || duration <= 0) { host.style.setProperty("--p", 1); host.style.setProperty("--emblem", 1); done && done(); return; }
    const starts = masks.map((m) => parseFloat(m.style.getPropertyValue("--d")) || 0).sort((a, b) => a - b);
    let fired = 0;
    const t0 = performance.now();
    host.style.setProperty("--emblem", 0);
    const frame = (now) => {
      const k = Math.min(1, (now - t0) / duration);
      const p = 1 - Math.pow(1 - k, 2.2);
      host.style.setProperty("--p", p.toFixed(4));
      host.style.setProperty("--emblem", Math.min(1, Math.max(0, (p - 0.04) * 3)).toFixed(3));
      while (fired < starts.length && starts[fired] <= p) { fired++; if (fired % 2) Sound.stitch(); }
      k < 1 ? requestAnimationFrame(frame) : done && done();
    };
    host.style.setProperty("--p", 0);
    requestAnimationFrame(frame);
  }

  function initThreshold() {
    const svg = $(".yoke");
    if (!svg) { body.classList.remove("is-threshold"); return; }
    const first = !store.sget("ds-visited");
    const pref = store.get("ds-sound");
    if (!first || reduceMotion) {
      body.classList.remove("is-threshold");
      stitchYoke(svg, reduceMotion ? 0 : 1300);
      if (pref === "on") resumeSoundOnGesture();
      return;
    }
    lock(true);
    stitchYoke(svg, 2600, () => {
      body.classList.add("is-asking");
      const enter = (withSound) => {
        store.sset("ds-visited", "1");
        if (withSound) { Sound.enable(); Sound.arrive(); } else Sound.disable();
        body.classList.remove("is-asking", "is-threshold");
        lock(false);
      };
      const yes = $("[data-enter='sound']"), no = $("[data-enter='quiet']");
      yes && yes.focus({ preventScroll: true });
      yes && yes.addEventListener("click", () => enter(true), { once: true });
      no && no.addEventListener("click", () => enter(false), { once: true });
    });
  }
  function resumeSoundOnGesture() {
    Sound.init();
    $$(".sound").forEach((b) => b.classList.add("is-on"));
    const go = () => { Sound.enable(); removeEventListener("pointerdown", go); removeEventListener("keydown", go); };
    addEventListener("pointerdown", go, { once: true }); addEventListener("keydown", go, { once: true });
  }

  /* Sheen: light moves across the cloth under the hand. */
  function initSheen() {
    if (!finePointer || reduceMotion) return;
    $$(".cloth").forEach((el) => {
      let raf = 0, x = 0, y = 0;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect(); x = e.clientX - r.left; y = e.clientY - r.top;
        if (!raf) raf = requestAnimationFrame(() => { el.style.setProperty("--mx", x + "px"); el.style.setProperty("--my", y + "px"); raf = 0; });
        el.classList.add("is-lit");
      });
      el.addEventListener("pointerleave", () => el.classList.remove("is-lit"));
    });
  }

  /* Hems sew themselves as they come into view. */
  function initHems() {
    const hems = $$(".hem");
    if (!("IntersectionObserver" in window) || reduceMotion) { hems.forEach((h) => h.classList.add("is-sewn")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-sewn"); Sound.stitch(); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    hems.forEach((h) => io.observe(h));
  }

  /* ------------------------------------------------------------------------
     Header & drawer
     ------------------------------------------------------------------------ */
  function initHeader() {
    const header = $(".header");
    if (!header) return;
    let last = 0;
    onScroll((y) => {
      header.classList.toggle("is-solid", y > 24);
      if (!body.classList.contains("is-menu-open")) header.classList.toggle("is-hidden", y > last && y > 480);
      last = y;
    });
    $$(".sound").forEach((b) => b.addEventListener("click", () => Sound.toggle()));
  }

  function initDrawer() {
    const drawer = $(".drawer"), scrim = $(".scrim");
    const openers = $$("[data-menu-open]");
    if (!drawer) return;
    drawer.inert = true;
    let opener = null;
    const set = (open) => {
      body.classList.toggle("is-menu-open", open);
      drawer.inert = !open;
      drawer.setAttribute("aria-hidden", String(!open));
      openers.forEach((b) => b.setAttribute("aria-expanded", String(open)));
      lock(open);
      Sound.breath(open);
      drawer.style.transform = "";
      if (open) setTimeout(() => { const f = $(".drawer__close", drawer); f && f.focus({ preventScroll: true }); }, 60);
      else opener && opener.focus({ preventScroll: true });
    };
    openers.forEach((b) => b.addEventListener("click", () => { opener = b; set(true); }));
    $$("[data-menu-close]").forEach((b) => b.addEventListener("click", () => set(false)));
    scrim && scrim.addEventListener("click", () => set(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && body.classList.contains("is-menu-open")) set(false); });

    // Bottom sheet drag to dismiss (phones). Velocity or distance closes it.
    const handle = $(".drawer__top", drawer);
    let startY = 0, dy = 0, t0 = 0, dragging = false;
    const sheet = () => matchMedia("(max-width: 900px)").matches;
    handle.addEventListener("pointerdown", (e) => {
      if (!sheet() || e.target.closest("button")) return;
      dragging = true; startY = e.clientY; dy = 0; t0 = performance.now();
      drawer.classList.add("is-dragging"); handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      dy = Math.max(0, e.clientY - startY);
      drawer.style.transform = `translateY(${dy}px)`;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false; drawer.classList.remove("is-dragging");
      const v = dy / Math.max(1, performance.now() - t0);
      if (dy > drawer.offsetHeight * 0.3 || v > 0.6) set(false); else drawer.style.transform = "";
    };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
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
    { id: "school", name: "Sunday School", short: "Sunday School", day: 0, sh: 10, sm: 0, eh: 10, em: 30, rrule: "FREQ=WEEKLY;BYDAY=SU", note: "Study of the Word before worship" },
    { id: "wednesday", name: "Bible Study and Prayer Warfare", short: "Bible Study", day: 3, sh: 19, sm: 0, eh: 20, em: 30, rrule: "FREQ=WEEKLY;BYDAY=WE", note: "Midweek, every Wednesday" },
    { id: "power", name: "Holy Communion and Power Night", short: "Power Night", lastFri: true, sh: 20, sm: 0, eh: 22, em: 0, rrule: "FREQ=MONTHLY;BYDAY=-1FR", note: "Last Friday of every month" },
  ];

  function occurrences(now, horizon = 45) {
    const list = [];
    for (let i = 0; i < horizon; i++) {
      const d = new Date(now.getTime() + i * 864e5);
      const y = d.getUTCFullYear(), m = d.getUTCMonth(), dd = d.getUTCDate(), dow = d.getUTCDay();
      SERVICES.forEach((s) => {
        if ((s.lastFri && lastFriday(d)) || (!s.lastFri && s.day === dow)) list.push({ ...s, start: wall(y, m, dd, s.sh, s.sm), end: wall(y, m, dd, s.eh, s.em) });
      });
    }
    return list.filter((e) => e.end > now).sort((a, b) => a.start - b.start);
  }
  const fmtDay = (d) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
  const fmtShortDay = (d) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  const fmtTime = (d) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).replace(":00", "").toLowerCase();
  const until = (ms) => {
    const m = Math.max(0, Math.round(ms / 60000));
    const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
    if (d >= 2) return `in ${d} days`;
    if (d === 1) return `in 1 day, ${h} hr`;
    if (h >= 1) return `in ${h} hr ${mm} min`;
    return `in ${mm} min`;
  };
  const isToday = (d, now) => d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth() && d.getUTCDate() === now.getUTCDate();
  const dayWord = (d, now) => (isToday(d, now) ? "Today" : isToday(new Date(d.getTime() - 864e5), now) ? "Tomorrow" : fmtShortDay(d));

  /* Calendar files: recurring or single, in Houston time. */
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
      "BEGIN:VALARM", "TRIGGER:-PT60M", "ACTION:DISPLAY", "DESCRIPTION:Church in one hour", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"];
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename || `dayspring-${ev.id}.ics`;
    body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast(recurring ? `${ev.short} added to your calendar` : `${fmtDay(ev.start)} is in your calendar`, "calendar-check");
  }

  function initClock() {
    $$("[data-year]").forEach((n) => (n.textContent = new Date().getFullYear()));
    const rankHost = $("[data-ranks]");
    const nextEls = $$("[data-next]");
    const xYear = $$("[data-crossover-year]");
    const crossover = () => {
      const now = houstonNow(); let y = now.getUTCFullYear();
      if (now.getUTCMonth() === 0 && now.getUTCDate() === 1 && now.getUTCHours() < 2) y -= 1;
      return wall(y, 11, 31, 22, 0);
    };
    xYear.forEach((n) => (n.textContent = crossover().getUTCFullYear() + 1));

    let lastKey = "";
    const tick = () => {
      const now = houstonNow();
      // Sunday School is folded into Sunday Worship for the headline slots.
      const list = occurrences(now).filter((e) => e.id !== "school");
      const g = list[0];
      if (!g) return;
      const live = now >= g.start;
      nextEls.forEach((el) => {
        const name = $("[data-next-name]", el), when = $("[data-next-when]", el), lab = $("[data-next-label]", el);
        if (lab) lab.textContent = live ? "Happening now" : "Next service";
        if (name) name.textContent = g.short;
        if (when) when.textContent = live ? `until ${fmtTime(g.end)}` : el.hasAttribute("data-short") ? `${isToday(g.start, now) ? "Today" : g.start.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })}, ${fmtTime(g.start)}` : `${dayWord(g.start, now)}, ${fmtTime(g.start)}, ${until(g.start - now)}`;
      });
      if (rankHost) {
        const seen = new Set();
        const rows = occurrences(now).filter((e) => !seen.has(e.id) && seen.add(e.id));
        const key = rows.map((r) => r.id + r.start.getTime()).join();
        if (key !== lastKey) {
          lastKey = key;
          rankHost.innerHTML = rows.map((r, i) => `
            <li class="rank" data-rank="${i}">
              <div><div class="rank__name">${r.name}</div>
              <div class="rank__when"><b>${fmtDay(r.start)}</b>, ${fmtTime(r.start)} to ${fmtTime(r.end)}. ${r.note}.</div></div>
              <div class="rank__side"><span class="rank__in" data-in="${r.id}"></span>
              <button class="btn btn--ghost btn--small" type="button" data-ics="${r.id}"><i class="ph ph-calendar-plus" aria-hidden="true"></i>Add to calendar</button></div>
            </li>`).join("");
          $$("[data-ics]", rankHost).forEach((b) => b.addEventListener("click", () => downloadICS(rows.find((r) => r.id === b.dataset.ics))));
        }
        rows.forEach((r) => { const el = $(`[data-in="${r.id}"]`, rankHost); if (el) el.textContent = now >= r.start ? "Happening now" : until(r.start - now); });
      }
    };
    tick();
    setInterval(tick, 15000);
    return { occurrences, houstonNow };
  }

  /* ------------------------------------------------------------------------
     Plan your Sunday: three choices, one personal plan.
     ------------------------------------------------------------------------ */
  function initPlanner() {
    const form = $("[data-planner]");
    const card = $("[data-verdict]");
    if (!form || !card) return;
    const ICON = { arrive: "clock", child: "baby", family: "users-three", prayer: "hands-praying", pastors: "handshake", home: "house-line", seat: "armchair", welcome: "hand-waving", map: "map-pin" };

    const render = () => {
      const fd = new FormData(form);
      const who = fd.get("who"), when = fd.get("when"), need = fd.get("need");
      const now = houstonNow();
      const id = when === "wednesday" ? "wednesday" : when === "power" ? "power" : "sunday";
      const ev = occurrences(now, 62).find((e) => e.id === id);
      if (!ev) return;
      const arrive = new Date(ev.start.getTime() - (id === "sunday" ? 15 : 10) * 60000);
      const notes = [];
      if (id === "sunday") notes.push(["arrive", `Arrive around ${fmtTime(arrive)}. Sunday School starts at 10:00 am if you would like to come early.`]);
      else notes.push(["arrive", `Arrive around ${fmtTime(arrive)} so you can settle in before we begin.`]);
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
        $("[data-v-title]", card).textContent = `${ev.short}, ${ev.start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })}`;
        $("[data-v-time]", card).textContent = `${fmtTime(ev.start)} to ${fmtTime(ev.end)}, Houston time`;
        $("[data-v-notes]", card).innerHTML = notes.map(([k, t]) => `<li><i class="ph ph-${ICON[k]}" aria-hidden="true"></i><span>${t}</span></li>`).join("");
        const mail = $("[data-v-mail]", card);
        const whoWords = { me: "on my own", family: "with my family", children: "with my children", group: "with a group" }[who] || "";
        mail.href = `mailto:${CHURCH.email}?subject=${encodeURIComponent(`Planning to visit: ${fmtDay(ev.start)}`)}&body=${encodeURIComponent(`Hello Dayspring Chapel,\n\nI am planning to come to ${ev.name} on ${fmtDay(ev.start)} ${whoWords}.\n\nName:\nPhone:\n\nSee you then.`)}`;
        card._ev = ev;
        card.classList.remove("is-updating");
      }, reduceMotion ? 0 : 180);
    };
    form.addEventListener("change", () => { Sound.stitch(); render(); });
    $("[data-v-ics]", card).addEventListener("click", () => card._ev && downloadICS(card._ev, { recurring: false, filename: "dayspring-visit.ics" }));
    render();
  }

  /* Pinned horizontal strip. */
  function initHScroll() {
    $$(".hscroll").forEach((sec) => {
      const track = $(".hscroll__track", sec);
      if (!track) return;
      const mobile = () => innerWidth < 900;
      let dist = 0;
      const size = () => {
        if (mobile()) { sec.style.height = ""; track.style.transform = ""; track.style.overflowX = "auto"; return; }
        track.style.overflowX = "";
        dist = Math.max(0, track.scrollWidth - innerWidth);
        sec.style.height = `${innerHeight + dist}px`;
      };
      const update = () => {
        if (mobile()) return;
        const p = Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / Math.max(1, dist)));
        track.style.transform = `translate3d(${-p * dist}px,0,0)`;
        sec.style.setProperty("--hp", p.toFixed(4));
      };
      size(); update();
      addEventListener("resize", () => { size(); update(); });
      addEventListener("load", () => { size(); update(); });
      onScroll(update);
    });
  }

  /* Mailto forms with native validation. */
  function initForms() {
    $$("form[data-mailto]").forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!f.reportValidity()) return;
      const d = new FormData(f);
      const subject = `${d.get("reason") || "Message"}: ${d.get("name") || ""}`;
      const text = [`Name: ${d.get("name")}`, `Email: ${d.get("email")}`, `Phone: ${d.get("phone") || ""}`, "", d.get("message")].join("\n");
      location.href = `mailto:${f.dataset.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      toast("Opening your email app with the message ready", "envelope-simple");
    }));
  }

  function initUiSound() {
    document.addEventListener("click", (e) => { if (e.target.closest("a, button") && !e.target.closest(".sound, [data-enter], [data-menu-open], [data-menu-close]")) Sound.bell(); });
  }

  function boot() {
    initScroll();
    initThreshold();
    initHeader();
    initDrawer();
    initSheen();
    initHems();
    initClock();
    initPlanner();
    initHScroll();
    initForms();
    initUiSound();
    emit();
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();
