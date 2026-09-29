/* ═══════════════════════════════════════════════════════════════════════════
   FLIGHT TOOLKIT sequence
   closed → click → lid swings up on its hinge → tools float in immediately
   in a zig-zag on both sides → cursor makes them all drift/tilt gently →
   click → tools reset → lid swings back down. No delays, no image swapping:
   the lid is a real 3D plane; the base never moves.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const tk = document.getElementById("toolkit");
  if (!tk) return;
  const stage = tk.querySelector(".tk__stage");
  const kase  = tk.querySelector(".tk__case");
  const tools = [...tk.querySelectorAll(".tk__tool")];
  if (!tools.length) return;

  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LEFT_N = 7;                       /* 13 tools → 7 left, 6 right */

  let phase = "closed";
  let G = null;                           // geometry cache
  let openTimer = 0, closeTimer = 0;

  /* per-tool parallax depth factor (varied so each chip responds a little differently) */
  tools.forEach((el, i) => el.style.setProperty("--f", (0.45 + (i % 7) * 0.11).toFixed(2)));

  const T = (x, y, s, rx) =>
    `perspective(900px) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)}) rotateX(${rx.toFixed(1)}deg)`;

  function measure() {
    const sr = stage.getBoundingClientRect();
    const caseW = kase.offsetWidth || Math.min(640, sr.width * 0.6);
    const margin = (sr.width - caseW) / 2;             /* clear zone around the case */
    const gap = Math.max(6, sr.width * 0.011);
    const narrow = window.matchMedia("(max-width:900px)").matches;
    const H = Math.floor((sr.height * 0.92 - 6 * gap) / 7);
    const zig = narrow ? 0 : Math.round(H * 0.42);     /* gentle zig-zag offset */
    const W = Math.max(52, Math.min(H, margin - sr.width * 0.012 - zig - 10));   /* square logo chips */
    const colL = sr.width * 0.012;
    const colR = sr.width - sr.width * 0.012 - W - zig;
    const yL = (sr.height - (7 * H + 6 * gap)) / 2;
    const yR = (sr.height - (6 * H + 5 * gap)) / 2;
    G = { sr, W, H,
      slot: tools.map((el, i) => {
        const left = i < LEFT_N;
        const row = left ? i : i - LEFT_N;
        const off = (row % 2) * zig;                   /* alternating inward step */
        return { x: (left ? colL : colR) + off, y: (left ? yL : yR) + row * (H + gap) };
      })
    };
    tools.forEach(el => { el.style.width = W + "px"; el.style.height = H + "px"; });
  }

  function place(el, i, mode) {        // "slot" = floating beside the case, "hidden"
    const s = G.slot[i];
    if (mode === "hidden") {
      el.style.transform = T(s.x, s.y + 16, 0.55, 26);
      el.style.opacity = "0";
    } else {
      el.style.transform = T(s.x, s.y, 1, 0);
      el.style.opacity = "1";
    }
  }

  function setPhase(next, opts) {
    const o = opts || {};
    phase = next;
    tk.dataset.phase = next;
    tk.setAttribute("aria-expanded", next === "closed" ? "false" : "true");
    live.textContent = LIVE[next] || live.textContent;
    clearTimeout(openTimer); clearTimeout(closeTimer);

    if (next === "opening") {
      /* lid swings (CSS); tools float in as it finishes — no waiting */
      openTimer = setTimeout(() => { if (phase === "opening") setPhase("open"); }, reduce ? 20 : 620);
      return;
    }
    if (next === "open") {
      tools.forEach((el, i) => {
        el.style.transitionDelay = o.instant ? "0ms" : (i * 55) + "ms";
        if (o.instant) el.classList.add("no-anim");
        place(el, i, "slot");
        if (o.instant) requestAnimationFrame(() => el.classList.remove("no-anim"));
      });
      return;
    }
    if (next === "closing") {
      tools.forEach((el, i) => {
        el.style.transitionDelay = o.instant ? "0ms" : ((i % 7) * 35 + Math.floor(i / LEFT_N) * 50) + "ms";
        if (o.instant) el.classList.add("no-anim");
        place(el, i, "hidden");
        if (o.instant) requestAnimationFrame(() => el.classList.remove("no-anim"));
      });
      closeTimer = setTimeout(() => { if (phase === "closing") setPhase("closed"); }, reduce ? 30 : 480);
      return;
    }
    /* closed */
    tools.forEach((el, i) => {
      el.style.transitionDelay = "0ms";
      if (o.instant) el.classList.add("no-anim");
      place(el, i, "hidden");
      if (o.instant) requestAnimationFrame(() => el.classList.remove("no-anim"));
    });
  }

  /* ── touch wording + screen-reader phase announcements ── */
  const hint = tk.querySelector(".tk__hint");
  if (hint && matchMedia("(pointer:coarse)").matches) hint.textContent = "Tap to open";
  const live = document.createElement("div");
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  tk.appendChild(live);
  const LIVE = {
    closed:  "Flight Toolkit closed",
    opening: "Flight Toolkit opening",
    open:    "Flight Toolkit open — thirteen design tools arranged around it",
    closing: "Flight Toolkit closing"
  };

  /* ── interaction ── */
  const toggle = () => {
    if (phase === "closed") setPhase("opening");
    else if (phase === "open") setPhase("closing");
    /* opening/closing ignore extra clicks until settled */
  };
  kase.addEventListener("click", (e) => { if (!e.target.closest(".tk__tool")) toggle(); });
  tk.addEventListener("keydown", (e) => {
    if (e.target !== tk && e.target !== kase) return;
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); toggle(); }
  });
  kase.setAttribute("role", "button");
  kase.setAttribute("tabindex", "0");
  kase.setAttribute("aria-label", "Flight Toolkit case — activate to open or close");

  /* ── cursor parallax + gentle tilt on every floating chip ── */
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  const loop = () => {
    cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
    tk.style.setProperty("--mx", cx.toFixed(3));
    tk.style.setProperty("--my", cy.toFixed(3));
    if (Math.abs(tx - cx) < 0.01 && Math.abs(ty - cy) < 0.01) { raf = 0; return; }
    raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  if (!reduce) {
    tk.addEventListener("pointermove", (e) => {
      const r = tk.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width  - 0.5;
      ty = (e.clientY - r.top)  / r.height - 0.5;
      kick();
    }, { passive: true });
    tk.addEventListener("pointerleave", () => { tx = 0; ty = 0; kick(); }, { passive: true });
  }

  /* ── boot + resize ── */
  let rt = 0;
  const remeasure = () => {
    measure();
    tools.forEach((el, i) => {
      el.classList.add("no-anim");
      place(el, i, phase === "open" ? "slot" : "hidden");
      requestAnimationFrame(() => el.classList.remove("no-anim"));
    });
  };
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(remeasure, 160); }, { passive: true });
  measure();
  setPhase("closed", { instant: true });
})();
