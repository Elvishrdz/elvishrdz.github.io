/* ============================================
   Elvis Hernández — Portfolio interactions
   ============================================ */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===== Año del footer ===== */
document.getElementById("year").textContent = new Date().getFullYear();

/* ===== Navbar: fondo al hacer scroll + barra de progreso ===== */
const nav = document.getElementById("nav");
const progress = document.querySelector(".scroll-progress");
const parallaxEls = document.querySelectorAll("[data-parallax]");

function onScroll() {
  nav.classList.toggle("is-scrolled", window.scrollY > 24);

  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : "0%";

  if (!prefersReducedMotion) applyParallax();
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ===== Parallax (elementos con data-parallax) ===== */
function applyParallax() {
  const y = window.scrollY;
  parallaxEls.forEach((el) => {
    const speed = parseFloat(el.dataset.parallax) || 0.2;
    el.style.transform = `translateY(${y * speed}px)`;
  });
}

/* ===== Menú móvil ===== */
const burger = document.getElementById("navBurger");
const navLinks = document.getElementById("navLinks");

burger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("is-open");
  burger.classList.toggle("is-open", open);
  burger.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  })
);

/* ===== Reveal al hacer scroll ===== */
const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = parseInt(entry.target.dataset.delay || "0", 10);
      setTimeout(() => entry.target.classList.add("is-visible"), delay);
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

revealEls.forEach((el) => revealObserver.observe(el));

/* ===== Link activo según sección visible ===== */
const sections = document.querySelectorAll("section[id]");
const linkMap = new Map(
  [...document.querySelectorAll(".nav__link")].map((l) => [l.getAttribute("href").slice(1), l])
);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      linkMap.forEach((l) => l.classList.remove("is-active"));
      const link = linkMap.get(entry.target.id);
      if (link) link.classList.add("is-active");
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);

sections.forEach((s) => sectionObserver.observe(s));

/* ===== Typewriter (frases según el idioma activo) ===== */
const typeTarget = document.getElementById("typewriter");
let typeGen = 0; // generación: invalida loops viejos al cambiar idioma

function startTypewriter() {
  const myGen = ++typeGen; // cualquier loop anterior queda obsoleto
  const phrases = getTypewriterPhrases();

  if (prefersReducedMotion) {
    typeTarget.textContent = phrases[0];
    return;
  }

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function type() {
    if (myGen !== typeGen) return; // se cambió de idioma: detener este loop
    const phrase = phrases[phraseIdx];
    charIdx += deleting ? -1 : 1;
    typeTarget.textContent = phrase.slice(0, charIdx);

    let delay = deleting ? 40 : 75;
    if (!deleting && charIdx === phrase.length) {
      delay = 2200;
      deleting = true;
    } else if (deleting && charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      delay = 400;
    }
    setTimeout(type, delay);
  }

  type();
}

startTypewriter();

// Reiniciar el typewriter cuando se cambia de idioma
document.addEventListener("langchange", startTypewriter);

/* ===== Contadores animados ===== */
const counters = document.querySelectorAll("[data-count]");

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      counterObserver.unobserve(entry.target);
      animateCount(entry.target);
    });
  },
  { threshold: 0.6 }
);

counters.forEach((c) => counterObserver.observe(c));

function animateCount(el) {
  const raw = el.dataset.count;
  const target = parseFloat(raw);
  const decimals = (raw.split(".")[1] || "").length; // soporta 99.8, 36.1, etc.

  if (prefersReducedMotion) {
    el.textContent = target.toFixed(decimals);
    return;
  }
  const duration = 1400;
  const start = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * eased).toFixed(decimals);
    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/* ===== Tarjeta con tilt 3D ===== */
const tiltCard = document.getElementById("tiltCard");

if (tiltCard && !prefersReducedMotion && matchMedia("(hover: hover)").matches) {
  const inner = tiltCard.querySelector(".tilt-card__inner");

  tiltCard.addEventListener("mousemove", (e) => {
    const rect = tiltCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    inner.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
  });

  tiltCard.addEventListener("mouseleave", () => {
    inner.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
}

/* ===== Resplandor que sigue al cursor ===== */
const glow = document.querySelector(".cursor-glow");

if (!prefersReducedMotion && matchMedia("(hover: hover)").matches) {
  let glowX = 0, glowY = 0, targetX = 0, targetY = 0;
  let glowActive = false;

  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!glowActive) {
      glowActive = true;
      glow.style.opacity = "1";
      glowX = targetX;
      glowY = targetY;
      requestAnimationFrame(moveGlow);
    }
  });

  function moveGlow() {
    glowX += (targetX - glowX) * 0.08;
    glowY += (targetY - glowY) * 0.08;
    glow.style.left = `${glowX}px`;
    glow.style.top = `${glowY}px`;
    requestAnimationFrame(moveGlow);
  }
}
