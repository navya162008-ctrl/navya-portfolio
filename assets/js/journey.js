/* ═══════════════════════════════════════════════════════════════════════════
   JOURNEY — the scroll-driven environment engine.

   One rAF loop. One progress value (0 → 1), eased toward the real scroll
   position so the camera feels heavy and cinematic instead of snapping to
   every wheel tick. Only transform / opacity / canvas painting — no layout.

   TUNABLES: every dial you might want lives in CONFIG below.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {

  const CONFIG = {
    /* ── camera ── */
    cameraSmooth:  0.075,   // 0.02 = very slow & heavy · 0.3 = responsive
    dolly:         1.00,    // how far the camera pushes into the window (0 = off)
    /* ── clouds (procedural layer, sits over the photographic plate) ── */
    cloudCount:    20,      // clusters on desktop
    cloudCountMob: 10,
    cloudSpeed:    1.00,
    cloudSize:     1.00,
    cloudOpacity:  0.62,    // lower = the photographic plate leads
    plateStrength: 0.92,    // opacity of the photographic cloud plate
    /* ── airplane ── */
    planeScale:    1.10,
    planeTravel:   1.00,
    bob:           1.00,
    /* ── other ── */
    starCount:     260,
    scrim:         0.34,    // light band behind reading content
    landStrength:  1.00,    // photographic ground plate
  };

  /* ───────────────────── palette keyframes (filmic, desaturated) ───────────────────── */
  const SKY_DAY = [
    [0.00, "#6BA6D0", "#A5CBE3", "#D9E8F1"],
    [0.13, "#8FBEDA", "#BBD8EC", "#E4EFF7"],
    [0.30, "#6DA9D8", "#96CBE8", "#D8EAF5"],
    [0.48, "#4A88BE", "#7FBEDA", "#E2ECEF"],
    [0.62, "#4A81B4", "#8FBFD8", "#EFE0C9"],
    [0.76, "#75A6C6", "#B9D2E0", "#E8DCC8"],
    [0.90, "#5C93B8", "#A7C9DD", "#EFE4D3"],
    [1.00, "#4E86AE", "#98C3DC", "#F5EBDC"],
  ];
  const SKY_NIGHT = [
    [0.00, "#061019", "#0B1A2A", "#152736"],
    [0.13, "#050E18", "#0B1A2B", "#172C42"],
    [0.30, "#071322", "#102334", "#1E3750"],
    [0.48, "#081627", "#14293D", "#254559"],
    [0.62, "#09121F", "#183043", "#3C5364"],
    [0.76, "#0B1727", "#1D3448", "#5A5F52"],
    [0.90, "#050D18", "#0D2033", "#22394E"],
    [1.00, "#040A12", "#0A1826", "#1C3044"],
  ];
  const GROUND_DAY   = ["#A7B399", "#E8DCC8"];
  const GROUND_NIGHT = ["#131E29", "#28313A"];
  const HORIZON_DAY   = [255, 231, 190];
  const HORIZON_NIGHT = [255, 206, 148];

  /* airplane exterior flight path (x%, y%, scale, rotation deg, opacity) */
  const PLANE_KEYS = [
    [0.42,  92, -28, 0.44, -10, 0.00],
    [0.48,  58, -12, 0.66,  -7, 1.00],
    [0.56,  30,  -2, 0.86,  -4, 1.00],
    [0.64,   2,   9, 1.05,   0, 1.00],
    [0.72, -26,  20, 1.28,   4, 1.00],
    [0.79, -52,  32, 1.55,   7, 0.85],
    [0.85, -78,  44, 1.85,   9, 0.00],
  ];

  /* window centre inside the cabin plate, in SVG user units */
  const WIN = { x: 1112, y: 480 };

  /* ─────────────────────────── helpers ─────────────────────────── */
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  function smooth(a, b, x) {
    if (b === a) return x < a ? 0 : 1;
    const t = clamp((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  }
  const hex2rgb = (h) => {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const rgbCss = (c, a) => a == null ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`
                                     : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  function sampleSky(set, x) {
    let i = 0;
    while (i < set.length - 2 && x > set[i + 1][0]) i++;
    const a = set[i], b = set[i + 1];
    const t = clamp((x - a[0]) / (b[0] - a[0]));
    return [mix3(hex2rgb(a[1]), hex2rgb(b[1]), t),
            mix3(hex2rgb(a[2]), hex2rgb(b[2]), t),
            mix3(hex2rgb(a[3]), hex2rgb(b[3]), t)];
  }
  function keys(frames, x) {
    if (x <= frames[0][0]) return frames[0].slice(1);
    const last = frames[frames.length - 1];
    if (x >= last[0]) return last.slice(1);
    let i = 0;
    while (i < frames.length - 2 && x > frames[i + 1][0]) i++;
    const a = frames[i], b = frames[i + 1];
    const t = clamp((x - a[0]) / (b[0] - a[0]));
    const out = [];
    for (let k = 1; k < a.length; k++) out.push(a[k] + (b[k] - a[k]) * t);
    return out;
  }

  /* ═══════════════════════════ CLOUD SPRITES ═══════════════════════════ */
  function makeCloudSprite(color, w, h, seed) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext ? c.getContext("2d") : null;
    if (!g) return c;
    let s = seed;
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const puffs = 9 + Math.floor(rnd() * 5);
    for (let i = 0; i < puffs; i++) {
      const t = i / (puffs - 1);
      const cx = w * (0.12 + t * 0.76) + (rnd() - 0.5) * w * 0.06;
      const bulge = Math.sin(t * Math.PI);
      const cy = h * (0.62 - bulge * 0.24) + (rnd() - 0.5) * h * 0.1;
      const r = h * (0.20 + bulge * 0.30) * (0.7 + rnd() * 0.55);
      const grd = g.createRadialGradient(cx, cy, 0, cx, cy, r);
      grd.addColorStop(0, `rgba(${color},0.60)`);
      grd.addColorStop(0.45, `rgba(${color},0.28)`);
      grd.addColorStop(1, `rgba(${color},0)`);
      g.fillStyle = grd;
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
    }
    return c;
  }

  /* ═══════════════════════════ ENGINE ═══════════════════════════ */
  const Journey = {
    CONFIG,
    inited: false,

    init() {
      if (this.inited) return;
      this.inited = true;

      this.reduce = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const $ = (id) => document.getElementById(id);
      this.el = {
        stage: $("stage"), scrim: $("scrim"), plates: $("plates"),
        cabin: $("cabin"), cabinSvg: $("cabinSvg"), intro: $("cabinIntro"),
        plane: $("plane"), ground: $("ground"),
        celestial: $("celestial"),
        sun: document.querySelector(".sun"), moon: document.querySelector(".moon"),
        clouds: $("cloudCanvas"), stars: $("starsCanvas"),
        nav: $("nav"), rail: $("rail"), railFill: $("railFill"), railPlane: $("railPlane"),
        railList: $("railList"), hint: $("scrollHint"),
      };
      this.plateEls = {};
      document.querySelectorAll("[data-plate]").forEach((el) => {
        this.plateEls[el.dataset.plate] = el;
      });

      this.buildRail();
      this.measure();
      this.initClouds();
      this.loadPlates();
      this.bind();

      this.p = this.targetP = this.scrollProgress();
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick.bind(this));
    },

    /* ── measurement ── */
    measure() {
      this.vw = window.innerWidth;
      this.vh = window.innerHeight;
      this.maxScroll = Math.max(1, document.documentElement.scrollHeight - this.vh);

      const sy = window.scrollY;
      this.scenes = [...document.querySelectorAll(".scene")].map((el) => {
        const h = el.offsetHeight;
        const top = el.getBoundingClientRect().top + sy;
        return {
          el, id: el.dataset.scene, top, h,
          start: (top - this.vh * 0.85) / this.maxScroll,
          end:   (top + h - this.vh * 0.15) / this.maxScroll,
          reveals: [...el.querySelectorAll("[data-reveal]")],
          rail: el.querySelector(".work__rail"),
        };
      });

      /* keep the journey rail's jump targets honest: re-measure each phase
         against its scene's real offset whenever layout changes */
      if (typeof PHASES !== "undefined" && Array.isArray(PHASES)) {
        const MAP = { takeoff: "takeoff", explore: "about", discover: "skills",
                      descend: "work", land: "land", connect: "connect" };
        PHASES.forEach((ph) => {
          const sc = this.scenes.find(s => s.id === (MAP[ph.id] || ph.id));
          if (!sc) return;
          ph.at = ph.id === "takeoff" ? 0
            : Math.min(0.985, Math.max(0.001, (sc.top - this.vh * 0.18) / this.maxScroll));
        });
      }

      const dpr = Math.min(window.devicePixelRatio || 1, this.vw < 820 ? 1.5 : 1.75);
      [this.el.clouds, this.el.stars].forEach((cv) => {
        cv.width = Math.floor(this.vw * dpr);
        cv.height = Math.floor(this.vh * dpr);
        cv.style.width = this.vw + "px";
        cv.style.height = this.vh + "px";
        const ctx = cv.getContext ? cv.getContext("2d") : null;
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      });
      this.cctx = this.el.clouds.getContext ? this.el.clouds.getContext("2d") : null;
      this.sctx = this.el.stars.getContext ? this.el.stars.getContext("2d") : null;

      this.buildStars();
      this.layoutCabin();
    },

    /* the camera must push toward the *window*, so the transform origin is
       wherever the window lands on screen after the slice-crop */
    layoutCabin() {
      const svg = this.el.cabinSvg, cab = this.el.cabin;
      if (!svg || !cab) return;
      /* responsive field-of-view: desktop keeps the full frame; below the
         landscape threshold the crop eases in smoothly with the viewport
         aspect, so the window scales proportionally instead of jumping big */
      const ar = this.vw / this.vh;
      const t = Math.min(1, Math.max(0, (ar - 0.42) / (1.15 - 0.42)));
      const e = t * t * (3 - 2 * t);
      const vbW = ar >= 1.15 ? 1600 : Math.round(480 + (1600 - 480) * e);
      const vbX = Math.min(Math.max(0, WIN.x - vbW / 2), 1600 - vbW);
      const vb = [vbX, 0, vbW, 900];
      this.cabinZoom = ar >= 1.15 ? 1 : 0.55 + 0.45 * e;   /* dolly strength follows suit */
      svg.setAttribute("viewBox", vb.join(" "));
      const s = Math.max(this.vw / vb[2], this.vh / vb[3]);
      const ox = this.vw / 2 + (WIN.x - (vb[0] + vb[2] / 2)) * s;
      const oy = this.vh / 2 + (WIN.y - (vb[1] + vb[3] / 2)) * s;
      cab.style.transformOrigin =
        `${((ox / this.vw) * 100).toFixed(2)}% ${((oy / this.vh) * 100).toFixed(2)}%`;
    },

    buildRail() {
      const list = this.el.railList;
      if (!list || typeof PHASES === "undefined") return;
      list.innerHTML = "";
      this.railBtns = PHASES.map((ph) => {
        const li = document.createElement("li");
        const b = document.createElement("button");
        b.type = "button";
        b.innerHTML = `<i></i><span>${ph.label}</span>`;
        b.setAttribute("aria-label", `Jump to ${ph.label}`);
        b.addEventListener("click", () => this.scrollToProgress(ph.at));
        li.appendChild(b); list.appendChild(li);
        return b;
      });
    },

    /* plates are fetched after first paint so the cabin loads fast */
    loadPlates() {
      const small = this.vw < 820;
      const set = (el) => {
        const img = el.tagName === "IMG" ? el : el.querySelector("img");
        if (!img || img.dataset.loaded) return;
        img.dataset.loaded = "1";
        const src = (small && img.dataset.srcSm) ? img.dataset.srcSm : img.dataset.src;
        if (src) img.src = src;
      };
      const night = document.querySelector(".cabin__photo--night");
      if (night && !night.getAttribute("href")) {
        const src = small ? "assets/img/plate-cabin-night-sm.jpg" : "assets/img/plate-cabin-night.jpg";
        night.setAttribute("href", src);
        night.setAttribute("xlink:href", src);
      }
      const later = () => ["clouds-day", "clouds-night", "land-day", "land-night"]
        .forEach(k => { if (this.plateEls[k]) set(this.plateEls[k]); });
      if ("requestIdleCallback" in window) requestIdleCallback(later, { timeout: 1200 });
      else setTimeout(later, 400);
    },

    initClouds() {
      const n = this.vw < 820 ? CONFIG.cloudCountMob : CONFIG.cloudCount;
      let s = 20250911;
      const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
      this.clouds = [];
      for (let i = 0; i < n; i++) {
        this.clouds.push({
          a: rnd() * Math.PI * 2, s: 0.55 + rnd() * 0.95,
          rate: 0.55 + rnd() * 0.9, phase: rnd(),
          alpha: 0.5 + rnd() * 0.45, variant: i % 3,
        });
      }
      const w = Math.max(180, Math.round(this.vw * 0.42));
      const h = Math.round(w * 0.46);
      this.sprites = {
        day:   [0, 1, 2].map(i => makeCloudSprite("255,255,255", w, h, 7 + i * 131)),
        night: [0, 1, 2].map(i => makeCloudSprite("150,175,200", w, h, 7 + i * 131)),
      };
      this.spriteSize = [w, h];
      let d = 4242;
      const drnd = () => (d = (d * 1103515245 + 12345) % 2147483648) / 2147483648;
      this.deck = [0, 1, 2, 3].map(() => ({
        x: drnd(), y: 0.52 + drnd() * 0.2, s: 1.5 + drnd() * 1.6,
        drift: 0.25 + drnd() * 0.5, variant: Math.floor(drnd() * 3),
      }));
    },

    buildStars() {
      if (!this.sctx) return;
      this.starField = [];
      let s = 987654321;
      const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
      const n = this.vw < 820 ? Math.round(CONFIG.starCount * 0.5) : CONFIG.starCount;
      for (let i = 0; i < n; i++) {
        this.starField.push({
          x: rnd() * this.vw, y: rnd() * this.vh * 0.84,
          r: rnd() * 1.1 + 0.25, a: 0.25 + rnd() * 0.75,
          sp: 0.6 + rnd() * 2.2, ph: rnd() * 6.283,
        });
      }
    },

    /* ── events ── */
    bind() {
      window.addEventListener("scroll", () => {
        this.targetP = this.scrollProgress();
        if (this.el.nav) this.el.nav.classList.toggle("is-stuck", window.scrollY > 40);
      }, { passive: true });

      let rt;
      window.addEventListener("resize", () => {
        clearTimeout(rt);
        rt = setTimeout(() => {
          const small = this.vw < 820 !== window.innerWidth < 820;
          this.measure();
          if (small) this.loadPlates();
        }, 160);
      });

      document.querySelectorAll("[data-goto]").forEach((a) => {
        a.addEventListener("click", (e) => {
          const sc = this.scenes.find(s => s.id === a.dataset.goto);
          if (!sc) return;
          e.preventDefault();
          const target = sc.top + Math.min(sc.h - this.vh, this.vh * 0.25);
          window.scrollTo({ top: Math.max(0, target), behavior: this.reduce ? "auto" : "smooth" });
        });
      });

      const top = document.getElementById("backToTop");
      if (top) top.addEventListener("click", () =>
        window.scrollTo({ top: 0, behavior: this.reduce ? "auto" : "smooth" }));

      const mark = document.querySelector('.nav__mark[href="#top"]');
      if (mark) mark.addEventListener("click", (e) => {
        e.preventDefault(); window.scrollTo({ top: 0, behavior: this.reduce ? "auto" : "smooth" });
      });
    },

    scrollProgress() {
      return clamp(window.scrollY /
        Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
    },
    scrollToProgress(target) {
      const max = document.documentElement.scrollHeight - this.vh;
      window.scrollTo({ top: clamp(target) * max, behavior: this.reduce ? "auto" : "smooth" });
    },

    /* ═══════════════════════════ FRAME ═══════════════════════════ */
    tick(now) {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      const t = now / 1000;

      if (window.Theme) window.Theme.update(dt);
      const mix = window.Theme ? window.Theme.mix : 0;

      this.p += (this.targetP - this.p) * (this.reduce ? 1 : CONFIG.cameraSmooth);
      const p = this.p;

      this.updateSky(p, mix, t);
      this.updateCabin(p, mix, t);
      this.updatePlates(p, mix);
      this.updateClouds(p, mix, t);
      this.updateStars(p, mix, t);
      this.updatePlane(p, t);
      this.updateGround(p, mix);
      this.updateContent(p);
      this.updateChrome(p);

      this.raf = requestAnimationFrame(this.tick.bind(this));
    },

    updateSky(p, mix, t) {
      const d = sampleSky(SKY_DAY, p), n = sampleSky(SKY_NIGHT, p);
      const s = this.el.stage.style;
      s.setProperty("--sky-top", rgbCss(mix3(d[0], n[0], mix)));
      s.setProperty("--sky-mid", rgbCss(mix3(d[1], n[1], mix)));
      s.setProperty("--sky-bottom", rgbCss(mix3(d[2], n[2], mix)));

      const hz = mix3(HORIZON_DAY, HORIZON_NIGHT, mix);
      s.setProperty("--horizon-glow", rgbCss(hz, (smooth(0.44, 0.80, p) * (mix ? 0.3 : 0.55)).toFixed(3)));

      const rise = smooth(0.05, 0.16, p) * (1 - smooth(0.74, 0.94, p));
      const drift = this.reduce ? 0 : Math.sin(t * 0.12) * 1.2;
      this.el.celestial.style.transform = `translate3d(0,${(-14 * p + drift).toFixed(2)}vh,0)`;
      if (this.el.sun) this.el.sun.style.opacity = ((1 - mix) * rise).toFixed(3);
      if (this.el.moon) this.el.moon.style.opacity = (mix * rise).toFixed(3);
    },

    updateCabin(p, mix, t) {
      const cab = this.el.cabin;
      if (!cab) return;
      /* photographic cabin dissolves into the live sky as the camera arrives */
      const out = 1 - smooth(0.03, 0.135, p);
      const dolly = 1 + smooth(0.0, 0.155, p) * 1.9 * CONFIG.dolly * (this.cabinZoom == null ? 1 : this.cabinZoom);
      const sway = this.reduce ? 0 : Math.sin(t * 0.32) * 0.5;
      cab.style.opacity = out.toFixed(3);
      cab.style.transform = `scale(${dolly.toFixed(4)}) translate3d(0,${sway.toFixed(2)}px,0)`;
      cab.style.visibility = out < 0.004 ? "hidden" : "visible";

      if (this.el.intro) {
        const o = 1 - smooth(0.006, 0.062, p);
        this.el.intro.style.opacity = o.toFixed(3);
        this.el.intro.style.transform = `translate3d(0,${((1 - o) * -26).toFixed(1)}px,0)`;
      }
      if (this.el.hint) this.el.hint.style.opacity = (1 - smooth(0.004, 0.045, p)).toFixed(3);

      /* nav + rail flip to light while they sit over the dark cabin */
      const onDark = out > 0.35 && mix < 0.6;
      if (this._onDark !== onDark) {
        this._onDark = onDark;
        [this.el.nav, this.el.rail].forEach(el => el && el.classList.toggle("on-dark", onDark));
      }
    },

    updatePlates(p, mix) {
      /* clouds: photographic plate fading in with the cloud density */
      const dens = this.cloudDensity(p);
      const cd = this.plateEls["clouds-day"], cn = this.plateEls["clouds-night"];
      const vis = (0.88 + 0.12 * smooth(0.06, 0.22, p)) * (1 - 0.9 * smooth(0.62, 0.88, p));
      if (cd) cd.style.opacity = (vis * CONFIG.plateStrength * (1 - mix)).toFixed(3);
      if (cn) cn.style.opacity = (vis * CONFIG.plateStrength * mix).toFixed(3);
      if (this.el.plates) {
        const sc = 1.06 + p * 0.1;
        this.el.plates.style.transform =
          `translate3d(0,${(-p * 3.5).toFixed(2)}vh,0) scale(${sc.toFixed(3)})`;
      }
      /* ground plates handled with the ground layer */
      const lv = smooth(0.56, 0.72, p) * CONFIG.landStrength;
      const ld = this.plateEls["land-day"], ln = this.plateEls["land-night"];
      if (ld) ld.style.opacity = (lv * (1 - mix)).toFixed(3);
      if (ln) ln.style.opacity = (lv * mix).toFixed(3);
    },

    cloudDensity(p) {
      /* p = 0 must already read ~0.6: the window frames real clouds at take-off,
         in both day and night, then they thicken as the camera pulls out. */
      const base  = 0.70 + 0.30 * smooth(0.02, 0.18, p);
      const clear = 1 - 0.9 * smooth(0.50, 0.72, p);
      const tail  = 0.08 * smooth(0.80, 0.98, p);
      return base * clear + tail;
    },

    updateClouds(p, mix, t) {
      const ctx = this.cctx;
      if (!ctx) return;
      const W = this.vw, H = this.vh;
      ctx.clearRect(0, 0, W, H);
      const density = this.cloudDensity(p);
      this.el.clouds.style.opacity = (density * CONFIG.cloudOpacity).toFixed(3);
      if (density < 0.004) return;

      const [sw, sh] = this.spriteSize;
      const cx = W * 0.5, cy = H * 0.46;
      const maxR = Math.hypot(W, H) * 0.78;
      const day = this.sprites.day, night = this.sprites.night;

      for (let i = 0; i < this.clouds.length; i++) {
        const c = this.clouds[i];
        let u = (p * CONFIG.cloudSpeed * c.rate + c.phase) % 1;
        if (u < 0) u += 1;
        const env = smooth(0, 0.13, u) * (1 - smooth(0.55, 1, u));
        if (env <= 0.002) continue;
        const rad = 26 + Math.pow(u, 1.75) * maxR;
        const x = cx + Math.cos(c.a) * rad;
        const y = cy + Math.sin(c.a) * rad * 0.72;
        const sc = c.s * CONFIG.cloudSize * (0.14 + u * 1.55);
        const w = sw * sc, h = sh * sc;
        if (x < -w || x > W + w || y < -h || y > H + h) continue;
        const a = env * c.alpha;
        if (mix < 1) { ctx.globalAlpha = a * (1 - mix); ctx.drawImage(day[c.variant], x - w / 2, y - h / 2, w, h); }
        if (mix > 0) { ctx.globalAlpha = a * mix * 0.85; ctx.drawImage(night[c.variant], x - w / 2, y - h / 2, w, h); }
      }

      const deckA = smooth(0.42, 0.60, p) * (1 - smooth(0.70, 0.90, p));
      if (deckA > 0.01) {
        for (const d of this.deck) {
          const w = sw * d.s * CONFIG.cloudSize * 0.7, h = sh * d.s * CONFIG.cloudSize * 0.7;
          const x = ((d.x * W + p * W * d.drift * 0.6) % (W + w * 2)) - w;
          ctx.globalAlpha = deckA * 0.4;
          ctx.drawImage(day[d.variant], x, d.y * H, w, h);
          if (mix > 0) {
            ctx.globalAlpha = deckA * 0.4 * mix;
            ctx.drawImage(night[d.variant], x, d.y * H, w, h);
          }
        }
      }
      ctx.globalAlpha = 1;
    },

    updateStars(p, mix, t) {
      const ctx = this.sctx;
      if (!ctx) return;
      const a = mix * (1 - 0.6 * smooth(0.58, 0.95, p));
      this.el.stars.style.opacity = a.toFixed(3);
      if (a < 0.01 || !this.starField) return;
      ctx.clearRect(0, 0, this.vw, this.vh);
      for (let i = 0; i < this.starField.length; i++) {
        const s = this.starField[i];
        const tw = this.reduce ? 1 : 0.55 + 0.45 * Math.sin(t * s.sp + s.ph);
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = i % 9 === 0 ? "#FFE9D6" : "#EAF2F8";
        ctx.beginPath();
        ctx.arc(s.x, s.y + p * 24 * (0.2 + s.a), s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },

    updatePlane(p, t) {
      const el = this.el.plane;
      if (!el) return;
      const [x, y, s, r, o] = keys(PLANE_KEYS, p);
      if (o <= 0.001) { el.style.opacity = 0; return; }
      const bob = this.reduce ? 0 : Math.sin(t * 0.7) * 1.1 * CONFIG.bob;
      const sway = this.reduce ? 0 : Math.sin(t * 0.43) * 0.7 * CONFIG.bob;
      el.style.opacity = o.toFixed(3);
      el.style.transform =
        `translate3d(${(x * CONFIG.planeTravel).toFixed(2)}%,${(y + bob).toFixed(2)}%,0) ` +
        `scale(${(s * CONFIG.planeScale).toFixed(3)}) rotate(${(r + sway).toFixed(2)}deg)`;
    },

    updateGround(p, mix) {
      const g = this.el.ground;
      if (!g) return;
      const t = smooth(0.615, 0.82, p);
      const far = mix3(hex2rgb(GROUND_DAY[0]), hex2rgb(GROUND_NIGHT[0]), mix);
      const near = mix3(hex2rgb(GROUND_DAY[1]), hex2rgb(GROUND_NIGHT[1]), mix);
      this.el.stage.style.setProperty("--ground-far", rgbCss(far));
      this.el.stage.style.setProperty("--ground-near", rgbCss(near));
      g.style.opacity = smooth(0.54, 0.68, p).toFixed(3);
      /* the camera keeps sinking toward the runway */
      g.style.transform =
        `translate3d(0,${((1 - t) * 100).toFixed(2)}%,0) scale(${(1.28 - 0.28 * t).toFixed(3)})`;
      g.style.visibility = t < 0.002 ? "hidden" : "visible";
    },

    updateContent(p) {
      let maxR = 0, active = null, bestD = 1e9;
      for (const sc of this.scenes) {
        const span = Math.max(0.0001, sc.end - sc.start);
        const u = clamp((p - sc.start) / span);
        const op = smooth(0.06, 0.30, u) * (1 - smooth(0.70, 0.96, u));
        if (sc.reveals.length && op > maxR) maxR = op;
        const d = Math.abs(u - 0.5);
        if (op > 0.15 && d < bestD) { bestD = d; active = sc.id; }
        for (const el of sc.reveals) {
          const shift = (0.5 - u) * 46;
          const driftX = (el === sc.rail && this.vw > 820) ? (0.5 - u) * 90 : 0;
          el.style.opacity = op.toFixed(3);
          el.style.transform = `translate3d(${driftX.toFixed(2)}px,${shift.toFixed(2)}px,0)`;
          el.style.visibility = op < 0.004 ? "hidden" : "visible";
        }
      }
      /* the descent / landing is scenery — clear the veil so the aircraft and
         runway are visible, then let it return for the closing scenes */
      const scenery = smooth(0.52, 0.66, p) * (1 - smooth(0.84, 0.94, p));
      const scrim = Math.max(maxR * CONFIG.scrim * (1 - 0.8 * scenery),
                             smooth(0.86, 0.96, p) * 0.34);
      this.el.scrim.style.opacity = scrim.toFixed(3);
      this.activeScene = active;
    },

    updateChrome(p) {
      const pct = (p * 100).toFixed(2) + "%";
      if (this.el.railFill) this.el.railFill.style.height = pct;
      if (this.el.railPlane) this.el.railPlane.style.top = pct;

      let idx = 0;
      if (typeof PHASES !== "undefined") PHASES.forEach((ph, i) => { if (p >= ph.at - 0.015) idx = i; });
      if (this.railBtns) this.railBtns.forEach((b, i) => b.classList.toggle("is-current", i === idx));

      document.querySelectorAll(".nav__links a[data-goto]").forEach((a) => {
        a.classList.toggle("is-current", a.dataset.goto === this.activeScene);
      });
    },
  };

  window.Journey = Journey;
  window.addEventListener("load", () => {
    if (Journey.inited) Journey.measure(); else Journey.init();
  });
})();
