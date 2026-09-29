# Portfolio — A Journey

A scroll-driven UI/UX portfolio: **Take off → Explore → Discover → Descend → Land → Connect**,
in Day and Night. No build step, no dependencies — serve the folder and open it.

```
portfolio/
├── index.html              the journey (cabin → sky → clouds → descent → landing → globe)
├── case.html               case-study reader (case.html?p=your-slug)
├── assets/
│   ├── img/                photographic environment plates (see §5)
│   ├── css/main.css        design tokens + all styling (Day & Night)
│   └── js/
│       ├── content.js      ← ALL YOUR CONTENT LIVES HERE
│       ├── theme.js        day/night engine (a re-lighting pass, not a filter)
│       ├── cursor.js       tiny airplane cursor + faint flight-path trail
│       ├── journey.js      scroll-driven environment engine (+ CONFIG dials)
│       ├── render.js       builds the journey page from content.js
│       └── case.js         builds the case-study page from content.js
└── README.md
```

## Run it locally

```bash
cd portfolio
python3 -m http.server 8080
# open http://localhost:8080
```

---

## 1 · Editing your content

Everything is in **`assets/js/content.js`**. You never need to touch another file to change
words, projects or links.

Placeholders are written as `ph("text")` and render with a faint dotted underline so you can
spot them. Replace the text inside the quotes:

```js
name: "Aarav Mehta",           // was: ph("Your Name")
role: "UI/UX Design Student",
```

When everything is filled in, set `SHOW_PLACEHOLDER_MARKS = false` at the top of the file.

| Section | Where it appears in the journey |
|---|---|
| `SITE.name / role / introLine` | Inside the airplane cabin (Take Off) |
| `SITE.exploreLine` | First look out of the window (Explore) |
| `SITE.about` | About, floating in the sky (Discover) |
| `SITE.skills` | Skills & tools (Discover) |
| `PROJECTS` | Work cards / destinations (Discover) |
| `SITE.process` | Design process (Descend) |
| `SITE.resume` | Resume (Land) |
| `SITE.contact` | Contact + links (Connect) |
| `SITE.final` | Final scene with the globe (Connect) |

Empty arrays and empty strings render as elegant "coming soon" states — nothing is invented
to fill space.

---

## 2 · Adding a project

Copy the schema below into the `PROJECTS` array in `content.js`. Only `slug` and `title` are
required; anything you don't have can stay empty or be deleted.

```js
{
  slug: "hope",                        // url becomes case.html?p=hope
  title: "HOPE",
  tagline: "A one-line description",
  year: "2026",
  type: "Academic project",             // Academic / Self-initiated / Practice
  role: "Sole designer",
  status: "In progress",
  tools: ["Figma", "Miro"],
  tags:  ["UX research", "Mobile"],
  summary: "Two or three sentences for the card and the case-study intro.",
  cover: { hue: 205, image: "" },      // hue 0–360 tints the generated cover
                                       // or: image: "assets/img/hope.png"
  caseStudy: {
    overview:  "…",
    problem:   "…",
    users:     "…",
    research:  { method: ["…"], insights: ["…"] },
    ia:        ["…"],
    flows:     ["…"],
    wireframes:{ note: "…", image: "" },
    decisions: [{ title: "…", body: "…" }],
    iterations:["…"],
    finalUI:   { note: "…", image: "assets/img/hope-final.png" },
    outcome:   "…",
    learning:  "…",
    extra:     [{ title: "Anything else", body: "…", image: "" }],
  },
}
```

The card appears automatically in the Work scene and `case.html?p=hope` becomes a full
case-study page. Covers are *designed* (duotone ground, planning grid, plotted flight arc,
project initials) rather than illustrated — drop in a real image whenever you have one.

---

## 3 · Tuning the experience

Every environment dial lives at the top of **`assets/js/journey.js`**:

```js
const CONFIG = {
  cameraSmooth:  0.075,  // 0.02 = slow, heavy camera · 0.3 = snappy
  dolly:         1.00,   // how far the camera pushes into the window
  cloudCount:    20,     // procedural cloud clusters (desktop)
  cloudSpeed:    1.00,
  cloudSize:     1.00,
  cloudOpacity:  0.62,   // lower = the photographic plate leads
  plateStrength: 0.92,   // opacity of the photographic cloud/land plates
  planeScale:    1.00,   // make the airplane smaller / bigger
  planeTravel:   1.00,
  bob:           1.00,
  globeScale:    1.00,
  starCount:     260,
  scrim:         0.60,   // light band behind reading content
  landStrength:  1.00,
};
```

| You want to… | Change |
|---|---|
| slow the camera down | `cameraSmooth: 0.04` |
| fewer clouds | `cloudCount: 12` |
| a more photographic sky | `cloudOpacity: 0.35`, `plateStrength: 1` |
| smaller airplane | `planeScale: 0.7` |
| longer journey | raise the `--h` values on each `<section class="scene">` in `index.html` |
| more readable text everywhere | `scrim: 0.8` |
| different sky | edit `SKY_DAY` / `SKY_NIGHT` in `journey.js` |

---

## 4 · Art direction

The aim is a **film still, not a website template**: a dark, desaturated, atmospheric set with
calm editorial typography layered on top.

* **Cabin** — a photographic interior whose window area is masked out, so the *live* sky shows
  through the glass. The camera's transform origin is the window itself, so the dolly pushes
  toward it, then dissolves into open sky.
* **Light** — the interior stays deep in shadow so the window reads as the light source; a
  bloom bleeds across the cabin, and the nav/rail flip to light type while they sit over it.
* **Content** — About, Skills and Process sit *bare* on the atmosphere (the scrim does the
  contrast work); Work cards stay as objects because they are "destinations".
* **Scrim** — a horizontal band: it veils the reading column and clears the right-hand side so
  the globe is never washed out.
* **Contrast** — text is never smaller than 14px, body copy sits at 1.65–1.8 line-height, and
  every scene was measured for contrast in both themes.
* **Type** — Manrope (display, 500 / 600, tight tracking) + Inter (UI + body, mostly 300/400).

---

## 5 · Image assets

`assets/img/` holds the photographic plates. They are optional — delete them and the
environment falls back to pure gradient + procedural clouds (update `plateStrength: 0`).

| File | Used for |
|---|---|
| `plate-cabin-day.jpg` / `plate-cabin-night.jpg` | cabin interior (loads first) |
| `plate-clouds-day.jpg` / `plate-clouds-night.jpg` | cloud deck below the aircraft |
| `plate-land-day.jpg` / `plate-land-night.jpg` | runway / terrain during descent |
| `plate-earth.jpg` | the globe (masked into a circle) |

Each has a `-sm` variant served to screens under 820px. Plates are fetched after first paint,
so the cabin appears immediately. To replace one: keep the filename, keep it roughly 16:9,
favour cinematic, desaturated photography over illustration.

---

## 6 · Accessibility & performance

* Honours `prefers-reduced-motion`: camera easing removed, no idle drift, no blinking lights,
  shorter scroll distance.
* Custom airplane cursor is desktop-only (fine pointer); touch keeps the native cursor.
* Animates `transform` / `opacity` only. Clouds and stars are pre-rendered sprites / batched
  canvas draws at a capped device-pixel-ratio; canvases idle at zero cost when off-stage.
* Mobile: fewer clouds, half-resolution canvas, `-sm` images, a taller cabin crop so the
  window still reads, stacked project cards, no rail drift.
* Theme: follows the visitor's system preference on first visit, then remembers their choice.
