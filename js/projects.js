/* ============================================================
   Elvis Hernández — Projects grid + fullscreen viewer
   Consumes PROJECTS + FEATURES from js/projects.data.js (loaded first).
   Renders: grid (featured + "view all"), the FLIP fullscreen viewer
   with a left icon dock, surface/version switches, a variant rail,
   composable media (phone/landscape frames, device gallery, image
   cards, background video) and an on-demand trailer lightbox.
   ============================================================ */

/* ---------- shared helpers ---------- */
function pLang(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[currentLang] || value.es || value.en || "";
}
function tChrome(key) {
  const dict = I18N[currentLang] || {};
  return dict[key] != null ? dict[key] : key;
}
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = (s) => String(s).replace(/"/g, "&quot;");

/* ---------- VISIBLE: PROJECTS filtered/pruned by feature flags ---------- */
function pruneVersions(vers) {
  return FEATURES.showWipVersions ? vers : vers.filter((v) => !v.wip);
}
function computeVisible() {
  let list = PROJECTS.filter((p) => FEATURES.showJobs || p.group !== "job");
  list = list
    .map((p) => {
      const c = Object.assign({}, p);
      if (c.versions) c.versions = pruneVersions(c.versions);
      if (c.surfaces) {
        c.surfaces = c.surfaces
          .map((s) => Object.assign({}, s, { versions: pruneVersions(s.versions) }))
          .filter((s) => s.versions.length);
      }
      return c;
    })
    .filter((p) => {
      if (p.variants) return p.variants.length > 0;
      if (p.surfaces) return p.surfaces.length > 0;
      return (p.versions || []).length > 0;
    });
  // featured first (stable)
  return list.slice().sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
}
const VISIBLE = computeVisible();

/* ---------- per-project accessors ---------- */
function latestVersion(p) {
  if (p.variants) return p.variants[p.variants.length-1];
  if (p.surfaces){
    // use always the zero to select the application surface
    let appIndex = 0;
    return p.surfaces[appIndex].versions[p.surfaces[appIndex].versions.length-1];
  }
  return p.versions[p.versions.length-1];
}
function repGradient(p) { return latestVersion(p).gradient; }
function repStack(p) { return latestVersion(p).stack || []; }

function badgeFor(p) {
  if (p.variants) return `${p.variants.length} apps`;
  const maxV = p.surfaces ? Math.max.apply(null, p.surfaces.map((s) => s.versions.length)) : p.versions.length;
  return maxV > 1 ? `${maxV} ${tChrome("projects.versions")}` : "";
}
function iconMarkup(p, baseClass) {
  return p.icon
    ? `<img class="${baseClass}" src="${p.icon}" alt="" loading="lazy">`
    : `<span class="${baseClass} ${baseClass}--glyph">${p.glyph}</span>`;
}

/* ---------- GRID ---------- */
const grid = document.getElementById("projectsGrid");
const cardEls = []; // by VISIBLE index
let gridRendered = false;
let viewAllBtn = null;

function renderGrid() {
  grid.innerHTML = "";
  cardEls.length = 0;
  const instant = gridRendered;

  VISIBLE.forEach((p, i) => {
    const card = document.createElement("article");
    card.className =
      "project reveal" + (instant ? " is-visible" : "") + (p.featured ? "" : " is-extra");
    card.dataset.delay = String((i % 3) * 100);
    card.dataset.index = String(i);
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `${pLang(p.name)} — ${pLang(p.tagline)}`);

    const badge = badgeFor(p);
    const tags = repStack(p).slice(0, 4).map((t) => `<span>${t}</span>`).join("");

    card.innerHTML = `
      <div class="project__media" style="background:${repGradient(p)}">
        ${badge ? `<span class="project__versions">${badge}</span>` : ""}
        ${iconMarkup(p, "project__icon")}
        <span class="project__open">${tChrome("projects.viewLabel")}</span>
      </div>
      <div class="project__body">
        <h3 class="project__title">${pLang(p.name)}</h3>
        <p class="project__tagline">${pLang(p.tagline)}</p>
        <div class="project__tags">${tags}</div>
      </div>`;

    const open = () => openViewer(i, card);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });

    grid.appendChild(card);
    cardEls.push(card);
  });

  // "View all projects" button — only if there are extras
  const hasExtras = VISIBLE.some((p) => !p.featured);
  if (viewAllBtn) viewAllBtn.remove();
  if (hasExtras && !grid.classList.contains("is-expanded")) {
    viewAllBtn = document.createElement("button");
    viewAllBtn.type = "button";
    viewAllBtn.className = "projects__viewall reveal" + (instant ? " is-visible" : "");
    viewAllBtn.textContent = tChrome("projects.viewAll");
    viewAllBtn.addEventListener("click", expandGrid);
    grid.after(viewAllBtn);
  }

  gridRendered = true;
}

function expandGrid() {
  grid.classList.add("is-expanded");
  grid.querySelectorAll(".project.is-extra").forEach((c) => c.classList.add("is-visible"));
  if (viewAllBtn) { viewAllBtn.remove(); viewAllBtn = null; }
}

/* ---------- VIEWER ---------- */
const viewer = document.getElementById("projectViewer");
const panel = document.getElementById("viewerPanel");
const content = document.getElementById("viewerContent");
const scroller = document.getElementById("viewerScroll");
const stage = document.getElementById("viewerStage");
const dock = document.getElementById("projectWheel");
const dockToggle = document.getElementById("viewerDockToggle");
const dockScrim = document.getElementById("viewerDockScrim");
const backdrop = document.getElementById("viewerBackdrop");
const bgVideo = document.getElementById("viewerBgVideo");

// WIP label in the viewer top bar — visibility controlled by FEATURES.showWipBadge.
const wipBadge = document.getElementById("viewerWip");
if (wipBadge) wipBadge.hidden = !FEATURES.showWipBadge;

let openIndex = 0;
let isOpen = false;
let opening = false; // true only during the open FLIP, until the content reveal fires
let sel = { s: 0, v: 0, k: 0 }; // surface / version / variant indices

const DOCK_SPACING = 70;
const DOCK_VISIBLE = 3;

/* ----- left dock (icon rail) ----- */
function buildDock() {
  dock.innerHTML = "";
  VISIBLE.forEach((p, i) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "wheel__item";
    item.dataset.index = String(i);
    item.setAttribute("aria-label", pLang(p.name));
    item.title = pLang(p.name);
    item.innerHTML = `
      <span class="wheel__icon" style="background:${repGradient(p)}">${iconMarkup(p, "wheel__iconimg")}</span>
      <span class="wheel__label">${pLang(p.name)}</span>`;
    item.addEventListener("click", () => goTo(i));
    dock.appendChild(item);
  });
}
/* mobile portrait → the dock is a plain scrollable list (slide-in panel) */
function dockListMode() {
  return window.matchMedia("(max-width: 720px) and (orientation: portrait)").matches;
}
function layoutDock() {
  const list = dockListMode();
  [...dock.children].forEach((item) => {
    const i = Number(item.dataset.index);
    if (list) {
      // clear the wheel transforms so CSS lays the items out as a vertical list
      item.style.transform = "";
      item.style.opacity = "";
      item.style.pointerEvents = "";
      item.classList.toggle("is-active", i === openIndex);
      return;
    }
    const offset = i - openIndex;
    const dist = Math.abs(offset);
    const scale = i === openIndex ? 1 : Math.max(0.72, 1 - dist * 0.12);
    const opacity = dist > DOCK_VISIBLE ? 0 : 1 - dist * 0.2;
    item.style.transform = `translate(0, calc(-50% + ${offset * DOCK_SPACING}px)) scale(${scale})`;
    item.style.opacity = String(opacity);
    item.style.pointerEvents = opacity < 0.1 ? "none" : "auto";
    item.classList.toggle("is-active", i === openIndex);
  });
}

/* ----- mobile dock panel (slide-in) ----- */
function openDock() {
  if (!dockListMode()) return;
  viewer.classList.add("is-dock-open");
  dockToggle.setAttribute("aria-expanded", "true");
  // bring the active project into view within the scrollable list
  const active = dock.querySelector(".wheel__item.is-active");
  if (active) active.scrollIntoView({ block: "center" });
}
function closeDock() {
  viewer.classList.remove("is-dock-open");
  dockToggle.setAttribute("aria-expanded", "false");
}

/* ----- resolve the active version from current selection ----- */
function activeContext(p) {
  if (p.variants) {
    const k = clamp(sel.k, 0, p.variants.length - 1);
    return { version: p.variants[k], variantIdx: k };
  }
  if (p.surfaces) {
    const s = clamp(sel.s, 0, p.surfaces.length - 1);
    const versions = p.surfaces[s].versions;
    const v = clamp(sel.v, 0, versions.length - 1);
    return { version: versions[v], surfaceIdx: s, versionIdx: v, versions };
  }
  const v = clamp(sel.v, 0, p.versions.length - 1);
  return { version: p.versions[v], versionIdx: v, versions: p.versions };
}

/* ----- switch / rail markup ----- */
function segHTML(items, activeIdx, kind) {
  return `<div class="vswitch" data-kind="${kind}" style="--n:${items.length};--active:${activeIdx}">
    <span class="vswitch__thumb" aria-hidden="true"></span>
    ${items.map((it, i) => `<button class="vswitch__btn${i === activeIdx ? " is-active" : ""}" data-i="${i}" type="button">
      <span class="vswitch__label">${pLang(it.label)}</span>${it.sub ? `<span class="vswitch__sub">${pLang(it.sub)}</span>` : ""}
    </button>`).join("")}
  </div>`;
}
function railHTML(variants, activeIdx) {
  return `<div class="vrail" role="tablist" aria-label="${esc(tChrome("projects.variants"))}">
    ${variants.map((v, i) => `<button class="vrail__chip${i === activeIdx ? " is-active" : ""}" data-i="${i}" type="button" role="tab" aria-selected="${i === activeIdx}">${pLang(v.label)}</button>`).join("")}
  </div>`;
}

/* ----- media (composable) -----
   Screenshots (phone/landscape) and multi-device galleries are unified into a
   single device-framed, draggable rail. Clicking any device opens a fullscreen
   focus view (close · ‹ › · dots · Esc/←/→) — see the "screenshot focus" block.
   `currentGallery` mirrors the items of the currently shown version so the
   focus view and rail share one source of truth. */
let currentGallery = []; // device screenshots (the framed rail)
let currentExtras = []; // extra images (sketches/banners) — clickable, open in focus too

/* device form factors → frame CSS class */
const FRAME_CLASS = {
  watch: "frame--watch", phone: "frame--phone", land: "frame--land",
  foldable: "frame--foldable", tablet: "frame--tablet",
  laptop: "frame--laptop", desktop: "frame--desktop",
};
function frameClass(kind) { return FRAME_CLASS[kind] || "frame--phone"; }

/* default human label for a form factor (used to group when no `group` given) */
const DEVICE_LABEL = {
  watch: "Wear OS", phone: "Phone", land: "Phone", foldable: "Foldable",
  tablet: "Tablet", laptop: "Chromebook", desktop: "Desktop",
};
function deviceLabel(kind) { return DEVICE_LABEL[kind] || "Phone"; }

/* the screenshot + the per-form-factor chrome (lugs, base, title bar, …).
   The wrapping <figure class="frame frame--KIND"> is added by the caller. */
function frameInner(kind, src, alt) {
  const screen = `<div class="frame__screen"><img src="${src}" alt="${esc(alt)}" loading="lazy"></div>`;
  switch (kind) {
    case "watch":
      return `<span class="frame__lug frame__lug--t"></span>`
        + `<span class="frame__body"><span class="frame__crown"></span>${screen}</span>`
        + `<span class="frame__lug frame__lug--b"></span>`;
    case "laptop":
      return `<span class="frame__lid">${screen}</span>`
        + `<span class="frame__base"><span class="frame__notch"></span></span>`;
    case "desktop":
      return `<span class="frame__bar"><i></i><i></i><i></i></span>${screen}`;
    case "foldable":
      return `${screen}<span class="frame__crease"></span>`;
    case "tablet":
      return `<span class="frame__cam"></span>${screen}`;
    default: // phone, land
      return screen;
  }
}
function frameHTML(kind, src, alt) {
  return `<figure class="frame ${frameClass(kind)}">${frameInner(kind, src, alt)}</figure>`;
}

/* normalize a version's media into a flat list of framed items.
   Each item: { kind (the frame), src, group (chip), caption (per-shot text below).
   gallery → per-shot kind + optional group + optional caption{es,en};
   phone   → one frame for all shots; per-shot caption via media.captions[]. */
function galleryItems(p, v) {
  const m = v.media || {};
  if (m.kind === "gallery" && m.devices) {
    return m.devices.map((d, i) => ({
      kind: d.kind, src: d.src,
      group: d.group ? pLang(d.group) : deviceLabel(d.kind),
      caption: d.caption ? pLang(d.caption) : `${i + 1}`,
    }));
  }
  if (m.kind === "phone" && m.screenshots) {
    const kind = m.orientation === "landscape" ? "land" : "phone";
    const caps = m.captions || [];
    return m.screenshots.map((src, i) => ({
      kind, src, group: deviceLabel(kind),
      caption: caps[i] ? pLang(caps[i]) : `${i + 1}`,
    }));
  }
  return [];
}
function galleryHTML(items) {
  if (!items.length) return "";
  // group shots by their `group` (falls back to the device label). Chips +
  // per-card labels appear only when there is more than one group.
  const groups = [...new Set(items.map((it) => it.group))];
  const multi = groups.length > 1;
  const chips = multi
    ? `<div class="gallery__chips">${groups.map((g, i) =>
        `<button class="gallery__chip${i === 0 ? " is-active" : ""}" data-group="${esc(g)}" type="button">${esc(g)}</button>`
      ).join("")}</div>`
    : "";
  const cards = items.map((it, i) => `
      <button class="gallery__card" data-i="${i}" data-kind="${esc(it.kind)}" data-group="${esc(it.group)}" type="button" aria-label="${esc(it.caption)}" title="${esc(tChrome("projects.expand"))}">
        ${frameHTML(it.kind, it.src, it.caption)}
        <span class="gallery__cardlabel">${esc(it.caption)}</span>
      </button>`).join("");
  return `<div class="gallery">${chips}<div class="gallery__rail">${cards}</div></div>`;
}
function imagesHTML(extras) {
  const items = extras.map((im, i) => `<button class="imgcard" data-i="${i}" type="button" aria-label="${esc(im.label)}" title="${esc(tChrome("projects.expand"))}"><img src="${im.src}" alt="${esc(im.label)}" loading="lazy"><figcaption>${esc(im.label)}</figcaption></button>`).join("");
  return `<div class="vmedia-row vmedia-row--images">${items}</div>`;
}
function mediaHTML(p, v) {
  // variant rail (internal apps) sits above the screenshots, left-aligned, and
  // stays put across variant changes; only the screenshots below are rebuilt.
  const rail = p.variants && p.variants.length > 1 ? railHTML(p.variants, activeContext(p).variantIdx) : "";
  const shots = shotsHTML(p, v);
  if (!rail && !shots) return "";
  return `<div class="vstage__media">${rail}<div class="vstage__shots">${shots}</div></div>`;
}
/* just the screenshots/images (rebuilt on every surface/version/variant change) */
function shotsHTML(p, v) {
  const m = v.media || {};
  currentGallery = galleryItems(p, v);
  currentExtras = (m.images || []).map((im) => ({ kind: "image", src: im.src, label: pLang(im.label) }));
  const primary = galleryHTML(currentGallery);
  const imgs = currentExtras.length ? imagesHTML(currentExtras) : "";
  return primary + imgs;
}

/* ----- the stage -----
   Split into a STATIC skeleton (index, head, tagline, switches) and a
   DYNAMIC body (meta/desc/highlights/stack/cta) + media. Switching version /
   surface / variant updates only the changed parts in place — the switch
   thumb slides, and the new content reveals in (same animation as the site's
   scroll reveals) without the whole stage jumping. ----- */

function versionSlotHTML(ctx) {
  if (ctx.versions && ctx.versions.length > 1) {
    return `<div class="vswitch-group">${segHTML(ctx.versions.map((x) => ({ label: x.label, sub: x.sub })), ctx.versionIdx, "version")}</div>`;
  }
  return "";
}

function switchesHTML(p, ctx) {
  let h = "";
  if (p.surfaces && p.surfaces.length > 1) {
    h += `<div class="vswitch-group"><span class="vswitch-cap">${tChrome("projects.surface")}</span>${segHTML(p.surfaces.map((s) => ({ label: s.label, sub: s.sub })), ctx.surfaceIdx, "surface")}</div>`;
  }
  h += `<div class="vslot">${versionSlotHTML(ctx)}</div>`;
  // Variant rail (internal apps) is rendered above the screenshots in the media
  // column instead of here — see mediaHTML — so switching between a project's
  // apps and seeing their image resources happens in one place.
  return h;
}

function bodyHTML(v) {
  // highlights (progressive disclosure)
  const hl = (v.highlights && pLang(v.highlights)) || [];
  const MAXH = 4;
  const head = hl.slice(0, MAXH), rest = hl.slice(MAXH);
  const hlItem = (h) => `<li class="vh"><span class="vh-dot">▹</span>${h}</li>`;
  const highlights = hl.length
    ? `<div class="vstage__highlights">
        <ul class="vh-list">${head.map(hlItem).join("")}</ul>
        ${rest.length ? `<ul class="vh-list vh-rest">${rest.map(hlItem).join("")}</ul>
        <button class="vstage__more" type="button">${tChrome("projects.showMore")} <span class="vstage__more-n">+${rest.length}</span></button>` : ""}
      </div>` : "";

  // stack tags (+N more)
  const stack = v.stack || [];
  const MAX_CHIPS = 15;
  const tagsHead = stack.slice(0, MAX_CHIPS).map((s) => `<span class="vtag">${s}</span>`).join("");
  const tagsRest = stack.slice(MAX_CHIPS).map((s) => `<span class="vtag">${s}</span>`).join("");
  const stackHTML = stack.length
    ? `<div class="vstage__stack">${tagsHead}<span class="vstage__stack-rest">${tagsRest}</span>${stack.length > MAX_CHIPS ? `<button class="vstage__moretags" type="button">+${stack.length - MAX_CHIPS}</button>` : ""}</div>`
    : "";

  // CTA + trailer
  const cta = v.link ? `<a class="vstage__link" href="${v.link.href}" ${String(v.link.href).startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${pLang(v.link.label)}</a>` : "";
  const trailer = v.media && v.media.trailer ? `<button class="vstage__trailer" type="button">▶ ${pLang(v.media.trailer.label) || tChrome("projects.trailer")}</button>` : "";
  const ctaRow = cta || trailer ? `<div class="vstage__cta-row">${cta}${trailer}</div>` : "";

  return `
    <div class="vstage__meta">${pLang(v.meta)}</div>
    <p class="vstage__desc">${pLang(v.desc)}</p>
    ${highlights}
    ${stackHTML}
    ${ctaRow}`;
}

function stageHTML(p) {
  const ctx = activeContext(p);
  const v = ctx.version;
  const total = VISIBLE.length;
  return `
    <div class="vstage__text">
      <div class="vstage__index">${String(openIndex + 1).padStart(2, "0")}<span> / ${String(total).padStart(2, "0")}</span></div>
      <div class="vstage__head">${iconMarkup(p, "vstage__icon")}<h2 class="vstage__title">${pLang(p.name)}</h2></div>
      <p class="vstage__tagline">${pLang(p.tagline)}</p>
      <div class="vstage__switches">${switchesHTML(p, ctx)}</div>
      <div class="vstage__body">${bodyHTML(v)}</div>
    </div>
    ${mediaHTML(p, v)}`;
}

function applyTheme(v) {
  panel.style.background = v.gradient;
  if (v.accent) content.style.setProperty("--vaccent", v.accent);
  const m = v.media || {};
  if (m.bgVideo) {
    if (bgVideo.getAttribute("src") !== m.bgVideo) bgVideo.src = m.bgVideo;
    bgVideo.classList.add("is-active");
    if (!reduceMotion) { const pr = bgVideo.play(); if (pr && pr.catch) pr.catch(() => {}); }
  } else {
    bgVideo.classList.remove("is-active");
    bgVideo.pause();
  }
}

/* reveal-in: same enter animation as the site's scroll reveals */
function revealIn(el) {
  if (!el) return;
  el.classList.remove("vreveal", "is-in");
  if (reduceMotion) return;
  el.classList.add("vreveal");
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-in")));
  setTimeout(() => el.classList.add("is-in"), 90); // fallback if rAF stalls
}

function positionThumb(switchEl) {
  if (!switchEl) return;
  const thumb = switchEl.querySelector(".vswitch__thumb");
  const active = switchEl.querySelector(".vswitch__btn.is-active");
  if (!thumb || !active) return;
  thumb.style.left = active.offsetLeft + "px";
  thumb.style.width = active.offsetWidth + "px";
}
function positionAllThumbs() {
  stage.querySelectorAll(".vswitch").forEach(positionThumb);
}
function setSwitchActive(switchEl, idx) {
  if (!switchEl) return;
  switchEl.style.setProperty("--active", idx);
  switchEl.querySelectorAll(".vswitch__btn").forEach((b, i) => b.classList.toggle("is-active", i === idx));
  positionThumb(switchEl);
}

function setMedia(p, v) {
  const media = stage.querySelector(".vstage__media");
  // No media container yet → build the whole block (rail + shots) once.
  if (!media) {
    const html = mediaHTML(p, v);
    if (html) {
      stage.insertAdjacentHTML("beforeend", html);
      revealIn(stage.querySelector(".vstage__media"));
      wireGallery();
    }
    return;
  }
  // Keep the variant rail in place (no rebuild → buttons don't jump); just move
  // the active state. Only the screenshots below are rebuilt and re-revealed.
  if (p.variants && p.variants.length > 1) {
    const ctx = activeContext(p);
    media.querySelectorAll(".vrail__chip").forEach((c, i) => {
      const on = i === ctx.variantIdx;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-selected", String(on));
    });
  }
  const shots = shotsHTML(p, v);
  if (!shots && !media.querySelector(".vrail")) { media.remove(); return; }
  let shotsEl = media.querySelector(".vstage__shots");
  if (!shotsEl) {
    media.insertAdjacentHTML("beforeend", '<div class="vstage__shots"></div>');
    shotsEl = media.querySelector(".vstage__shots");
  }
  shotsEl.innerHTML = shots;
  revealIn(shotsEl);
  wireGallery();
}

/* full render — used on open and on project change (goTo) */
function paintStage() {
  const p = VISIBLE[openIndex];
  const ctx = activeContext(p);
  applyTheme(ctx.version);
  stage.innerHTML = stageHTML(p);
  scroller.scrollTop = 0; // always show the new project from its title (not the previous scroll pos)
  wireGallery();
  requestAnimationFrame(positionAllThumbs); // size each thumb to its label once laid out
}

/* project change: a brief whole-stage slide is fine (it's a different project) */
function repaintFade() {
  if (reduceMotion) { paintStage(); return; }
  stage.classList.add("is-leaving");
  stage.style.setProperty("--dir", "1");
  setTimeout(() => {
    paintStage();
    stage.classList.remove("is-leaving");
    stage.classList.add("is-entering");
    requestAnimationFrame(() => stage.classList.remove("is-entering"));
  }, 180);
}

/* surface/version/variant change: keep the page, reveal only what changed */
function updateContent(changed) {
  const p = VISIBLE[openIndex];
  const ctx = activeContext(p);
  applyTheme(ctx.version);

  setSwitchActive(stage.querySelector('.vswitch[data-kind="surface"]'), ctx.surfaceIdx);

  // the variant rail now lives in the media column and is rebuilt by setMedia below

  const slot = stage.querySelector(".vslot");
  if (slot) {
    if (changed === "surface") {
      slot.innerHTML = versionSlotHTML(ctx); // new surface → its own version switch
      if (slot.firstChild) revealIn(slot);
    } else {
      setSwitchActive(slot.querySelector('.vswitch[data-kind="version"]'), ctx.versionIdx);
    }
  }

  const body = stage.querySelector(".vstage__body");
  body.innerHTML = bodyHTML(ctx.version);
  revealIn(body);
  setMedia(p, ctx.version);
  requestAnimationFrame(positionAllThumbs); // re-fit thumbs (a rebuilt surface slot adds a new version switch)
}

/* one-time delegated handler — survives innerHTML swaps (stage element persists) */
stage.addEventListener("click", (e) => {
  const sBtn = e.target.closest('.vswitch[data-kind="surface"] .vswitch__btn');
  if (sBtn) { sel.s = Number(sBtn.dataset.i); updateContent("surface"); return; }
  const vBtn = e.target.closest('.vswitch[data-kind="version"] .vswitch__btn');
  if (vBtn) { sel.v = Number(vBtn.dataset.i); updateContent("version"); return; }
  const chip = e.target.closest(".vrail__chip");
  if (chip) { sel.k = Number(chip.dataset.i); updateContent("variant"); return; }
  const more = e.target.closest(".vstage__more");
  if (more) {
    const box = stage.querySelector(".vstage__highlights");
    const open = box.classList.toggle("is-open");
    more.firstChild.textContent = (open ? tChrome("projects.showLess") : tChrome("projects.showMore")) + " ";
    const n = more.querySelector(".vstage__more-n"); if (n) n.style.display = open ? "none" : "";
    return;
  }
  const moreTags = e.target.closest(".vstage__moretags");
  if (moreTags) { stage.querySelector(".vstage__stack").classList.add("is-open"); moreTags.remove(); return; }
  const trailerBtn = e.target.closest(".vstage__trailer");
  if (trailerBtn) {
    const tr = activeContext(VISIBLE[openIndex]).version.media.trailer;
    openTrailer(tr);
  }
});

/* ----- open / close (FLIP) ----- */
function openViewer(index, card) {
  if (isOpen) return;
  openIndex = index;
  resetSel();
  paintStage();
  layoutDock();

  viewer.classList.add("is-open");
  viewer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  isOpen = true;
  // push a history entry so the browser/OS Back button closes the viewer instead
  // of navigating the page behind it (see popstate handler).
  history.pushState({ projectViewerOpen: true }, "");

  if (reduceMotion) { content.classList.add("is-visible"); return; }

  // Content stays hidden while the panel expands; it then fades/staggers in once
  // the card has finished morphing into the full panel — so the reveal reads as a
  // deliberate second beat rather than appearing on top of the growing panel.
  content.classList.remove("is-visible");
  opening = true;

  // FLIP: panel grows from the card rect to fullscreen, behind the content
  const r = card.getBoundingClientRect();
  const sx = r.width / window.innerWidth, sy = r.height / window.innerHeight;
  panel.style.transition = "none";
  panel.style.transformOrigin = "0 0";
  panel.style.borderRadius = "18px";
  panel.style.transform = `translate(${r.left}px, ${r.top}px) scale(${sx}, ${sy})`;

  // reveal the content once the panel's grow transition ends (fallback if it stalls).
  // Guard on target === panel so transitionend events bubbling up from children
  // (gallery cards, dock, etc.) can never trigger an early/second reveal.
  const onPanelGrown = (e) => {
    if (e && (e.target !== panel || e.propertyName !== "transform")) return;
    clearTimeout(grownFallback);
    panel.removeEventListener("transitionend", onPanelGrown);
    if (!opening) return; // closed/navigated before the grow finished
    opening = false;
    revealViewerContent();
  };
  const grownFallback = setTimeout(onPanelGrown, 360);
  panel.addEventListener("transitionend", onPanelGrown);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    panel.style.transition = "transform 0.34s cubic-bezier(0.66,0,0.2,1), border-radius 0.34s ease";
    panel.style.transform = "translate(0,0) scale(1,1)";
    panel.style.borderRadius = "0px";
  }));
}

/* Fade the detail content in once, after the panel has finished expanding.
   A single transition on .viewer__content (opacity + rise) drives the whole
   entrance — no competing per-column animation, so it can't flicker or replay. */
function revealViewerContent() {
  if (!isOpen) return;
  content.classList.add("is-visible");
}

function resetSel() {
  const p = VISIBLE[openIndex];
  // default: newest version (last) of surface 0 / versions; first variant
  let lastV = 0;
  if (p.surfaces) lastV = p.surfaces[0].versions.length - 1;
  else if (p.versions) lastV = p.versions.length - 1;
  sel = { s: 0, v: lastV, k: 0 };
}

function closeViewer() {
  if (!isOpen) return;
  opening = false; // cancel any pending open-reveal
  const card = cardEls[openIndex];
  const cardVisible = card && card.offsetParent !== null;
  if (reduceMotion || !cardVisible) { finishClose(); return; }

  content.classList.remove("is-visible");
  const r = card.getBoundingClientRect();
  const sx = r.width / window.innerWidth, sy = r.height / window.innerHeight;
  panel.style.transition = "transform 0.3s cubic-bezier(0.7,0,0.2,1), border-radius 0.3s ease";
  panel.style.transformOrigin = "0 0";
  panel.style.borderRadius = "18px";
  panel.style.transform = `translate(${r.left}px, ${r.top}px) scale(${sx}, ${sy})`;
  const done = () => {
    clearTimeout(fallback);
    panel.removeEventListener("transitionend", onEnd);
    finishClose();
  };
  const onEnd = (e) => { if (e.propertyName === "transform") done(); };
  const fallback = setTimeout(done, 360);
  panel.addEventListener("transitionend", onEnd);
}

function finishClose() {
  if (!isOpen) return; // idempotent (fallback + transitionend safety)
  closeDock();
  viewer.classList.remove("is-open");
  viewer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  content.classList.remove("is-visible");
  panel.style.transition = "none";
  panel.style.transform = "translate(0,0) scale(1,1)";
  panel.style.borderRadius = "0px";
  bgVideo.classList.remove("is-active");
  bgVideo.pause();
  isOpen = false;
  // if returning to a hidden (extra) card, expand the grid so it's visible
  const card = cardEls[openIndex];
  if (card && card.offsetParent === null) expandGrid();
  if (card) card.focus();
}

/* ----- navigate between projects ----- */
function goTo(index) {
  if (!isOpen) return;
  closeDock(); // picking a project (or arrow-nav) closes the mobile dock panel
  const wrapped = (index + VISIBLE.length) % VISIBLE.length;
  if (wrapped === openIndex) return;
  openIndex = wrapped;
  resetSel();
  layoutDock();
  repaintFade();
}
function next() { goTo(openIndex + 1); }
function prev() { goTo(openIndex - 1); }

/* ----- trailer lightbox ----- */
let trailerOpen = false;
let lb = null;
function ensureLightbox() {
  if (lb) return lb;
  lb = document.createElement("div");
  lb.className = "trailerlb";
  lb.setAttribute("aria-hidden", "true");
  lb.innerHTML = `
    <div class="trailerlb__backdrop"></div>
    <div class="trailerlb__inner" role="dialog" aria-modal="true">
      <button class="trailerlb__close" type="button" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <div class="trailerlb__media"></div>
    </div>`;
  document.body.appendChild(lb);
  lb.querySelector(".trailerlb__close").addEventListener("click", closeTrailer);
  lb.querySelector(".trailerlb__backdrop").addEventListener("click", closeTrailer);
  return lb;
}
function openTrailer(tr) {
  if (!tr) return;
  ensureLightbox();
  const host = lb.querySelector(".trailerlb__media");
  if (tr.provider === "youtube") host.innerHTML = `<iframe src="https://www.youtube.com/embed/${tr.id}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  else if (tr.provider === "vimeo") host.innerHTML = `<iframe src="https://player.vimeo.com/video/${tr.id}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  else host.innerHTML = `<video src="${tr.src}" controls autoplay playsinline></video>`;
  lb.classList.add("is-open");
  lb.setAttribute("aria-hidden", "false");
  trailerOpen = true;
}
function closeTrailer() {
  if (!lb) return;
  lb.classList.remove("is-open");
  lb.setAttribute("aria-hidden", "true");
  lb.querySelector(".trailerlb__media").innerHTML = ""; // stop playback
  trailerOpen = false;
}

/* ----- screenshot focus (device-frame lightbox) -----
   Click a device in the rail → it enlarges into a frosted-glass overlay with
   close · ‹ › arrows · dot indicators (Esc/←/→ keys too). Navigates the
   current version's gallery (`currentGallery`). */
let focusOpen = false, focusIdx = 0, focusEl = null, focusList = [];
/* full-device aspect (height / width incl. chrome) + a max width per form factor */
const FOCUS_RATIO = { phone: 19.5 / 9, land: 9 / 16, tablet: 10 / 16, foldable: 0.95, watch: 1.3, laptop: 0.62, desktop: 0.72 };
const FOCUS_CAP = { phone: 380, land: 760, tablet: 720, foldable: 560, watch: 300, laptop: 720, desktop: 720 };
function focusFrameWidth(kind) {
  const VW = window.innerWidth, VH = window.innerHeight;
  const ratio = FOCUS_RATIO[kind] || 19.5 / 9;
  const cap = FOCUS_CAP[kind] || 380;
  return Math.round(Math.min(VW * 0.9, (VH * 0.82) / ratio, cap));
}
function ensureFocus() {
  if (focusEl) return focusEl;
  focusEl = document.createElement("div");
  focusEl.className = "shotfocus";
  focusEl.setAttribute("aria-hidden", "true");
  focusEl.innerHTML = `
    <div class="shotfocus__backdrop"></div>
    <div class="shotfocus__stage" role="dialog" aria-modal="true"></div>
    <div class="shotfocus__label"></div>
    <button class="shotfocus__nav shotfocus__prev" type="button" aria-label="${esc(tChrome("projects.prevShot"))}">‹</button>
    <button class="shotfocus__nav shotfocus__next" type="button" aria-label="${esc(tChrome("projects.nextShot"))}">›</button>
    <button class="shotfocus__close" type="button" aria-label="${esc(tChrome("projects.close"))}">✕</button>
    <div class="shotfocus__dots"></div>`;
  document.body.appendChild(focusEl);
  focusEl.querySelector(".shotfocus__backdrop").addEventListener("click", closeFocus);
  // click anywhere outside the device/screenshot (the empty stage area) dismisses
  focusEl.querySelector(".shotfocus__stage").addEventListener("click", (e) => {
    if (e.target.classList.contains("shotfocus__stage")) closeFocus();
  });
  focusEl.querySelector(".shotfocus__close").addEventListener("click", closeFocus);
  focusEl.querySelector(".shotfocus__prev").addEventListener("click", () => focusNav(-1));
  focusEl.querySelector(".shotfocus__next").addEventListener("click", () => focusNav(1));
  focusEl.querySelector(".shotfocus__dots").addEventListener("click", (e) => {
    const d = e.target.closest(".shotfocus__dot");
    if (d && Number(d.dataset.i) !== focusIdx) { focusNav(Number(d.dataset.i) - focusIdx); }
  });
  return focusEl;
}
function renderFocus() {
  const it = focusList[focusIdx];
  if (!it) return;
  // "image" extras render as a plain (un-framed) picture sized to fit; device
  // screenshots render inside their device frame.
  // device shots show "Type · caption"; extras (sketches/banners) show their label
  const caption = it.kind === "image" ? it.label : (it.group ? `${it.group} · ${it.caption}` : it.caption);
  const stageHTML = it.kind === "image"
    ? `<figure class="shotfocus__image"><img src="${it.src}" alt="${esc(caption)}"></figure>`
    : `<figure class="frame ${frameClass(it.kind)}" style="width:${focusFrameWidth(it.kind)}px">${frameInner(it.kind, it.src, caption)}</figure>`;
  focusEl.querySelector(".shotfocus__stage").innerHTML = stageHTML;
  focusEl.querySelector(".shotfocus__label").textContent = caption;
  const multi = focusList.length > 1;
  focusEl.querySelector(".shotfocus__prev").style.display = multi ? "" : "none";
  focusEl.querySelector(".shotfocus__next").style.display = multi ? "" : "none";
  const dots = focusEl.querySelector(".shotfocus__dots");
  dots.style.display = multi ? "" : "none";
  dots.innerHTML = focusList
    .map((_, i) => `<button class="shotfocus__dot${i === focusIdx ? " is-active" : ""}" data-i="${i}" type="button" aria-label="${i + 1}"></button>`)
    .join("");
}
/* the rail / image card the current shot came from — the FLIP zoom returns to it */
function focusSourceEl() {
  const isImage = focusList === currentExtras;
  // For extras, anchor to the <img> itself (not the .imgcard, which also includes
  // the caption and may be wider than a portrait image) so the FLIP returns to the
  // exact image rect. Device frames anchor to .frame (already caption-free).
  const sel = isImage ? `.imgcard[data-i="${focusIdx}"] img` : `.gallery__card[data-i="${focusIdx}"] .frame`;
  return stage.querySelector(sel);
}
/* FLIP: translate+scale the centred device so it overlaps `srcEl`, then animate
   to (reverse=false) or from (reverse=true) its real position. */
function flipFocus(srcEl, reverse, done) {
  const target = focusEl.querySelector(".shotfocus__stage").firstElementChild;
  if (!target || !srcEl || reduceMotion) { if (done) done(); return; }
  const S = srcEl.getBoundingClientRect();
  const F = target.getBoundingClientRect();
  if (!F.width || !S.width) { if (done) done(); return; }
  const tx = (S.left + S.width / 2) - (F.left + F.width / 2);
  const ty = (S.top + S.height / 2) - (F.top + F.height / 2);
  const at = `translate(${tx}px, ${ty}px) scale(${S.width / F.width})`;
  if (!reverse) {
    target.style.transition = "none";
    target.style.transform = at;
    target.getBoundingClientRect(); // force reflow so the start frame paints
    requestAnimationFrame(() => {
      target.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
      target.style.transform = "translate(0, 0) scale(1)";
    });
  } else {
    target.style.transition = "transform 0.45s cubic-bezier(0.5, 0, 0.2, 1)";
    target.style.transform = at;
    setTimeout(() => { if (done) done(); }, 450);
  }
}
function openFocus(list, idx) {
  if (!list || !list.length) return;
  ensureFocus();
  focusList = list;
  focusIdx = idx;
  renderFocus();
  focusEl.classList.remove("is-closing");
  focusEl.classList.add("is-open");
  focusEl.setAttribute("aria-hidden", "false");
  focusOpen = true;
  flipFocus(focusSourceEl(), false);
}
function closeFocus() {
  if (!focusEl) return;
  const finish = () => {
    focusEl.classList.remove("is-open", "is-closing");
    focusEl.setAttribute("aria-hidden", "true");
    focusEl.querySelector(".shotfocus__stage").innerHTML = "";
    focusOpen = false;
  };
  const src = focusSourceEl();
  if (reduceMotion || !src) { finish(); return; }
  focusEl.classList.add("is-closing"); // fade backdrop + controls while it returns
  flipFocus(src, true, finish);
}
function focusNav(dir) {
  const n = focusList.length;
  if (!n) return;
  focusIdx = (focusIdx + dir + n) % n;
  renderFocus();
  const st = focusEl.querySelector(".shotfocus__stage");
  st.classList.remove("is-nav"); void st.offsetWidth; st.classList.add("is-nav"); // restart fade
}

/* Smooth horizontal scrolling for any overflowing rail.
   - Horizontal trackpad gestures: left to the browser → native momentum scroll.
   - Vertical mouse-wheel: translated into horizontal scroll, releasing to the
     viewer's wheel handler (project nav) only at the edges.
   Idempotent per element. */
function attachRailWheel(rail) {
  if (!rail || rail.dataset.wheel) return;
  rail.dataset.wheel = "1";
  rail.addEventListener("wheel", (e) => {
    if (rail.scrollWidth <= rail.clientWidth + 1) return; // nothing to scroll → let it bubble
    // already-horizontal gesture (trackpad) → native scroll keeps its momentum
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.stopPropagation(); return; }
    const atStart = rail.scrollLeft <= 0;
    const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1;
    if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return; // past the edge → project nav
    e.preventDefault();
    e.stopPropagation();
    rail.scrollLeft += e.deltaY;
  }, { passive: false });
}

/* wire the rail's drag-to-scroll, click-to-focus and device chips. Called
   after each media render; idempotent per freshly-built `.gallery`. */
function wireGallery() {
  attachRailWheel(stage.querySelector(".vrail")); // variant rail (internal apps) — wheel-scrollable
  // extra-images row — wheel-scrollable + click-to-expand (same focus overlay as screenshots)
  const imgRow = stage.querySelector(".vmedia-row--images");
  attachRailWheel(imgRow);
  if (imgRow && !imgRow.dataset.wired) {
    imgRow.dataset.wired = "1";
    imgRow.addEventListener("click", (e) => {
      const card = e.target.closest(".imgcard");
      if (card) openFocus(currentExtras, Number(card.dataset.i));
    });
  }
  const gal = stage.querySelector(".gallery");
  if (!gal || gal.dataset.wired) return;
  gal.dataset.wired = "1";
  const rail = gal.querySelector(".gallery__rail");
  const chips = gal.querySelector(".gallery__chips");
  // Scrolling is native (touch momentum, trackpad, scrollbar) + vertical-wheel →
  // horizontal via attachRailWheel. No JS drag-to-scroll: it was janky and fought
  // the native scroller. A plain click on a device opens its focus view.
  attachRailWheel(rail);
  rail.addEventListener("click", (e) => {
    const card = e.target.closest(".gallery__card");
    if (card) openFocus(currentGallery, Number(card.dataset.i));
  });
  if (chips) {
    const railPad = () => parseFloat(getComputedStyle(rail).paddingLeft) || 0;

    // Which group sits at the rail's start? Returns null when the start has
    // scrolled past the last shot (into the empty right padding) → none active.
    const activeGroup = () => {
      const ref = rail.getBoundingClientRect().left + railPad() + 4;
      for (const card of rail.querySelectorAll(".gallery__card")) {
        const r = card.getBoundingClientRect();
        if (r.left - 1 <= ref && r.right > ref) return card.dataset.group;
      }
      return null;
    };

    // Keep the active chip in sync with whatever group is at the start.
    const syncChips = () => {
      const g = activeGroup();
      chips.querySelectorAll(".gallery__chip").forEach((x) =>
        x.classList.toggle("is-active", x.dataset.group === g)
      );
    };

    // Clicking a chip scrolls that group's FIRST shot to the rail's start.
    chips.addEventListener("click", (e) => {
      const c = e.target.closest(".gallery__chip");
      if (!c) return;
      const target = [...rail.querySelectorAll(".gallery__card")].find((el) => el.dataset.group === c.dataset.group);
      if (!target) return;
      const delta = target.getBoundingClientRect().left - rail.getBoundingClientRect().left - railPad();
      rail.scrollTo({ left: rail.scrollLeft + delta, behavior: "smooth" });
      syncChips();
    });

    // Scroll-spy: update the active chip as the user scrolls the rail.
    let ticking = false;
    rail.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { syncChips(); ticking = false; });
    }, { passive: true });

    syncChips(); // initial state
    rail._syncChips = syncChips; // exposed so a restored scroll position can refresh it
  }
}

/* ----- controls -----
   Closing via the UI goes through history.back() so the pushed entry is removed
   and the browser Back button and the in-app close stay in sync; the actual
   close then happens in the popstate handler. */
function requestCloseViewer() {
  if (!isOpen) return;
  if (history.state && history.state.projectViewerOpen) history.back(); // → popstate → closeViewer
  else closeViewer();
}
window.addEventListener("popstate", () => { if (isOpen) closeViewer(); });

document.getElementById("viewerBack").addEventListener("click", requestCloseViewer);
document.getElementById("viewerNext").addEventListener("click", next);
document.getElementById("viewerPrev").addEventListener("click", prev);
backdrop.addEventListener("click", requestCloseViewer);
dockToggle.addEventListener("click", () => (viewer.classList.contains("is-dock-open") ? closeDock() : openDock()));
dockScrim.addEventListener("click", closeDock);

document.addEventListener("keydown", (e) => {
  if (focusOpen) {
    if (e.key === "Escape") closeFocus();
    else if (e.key === "ArrowRight") focusNav(1);
    else if (e.key === "ArrowLeft") focusNav(-1);
    return;
  }
  if (trailerOpen) { if (e.key === "Escape") closeTrailer(); return; }
  if (!isOpen) return;
  if (viewer.classList.contains("is-dock-open")) { if (e.key === "Escape") closeDock(); return; }
  if (e.key === "Escape") requestCloseViewer();
  else if (e.key === "ArrowDown" || e.key === "ArrowRight") next();
  else if (e.key === "ArrowUp" || e.key === "ArrowLeft") prev();
});

/* ----- scroll within detail → navigate at the boundary ----- */
function getScroller() {
  return scroller;
}
function atBoundary(dir) {
  const sc = getScroller();
  if (sc.scrollHeight <= sc.clientHeight + 1) return true;
  return dir > 0 ? sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 1 : sc.scrollTop <= 0;
}
let wheelLock = false;
content.addEventListener("wheel", (e) => {
  if (!isOpen || trailerOpen || focusOpen) return;
  e.preventDefault();
  const dir = e.deltaY > 0 ? 1 : -1;
  const sc = getScroller();
  if (sc.scrollHeight > sc.clientHeight + 1 && !atBoundary(dir)) { sc.scrollTop += e.deltaY; return; }
  if (wheelLock || Math.abs(e.deltaY) < 12) return;
  wheelLock = true;
  (dir > 0 ? next : prev)();
  setTimeout(() => { wheelLock = false; }, 720);
}, { passive: false });

let touchStartY = null;
stage.addEventListener("touchstart", (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
stage.addEventListener("touchend", (e) => {
  if (touchStartY == null) return;
  const dy = e.changedTouches[0].clientY - touchStartY;
  touchStartY = null;
  if (Math.abs(dy) < 60) return;
  const dir = dy < 0 ? 1 : -1;
  if (atBoundary(dir)) (dir > 0 ? next() : prev());
});

window.addEventListener("resize", () => {
  if (isOpen) {
    panel.style.transition = "none";
    panel.style.transform = "translate(0,0) scale(1,1)";
    panel.style.borderRadius = "0px";
    closeDock();   // a rotate/resize shouldn't leave the dock panel stuck open
    layoutDock();  // re-lay the dock for the new mode (wheel ⇄ list)
    positionAllThumbs();
  }
  if (focusOpen) renderFocus(); // re-fit the enlarged frame to the new viewport
});

/* ----- language change: re-render text in place ----- */
document.addEventListener("langchange", () => {
  renderGrid();
  buildDock();
  layoutDock();
  if (isOpen) {
    // Only the texts change — keep the reader where they were (vertical scroll
    // and the gallery's horizontal position / current screenshot).
    const top = scroller.scrollTop;
    const oldRail = stage.querySelector(".gallery__rail");
    const railLeft = oldRail ? oldRail.scrollLeft : 0;
    paintStage();
    scroller.scrollTop = top;
    const newRail = stage.querySelector(".gallery__rail");
    if (newRail) {
      newRail.scrollLeft = railLeft;
      if (newRail._syncChips) newRail._syncChips(); // refresh the active chip
    }
  }
});

/* ----- init ----- */
renderGrid();
buildDock();
layoutDock();
