/* ============================================
   Elvis Hernández — Experiencia (tour guiado)
   Acordeón con auto-play, barra de progreso, métricas y "ver más".
   Bilingüe (lee currentLang de i18n.js). Data-driven: edita JOBS.
   ============================================ */

const EXP_UI = {
  es: {
    eyebrow: "02 — Experiencia",
    title: 'Un recorrido por <span class="accent">dónde he aportado valor</span>',
    playing: "Reproduciendo",
    resume: "Reanudar tour",
    showMore: (n) => `Ver ${n} más`,
    showFewer: "Ver menos",
  },
  en: {
    eyebrow: "02 — Experience",
    title: "A guided tour of <span class=\"accent\">where I've added value</span>",
    playing: "Auto-playing",
    resume: "Resume tour",
    showMore: (n) => `Show ${n} more`,
    showFewer: "Show fewer",
  },
};

const JOBS = [
  {
    role: { es: "Android Developer", en: "Android Developer" },
    company: "elvah GmbH",
    city: { es: "Berlín", en: "Berlin"},
    country: { es: "Alemania", en: "Germany"},
    period: "2022 — 2026",
    meta: {
      es: "Berlín, Alemania · Remoto · Apps de carga de VE (B2C)",
      en: "Berlin, Germany · Remote · Consumer EV-charging (B2C)",
    },
    summary: {
      es: "Estuve a cargo de funciones de carga de vehículos eléctricos de extremo a extremo en una base de codigo modular escrita en Kotlin. Desde encontrar de puntos de carga hasta sesiones de carga en tiempo real.",
      en: "Owned EV-charging features end-to-end in a large, modular Kotlin codebase. From charge-point discovery to live charging sessions.",
    },
    metrics: [
      { value: "36K+", label: { es: "usuarios activos", en: "active users" } },
      { value: "99.8%", label: { es: "sin fallos", en: "crash-free" } },
      { value: { es: "4 años", en: "4 yrs" }, label: { es: "antigüedad", en: "tenure" } },
    ],
    bullets: {
      es: [
        "Trabaje migrando vistas XML a Jetpack Compose.",
        "Construccion y mantenimiento de un SDK nativo.",
        "Desarrolle una app Android Auto desde cero para el Android auto head unit",
        "Configuration y diseño de workflows CI/CD en Bitrise y GitHub Actions.",
        "Mantuve la estabilidad aprox. 99.8% sin fallos con monitoreo proactivo en Crashlytics.",
        "Configuration de controles de calidad del codigo en la base de codigo modular.",
        "Empeze a trabajar e integrar herramientas de IA con mi revisión rigurosa.",
      ],
      en: [
        "Worked on migrating XML views to Jetpack Compose.",
        "Built and maintained a native SDK.",
        "Developed an Android Auto app from scratch for the Android Auto head unit.",
        "Set up and designed CI/CD workflows in Bitrise and GitHub Actions.",
        "Kept stability at aprox. 99.8% crash-free with proactive monitoring in Crashlytics.",
        "Set up code-quality checks across the modular codebase.",
        "Started adopting and integrating AI tools backed by my rigorous review.",
      ],
    },
    tags: ["Kotlin", "Jetpack Compose", "Android Auto", "SDK", "CI/CD"],
  },
  {
    role: { es: "Android Developer", en: "Android Developer" },
    company: "Tecnologías Móviles Globales",
    city: { es: "Managua", en: "Managua"},
    country: { es: "Nicaragua", en: "Nicaragua"},
    period: "2020 — 2022",
    meta: {
      es: "Managua, Nicaragua · Presencial · De intern a full-time",
      en: "Managua, Nicaragua · On-site · Intern → full-time",
    },
    summary: {
      es: "Trabaje con apps Android en producción creando nuevas variantes y funciones. Aqui inicie mi carrera profesional, pasé de interno a trabajar tiempo completo ademas que introduje Unity para nuevos projectos",
      en: "Worked on production Android apps, building new variants and features. This is where I started my professional career, going from intern to full-time. Here I introduced Unity for new projects.",
    },
    metrics: [
        {value: {es: "2 años", en: "2 yrs"}, label: {es: "antigüedad", en: "tenure"}},
    ],
    bullets: {
      es: [
        "Desarrollé y mantuve features para apps Android en producción.",
        "Trabaje con XML, Java, RxJava y otras librerias que ahora son poco usadas.",
        "Construí prototipos y variantes rapidas ademas de un juego para Android con Unity3D.",
      ],
      en: [
        "Developed and maintained features for production Android apps.",
        "Worked with XML, Java, RxJava and other now legacy-used libraries.",
        "Built rapid prototypes and variants, plus an Android game with Unity3D.",
      ],
    },
    tags: ["Java", "Kotlin", "Unity3D"],
  },
  {
    role: {
      es: "Ingeniero en Sistemas y Tecnologías de la Información",
      en: "Information Systems & Technologies Engineer",
    },
    company: "Universidad Centroamericana (UCA)",
    city: { es: "Managua", en: "Managua"},
    country: { es: "Nicaragua", en: "Nicaragua"},
    period: "2013 — 2017",
    meta: { es: "Managua, Nicaragua", en: "Managua, Nicaragua" },
    summary: {
      es: "Título universitario de ingeniería en Sistemas y Tecnologías de la Información con mencion en sistemas de informacion tomado en Managua capital de Nicaragua.",
      en: "Engineering degree in Information Systems & Technologies, with a major in information systems, completed in Managua, the capital of Nicaragua.",
    },
    metrics: [],
    bullets: {
      es: [
        "Estudie de fundamentos de ingeniería de software, algoritmos y diseño de sistemas de software",
        "Decidi seguir el area de desarrollo mobil al presentar una app android como proyecto final de la carrera.",
      ],
      en: [
        "Studied the foundations of software engineering, algorithms and software systems design.",
        "Decided to pursue mobile development after presenting an Android app as my final degree project.",
      ],
    },
    tags: { es: ["Ciencias de la computación", "Ingeniería de software"], en: ["Computer Science", "Software Engineering"] },
    edu: true,
  },
];

(function initExperience() {
  const root = document.getElementById("experienceRoot");
  if (!root) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DUR = 7200;
  const MAX_POINTS = 4;

  const tL = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v[currentLang] ?? v.es : v);
  const ui = () => EXP_UI[currentLang] || EXP_UI.es;

  let active = 0;
  let playing = !reduce;
  let showAll = false;
  let rafId = null;
  let progressStart = 0;
  let onScreen = false; // gated by IntersectionObserver — autoplay only runs while visible

  // start the progress loop only when the user wants it AND the section is on screen
  function maybeStartProgress() {
    if (playing && onScreen) startProgress();
  }

  const chevron =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

  /* ---------- Construcción del DOM (una vez) ---------- */
  function build() {
    root.innerHTML = `
      <div class="exp-headrow">
        <h2 class="exp-title" id="expTitle">${ui().title}</h2>
        <button class="exp-control" id="expControl" type="button"></button>
      </div>
      <div class="exp-timeline" id="expTimeline">
        <span class="exp-rail" aria-hidden="true"></span>
        ${JOBS.map((j, i) => itemHTML(j, i)).join("")}
      </div>`;

    root.querySelectorAll(".exp-item").forEach((el) => {
      const i = Number(el.dataset.i);
      const card = el.querySelector(".exp-card");
      card.addEventListener("click", () => select(i));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(i); }
      });
      const moreBtn = el.querySelector(".exp-more-btn");
      if (moreBtn) {
        moreBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          playing = false;
          showAll = !showAll;
          syncOpenStates();
          syncControl();
          stopProgress();
        });
      }
    });

    document.getElementById("expControl").addEventListener("click", () => {
      playing ? pause() : play();
    });

    syncOpenStates();
    syncControl();
    maybeStartProgress();
  }

  function itemHTML(j, i) {
    const bullets = tL(j.bullets);
    const head = bullets.slice(0, MAX_POINTS);
    const rest = bullets.slice(MAX_POINTS);
    const tags = tL(j.tags) || [];

    // Ubicación opcional: "Ciudad, País" (city/country son { es, en }).
    const loc = [tL(j.city), tL(j.country)].filter(Boolean).join(", ");

    const metricsHTML = j.metrics.length
      ? `<div class="exp-metrics">${j.metrics
          .map(
            (m) =>
              `<div class="exp-metric"><div class="exp-metric-val">${tL(m.value)}</div><div class="exp-metric-label">${tL(m.label)}</div></div>`
          )
          .join("")}</div>`
      : "";

    const restHTML = rest.length
      ? `<div class="exp-more-wrap"><ul class="exp-bullets">${rest.map((b) => bulletHTML(b)).join("")}</ul></div>
         <button class="exp-more-btn" type="button"><span class="exp-more-label"></span><span class="exp-more-chev">${chevron}</span></button>`
      : "";

    return `
      <div class="exp-item" data-i="${i}">
        <span class="exp-dot${j.edu ? " exp-dot--edu" : ""}" aria-hidden="true"></span>
        <div class="exp-card" role="button" tabindex="0" aria-expanded="false">
          <div class="exp-head">
            <div class="exp-head-main">
              <h3 class="exp-role">${tL(j.role)}</h3>
              <span class="exp-company">${j.company}${loc ? ` | ${loc}` : ""}</span>
            </div>
            <div class="exp-head-right">
              <span class="exp-period">${j.period}</span>
              <span class="exp-chev">${chevron}</span>
            </div>
          </div>
          <div class="exp-progress"><span class="exp-progress-bar"></span></div>
          <div class="exp-detail">
            <div class="exp-detail-inner">
              <p class="exp-summary">${tL(j.summary)}</p>
              ${metricsHTML}
              <ul class="exp-bullets exp-bullets--head">${head.map((b) => bulletHTML(b)).join("")}</ul>
              ${restHTML}
              <div class="exp-tags">${tags.map((t) => `<span class="exp-tag">${t}</span>`).join("")}</div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function bulletHTML(b) {
    return `<li class="exp-bullet"><span class="exp-bullet-dot">▹</span>${b}</li>`;
  }

  /* ---------- Estado visual ---------- */
  function syncOpenStates() {
    root.querySelectorAll(".exp-item").forEach((el) => {
      const i = Number(el.dataset.i);
      const open = i === active;
      el.classList.toggle("is-open", open);
      el.querySelector(".exp-card").setAttribute("aria-expanded", String(open));
      el.classList.toggle("is-showall", open && showAll);

      const moreBtn = el.querySelector(".exp-more-btn");
      if (moreBtn) {
        const rest = (tL(JOBS[i].bullets) || []).slice(MAX_POINTS);
        moreBtn.querySelector(".exp-more-label").textContent = showAll
          ? ui().showFewer
          : ui().showMore(rest.length);
        moreBtn.classList.toggle("is-open", showAll);
      }
    });
  }

  function syncControl() {
    const btn = document.getElementById("expControl");
    if (!btn) return;
    if (playing) {
      btn.className = "exp-control is-playing";
      btn.innerHTML = `<span class="exp-control-dot"></span>${ui().playing}`;
    } else {
      btn.className = "exp-control";
      btn.innerHTML = `<span class="exp-control-play">▶</span>${ui().resume}`;
    }
  }

  /* ---------- Auto-play / progreso ---------- */
  function startProgress() {
    stopProgress();
    progressStart = performance.now();
    const bar = currentBar();
    const tick = (now) => {
      const p = Math.min((now - progressStart) / DUR, 1);
      if (bar) bar.style.width = p * 100 + "%";
      if (p < 1) rafId = requestAnimationFrame(tick);
      else {
        active = (active + 1) % JOBS.length;
        showAll = false;
        syncOpenStates();
        maybeStartProgress();
      }
    };
    rafId = requestAnimationFrame(tick);
  }

  function stopProgress() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    root.querySelectorAll(".exp-progress-bar").forEach((b) => (b.style.width = "0%"));
  }

  function currentBar() {
    const item = root.querySelector(`.exp-item[data-i="${active}"]`);
    return item ? item.querySelector(".exp-progress-bar") : null;
  }

  /* ---------- Acciones ---------- */
  const isMobile = () => window.matchMedia("(max-width: 720px)").matches;

  function select(i) {
    const prev = active;
    active = i;
    showAll = false;
    playing = false;
    stopProgress();
    syncOpenStates();
    syncControl();
    if (isMobile()) alignItemToTop(i, prev);
  }

  /* Align a job's top to the top of the screen (mobile, for easy reading).
     If a card ABOVE this one is collapsing, its 0.5s height transition shifts
     this card upward — so we must wait for that to settle before scrolling, or
     the card lands off-screen. When nothing above changes, scroll immediately. */
  function alignItemToTop(i, prev) {
    const item = root.querySelector(`.exp-item[data-i="${i}"]`);
    if (!item) return;
    const go = () => item.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (reduce || prev >= i) { go(); return; } // no card above collapses → safe now
    const detail = item.querySelector(".exp-detail");
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(fb);
      if (detail) detail.removeEventListener("transitionend", onEnd);
      go();
    };
    const onEnd = (e) => { if (e.propertyName === "grid-template-rows") finish(); };
    if (detail) detail.addEventListener("transitionend", onEnd);
    const fb = setTimeout(finish, 560); // fallback if transitionend doesn't fire
  }

  function play() {
    playing = true;
    syncControl();
    syncOpenStates();
    maybeStartProgress();
  }

  function pause() {
    playing = false;
    stopProgress();
    syncControl();
  }

  /* ---------- i18n: re-render conservando el estado ---------- */
  document.addEventListener("langchange", () => {
    const wasPlaying = playing;
    const keepActive = active;
    const keepShowAll = showAll;
    build();
    active = keepActive;
    showAll = keepShowAll;
    playing = wasPlaying;
    syncOpenStates();
    syncControl();
    maybeStartProgress();
  });

  /* ---------- Gate autoplay on visibility ----------
     The auto-advance toggles accordions, which changes the section's height and
     shifts content below. Only run it while the section is on screen. The small
     negative rootMargin means it activates once ~64px of the section is in view
     (and pauses 64px before it fully leaves), then resumes when scrolled back. */
  const io = new IntersectionObserver((entries) => {
    const seen = entries[0].isIntersecting;
    if (seen === onScreen) return;
    onScreen = seen;
    if (onScreen) {
      maybeStartProgress(); // resumes the current card's timer if the user is playing
    } else if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
      root.querySelectorAll(".exp-progress-bar").forEach((b) => (b.style.width = "0%"));
    }
  }, { root: null, rootMargin: "-64px 0px -64px 0px", threshold: 0 });
  io.observe(root);

  build();
})();
