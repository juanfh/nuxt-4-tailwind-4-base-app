# Cliente API — nuxt-4-tailwind-4-base-app

Consultar cuando: se necesite añadir un nuevo servicio de dominio en `server/services/`, entender cómo se propagan errores desde el fetch hasta el caller, o saber qué helper (`getData`/`postData`/`putData`/`patchData`/`deleteData`) usar para un endpoint nuevo.

Fase 4 del proyecto: capa de acceso a la API externa. Réplica literal de `src/services/main/**` y `src/services/auth/*.ts` de `next-16-tailwind-4-base-app`, adaptada a Nitro. Solo se han portado los servicios de `auth/` (los que necesita la fase de autenticación siguiente) — el resto de dominios (`account`, `demo`, `project/*`) se porta fase a fase, igual que las primitivas `ui/*` en Fase 2.

## 1. Funciones HTTP genéricas (`server/services/main/`)

Mismo patrón que Next: no hay un "cliente API" con clase/objeto compartido — cada función de servicio de dominio arma su propia `URL` con `process.env.API_URL` (server-only, nunca se bundlea al cliente) y pasa la URL resuelta a una de las 5 funciones CRUD de `server/services/main/`.

| Función | Archivo | Firma (props) | Retorno éxito |
|---|---|---|---|
| `getData` | `server/services/main/getData.ts` | `{ url, token?, status?, tags?, revalidate?, nochache?, timeout? }` | `data` (JSON parseado tal cual) |
| `postData` | `server/services/main/postData.ts` | `{ url, body?, token?, status?, timeout? }` | `data.data` si existe, si no `data`; `true` si status 204 |
| `putData` | `server/services/main/putData.ts` | igual que `postData` | igual que `postData` |
| `patchData` | `server/services/main/patchData.ts` | igual que `postData` | igual que `postData` |
| `deleteData` | `server/services/main/deleteData.ts` | `{ url, body?, token?, status?, timeout? }` | `true` si status 200 o 204; lanza si no |

Mismo patrón interno que el original: cabeceras `Content-Type`+`Authorization: Bearer`/`x-token` redundante si hay `token`; `fetchWithTimeout` con `AbortController`; si `!response.ok` construye un `Error` con `status` inyectado y lo lanza; si se pasó `status` esperado y no coincide, lanza; si el JSON trae `data.error`, lanza; `try/catch` de cada función es un simple rethrow (el error se propaga intacto hasta el servicio de dominio, que es quien decide colapsarlo a `null`).

## 2. Utilidades de bajo nivel (`server/services/main/utils/`)

| Símbolo | Archivo | Rol |
|---|---|---|
| `fetchWithTimeout` | `fetchWithTimeout.ts` | Port literal — `fetch` global de Nitro (undici) tiene el mismo soporte de `AbortController` que el `fetch` de Next, sin adaptación necesaria. |
| `CACHE_TIMES`, `TIMEOUTS` | `timeOuts.ts` | Port literal. `CACHE_TIMES` queda sin consumidor real en esta fase (ver gotcha de `tags`/`revalidate` abajo) pero se porta por paridad de nombres con futuros servicios. |
| `throwResponseError`, `throwCatchError`, `ServiceError` | `printErrors.ts` | Port literal — mismo comportamiento (`throwCatchError` solo hace `console.error` y devuelve el objeto, no relanza). |
| `ServiceResult<T>` | `serviceResult.ts` | Port literal, sin consumidores todavía (ningún servicio de `auth/` lo usa en Next tampoco) — listo para cuando se porte un servicio de escritura que necesite distinguir un 409. |
| `fetchWithRetry` | — | **No portado**: código muerto en el proyecto Next (sin ningún import fuera de su propio test, ver `.project_docs/api_client.md` de la referencia) — no tiene sentido replicar código sin uso real. |

## ⚠️ Gotcha: `tags`/`revalidate`/`nochache` de `getData` son inertes en Nitro

`getData` (Next) usa la extensión `next: { revalidate, tags }` del `fetch` de Next.js para integrarse con su cache de datos — no existe equivalente en el `fetch` de Nitro/undici. `getData` (Nuxt) **acepta las mismas props por paridad de firma** (para que un futuro servicio de dominio portado literal no necesite tocar su propia llamada a `getData`), pero:
- `tags`/`revalidate` se destructuran fuera del payload — no llegan a la llamada a `fetch`, no hacen nada.
- `nochache` sí tiene efecto: si es `true`, se pasa `cache: 'no-store'` al `fetch` (soportado también fuera de Next).

Si en el futuro hace falta cachear una respuesta de la API externa, la estrategia correcta es Nitro-nativa: `defineCachedFunction`/`cachedEventHandler` a nivel de `server/api/`, no tocar `getData`.

## 3. Construcción de URL base

Mismo patrón repetido en cada servicio de dominio que en Next: `const baseUrl = new URL(\`${process.env.API_URL}/<recurso>\`)`. `API_URL` se lee directamente de `process.env` (no vía `useRuntimeConfig()`) para mantener el mismo nombre de variable que el proyecto Next — ver `.env.example` y `CLAUDE.md`.

## 4. Propagación de errores end-to-end

Idéntico a Next: `fetchWithTimeout` lanza (abort/network) → `getData`/`postData`/... relanza igual → la función de servicio de dominio captura en su propio `try/catch`, ejecuta `throwCatchError(url, error)` (solo loggea) y **devuelve `null`** (o `true`/`false` en operaciones booleanas — ver `logout`). Los errores de red/API no llegan como excepción a quien llama al servicio (un futuro `server/api/**` handler); cada caller debe comprobar el caso `null` explícitamente.

## 5. Servicios de dominio portados (`server/services/auth/`)

Todos usan `process.env.API_URL` + los helpers de `server/services/main/`, igual que el original. Ver detalle de flujo de auth (login/signup/activate/reset) en `.project_docs/auth.md`.

| Función | Archivo | Endpoint externo | Mapper usado |
|---|---|---|---|
| `login` | `login.ts` | `POST {API_URL}/auth/login` | `mapUserMin` |
| `loginByToken` | `loginByToken.ts` | `GET {API_URL}/auth/login-token?token=` | `mapUserMin` |
| `getMe` | `getMe.ts` | `GET {API_URL}/auth/me` (JWT vía cabecera) | `mapUser` |
| `getNewToken` | `getNewToken.ts` | `GET {API_URL}/auth/refresh?token=` | `mapUserMin` |
| `logout` | `logout.ts` | `POST {API_URL}/auth/logout` | ninguno — **stub activo**, ver abajo |
| `signup` | `signup.ts` | `PATCH {API_URL}/auth/signup` (usa `patchData` pese al nombre) | ninguno |
| `activateAccount` | `activateAccount.ts` | `POST {API_URL}/auth/activate-account` | ninguno (devuelve `response.token`) |
| `changePassword` | `changePassword.ts` | `PATCH {API_URL}/auth/password` (autenticado) | ninguno |
| `requestPassword` | `requestPassword.ts` | `POST {API_URL}/auth/forgot-password` | ninguno |
| `resetPassword` | `resetPassword.ts` | `POST {API_URL}/auth/reset-password` | ninguno |

**`logout` — stub temporal portado literal**: igual que en Next, la función tiene un `return true` en la primera línea que fuerza éxito sin llamar al backend; el resto de la función (implementación real ya escrita) queda como código muerto tras ese `return`. No se "arregla" aquí — es una réplica intencional del estado actual del proyecto de referencia (documentado allí como pendiente de retirar cuando se decida conectar el frontend).

## Servicios de dominio portados (`server/services/project/news/`)

Fase de port del dominio `news` (dashboard): mismo patrón exacto que `server/services/project/users/*.ts` (try/catch, `throwCatchError`/`throwResponseError`, `ServiceResult<T>` en las escrituras, nunca lanza al caller). Tabla de endpoints/servicios en `.project_docs/routes.md`. Dos añadidos sobre el patrón de `users`:
- `getNews.ts` convierte `dateFrom`/`dateTo` con `toISODateTime`/`toISODateTimeEndOfDay` (`shared/utils/formatDate.ts`, añadidas en este port — ver `.project_docs/models.md`) antes de anexarlas a la query.
- `addNew.ts`/`updateNew.ts` pasan `slug` por `slugify()` (`shared/utils/slugify.ts`) antes de enviarlo — la API espera un slug ya normalizado, no el que el usuario haya podido escribir a mano.

## Servicios de dominio portados (`server/services/project/faqs/`)

Fase de port del dominio `faqs` (dashboard): el más simple de los tres portados hasta ahora — `getFaqs` no acepta ningún parámetro de query (sin `page`/`limit`/`sort`/`search`, la API de faqs no pagina ni ordena) y devuelve el array de `Faq` directo, sin envoltorio `{data,total}`. `addFaq`/`updateFaq` (a diferencia de `addNew`/`updateNew`, que devuelven la respuesta cruda en `ServiceResult.data`) **mapean la respuesta con `mapFaq()`** antes de devolverla — port literal del comportamiento real de `src/services/project/faqs/{addFaq,updateFaq}.ts` (Next), no una inconsistencia introducida aquí. `server/api/faqs/index.post.ts`/`[id].patch.ts` sanean `description` con `sanitizeRichText` igual que `news`.

## Servicios de dominio portados (`server/services/project/slides/`)

Fase de port del dominio `carousel`/`slides` (dashboard) — mismo patrón exacto que `server/services/project/faqs/*.ts`: `getSlides` no acepta ningún parámetro de query (la API de slides no pagina ni ordena, igual que `faqs`) y devuelve el array de `Slide` directo. **Deviation deliberada respecto a Next**: el original agrupa estos 5 servicios bajo `src/services/project/home/` (junto a la página de inicio); aquí viven en `server/services/project/slides/`, siguiendo la convención de este proyecto de una carpeta de servicios por entidad/dominio, no por página consumidora — ver `.project_docs/routes.md` para el detalle completo de esta decisión.

`addSlide`/`updateSlide` reciben `cta?: CTA | null` (no solo `CTA | undefined`) y solo incluyen la clave `cta` en el body si es distinta de `undefined` — permite que el caller (`server/api/slides/{index.post,[id].patch}.ts`, reenviando lo que ya decidió `SlideForm.vue`) mande `null` explícito para vaciar un CTA existente en edición, mientras que omitir la clave entera (crear sin CTA) no toca nada. `server/api/slides/*` **no** sanea `description` con `sanitizeRichText` (a diferencia de `faqs`/`news`): `SlideData.description` no es contenido rich text en el original (`FormAppTextArea`, no `FormAppRichTextEditor` — confirmado leyendo `SlideForm.tsx` de Next), no hay HTML que limpiar.

## Endpoints BFF de la sección `(auth)` (`server/api/auth/*`)

Port de `src/components/auth/{login,signup,reset/request,reset/reset,activate}/actions.ts` (Next, server actions) — detalle de diseño/decisiones en `.project_docs/auth.md` (decisiones 77-78), detalle de las páginas/componentes que los consumen en `.project_docs/routes.md`.

| Endpoint | Servicio(s) que llama | Captcha | Equivalente Next |
|---|---|---|---|
| `POST /api/auth/verify-captcha` | ninguno (solo `verifyCaptchaToken`) | sí | `login/actions.ts` (`verifyRecaptchaAction`) |
| `POST /api/auth/signup` | `signup` | no | `signup/actions.ts` (`signupAction`) |
| `POST /api/auth/request-password` | `requestPassword` | sí | `reset/request/actions.ts` (`requestPasswordAction`) |
| `POST /api/auth/reset-password` | `resetPassword` | sí | `reset/reset/actions.ts` (`resetPasswordAction`) |
| `POST /api/auth/activate` | `activateAccount` | no | `activate/actions.ts` (`activateAccountAction`) |

Error de captcha señalizado con `createError({ statusCode: 422, statusMessage: 'captcha_error' })` — el cliente distingue este caso del resto vía `error.statusCode`, mismo idioma que el `statusCode === 409` (conflicto de email) ya usado por `UserForm.vue`. Los 4 servicios de `server/services/auth/*` que consumen estos endpoints (`signup`, `requestPassword`, `resetPassword`, `activateAccount`) ya estaban portados desde la Fase 4 — esta tarea solo añade la capa `server/api/` que faltaba para alcanzarlos desde el cliente (hasta ahora solo los consumía `authOptions.ts` internamente).

`server/utils/captcha.ts` (`verifyCaptchaToken`, server-only) y `app/utils/captcha.ts` (`getCaptchaToken`, cliente) — split de `src/utils/captcha/captcha.ts` (Next, un solo archivo) por el criterio de la decisión 2 de CLAUDE.md, ver `.project_docs/auth.md` decisión 77.

## Servicios de dominio portados (`server/services/account/`)

Port literal de `src/services/account/{getProfile,updateProfile}.ts` (Next) — perfil del usuario autenticado, resuelto siempre por el token (sin `id` explícito en la URL, a diferencia de `server/services/project/users/*`). Mismo patrón try/catch/`throwCatchError` que el resto, sin `ServiceResult<T>` (ninguno de los dos originales lo usa).

| Función | Archivo | Endpoint externo | Mapper usado |
|---|---|---|---|
| `getProfile` | `getProfile.ts` | `GET {API_URL}/auth/profile` | `mapProfile` (`shared/mappers/account/mapProfile.ts`) |
| `updateProfile` | `updateProfile.ts` | `PATCH {API_URL}/auth/profile` | ninguno (devuelve la respuesta cruda) |

`server/api/account/{profile.get,profile.patch}.ts` son el BFF hacia estos dos — mismo patrón que `server/api/users/*` (`getServerSessionUser(event)` resuelve el token en el propio handler, el cliente nunca lo envía explícito).

## ⚠️ Gotcha real: un endpoint autenticado bajo `server/api/auth/**` no resuelve la sesión

`server/api/account/change-password.post.ts` (wrapper BFF de `changePassword`, ya portado desde la Fase 4) **no puede vivir bajo `server/api/auth/**`**, aunque el servicio al que llama sí vive en `server/services/auth/`. Se probó primero como `server/api/auth/change-password.post.ts` — `getServerSessionUser(event)` devolvía sistemáticamente `token: ''` pese a una cookie de sesión válida (confirmado: la misma cookie resolvía el token con normalidad acto seguido contra `/api/account/profile`), y la API externa rechazaba la petición con `401 Missing bearer token`. Moviendo el mismo handler, sin ningún otro cambio, a `server/api/account/change-password.post.ts` el token se resolvió con normalidad. No se ha investigado el mecanismo interno exacto de `@sidebase/nuxt-auth` (probablemente algún tratamiento especial de rutas bajo su propio `baseURL: '/api/auth'`, ver `.project_docs/auth.md`) — se documenta como regla práctica: **cualquier endpoint nuevo que necesite `getServerSessionUser`/`checkHasSession` debe vivir fuera de `server/api/auth/**`**. `server/api/auth/logout.post.ts` no se ha visto afectado hasta ahora solo porque `logout()` es un stub que ignora el token (`return true` temprano, ver arriba) — si esa implementación se completa alguna vez, revisar este mismo gotcha.

## Variables de entorno

| Variable | Uso | Requerida |
|---|---|---|
| `API_URL` | Base URL del backend externo. Leída directamente como `process.env.API_URL` en cada `server/services/**` — nunca se bundlea al cliente (código Nitro). | Sí |
| `CAPTCHA_SECRET_KEY` | Secret key de reCAPTCHA v3. Leída directamente como `process.env.CAPTCHA_SECRET_KEY` en `server/utils/captcha.ts` — mismo criterio que `API_URL`, nunca por `runtimeConfig`. | Sí (para que login/reset funcionen; el resto de la app no depende de ella) |
| `NUXT_PUBLIC_CAPTCHA_SITE_KEY` | Site key de reCAPTCHA v3, expuesta al cliente vía `runtimeConfig.public.captchaSiteKey` — usada por `Recaptcha.vue`/`app/utils/captcha.ts`. | Sí (ídem) |

Documentada en `.env.example`. El resto de variables del `.env.example` de Next (`NEXTAUTH_*`, `CAPTCHA_*`, `NEXT_PUBLIC_*`...) no se portan todavía — se añaden cuando la fase correspondiente (auth/sesión, captcha...) las necesite.
