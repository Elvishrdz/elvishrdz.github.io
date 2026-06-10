# Elvis Hernández — Portfolio

A single-page, dependency-free portfolio site. **No build step, no framework, no bundler** — plain HTML, CSS and ES2015+
JavaScript served as static files. Bilingual (Spanish / English) and fully responsive, with reduced-motion support
throughout.

## Run it

Any static server from this folder, e.g.:

```bash
python3 -m http.server 4173      # then open http://localhost:4173
```

There is nothing to install or compile.

## Layout

```
index.html        Single page: hero · about · experience · projects · skills · contact · footer
css/styles.css    One stylesheet. Design tokens (CSS variables) at the top, then
                  one "===== Section =====" block per area, media queries, reduced-motion.
js/               Six scripts, loaded in this order (order matters — see below):
  i18n.js         I18N dictionary (es/en) + language switching. Owns `currentLang`.
  experience.js   "Experience" guided-tour accordion (data in JOBS), autoplay gated to viewport.
  projects.data.js  PROJECTS + FEATURES — pure data, the single source of truth for projects.
  projects.js     Projects grid + fullscreen project viewer (FLIP open, device frames,
                  screenshot gallery, focus lightbox, mobile slide-in dock).
  techcloud.js    Animated tech-chip cloud in the Contact section (self-contained IIFE).
  main.js         Global interactions: nav, parallax, reveal-on-scroll, typewriter,
                  counters, 3D tilt, cursor glow.
docs/plan/        Planning notes (not shipped).
```

## How the pieces talk (no modules)

Because there's no bundler, a few names are intentionally **global** and shared across files via load order:

- `I18N`, `currentLang`, `applyLang()`, `getTypewriterPhrases()` — defined in `i18n.js`.
- `PROJECTS`, `FEATURES` — defined in `projects.data.js`, consumed by `projects.js`.
- The custom **`langchange`** event (dispatched by `applyLang`) tells other scripts to
  re-render their text in place (the projects viewer, the typewriter, etc.).

Keep the `<script>` order in `index.html` intact: `i18n` → `experience` → `projects.data` →
`projects` → `techcloud` → `main`. A consumer must load after the file that defines its globals.

## Conventions

- **Data-driven.** To add/change content, edit the data, not the markup:
  projects → `PROJECTS` in `projects.data.js` (its header comment documents the full
  `media` schema: device frames, galleries with per-shot `kind`/`group`/`caption`, etc.);
  experience → `JOBS` in `experience.js`; contact tech chips → `TECH` in `techcloud.js`.
- **Bilingual text** is `{ es, en }` objects in the data and `data-i18n="key"` attributes in
  HTML (keys live in `i18n.js`). Never hard-code user-facing copy in `.js`/`.html`.
- **Reduced motion** is honored everywhere via `matchMedia("(prefers-reduced-motion: reduce)")` —
  match the existing guards when adding animation.
- **CSS** uses the design tokens (CSS variables) at the top of `styles.css`; section order in
  that file affects the cascade, so prefer adding rules within the relevant section.
