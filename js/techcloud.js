/* ============================================================
   Elvis Hernández — Tech cloud (sección Contacto)
   Nubes de chips que aparecen y, tras un tiempo, encogen y
   se desvanecen, en bucle continuo. Cada chip late de forma
   independiente para dar sensación "tecnológica".
   Aislado: solo toca #techCloud. No depende de main.js.
   ============================================================ */
(function () {
  const cloud = document.getElementById("techCloud");
  if (!cloud) return;

  // Stack completo (combina lenguajes, jetpack y calidad/CI).
  const TECH = [
    "Kotlin", "Java", "Coroutines", "Flow", "MVVM", "Clean Architecture",
    "Jetpack Compose", "Room", "WorkManager", "Hilt", "Retrofit",
    "Android Auto", "KMP", "Bitrise", "GitHub Actions",
    "Firebase Crashlytics", "Detekt", "Renovate", "Testing", "Git",
  ];

  // Algunos chips se acentúan para romper la monotonía visual.
  const ACCENT_EVERY = 4;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Construir los chips una sola vez; conservan su posición en el
  // flujo flexbox, así que solo animamos opacidad/escala (sin saltos).
  const chips = TECH.map((label, i) => {
    const el = document.createElement("span");
    el.className = "techcloud__chip" + (i % ACCENT_EVERY === 0 ? " is-accent" : "");
    el.textContent = label;
    cloud.appendChild(el);
    return el;
  });

  // Sin animación: mostrar todo estático y salir.
  if (reduce) {
    chips.forEach((c) => c.classList.add("is-on"));
    return;
  }

  const rand = (min, max) => min + Math.random() * (max - min);

  // Cada chip vive su propio ciclo: visible un rato, oculto un rato.
  function cycle(chip, firstDelay) {
    const turnOn = () => {
      chip.classList.add("is-on");
      setTimeout(turnOff, rand(2600, 5200)); // tiempo visible
    };
    const turnOff = () => {
      chip.classList.remove("is-on"); // encoge + se desvanece (CSS)
      setTimeout(turnOn, rand(900, 2400)); // tiempo oculto
    };
    setTimeout(turnOn, firstDelay);
  }

  let running = false;
  function start() {
    if (running) return;
    running = true;
    window.removeEventListener("scroll", maybeStart);
    // Entrada escalonada para un arranque tipo "boot".
    chips.forEach((chip, i) => cycle(chip, i * 110 + rand(0, 200)));
  }

  // ¿El panel está (al menos parcialmente) dentro del viewport?
  function inView() {
    const r = cloud.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh * 0.85 && r.bottom > 0;
  }
  function maybeStart() {
    if (inView()) start();
  }

  // Arrancar cuando la sección entra en viewport (ahorra trabajo).
  // IntersectionObserver como vía principal + fallback por scroll, por si
  // el IO no dispara en algún entorno.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            start();
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(cloud);
  }
  window.addEventListener("scroll", maybeStart, { passive: true });
  maybeStart(); // por si ya está visible al cargar
})();
