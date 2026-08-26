# Tests — nuxt-4-tailwind-4-base-app

Consultar cuando: necesites saber cómo está configurado el entorno de tests (Vitest + Testing Library Vue + MSW + `@nuxt/test-utils`), qué patrón siguen los tests existentes o cómo ejecutarlos/generar cobertura. Ver la nota equivalente en `next-16-tailwind-4-base-app/.project_docs/tests.md` — mismo objetivo (Vitest + Testing Library + MSW), adaptado a que Nuxt, a diferencia de Next, resuelve gran parte de sus composables/componentes vía **auto-imports** en vez de imports explícitos, lo que exige una pieza adicional (`@nuxt/test-utils`) que Next no necesita.

## Configuración (`vitest.config.ts`)

- `defineVitestConfig` de `@nuxt/test-utils/config`, no `defineConfig` de `vitest/config` a secas: carga la config real de `nuxt.config.ts` y deriva de ahí el `resolve`/alias de Vite — es lo que permite que los tests de `shared/`/`server/` resuelvan `#shared/...` exactamente igual que en código de app, sin duplicar esa tabla de alias a mano.
- `environment: "jsdom"` global (igual que Next), con `environmentOptions.nuxt.domEnvironment: "jsdom"` para que el entorno `nuxt` (ver más abajo) comparta el mismo DOM en vez del `happy-dom` por defecto del módulo.
- `setupFiles: ["./test/setup.ts"]`.
- `include`: `app/**/*.test.ts`, `server/**/*.test.ts`, `shared/**/*.test.ts`.
- Cobertura con provider `v8`, reporters `text` + `html`, excluyendo `app/pages/**`, `app/layouts/**`, `app/middleware/**`, `app/i18n/**`, `app/plugins/**`, `shared/types/**`, `app/components/ui/**` y `app/components/common/**` (mismo criterio que Next: `ui/`/`common/` se testean indirectamente a través de los componentes de dominio que los usan, sin exigirles cobertura propia).

## `test/setup.ts` / `test/msw/server.ts`

Port literal del setup de Next (MSW en modo estricto `onUnhandledRequest: "error"`, `cleanup()` de Testing Library + `server.resetHandlers()` + `vi.restoreAllMocks()` en `afterEach`), con una diferencia: **sin el polyfill de `Range`/`getBoundingClientRect` de ProseMirror** — el slice de `users` de la Fase 9 no usa `AppRichTextEditor` (`UserForm` no tiene campos rich text). Se añadirá si una fase futura testea un formulario que sí lo use (`NewForm`/`ProductForm`, ver `components.md`).

## ⚠️ Gotcha central de esta fase: auto-imports de Nuxt bajo Vitest

Los tests de `server/services/**` y `shared/mappers/**` no necesitan nada especial: esos archivos usan imports explícitos/relativos (igual que en Next), así que un `vi.mock("./ruta", ...)` normal basta.

Los componentes `.vue`, en cambio, usan composables (`useI18n`, `useRouter`, `useLocalePath`, `useClientSessionUser`...) y otros componentes (`AppButton`, `DataTable`, `AppPagination`...) **sin ninguna sentencia `import`** — Nuxt los inyecta en build-time. No hay una ruta de módulo que interceptar con `vi.mock`, a diferencia de `next-intl`/`next/navigation` en Next (imports explícitos ahí sí). Herramientas usadas, todas de `@nuxt/test-utils/runtime`:

| Herramienta | Equivalente Next | Uso |
|---|---|---|
| `mockNuxtImport(name, factory)` | `vi.mock("next-intl", ...)` | Sustituye un auto-import de Nuxt (composable) por un mock. Debe llamarse a nivel de módulo (se hoistea como `vi.mock`); las variables que capture su factory deben venir de `vi.hoisted(...)`, igual que en Next. |
| `mockComponent(name, options)` | `vi.mock("./NumPages", ...)` (stub de componente hijo) | Sustituye un componente auto-importado (o una ruta relativa) por un stub. Su `template` se compila en runtime (compilador in-browser de Vue): **no acepta sintaxis TypeScript** (`as HTMLInputElement`, etc.) dentro del `template`, solo en el `setup()`. |
| `registerEndpoint(url, handler)` | — (sin equivalente: Next no tiene una capa `server/api/`) | Mockea un endpoint Nitro para que `$fetch`/`useFetch` lo resuelvan sin red real. No se ha necesitado en el slice de `users`: los componentes llaman a `$fetch` directo (mockeado vía `mockNuxtImport('$fetch', ...)`), sin pasar por `useFetch` con SSR. |
| `renderSuspended(component, options)` | `render(...)` de `@testing-library/react` | Wrapper de `render` de `@testing-library/vue` que monta el componente dentro de un contexto Nuxt real (con `<Suspense>`, útil si el componente tiene `await` top-level). `screen`/`waitFor`/etc. de `@testing-library/vue` funcionan igual después. `options.route` fija la ruta inicial (acepta `RouteLocationRaw`, útil para precargar `route.query`). |

Activar este entorno por archivo: comentario `// @vitest-environment nuxt` en la primera línea del `.test.ts` (no en todos — los de `server/services/**`/`shared/mappers/**` se quedan en el `jsdom` plano por defecto, más rápidos).

### `useRouter()`/`useRoute()`: no mockear con `mockNuxtImport`

A diferencia de `useI18n()`/`useLocalePath()` (mockeables sin problema), mockear `useRouter` entero rompe el propio arranque interno de `@nuxt/test-utils` (`useRouter().afterEach is not a function` / `router.beforeResolve is not a function`: el entorno `nuxt` necesita la instancia real de vue-router para su propio ciclo de vida). Patrón usado en su lugar: importar `useRouter`/`useRoute` explícitos desde `#imports` en el test y usar el router **real** (`vi.spyOn(useRouter(), 'push')`/`'back'`), pasando `route` a `renderSuspended` para fijar `route.query` inicial en vez de asignar `route.query = {...}` a mano (el objeto de ruta es un proxy reactivo de solo lectura, esa asignación lanza `'set' on proxy: trap returned falsish`).

### `AppToast`: identificador libre en `<script setup>`, no un auto-import registrado

`app/components/common/AppToast.vue` no tiene `<template>` — es un `.vue` que solo exporta un objeto plano (`export const AppToast = {...}`, ver [[design_system]]). El código de producción lo usa como identificador libre (`AppToast.success(...)`, nunca como tag `<AppToast/>`). En la app real (`nuxt dev`/`nuxt build`) esto resuelve bien; bajo el entorno `nuxt` de `@nuxt/test-utils`, **no**:

- `mockNuxtImport('AppToast', ...)` falla con `Error: Cannot find import "AppToast" to mock` — no está en el registro de auto-imports que la herramienta inspecciona.
- Sin ningún mock, el componente lanza `ReferenceError: AppToast is not defined` al ejecutarse (confirmado: el resto de componentes de la misma plantilla, p.ej. `AppButton` usado como tag, sí resuelven bien — la brecha es específica de identificadores libres de `<script setup>`, no del resto del pipeline de componentes).

Fix usado: `vi.stubGlobal('AppToast', { success: ..., error: ... })` antes de renderizar. Un identificador libre sin declarar en un módulo ES (siempre en modo estricto) sí se resuelve contra el objeto global si existe ahí como propiedad — igual que `window`/`document` — así que `vi.stubGlobal` (que asigna sobre `globalThis`, aquí el `window` de jsdom) funciona donde `mockNuxtImport` no puede. No se ha tocado el componente de producción: es una limitación del entorno de test, no un bug de la app.

## Bug real encontrado por esta fase: `UserForm.vue` / `canManageRole`

Escribiendo el test "muestra el select de rol solo para superadmin", `sessionUser.value?.role` en `UserForm.vue` devolvía siempre `undefined` → `canManageRole` era **permanentemente `false`**, para cualquier rol, incluido superadmin. Causa: `useClientSessionUser()` (`app/composables/useClientSessionUser.ts`) desreferencia `session.value` (el ref real de `useAuth()`) **dentro** del composable y devuelve `user` ya como valor plano, no como ref — `UserForm.vue` asumía erróneamente que necesitaba un `.value` adicional. Fix: `sessionUser?.role` (sin `.value`) en `UserForm.vue`. No detectado por `tsc --noEmit` (no chequea el interior de los `.vue`, ver nota de Fase 8 en `routes.md`) ni por la verificación E2E manual de la Fase 8 (el usuario de prueba usado ahí ya era superadmin de otra forma — el flujo de ocultar el campo a un admin no-superadmin nunca se ejercitó a mano). Encontrado únicamente por este test.

## Volumen y patrón por archivo (slice `users`, Fase 9)

| Archivo | Qué testea |
|---|---|
| `shared/mappers/project/mapUsers.test.ts` | `mapUser`/`mapUsers` — avatar null, mapeo de rol, mapeo de imagen vía `mapImage`, lista/vacío. Port literal del test de Next. |
| `server/services/project/users/{getUsers,getUser,addUser,updateUser,deleteUser}.test.ts` | Mismo patrón MSW que Next (`server.use(http.get/post/patch/delete(...))`): construcción de query/body, propagación de token como header `Authorization`, manejo de error/409, `throwCatchError` en el catch. Sin el mock de `react.cache` (no aplica en Nitro). |
| `app/components/domain/project/dashboard/users/delete/DeleteUser.test.ts` | Fusiona el rol de "componente" + "server action" de Next (`DeleteUser.test.tsx` + `delete/actions.test.ts`): en Nuxt no hay capa de Server Action separada, `DeleteUser.vue` llama `$fetch` directo. Verifica el `$fetch` DELETE, el toast de éxito/error, el emit `userDelete`, y que solo navegue con `router.push` cuando `isButton` (variante standalone) — no en el modo inline embebido en `UserForm`. |
| `app/components/domain/project/dashboard/users/Users.test.ts` | Render de `DataTable`+`AppPagination` (mockeados como stubs, mismo patrón que Next), `clearUsersIds()` en el store real de Pinia al montar, navegación al hacer click en "editar" (sin el flujo modal de Next: `editInline` fijo en `"true"`, ver `routes.md`), apertura/cierre del diálogo de borrado y actualización de la lista local, cambio de query `sort` (incluida la eliminación del parámetro al volver al sort por defecto). |
| `app/components/domain/project/dashboard/users/user/UserForm.test.ts` | Modo create vs edit (prefill, botón de borrar solo en edit), visibilidad condicional del select de rol según `canManageRole`, payload exacto del `$fetch` POST/PATCH (incluye/omite `role`/`password` según corresponda), toasts de éxito/error (incluido el mensaje específico de conflicto 409), `router.back()` tras éxito. `FormAppDatePicker`/`FormAppSelect` se sustituyen por stubs con un `<input>`/`<select>` nativo conectado al mismo `useField()` real de vee-validate (no se mockea el valor a mano): verifica el payload real sin depender de los popovers de reka-ui (`Calendar`/`Select`), poco amigables con jsdom y fuera de lo que este test necesita cubrir. |

No se han portado equivalentes de `Users.test.tsx`'s `useActionState`/modal (`editInline` fijo en `"true"`, ver decisión 45 de `CLAUDE.md`) ni tests para `server/api/users/*.ts` (los endpoints Nitro en sí): requerirían simular un `H3Event` real con sesión — fuera de alcance de esta fase, cubiertos indirectamente por los tests de los servicios que llaman (`getUsers`/`addUser`/etc.) y por la verificación E2E manual de la Fase 8 contra la API real. Pendiente si una fase futura lo pide explícito.

## Segundo slice testeado: `news` (mismo patrón, confirma que generaliza)

Mismo volumen/patrón que `users` (mapper + 5 servicios + 3 componentes = 39 tests, total suite 79/79 en verde tras este port), sin necesidad de tocar `vitest.config.ts`/`test/setup.ts`. Dos decisiones nuevas al portar un segundo dominio:

- **`FormAppRichTextEditor` (campo `description` de `NewForm.vue`) se mockea igual que `FormAppDatePicker`/`FormAppSelect`** — un `<textarea>` nativo conectado al `useField()` real, en vez de montar Tiptap/ProseMirror de verdad. Evita necesitar el polyfill de `Range`/`getBoundingClientRect` que jsdom no trae de serie (anticipado como pendiente desde la Fase 9 de `users`, ver nota de `test/setup.ts` arriba) — **no hizo falta tocar `test/setup.ts`** para este slice, al no montarse el editor real en ningún test.
- **Fixture de test con `image.id` numérico (`'84'`), no una cadena arbitraria**: un primer intento con `image.id: 'i1'` dejaba el formulario permanentemente inválido — `NewForm.vue` (igual que `UserForm.vue`) hace `Number(newsItem.image.id)` para precargar `imageId`, y Zod rechaza `NaN` como `number` válido. Detectado por el propio test (`meta.valid` nunca llegaba a `true`, el submit no disparaba `$fetch`), no por `tsc`. Ver gotcha completo en `.project_docs/routes.md`. Al escribir un fixture de test para cualquier dominio con imagen, usar un `id` numérico-como-string (igual que ya hacía `mapUsers.test.ts`), no un id arbitrario.

Archivos: `shared/mappers/project/mapNews.test.ts`, `server/services/project/news/{getNews,getNew,addNew,updateNew,deleteNew}.test.ts`, `app/components/domain/project/dashboard/news/delete/DeleteNew.test.ts`, `app/components/domain/project/dashboard/news/News.test.ts`, `app/components/domain/project/dashboard/news/new/NewForm.test.ts` — mismo patrón MSW/`mockNuxtImport`/`mockComponent`/`renderSuspended`/`vi.stubGlobal('AppToast', ...)` que sus equivalentes de `users`, literal.

## Tercer slice testeado: `faqs` (dominio más simple, confirma el patrón hacia abajo)

`faqs` es el dominio de dashboard más simple portado hasta ahora — `Faq { id, title, description }`, sin paginación/orden/filtros/imagen (ver `.project_docs/routes.md`, «Puerto del dominio faqs»). Volumen: mapper (4 tests) + 5 servicios (13 tests) + 3 componentes (13 tests) = 30 tests nuevos, total suite 109/109 en verde. Sin decisiones de testing nuevas — reafirma las dos ya fijadas en `news`:

- `FaqForm.test.ts` mockea `FormAppRichTextEditor` igual que `NewForm.test.ts` (`<textarea>` nativo + `useField()` real), sin tocar `test/setup.ts`.
- `Faqs.test.ts` es más corto que `Users.test.ts`/`News.test.ts`: sin stub de `AppPagination` ni casos de `sort` (la API de faqs no pagina/ordena) — solo verifica render, `clearFaqsIds()` al montar, navegación de "editar" y el ciclo abrir/confirmar/cerrar del diálogo de borrado.

Archivos: `shared/mappers/project/mapFaqs.test.ts`, `server/services/project/faqs/{getFaqs,getFaqById,addFaq,updateFaq,deleteFaq}.test.ts`, `app/components/domain/project/dashboard/faqs/delete/DeleteFaq.test.ts`, `app/components/domain/project/dashboard/faqs/Faqs.test.ts`, `app/components/domain/project/dashboard/faqs/faq/FaqForm.test.ts` — mismo patrón MSW/`mockNuxtImport`/`mockComponent`/`renderSuspended`/`vi.stubGlobal('AppToast', ...)` que `users`/`news`, literal.

## ⚠️ Regresión detectada (no de esta sesión, no diagnosticada): 17 tests fallando en `DeleteFaq`/`DeleteNew`/`DeleteUser`/`FaqForm`/`NewForm`/`UserForm`

Encontrada al correr la suite completa durante el port de `mi-cuenta/perfil`+`contrasena` (que no toca ninguno de estos 6 archivos): `npm run test` da **92/109** en vez de los 109/109 que documentaba la Fase 9/los ports de `news`/`faqs`. Los 17 tests que fallan son, en los 6 archivos, exactamente los que hacen `await $fetch(...)` (mockeado) y luego `waitFor(() => expect(mockToastSuccess/mockToastError).toHaveBeenCalledWith(...))` — el `waitFor` agota su timeout, la aserción sobre el toast nunca se cumple. Los tests del mismo archivo que NO dependen del toast (solo comprueban que se llamó a `$fetch`, o que no se navegó) siguen en verde.

Confirmado **determinista** (reproducido 3 veces seguidas la misma combinación de pass/fail) y **no achacable a esta sesión**: ninguno de los 6 archivos afectados (ni sus componentes `.vue`) se tocó en el port de mi-cuenta; la única dependencia compartida real que sí se tocó (`passwordFormSchema.ts`, importado por `userFormSchema.ts` para `MIN_PASSWORD_LENGTH`/`MAX_PASSWORD_LENGTH`) solo ganó exports nuevos, sin tocar los existentes. No se ha diagnosticado la causa raíz — hipótesis sin confirmar: los 6 componentes importan `AppToast` de forma explícita (`import { AppToast } from '@/components/common/AppToast.vue'`), a diferencia de otros que lo usan como identificador libre sin import (ver gotcha de `AppToast`/`vi.stubGlobal` arriba) — un import explícito podría no verse afectado por `vi.stubGlobal('AppToast', ...)`, que solo sustituye el objeto global, no el binding importado estáticamente. Pendiente de investigar la próxima vez que se toque uno de estos 3 dominios (`users`/`news`/`faqs`) — no se ha intentado arreglar aquí por quedar fuera del alcance de la tarea de `mi-cuenta`.

## Cómo ejecutar los tests (`package.json`)

| Script | Comando | Uso |
|---|---|---|
| `npm run test` | `vitest run` | Ejecución única (CI-like), todos los tests. |
| `npm run test:watch` | `vitest` | Modo watch para desarrollo. |
| `npm run test:coverage` | `vitest run --coverage` | Ejecución única + reporte de cobertura (`text` en consola + HTML en `coverage/`, en `.gitignore`), respetando los `exclude` de `vitest.config.ts`. |
