// Fuente única de verdad de locales/alias/nombres, portada literalmente de
// next-16-tailwind-4-base-app/src/i18n/routing.ts (routingConfig). Consumida
// por nuxt.config.ts (bloque `i18n`) para no duplicar esta tabla — ver
// .project_docs/i18n.md.
//
// La construcción de `pathnames` de next-intl (rutas traducidas por locale)
// no se porta aquí: es API específica de next-intl sin equivalente 1:1, y
// @nuxtjs/i18n resuelve el mismo problema con su propio bloque `pages` en
// nuxt.config.ts, a rellenar página a página según se migre cada una.
// `as const` (en vez de tipar contra una interfaz `RoutingConfig` con
// `Record<string, string>`, como en el original) para que `aliases['es-ES']`
// infiera el literal `'es'`/`'en'` en vez de `string` — @nuxtjs/i18n genera
// un tipo de locale (`"es" | "en"`) a partir del array `locales` de
// nuxt.config.ts, y necesita que `code`/`defaultLocale` casen con ese
// literal, no con `string` genérico.
export const routingConfig = {
  locales: ['es-ES', 'en-US'],
  default: 'es-ES',
  aliases: {
    'es-ES': 'es',
    'en-US': 'en',
  },
  names: {
    'es-ES': 'Español',
    'en-US': 'English',
  },
} as const
