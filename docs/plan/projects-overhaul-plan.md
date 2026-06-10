# Plan — Populate Projects section + dedicated Project view

> Status: **v3 — reviewed, all decisions closed (incl. C1/C2); ready to build on your go.** Nothing
> implemented yet. Created 2026-06-15.
> Scope: only the **Projects section (grid)** and the **dedicated project detail (fullscreen viewer)
**. Experience/About/Skills/etc. untouched.

---

## 0. Decisions locked from review (2026-06-15)

1. **Projects without assets** → show as-is: **text + basic style only**, no fabricated/"designed"
   screens. Real captures arrive later.
2. **Backend** → we only have **text + stack**, no metrics. **Remove** all invented
   architecture/endpoint/latency/uptime data. A backend surface is just its description + tech
   stack.
3. **Only show provided info.** Assets will arrive in the future; build now with what exists.
4. **Include the Jobs section** (elvah, Tecnologías Móviles Globales) **behind one feature
   flag (`FEATURES.showJobs`)**. This flag gates the **entire** jobs showcase — both companies **and
   ** every internal sub-project/variant — so flipping it to `false` removes all employer work from
   the site in one place.
5. **Grid features 3 projects** — **Drink Water, Touch IT, Infocenter** (richest content) — + a **"
   Ver todos los proyectos / View all projects"** button that **expands the grid in place** to
   reveal the rest.
6. **WIP versions** (Touch IT v2, Infocenter v2, etc.) → **show them**, gated by the **same
   feature-flag mechanism** so they can be removed later if desired.
7. **Image quality:** keep **original quality** for now (it's a portfolio); revisit only if load
   becomes a problem.
8. **Clean, organized, professional structure** is a first-class requirement — the project must stay
   tidy, consistent and easy to extend (see §11). New projects should be addable by editing **data
   only**, not by touching layout/logic.
9. **Video = two tiers (Infinite Platform Game) — DECIDED.** **Background** = a **compressed muted
   loop** (`video-bg.mp4`, 720p, *decent* quality — not too low), kept in the repo. **Trailer** = the
   **original-quality** `video.mp4` **hosted in the GitHub repo** (option A), played **on demand** in
   a lightbox (loads only on click). Both ship via GitHub Pages.

---

## 1. Goal

Turn the placeholder projects + fullscreen viewer into a real, data-driven case-study experience
populated from the **Full Project Tech Stack** doc and the **Project Screenshots (web official)**
assets, following the **Portfolio Design System** — while keeping our existing architecture (FLIP
fullscreen viewer + left icon dock + scroll-to-navigate).

New capabilities (from the design system, trimmed to what we actually have data for):

- **VersionSwitch** — browse a project across versions (v1 → v2) in place; the detail re-themes (
  gradient, accent, stack, copy, media).
- **Surface switch** — for projects with both an **App** and a **Backend**, a segmented control to
  flip between them (each surface can have versions).
- **Multi-device gallery** — for KMP/adaptive projects with phone + tablet + chromebook screenshots.
- **Real assets** — icons, screenshots, non-screenshot images and background videos wired per the
  user's asset rules.
- **Job grouping** — one detail per job with internal variant navigation, behind a **feature flag**.

> Dropped vs design: the **BackendMock** (architecture diagram + fake endpoints/metrics) and the *
*designed PhoneMock screens** (fake app UI). Both fabricate data we don't have — replaced by real
> screenshots or a clean text detail (decisions §0.1, §0.2).

---

## 2. Key decisions (design vs our implementation)

| #  | Topic             | Design system                                 | Our decision                                                                      |
|----|-------------------|-----------------------------------------------|-----------------------------------------------------------------------------------|
| D1 | Detail container  | Separate full-page scroll-snap site           | **Keep our FLIP fullscreen overlay** (`#projectViewer`); enrich its stage.        |
| D2 | App screens       | "Designed" fake app UI from data              | **Real screenshots only.** No assets → **text + gradient + glyph** detail (§0.1). |
| D3 | Backend           | Architecture diagram + fake endpoints/metrics | **Text + stack only**, no fabricated data (§0.2).                                 |
| D4 | elvah entry       | Single "elvah · ChargeSDK" project            | **Replace with the job grouping** (all elvah variants).                           |
| D5 | Version years     | Sample years                                  | **Real years** from the tech doc.                                                 |
| D6 | Icon set          | Lucide CDN                                    | **Keep our inline SVGs**; no new dependency.                                      |
| D7 | Removable content | n/a                                           | **Feature flags** gate Jobs and WIP/optional versions (§0.4, §0.6).               |

---

## 3. New data model (`js/projects.data.js` — see split in §11)

A small config block of flags at the top, then a generalised project schema (a simple project is
just `versions:[one]`).

```
const FEATURES = {
  showJobs: true,          // §0.4 — flip to false to remove the whole Jobs showcase
  showWipVersions: true,   // §0.6 — flip to false to hide WIP/empty versions
};

PROJECTS = [{
  id, glyph, icon?,                 // icon path overrides glyph (rule 2)
  name, tagline {es,en},
  featured?: true,                  // §0.5 — one of the 3 shown by default
  group?: "job",                    // §0.4 — gated by FEATURES.showJobs
  // EXACTLY ONE of the next two:
  //   surfaces[]  — App/Backend, each surface owns its own versions[]
  //                 (matrix may be ragged: App can have v1+v2 while Backend has only v1)
  //   versions[]  — simple project (1+ versions, no surface switch)
  surfaces?: [{ label{es,en}, sub{es,en}, versions:[...] }],
  versions?: [{
     label, sub {es,en}, year, era,         // era: legacy|modern|auto
     wip?: true,                            // §0.6 — gated by FEATURES.showWipVersions
     meta {es,en}, gradient, accent,
     desc {es,en}, highlights {es,en}[], stack[],
     link? {label{es,en}, href},
     media: {
        kind: "phone" | "gallery" | "image" | "none",
        orientation?: "portrait" | "landscape", // frame aspect; games + Android Auto = landscape
        screenshots?: [path...],            // real shots → phone/landscape frames / gallery (rule 4)
        images?: [{src, label{es,en}}],     // non-screenshot resource → framed image (rule 3)
        devices?: [{kind:"phone|tablet|laptop", src, label}],  // multi-device gallery
        bgVideo?: path,                      // COMPRESSED background loop (~1–3 MB) — §0.9
        trailer?: {                          // on-demand original-quality video — §0.9
          provider: "youtube" | "vimeo" | "file",
          id?: "<videoId>",                  // for youtube/vimeo
          src?: "assets/projects/<id>/video.mp4", // for file (repo-hosted original)
          label?: {es,en}                    // button text, default "Ver tráiler / Watch trailer"
        }
     }
  }]
}]
```

- A **backend surface** is a normal surface whose version has `desc + stack` and
  `media.kind:"none"` (no diagram).
- **Bilingual:** `desc`, `highlights`, `tagline`, `meta`, labels are `{es,en}`. Stack tags stay
  language-neutral.
- **Modularity:** `FEATURES.showJobs` and `FEATURES.showWipVersions` are the single switches to
  add/remove that content (§0.4, §0.6).

---

## 4. Asset pipeline

Source: `…/elvishrdz.web/Projects Screenshots (web official)/`. Copy the relevant assets into the
repo at **original quality** (§0.7):

```
assets/projects/<project-id>/
   icon.png
   shot-1.png …                  (real app screenshots → phone frames)
   image-1.jpg …                 (non-screenshot resources → framed images)
   video.mp4                     (background video)
   <variant>/shot-*.png          (job variants)
```

Asset rules:

1. **Empty folder ⇒ no image resource** → text + gradient + glyph detail.
2. **Icon present ⇒ project icon.**
3. **Non-screenshot resource** (feature graphic, tv banner, promo photo) ⇒ **framed image card**,
   never a phone mockup.
4. **Video present ⇒ background video** + readability scrim, screenshots still legible on top.
5. **Responsive** verified phone / tablet / desktop.

Curation: include the meaningful screenshots per surface/variant (no hard compression for now —
original quality). Skip `.psd`. Keep `.DS_Store` out.

**Cleanup:** the current `js/projects.js` uses `assets/sample-bg.mp4` as a *test* background video
on Drink Water. In the rewrite Drink Water has no real video — remove that test usage; the only real
background video is **Infinite Platform Game**'s `gameplay.mp4`. The `sample-bg.mp4` file can be
deleted once nothing references it.

### Video strategy (§0.9) — Infinite Platform Game

The original `video.mp4` is **22 MB** (already at `assets/projects/infinite-platform-game/video.mp4`). Two tiers:

- **Background loop** → a **compressed** derivative (`video-bg.mp4`, ~1–3 MB: short, muted, ~720p, low bitrate). Needs a tool:
  - `ffmpeg` (not installed) — `brew install ffmpeg`, then e.g. `ffmpeg -i video.mp4 -t 12 -an -vf scale=-2:720 -b:v 1200k video-bg.mp4`. **Recommended** (I can run it once installed.)
  - or QuickTime "Export As… 720p", or an online compressor.
- **Trailer (original quality), on demand → DECIDED: option A (repo-hosted).** Keep the original `video.mp4` (22 MB) in the repo; the **"Ver tráiler"** button loads it **only on click** in a lightbox. `media.trailer = { provider:"file", src:"assets/projects/infinite-platform-game/video.mp4" }`. Self-contained, original quality, ships via GitHub Pages.
- **Compression target (background):** 720p, muted, H.264 CRF ~26–27 (decent quality, not too low). Source is 1920×1080 · 44 s. Command:
  `ffmpeg -i video.mp4 -an -vf "scale=1280:-2" -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart video-bg.mp4`
  → expect a few MB. If too big, raise CRF / trim length; if grainy, lower CRF. `media.bgVideo = ".../video-bg.mp4"`.

---

## 5. Per-project resource map

| Project                                      | Versions / surfaces                      | Real assets                                                                                                       | Detail media                                                |
|----------------------------------------------|------------------------------------------|-------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|
| **Drink Water** ⭐                            | v1 (2019) + v2 (2026)                    | v1: icon + shots + tv banner. v2: icon + **multi-device** (phone/tablet/chromebook) + feature graphic + tv banner | v1 = phone shots; v2 = **device gallery**                   |
| **Touch IT** ⭐                               | v1 (2019) + v2 (2026 WIP); App + Backend | v1: icon + many shots + feature graphic + tv banner. v2: none                                                     | v1 App = phone shots, Backend = text+stack; v2 = text (WIP) |
| **Infocenter** ⭐                             | v1 (2017) + v2 (2026 WIP); App + Backend | v1: icon + 9 shots. v2: none                                                                                      | v1 App = phone shots, Backend = text+stack; v2 = text (WIP) |
| **Infinite Platform Game** (2017)            | single                                   | icon, shots, promo photos, **gameplay.mp4**                                                                       | bg video + phone shots + framed promo image                 |
| **2D Action Game** (2018)                    | single                                   | icon + shots                                                                                                      | phone shots                                                 |
| **YaVoy** (2022)                             | App + Backend                            | none                                                                                                              | text + stack                                                |
| **Credit Manager** (2026)                    | App (KMP) + Backend                      | none                                                                                                              | text + stack                                                |
| **Game Zone** (2020, early)                  | single                                   | none                                                                                                              | text only                                                   |
| **Untitled Game** (2025, WIP)                | single                                   | none                                                                                                              | text only                                                   |
| **elvah GmbH** (job, flag)                   | variant nav                              | EV Charging, E.ON Drive Comfort, Android Auto, E.ON Next, ChargeSDK — screenshots                                 | job detail, internal variant switch                         |
| **Tecnologías Móviles Globales** (job, flag) | variant nav                              | Miss Nica 18/19, Miss Mundo, Carnaval, Tía Florita, Soy Cristiano, TaxiGo, Jaime, El Chelinero                    | job detail, internal variant switch                         |

⭐ = **featured 3** on the grid by default (richest content) — confirmed in §10.

**Notes on this map (caught in final review):**

- **Asset categorization needs a visual pass.** Some folders mix screenshots with promos/photos
  under generic names (`image*.png` in the Jobs variants; date-named `*.jpg` in Infinite Platform
  Game). Phase 1 must **eyeball each file** to classify it as screenshot (→ phone frame, rule 4) vs
  non-screenshot (→ framed image, rule 3) — it can't be inferred from the filename alone.
- **CTA links** (Google Play, etc.) stay as `#` placeholders until the real URLs are provided; the
  button only renders when a link exists.
- **Featured = most complex UI.** Touch IT & Infocenter combine *surface switch + version switch*;
  building these first validates the hardest path early.

---

## 6. Detail (viewer stage) UX

Extend the existing `renderStage()`:

- **Header:** index `NN / total` (mono), glyph/icon + name, tagline.
- **Surface switch** (if `surfaces`): segmented "App / Backend". Switching surface resets to that
  surface's own versions; the selected version index is **clamped** to the new surface's version
  count (handles ragged matrices like Touch IT, where Backend has only v1).
- **VersionSwitch** (if the active surface/project has >1 version): segmented "v1 / v2" with
  sub-labels (`2019 · XML`); WIP versions only shown when `FEATURES.showWipVersions`.
- **Re-theme on switch:** animate panel gradient + accent (and bg video) like the design's
  cross-fade.
- **Meta** (mono) + **desc** + **highlights** (progressive disclosure) + **stack tags** ("+N
  more") + **CTA** (only if a link exists).
- **Media by `media.kind`:**
    - `phone` → 1–2 frames; >2 shots → swipeable **carousel** with dots. Frame aspect follows
      `media.orientation`: **portrait** phone, or **landscape** frame for games / Android Auto.
    - `gallery` → **multi-device** frames (phone/tablet/laptop) in a scrollable row.
    - `image` → framed **image card(s)** (feature graphics / promo / photos), clearly not a phone.
    - `none` → no media; hero gradient + large glyph stays elegant (used by no-asset & backend
      surfaces).
- **Trailer button (§0.9):** when a version has `media.trailer`, render a **"Ver tráiler / Watch
  trailer"** button (next to the CTA) that opens a **lightbox** — an embedded YouTube/Vimeo player or
  an on-demand `<video>` (loaded only on click). The compressed `bgVideo` keeps playing behind the
  page; the trailer is the full-quality original.

Kept: FLIP open/close, left icon dock, boundary-aware scroll/keys/swipe, readability scrim over
video.

### Jobs grouping (elvah, TeMoGlo) — §0.4

- One card → one detail with an internal **variant switch** navigating each variant's screenshots +
  per-variant stack + short copy. Reuses the switch component (modeled like `surfaces`/`variants`).
- **All internal sub-projects/variants are included** (elvah: EV Charging, E.ON Drive Comfort,
  Android Auto, E.ON Next, ChargeSDK — using both the *web official* and *Internal* asset folders;
  TeMoGlo: all branded apps).
- The **entire** showcase — both companies and every variant — is gated by `FEATURES.showJobs`. One
  line removes it all.

---

## 7. Projects grid — §0.5

- Render the **3 featured** cards by default (`featured:true`).
- A **"Ver todos los proyectos / View all projects"** button reveals the remaining cards (expands
  the grid in place, animated). Jobs appear here too (when `showJobs`).
- Card: real **icon** when present (rounded tile) else glyph; **version badge** (`2 versions`) where
  applicable; tagline; up to 4 stack tags.
- **Icons everywhere (C2):** grid card, detail header, **and the left dock** all use the real icon
  when present (rounded tile), falling back to the emoji glyph otherwise.
- The fullscreen viewer's left dock lists all shown projects (C1, §12).

---

## 8. Responsive — rule #5

Switches wrap; device frames scale with `clamp()`; galleries scroll horizontally on narrow screens;
phone carousel collapses to one frame + dots; text column scrolls (boundary-aware); bg video
`object-fit:cover` + scrim. Verify each detail at 375 / 768 / 1280 before sign-off.

---

## 9. Phased implementation (after approval)

1. **Asset prep** — ✅ **DONE** — curated assets in `assets/projects/…`; classification & notes in `docs/plan/assets-inventory.md`.
2. **Data model** — ✅ **DONE** — `js/projects.data.js` authored (11 projects, bilingual, media wired);
   validated with Node (99 referenced assets = 99 on disk). Not yet linked in `index.html` (Phase 3
   rewrites `projects.js` to consume it and drops the in-file `PROJECTS` + obsolete `projects.*` i18n keys).
3. **Switch components** — ✅ **DONE** — VersionSwitch + Surface switch + variant rail + re-theme on switch.
4. **Media renderers** — ✅ **DONE** — phone (portrait **+ landscape**), device gallery, image cards, **trailer lightbox**; bg video. (No backend mock.)
   - **4b. Video** — ✅ **DONE** — `video-bg.mp4` (2.8 MB, ffmpeg) as bg; trailer = repo-hosted `video.mp4` on demand.
5. **Grid** — ✅ **DONE** — featured 3 + "View all" expand + real icons + derived badges.
6. **Jobs grouping** — ✅ **DONE** — variant rail behind `FEATURES.showJobs`; recursive `VISIBLE` prune.
7. **i18n** — ✅ **DONE** — per-item copy inline `{es,en}`; new chrome keys added; obsolete `projects.*` keys removed.
   > Phases 3–7 were implemented together (the new data couples grid/viewer/switches/media). `projects.js` rewritten to consume `projects.data.js`; verified via DOM inspection (the FLIP overlay doesn't capture in the headless screenshot, but `preview_inspect` confirms real rendering — white text, loaded screenshots, correct switches/media/theming; no console errors). Content now reveals immediately (decoupled from the FLIP) for robustness.
8. **Responsive + final visual pass** — ✅ **DONE** — verified at **1280** (two-column: text left, media right), **768** & **375** (stacked, full-width text, media gallery below). Real screenshots render crisply in phone/landscape/device frames at every breakpoint; switches/CTA/dock adapt; no console errors.

---

**✅ Overhaul complete.** All phases done. Projects section + dedicated viewer fully rebuilt from real CV data and assets, matching the design system, bilingual, responsive, modular (feature flags). Pending only the user's review and any real Google Play / GitHub links to replace the `#` placeholders. Not committed.
9. **Review** — hand off (no commit unless asked).

Each phase is independently reviewable.

---

## 10. Confirmations — all resolved ✅

- **Q1 — Featured 3:** **Drink Water, Touch IT, Infocenter.** ✅
- **Q2 — "View all":** **expand the grid in place** (animated). ✅
- **Q3 — Jobs:** include **both companies and all internal sub-projects/variants**, the whole thing
  gated by the single `FEATURES.showJobs` flag. ✅

Everything is locked (§0). Ready to implement on approval — starting with Phase 1 (asset prep) +
Phase 2 (data model).

---

## 11. Project structure & code quality (§0.8)

Keep the project clean, consistent and easy to grow — like a professional web project. Guiding
rules:

**Separation of concerns**

- **Data ≠ render ≠ style.** Project content lives in data (`PROJECTS` in `projects.data.js`, `I18N`
  in `i18n.js`); rendering logic in the matching `js/*.js` module; styling in `css/styles.css`.
  Adding/editing a project = touch **data only**.
- Each JS module keeps a **single responsibility** (`i18n.js` = translations, `projects.js` = grid +
  viewer, `experience.js` = experience, `main.js` = global page behaviour). No cross-module
  reach-ins beyond the documented shared globals.
- ⚠️ **Naming:** job/employer project entries live **inside `PROJECTS`** as items with
  `group:"job"` — do **not** introduce a global named `JOBS`; that identifier is already taken by
  `experience.js` (top-level `const JOBS`), and a second one would throw a redeclaration error in
  the shared global scope.

**Files & folders**

- Assets organized predictably: `assets/projects/<project-id>/…` (one folder per project; variants
  in sub-folders). Lowercase, kebab-case names (`drink-water/shot-1.png`), no spaces.
- `docs/` holds planning/reference docs (this plan). Keep it current.
- **Recommended split (this overhaul will make `projects.js` large): `js/projects.data.js`** (the
  `PROJECTS` array + `FEATURES` flags + bilingual copy) **+ `js/projects.js`** (grid, viewer,
  switches, media renderers). Load `projects.data.js` before `projects.js`. Keeps data editable in
  isolation and the logic file focused. New project = edit `projects.data.js` only.

**Conventions (match what's already there)**

- CSS: BEM-ish names scoped per component (`.exp-*`, `.project__*`, `.vstage__*`, `.wheel__*`);
  reuse design tokens in `:root` (`--gradient`, `--font-mono`, `--text-secondary`, …) instead of
  hard-coded values; no inline styles in markup.
- JS: small named functions, early returns, the existing comment density and ES idioms;
  `prefers-reduced-motion` honoured everywhere.
- i18n: every user-facing string is **bilingual** — shared UI chrome (labels, buttons, hints) via
  `I18N`; **per-item content** (project/job descriptions, taglines, highlights) as inline `{es,en}`
  in its data object, matching the existing `projects.js` / `experience.js` pattern (`pLang()`
  helper). Never a hard-coded single-language string in markup/JS.

**Quality & extensibility**

- **No dead code / no duplication** — remove the old static markup and unused keys it replaces;
  factor shared UI (switches, phone frame, card) into reusable render helpers.
- **Feature flags** (`FEATURES`) and data-driven rendering keep optional content (jobs, WIP
  versions) removable from one place.
- **Accessibility & responsiveness** are part of "done": keyboard paths, `aria-*`, and all
  breakpoints verified — not bolted on later.
- Brief comments explain the *why*; self-documenting names explain the *what*.

The goal: a future project is added by appending one well-formed data object — no layout surgery, no
style hacks.

---

## 12. Final review notes (last pass before build)

Risks/refinements caught reviewing the whole plan; folded into the sections above:

- ✅ **`JOBS` name collision** avoided — job entries live in `PROJECTS` (`group:"job"`), never a new
  global (§11).
- ✅ **Ragged surface×version matrices** (Touch IT Backend = v1 only) — clamp the version index on
  surface switch (§6).
- ✅ **Asset categorization** (screenshot vs promo) is a manual visual pass in Phase 1 (§5).
- ✅ **File split** decided: `projects.data.js` + `projects.js` (§11).
- ✅ **Data shape** clarified: exactly one of `surfaces[]` / `versions[]` (§3).
- ✅ **i18n contradiction** resolved: UI chrome via `I18N`, per-item content as inline `{es,en}` (
  §11).
- ✅ **Data file** name aligned to the split (`projects.data.js`) in the §3 header (§3, §11).
- ✅ **Test video cleanup**: drop the `sample-bg.mp4` placeholder on Drink Water; real bg video is
  only Infinite Platform Game (§4).
- ℹ️ **`era` field** (`legacy|modern|auto`) only drives small accent/styling touches now that we use
  real screenshots (no fake "legacy UI" frames) — kept optional.
- ℹ️ **Glyph fallback**: every project still gets an emoji `glyph` as the fallback when no icon
  image exists (icon wins per C2).
- ✅ **Phase 1 done** — assets curated in `assets/projects/`; full map in `docs/plan/assets-inventory.md`.
- 🟡 **Affects Phase 2 — video model:** `media` now carries `bgVideo` (compressed loop) + `trailer`
  (original, on-demand) + `orientation` (§3, §0.9). Infinite PG = bgVideo + trailer; games / Android
  Auto = landscape orientation.
- ✅ **Video decided:** trailer = repo-hosted original `video.mp4` (option A); background = compressed
  `video-bg.mp4` (720p, CRF ~27). `ffmpeg` installing now to produce it (§4, §0.9).

- **C2 — Icons (resolved):** when a project has an icon, use the **real icon in all three places** —
  grid card, detail header, and the left **dock/side menu**. Fall back to the emoji glyph only when
  no icon exists. (Render dock icons in a rounded tile so small sizes stay clean.)

- **C1 — Viewer dock scope (resolved):** the viewer's left dock navigates **all *available* projects
  ** — i.e. the single source of truth is `PROJECTS` **filtered by the feature flags**. The grid is
  just a curated entry point (3 featured + "View all"); the dock/viewer always browse the full
  *available* set. When `FEATURES.showJobs` is **off**, job entries are excluded **everywhere at
  once** — grid, "View all", dock and viewer — so only showable projects appear. (Same idea for
  `showWipVersions` filtering versions.)

**Single filtered set (the rule that ties it together):** compute `VISIBLE = PROJECTS` minus
`group:"job"` when `!showJobs`, minus `wip` versions when `!showWipVersions`, once — and render the
grid, "View all", dock and viewer from that same array. One flag flip changes all surfaces
consistently.

No blockers. Plan is internally consistent and ready; awaiting your go to start Phase 1.

---

## 13. Phase 2 → impacts on later phases (review of the authored data)

Reviewing the real `projects.data.js` against the assumptions in Phases 3–8. None are blockers, but
they **refine/expand** the later phases — capture before building.

- **A. Three container shapes, not two — affects Phase 3 & 6.** Data uses `versions[]`,
  `surfaces[]` **and** `variants[]`. Jobs use `variants` (elvah ×5, TeMoGlo ×8). A segmented switch
  overflows past ~3–4 items, so **variants need a different control** (dropdown or scrollable rail),
  separate from the segmented Surface/Version switch. Phase 3 builds **two** switch types.
- **B. Media is composable, not an exclusive `kind` — affects Phase 4.** A single version can carry
  the primary frames (`kind` phone/gallery) **plus** `images[]` **plus** `bgVideo` **plus**
  `trailer` at once (e.g. Infinite Platform Game has all four). The renderer must **compose** these
  layers, not `switch(kind)`. `kind` selects the *primary* frame type; `images`/`bgVideo`/`trailer`
  are additive whenever present.
- **C. Device gallery needs 3 frame types — affects Phase 4.** `devices[]` has `phone` (portrait),
  `tablet` (landscape) and `laptop`/chromebook (landscape). Three frame styles, not one.
- **D. `kind:"none"` is common — affects Phase 4 layout.** Backend surfaces and no-asset projects
  have no media → the detail must **collapse the media column** and let text go full-width (not an
  empty gap).
- **E. Grid badge must be derived per shape — affects Phase 5.** There's no longer a `versions:2`
  number; compute the badge from structure: simple project → `N versions` (if >1); surfaces project
  → e.g. `App · Backend`; job → `N apps`. Define these rules in Phase 5.
- **F. Filtering must prune recursively — affects Phase 5/core.** `showWipVersions` removes `wip`
  versions **inside** surfaces/variants too; then **drop empty surfaces**, and **drop projects with
  zero remaining versions** (e.g. Game Zone & Untitled Game disappear entirely when WIP is off;
  Touch IT/Infocenter just lose their v2). The `VISIBLE` computation (§12) is a recursive prune, not
  a flat filter.
- **G. i18n is lighter but shifts earlier — affects Phase 3 & 7.** Per-item copy is already inline
  `{es,en}` in the data, so Phase 7 only wires **chrome** keys (View-all button, "more features",
  "+N more", "Surface" heading, trailer label fallback, aria). The **obsolete `projects.*` keys**
  (`p1.desc`, `hint`, `viewLabel`, `versions`) are removed during the Phase 3 rewrite, and new chrome
  keys added then — so part of Phase 7 merges into Phase 3.
- **H. Labels are string-or-`{es,en}` — affects Phase 3.** Version/surface `label`/`sub` are
  sometimes plain strings (`"v1"`) and sometimes `{es,en}`; switch components must run them through
  `pLang()`.
- **I. Per-version `accent` is a new styling input — affects Phase 3/4 (polish).** Each version
  carries its own `accent` colour; switches, highlight bullets and the trailer button can use it for
  per-version theming instead of the global `--accent`.
- **J. Jobs detail layout differs slightly — affects Phase 6.** Header shows the **company** `name` +
  the **variant** selector; the stage (copy/stack/media) comes from the selected `variant`, whose
  `label` is the brand sub-title.

**Net effect:** Phase 3 grows to **two switch controls + pLang labels + accent theming + obsolete-key
cleanup**; Phase 4 becomes **compositional media** with **3 device frames + collapse-on-none**;
Phase 5 needs **badge rules + recursive prune**; Phase 7 shrinks (copy already bilingual).

---

## Appendix — source references

- Tech copy: `…/CV/elvishrdz.web/Full Project Tech Stack - Elvis Hernandez 15-6-2026.docx`
- Assets: `…/CV/elvishrdz.web/Projects Screenshots (web official)/` (+
  `Project Screenshots (Internal)/` extras)
- Design model & UX: `…/Portfolio Design System/ui_kits/project-detail/`
