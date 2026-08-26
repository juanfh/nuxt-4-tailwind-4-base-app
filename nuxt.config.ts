import tailwindcss from '@tailwindcss/vite'
import { routingConfig } from './app/i18n/routing'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  /* vue-advanced-cropper necesita este CSS global: sin él, el stencil y las handles de recorte de ImageCropDialog.vue pierden su posicionamiento. */
  css: ['~/assets/css/main.css', 'vue-advanced-cropper/dist/style.css'],

  /* 
  Solo domain/ y common/ tienen auto-import de componentes. ui/* se excluye porque cada carpeta ui/* tiene un index.ts junto al .vue que
  colisiona con el mismo nombre de auto-import si Nuxt lo escanea (warning NUXT_B3011) — se importa siempre explícito. 
  */
  components: [
    { path: '~/components/domain', pathPrefix: false },
    { path: '~/components/common', pathPrefix: false },
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  /* 
  Poblado desde NUXT_PUBLIC_APP_NAME/NUXT_PUBLIC_CAPTCHA_SITE_KEY: Nuxt no expone process.env al cliente, así que cualquier valor que necesite
  llegar al bundle de cliente (namespacing de localStorage en app/stores/*, site key de reCAPTCHA en Recaptcha.vue) debe pasar por
  aquí. `CAPTCHA_SECRET_KEY` es server-only y se lee directo de process.env en server/utils/captcha.ts, nunca por aquí. 
  */
  runtimeConfig: {
    public: {
      appName: '',
      captchaSiteKey: '',
    },
  },

  modules: ['@nuxtjs/color-mode', '@nuxtjs/i18n', '@sidebase/nuxt-auth', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt'],

  /* 
  `preference` fijo (nunca 'system', el default del módulo): ThemeToggle.vue solo alterna claro/oscuro, sin una opción "seguir al sistema".
  `storageKey` se lee directo de process.env (contexto Node de nuxt.config.ts, nunca bundleado al cliente) en vez de runtimeConfig.public. 
  */
  colorMode: {
    preference: process.env.NUXT_PUBLIC_DEFAULT_THEME || 'dark',
    storageKey: `${process.env.NUXT_PUBLIC_APP_NAME}-theme`,
  },

  /* 'localStorage', no 'cookies' (default del módulo): los stores de app/stores/* esperan localStorage. */
  piniaPluginPersistedstate: {
    storage: 'localStorage',
  },

  /* `iso` es el locale completo (es-ES/en-US, para <html lang>); `code` es el alias corto (es/en) que @nuxtjs/i18n usa como prefijo de URL. */
  i18n: {
    /* 
    Por defecto @nuxtjs/i18n resuelve `langDir` relativo a rootDir, no a srcDir (app/) — sin 
    esto crearía un `i18n/` nuevo en la raíz del repo en vez de usar app/i18n/. 
    */
    restructureDir: 'app/i18n',
    langDir: 'locales',
    defaultLocale: routingConfig.aliases[routingConfig.default],
    strategy: 'prefix_except_default',
    locales: routingConfig.locales.map(locale => ({
      code: routingConfig.aliases[locale],
      iso: locale,
      name: routingConfig.names[locale],
      file: `${routingConfig.aliases[locale]}.json`,
    })),
    /* 
    ⚠️ Gotcha: sin este flag, `@nuxtjs/i18n` v10 ignora por completo el bloque `pages` de aquí abajo (espera un macro `defineI18nRoute()` en
    cada page.vue) y las rutas traducidas (`/panel/usuarios`) no se registran (VUE_ROUTER_R0004). 
    */
    customRoutes: 'config',
    /* 
    Las claves son nombres de ruta de Nuxt (derivados de la estructura de app/pages/**); los valores deben 
    coincidir con nav.*.link de app/i18n/locales/*.json. 
    */
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
      news: {
        es: '/noticias',
        en: '/news',
      },
      'news-slug': {
        es: '/noticias/[slug]',
        en: '/news/[slug]',
      },
      faqs: {
        es: '/preguntas-frecuentes',
        en: '/faqs',
      },
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

  /* 
  Provider `authjs` (envuelve next-auth v4), no `local` (cookies de sesión propias de Nitro). 
  `authOptions` vive en server/utils/authOptions.ts, registrado por server/api/auth/[...].ts. 
  */
  auth: {
    baseURL: '/api/auth',
    provider: {
      type: 'authjs',
    },
  },
})