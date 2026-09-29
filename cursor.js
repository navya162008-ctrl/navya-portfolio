/* ═══════════════════════════════════════════════════════════════════════════
   CUSTOM CURSOR — a tiny airplane with a faint flight-path trail.
   Desktop (fine pointer) only. Disabled for touch and reduced-motion users.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = document.getElementById("cursor");
  if (!fine || !el) return;

  const plane = el.querySelector(".cursor__plane");
  const ring  = el.querySelector(".cursor__ring");
  const TRAIL = reduce ? 0 : 6;

  document.documentElement.classList.add("has-cursor");

  const dots = [];
  for (let i = 0; i < TRAIL; i++) {
    const d = document.createElement("span");
    d.className = "trail";
    document.body.appendChild(d);
    dots.push({ el: d, x: 0, y: 0 });
  }

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let x = mx, y = my, px = mx, py = my;
  let angle = -45, targetAngle = -45, scale = 1, targetScale = 1;
  let hover = false, down = false, visible = false;

  const ease = reduce ? 0.55 : 0.19;

  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    mx = e.clientX; my = e.clientY;
    if (!visible) {
      x = px = mx; y = py = my;
      dots.forEach(d => { d.x = mx; d.y = my; });
      visible = true; el.classList.add("is-on");
    }
    const speed = Math.min(28, Math.hypot(mx - x, my - y));
    targetScale = hover ? 1.3 : (1 + Math.min(0.12, speed * 0.006));
  }, { passive: true });

  document.addEventListener("pointerdown", () => { down = true; el.classList.add("is-down"); });
  document.addEventListener("pointerup",   () => { down = false; el.classList.remove("is-down"); });
  document.addEventListener("mouseleave",  () => { visible = false; el.classList.remove("is-on"); });
  document.addEventListener("mouseenter",  () => { visible = true; el.classList.add("is-on"); });

  document.addEventListener("pointerover", (e) => {
    const t = e.target && e.target.closest
      ? e.target.closest("a,button,[data-cursor],input,textarea,select")
      : null;
    hover = !!t;
    el.classList.toggle("is-hover", hover);
    if (hover) targetScale = 1.28;
    /* over the resume pills the native pointer takes over, so the click
       affordance is unmistakable; the aeroplane steps aside just there */
    const onPass = !!(e.target && e.target.closest && e.target.closest(".passhit"));
    document.documentElement.classList.toggle("is-native", onPass);
  }, { passive: true });

  function frame() {
    px = x; py = y;
    x += (mx - x) * ease;
    y += (my - y) * ease;

    // the aeroplane noses into the direction of travel (nose = +X in the SVG)
    const vx = x - px, vy = y - py;
    const speed = Math.hypot(vx, vy);
    if (speed > 0.4) targetAngle = Math.atan2(vy, vx) * 180 / Math.PI;
    let turn = ((targetAngle - angle + 540) % 360) - 180;   // shortest way round
    angle += turn * (reduce ? 0.4 : 0.17);
    scale += (targetScale - scale) * 0.16;

    el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    plane.style.transform = `rotate(${angle.toFixed(2)}deg) scale(${scale.toFixed(3)})`;

    let lx = x, ly = y;
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const f = 0.42 - i * 0.045;
      d.x += (lx - d.x) * Math.max(0.08, f);
      d.y += (ly - d.y) * Math.max(0.08, f);
      lx = d.x; ly = d.y;
      const o = ((1 - i / dots.length) * 0.22).toFixed(3);
      const s = (1 - i / dots.length) * 0.85;
      d.el.style.transform = `translate3d(${d.x.toFixed(2)}px, ${d.y.toFixed(2)}px, 0) scale(${s.toFixed(3)})`;
      d.el.style.opacity = visible ? o : 0;
    }
    if (ring) ring.style.opacity = hover ? 0.5 : 0;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
