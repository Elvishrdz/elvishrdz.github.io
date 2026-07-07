/* ============================================================
   Elvis Hernández — Projects DATA (single source of truth)
   ------------------------------------------------------------
   Pure data. No rendering here. Consumed by js/projects.js
   (grid + viewer) — wired in from Phase 3 onward.

   Schema (see docs/plan/projects-overhaul-plan.md §3):
     FEATURES                      feature flags (modular content)
     PROJECTS[]                    each item:
       id, glyph, icon?            icon path overrides glyph (C2)
       name, tagline {es,en}
       featured?                   one of the 3 shown by default
       group?: "job"              gated by FEATURES.showJobs
       EXACTLY ONE of:
         versions[]                simple project (1+ versions)
         surfaces[]                App/Backend toggle. Each surface owns EITHER
                                   versions[] (plain) OR types[] (app-type level:
                                   e.g. Staff / Collector / Client). Each type is
                                   { label{es,en}, sub{es,en} (year of its latest
                                   version), icon? (per-app icon), versions[] }.
                                   types[] renders an extra segmented control between
                                   the surface toggle and the version switch; shown
                                   only when 2+ types exist. When a project has 2+
                                   app-types their icons fan out (poker-hand style) on
                                   the grid card, and the detail header icon swaps to
                                   the selected type's icon.
         variants[]                job sub-projects (version-shaped)
     version/variant shape:
       label, sub {es,en}, year, era ("legacy"|"modern"|"auto")
       wip?                        gated by FEATURES.showWipVersions
       meta {es,en}, gradient, accent
       desc {es,en}, highlights {es,en}[], stack[]
       link? { label {es,en}, href }
       media {
         kind: "phone"|"gallery"|"image"|"none"
         orientation?: "portrait"|"landscape"
         screenshots?: [path]      real shots → all in one phone/landscape frame
         captions?: [{es,en}]      per-shot text under each screenshot (aligns by
                                   index with screenshots[]); shown below the frame
         images?: [{src, label{es,en}}]  non-screenshot → un-framed image card
         devices?: [{kind, src, group?{es,en}, caption{es,en}}]  ← per-shot frame
         bgVideo?: path            compressed loop (§0.9)
         trailer?: { provider:"file"|"youtube"|"vimeo", src?, id?, label?{es,en} }
       }

     SCREENSHOT CAPTIONS
       Every screenshot shows a short caption underneath describing the screen
       (e.g. Home / History / Statistics). For the phone path use media.captions[]
       (index-aligned with screenshots[]); for galleries use each device.caption.
       If omitted it falls back to the shot's position number.

     GALLERY (per-screenshot frame + grouping)
       Use media.kind:"gallery" + devices[] to pick a frame PER screenshot and
       group them into filter chips. Each device:
         kind:    "watch" | "phone" | "land" | "foldable"
                  | "tablet" | "laptop" (Chromebook/web) | "desktop" (macOS window)
         src:     screenshot path
         caption: text shown under the frame + in the focus view {es,en}
         group?:  chip label {es,en}; if omitted the device's form factor is used
                  (Wear OS / Phone / Foldable / Tablet / Chromebook / Desktop).
                  Two+ distinct groups → filter chips appear.
       Clicking a device opens the FLIP focus view (zooms from its rail slot and
       returns to it on close).
   ============================================================ */

const FEATURES = {
  showJobs: true, // false → removes elvah + TeMoGlo (and every variant) everywhere at once
  showWipVersions: true, // false → hides WIP versions (and WIP-only projects)
  showWipBadge: true, // false → hides the "Work in progress" label in the project viewer top bar
};

const PROJECTS = [

  // ---------- Credit Manager (App KMP · Backend) ----------
  {
    id: "credit-manager",
    glyph: "💳",
    icon: "assets/projects/cm-manager/v1/cm-staff-app-icon.png",
    name: "Credit Manager",
    featured: true,
    tagline: {
      es: "Este es un sistema de creditos para Android, iOS, MacOS, Windows y Linux hecho con Kotlin SpringBoot y Kotlin Multiplataforma",
      en: "This is a credit system for Android, iOS, MacOS, Windows and Linux made with Kotlin SpringBoot and Kotlin Multiplatform"
    },
    surfaces: [
      {
        label: { es: "App", en: "App" },
        // App surface splits into app-TYPES (Staff / Collector / Client). Each type
        // owns its own versions[] with its own copy, screenshots, color, etc.
        // `sub` on each type = year of its latest version (shown under the chip).
        // NOTE: placeholder/test content — refine copy, versions and shots later.
        types: [
          {
            label: { es: "Staff", en: "Staff" },
            sub: { es: "2026", en: "2026" },
            icon: "assets/projects/cm-manager/v1/cm-staff-app-icon.png",
            versions: [
              {
                label: "v1.0.0",
                sub: { es: "2026", en: "2026" },
                year: "2026",
                era: "modern",
                meta: { es: "KMP · Compose MP · Room · Koin · Ktor", en: "KMP · Compose MP · Room · Koin · Ktor" },
                gradient: "#ffffff",
                accent: "#b1b1b1",
                desc: {
                  es: "App de administración para el personal del negocio de créditos. La versión de escritorio ofrece las funciones administrativas más ricas: gestión de solicitudes, detalles de clientes y control del sistema de cobradores.",
                  en: "Administrative app for the credit business staff. The desktop build offers the richest admin features: request management, client details and control over the collector system.",
                },
                highlights: {
                  es: ["Gestión de solicitudes de crédito", "Detalles y expediente de clientes", "Estadísticas y proyecciones del negocio"],
                  en: ["Credit request management", "Client details and records", "Business statistics and projections"],
                },
                stack: ["Compose Multiplatform (CMP)", "Mapbox", "Supabase", "Xcode", "Android Studio", "IntelliJ", "Redis", "Room", "Koin", "Ktor", "MacOS", "Android", "iOS", "Claude Code", "Kotlin", "Kotlin Multiplatform (KMP)"],
                media: {
                  kind: "gallery",
                  devices: [
                    { kind: "laptop", src: "assets/projects/cm-manager/v1/01-cm-desktop-app-macos-installer.png", caption: { es: "Instaladores", en: "Installers" }, group: { es: "MacOS", en: "MacOS" } },
                    { kind: "laptop", src: "assets/projects/cm-manager/v1/02-cm-desktop-app-macos-apps-installed.png", caption: { es: "Apps instaladas", en: "Installed apps" }, group: { es: "MacOS", en: "MacOS" } },
                    { kind: "laptop", src: "assets/projects/cm-manager/v1/03-cm-desktop-app-macos-credit-requests.png", caption: { es: "Solicitud de creditos", en: "Credit requests" }, group: { es: "MacOS", en: "MacOS" } },
                    { kind: "laptop", src: "assets/projects/cm-manager/v1/04-cm-desktop-app-macos-customer-details.png", caption: { es: "Detalles del cliente", en: "Client details" }, group: { es: "MacOS", en: "MacOS" } },
                    { kind: "phone", src: "assets/projects/cm-manager/v1/01-cm-ios-app-staff-dashboard.png", caption: { es: "Menu de personal", en: "Staff dashboard" }, group: { es: "iOS", en: "iOS" } },
                    { kind: "phone", src: "assets/projects/cm-manager/v1/02-cm-ios-app-map-location-picker.png", caption: { es: "Mapa", en: "Map" }, group: { es: "iOS", en: "iOS" } },
                    { kind: "phone", src: "assets/projects/cm-manager/v1/03-cm-ios-app-credits.png", caption: { es: "Creditos", en: "Credits" }, group: { es: "iOS", en: "iOS" } },
                  ],
                },
              },
            ],
          },
          {
            label: { es: "Cobrador", en: "Collector" },
            sub: { es: "2026", en: "2026" },
            icon: "assets/projects/cm-manager/v1/cm-collector-app-icon.png",
            versions: [
              // Ordered oldest → newest (last = newest, shown by default).
              {
                label: "v1.0.0",
                sub: { es: "2026", en: "2026" },
                year: "2026",
                era: "modern",
                meta: { es: "KMP · Compose MP · Room", en: "KMP · Compose MP · Room" },
                gradient: "linear-gradient(135deg,#14342a,#0ca678)",
                accent: "#0ca678",
                desc: {
                  es: "Primera versión de la app de cobradores. (Contenido de prueba — reemplazar más adelante.)",
                  en: "First release of the collector app. (Placeholder content — replace later.)",
                },
                highlights: {
                  es: ["Cobro diario", "Registro de cuotas"],
                  en: ["Daily collection", "Installment logging"],
                },
                stack: ["Compose Multiplatform (CMP)", "Room", "Koin", "Ktor", "Android", "iOS", "Kotlin"],
                media: {
                  kind: "gallery",
                  devices: [
                    { kind: "phone", src: "assets/projects/cm-manager/v1/04-cm-ios-app-daily-collection.png", caption: { es: "Cobro diario", en: "Daily collection" }, group: { es: "iOS", en: "iOS" } },
                    { kind: "phone", src: "assets/projects/cm-manager/v1/05-cm-ios-app-collector-system.png", caption: { es: "Sistema de cobradores", en: "Collector system" }, group: { es: "iOS", en: "iOS" } },
                  ],
                },
              },
              {
                // Newest version → shown by default when this app-type is opened.
                label: "v1.0.1",
                sub: { es: "2026", en: "2026" },
                year: "2026",
                era: "modern",
                meta: { es: "KMP · Compose MP · Mapbox · Room", en: "KMP · Compose MP · Mapbox · Room" },
                gradient: "linear-gradient(135deg,#0f3d2e,#12b886)",
                accent: "#12b886",
                desc: {
                  es: "App móvil para los cobradores de campo. Se enfoca en las operaciones diarias: rutas de cobro, registro de cuotas y ubicación de clientes en el mapa. (Contenido de prueba.)",
                  en: "Mobile app for field collectors. Focused on day-to-day operations: collection routes, logging installments and locating clients on the map. (Placeholder content.)",
                },
                highlights: {
                  es: ["Cobro diario y registro de cuotas", "Ubicación de clientes en el mapa", "Sistema de rutas de cobradores"],
                  en: ["Daily collection and installment logging", "Client location on the map", "Collector route system"],
                },
                stack: ["Compose Multiplatform (CMP)", "Mapbox", "Room", "Koin", "Ktor", "Android", "iOS", "Kotlin", "Kotlin Multiplatform (KMP)"],
                media: {
                  kind: "gallery",
                  devices: [
                    { kind: "phone", src: "assets/projects/cm-manager/v1/04-cm-ios-app-daily-collection.png", caption: { es: "Cobro diario", en: "Daily collection" }, group: { es: "iOS", en: "iOS" } },
                    { kind: "phone", src: "assets/projects/cm-manager/v1/05-cm-ios-app-collector-system.png", caption: { es: "Sistema de cobradores", en: "Collector system" }, group: { es: "iOS", en: "iOS" } },
                    { kind: "phone", src: "assets/projects/cm-manager/v1/02-cm-ios-app-map-location-picker.png", caption: { es: "Mapa", en: "Map" }, group: { es: "iOS", en: "iOS" } },
                    { kind: "laptop", src: "assets/projects/cm-manager/v1/05-cm-desktop-app-macos-collector-system.png", caption: { es: "Sistema de cobradores", en: "Collector system" }, group: { es: "MacOS", en: "MacOS" } },
                    { kind: "laptop", src: "assets/projects/cm-manager/v1/06-cm-desktop-app-macos-collector-dashboard.png", caption: { es: "Menu de cobradores", en: "Collector dashboard" }, group: { es: "MacOS", en: "MacOS" } },
                  ],
                },
              },
            ],
          },
          {
            label: { es: "Cliente", en: "Client" },
            sub: { es: "2026", en: "2026" },
            icon: "assets/projects/cm-manager/v1/cm-borrower-app-icon.png",
            versions: [
              {
                label: "v1.0.0",
                sub: { es: "2026", en: "2026" },
                year: "2026",
                era: "modern",
                meta: { es: "KMP · Compose MP · Ktor", en: "KMP · Compose MP · Ktor" },
                gradient: "linear-gradient(135deg,#1a2a4a,#4c6ef5)",
                accent: "#4c6ef5",
                desc: {
                  es: "App para el cliente/prestatario: consulta de su crédito, cuotas pendientes y calendario de pagos. (Contenido de prueba — reemplazar más adelante.)",
                  en: "App for the client/borrower: view their credit, pending installments and payment schedule. (Placeholder content — replace later.)",
                },
                highlights: {
                  es: ["Estado del crédito y saldo", "Cuotas pendientes y calendario de pagos", "Historial de pagos"],
                  en: ["Credit status and balance", "Pending installments and payment schedule", "Payment history"],
                },
                stack: ["Compose Multiplatform (CMP)", "Ktor", "Koin", "Android", "iOS", "Kotlin", "Kotlin Multiplatform (KMP)"],
                media: {
                  kind: "gallery",
                  devices: [
                    { kind: "phone", src: "assets/projects/cm-manager/v1/03-cm-ios-app-credits.png", caption: { es: "Mis creditos", en: "My credits" }, group: { es: "iOS", en: "iOS" } },
                    { kind: "phone", src: "assets/projects/cm-manager/v1/04-cm-ios-app-daily-collection.png", caption: { es: "Pagos", en: "Payments" }, group: { es: "iOS", en: "iOS" } },
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        label: { es: "Backend", en: "Backend" },
        versions: [
          {
            label: "v1.0.0",
            sub: { es: "2026", en: "2026" },
            year: "2026",
            era: "modern",
            meta: { es: "Kotlin · Spring Boot · JPA · Redis · Supabase", en: "Kotlin · Spring Boot · JPA · Redis · Supabase" },
            gradient: "#9c0000",
            accent: "#d82a2a",
            desc: {
              es: "Construido manualmente desde cero y luego extendido con ayuda de Claude Code. Expone todos los endpoints de clientes y actúa como primera línea de defensa para la seguridad de los datos.",
              en: "Built manually from scratch and later extended with help from Claude Code. It exposes all client endpoints and acts as the first line of defense for data security.",
            },
            highlights: {
              es: ["Endpoints de clientes y créditos", "Persistencia con JPA y caché con Redis", "Datos en Supabase; seguridad de primera línea"],
              en: ["Client and credit endpoints", "JPA persistence with Redis caching", "Supabase data; first-line security"],
            },
            stack: ["Kotlin", "Spring Boot 4", "Multi-module", "JPA", "Redis", "Supabase", "Claude Code", "AI Skills"],
            media: { kind: "none" },
          },
        ],
      },
    ],
  },

  // ---------- Drink Water (v1 XML → v2 KMP) ----------
  {
    id: "drink-water",
    glyph: "💧",
    icon: "assets/projects/drink-water/icon.jpg",
    name: "Drink Water",
      featured: true,
    tagline: {
      es: "Recordatorios y tracking para mejorar tu hábito y mantenerte hidratado.",
      en: "Get reminders to stay hydrated. Track your progress and improve your habit.",
    },
    versions: [
      {
        label: "v1.1.2",
        sub: { es: "2019", en: "2019" },
        year: "2019",
        era: "legacy",
        meta: { es: "Java · XML · minSdk 16", en: "Java · XML · minSdk 16" },
        gradient: "linear-gradient(135deg,#1f3a4a,#A22C83FF)",
        accent: "#A22C83FF",
        desc: {
          es: "Una app de recordatorios para beber agua que lleva tus registros. Lo construí para desarrollar mi propio hábito de hidratación al darme cuenta de que no bebía suficiente agua en comparación con otras bebidas. Los usuarios pueden establecer un fondo de pantalla personalizado, cambiar el color del texto, compartir la app con amigos y revisar su historial de consumo.",
          en: "A water-drinking reminder and tracker. I built it to develop my own hydration habit after realizing I wasn’t drinking enough water compared to other drinks. Users can set a custom home-screen background, change text color, share the app with friends, and review their drinking history.",
        },
        highlights: {
          es: [
            "Recordatorios con notificaciones locales y JobScheduler",
            "Persistencia local con SQLite",
            "Personalización de fondo y color de texto",
          ],
          en: [
            "Reminders via local notifications & JobScheduler",
            "Local persistence with SQLite",
            "Custom background and text color",
          ],
        },
        stack: ["Java", "XML","Android","Android Min SDK 16","Portrait Only","Multiple Activities","Fragments","System Alert Window","Local Notifications","JobScheduler","Broadcast Receivers","Boot Completed Receiver","SQLite","Firebase Realtime Database","Firebase Authentication","Firebase Cloud Messaging (FCM)","Firebase Performance Monitoring","Firebase Crashlytics","Fabric","Google AdMob (Firebase Ads)","Facebook Android SDK","Google Sign-In (Play Services Auth)","Glide","Volley","EasyPrefs","MultiDex","AndroidX AppCompat","Read/Write External Storage","Internet Access"],
        media: {
          kind: "phone",
          orientation: "portrait",
          screenshots: [
            "assets/projects/drink-water/v1/shot-1.png",
            "assets/projects/drink-water/v1/shot-2.png",
            "assets/projects/drink-water/v1/shot-3.png",
            "assets/projects/drink-water/v1/shot-4.png",
            "assets/projects/drink-water/v1/shot-5.png",
            "assets/projects/drink-water/v1/shot-6.png",
          ],
          captions: [
            { es: "Configuraciones", en: "Onboarding" },
            { es: "Inicio", en: "Home" },
            { es: "Sugerencias de bebidas", en: "Drink Suggestions" },
            { es: "Historial", en: "History" },
            { es: "Configuracion completada", en: "Onboarding completed" },
            { es: "Establecer horas activas", en: "Set active hours" },
          ],
          images: [{ src: "assets/projects/drink-water/v1/banner.jpg", label: { es: "Banner promocional", en: "Promo banner" } }],
        },
      },
      {
        label: "v2.1.0",
        sub: { es: "2026", en: "2026" },
        year: "2026",
        era: "modern",
        meta: { es: "Kotlin Multiplatform · Compose Multiplatform · Android", en: "Kotlin Multiplatform · Compose Multiplatform · Android" },
        gradient: "linear-gradient(135deg,#2d2a55,#1C8EBFFF)",
        accent: "#1C8EBFFF",
        desc: {
          es: "Reconstruida con tecnologías modernas e ideas frescas, esta versión fue rediseñada para adaptarse a múltiples tamaños de pantalla, especialmente dispositivos plegables. Los usuarios obtienen una nueva interfaz, además de nuevas funciones como copias de seguridad en la nube, una gráfica de progreso y animaciones mejoradas. Algunas ideas originales de la versión anterior fueron eliminadas o refinadas para este lanzamiento.",
          en: "Rebuilt with modern technologies and fresh ideas, this version was redesigned to adapt across many screen sizes, especially foldable devices. Users get a new UI, plus new features such as cloud-storage backups, a progress graph, and improved animations. Some original ideas from the previous version were removed or refined for this release.",
        },
        highlights: {
          es: [
            "UI adaptable a multiples tamaños de pantalla",
            "Respaldos en la nube (Google Drive)",
            "Gráficos y estadisticas de progreso",
            "Recordatorios con alarmas exactas e inexactas",
          ],
          en: [
            "Adaptive UI across multiple screen sizes",
            "Cloud backups (Google Drive)",
            "Progress graph and statistics",
            "Reminders with exact and inexact alarms",
          ],
        },
        stack: ["Kotlin", "Kotlin Multiplatform (KMP)", "Compose", "Compose Multiplatform (CMP)", "Android", "Android Min SDK 24", "Multi-module", "AI", "Claude Code", "Claude Design", "AI Skills", "Room", "DataStorage", " Dependency Injection", "Koin", "Ktor", "Kotlin Flows", "Kotlin Coroutines", "Broadcast Receiver", "Permission Handling", "Exact Alarms", "Inexact Alarms", "Local Notifications", "Work Manager", "Google Sign-In", "Dropbox SDK 7.0.0", "Google Cloud Configuration", "Google Drive API", "Google Play Console", "GitHub Actions", "CI/CD", "Renovate", "Makefile", "Convention Plugins", "Version Catalog", "Detekt", "Python", "Gradle", "Firebase Command Line Interface (CLI)", "Firebase Hosting", "Legal Website", "Google AdMob", "Google Play Age Signals", "Mixpanel", "Design System", "Material 3", "Material 3 Adaptive", "Firebase Crashlytics", "Unit Tests", "Instrumentation Tests", "Code Reviews", "RevenueCat SDK"],
        link: { label: { es: "Google Play ↗", en: "Google Play ↗" }, href: "https://play.google.com/store/apps/details?id=com.eahm.drinkwaterapp" },
        media: {
          kind: "gallery",
          // Per-shot frame via `kind`; `group` drives the filter chips. Add
          // watch/foldable/desktop entries here as those screenshots land.
          devices: [
            { kind: "phone", src: "assets/projects/drink-water/v2/phone/1.png", caption: { es: "Inicio", en: "Home" }, group: { es: "Teléfono", en: "Phone" } },
            { kind: "phone", src: "assets/projects/drink-water/v2/phone/2.png", caption: { es: "Historial", en: "History" }, group: { es: "Teléfono", en: "Phone" } },
            { kind: "phone", src: "assets/projects/drink-water/v2/phone/3.png", caption: { es: "Estadísticas", en: "Statistics" }, group: { es: "Teléfono", en: "Phone" } },
            { kind: "phone", src: "assets/projects/drink-water/v2/phone/4.png", caption: { es: "Celebraciones", en: "Celebrations" }, group: { es: "Teléfono", en: "Phone" } },

            { kind: "foldable", src: "assets/projects/drink-water/v2/foldable/1.png", caption: { es: "Inicio", en: "Home" }, group: { es: "Plegable", en: "Foldable" } },
            { kind: "foldable", src: "assets/projects/drink-water/v2/foldable/2.png", caption: { es: "Historial", en: "History" }, group: { es: "Plegable", en: "Foldable" } },
            { kind: "foldable", src: "assets/projects/drink-water/v2/foldable/3.png", caption: { es: "Estadísticas", en: "Statistics" }, group: { es: "Plegable", en: "Foldable" } },
            { kind: "foldable", src: "assets/projects/drink-water/v2/foldable/4.png", caption: { es: "Celebraciones", en: "Celebrations" }, group: { es: "Plegable", en: "Foldable" } },

            { kind: "tablet", src: "assets/projects/drink-water/v2/tablet/1.jpg", caption: { es: "Inicio", en: "Home" }, group: { es: "Tablet", en: "Tablet" } },
            { kind: "tablet", src: "assets/projects/drink-water/v2/tablet/2.jpg", caption: { es: "Historial", en: "History" }, group: { es: "Tablet", en: "Tablet" } },
            { kind: "tablet", src: "assets/projects/drink-water/v2/tablet/3.jpg", caption: { es: "Estadísticas", en: "Statistics" }, group: { es: "Tablet", en: "Tablet" } },
            { kind: "tablet", src: "assets/projects/drink-water/v2/tablet/4.jpg", caption: { es: "Celebraciones", en: "Celebrations" }, group: { es: "Tablet", en: "Tablet" } },

            { kind: "laptop", src: "assets/projects/drink-water/v2/laptop/1.png", caption: { es: "Inicio", en: "Home" }, group: { es: "Chromebook", en: "Chromebook" } },
            { kind: "laptop", src: "assets/projects/drink-water/v2/laptop/2.png", caption: { es: "Historial", en: "History" }, group: { es: "Chromebook", en: "Chromebook" } },
            { kind: "laptop", src: "assets/projects/drink-water/v2/laptop/3.png", caption: { es: "Estadísticas", en: "Statistics" }, group: { es: "Chromebook", en: "Chromebook" } },
            { kind: "laptop", src: "assets/projects/drink-water/v2/laptop/4.png", caption: { es: "Ajustes", en: "Settings" }, group: { es: "Chromebook", en: "Chromebook" } },
            { kind: "laptop", src: "assets/projects/drink-water/v2/laptop/5.png", caption: { es: "Celebraciones", en: "Celebrations" }, group: { es: "Chromebook", en: "Chromebook" } },
          ],
        },
      },
    ],
  },

  // ---------- Touch IT (App v1→v2 · Backend v1) ----------
  {
    id: "touch-it",
    glyph: "🎯",
    icon: "assets/projects/touch-it/icon.jpg",
    name: "Touch IT",
    featured: true,
    tagline: { es: "Consigue monedas, mantente con vidas y con tiempo. Cuanto puedes durar?", en: "Get coins, stay with lives and time. How long can you last?" },
    surfaces: [
      {
        label: { es: "App", en: "App" },
        versions: [
          {
            label: "v1.0.0",
            sub: { es: "2019", en: "2019" },
            year: "2019",
            era: "modern",
            meta: { es: "C# · Unity", en: "C# · Unity" },
            gradient: "linear-gradient(135deg,#142a4a,#5b8cff)",
            accent: "#5b8cff",
            desc: {
              es: "Juego arcade 2D de toques y reflejos: aparece una imagen objetivo que cambia con el tiempo y debes tocar todas las coincidencias antes de que se acabe el tiempo, evitando las incorrectas. Usa object pooling para buen rendimiento en móvil.",
              en: "A 2D reaction tap arcade game: a target image appears and changes over time; tap every match before time runs out while avoiding the wrong ones. Uses object pooling for solid mobile performance.",
            },
            highlights: {
              es: [
                "Estrategia de object pooling para rendimiento",
                "Modo 1vs1 y eventos vía Firebase Cloud Functions",
                "Tabla de líderes global y puntajes",
                "Anuncios con AdMob y Facebook SDK",
              ],
              en: [
                "Object-pooling strategy for performance",
                "1vs1 and events via Firebase Cloud Functions",
                "Global leaderboard and scores",
                "Ads with AdMob and the Facebook SDK",
              ],
            },
            stack: ["C#", "Unity", "Android", "Firebase Crashlytics", "Firebase Analytics", "FCM", "Proyecto26 REST", "AdMob", "Facebook SDK", "Object Pooler"],
            media: {
              kind: "phone",
              orientation: "portrait",
              screenshots: [
                "assets/projects/touch-it/v1/shot-1.png",
                "assets/projects/touch-it/v1/shot-2.png",
                "assets/projects/touch-it/v1/shot-3.png",
                "assets/projects/touch-it/v1/shot-4.png",
                "assets/projects/touch-it/v1/shot-5.png",
                "assets/projects/touch-it/v1/shot-6.png",
              ],
              captions: [
                { es: "Menú", en: "Menu" },
                { es: "Partida", en: "Gameplay" },
                { es: "Resultado", en: "Game over" },
                { es: "Tienda", en: "Store" },
                { es: "Ranking", en: "Leaderboard" },
                { es: "Ajustes", en: "Settings" },
              ],
              images: [
                { src: "assets/projects/touch-it/v1/feature.jpg", label: { es: "Gráfico destacado", en: "Feature graphic" } },
                { src: "assets/projects/touch-it/v1/banner.jpg", label: { es: "Banner TV", en: "TV banner" } },
              ],
            },
          },
          {
            label: "v2.0.0",
            sub: { es: "2026", en: "2026" },
            year: "2026",
            era: "modern",
            wip: true,
            meta: { es: "C# · Unity · IA", en: "C# · Unity · AI" },
            gradient: "linear-gradient(135deg,#1d2a55,#d120ff)",
            accent: "#d120ff",
            desc: {
              es: "Reconstrucción con tecnologías modernas para volver a cumplir las políticas de Play Store. El objetivo es recuperar un juego, no un gran servicio: se quitaron autenticación, líderes, 1vs1 y eventos para simplificar y permitir lanzamientos más rápidos.",
              en: "A modern rebuild to return to Play Store compliance. The goal is to bring back a game rather than a large service: auth, leaderboards, 1vs1 and events were removed to simplify and enable faster releases.",
            },
            highlights: {
              es: [
                "Experiencia simplificada y modernizada",
                "Inyección de dependencias con Zenject",
                "Mantenido con ayuda de agentes de IA"],
              en: [
                "Simplified, modernized experience",
                "Dependency injection with Zenject",
                "Maintained with AI agents help"
              ],
            },
            stack: ["C#", "Unity", "Zenject", "Claude Code", "AI Skills"],
            link: { label: { es: "Google Play ↗", en: "Google Play ↗" }, href: "#" },
            media: { kind: "none" },
          },
        ],
      },
      {
        label: { es: "Backend", en: "Backend" },
        versions: [
          {
            label: "v1.0.0",
            sub: { es: "2019", en: "2019" },
            year: "2019",
            era: "modern",
            meta: { es: "JavaScript · Firebase", en: "JavaScript · Firebase" },
            gradient: "linear-gradient(135deg,#143a3a,#ffd554)",
            accent: "#ffd554",
            desc: {
              es: "Backend en Firebase que almacena anuncios de la app, puntajes del ranking global y datos de partidas 1vs1 en tiempo real. Gestiona autenticación, configuración remota (Remote Config) y notificaciones push.",
              en: "A Firebase backend storing app announcements, global leaderboard scores and real-time 1vs1 match data. It handles authentication, remote configuration and push notifications.",
            },
            highlights: {
              es: [
                "Sincronización de partidas 1vs1 en tiempo real",
                "Ranking global y configuración remota",
                "Autenticación y notificaciones push"
              ],
              en: [
                "Real-time 1vs1 match sync",
                "Global leaderboard & remote config",
                "Authentication and push notifications"
              ],
            },
            stack: ["JavaScript", "Firebase Command Line Interface (CLI)", "Firebase Cloud Functions", "Firebase Realtime Database", "Firebase Authentication"],
            media: { kind: "none" },
          },
        ],
      },
    ],
  },

  // ---------- Infocenter (App v1→v2 · Backend v1→v2) ----------
  {
    id: "infocenter",
    glyph: "📰",
    icon: "assets/projects/infocenter/icon.png",
    name: "Infocenter",
    tagline: { es: "Noticias locales con votación · Google Play", en: "Local news with voting · Google Play" },
    surfaces: [
      {
        label: { es: "App", en: "App" },
        versions: [
          {
            label: "v1.0.0",
            sub: { es: "2017", en: "2017" },
            year: "2017",
            era: "legacy",
            meta: { es: "Java · Volley · Google Maps · minSdk", en: "Java · Volley · Google Maps · XML" },
            gradient: "linear-gradient(135deg,#2a3a1f,#ffbc39)",
            accent: "#ffbc39",
            desc: {
              es: "Mi proyecto de tesis: una plataforma informativa donde los usuarios leen y publican noticias locales confiables, con un sistema comunitario de votación que da credibilidad a cada publicación. Permite capturar fotos, etiquetar ubicación y acceso rápido a números de emergencia.",
              en: "My thesis project: an informative platform where users read and publish reliable local news, with a community voting system that gives credibility to each post. Users can capture photos, tag a location, and quickly reach emergency numbers.",
            },
            highlights: {
              es: ["Publicar y votar noticias por credibilidad", "Captura de fotos y etiquetado de ubicación", "Mapa con clustering de Google Maps", "Acceso rápido a números de emergencia"],
              en: ["Publish & vote on news for credibility", "Photo capture and location tagging", "Map with Google Maps clustering", "Quick access to emergency numbers"],
            },
            stack: ["Java", "Android", "Volley", "Google Maps", "Maps Clustering", "Glide", "Camera", "Base64", "RecyclerView", "Navigation Drawer"],
            link: { label: { es: "Google Play ↗", en: "Google Play ↗" }, href: "#" },
            media: {
              kind: "phone",
              orientation: "portrait",
              screenshots: [
                "assets/projects/infocenter/v1/shot-1.png",
                "assets/projects/infocenter/v1/shot-2.png",
                "assets/projects/infocenter/v1/shot-3.png",
                "assets/projects/infocenter/v1/shot-4.png",
                "assets/projects/infocenter/v1/shot-5.png",
                "assets/projects/infocenter/v1/shot-6.png",
              ],
              captions: [
                { es: "Noticias", en: "News feed" },
                { es: "Detalle", en: "Article" },
                { es: "Publicar", en: "Publish" },
                { es: "Mapa", en: "Map" },
                { es: "Perfil", en: "Profile" },
                { es: "Emergencias", en: "Emergency" },
              ],
            },
          },
          {
            label: "v2.0.0",
            sub: { es: "2026", en: "2026" },
            year: "2026",
            era: "modern",
            wip: true,
            meta: { es: "Kotlin · Jetpack Compose · Retrofit · Clean", en: "Kotlin · Jetpack Compose · Retrofit · Clean" },
            gradient: "linear-gradient(135deg,#143a4a,#ff5d4a)",
            accent: "#ff5d4a",
            desc: {
              es: "Cliente moderno en Jetpack Compose que consume la nueva API REST, con carga de imágenes y ubicación del dispositivo. Se mantiene de forma colaborativa con agentes de IA como prueba de trabajo.",
              en: "A modern Jetpack Compose client consuming the new REST API, with image loading and device location. Maintained collaboratively with AI agents as a proof of work.",
            },
            highlights: {
              es: ["Cliente Compose con Clean Architecture", "Consumo de API REST con Retrofit", "Carga de imágenes con Coil y ubicación"],
              en: ["Compose client with Clean Architecture", "REST API consumption with Retrofit", "Image loading with Coil and location"],
            },
            stack: ["Kotlin", "Jetpack Compose", "Material 3", "MVVM", "Clean Architecture", "Retrofit", "OkHttp", "Kotlinx Serialization", "Coil", "Claude Code"],
            media: { kind: "none" },
          },
        ],
      },
      {
        label: { es: "Backend", en: "Backend" },
        versions: [
          {
            label: "v1.0.0",
            sub: { es: "2017", en: "2017" },
            year: "2017",
            era: "legacy",
            meta: { es: "PHP · MySQL · phpMyAdmin", en: "PHP · MySQL · phpMyAdmin" },
            gradient: "linear-gradient(135deg,#3a2a1f,#ffbc39)",
            accent: "#ffbc39",
            desc: {
              es: "Servicios web para la app cliente, con almacenamiento de imágenes del lado del servidor y CRUD completo de base de datos.",
              en: "Backend web services for the client app, including server-side image storage and full database CRUD.",
            },
            highlights: {
              es: ["CRUD completo sobre MySQL", "Almacenamiento de imágenes en servidor"],
              en: ["Full CRUD over MySQL", "Server-side image storage"],
            },
            stack: ["PHP", "MySQL", "phpMyAdmin", "SQL", "HTML"],
            media: { kind: "none" },
          },
          {
            label: "v2.0.0",
            sub: { es: "2026", en: "2026" },
            year: "2026",
            era: "modern",
            wip: true,
            meta: { es: "Java 21 · Spring Boot · JPA · H2", en: "Java 21 · Spring Boot · JPA · H2" },
            gradient: "linear-gradient(135deg,#143a4a,#ff5d4a)",
            accent: "#ff5d4a",
            desc: {
              es: "API REST en Spring Boot por capas que sirve a la app cliente, con persistencia JPA sobre una base de datos H2 en memoria y almacenamiento de imágenes basado en archivos servidas como recursos estáticos.",
              en: "A layered Spring Boot REST API serving the client app, with JPA persistence on an in-memory H2 database and file-based image storage served as static resources.",
            },
            highlights: {
              es: ["Arquitectura por capas con patrón repositorio", "Persistencia JPA/Hibernate sobre H2", "DTOs y almacenamiento de imágenes en archivos"],
              en: ["Layered architecture with repository pattern", "JPA/Hibernate persistence on H2", "DTOs and file-based image storage"],
            },
            stack: ["Java 21", "Spring Boot", "Maven", "Spring Web", "Spring Data JPA", "Hibernate", "H2", "REST", "DTOs"],
            media: { kind: "none" },
          },
        ],
      },
    ],
  },

  // ---------- Infinite Platform Game (single · bg video + trailer) ----------
  {
    id: "infinite-platform-game",
    glyph: "🎮",
    icon: "assets/projects/infinite-platform-game/icon.png",
    name: "Infinite Platform Game",
    tagline: { es: "Juego 2D de plataformas · Proyecto personal", en: "2D platformer · Personal project" },
    versions: [
      {
        label: "v1.0.0",
        sub: { es: "2017", en: "2017" },
        year: "2017",
        era: "modern",
        meta: { es: "C# · Unity · AdMob · Firebase", en: "C# · Unity · AdMob · Firebase" },
        gradient: "linear-gradient(135deg,#10243a,#2a1840)",
        accent: "#6c5ce7",
        desc: {
          es: "Juego móvil 2D de plataformas y disparos construido en mi último año de universidad. Los jugadores usan gestos de deslizamiento para guiar al personaje a través de una serie de niveles.",
          en: "A 2D platformer and action-shooter mobile game built during my final year of university. Players use swipe gestures to guide the character through a series of levels.",
        },
        highlights: {
          es: ["Control por gestos de deslizamiento", "Selector de niveles, tutorial y créditos", "Monetización con Unity Ads, AdMob e IAP", "Analytics y crash reporting con Firebase"],
          en: ["Swipe-gesture controls", "Level selector, tutorial and credits", "Monetization via Unity Ads, AdMob and IAP", "Analytics and crash reporting with Firebase"],
        },
        stack: ["C#", "Unity", "Android", "Unity Ads", "AdMob", "Unity IAP", "Firebase Crashlytics", "Firebase Analytics", "Physics2D", "Particle System", "TextMeshPro"],
        media: {
          kind: "phone",
          orientation: "landscape",
          screenshots: [
            "assets/projects/infinite-platform-game/shot-1.png",
            "assets/projects/infinite-platform-game/shot-2.png",
            "assets/projects/infinite-platform-game/shot-3.png",
          ],
          captions: [
            { es: "Partida", en: "Gameplay" },
            { es: "Niveles", en: "Levels" },
            { es: "Menú", en: "Menu" },
          ],
          images: [
            { src: "assets/projects/infinite-platform-game/photo-1.jpg", label: { es: "Bocetos e ideas iniciales", en: "Initial sketches & ideas" } },
            { src: "assets/projects/infinite-platform-game/photo-2.jpg", label: { es: "Bocetos e ideas iniciales", en: "Initial sketches & ideas" } },
          ],
          bgVideo: "assets/projects/infinite-platform-game/video-bg.mp4",
          trailer: {
            provider: "file",
            src: "assets/projects/infinite-platform-game/video.mp4",
            label: { es: "Ver tráiler", en: "Watch trailer" },
          },
        },
      },
    ],
  },

  // ---------- 2D Action Game (single) ----------
  {
    id: "2d-action-game",
    glyph: "🕹️",
    icon: "assets/projects/2d-action-game/icon.png",
    name: "2D Action Game",
    tagline: { es: "Shooter de defensa 2D · Proyecto personal", en: "2D defense shooter · Personal project" },
    versions: [
      {
        label: "v1.0.0",
        sub: { es: "2018", en: "2018" },
        year: "2018",
        era: "modern",
        meta: { es: "C# · Unity · Firebase · Play Games", en: "C# · Unity · Firebase · Play Games" },
        gradient: "linear-gradient(135deg,#3a1420,#241a44)",
        accent: "#fd79a8",
        desc: {
          es: "Shooter de defensa de acción 2D. Resiste oleadas de enemigos para escalar en la tabla de puntajes y gana varias monedas del juego para comprar objetos en la tienda.",
          en: "A 2D action defense-shooter. Hold out against waves of enemies to climb the high-score table, and earn multiple in-game currencies to buy items from the store.",
        },
        highlights: {
          es: ["Oleadas de enemigos y tabla de puntajes", "Múltiples monedas y tienda en el juego", "Logros y rankings con Google Play Games", "Backend en tiempo real con Firebase"],
          en: ["Enemy waves and high-score table", "Multiple currencies and in-game store", "Achievements and leaderboards via Google Play Games", "Real-time backend with Firebase"],
        },
        stack: ["C#", "Unity", "Firebase Realtime Database", "Firebase Authentication", "FCM", "Google Play Games", "Leaderboards", "Achievements", "Unity Ads", "AdMob", "Unity IAP"],
        media: {
          kind: "phone",
          orientation: "landscape",
          screenshots: [
            "assets/projects/2d-action-game/shot-1.png",
            "assets/projects/2d-action-game/shot-2.png",
            "assets/projects/2d-action-game/shot-3.png",
          ],
          captions: [
            { es: "Partida", en: "Gameplay" },
            { es: "Tienda", en: "Store" },
            { es: "Ranking", en: "Leaderboard" },
          ],
        },
      },
    ],
  },

  // ---------- YaVoy (App · Backend, no assets) ----------
  {
    id: "yavoy",
    glyph: "🛵",
    name: "YaVoy",
    tagline: { es: "Delivery on-demand · Android nativo", en: "On-demand delivery · Native Android" },
    surfaces: [
      {
        label: { es: "App", en: "App" },
        versions: [
          {
            label: "v1.0.0",
            sub: { es: "2022", en: "2022" },
            year: "2022",
            era: "modern",
            meta: { es: "Kotlin · Compose · MVVM + Clean · multi-módulo", en: "Kotlin · Compose · MVVM + Clean · multi-module" },
            gradient: "linear-gradient(135deg,#3a1f2d,#2b2a5c)",
            accent: "#ff9a3d",
            desc: {
              es: "App nativa de marketplace y delivery on-demand, modular y con Clean Architecture. Conecta tres lados: clientes que compran en tiendas locales, repartidores con rutas por prioridad y proveedores que crean sus propias tiendas. Nació como idea para mi pueblo; no llegó a producción pero la idea sigue viva.",
              en: "A modular, clean-architecture native marketplace and on-demand delivery app. It connects three sides: customers buying from local stores, drivers building priority-based routes, and providers running their own storefronts. Born as an idea for my hometown; it never reached production, but the idea lives on.",
            },
            highlights: {
              es: ["Tres roles: cliente, repartidor y proveedor", "Carrito virtual y pedidos en tiempo real", "Rutas de entrega por prioridad y tiempo", "Arquitectura limpia y multi-módulo"],
              en: ["Three roles: customer, courier and provider", "Virtual cart and real-time orders", "Delivery routes by priority and time", "Clean, multi-module architecture"],
            },
            stack: ["Kotlin", "Jetpack Compose", "Material 3", "Multi-module", "Dagger 2", "MVVM", "Clean Architecture", "Retrofit", "OkHttp", "Moshi", "Room", "Coil", "CameraX", "QR Scanner", "FCM"],
            media: { kind: "none" },
          },
        ],
      },
      {
        label: { es: "Backend", en: "Backend" },
        versions: [
          {
            label: "v1.0.0",
            sub: { es: "2022", en: "2022" },
            year: "2022",
            era: "modern",
            meta: { es: "JavaScript · Cloud Functions · Firestore", en: "JavaScript · Cloud Functions · Firestore" },
            gradient: "linear-gradient(135deg,#143a3a,#233461)",
            accent: "#2ad8d2",
            desc: {
              es: "Provee los servicios web REST para la app cliente de YaVoy. Gestiona usuarios, productos, carritos de compra, proveedores, pedidos, direcciones y tiendas de proveedores.",
              en: "Provides the REST web services for the YaVoy client app. It manages client users, products, shopping carts, providers, orders, addresses and provider storefronts.",
            },
            highlights: {
              es: ["Servicios REST con Cloud Functions", "Datos NoSQL en Cloud Firestore", "Pedidos, carritos y tiendas de proveedores"],
              en: ["REST services with Cloud Functions", "NoSQL data on Cloud Firestore", "Orders, carts and provider storefronts"],
            },
            stack: ["JavaScript", "Firebase CLI", "Firebase Cloud Functions", "Cloud Firestore", "NoSQL"],
            media: { kind: "none" },
          },
        ],
      },
    ],
  },

  // ---------- Game Zone (single, WIP, no assets) ----------
  {
    id: "game-zone",
    glyph: "🤾",
    name: "Game Zone",
    tagline: { es: "Encuentra partidos cerca · Android", en: "Find local matches · Android" },
    versions: [
      {
        label: "v1.0.0",
        sub: { es: "2020", en: "2020" },
        year: "2020",
        era: "modern",
        wip: true,
        meta: { es: "Kotlin · Gradle · multi-módulo", en: "Kotlin · Gradle · multi-module" },
        gradient: "linear-gradient(135deg,#1b3a2e,#23284f)",
        accent: "#2ed589",
        desc: {
          es: "App para ayudar a la gente a encontrar con quién jugar partidos casuales de deportes cerca, con una forma segura de organizar encuentros locales. El desarrollo empezó en 2020 pero no llegó a producción; la idea sigue en la hoja de ruta.",
          en: "An app to help people find others for casual sports matches nearby, with a safe way to organize local meetups. Development started in 2020 but it didn't reach production; the idea is still on the roadmap.",
        },
        highlights: {
          es: ["Organización segura de encuentros locales", "Arquitectura multi-módulo en Kotlin"],
          en: ["Safe organization of local meetups", "Multi-module Kotlin architecture"],
        },
        stack: ["Android", "Kotlin", "Gradle", "Multi-module"],
        media: { kind: "none" },
      },
    ],
  },

  // ---------- Untitled Game (single, WIP, no assets) ----------
  {
    id: "untitled-game",
    glyph: "🎲",
    name: "Untitled Game",
    tagline: { es: "Plataformas narrativo multiplataforma · WIP", en: "Narrative platformer, multiplatform · WIP" },
    versions: [
      {
        label: "v1.0.0",
        sub: { es: "2025", en: "2025" },
        year: "2025",
        era: "modern",
        wip: true,
        meta: { es: "C# · Unity URP · Zenject · Ink", en: "C# · Unity URP · Zenject · Ink" },
        gradient: "linear-gradient(135deg,#241a44,#0e3a44)",
        accent: "#a99bff",
        desc: {
          es: "Plataformas narrativo 2D para múltiples plataformas (móvil, macOS y Steam, con la meta de llegar a consolas actuales). Se construye alrededor de una historia propia, un sistema de diálogos a medida y mecánicas RPG ligeras.",
          en: "A 2D narrative platformer targeting multiple platforms (mobile, macOS and Steam, aiming for current-gen consoles). It's built around a self-written story, a custom dialogue system and light RPG mechanics.",
        },
        highlights: {
          es: ["Historia propia y sistema de diálogos con Ink", "Inyección de dependencias con Zenject", "URP, Cinemachine y localización"],
          en: ["Original story and Ink dialogue system", "Dependency injection with Zenject", "URP, Cinemachine and localization"],
        },
        stack: ["C#", "Unity", "URP", "Unity Input System", "Zenject", "Ink", "Cinemachine", "NavMesh", "Localization", "iOS", "macOS", "Steam"],
        media: { kind: "none" },
      },
    ],
  },

  /* ===================== JOBS (gated by FEATURES.showJobs) ===================== */

  // ---------- elvah GmbH ----------
  {
    id: "elvah",
    glyph: "⚡",
    group: "job",
    name: "elvah GmbH",
    tagline: {
      es: "Carga de vehículos eléctricos (B2C) · 2022–2026 · Trabajé con una única base de código que evolucionó con el tiempo. Tras la adquisición de la empresa, el proyecto fue renombrado y la base de código compartida se utilizó para publicar múltiples variantes de la app",
      en: "EV charging · 2022–2026 · Worked with a single codebase that evolved over time. After the company was acquired, the project was rebranded and the shared codebase was used to deploy multiple app variants"
    },
    variants: [
      {
        label: "elvah EV Charging",
        sub: { es: "App consumer", en: "Consumer app" },
        year: "2023",
        era: "modern",
        meta: { es: "Kotlin · Jetpack Compose · Maps · Clean Arch", en: "Kotlin · Jetpack Compose · Maps · Clean Arch" },
        gradient: "linear-gradient(135deg,#46224d,#232f5e)",
        accent: "#fd79a8",
        desc: {
          es: "La app de carga de VE para el consumidor: encuentra puntos de carga cercanos en un mapa, inicia una sesión y sigue la carga en tiempo real. Construida de extremo a extremo en un codebase Kotlin modular con ~99.8% de sesiones sin fallos.",
          en: "The consumer EV-charging app: find nearby charge points on a map, start a session and track charging in real time. Built end-to-end in a modular Kotlin codebase with ~99.8% crash-free sessions.",
        },
        highlights: {
          es: ["Descubrimiento de puntos de carga en mapa", "Seguimiento de sesión de carga en vivo", "MVVM + Clean Architecture, modular"],
          en: ["Map-first charge-point discovery", "Live charging session tracking", "MVVM + Clean Architecture, modular"],
        },
        stack: ["Kotlin", "Jetpack Compose", "Google Maps", "Retrofit", "OkHttp", "Coroutines", "Flow", "Material 3", "Multi-module"],
        link: { label: { es: "elvah.de ↗", en: "elvah.de ↗" }, href: "https://elvah.de" },
        media: {
          kind: "phone",
          orientation: "portrait",
          screenshots: [
            "assets/projects/elvah/ev-charging/shot-1.png",
            "assets/projects/elvah/ev-charging/shot-2.png",
            "assets/projects/elvah/ev-charging/shot-3.png",
            "assets/projects/elvah/ev-charging/shot-4.png",
            "assets/projects/elvah/ev-charging/shot-5.png",
          ],
          captions: [
            { es: "Mapa", en: "Map" },
            { es: "Punto de carga", en: "Charge point" },
            { es: "Cargando", en: "Charging" },
            { es: "Sesiones", en: "Sessions" },
            { es: "Cuenta", en: "Account" },
          ],
        },
      },
      {
        label: "E.ON Drive Comfort",
        sub: { es: "App rebranded", en: "Rebranded app" },
        year: "2024",
        era: "modern",
        meta: { es: "Kotlin · Compose · Material 3 Adaptive", en: "Kotlin · Compose · Material 3 Adaptive" },
        gradient: "linear-gradient(135deg,#232f5e,#0e3a44)",
        accent: "#00cec9",
        desc: {
          es: "Tras la adquisición, el codebase compartido se reutilizó para desplegar la variante E.ON Drive Comfort, con su propia marca y desplegada también en varios países.",
          en: "After the acquisition, the shared codebase was reused to deploy the E.ON Drive Comfort variant — its own brand, also rolled out across several countries.",
        },
        highlights: {
          es: ["Variante de marca desde un codebase compartido", "Despliegue multi-país", "Soporte de accesibilidad (TalkBack)"],
          en: ["Brand variant from a shared codebase", "Multi-country rollout", "Accessibility support (TalkBack)"],
        },
        stack: ["Kotlin", "Jetpack Compose", "Material 3", "Material 3 Adaptive", "Accessibility", "Multi-module"],
        media: {
          kind: "phone",
          orientation: "portrait",
          screenshots: [
            "assets/projects/elvah/e-on-drive-comfort/shot-1.png",
            "assets/projects/elvah/e-on-drive-comfort/shot-2.png",
            "assets/projects/elvah/e-on-drive-comfort/shot-3.png",
            "assets/projects/elvah/e-on-drive-comfort/shot-4.png",
          ],
          captions: [
            { es: "Mapa", en: "Map" },
            { es: "Punto de carga", en: "Charge point" },
            { es: "Cargando", en: "Charging" },
            { es: "Cuenta", en: "Account" },
          ],
        },
      },
      {
        label: "E.ON Next",
        sub: { es: "Reino Unido", en: "United Kingdom" },
        year: "2025",
        era: "modern",
        meta: { es: "Kotlin · Jetpack Compose · REST", en: "Kotlin · Jetpack Compose · REST" },
        gradient: "linear-gradient(135deg,#2d2a55,#143a4a)",
        accent: "#8c7cff",
        desc: {
          es: "Variante para el mercado del Reino Unido construida sobre el mismo codebase compartido, con su identidad de marca propia.",
          en: "A variant for the UK market built on the same shared codebase, with its own brand identity.",
        },
        highlights: {
          es: ["Variante de marca para Reino Unido", "Misma base modular en Kotlin"],
          en: ["UK brand variant", "Same modular Kotlin base"],
        },
        stack: ["Kotlin", "Jetpack Compose", "Retrofit", "AWS Cognito", "Material 3", "Multi-module"],
        media: {
          kind: "phone",
          orientation: "portrait",
          screenshots: [
            "assets/projects/elvah/e-on-next/shot-1.png",
            "assets/projects/elvah/e-on-next/shot-2.png",
            "assets/projects/elvah/e-on-next/shot-3.png",
            "assets/projects/elvah/e-on-next/shot-4.png",
            "assets/projects/elvah/e-on-next/shot-5.png",
          ],
          captions: [
            { es: "Inicio", en: "Home" },
            { es: "Mapa", en: "Map" },
            { es: "Cargando", en: "Charging" },
            { es: "Tarifas", en: "Tariffs" },
            { es: "Cuenta", en: "Account" },
          ],
        },
      },
      {
        label: "elvah Charge SDK",
        sub: { es: "SDK nativo", en: "Native SDK" },
        year: "2024",
        era: "modern",
        meta: { es: "Kotlin · SDK · Jetpack Compose", en: "Kotlin · SDK · Jetpack Compose" },
        gradient: "linear-gradient(135deg,#1d2a55,#46224d)",
        accent: "#a99bff",
        desc: {
          es: "SDK nativo de Android reutilizable, consumido por múltiples apps y equipos para integrar la funcionalidad de carga de VE de elvah dentro de productos de terceros.",
          en: "A reusable native Android SDK consumed by multiple apps and teams to embed elvah's EV-charging functionality inside third-party products.",
        },
        highlights: {
          es: ["SDK reutilizable consumido por varios equipos", "API pública limpia en Jetpack Compose", "Distribuido como dependencia versionada"],
          en: ["Reusable SDK consumed by multiple teams", "Clean public API in Jetpack Compose", "Distributed as a versioned dependency"],
        },
        stack: ["Kotlin", "Android SDK", "Jetpack Compose", "Coroutines", "Flow", "Maven", "Renovate"],
        link: { label: { es: "GitHub ↗", en: "GitHub ↗" }, href: "https://github.com/elvah-hub/charge-sdk-android" },
        media: {
          kind: "phone",
          orientation: "portrait",
          screenshots: [
            "assets/projects/elvah/charge-sdk/shot-1.png",
            "assets/projects/elvah/charge-sdk/shot-2.png",
            "assets/projects/elvah/charge-sdk/shot-3.png",
            "assets/projects/elvah/charge-sdk/shot-4.png",
            "assets/projects/elvah/charge-sdk/shot-5.png",
          ],
          captions: [
            { es: "Integración", en: "Integration" },
            { es: "Mapa", en: "Map" },
            { es: "Punto de carga", en: "Charge point" },
            { es: "Cargando", en: "Charging" },
            { es: "Sesión", en: "Session" },
          ],
        },
      },
      {
        label: "E.ON Drive Comfort · Android Auto",
        sub: { es: "Android Auto", en: "Android Auto" },
        year: "2025",
        era: "auto",
        meta: { es: "Kotlin · Car App Library · plantillas", en: "Kotlin · Car App Library · templates" },
        gradient: "linear-gradient(135deg,#0e3a44,#232f5e)",
        accent: "#00cec9",
        desc: {
          es: "App de Android Auto construida desde cero sobre la Car App Library. UI por plantillas, glanceable y pensada para el coche: muestra puntos de carga cercanos y sesiones activas en la pantalla del vehículo.",
          en: "An Android Auto app built from scratch on the Car App Library. Template-driven, glanceable UI tuned for the car — surfacing nearby charge points and active sessions on the head unit.",
        },
        highlights: {
          es: ["Android for Cars App Library", "UI por plantillas, glanceable", "Construida desde cero para el head unit"],
          en: ["Android for Cars App Library", "Template-driven, glanceable UI", "Built from scratch for the head unit"],
        },
        stack: ["Kotlin", "Car App Library", "Android Auto", "Templates", "Google Maps"],
        media: {
          kind: "phone",
          orientation: "landscape",
          screenshots: [
            "assets/projects/elvah/android-auto/shot-1.png",
            "assets/projects/elvah/android-auto/shot-2.png",
            "assets/projects/elvah/android-auto/shot-3.png",
          ],
          captions: [
            { es: "Mapa", en: "Map" },
            { es: "Puntos cercanos", en: "Nearby points" },
            { es: "Sesión activa", en: "Active session" },
          ],
        },
      },
    ],
  },

  // ---------- Tecnologías Móviles Globales ----------
  {
    id: "temoglo",
    glyph: "📱",
    group: "job",
    name: "Tecnologías Móviles Globales",
    tagline: {
      es: "Apps de marca · 2017–2019 · Desarrollé y mantuve un portafolio de aplicaciones móviles personalizadas para clientes, varias de ellas compartiendo una única base de código renombrable utilizada para desplegar múltiples variantes de la aplicación",
      en: "Branded client apps · 2017–2019 · Built and maintained a portfolio of branded client apps, several by sharing a single rebrandable codebase used to deploy multiple app variants"
    },
    variants: (function () {
      // Shared stack across the rebrandable codebase (per the tech doc).
      const SHARED = ["Android", "Java", "RxJava", "MVP", "Dagger 2", "Retrofit", "OkHttp", "Gson", "Firebase", "Picasso", "Instant Apps"];
      const G = ["linear-gradient(135deg,#46224d,#232f5e)", "linear-gradient(135deg,#3a1f2d,#2b2a5c)", "linear-gradient(135deg,#14424a,#233461)", "linear-gradient(135deg,#2d2a55,#0e5b63)"];
      const A = ["#fd79a8", "#ff9a3d", "#00cec9", "#8c7cff"];
      // generic per-screen captions (es/en) — i fix these later per app
      const cap = (...pairs) => pairs.map(([es, en]) => ({ es, en }));
      const CAPS_GENERIC = cap(["Inicio", "Home"], ["Contenido", "Content"], ["Detalle", "Detail"], ["Más", "More"]);
      const mk = (i, label, sub, desc, folder, shots, stack, caps) => ({
        label,
        sub,
        year: "2018",
        era: "modern",
        meta: { es: "Android · Java · MVP · Retrofit · Firebase", en: "Android · Java · MVP · Retrofit · Firebase" },
        gradient: G[i % G.length],
        accent: A[i % A.length],
        desc,
        highlights: {
          es: ["Variante de marca desde un codebase reutilizable", "Contenido en tiempo real con Firebase", "Arquitectura MVP con Dagger 2"],
          en: ["Brand variant from a rebrandable codebase", "Real-time content with Firebase", "MVP architecture with Dagger 2"],
        },
        stack: stack || SHARED,
        media: {
          kind: "phone",
          orientation: "portrait",
          screenshots: shots.map((n) => `assets/projects/temoglo/${folder}/shot-${n}.png`),
          captions: (caps || CAPS_GENERIC).slice(0, shots.length),
        },
      });
      return [
        mk(0, "El Chelinero", { es: "Juego", en: "Game" },
            { es: "Juego móvil parte del portafolio de apps de marca de la empresa.", en: "A mobile game from the company's portfolio of branded apps." },
            "el-chelinero", [1, 2, 3, 4], ["Android", "Java", "ExoPlayer", "Firebase", "Facebook SDK", "Retrofit"],
            cap(["Menú", "Menu"], ["Partida", "Gameplay"], ["Detalle", "Detail"], ["Más", "More"])),
        mk(1, "TaxiGo / Jaime", { es: "Apps de transporte", en: "Ride-hailing apps" },
            { es: "Par de apps de transporte (conductor y cliente) con mapas, rutas y seguimiento en tiempo real.", en: "A pair of ride-hailing apps (driver and customer) with maps, routes and real-time tracking." },
            "taxigo", [1, 2, 3], ["Android", "Java", "Google Maps", "Maps Routes", "Maps Clustering", "Retrofit", "Firebase", "RxJava", "MVP", "Dagger 2"],
            cap(["Mapa", "Map"], ["Viaje", "Trip"], ["Perfil", "Profile"])),
        mk(2, "Miss Nicaragua 2018", { es: "App del certamen", en: "Pageant app" },
          { es: "App oficial del certamen Miss Nicaragua 2018: noticias, galerías de candidatas y novedades del evento.", en: "Official app for the Miss Nicaragua 2018 pageant: news, candidate galleries and event updates." },
          "miss-nicaragua-2018", [1, 2, 3, 4],
          undefined, cap(["Inicio", "Home"], ["Candidatas", "Candidates"], ["Galería", "Gallery"], ["Noticias", "News"])),
        mk(3, "Miss Nicaragua 2019", { es: "App del certamen", en: "Pageant app" },
          { es: "Edición 2019 de la app del certamen, con la misma base reutilizable y contenido actualizado.", en: "The 2019 edition of the pageant app, on the same rebrandable base with updated content." },
          "miss-nicaragua-2019", [1, 2, 3, 4],
          undefined, cap(["Inicio", "Home"], ["Candidatas", "Candidates"], ["Galería", "Gallery"], ["Noticias", "News"])),
        mk(4, "Miss Mundo Nicaragua", { es: "App del certamen", en: "Pageant app" },
          { es: "App de marca para el certamen Miss Mundo Nicaragua, con galerías y novedades del evento.", en: "Branded app for the Miss Mundo Nicaragua pageant, with galleries and event updates." },
          "miss-mundo", [1, 2, 3, 4],
          undefined, cap(["Inicio", "Home"], ["Candidatas", "Candidates"], ["Galería", "Gallery"], ["Noticias", "News"])),
        mk(5, "Carnaval Nicaragua", { es: "App de evento", en: "Event app" },
          { es: "App del evento Carnaval Nicaragua: información, agenda y novedades en tiempo real.", en: "The Carnaval Nicaragua event app: information, schedule and real-time updates." },
          "carnaval", [1, 2, 3, 4],
          undefined, cap(["Inicio", "Home"], ["Agenda", "Schedule"], ["Galería", "Gallery"], ["Noticias", "News"])),
        mk(6, "Soy Cristiano", { es: "Contenido cristiano", en: "Christian content" },
          { es: "App de contenido cristiano con lecturas, multimedia y novedades para la comunidad.", en: "A Christian-content app with readings, media and updates for the community." },
          "soy-cristiano", [1, 2, 3, 4],
          undefined, cap(["Inicio", "Home"], ["Lecturas", "Readings"], ["Multimedia", "Media"], ["Más", "More"])),
        mk(7, "Tía Florita Recipes", { es: "Recetas (concepto)", en: "Recipes (concept)" },
          { es: "App concepto de recetas: navegación por platillos, pasos e ingredientes.", en: "A recipes concept app: browse dishes, steps and ingredients." },
          "tia-florita", [1, 2, 3, 4],
          undefined, cap(["Inicio", "Home"], ["Recetas", "Recipes"], ["Pasos", "Steps"], ["Ingredientes", "Ingredients"])),
      ];
    })(),
  },
];

// Not yet wired into index.html — see Phase 3 (projects.js rewrite).
if (typeof window !== "undefined") {
  window.FEATURES = FEATURES;
  window.PROJECTS_DATA = PROJECTS;
}
