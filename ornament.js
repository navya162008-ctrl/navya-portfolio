/* ═══════════════════════════════════════════════════════════════════════════
   GLASS ORNAMENTS — a few tiny aeroplanes and stars resting near the edges of
   the glassmorphic panels (About, How I work).

   They are static until the cursor comes near, then they drift a few pixels
   away from it and settle again — no constant animation, nothing decorative
   enough to compete with the content. Disabled for reduced-motion users.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const panels = document.querySelectorAll(".panel--glass");
  if (!panels.length) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(hover: none)").matches;   // touch: no cursor to follow

  const PLANE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>';
  const STAR  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l1.75 6.35L20 10.7l-6.25 1.75L12 18.8l-1.75-6.35L4 10.7l6.25-1.75z"/></svg>';

  /* Wide screens: 14 pieces hugging all four edges. Offsets are in px so they
     stay inside the panel's padding and never touch the text.
     Narrow screens get a tighter, smaller set for the same reason. */
  const WIDE = [
    { kind: "plane", size: 17, css: "left:10px;top:12px" },
    { kind: "star",  size: 11, css: "right:17px;top:17px" },
    { kind: "star",  size: 10, css: "left:18px;bottom:18px" },
    { kind: "plane", size: 16, css: "right:11px;bottom:11px" },
    { kind: "star",  size: 9,  css: "left:20px;top:38%",     side: true },
    { kind: "star",  size: 12, css: "left:16px;top:62%",     side: true },
    { kind: "star",  size: 8,  css: "left:21px;top:80%",     side: true },
    { kind: "star",  size: 12, css: "right:16px;top:34%",    side: true },
    { kind: "plane", size: 15, css: "right:12px;top:58%",    side: true },
    { kind: "star",  size: 9,  css: "right:20px;top:78%",    side: true },
    { kind: "star",  size: 11, css: "left:34%;top:17px",     mid: true },
    { kind: "star",  size: 8,  css: "right:30%;top:21px",    mid: true },
    { kind: "star",  size: 12, css: "left:44%;bottom:16px",  mid: true },
    { kind: "star",  size: 9,  css: "right:36%;bottom:20px", mid: true }
  ];
  const NARROW = [
    { kind: "plane", size: 10, css: "left:11px;top:12px" },
    { kind: "star",  size: 8,  css: "right:12px;top:13px" },
    { kind: "star",  size: 7,  css: "left:12px;bottom:13px" },
    { kind: "plane", size: 9,  css: "right:11px;bottom:14px" },
    { kind: "star",  size: 8,  css: "left:46%;top:9px" },
    { kind: "star",  size: 7,  css: "right:44%;bottom:10px" }
  ];
  const NARROW_AT = 1024;
  const pickSet = () => (window.innerWidth < NARROW_AT ? NARROW : WIDE);

  const RADIUS = 240;      // how close the cursor must be to wake one up
  const PUSH   = 8;        // maximum drift, in pixels
  const EASE   = 0.075;    // follows the cursor lazily

  const items = [];
  let mode = null;

  const build = () => {
    const next = window.innerWidth < NARROW_AT ? "narrow" : "wide";
    if (next === mode) return;
    mode = next;
    items.length = 0;
    panels.forEach(panel => {
      const old = panel.querySelector(".orbit");
      if (old) old.remove();
      const layer = document.createElement("div");
      layer.className = "orbit";
      layer.setAttribute("aria-hidden", "true");
      panel.insertBefore(layer, panel.firstChild);

      pickSet().forEach(spec => {
        const el = document.createElement("span");
        el.className = "orbit__i orbit__i--" + spec.kind +
                       (spec.mid ? " orbit__i--mid" : "") + (spec.side ? " orbit__i--side" : "");
        el.style.cssText = spec.css + ";width:" + spec.size + "px;height:" + spec.size + "px";
        el.innerHTML = spec.kind === "plane" ? PLANE : STAR;
        layer.appendChild(el);
        items.push({ el, ox: 0, oy: 0, w: spec.size, h: spec.size, panel, cx: 0, cy: 0,
                     x: 0, y: 0, tx: 0, ty: 0, spin: spec.kind === "plane" ? 45 : 0 });
      });
    });
  };

  /* cache positions once per layout change — never measured inside the loop */
  const measure = () => {
    items.forEach(it => {
      it.ox = it.el.offsetLeft; it.oy = it.el.offsetTop;
    });
    panels.forEach(p => { p._r = p.getBoundingClientRect(); });
    items.forEach(it => {
      const r = it.panel._r;
      it.cx = r.left + it.ox + it.w / 2;
      it.cy = r.top + it.oy + it.h / 2;
    });
  };

  build();
  measure();
  if (reduce || coarse) return;          // ornaments stay, motion does not

  let mx = -9999, my = -9999, running = false;

  const frame = () => {
    let moving = false;
    for (const it of items) {
      const dx = it.cx - mx, dy = it.cy - my;
      const d = Math.hypot(dx, dy) || 1;
      if (d < RADIUS) {
        const f = (1 - d / RADIUS);
        it.tx = (dx / d) * PUSH * f;
        it.ty = (dy / d) * PUSH * f;
      } else {
        it.tx = 0; it.ty = 0;
      }
      it.x += (it.tx - it.x) * EASE;
      it.y += (it.ty - it.y) * EASE;
      if (Math.abs(it.tx - it.x) > 0.05 || Math.abs(it.ty - it.y) > 0.05) moving = true;
      const spin = it.spin ? ` rotate(${it.spin + it.x * 0.35}deg)` : "";
      it.el.style.transform = `translate3d(${it.x.toFixed(2)}px,${it.y.toFixed(2)}px,0)${spin}`;
    }
    if (moving) requestAnimationFrame(frame);
    else running = false;                 // idle: no loop, no battery cost
  };

  const kick = () => { if (!running) { running = true; requestAnimationFrame(frame); } };

  window.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; kick(); }, { passive: true });
  window.addEventListener("mouseleave", () => { mx = my = -9999; kick(); }, { passive: true });

  let pending = false;
  const remeasure = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      const before = mode;
      build();                       // follows the breakpoint across resizes
      measure();
      if (before !== mode) kick();
    });
  };
  window.addEventListener("scroll", remeasure, { passive: true });
  window.addEventListener("resize", remeasure, { passive: true });

})();
