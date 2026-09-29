/* ═══════════════════════════════════════════════════════════════════════════
   CONTENT — this is the only file you need to edit to change your portfolio.
   ───────────────────────────────────────────────────────────────────────────
   · Any string wrapped in  ph("…")  is a PLACEHOLDER. It renders with a soft
     dotted underline so you can spot it in the browser (an image you still
     owe, a sentence you want to reword). Replace the text, or delete ph() and
     write plain text:   name: "Navya Gupta",
   · When every placeholder is filled, set  SHOW_PLACEHOLDER_MARKS = false.
   · Nothing here is invented. Empty arrays / empty strings render as quiet
     "to be added" blocks — never as fake results, numbers or screens.
   ═══════════════════════════════════════════════════════════════════════════ */

const SHOW_PLACEHOLDER_MARKS = true;

/* ── helpers (used by the render scripts, no need to edit) ───────────────── */
const _PH = new Set();
function ph(s){ if (typeof s === "string" && s) _PH.add(s); return s; }
function esc(s){
  return String(s == null ? "" : s).replace(/[&<>"]/g, c =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
/** escaped text; placeholders get a subtle marker */
function T(s){
  if (s == null || s === "") return "";
  return (SHOW_PLACEHOLDER_MARKS && _PH.has(s))
    ? `<span class="ph">${esc(s)}</span>` : esc(s);
}
/** escaped text with <br> support, used for multi-line blocks */
function TB(s){ return T(s).replace(/\n/g, "<br>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>"); }

/* ═══════════════════════════════════════════════════════════════════════════
   1 · IDENTITY  (hero)
   ═══════════════════════════════════════════════════════════════════════════ */
const SITE = {
  name:        "Navya Gupta",
  formalName:  "",                                   // appears in the browser tab
  monogram:    "",                                   // auto-generated if empty

  role:        "UI/UX Design Student",

  /* Two short lines under your name. \n starts a new line. */
  introLine:   "Exploring how thoughtful design can make digital experiences simpler, clearer, and more human.\nLearning, experimenting, and building through hands-on design projects.",

  locationLine: "Based in Jaipur, India",

  /* Scene 02 — the first look outward. Keep it short. */
  exploreLine:  "Everything here is a work in progress — the projects, the thinking, and me.",

  /* Scene 07 — a quiet beat before landing. */
  descendNote:  "The closer you look, the quieter the work gets.",
};

/* ═══════════════════════════════════════════════════════════════════════════
   2 · ABOUT
   ═══════════════════════════════════════════════════════════════════════════ */
SITE.about = {
  heading: "Meet Navya",
  body: [
    "I'm Navya, a curious design student exploring different sides of design — from graphic and jewellery design to UI/UX. **Currently, I'm focusing on UI/UX by building projects, exploring different design approaches, and gaining hands-on experience through making.**",
    "For me, design is also a way of staying curious and learning through making. I like experimenting, noticing small details, and exploring different ways to solve a problem rather than settling on the first idea.",
    "Outside of design, I enjoy sketching, painting, baking, and travelling. These little interests keep me creative, observant, and open to new perspectives — qualities that naturally find their way into how I approach design.",
  ],

  /* ── Currently learning — what you're actively developing ── */
  learning: [
    "UX Research",
    "Design Systems",
    "Prototyping",
    "Usability Testing",
  ],

  /* ── Curious about — where you want to go next (rendered differently) ── */
  interests: [
    "Accessibility",
    "Human-Centered Design",
    "Interaction Design",
    "AI × UX",
  ],

  /* Education / background. [{title, org, period, note}] */
  education: [
    { title: "Bachelor of Arts (B.A.)", org: "Undergraduate", period: "Currently pursuing", note: "" },
  ],
  educationPlaceholder: ph("Add your education or background."),
};

/* ═══════════════════════════════════════════════════════════════════════════
   3 · FLIGHT TOOLKIT  (skills + tools)
   ───────────────────────────────────────────────────────────────────────────
   skillList  = design capabilities. Each one gets a subtle ✦ marker.
   tools      = software. Add a logo later by filling  logo: "assets/img/figma.svg"
                (leave "" and it renders a clean monogram tile instead — no fake logos).
   No percentages, no progress bars, no invented proficiency levels.
   ═══════════════════════════════════════════════════════════════════════════ */
SITE.skills = {
  /* Your toolkit graphic. It replaces the text lists below.
     Set image: "" to go back to rendering the text lists. */
  /* light-mode graphic + dark-mode graphic (same design, two colour schemes) */
  imageDay:    "assets/img/toolkit-day.webp",
  imageDayJpg: "assets/img/toolkit-day.jpg",      // fallback for old browsers
  imageNight:  "assets/img/toolkit-night.webp",
  imageNightJpg: "assets/img/toolkit-night.jpg",
  imageAlt: "Flight Toolkit — the design skills I'm building and the tools I use",
  note: "",

  skillList: [
    "UX Research",
    "Information Architecture",
    "User Flows",
    "Wireframing",
    "Persona Development",
    "Visual/UI Design",
    "Graphic Design",
    "Prototyping",
    "Design Systems",
    "Creativity & Ideation",
    "Problem Solving",
  ],

  tools: [
    "Figma", "Photoshop", "Illustrator", "CorelDRAW",
    "Rhino", "Matrix", "FigJam", "ChatGPT",
    "Claude", "Gemini", "Google Flow", "Canva", "Stitch",
  ],

  emptyNote: ph("Add your tools here."),
};

/* ═══════════════════════════════════════════════════════════════════════════
   4 · WORK / PROJECTS
   ═══════════════════════════════════════════════════════════════════════════ */
SITE.work = {
  note: "One project, documented properly — the thinking behind it, not just the screens.",
};

/* ── PROJECT SCHEMA ─────────────────────────────────────────────────────────
   {
     slug: "hope",            // url: case.html?p=hope
     title: "HOPE",
     tagline: "…",            // short line under the title
     summary: "…",            // longer line for the case-study page
     year, type, role, status,   // optional meta chips
     tags: ["UX/UI", "Mobile App", "Accessibility"],
     cover: { hue: 205, image: "" },   // image = "" → designed cover
     caseStudy: { sections: [ … ] }
   }

   CASE STUDY SECTION SCHEMA (rendered in order, top to bottom):
   {
     id: "overview",
     title: "Overview",            // small section label
     heading: "…",                 // optional big statement
     paras: ["…"],                 // optional body paragraphs
     list: { title: "…", items: ["…"] },   // optional list
     quote: "…",                   // optional callout (e.g. a How Might We)
     note:  "…",                   // optional muted line
     cards: [{ label, title, body }],      // optional small cards
     steps: [{ label, title, body }],      // optional horizontal chain
     figures: [{ label, caption }],        // optional image placeholders
   }
   images: fill  image: "assets/img/your-file.png"  on a figure when you have it.
──────────────────────────────────────────────────────────────────────────────── */
const PROJECTS = [
  {
    slug: "hope",
    caseUrl: "https://hope-case-study-project.vercel.app/",   // live HOPE case study (opens as separate page)
    title: "HOPE",
    tagline: "A senior-friendly support app",
    blurb: "A support app designed to help older adults stay independent, connected, and supported.",
    metaLine: "UI/UX Design · Mobile App",
    summary: "Designing a calmer, more accessible way for older adults to manage everyday support, stay connected, and reach help when they need it.",
    tags: ["UX/UI", "Mobile App", "Accessibility"],
    cover: { hue: 205, image: "assets/img/hope-cover.webp" },

    caseStudy: {
      sections: [

        /* 01 ─ OVERVIEW ─────────────────────────────────────────────── */
        {
          id: "overview",
          title: "Overview",
          heading: "One app replaces the five a senior would otherwise need to juggle alone.",
          paras: [
            "HOPE brings everyday task support, family connection, community support, safety, and help requests into one place — so the people who need support aren't left managing five different tools to get it.",
          ],
          list: {
            title: "Core features",
            items: [
              "HOPE Companion — voice-first support",
              "Medicine reminders",
              "Care Circle",
              "Verified Volunteers",
              "Community Groups",
              "Smart SOS",
            ],
          },
          note: "Design principles — Simplicity · Trust · Autonomy",
          figures: [
            { label: "Home screen — image to be added",
              caption: "HOPE brings everyday support, family connection, and safety into one simple experience." },
          ],
        },

        /* 02 ─ CONTEXT ──────────────────────────────────────────────── */
        {
          id: "context",
          title: "Context",
          heading: "Support for older adults is real, but it's scattered across people, services, and apps.",
          paras: [
            "Family members may not always be physically present. Older adults may need support with everyday tasks, with connection, or with safety — and those needs don't arrive neatly separated.",
            "HOPE brings family, trusted volunteers, and community support into one experience instead of adding another isolated tool.",
          ],
          note: "Constraint: the experience should not feel complicated, clinical, or dependent on deep menus.",
          figures: [
            { label: "Ecosystem / system diagram — image to be added",
              caption: "HOPE connects the user to the people already around them instead of adding another isolated tool." },
          ],
        },

        /* 03 ─ PROBLEM ──────────────────────────────────────────────── */
        {
          id: "problem",
          title: "Problem",
          heading: "One grandmother's routine surfaced problems no single existing app solves together.",
          paras: [
            "Looking closely at one daily routine surfaced several small problems that are really connected to each other:",
          ],
          list: {
            title: "What surfaced",
            items: [
              "Missed medicine or everyday tasks",
              "Loneliness",
              "Difficulty reaching the right person for help",
              "Too many separate apps solving individual problems",
            ],
          },
          quote: "How might we help older adults get everyday, social, and emergency support easily, while still allowing them to remain independent and in control?",
          figures: [
            { label: "Competitor / feature-gap analysis — image to be added" },
          ],
        },

        /* 04 ─ RESEARCH & INSIGHTS ──────────────────────────────────── */
        {
          id: "research",
          title: "Research & Insights",
          heading: "One real interview plus AI-assisted secondary research shaped five core themes.",
          paras: [
            "Primary research: one interview with my grandmother. Secondary research was AI-assisted. That is the honest scale of it — one conversation, used carefully.",
          ],
          list: {
            title: "Core themes",
            items: [
              "Independence → became My Autonomy",
              "Trust → became Trusted Volunteers and the Trust Score concept",
              "Connection → became Care Circle and Community",
              "Safety",
              "Simplicity",
            ],
          },
          figures: [
            { label: "Research notes / persona — image to be added" },
          ],
        },

        /* 05 ─ DEFINITION / IA ──────────────────────────────────────── */
        {
          id: "definition",
          title: "Definition",
          heading: "Five sections replace a tangle of features with one predictable structure.",
          paras: [
            "The information architecture was organised around real situations rather than simply grouping features — so the structure answers “what do I need right now?” instead of “which category is this in?”",
          ],
          list: {
            title: "Main navigation",
            items: ["Home", "Help", "Care Circle", "Community", "You"],
          },
          steps: [
            { label: "Process", title: "Research", body: "One interview, plus secondary reading." },
            { label: "→", title: "IA", body: "Five sections built around situations." },
            { label: "→", title: "User Flows", body: "The main paths: reminders, help, connection." },
            { label: "→", title: "Wireframes", body: "Low fidelity, deliberately plain." },
            { label: "→", title: "UI", body: "Type, contrast, and spacing for older eyes." },
          ],
          figures: [
            { label: "IA / sitemap — image to be added" },
          ],
        },

        /* 06 ─ DESIGN DECISIONS ─────────────────────────────────────── */
        {
          id: "decisions",
          title: "Design Decisions",
          paras: [
            "An earlier version of the navigation used six tabs, with Volunteers as its own destination. The 6-tab version created visible visual clutter, so I simplified the structure to 5 sections and moved Volunteers inside Help.",
            "This was a judgement call made on clarity, not something confirmed by testing — it's exactly the kind of decision I'd want to put in front of real users next.",
          ],
          figures: [
            { label: "6 tabs → 5 tabs — image to be added",
              caption: "Before: six tabs, Volunteers on its own. After: five tabs, Volunteers inside Help." },
          ],
        },

        /* 07 ─ AUTONOMY MODEL ───────────────────────────────────────── */
        {
          id: "autonomy",
          title: "Autonomy Model",
          heading: "Every autonomy tier changes who taps the button, not just what's on screen.",
          paras: [
            "This is my own working model for the concept, not an established framework. The interface stays visually consistent across all three tiers — what changes is who is actually performing the action.",
          ],
          cards: [
            { label: "Tier 1", title: "Independent",
              body: "The user manages actions themselves." },
            { label: "Tier 2", title: "Assisted",
              body: "HOPE Companion can help through voice and listening, reducing manual steps." },
            { label: "Tier 3", title: "Family Managed",
              body: "A trusted family member can act on the user's behalf — setting reminders, for example." },
          ],
          figures: [
            { label: "Three-mode comparison — image to be added" },
          ],
        },

        /* 08 ─ TRUST SCORE ──────────────────────────────────────────── */
        {
          id: "trust",
          title: "Trust Score",
          heading: "Trust Score — Early Concept",
          paras: [
            "I explored a trust layer for volunteers based on ideas such as verification and community feedback. The scoring logic remains an early concept and would require further research before being defined.",
          ],
        },

        /* 09 ─ SMART SOS ────────────────────────────────────────────── */
        {
          id: "sos",
          title: "Smart SOS",
          paras: [
            "The SOS experience prioritises trusted Care Circle members and nearby trusted volunteers before considering direct emergency-call integration.",
            "This is a design direction, not a proven safety result. Emergency-call integration is a future consideration, and any real version of this flow would need far more research than I've done so far.",
          ],
        },

        /* 10 ─ VISUAL DESIGN ────────────────────────────────────────── */
        {
          id: "visual",
          title: "Visual Design",
          paras: [
            "Wireframes became interfaces by holding three things steady: large legible type, generous spacing, and one clear action per screen. Colour is used sparingly — mostly to signal help, urgency, and reassurance.",
            "These screens will be added as soon as they're ready; the placeholders below mark exactly where each one goes.",
          ],
          figures: [
            { label: "Final Home screen — image to be added" },
            { label: "Care Circle — image to be added" },
            { label: "Help — image to be added" },
            { label: "Community — image to be added" },
            { label: "Autonomy modes — image to be added" },
            { label: "Design system & components — image to be added" },
          ],
        },

        /* 11 ─ VALIDATION & LIMITATIONS ─────────────────────────────── */
        {
          id: "validation",
          title: "Validation & Limitations",
          heading: "This concept has not yet been formally tested with additional older adults.",
          paras: [
            "The current concept has been informed by one primary interview and secondary research. Formal usability testing with additional older adults has not yet been conducted.",
          ],
          list: {
            title: "What I learned",
            items: [
              "Independence matters more than convenience features",
              "Everyday support needs are small and frequent, not dramatic",
              "Connection is a feature, not a nice-to-have",
              "Simplicity is what makes the rest usable",
            ],
          },
          list2: {
            title: "What remains unvalidated",
            items: [
              "Navigation clarity with real seniors",
              "Readability and usability",
              "Autonomy modes",
              "Trust Score concept",
              "SOS / Help behaviour",
              "Care Circle interactions",
            ],
          },
          note: "Next step: test the core flows with additional older adults to understand navigation clarity, readability, ease of requesting help, understanding of autonomy modes, and confidence using Care Circle and Help.",
        },

        /* 12 ─ REFLECTION ───────────────────────────────────────────── */
        {
          id: "reflection",
          title: "Reflection",
          heading: "Wireframes took longer because every feature had to survive a “is this too complex for a senior?” filter.",
          paras: [
            "Research and IA moved relatively quickly. Wireframing took much longer, because features were repeatedly added, removed, simplified, and reconsidered — each one had to earn its place on screen.",
          ],
          steps: [
            { label: "Before",   title: "Medicine Streak",
              body: "A gamified streak system to encourage medicine adherence." },
            { label: "Problem",  title: "Added complexity",
              body: "It introduced another interaction layer on top of a task that already needed to be simple." },
            { label: "Decision", title: "Removed",
              body: "The reminder stayed. The streak went." },
            { label: "Learning", title: "Not every engaging feature improves the experience.",
              body: "Engagement mechanics are only useful when the underlying task is already effortless." },
          ],
        },
      ],
    },
  },
  /* next project: copy the schema in the comment block above */
];

/* ═══════════════════════════════════════════════════════════════════════════
   5 · HOW I WORK  (design process)
   ═══════════════════════════════════════════════════════════════════════════ */
SITE.process = {
  note: "I start by understanding the problem, structure the experience before visual design, explore alternatives, and refine based on what I learn.",
  steps: [],          // the six-step list is intentionally not used
};

/* ═══════════════════════════════════════════════════════════════════════════
   6 · RESUME
   ───────────────────────────────────────────────────────────────────────────
   Drop your PDF at  assets/resume.pdf  and set  file: "assets/resume.pdf".
   Until then the button renders as a clearly-marked placeholder (never
   “Coming Soon”), and the space stays reserved for it.
   ═══════════════════════════════════════════════════════════════════════════ */
SITE.resume = {
  available: true,
  file: "assets/resume.pdf",              // your uploaded CV — used exactly as-is

  /* the boarding pass is the whole section: same artwork, one version per theme,
     identical size/position, only the colours change. Background stripped,
     rounded edges + notches preserved. */
  pass: {
    day:   { image: "assets/img/pass-day.webp",   fallback: "assets/img/pass-day.png" },
    night: { image: "assets/img/pass-night.webp", fallback: "assets/img/pass-night.png" },
    alt: "Navya Gupta — boarding pass resume",
    width: 770, height: 408,
    /* clickable zones — measured off your artwork so each one sits exactly on
       the printed pill: view x47..256 / download x266..488, y318..370 of 770x408 */
    viewZone:     { left: 6.10,  top: 77.94, width: 27.14, height: 12.75 },
    downloadZone: { left: 34.55, top: 77.94, width: 28.83, height: 12.75 }
  },
  viewLabel: "View resume",
  downloadLabel: "Download resume PDF",
  filePlaceholder: ph("Add your PDF at assets/resume.pdf")
};

/* ═══════════════════════════════════════════════════════════════════════════
   7 · CONTACT
   ═══════════════════════════════════════════════════════════════════════════ */
SITE.contact = {
  heading: "Let's Connect",
  line: "I'm currently exploring UI/UX and looking for opportunities to learn, collaborate, and grow.",
  links: [
    { k: "Email",    v: "navya162008@gmail.com",               href: "mailto:navya162008@gmail.com" },
    { k: "LinkedIn", v: "linkedin.com/in/navya-gupta-9040b93a7",
                     href: "https://www.linkedin.com/in/navya-gupta-9040b93a7/" },
  ],
  pendingLabel: ph("Add your link"),
};

/* ═══════════════════════════════════════════════════════════════════════════
   8 · FINAL LANDING
   ═══════════════════════════════════════════════════════════════════════════ */
SITE.final = {
  word:  "Thanks for Flying With Me",
  line:  "This is where I am today. More to come.",
  footName: "",                 // falls back to SITE.name
  footMeta: "UI/UX Design Student · Jaipur, India",
};

/* ═══════════════════════════════════════════════════════════════════════════
   9 · PROGRESS RAIL LABELS (right-hand marker)
   ═══════════════════════════════════════════════════════════════════════════ */
const PHASES = [
  { id: "takeoff",  label: "Intro",   at: 0.00 },
  { id: "explore",  label: "About",   at: 0.14 },
  { id: "discover", label: "Toolkit", at: 0.34 },
  { id: "descend",  label: "Work",    at: 0.50 },
  { id: "land",     label: "Resume",  at: 0.74 },
  { id: "connect",  label: "Contact", at: 0.90 },
];
