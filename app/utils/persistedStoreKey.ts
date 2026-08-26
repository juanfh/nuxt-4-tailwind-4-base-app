// Equivalente a `${process.env.NEXT_PUBLIC_APP_NAME}-<nombre>-store` en los
// stores zustand del proyecto Next — usa runtimeConfig.public.appName en vez
// de leer process.env directo, ver nuxt.config.ts. Consumido por
// app/stores/*.ts para namespacing de la key de persistencia en localStorage.
//
// Devuelve una función (no la key ya resuelta): `persist.key` de
// pinia-plugin-persistedstate acepta `string | ((storeId: string) => string)`
// y solo invoca esa función al instanciar el store (dentro de un contexto
// Nuxt activo). Si se resolviera aquí mismo con una llamada directa a
// useRuntimeConfig(), se evaluaría en cuanto se importa el módulo del store
// (argumento de defineStore(), código de nivel superior) — antes de que
// exista una app Nuxt activa, y useRuntimeConfig() lanza
// "called outside of a plugin, Nuxt hook... setup function" (confirmado por
// smoke test, ver .project_docs/state.md).
export const persistedStoreKey = (name: string) => () => {
  const { public: { appName } } = useRuntimeConfig()
  return `${appName}-${name}-store`
}
