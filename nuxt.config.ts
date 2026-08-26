import tailwindcss from '@tailwindcss/vite'
import { routingConfig } from './app/i18n/routing'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // 'vue-advanced-cropper/dist/style.css': estilos base del cropper usado por
  // ImageCropDialog.vue (Fase 8, tarea pendiente resuelta) — sin este import
  // global el stencil/las handles de recorte no tienen posicionamiento
  // (position: absolute, etc.), ver .project_docs/components.md.
  css: ['~/assets/css/main.css', 'vue-advanced-cropper/dist/style.css'],

  // Auto-import de componentes solo para domain/ y common/: las primitivas de
  // ui/ siguen la convención shadcn de import explícito (import { Button }
  // from '@/components/ui/button'), nunca <UiButton> global — y cada carpeta
  // ui/* tiene un index.ts junto al .vue que, si Nuxt la escanea, colisiona
  // en el mismo nombre de auto-import (warning NUXT_B3011). Ver design_system.md.
  components: [
    { path: '~/components/domain', pathPrefix: false },
    { path: '~/components/common', pathPrefix: false },
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  // Expuesto al cliente (equivalente a NEXT_PUBLIC_APP_NAME en Next): a
  // diferencia de Next, que inlinea cualquier env var con prefijo
  // NEXT_PUBLIC_ al bundle en build-time, Nuxt no expone process.env al
  // cliente automáticamente — hace falta runtimeConfig.public, poblado desde
  // NUXT_PUBLIC_APP_NAME por convención de nombres de Nuxt. Usado por los
  // stores persistidos (app/stores/*) para namespacing de la key de
  // localStorage, ver .project_docs/state.md.
  runtimeConfig: {
    public: {
      appName: '',
      // Site key de reCAPTCHA v3, expuesto al cliente (Recaptcha.vue,
      // app/utils/captcha.ts) — equivalente a NEXT_PUBLIC_CAPTCHA_SITE_KEY en
      // next-16-tailwind-4-base-app, mismo criterio que appName (decisión 33
      // de CLAUDE.md): runtimeConfig.public en vez de process.env directo,
      // que Nuxt no expone al bundle de cliente. `CAPTCHA_SECRET_KEY` (server
      // -only, verifyCaptchaToken en server/utils/captcha.ts) sí se lee
      // directo de process.env, igual que API_URL — ver .env.example.
      captchaSiteKey: '',
    },
  },

  modules: ['@nuxtjs/color-mode', '@nuxtjs/i18n', '@sidebase/nuxt-auth', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt'],

  // Equivalente a next-themes (ThemeProvider en src/app/[locale]/layout.tsx
  // del proyecto Next): `preference` fijo a un valor concreto (nunca
  // 'system', el default del propio módulo) replica `enableSystem={false}` —
  // ThemeToggle.vue solo alterna claro/oscuro, sin una tercera opción "seguir
  // al sistema". El valor por defecto (primera visita, sin nada en
  // localStorage) replica `defaultTheme={NEXT_PUBLIC_DEFAULT_THEME ?? "dark"}`.
  // classPrefix/classSuffix se dejan en su default ('' ambos): el módulo
  // añade la clase exacta "dark"/"light" a <html>, que es lo que ya espera
  // `@custom-variant dark (&:where(.dark, .dark *))` en main.css (preparado
  // desde la Fase 2 a la espera de este theme switcher, ver CLAUDE.md).
  // `storageKey` namespaced por app, igual que `storageKey={`${NEXT_PUBLIC_APP_NAME}-theme`}`
  // del original — leído directo de process.env (evaluado en nuxt.config.ts,
  // contexto Node, nunca bundleado al cliente), mismo criterio que API_URL
  // (decisión 19 de CLAUDE.md), no vía runtimeConfig.public.
  colorMode: {
    preference: process.env.NUXT_PUBLIC_DEFAULT_THEME || 'dark',
    storageKey: `${process.env.NUXT_PUBLIC_APP_NAME}-theme`,
  },

  // Storage global 'localStorage' (no 'cookies', el default del módulo) para
  // que la persistencia de app/stores/* replique fielmente
  // createJSONStorage(() => localStorage) de zustand en el proyecto Next.
  // Ver .project_docs/state.md.
  piniaPluginPersistedstate: {
    storage: 'localStorage',
  },

  // Misma estrategia que next-intl (routing.ts + proxy.ts) en Next: locales
  // completos (es-ES/en-US) como `iso` para <html lang> y SEO, alias cortos
  // (es/en) como `code` — el `code` es lo que @nuxtjs/i18n usa como prefijo
  // de URL, jugando el mismo rol que `routingConfig.aliases` en Next. La
  // detección de idioma del navegador y el prefijo condicional los resuelve
  // el propio módulo (equivalente a next-intl/middleware vía proxy.ts) — no
  // hace falta un app/middleware/*.ts propio. Ver .project_docs/i18n.md.
  i18n: {
    // @nuxtjs/i18n resuelve `restructureDir` siempre relativo a rootDir, no a
    // srcDir (app/) — por defecto buscaría un `i18n/` en la raíz del repo,
    // sibling a app/server/shared. Se apunta explícitamente a `app/i18n` para
    // mantener la correspondencia de carpetas ya documentada en CLAUDE.md
    // (app/i18n/ ← src/i18n/), en vez de crear una carpeta `i18n/` nueva en
    // la raíz que rompería esa tabla.
    restructureDir: 'app/i18n',
    langDir: 'locales',
    defaultLocale: routingConfig.aliases[routingConfig.default],
    strategy: 'prefix_except_default', // equivalente a localePrefix: 'as-needed' en Next
    locales: routingConfig.locales.map(locale => ({
      code: routingConfig.aliases[locale],
      iso: locale,
      name: routingConfig.names[locale],
      file: `${routingConfig.aliases[locale]}.json`,
    })),
    // ⚠️ Gotcha: por defecto `@nuxtjs/i18n` v10 resuelve rutas traducidas en
    // modo `customRoutes: 'page'` — espera un macro `defineI18nRoute()`
    // dentro de cada page.vue, e IGNORA por completo el bloque `pages` de
    // aquí abajo (confirmado leyendo node_modules/@nuxtjs/i18n/dist/module.mjs,
    // normalizeRouteMeta/getConfigValue: solo lee `options.pages` cuando
    // `mode === "config"`). Sin este flag, `/panel/usuarios` daba
    // VUE_ROUTER_R0004 (ninguna ruta registrada) mientras que la ruta cruda
    // sin traducir (`/dashboard/users`) sí respondía — confirmado en el
    // smoke test de la Fase 8. `customRoutes: 'config'` activa el modo que sí
    // consulta este objeto, evitando repetir `defineI18nRoute()` en cada
    // page.vue (mismo objetivo que `pathnames` centralizado en next-intl).
    customRoutes: 'config',
    // Primer contenido real del bloque `pages` (equivalente a `pathnames` de
    // next-intl/routing.ts) — hasta la Fase 8 solo existía el placeholder
    // `index.vue`. Los nombres de ruta (`dashboard-users`, `dashboard-users-new`,
    // `dashboard-users-id`) los genera Nuxt a partir de app/pages/dashboard/users/
    // {index,new,[id]}.vue; los valores coinciden literalmente con
    // nav.users.link/nav.users.new.link de app/i18n/locales/*.json.
    pages: {
      'dashboard-users': {
        es: '/panel/usuarios',
        en: '/dashboard/users',
      },
      'dashboard-users-new': {
        es: '/panel/usuarios/nuevo',
        en: '/dashboard/users/new',
      },
      'dashboard-users-id': {
        es: '/panel/usuarios/[id]',
        en: '/dashboard/users/[id]',
      },
      // Port del dominio `news` (mismo patrón que dashboard-users-*): valores
      // literales de nav.dashboard_news.link/nav.dashboard_news.new.link.
      'dashboard-news': {
        es: '/panel/noticias',
        en: '/dashboard/news',
      },
      'dashboard-news-new': {
        es: '/panel/noticias/nueva',
        en: '/dashboard/news/new',
      },
      'dashboard-news-id': {
        es: '/panel/noticias/[id]',
        en: '/dashboard/news/[id]',
      },
      // Port del dominio `faqs` (mismo patrón que dashboard-users-*/dashboard-news-*):
      // valores literales de nav.dashboard_faqs.link/nav.dashboard_faqs.new.link.
      'dashboard-faqs': {
        es: '/panel/preguntas-frecuentes',
        en: '/dashboard/faqs',
      },
      'dashboard-faqs-new': {
        es: '/panel/preguntas-frecuentes/nueva',
        en: '/dashboard/faqs/new',
      },
      'dashboard-faqs-id': {
        es: '/panel/preguntas-frecuentes/[id]',
        en: '/dashboard/faqs/[id]',
      },
      // Port del dominio `carousel`/`slides` (mismo patrón que
      // dashboard-users-*/dashboard-news-*/dashboard-faqs-*): valores
      // literales de nav.dashboard_carousel.link/nav.dashboard_carousel.new.link.
      'dashboard-carousel': {
        es: '/panel/carrusel',
        en: '/dashboard/carousel',
      },
      'dashboard-carousel-new': {
        es: '/panel/carrusel/nuevo',
        en: '/dashboard/carousel/new',
      },
      'dashboard-carousel-id': {
        es: '/panel/carrusel/[id]',
        en: '/dashboard/carousel/[id]',
      },
      // Primera pieza de la parte pública de `news` (listado + detalle):
      // valores literales de nav.news.link (`app/pages/news/index.vue` →
      // nombre de ruta `news`) y su sub-ruta de detalle por slug
      // (`app/pages/news/[slug].vue` → nombre de ruta `news-slug`).
      news: {
        es: '/noticias',
        en: '/news',
      },
      'news-slug': {
        es: '/noticias/[slug]',
        en: '/news/[slug]',
      },
      // Parte pública de `faqs` (listado único, sin detalle por id/slug):
      // valor literal de nav.faqs.link (`app/pages/faqs/index.vue` → nombre
      // de ruta `faqs`).
      faqs: {
        es: '/preguntas-frecuentes',
        en: '/faqs',
      },
      // Sección (auth) — login/signup/reset/activate: valores literales de
      // nav.login.link/nav.signup.link/nav.reset.link/nav.activate.link.
      login: {
        es: '/iniciar-sesion',
        en: '/login',
      },
      signup: {
        es: '/crear-cuenta',
        en: '/sign-up',
      },
      reset: {
        es: '/restablecer-contrasena',
        en: '/reset-password',
      },
      activate: {
        es: '/activar-cuenta',
        en: '/activate-account',
      },
      // Perfil/contraseña de mi-cuenta: valores literales de
      // nav.account.link/nav.account.profile.link/nav.account.password.link.
      account: {
        es: '/mi-cuenta',
        en: '/my-account',
      },
      'account-profile': {
        es: '/mi-cuenta/perfil',
        en: '/my-account/profile',
      },
      'account-password': {
        es: '/mi-cuenta/contrasena',
        en: '/my-account/password',
      },
    },
  },

  // Provider `authjs`: @sidebase/nuxt-auth envuelve next-auth v4 (mismo
  // paquete que usa el proyecto Next) en vez de usar su provider `local`
  // (que implementaría cookies de sesión propias de Nitro) — requisito
  // explícito de la Fase 5, ver .project_docs/auth.md. `authOptions` (el
  // equivalente de src/app/[locale]/api/auth/authOptions.ts) vive en
  // server/utils/authOptions.ts, registrado por server/api/auth/[...].ts.
  auth: {
    baseURL: '/api/auth',
    provider: {
      type: 'authjs',
    },
  },
})