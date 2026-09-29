/* ═══════════════════════════════════════════════════════════════════════════
   THEME — Day ↔ Night
   The theme is a *time of day*, not a colour filter. journey.js reads
   Theme.mix (0 = day, 1 = night) every frame and re-lights the sky, clouds,
   ground and horizon. CSS variables handle text, panels and UI contrast.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const KEY = "journey-theme";
  const DURATION = 1.15;                       // seconds for the day↔night crossfade
  const root = document.documentElement;

  const Theme = {
    name: "day",
    target: 0,        // 0 day · 1 night
    progress: 0,      // eased linearly toward target
    mix: 0,           // smoothstepped value used by the renderer
    listeners: [],

    init() {
      let saved = null;
      try { saved = localStorage.getItem(KEY); } catch (e) {}
      if (!saved) saved = "day";   // light mode is the default opening; toggle switches & remembers
      this.name = saved === "night" ? "night" : "day";
      this.target = this.name === "night" ? 1 : 0;
      this.progress = this.target;
      this.mix = this.target;
      root.setAttribute("data-theme", this.name);
      root.style.setProperty("--theme-instant", "0s");
      requestAnimationFrame(() => root.style.removeProperty("--theme-instant"));

      const btn = document.getElementById("themeToggle");
      if (btn) {
        btn.addEventListener("click", () => this.toggle());
        btn.setAttribute("aria-label",
          this.name === "night" ? "Switch to day mode" : "Switch to night mode");
      }
      this.sync();
      return this;
    },

    set(name, animate = true) {
      this.name = name === "night" ? "night" : "day";
      this.target = this.name === "night" ? 1 : 0;
      if (!animate) { this.progress = this.target; this.mix = this.target; }
      root.setAttribute("data-theme", this.name);
      try { localStorage.setItem(KEY, this.name); } catch (e) {}
      const btn = document.getElementById("themeToggle");
      if (btn) btn.setAttribute("aria-label",
        this.name === "night" ? "Switch to day mode" : "Switch to night mode");
      this.sync();
      this.listeners.forEach(fn => fn(this.name));
    },

    toggle() { this.set(this.name === "night" ? "day" : "night"); },

    onChange(fn) { this.listeners.push(fn); },

    sync() {
      const label = document.getElementById("themeLabel");
      if (label) label.textContent = this.name === "night" ? "Night" : "Day";
    },

    /** called once per frame from journey.js */
    update(dt) {
      if (this.progress !== this.target) {
        const step = dt / DURATION;
        if (this.target > this.progress) this.progress = Math.min(this.target, this.progress + step);
        else this.progress = Math.max(this.target, this.progress - step);
        const t = this.progress;
        this.mix = t * t * (3 - 2 * t);           // smoothstep
      }
    }
  };

  window.Theme = Theme.init();
})();
