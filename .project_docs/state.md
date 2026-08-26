# Estado cliente (Pinia) — app/stores/

Consultar cuando: necesites saber qué estado vive en Pinia (persistido o no), qué acciones mutan ese estado, cómo se namespacea la key de persistencia en `localStorage`, o antes de añadir un store nuevo (para seguir el mismo patrón: setup store + `persist`).

Fase 6 del proyecto: port literal de `src/stores/**` (Next, zustand + `persist`/`createJSONStorage`) a Pinia (`@pinia/nuxt` + `pinia-plugin-persistedstate`). Se portan los 8 stores existentes en el proyecto Next (7 stores + `clear-stores.ts`), incluida `useSlidesStore` pese a no estar todavía documentada en el `state.md` de Next (archivo más reciente que ese doc).

## Por qué `pinia-plugin-persistedstate` (no una implementación manual)

Es el equivalente directo de `persist`+`createJSONStorage` de zustand: middleware declarativo de Pinia con soporte nativo para `key` (nombre de la entrada en storage), `pick`/`omit` (equivalente a `partialize`) y hooks `beforeHydrate`/`afterHydrate` (equivalente a `onRehydrateStorage`) — cubre 1:1 el contrato que usan los 6 stores persistidos sin reimplementar nada a mano.

**`@pinia-plugin-persistedstate/nuxt` (paquete separado) está deprecado** — desde la v4 de `pinia-plugin-persistedstate`, el propio paquete expone su módulo Nuxt en el subpath `pinia-plugin-persistedstate/nuxt` (confirmado en su `package.json`, campo `exports`). Se usa ese subpath directo en `modules` de `nuxt.config.ts`, no el paquete separado (que llegó a instalarse por error al principio de esta fase y se desinstaló).

## Tabla de stores

| Store | Archivo | Shape del estado | Acciones | Persistencia |
|---|---|---|---|---|
| `useUsersStore` | `app/stores/users-store.ts` | `{ selectedUsersIds: string[] }` | `setSelectedUsersIds`, `addUserId`, `addUsersIds`, `removeUserId`, `removeUsersIds`, `clearUsersIds` | Sí, `localStorage`, key `` `${appName}-users-store` `` |
| `useNewsStore` | `app/stores/news-store.ts` | `{ selectedNewsIds: string[] }` | Mismo patrón que `useUsersStore` (singular `NewId`, plural `NewsIds`) | Sí, key `` `${appName}-news-store` `` |
| `useProductsStore` | `app/stores/products-store.ts` | `{ selectedProductsIds: string[] }` | Mismo patrón | Sí, key `` `${appName}-products-store` `` |
| `useFaqsStore` | `app/stores/faqs-store.ts` | `{ selectedFaqsIds: string[] }` | Mismo patrón | Sí, key `` `${appName}-faqs-store` `` |
| `useSlidesStore` | `app/stores/slides-store.ts` | `{ selectedSlidesIds: string[] }` | Mismo patrón | Sí, key `` `${appName}-slides-store` `` |
| `useCookiesStore` | `app/stores/cookies-store.ts` | `{ hasHydrated, watch, waca, wacf, wacp }` (watch=técnicas, waca=analíticas, wacf=funcionalidad/personalización, wacp=publicitarias) | `setHasHydrated(value)`, `setStoreCookie(type, value)` (setter genérico por nombre de campo string) | Sí, key `` `${appName}-cookies-store` ``. `persist.pick: ['watch','waca','wacf','wacp']` (solo estos 4, nunca `hasHydrated`) + `persist.afterHydrate` marca `hasHydrated = true` |
| `useGlobalLoading` | `app/stores/loading-store.ts` | `{ globalLoading, globalLoadingMessage, localLoading, provincesLoading }` | `showGlobalLoading(message?)`/`hideGlobalLoading()`, `showLocalLoading()`/`hideLocalLoading()`, `showProvincesLoading()`/`hideProvincesLoading()` | No — sin opción `persist`, igual que el original (sin middleware) |

Los 5 stores de selección de ids (`users`/`news`/`products`/`faqs`/`slides`) son deliberadamente 5 archivos casi idénticos, no una factoría genérica — mismo criterio que el original en Next (tampoco los abstrae).

**`useSlidesStore` ganó su primer consumidor real** en el port del dominio `carousel`/`slides` (`Slides.vue`, columna de selección de `DataTable`) — hasta entonces era el único de los 5 stores de selección sin ningún componente que lo usara (portado por adelantado, ver nota de la Fase 6 arriba). Sin cambios en el store en sí, solo deja de estar "sin consumidor".

## Setup stores (Composition API), no Options API

Todos los stores usan la sintaxis "setup store" de Pinia (`defineStore(id, () => {...}, options)`) con `ref`/`reactive` + funciones, en vez de la sintaxis Options (`{ state, actions }`). Es la traducción más directa del patrón zustand `create((set, get) => ({...}))` — cada acción muta directamente los `ref`s capturados por closure, igual que `set`/`get` mutan el store de zustand.

`useCookiesStore` usa `reactive` (no `ref`s individuales) + `toRefs` en el `return`, para poder replicar el setter genérico original `setStoreCookie(type: string, value: boolean)` con asignación dinámica por nombre de campo (`state[type] = value`) — el resto de stores usan `ref`s individuales porque no necesitan ese patrón.

## Namespacing de la key de persistencia: `runtimeConfig.public.appName`

El original arma la key con `${process.env.NEXT_PUBLIC_APP_NAME}-<nombre>-store`. Next inlinea cualquier env var con prefijo `NEXT_PUBLIC_` al bundle de cliente en build-time; Nuxt **no** expone `process.env` al cliente de ese modo — hace falta `runtimeConfig.public`, poblado por convención desde `NUXT_PUBLIC_APP_NAME` (`nuxt.config.ts`, ver también `.env.example`).

`app/utils/persistedStoreKey.ts` centraliza esto:

```ts
export const persistedStoreKey = (name: string) => () => {
  const { public: { appName } } = useRuntimeConfig()
  return `${appName}-${name}-store`
}
```

Cada store lo usa como `persist: { key: persistedStoreKey('users') }`.

## ⚠️ Gotcha: `persist.key` debe ser una función, no un string ya resuelto

`persistedStoreKey('users')` **no** devuelve la key ya calculada — devuelve una función `() => string`. Es intencional: `persist.key` de `pinia-plugin-persistedstate` acepta `string | ((storeId: string) => string)`, y la variante función solo se invoca al instanciar el store (dentro de un contexto Nuxt activo). El primer intento de esta fase pasaba la key ya resuelta (`persistedStoreKey('users')` llamando a `useRuntimeConfig()` directamente y devolviendo el string), lo que la evaluaba en cuanto se importaba el módulo del store — argumento de nivel superior de `defineStore()`, antes de que exista una app Nuxt activa — y explotaba en **todo** SSR request con `"A composable that requires access to the Nuxt instance was called outside of a plugin, Nuxt hook, Nuxt middleware, or Vue setup function"`. Detectado por smoke test manual (una ruta temporal cargada con `curl` devolvía 500 en cada request), no por `tsc`. Corregido devolviendo la función sin invocar.

## Storage global: `localStorage`, no `cookies` (el default del módulo)

El módulo Nuxt de `pinia-plugin-persistedstate` usa **cookies** como storage por defecto si no se configura explícito — distinto del original, que usa `createJSONStorage(() => localStorage)` en los 6 stores persistidos. Se fuerza a nivel global en `nuxt.config.ts`:

```ts
piniaPluginPersistedstate: {
  storage: 'localStorage',
},
```

## `hasHydrated` — mismo patrón anti-flash de hidratación, sin consumidores todavía

`persist.pick` es el equivalente de `partialize`: en `useCookiesStore`, solo `watch`/`waca`/`wacf`/`wacp` se escriben en `localStorage`, nunca `hasHydrated`. `persist.afterHydrate` es el equivalente de `onRehydrateStorage`: marca `hasHydrated = true` justo después de aplicar el estado leído de `localStorage` sobre el store.

El propósito original (evitar que la UI confíe en `watch/waca/wacf/wacp` antes de que la hidratación desde `localStorage` haya terminado, para no arrastrar un flash del valor por defecto) se preserva estructuralmente, pero **sin componentes que lo consuman todavía** — `CookiesConfigurator`/`CookiesConsent` no están portados (pertenecen a una fase de componentes de dominio). Cuando se porten, deben esperar a `hasHydrated === true` antes de leer `watch`/`waca`/`wacf`/`wacp`, igual que el original.

## `clear-stores.ts` — reset global (típico de logout)

`app/stores/clear-stores.ts`, port literal de `src/stores/clear-stores.ts`:

- `clearAllStores()`: llama a `useUsersStore().clearUsersIds()`.
- `clearStores` (objeto): `{ clearUsers: () => useUsersStore().clearUsersIds() }`.

**Sin consumidores, igual que el original** (código preparado para un flujo de logout aún no conectado) — no se conecta nada nuevo en esta fase.

El original accede al store fuera de un componente vía `useUsersStore.getState()` (patrón imperativo de zustand, el hook expone el store como propiedad estática). El equivalente en Pinia es llamar directamente al composable del store (`useUsersStore()`) — devuelve la misma instancia singleton mientras haya una Pinia activa (`@pinia/nuxt` la instala globalmente en cada request/app), sin necesitar un `.getState()` explícito ni ningún adaptador.

## Auto-import

`@pinia/nuxt` resuelve `storesDirs` por defecto a `<srcDir>/stores` (`app/stores/` en este proyecto, con `srcDir: app/` como en el resto de capas) y auto-importa toda exportación de `defineStore` ahí dentro — mismo mecanismo que usan `shared/types/`/`shared/utils/` (auto-import de Nuxt), no una convención propia de esta fase. `clearAllStores`/`clearStores` (que no son `defineStore`, son funciones sueltas) también quedan auto-importadas por vivir en el mismo directorio escaneado.

## Verificación de esta fase

- `npx nuxt build` limpio.
- `tsc --noEmit` limpio contra `.nuxt/tsconfig.{app,server,shared}.json` (mismo ruido preexistente de `.vue` sin `vue-tsc`, no relacionado).
- Smoke test manual con una página temporal (`_smoke-test-stores.vue`, eliminada tras verificar) cargada en Chrome headless real (no solo `curl`, que no ejecuta JS de cliente ni tiene `localStorage`):
  - 1ª carga (`?seed=1`): añade un id a `useUsersStore` y activa `watch` en `useCookiesStore` — confirma que las acciones mutan el estado y que `hasHydrated` es `true` tras el mount.
  - 2ª carga (mismo perfil de Chrome, sin `?seed=1`, sin volver a mutar nada): el id y `watch=true` siguen presentes — confirma rehidratación real desde `localStorage` entre cargas de página, no solo estado en memoria.
  - Dump de `localStorage` completo en la 2ª carga confirmó las keys exactas: `MyNuxtApp-users-store: {"selectedUsersIds":["smoke-test-id"]}` y `MyNuxtApp-cookies-store: {"watch":true,"waca":false,"wacf":false,"wacp":false}` — key namespacing correcto y `pick` excluyendo `hasHydrated` correctamente.
  - Este smoke test fue el que detectó el gotcha de `persist.key` documentado arriba (SSR devolvía 500 antes del fix).

## Fuera de alcance de esta fase (pendiente)

- Ningún componente de dominio consume estos stores todavía (`Users.tsx`/`News.tsx`/`Products.tsx`/`Faqs.tsx`/`ActionButton.tsx`/`CookiesConfigurator.tsx`/`CookiesConsent.tsx`/`GlobalLoading.tsx`/`SelectProvince.tsx`/`SelectCommunity.tsx`/`GoogleMap.tsx`/`Player.tsx` del proyecto Next) — se conectan fase a fase según el dominio que se migre, igual que el resto de capas.
- `clearAllStores`/`clearStores` siguen sin consumidor real, igual que en Next.
