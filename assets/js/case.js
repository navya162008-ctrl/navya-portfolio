/* ═══════════════════════════════════════════════════════════════════════════
   CASE STUDY — a calm, professional reading experience.
   The immersive journey stops at the door; this page is about the work.
   Everything is optional: empty fields simply don't render.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const root = document.getElementById("caseRoot");

  /* nav identity (same content file as the journey) */
  document.querySelectorAll('[data-bind="name"]').forEach(e => { e.innerHTML = T(SITE.name); });
  document.querySelectorAll('[data-bind="role"]').forEach(e => { e.innerHTML = T(SITE.role); });
  document.querySelectorAll('[data-bind="monogram"]').forEach(e => {
    e.textContent = SITE.monogram ||
      String(SITE.name).split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  });

  const params = new URLSearchParams(location.search);
  const slug = params.get("p");
  const index = PROJECTS.findIndex(p => p.slug === slug);
  const pr = index >= 0 ? PROJECTS[index] : null;

  document.title = pr ? `${pr.title} — Case Study` : "Case Study";

  if (!pr) {
    root.innerHTML = `
      <div class="case-empty">
        <p class="case__kicker">Case study</p>
        <h1>${pr === null && slug ? "That project isn't here yet" : "Case study — coming soon"}</h1>
        <p>${slug
          ? T(`No project matches “${slug}” in assets/js/content.js yet.`)
          : T("Add a project to PROJECTS in assets/js/content.js and its case study will live at case.html?p=your-slug.")}</p>
        <a class="btn btn--solid" href="index.html#work" data-cursor="link">Back to the journey</a>
      </div>`;
    return;
  }

  const cs = pr.caseStudy || {};
  const next = PROJECTS[(index + 1) % PROJECTS.length];

  const hue = (pr.cover && pr.cover.hue != null) ? pr.cover.hue : (198 + index * 41) % 360;
  const cover = (pr.cover && pr.cover.image)
    ? `<img src="${esc(pr.cover.image)}" alt="${esc(pr.title)}">`
    : `<svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(pr.title)} cover">
         <defs><linearGradient id="cc" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0" stop-color="hsl(${hue},24%,16%)"/>
           <stop offset="1" stop-color="hsl(${hue + 16},20%,29%)"/>
         </linearGradient></defs>
         <rect width="1200" height="420" fill="url(#cc)"/>
         <g stroke="#F7F8F5" stroke-opacity=".055" stroke-width="1" fill="none">
           <path d="M0 84H1200M0 168H1200M0 252H1200M0 336H1200"/>
           <path d="M100 0V420M200 0V420M300 0V420M400 0V420M500 0V420M600 0V420M700 0V420M800 0V420M900 0V420M1000 0V420M1100 0V420"/>
         </g>
         <path d="M150 372 C 430 344 730 236 1010 108" fill="none" stroke="#7EC8F5"
               stroke-opacity=".45" stroke-width="1.6" stroke-dasharray="4 9"/>
         <circle cx="1010" cy="108" r="62" fill="none" stroke="#FF765C" stroke-opacity=".42" stroke-width="1.6"/>
         <circle cx="1010" cy="108" r="5" fill="#FF765C" fill-opacity=".85"/>
         <text x="52" y="368" font-family="Manrope, sans-serif" font-size="230" font-weight="600"
               letter-spacing="-16" fill="#F7F8F5" fill-opacity=".085">${esc(
                 String(pr.title || "").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase()
               )}</text>
         <rect x="52" y="46" width="72" height="1.5" fill="#F7F8F5" fill-opacity=".22"/>
       </svg>`;

  /* ── section renderer: one honest story, in your order ────────────────── */
  const metaRow = (label, value) => value
    ? `<div><h4>${esc(label)}</h4><p>${T(value)}</p></div>` : "";
  const sections = (cs.sections || []).filter(Boolean);

  const figBlock = (f) => {
    if (!f) return "";
    const cap = f.caption ? `<figcaption>${T(f.caption)}</figcaption>` : "";
    const inner = f.image
      ? `<img src="${esc(f.image)}" alt="${esc(f.caption || f.label || "")}">`
      : `<span class="ph-img__label">${T(f.label || "Image to be added")}</span>`;
    return `<figure class="cs-fig${f.image ? "" : " cs-fig--ph"}">${inner}${cap}</figure>`;
  };

  const listBlock2 = (l) => (l && l.items && l.items.length)
    ? `<div class="cs-list"><h3>${T(l.title || "")}</h3><ul>${l.items.map(i => `<li>${TB(i)}</li>`).join("")}</ul></div>`
    : "";

  const sectionHTML = (sec) => `
    <section class="fade-up cs-section"${sec.id ? ` id="${esc(sec.id)}"` : ""}>
      ${sec.title ? `<p class="cs-kicker">${T(sec.title)}</p>` : ""}
      ${sec.heading ? `<h2 class="cs-statement">${TB(sec.heading)}</h2>` : ""}
      ${(sec.paras || []).filter(Boolean).map(t => `<p>${TB(t)}</p>`).join("")}
      ${listBlock2(sec.list)}
      ${listBlock2(sec.list2)}
      ${sec.quote ? `<blockquote class="cs-quote">${TB(sec.quote)}</blockquote>` : ""}
      ${(sec.cards && sec.cards.length) ? `<div class="cs-cards">${sec.cards.map(c => `
        <div class="cs-card">
          ${c.label ? `<span class="cs-card__label">${T(c.label)}</span>` : ""}
          <h3>${T(c.title)}</h3>
          <p>${TB(c.body)}</p>
        </div>`).join("")}</div>` : ""}
      ${(sec.steps && sec.steps.length) ? `<ol class="cs-steps">${sec.steps.map(st => `
        <li>
          <span class="cs-step__label">${T(st.label)}</span>
          <h3>${T(st.title)}</h3>
          <p>${TB(st.body)}</p>
        </li>`).join("")}</ol>` : ""}
      ${(sec.figures || []).map(figBlock).join("")}
      ${sec.note ? `<p class="cs-note">${TB(sec.note)}</p>` : ""}
    </section>`;

  const contents = sections.length > 2
    ? `<nav class="cs-contents" aria-label="Case study contents">
         <h4>Contents</h4>
         <ol>${sections.map((sec, i) =>
              `<li><a href="#${esc(sec.id || "s" + i)}" data-cursor="link">${T(sec.title || "Section " + (i + 1))}</a></li>`).join("")}</ol>
       </nav>`
    : "";

  root.innerHTML = `
    <a class="back" href="index.html#work" data-cursor="link">
      <svg viewBox="0 0 24 24"><path d="M19 12H6M12 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Back to work</a>

    <header class="case__hero">
      <p class="case__kicker">Case study${pr.type ? " · " + esc(pr.type) : ""}${pr.status ? " · " + esc(pr.status) : ""}</p>
      <h1 class="case__title">${T(pr.title)}</h1>
      ${pr.tagline ? `<p class="case__tagline">${T(pr.tagline)}</p>` : ""}
      ${pr.summary ? `<p class="case__sum">${TB(pr.summary)}</p>` : ""}
    </header>

    <div class="case__cover">${cover}</div>

    <div class="case__grid">
      <aside class="case-meta">
        ${contents}
        ${metaRow("Role", pr.role)}
        ${metaRow("Year", pr.year)}
        ${metaRow("Status", pr.status)}
        ${(pr.tools && pr.tools.length) ? `<div><h4>Tools</h4><ul>${pr.tools.map(t => `<li>${T(t)}</li>`).join("")}</ul></div>` : ""}
        ${(pr.tags && pr.tags.length) ? `<div><h4>Focus</h4><ul>${pr.tags.map(t => `<li>${T(t)}</li>`).join("")}</ul></div>` : ""}
      </aside>

      <div class="case-body">
        ${sections.length
          ? sections.map(sectionHTML).join("")
          : `<section class="fade-up">
               <h2>Case study in progress</h2>
               <p>${T("This project is being written up. Add sections under caseStudy.sections in assets/js/content.js and they appear here, in order.")}</p>
               <div class="ph-img">Add content under <code>caseStudy</code> in assets/js/content.js</div>
             </section>`}
      </div>
    </div>

    <div class="case-next">
      <a class="back" href="index.html#work" data-cursor="link">
        <svg viewBox="0 0 24 24"><path d="M19 12H6M12 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        All projects</a>
      ${next && next.slug !== pr.slug
        ? `<a class="btn" href="case.html?p=${esc(next.slug)}" data-cursor="link">Next: ${T(next.title)}</a>` : ""}
    </div>`;

  /* gentle reveal on scroll (skipped entirely for reduced-motion users) */
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = [...root.querySelectorAll(".fade-up")];
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(i => i.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    items.forEach(i => io.observe(i));
  }
})();
