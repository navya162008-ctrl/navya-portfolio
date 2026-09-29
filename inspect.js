/* ------------------------------------------------------------------
   inspect.js — temporary "what is this element?" helper.
   Toggle with the  I  key, or open  index.html?inspect=1
   Hover anything on the page: a tooltip shows its name.
   Numbered badges + a legend panel list every major element.
   Safe to delete: nothing else on the site references this file.
------------------------------------------------------------------- */
(function () {
  var on = false;

  /* ---- the labelled inventory ---------------------------------- */
  var ITEMS = [
    [".nav",                 "Top navigation bar"],
    [".nav__name",           "Nav — your name"],
    [".nav__sub",            "Nav — role line"],
    [".theme",               "Day / Night switch"],
    [".rail",                "Right-side chapter rail"],
    [".rail__list",          "Rail — chapter dots"],
    [".rail__plane",         "Rail — little plane marker"],
    [".scroll-hint",         "‘Scroll to begin’ hint"],
    ["#scrim",               "Light scrim behind text (readability veil)"],
    ["#bodyGrad",            "Body gradient (background wash)"],
    [".vignette",            "Dark edge vignette"],
    ["#grain",               "Film-grain texture"],
    ["#sky",                 "Sky gradient background"],
    ["#starsCanvas",         "Stars canvas (night)"],
    ["#celestial",           "Sun / moon group"],
    [".sun",                 "Sun / moon disc"],
    ["#cloudCanvas",         "Animated cloud canvas"],
    [".plate--clouds",       "Cloud photograph layer"],
    [".plate--land",         "Land / runway photograph layer"],
    ["#ground",              "Ground / runway band"],
    ["#plane",               "Aeroplane (exterior)"],
    ["#globe",               "Globe (CONNECT)"],
    ["#cabin",               "Aeroplane cabin + window (TAKE OFF)"],
    [".scene--cabin",        "Scene 1 — TAKE OFF"],
    [".panel",               "Content panel (text card)"],
    [".card",                "HOPE project card"],
    [".card__cover",         "Card cover artwork (grid + arc + ‘H’)"],
    [".card__no",            "Card number ‘01’"],
    [".card__body",          "Card text block"],
    [".chips",               "Skill chip rows"],
    [".skills__grid",        "Skills grid"],
    [".process",             "Design-process list"],
    [".about__block",        "About text block"],
    [".links",               "Contact links"],
    [".resume",              "Resume block"],
    [".foot",                "Footer"],
    [".eyebrow",             "Small section label"],
    [".work__rail",          "Work rail"],
    [".quiet-note",          "Note under a panel"],
    [".open-note",           "Note — open/coming soon"],
    [".process__note",       "Note — design process"]
  ];

  var host, tip, legend, raf = 0, boxes = [];

  /* ---- boot ----------------------------------------------------- */
  if (/[?&]inspect=1/.test(location.search)) {
    on = true;
    if (document.readyState === "loading") addEventListener("DOMContentLoaded", build);
    else build();
  }
  addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key !== "i" && e.key !== "I") return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    on = !on;
    on ? build() : teardown();
  });

  function build() {
    host = document.createElement("div");
    host.className = "inspect-host";
    document.body.appendChild(host);

    tip = document.createElement("div");
    tip.className = "inspect-tip";
    host.appendChild(tip);

    var n = 0;
    ITEMS.forEach(function (pair) {
      var list = document.querySelectorAll(pair[0]);
      for (var i = 0; i < list.length && i < 4; i++) {
        var el = list[i];
        n++;
        var outline = document.createElement("div");
        outline.className = "inspect-box";
        var badge = document.createElement("div");
        badge.className = "inspect-badge";
        badge.textContent = n;
        outline.appendChild(badge);
        host.appendChild(outline);
        boxes.push({ el: el, outline: outline, n: n, name: pair[1], stack: i });
      }
    });

    legend = document.createElement("div");
    legend.className = "inspect-legend";
    legend.innerHTML = "<b>INSPECTOR</b><span>Hover anything to name it · press <kbd>I</kbd> to hide</span>" +
      boxes.map(function (b) {
        return "<div><i>" + b.n + "</i>" + b.name + "</div>";
      }).join("");
    host.appendChild(legend);

    addEventListener("keydown", function (e) {
      if ((e.key === "i" || e.key === "I") && !e.metaKey && !e.ctrlKey) { on = false; teardown(); }
    });
    addEventListener("mousemove", onMove, { passive: true });
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    draw();
  }

  function schedule() { if (!raf) raf = requestAnimationFrame(draw); }

  function draw() {
    raf = 0;
    boxes.forEach(function (b) {
      var r = b.el.getBoundingClientRect();
      var vis = r.width > 1 && r.height > 1 && r.bottom > -50 && r.top < innerHeight + 50;
      b.outline.style.display = vis ? "block" : "none";
      if (!vis) return;
      b.outline.style.left = r.left + "px";
      b.outline.style.top = r.top + "px";
      b.outline.style.width = r.width + "px";
      b.outline.style.height = r.height + "px";
      b.outline.firstChild.style.marginTop = (b.stack * 18) + "px";
    });
  }

  function nameOf(el) {
    if (!el || el === document.body || el === document.documentElement) return "page background";
    var cls = (el.getAttribute && el.getAttribute("class") || "").trim();
    var id = el.id ? "#" + el.id : "";
    var tag = el.tagName ? el.tagName.toLowerCase() : "?";
    var label = "";
    for (var i = 0; i < ITEMS.length; i++) {
      if (el.matches && el.matches(ITEMS[i][0])) { label = ITEMS[i][1]; break; }
    }
    var code = tag + (id ? id : "") + (cls ? "." + cls.split(/\s+/).join(".") : "");
    return label ? label + "  —  " + code : code;
  }

  function onMove(e) {
    var el = document.elementFromPoint(e.clientX, e.clientY);
    tip.textContent = nameOf(el);
    tip.style.display = "block";
    var x = e.clientX + 14, y = e.clientY + 14;
    if (x > innerWidth - 320) x = e.clientX - 320;
    if (y > innerHeight - 60) y = e.clientY - 40;
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }

  function teardown() {
    removeEventListener("mousemove", onMove);
    removeEventListener("scroll", schedule);
    if (host) host.remove();
    host = tip = legend = null;
    boxes = [];
  }
})();
