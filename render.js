/* ═══════════════════════════════════════════════════════════════════════════
   RENDER — turns assets/js/content.js into the DOM, then starts the engine.
   You should never need to edit this file to change your content.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const set = (key, html) => {
    document.querySelectorAll(`[data-bind="${key}"]`).forEach(el => { el.innerHTML = html; });
  };
  const n = (v) => (v == null ? "" : String(v));

  /* ── identity ─────────────────────────────────────────────────────────── */
  const formal = SITE.formalName || SITE.name;
  SITE.monogram = SITE.monogram ||
    n(SITE.name).split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();

  set("name", T(SITE.name));
  set("role", T(SITE.role));
  set("monogram", esc(SITE.monogram));
  set("nameBig", T(SITE.name));
  set("roleBig", T(SITE.role));
  set("introLine", TB(SITE.introLine));
  set("locationLine", SITE.locationLine ? T(SITE.locationLine) : "");
  set("exploreLine", TB(SITE.exploreLine));
  set("descendNote", TB(SITE.descendNote));
  document.title = `${esc(formal)} — ${esc(SITE.role)}`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta && SITE.introLine) meta.setAttribute("content", String(SITE.introLine).slice(0, 155));

  /* ── about ────────────────────────────────────────────────────────────── */
  const A = SITE.about || {};
  set("aboutHeading", T(A.heading || "About me") + ' <span class="h2__star" aria-hidden="true">✦</span>');
  set("aboutBody", (A.body || []).filter(Boolean).map(t => `<p>${TB(t)}</p>`).join(""));
  set("learningList", (A.learning || []).map(t => `<li class="chip chip--solid">${T(t)}</li>`).join(""));
  set("interestsList", (A.interests || []).map(t => `<li class="chip chip--quiet">${T(t)}</li>`).join(""));
  set("educationList", (A.education || []).length
    ? A.education.map(e =>
        `<li>${T(e.title)}${e.org ? ` <small>${T(e.org)}${e.period ? " · " + T(e.period) : ""}</small>` : ""}${
          e.note ? `<small>${T(e.note)}</small>` : ""}</li>`).join("")
    : `<li>${T(A.educationPlaceholder || "Add your education or background.")}</li>`);

  /* ── flight toolkit ──────────────────────────────────────────────────── */
  const K = SITE.skills || {};
  set("skillsNote", T(K.note));

  const skills = (K.skillList || K.categories || []);
  const tools  = K.tools || [];

  /* skills: one consistent star marker — these are capabilities, not products */
  const skillsHTML = skills.length
    ? `<ul class="skill-list">${skills.map(sk => {
        const name = typeof sk === "string" ? sk : sk.title;
        const subs = (typeof sk === "object" && sk.items) ? sk.items : null;
        return `<li class="skill-item"><span class="skill-mark" aria-hidden="true">&#10022;</span>${T(name)}${
          subs ? `<small>${subs.map(i => T(i)).join(" · ")}</small>` : ""}</li>`;
      }).join("")}</ul>`
    : `<p class="empty">${T(K.emptyNote || "Add your skills here.")}</p>`;

  /* tools: real logo if you supply one, otherwise a clean monogram tile */
  const toolsHTML = tools.length
    ? `<ul class="tool-list">${tools.map(t => {
        const name = typeof t === "string" ? t : t.name;
        return `<li class="tool-item"><span class="tool-name">${T(name)}</span></li>`;
      }).join("")}</ul>`
    : `<p class="empty">${T(K.emptyNote || "Add your tools here.")}</p>`;

  const kitPic = (webp, jpg, cls) => webp ? `
        <picture class="${cls}">
          <source srcset="${esc(webp)}" type="image/webp">
          <img class="kit-img" src="${esc(jpg || webp)}" alt="${esc(K.imageAlt || "Flight toolkit")}" decoding="async" draggable="false">
        </picture>` : "";

  /* ── flight toolkit: the provided 3D case (clean cut-out) + orbit chips ── */
  const ORDER = window.TOOL_ORDER || tools.map(t => typeof t === "string" ? t : t.name);
  const ART = window.TOOL_ART || {};
  const orbitChips = ORDER.map((name, i) => {
    const a = ART[name] || { bg: "#334", svg: "" };
    return `<span class="tk__tool" data-i="${i}">
      <span class="tk__tile" style="background:${a.bg}" title="${T(name)}">${a.svg}</span>
    </span>`;
  }).join("");

  set("skillsGrid", `
    <div class="tk" id="toolkit" data-phase="closed">
      <div class="tk__stage">
        <div class="tk__case">
          <img class="tk__img tk__img--base tk__img--day"   src="assets/img/tk-open-day.webp"   alt="" draggable="false">
          <img class="tk__img tk__img--base tk__img--night" src="assets/img/tk-open-night.webp" alt="" draggable="false">
          <div class="tk__lid" aria-hidden="true">
            <img class="tk__img tk__img--lid tk__img--day"     src="assets/img/tk-open-day.webp"   alt="" draggable="false">
            <img class="tk__img tk__img--lid tk__img--night"   src="assets/img/tk-open-night.webp" alt="" draggable="false">
            <img class="tk__img tk__img--lidback tk__img--day"   src="assets/img/tk-lid-day.webp"   alt="" draggable="false">
            <img class="tk__img tk__img--lidback tk__img--night" src="assets/img/tk-lid-night.webp" alt="" draggable="false">
          </div>
        </div>
        <div class="tk__tools" aria-hidden="true">${orbitChips}</div>
        <i class="tk__shadow" aria-hidden="true"></i>
        <p class="tk__hint" aria-hidden="true">Click to open</p>
      </div>
    </div>
    <div class="sr-only">
      <h3>Design skills</h3>${skillsHTML}
      <h3>Tools</h3>${toolsHTML}
    </div>`);

  /* ── work ─────────────────────────────────────────────────────────────── */
  set("workNote", T((SITE.work || {}).note));

  /* Project covers are *designed*, not illustrated: duotone ground, a thin
     planning grid, a plotted flight arc and the project initials. */
  function coverSVG(project, i, placeholder) {
    const c = project.cover || {};
    if (c.image) return `<img src="${esc(c.image)}" alt="${esc(project.title)} preview">`;
    const hue = (c.hue != null) ? c.hue : (198 + i * 41) % 360;
    const initials = String(project.title || "—")
      .split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
    const a = `hsl(${hue},${placeholder ? 8 : 24}%,${placeholder ? 13 : 17}%)`;
    const b = `hsl(${hue + 16},${placeholder ? 10 : 20}%,${placeholder ? 20 : 29}%)`;
    return `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(project.title)} cover">
      <defs><linearGradient id="cv${i}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
      <rect width="400" height="220" fill="url(#cv${i})"/>
      <g stroke="#F7F8F5" stroke-opacity=".06" stroke-width="1" fill="none">
        <path d="M0 44H400M0 96H400M0 148H400M0 200H400"/>
        <path d="M40 0V220M120 0V220M200 0V220M280 0V220M360 0V220"/>
      </g>
      <path d="M120 186 C 190 168 252 128 336 62" fill="none" stroke="#7EC8F5"
            stroke-opacity=".45" stroke-width="1.2" stroke-dasharray="3 7"/>
      <circle cx="336" cy="62" r="26" fill="none" stroke="#FF765C" stroke-opacity=".45" stroke-width="1.2"/>
      <circle cx="336" cy="62" r="3" fill="#FF765C" fill-opacity=".8"/>
      <text x="24" y="196" font-family="Manrope, sans-serif" font-size="92" font-weight="600"
            letter-spacing="-5" fill="#F7F8F5" fill-opacity=".1">${esc(initials)}</text>
      <rect x="24" y="24" width="34" height="1" fill="#F7F8F5" fill-opacity=".25"/>
    </svg>`;
  }

  const arrow = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const rail = document.getElementById("workRail");

  if (PROJECTS.length === 0) {
    rail.innerHTML = `
      <article class="card card--placeholder">
        <div class="card__cover">${coverSVG({ title: "pending", cover: {} }, 0, true)}
          <span class="card__no">00</span></div>
        <div class="card__body">
          <h3 class="card__title">Projects — coming soon</h3>
          <p class="card__sum">${T("This is the first destination. Add a project in assets/js/content.js and it appears here, with its own case-study page.")}</p>
          <div class="card__cta"><span>No case study yet</span></div>
        </div>
      </article>`;
  } else {
    rail.innerHTML = PROJECTS.map((pr, i) => {
      return `
      <a class="card" href="${esc(pr.caseUrl ? pr.caseUrl : "case.html?p=" + pr.slug)}"${pr.caseUrl && /^https?:\/\//.test(pr.caseUrl) ? ' target="_blank" rel="noopener noreferrer"' : ''} data-cursor="link" aria-label="Open case study: ${esc(pr.title)}">
        <div class="card__cover">${coverSVG(pr, i)}<span class="card__no">${String(i + 1).padStart(2, "0")}</span></div>
        <div class="card__body card__body--compact">
          <div class="card__id">
            <h3 class="card__title">${T(pr.title)}</h3>
            <p class="card__sum">${T(pr.blurb || pr.tagline || pr.summary || "")}</p>
            ${pr.metaLine ? `<p class="card__meta-line">${T(pr.metaLine)}</p>` : ""}
          </div>
          <span class="card__go">View Case Study ${arrow}</span>
        </div>
      </a>`;
    }).join("");

    /* blank slots — same size & style, content added later by Navya */
    const BLANK_SLOTS = 3;
    const blanks = Array.from({ length: BLANK_SLOTS }, (_, n) => {
      const idx = PROJECTS.length + n;
      return `
      <article class="card card--blank" aria-label="Project ${String(idx + 1).padStart(2, "0")} — coming soon">
        <div class="card__cover">${coverSVG({ title: "", cover: {} }, idx, true)}<span class="card__no">${String(idx + 1).padStart(2, "0")}</span></div>
        <div class="card__body card__body--compact">
          <div class="card__id"><h3 class="card__title">&nbsp;</h3><p class="card__sum">&nbsp;</p></div>
        </div>
      </article>`;
    }).join("");
    rail.innerHTML += blanks;
  }

  /* ── process ──────────────────────────────────────────────────────────── */
  const P = SITE.process || {};
  set("processNote", T(P.note));
  set("processList", (P.steps || []).map(s =>
    `<li><h3>${T(s.title)}</h3><p>${TB(s.text)}</p></li>`).join(""));

  /* ── resume — the boarding pass IS the section ────────────────────────── */
  const R = SITE.resume || {};
  const PS = R.pass || {};
  const hasFile = !!R.file;
  const zone = (z) => z ? `left:${z.left}%;top:${z.top}%;width:${z.width}%;height:${z.height}%` : "";
  const hit = (cls, z, label, attrs) => hasFile && z
    ? `<a class="passhit ${cls}" style="${zone(z)}" href="${esc(R.file)}" ${attrs}
          aria-label="${esc(label)}" data-cursor="link"></a>`
    : "";

  set("resumeBox", `
    <div class="passwrap">
      <picture class="passimg passimg--day">
        ${PS.day ? `<source srcset="${esc(PS.day.image)}" type="image/webp">
        <img src="${esc(PS.day.fallback || PS.day.image)}" alt="${esc(PS.alt || "Resume")}"
             width="${PS.width || 770}" height="${PS.height || 408}" draggable="false">` : ""}
      </picture>
      <picture class="passimg passimg--night">
        ${PS.night ? `<source srcset="${esc(PS.night.image)}" type="image/webp">
        <img src="${esc(PS.night.fallback || PS.night.image)}" alt="" aria-hidden="true"
             width="${PS.width || 770}" height="${PS.height || 408}" draggable="false">` : ""}
      </picture>
      ${hit("passhit--view", PS.viewZone, R.viewLabel || "View resume", 'target="_blank" rel="noopener"')}
      ${hit("passhit--download", PS.downloadZone, R.downloadLabel || "Download resume PDF", "download")}
      ${hasFile ? "" : `<p class="resume__hint">${T(R.filePlaceholder || "Add your PDF at assets/resume.pdf")}</p>`}
    </div>`);

  /* single-file build only: the PDF is embedded inside the page, so turn it
     into a blob URL the buttons can genuinely open (a plain relative
     resume.pdf cannot be reached from inside a sandboxed viewer) */
  if (window.__RESUME__ && window.__RESUME__.b64) {
    try {
      const bin = atob(window.__RESUME__.b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      document.querySelectorAll(".passhit--view").forEach(a => a.setAttribute("href", url));
      document.querySelectorAll(".passhit--download").forEach(a => {
        a.setAttribute("href", url);
        a.setAttribute("download", window.__RESUME__.name || "resume.pdf");
      });
    } catch (err) { /* not fatal: the file href stays as it is */ }
  }

  /* ── contact ──────────────────────────────────────────────────────────── */
  const C = SITE.contact || {};
  set("contactHeading", T(C.heading || "Let's connect"));
  set("contactLine", TB(C.line));
  set("contactLinks", (C.links || []).map(l => {
    if (l.href && l.v) {
      const ext = /^https?:/i.test(l.href);
      return `<a href="${esc(l.href)}" ${ext ? 'target="_blank" rel="noopener"' : ""} data-cursor="link">
                <span class="k">${T(l.k)}</span><span class="v">${T(l.v)} <span class="arrow">↗</span></span></a>`;
    }
    if (l.v) return `<span class="pending"><span class="k">${T(l.k)}</span><span class="v">${T(l.v)}</span></span>`;
    return `<span class="pending"><span class="k">${T(l.k)}</span><span class="v">${T(C.pendingLabel || "Add your link")}</span></span>`;
  }).join(""));

  /* ── final ────────────────────────────────────────────────────────────── */
  const F = SITE.final || {};
  set("finalWord", T(F.word || "Connect"));
  set("finalLine", TB(F.line));
  set("footName", T(F.footName || SITE.name));
  set("footMeta", T(F.footMeta || ""));

  /* ── start the engine ─────────────────────────────────────────────────── */
  function boot() {
    if (window.Journey) window.Journey.init();
  }
  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { if (window.Journey && window.Journey.inited) window.Journey.measure(); });
  }
})();
