# Rutas y API — nuxt-4-tailwind-4-base-app

Consultar cuando: necesites ubicar el `page.vue`/middleware responsable de una URL, saber si una ruta exige sesión, identificar qué handler de `server/api/**` atiende una llamada, o portar un nuevo dominio (`products`, `news`, `faqs`, `carousel`) siguiendo la misma plantilla que `users`.

Fase 8 del proyecto: primer slice vertical completo (`users`), portado como plantilla para el resto de dominios del dashboard. Réplica deliberada de `next-16-tailwind-4-base-app/.project_docs/routes.md`, adaptada al modelo de Nuxt/Nitro (ver CLAUDE.md, "Arquitectura en capas").

## Decisiones de alcance de esta fase (y por qué)

1. **`EDIT_INLINE` fijado a `"true"` (modo "solo páginas dedicadas"), no ambos modos**: el original soporta un flag `EDIT_INLINE` que alterna entre editar en un `AlertDialog` sobre la lista (`EDIT_INLINE=false`) o en páginas propias `/users/new`+`/users/[id]` (`EDIT_INLINE=true`, el modo que el propio Next trata como "production"). Aquí solo se porta el segundo modo — sin `UserFormContainer`/`EditUserForm` (los componentes que envuelven `UserForm` en un `AlertDialog`), sin la rama de `AddUser`/`Users` que abre el formulario en modal. `AppAlertDialogContent`/`ui/alert-dialog` sí se portaron (los sigue necesitando `DeleteUser`, que usa un `AlertDialog` de confirmación independientemente del modo de edición).
2. **Subida/recorte de avatar: pendiente de la Fase 8, resuelta después** — `ImageUploader`/`cropImage.ts` se portaron en una tarea posterior (sin `ImageBase`/`ImageLoader`/`NoImage`, el subsistema sobre `next/image`: innecesario, un `<img>` nativo basta, igual que ya hacía `Avatar.vue`). Detalle completo en la sección «Subida y recorte de avatar (`ImageUploader`)» más abajo.
3. **TanStack Table para Vue, fijado a `8.21.3`** (no la última): `npm install @tanstack/vue-table` sin pin resuelve a la `9.x` (una reescritura completa de la API interna — sin `useVueTable`/`getCoreRowModel` en el nivel superior del paquete, ver gotcha completo abajo), mientras que el proyecto Next usa `@tanstack/react-table@8.21.3`. Se fija la `8.x` para tener paridad real de API (`useVueTable`, `getCoreRowModel`, `ColumnDef`, `flexRender`/`FlexRender`) con el original.
4. **`common/tables/DataTable.vue` sin columnas congeladas (`frozenColumns`)**: el original implementa columnas sticky (`ResizeObserver` + offsets calculados a mano) para la columna de selección/acciones. Es puro pulido visual, no forma parte de la validación CRUD de este slice — se omite aquí; se puede añadir cuando un dominio futuro lo necesite de verdad.
5. **`server/api/users/*` resuelve el token de sesión con `getServerSessionUser(event)` en el propio handler, no recibiéndolo del cliente**: el original pasa el token del cliente a los Server Actions vía `FormData` (`formData.append("token", token)`) porque en Next el Server Action y el componente cliente comparten ese mecanismo de invocación. En Nuxt, `server/api/**` es un endpoint HTTP normal detrás de Nitro — las cookies de sesión viajan automáticamente en cada petición same-origin (`useFetch`/`$fetch`), así que cada handler simplemente llama a `getServerSessionUser(event)` igual que ya hacían las páginas SSR — evita duplicar el token en cada body de mutación. Ver tabla de endpoints abajo.
6. **Sin capa de "actions" (`actions.ts` con `"use server"`)**: los Server Actions de Next (`saveUserAction`, `deleteUserAction`, `getProjectUserAction`) no tienen equivalente en Nuxt — su rol lo cubren directamente `server/api/users/*` (BFF) llamado vía `useFetch`/`$fetch` desde `UserForm.vue`/`DeleteUser.vue`/`Users.vue`.

## Enrutado i18n

- Config fuente: `app/i18n/routing.ts` (`routingConfig`) — ver [[i18n]].
- **`customRoutes: 'config'` en el bloque `i18n` de `nuxt.config.ts`** — ver gotcha completo abajo. Sin este flag, el bloque `i18n.pages` (equivalente a `pathnames` de next-intl) se ignora por completo.
- `i18n.pages` traduce cada ruta lógica (nombre de ruta autogenerado por Nuxt a partir de `app/pages/**`) a un slug por locale. Los tres nombres de ruta de esta fase: `dashboard-users` (`app/pages/dashboard/users/index.vue`), `dashboard-users-new` (`.../new.vue`), `dashboard-users-id` (`.../[id].vue`).

## ⚠️ Gotcha: `@nuxtjs/i18n` v10 ignora `i18n.pages` sin `customRoutes: 'config'`

Por defecto, `@nuxtjs/i18n` resuelve rutas traducidas en modo `customRoutes: 'page'` — espera un macro `defineI18nRoute()` dentro de cada `page.vue`, e ignora completamente el objeto `i18n.pages` de `nuxt.config.ts` (confirmado leyendo `node_modules/@nuxtjs/i18n/dist/module.mjs`: `normalizeRouteMeta` solo lee `options.pages` cuando `mode === "config"`, y ese modo solo se activa con `customRoutes: 'config'`).

Sin este flag, el smoke test de esta fase mostraba exactamente esta paradoja: `/panel/usuarios` (la ruta traducida que se pretendía registrar) daba `VUE_ROUTER_R0004` — "No match found" — mientras que la ruta cruda sin traducir (`/dashboard/users`, el path real generado por el archivo) sí respondía con normalidad. Con `customRoutes: 'config'` añadido, `/panel/usuarios` responde y `/dashboard/users` pasa a dar 404 (reemplazada, como se espera con `strategy: 'prefix_except_default'`).

## ⚠️ Gotcha: `useI18n()`/`useLocalePath()` no funcionan tras un `await` en middleware

`app/middleware/dashboard.ts` (el guard de rol) necesitaba llamar a `useAuth().getSession()` (async) y luego, si el rol no es válido, redirigir con `useLocalePath()`+`useI18n().t()`. Llamar a estos dos composables **después** del `await` lanzaba `Must be called at the top of a \`setup\` function` en cada navegación a `/dashboard/**` (confirmado con curl, 500 real, no un caso límite) — la Composition API de vue-i18n exige una instancia de componente activa, que un middleware de ruta no tiene, y que además se pierde tras cualquier punto de `await` aunque se llamara antes. Fix aplicado: usar `useNuxtApp().$i18n`/`$localePath` (las propiedades planas que `@nuxtjs/i18n` inyecta en el propio `nuxtApp`, sin ese requisito) en vez de los composables de Composition API.

## ⚠️ Gotcha: `useRuntimeConfig()` dentro del getter perezoso de `useSeoMeta` falla en SSR

Las tres páginas de `dashboard/users/` usan `useSeoMeta({ title: () => \`...${appName}\` })` para el título. Llamar a `useRuntimeConfig()` **dentro** de ese getter (en vez de antes, a nivel de `setup()`) fallaba con `A composable that requires access to the Nuxt instance was called outside of a plugin, Nuxt hook, Nuxt middleware, or Vue setup function` — unhead resuelve los getters de `useSeoMeta` durante el renderizado de `<head>`, ya fuera del contexto de Nuxt activo. Fix: leer `const { appName } = useRuntimeConfig().public` de forma eager al principio del `<script setup>`, capturarlo en una variable, y referenciar esa variable (no la llamada) dentro del getter.

## ⚠️ Gotcha: `FlexRender` + cell que devuelve `''` → hydration mismatch real

`@tanstack/vue-table` invoca cada `cell`/`header` de una `ColumnDef` a través de `FlexRender`, que internamente hace `h(props.render, props.props)` cuando `render` es una función — Vue trata esa función como un **componente funcional**. Las columnas `birthdate`/`gender` de `Users.vue` devolvían `''` (string vacío) como fallback cuando el dato no existía (`row.original.birthdate ? formatDate(...) : ''`). Un componente funcional que devuelve `''` se normaliza de forma distinta entre SSR y cliente — confirmado con headless Chrome contra la API real (usuarios reales sin `birthdate`): `Hydration completed but contains mismatches.` en consola en cada carga de `/panel/usuarios`, no crashea pero es un bug real. Aislado por bisección (quitando columnas de `DataTable` una a una) hasta confirmar que **solo** las columnas con fallback `''` lo producían — `name`/`surname`/`email`/`image` (que nunca devuelven `''`) no lo reproducían. Fix: devolver `undefined` en vez de `''` — la forma soportada por Vue de "no renderizar nada" en un componente funcional, sin ambigüedad SSR/cliente.

## Tabla de páginas (`app/pages/**`)

| Ruta lógica (ES / EN) | Archivo | Protegida | Qué renderiza |
|---|---|---|---|
| `/panel/usuarios` \| `/dashboard/users` | `app/pages/dashboard/users/index.vue` | Sí (`middleware: 'dashboard'`) | Listado paginado (`Users.vue`, `DataTable`+`AppPagination`) + `Actions.vue` (búsqueda + alta), datos de `useFetch('/api/users', { query: {search,page,limit,sort} })`. |
| `/panel/usuarios/nuevo` \| `/dashboard/users/new` | `app/pages/dashboard/users/new.vue` | Sí (`middleware: 'dashboard'`) | `UserForm.vue` en `mode="create"`, dentro de `InlineFormContainer`. Sin el `redirect` condicional a `EDIT_INLINE` del original (aquí siempre está activo, ver decisión 1). |
| `/panel/usuarios/[id]` \| `/dashboard/users/[id]` | `app/pages/dashboard/users/[id].vue` | Sí (`middleware: 'dashboard'`) | `UserForm.vue` en `mode="edit"` directo (sin `UserFormContainer`/modo "view", ver decisión 1), datos de `useFetch('/api/users/:id')`; sin `id` o sin dato → `navigateTo(nav.content_error.link)`. |

`layout: 'dashboard'` (`app/layouts/dashboard.vue`) en las tres — wrapper visual `<MainContent>`, sin lógica de guard (el guard vive en el middleware, no en el layout, a diferencia de Next donde ambos vivían en el mismo `dashboard/layout.tsx`).

**Bug real corregido (fuera de la Fase 8, encontrado en una tarea posterior): `MainHeader` desaparecía en toda página de dashboard.** En Next, `dashboard/layout.tsx` anida dentro de `src/app/[locale]/layout.tsx` (App Router compone layouts por carpeta) — el `MainHeader` del layout raíz sigue presente. Los layouts de Nuxt no se anidan solos: seleccionar `layout: 'dashboard'` sustituye a `'default'` entero en vez de envolverlo, así que la primera versión de `dashboard.vue` (solo `<MainContent><slot /></MainContent>`) perdía `MainHeader` por completo en cualquier ruta bajo `/panel/**`\|`/dashboard/**`. Fix: `app/layouts/dashboard.vue` envuelve su contenido en `<NuxtLayout name="default">`, replicando a mano el anidado que Next hace implícito. Verificado renderizando una página temporal con `layout: 'dashboard'` sin el guard de `middleware: 'dashboard'` (para no depender de una sesión real) y confirmando en el HTML servido que aparecen tanto el `<header>` de `MainHeader` como `id="main-content"` de `default.vue`.

## Guard de rol — `app/middleware/dashboard.ts`

Equivalente a `checkHasSession(ADMIN_ROLES)` en `dashboard/layout.tsx` (Next). Usa `useAuth().getSession()` (no `checkHasSession()` de `server/utils/`, que es código exclusivo de Nitro — ver gotcha arriba) + `isAdminRole()` (`shared/utils/isAdminRole.ts`, portado en esta fase). Sin sesión válida o sin rol admin/superadmin → `navigateTo($localePath($i18n.t('nav.not_access.link')))`.

## Tabla de endpoints (`server/api/users/**`)

| Método + ruta | Archivo | Servicio (`server/services/project/users/`) | Body/Query |
|---|---|---|---|
| `GET /api/users` | `index.get.ts` | `getUsers` | Query: `search?`, `page?`, `limit?`, `sort?` (`"campo_asc\|desc"`) |
| `POST /api/users` | `index.post.ts` | `addUser` | Body JSON: `name,surname,birthdate,gender,phone,email,password,confirmPassword,role?,imageId?` |
| `GET /api/users/[id]` | `[id].get.ts` | `getUser` | — |
| `PATCH /api/users/[id]` | `[id].patch.ts` | `updateUser` | Body JSON: mismos campos que POST, todos opcionales |
| `DELETE /api/users/[id]` | `[id].delete.ts` | `deleteUser` | — |

Todos resuelven el token de sesión con `getServerSessionUser(event)` internamente (ver decisión 5) — el cliente nunca envía el token explícito.

## `shared/utils/isAdminRole.ts` y `shared/utils/formatDate.ts`

Portados en esta fase (antes pendientes, ver CLAUDE.md Fase 4/decisión 2):
- `isAdminRole.ts`: port literal de `src/utils/isAdminRole.ts` (Next) — `ADMIN_ROLES`, `SUPERADMIN_ROLE`, `isAdminRole`, `isSuperAdminRole`.
- `formatDate.ts`: **adaptación, no port literal** — el original usa Luxon; aquí se usa `date-fns` (ya instalado desde la Fase 7, evita añadir una segunda librería de fechas) con los mismos patrones de formato (compatibles entre Luxon y date-fns para los casos usados). Solo se porta `formatDate()` (la función que consume la columna `birthdate` de la tabla) — `formatNow`/`formatFromUTCDate`/`toISODateTime*` se añaden cuando un dominio futuro los necesite.

## Verificación de esta fase

Contra la API real (`nest-prisma-postgreesql-base-app`, `localhost:4000`), con una sesión real autenticada (`POST /api/auth/callback/credentials`, superadmin):

- Build (`nuxt build`) y `tsc --noEmit` (contra `.nuxt/tsconfig.{server,app,shared}.json`) limpios.
- Guard de rol: `/panel/usuarios`, `/panel/usuarios/nuevo`, `/panel/usuarios/[id]` sin sesión → redirect a `/sin-acceso`/`/not-access` (confirmado en ambos locales).
- Login real de extremo a extremo: confirma también, por primera vez, el flujo completo de la Fase 5 (upgrade con `getMe`, hidratación de sesión) — antes solo verificado contra un `API_URL` inalcanzable.
- Listado: SSR con datos reales (25 usuarios, 5 páginas), paginación, `sort` y `search` (`?search=...` filtra server-side vía `getUsers`) funcionando.
- Ciclo CRUD completo contra la API real: `POST /api/users` (alta) → `GET /api/users/:id` (aparece) → `PATCH /api/users/:id` (edición, cambio persistido) → `DELETE /api/users/:id` (baja) → `GET` posterior devuelve 404. Repetido dos veces (una por servidor de dev reiniciado), datos de prueba eliminados al terminar.
- Hidratación cliente (headless Chrome vía CDP, con la cookie de sesión real inyectada): las tres páginas cargan sin errores de consola ni excepciones — **el mismatch de hidratación del gotcha de `FlexRender` arriba se encontró y confirmó resuelto en este mismo paso**.

## Subida y recorte de avatar (`ImageUploader`)

Tarea pendiente de la Fase 8 (decisión 2 de esta misma sección), implementada después de la Fase 9. Port de `src/components/project/dashboard/uploader/{ImageUploader,ImageCropDialog}.tsx` + `src/utils/cropImage.ts` + `src/hooks/use-file-upload.ts` (Next).

- **`app/composables/useFileUpload.ts`**: port de `use-file-upload.ts`, adaptado a Composition API — expone refs (`files`/`isDragging`/`errors`/`inputRef`) y funciones en vez del par `[state, actions]` de React. Sin `getInputProps()` (helper de React para esparcir props + `ref` sobre el `<input>`, sin equivalente idiomático): `ImageUploader.vue` enlaza `inputRef`/`accept`/`@change` directo en su `<template>`.
- **`app/utils/cropImage.ts`**: port literal de `cropImage.ts` — usa `window.Image`+`canvas` (APIs de navegador) → `app/utils/`, no `shared/utils/`, mismo criterio que el resto del proyecto (ver CLAUDE.md, decisión 2 de la Fase 1).
- **`app/components/domain/project/dashboard/uploader/{ImageUploader,ImageCropDialog}.vue`**: `ImageCropDialog.vue` usa `vue-advanced-cropper` (`Cropper`+`CircleStencil`/`RectangleStencil`) en vez de `react-easy-crop` (sin puerto Vue) — misma UX (stencil circular/rectangular + zoom), API distinta: el resultado del recorte llega vía evento `change` (no como estado controlado padre) y el zoom es relativo (`cropperRef.zoom(factor)`, no un valor absoluto asignable). Requiere el CSS del paquete importado globalmente en `nuxt.config.ts` (`css: [..., 'vue-advanced-cropper/dist/style.css']`) — sin él, el stencil/las handles de recorte no tienen posicionamiento.
- **`server/services/project/media/uploadImage.ts` + `server/api/media/upload.post.ts`**: port de `src/components/project/dashboard/uploader/actions.ts` (`uploadImage` server action, Next). El servicio hace un `fetch` multipart directo (no reusa `postData`, que fuerza `Content-Type: application/json`); el endpoint usa `readFormData(event)` (h3) para obtener el `FormData` nativo del cliente sin reconstruirlo a mano desde `readMultipartFormData`. Mismo patrón que `server/api/users/*`: resuelve el token con `getServerSessionUser(event)` en el propio handler (ver decisión 5).
- **`UserForm.vue`**: reemplaza el `<Avatar>` de solo lectura por `<ImageUploader>` cuando `mode !== 'view'` (`<Avatar>` se conserva para `mode === 'view'`); `imageId` (ya presente en `userFormSchema.ts`/`addUser.ts`/`updateUser.ts` desde la Fase 8, sin usar hasta ahora) se conecta vía `setFieldValue('imageId', ...)` en el callback `onFileChange`.
- Verificado con headless Chrome vía CDP contra la API real (mismo método que el resto de esta fase): seleccionar archivo → abre el diálogo de recorte → el control de zoom cambia el recorte → confirmar → el diálogo se cierra → el avatar se actualiza a una preview `blob:` → `$fetch('/api/media/upload', ...)` sube la imagen recortada a la API real y el formulario pasa a mostrar "Imagen subida" — sin errores de consola. Corregido en el camino: `DialogContent` sin `DialogDescription` (warning de accesibilidad de reka-ui) — se añadió una `DialogDescription` `sr-only` a `ImageCropDialog.vue`.

## Parte pública — menú principal + home (primera pieza fuera del dashboard)

Primera pieza de la parte pública del sitio (todo lo anterior era dashboard-only): el menú de navegación principal (`MainHeader`, desktop + móvil) y la página de home, ambos deliberadamente mínimos — la home se mantiene vacía (petición explícita), y el header solo incluye lo que ya tiene una página real detrás. Réplica parcial de `src/components/main/{header,navigation/main}/*.tsx` + `src/app/[locale]/{layout,page}.tsx` de Next — parcial porque el `layout.tsx` original agrupa piezas de varias fases futuras (theme switcher, `CookiesConsent`, `MainFooter`, `LoginLogout`, `SelectLocale`, skip-link, fuente `Commissioner`) que aquí no se han portado todavía, ver «Fuera de alcance» abajo.

### Piezas nuevas

- `shared/types/navigation.ts` (`NavItem`) — port de `src/types/navigation.ts`, sin el campo `icon` (`React.ReactNode`, sin consumidor real en Next, ver el propio archivo).
- `app/composables/useIsNavActive.ts` — **adaptación**, no port literal: el original concatena a mano el prefijo de locale; aquí se usa `useLocalePath()` (`@nuxtjs/i18n`), mismo patrón ya establecido en `UsersBreadCrumbs.vue`. Conserva la lógica de `linkalt` (coincidencia por prefijo, para cuando un nav item también deba marcarse activo en sub-rutas — sin consumidor real todavía, ver «Fuera de alcance»).
- `app/components/domain/main/navigation/main/{MainNavigationButton,MainNavigation,DesktopMenu,MobileMenu}.vue` — ports directos de sus análogos `.tsx`, con `emit('clickButton')` en vez de la prop-función `onClickButton` (patrón de emits estándar del proyecto para componentes que no son controles de formulario, ver CLAUDE.md decisión 38).
- `app/components/domain/main/header/MainHeader.vue` — sin la columna derecha del original (`LoginLogout`+`SelectLocale`+`ThemeToggle`, todas pendientes, ver «Fuera de alcance»); grid de 3 columnas exactas (`MobileMenu | logo | DesktopMenu`) en vez de 4 hijos sobre `grid-cols-3`.
- `ui/sheet` (`shadcn-vue add sheet`) — usada por `MobileMenu.vue`. Mismo gotcha de reinyección de tokens de siempre (revertido) + gotcha nuevo real (warning de accesibilidad `Missing Description`, corregido con `SheetDescription sr-only`) — ver `.project_docs/design_system.md`.
- `app/layouts/default.vue` — layout por defecto de Nuxt (toda página sin `definePageMeta({ layout })` explícito, es decir todo lo que no es dashboard): `MainHeader` + `<main id="main-content">`. Equivalente parcial de la porción pública de `layout.tsx`.
- `app/pages/index.vue` — reemplaza el placeholder de la Fase 2 (`NuxtWelcome`). Vacía a propósito: sin `HomeHero`/`HomeSchema`/`NewsCards`/`ProductsCards` (dominios `project/home` y páginas públicas de `news`/`products` no portados).
- `public/logo.svg` + `public/logo_negative.svg` — copiados literales de Next (mismo archivo, mismo par claro/oscuro).
- `main.menu`/`main.menu_description` en `app/i18n/locales/{es,en}.json` — ver `.project_docs/i18n.md`.

### Fuera de alcance de esta tarea (documentado, no un olvido)

- **`navItems` de `MainHeader` solo incluía `home`** (resuelto para `news` en una tarea posterior, ver «Parte pública — sección de noticias» más abajo): el original también añade `products`/`news` — sus páginas públicas (`(project)/products`, `(project)/news`) no existían todavía en este proyecto (solo se habían portado sus dashboards). `products` sigue pendiente por el mismo motivo.
- **`LoginLogout`, `SelectLocale`, `ThemeToggle`**: pendientes de fases futuras (formularios de auth, selector de idioma, theme switcher — ya listadas en "Decisiones pendientes" del `CLAUDE.md`). La columna derecha del header original que las alojaba no se ha creado. **Las tres portadas después** — ver secciones «Menú de usuario y dashboard», «Selector de idioma (`SelectLocale`)» y «Theme switcher (`ThemeToggle`)» más abajo.
- **`MainFooter`**: no pedido en esta tarea ("empezaremos por el menú principal y la home"); se añade en una tarea posterior siguiendo el mismo patrón (`FooterMenu`/`FooterNavigationButton`, namespace `nav` ya tiene las claves `demo`/`faqs` que usaría). **Resuelto después** — ver sección «Footer (`MainFooter`) + menú de footer» más abajo.
- **Resto de `layout.tsx`**: fuente `Commissioner` (Google Fonts), `ThemeProvider`, `NextTopLoader`, `GlobalLoading`, `CookiesConsent`, skip-link (`main.skip_to_content`, clave no migrada), clases base de `<body>` (`text-neutral-900 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-800`) — ninguna se ha portado; `app/layouts/default.vue` es deliberadamente más pequeño que el `layout.tsx` completo.
- **`linkalt` de `NavItem`/`useIsNavActive`**: la lógica se conservó (coincidencia de prefijo para marcar activo un nav item en sub-rutas) pero no tenía consumidor real hasta el port de `news` público (ver más abajo) — `home` no lo necesita (solo match exacto). Sigue pendiente para `products`.

### Verificación de esta tarea

- `npx nuxt prepare` limpio, sin `NUXT_B3011` (nombres nuevos: `MainNavigationButton`, `MainNavigation`, `DesktopMenu`, `MobileMenu`, `MainHeader` — ninguno colisiona con componentes de dashboard existentes).
- `nuxt build` limpio.
- Suite de tests (`npm run test`): 109/109 en verde, sin regresiones (esta tarea no tiene tests propios — ver «Pendiente» abajo).
- Smoke test con `curl` contra el `dev` server: `/` (es) devuelve "Inicio" en el nav y las dos rutas de `logo.svg`/`logo_negative.svg`; `/en` devuelve "Home" — SSR correcto en ambos locales.
- Smoke test con headless Chrome vía CDP (mismo método que fases anteriores): sin errores de consola ni mismatches de hidratación en `/` ni `/en`; con viewport móvil, clicar el trigger del menú abre el `Sheet` con el nav (confirmado leyendo el DOM tras el click) — encontró y corrigió el gotcha de `SheetDescription` (ver arriba).

### Pendiente (no resuelto todavía)

- Tests de `MainHeader`/`MainNavigation*`/`DesktopMenu`/`MobileMenu`/`useIsNavActive` — sin suite propia todavía, mismo criterio incremental que el resto del proyecto (se añade cuando se retome la suite de tests para dominios fuera de `users`/`news`/`faqs`).
- `MainFooter` + navegación de footer — **portado después**, ver sección «Footer (`MainFooter`) + menú de footer» más abajo. `LoginLogout`/`SelectLocale`/`ThemeToggle` — **portados después** (ver secciones «Menú de usuario y dashboard», «Selector de idioma (`SelectLocale`)» y «Theme switcher (`ThemeToggle`)» más abajo). Resto de `layout.tsx` sigue pendiente — ver «Fuera de alcance» arriba.
- `nav.products` en `MainHeader` — pendiente de que exista la página pública correspondiente (`nav.news` ya se añadió, ver «Parte pública — sección de noticias» más abajo).

## Pendiente (no resuelto todavía)

- Resto de dominios del dashboard (`products`) — se porta siguiendo esta misma plantilla (servicios → mapper → `server/api/` → páginas → componentes de dominio). `news`/`faqs`/`carousel` ya se portaron (ver secciones siguientes).
- Modo `EDIT_INLINE=false` (edición en modal sobre la lista) — ver decisión 1.
- Columnas congeladas de `DataTable` — ver decisión 4.
- Tests de `ImageUploader`/`ImageCropDialog`/`useFileUpload`/`cropImage` — la Fase 9 (ver [[tests]]) solo cubre el slice `users` tal y como quedó al final de esa fase, sin subida de avatar; se añaden cuando se retome esa suite.

## Puerto del dominio `news` (segundo dominio del dashboard, plantilla aplicada)

Segunda aplicación literal de la plantilla `users` (servicios → mapper → `server/api/` → páginas → componentes de dominio → tests), confirmando que el patrón generaliza. Diferencias reales encontradas al portar un segundo dominio (no visibles con uno solo):

### ⚠️ Gotcha nuevo y real: colisión de nombre global de componente (`NUXT_B3011`) entre dominios

`nuxt.config.ts` registra `app/components/domain/**` con `pathPrefix: false` (ver CLAUDE.md, decisión 11) — el nombre de componente global es **solo el nombre de archivo**, sin prefijo de carpeta. `users/components/{Actions,ActionButton,Filters}.vue` y `news/components/{Actions,ActionButton,Filters}.vue` comparten literalmente el mismo nombre de archivo → `npx nuxt prepare` avisa `NUXT_B3011: Two component files resolving to the same name` para los tres, y **uno de los dos dominios pierde silenciosamente su componente** (gana el que el scanner resuelve último, no hay error duro). Confirmado reproduciendo el warning antes del fix.

**Fix aplicado**: los tres archivos de `news/components/` que colisionaban se renombraron con prefijo de dominio — `NewsActions.vue`, `NewsActionButton.vue`, `NewsFilters.vue` (`AddNew.vue`/`Thumbnail.vue` no colisionaban, se quedan con nombre corto). Solo se tocaron los ficheros de `news/` — no se renombró nada de `users/` (fuera de alcance, y ya funcionaba antes de que `news` existiera). **Regla para el resto de dominios** (`products`, `faqs`, `carousel`): antes de dar por terminado un dominio nuevo, correr `npx nuxt prepare` y comprobar que no aparece ningún `NUXT_B3011` — cualquier archivo de `components/<subcomponente>.vue` reutilizado igual entre dominios (`Actions.vue`, `Filters.vue`, `ActionButton.vue` son los tres nombres que ya se sabe que colisionan) necesita el mismo prefijo.

### ⚠️ Gotcha real (fix posterior): `<SelectItem value="">` de reka-ui rompía todo `/panel/noticias`

`FeaturedFilter.vue` portó literal el patrón de Next (`{ label: "Todas", value: "" }` como opción "sin filtro" del `<SelectItem>`), válido en Radix UI/React pero **prohibido en runtime por reka-ui**: `SelectItem.vue` (`node_modules/reka-ui/dist/Select/SelectItem.js`) lanza `Error("A <SelectItem /> must have a value prop that is not an empty string...")` — ese `value=""` está reservado internamente para representar "sin selección"/placeholder. No se detectó en la Fase 9 (sin test de `FeaturedFilter`/`NewsFilters`, ver decisión 59 del `CLAUDE.md`) ni en el smoke test de esa tarea (verificación solo de lectura sin sesión, decisión 69) — apareció al reportar dos bugs aparentemente no relacionados del dashboard de noticias:

1. El botón "Noticias" del menú de dashboard (`DashboardMenu.vue`/`AccountNavigationButton.vue`) nunca se marcaba activo al entrar en esa sección.
2. Pulsar "editar" en una fila de `News.vue` cambiaba la URL pero la vista se quedaba en el listado.

Ambos síntomas tenían la misma causa raíz, confirmada instrumentando `useIsNavActive.ts` con logs temporales: el throw de `SelectItem` (dentro de `NewsFilters` → `FeaturedFilter` → `FormAppSelect` → `AppSelect` → `ui/select`) interrumpe el ciclo interno de transición de página de Nuxt (`<RouteProvider>`) antes de que termine de resolverse — `useRoute()` leído desde componentes persistentes fuera de `<NuxtPage>` (como `AccountNavigationButton`, montado una sola vez dentro de `MainHeader`, ver decisión 84) se queda congelado en la ruta **anterior** a la navegación (confirmado comparando `useRoute().path` con `useRouter().currentRoute.value.path`: el segundo sí se actualizaba, el primero no), y una navegación posterior iniciada desde esa misma página rota (like "editar") tampoco llega a completar el swap visual, aunque el *router* ya haya actualizado la URL. En SSR/carga directa el mismo throw se traducía en un `500` liso de `/panel/noticias` (confirmado con Playwright contra la API real).

**Fix aplicado** (solo en `FeaturedFilter.vue`, sin tocar `AppSelect`/`ui/select` — genéricos, otros consumidores sí pueden legítimamente pasar `value: ''`): sentinel `ALL_VALUE = 'all'` como `value` interno de la opción "Todas"/"Todos", traducido a/desde ausencia de `?featured=` en la URL en el propio borde del componente (`featured` computed al leer, `changeFeaturedParam` al escribir) — mismo patrón de traducción URL↔UI que el componente ya hacía. Verificado con Playwright + sesión real (`localhost:4000`): `/panel/noticias` responde `200` en carga directa, el botón del menú se marca activo tras una navegación SPA y "editar" navega correctamente al formulario de edición.

**Regla para el resto de dominios/filtros** (`products` pendiente): cualquier "opción sin filtro" de un `AppSelect`/`FormAppSelect` portado literal de un `*Filter.tsx` de Next necesita un sentinel no vacío en vez de `value: ""` — reka-ui lo rechaza en runtime, no en build (`tsc` no lo detecta, solo aparece al abrir el desplegable o, peor, al renderizar `SelectContent` en el árbol).

### ⚠️ Gotcha nuevo: `Number(image.id)` puede dar `NaN` si el id de imagen no es numérico

`UserForm.vue`/`NewForm.vue` convierten `newsItem?.image?.id` (tipado `string` en `shared/types/image.ts`) a `imageId: number` con `Number(...)` para precargarlo en el formulario. Si ese id no es una cadena numérica, `Number(...)` da `NaN` — y `z.number()` de Zod **rechaza `NaN`** (no lo trata como `number` válido), dejando el formulario permanentemente inválido (botón "Guardar" deshabilitado) sin ningún error visible. No se manifestó en `users` (su fixture de test usa `image: null`) pero sí en el primer intento del test de `NewForm.vue` (fixture con `image.id: 'i1'`) — detectado por el propio test, no por `tsc`. En la práctica no es un bug real: la API real devuelve ids de imagen numéricos (confirmado contra el backend real, ver «Verificación» abajo) — pero es una fragilidad latente compartida por `UserForm.vue` y `NewForm.vue` si algún día el backend cambia el formato del id de imagen. No se ha "arreglado" (se preserva el patrón exacto de `UserForm.vue`); documentado aquí para que no sorprenda si reaparece al portar otro dominio con imagen.

### Piezas nuevas de este dominio (no genéricas, no reusables de `users`)

- `shared/utils/slugify.ts` (`slugify`, `SLUG_REGEX`) y `shared/utils/stripHtml.ts` — puros, portados literales de Next, usados por `newFormSchema.ts` (validación de `slug`) y como generador del slug a partir del título (botón "generar" de `FormAppInputText`, prop `onGenerate`).
- `shared/utils/formatDate.ts` — se le añadieron `toISODateTime`/`toISODateTimeEndOfDay` (pendientes desde la Fase 8, ver ese archivo), adaptados a `Date` nativo en vez de Luxon: reciben el string `yyyy-MM-dd` que produce `FormAppDatePicker` y fijan hora a inicio/fin de día en UTC. Usados por `getNews.ts` (rango de fechas del filtro) y `addNew.ts`/`updateNew.ts` (campo `date`).
- `server/utils/sanitizeHtml.ts` (`sanitizeRichText`) — nueva dependencia `sanitize-html`, **server-only** (no `shared/`, para no bundlearla al cliente sin necesidad). Se invoca en `server/api/news/index.post.ts`/`[id].patch.ts` sobre `body.description` antes de llamar al servicio — mismo punto donde Next sanitizaba en su Server Action (`saveNewAction`), aquí sin capa de "actions" (ver decisión 6), así que el `server/api/**` handler es el sitio natural.
- `app/components/domain/project/filters/{DateRangeFilter,FeaturedFilter}.vue` — pendientes desde la Fase 7 (ver `components.md`), portados ahora. Domain-agnósticos (viven junto a `SearchFilter.vue`, no bajo `news/`) para que `products`/etc. los reutilicen sin volver a portarlos. Mismo patrón que `SearchFilter.vue`: `useForm()` local sin schema, solo para dar contexto ambiente a `FormAppDatePicker`/`FormAppSelect`.
- Portada de imagen (`ImageUploader` en `NewForm.vue`) reconfigurada para recorte rectangular 16:9 (`crop-shape="rect"`, `aspect-ratio={16/9}`, salida `992×558`) en vez del recorte circular 1:1 de avatar — mismo componente genérico, props distintas.
- `FormAppRichTextEditor` (`description`) — primer consumidor real de este control desde la Fase 7 (`UserForm.vue` no lo usaba). Renderiza correcto contra HTML real devuelto por la API (párrafos largos verificados, ver «Verificación» abajo).

### Tabla de páginas añadidas

| Ruta lógica (ES / EN) | Archivo | Qué renderiza |
|---|---|---|
| `/panel/noticias` \| `/dashboard/news` | `app/pages/dashboard/news/index.vue` | `News.vue` (`DataTable`+`AppPagination`, sort por defecto `date_desc`) + `NewsActions.vue` (búsqueda + rango de fechas + destacada + alta). |
| `/panel/noticias/nueva` \| `/dashboard/news/new` | `app/pages/dashboard/news/new.vue` | `NewForm.vue` en `mode="create"`. |
| `/panel/noticias/[id]` \| `/dashboard/news/[id]` | `app/pages/dashboard/news/[id].vue` | `NewForm.vue` en `mode="edit"` directo; `New.id` es `number` (no `string` como `User.id`) — el segmento de ruta se castea con `String(...)`/se compara según haga falta. |

`server/api/news/**` sigue exactamente la tabla de endpoints de `users` (mismo verbo/nombre de archivo, `getServerSessionUser(event)` en cada handler) — `GET /api/news` es alcanzable **sin sesión** (igual que el listado público de Next), el resto de verbos no se probaron sin sesión porque no hay credenciales de prueba disponibles en este entorno (ver «Verificación»).

### Verificación de este dominio

- Suite de tests (`npm run test`): 79 tests, 18 archivos, todos en verde (40 de `users` + 39 nuevos de `news`).
- `npx nuxt prepare` limpio, sin `NUXT_B3011` (ver gotcha arriba).
- Contra la API real (`localhost:4000`, la misma instancia usada en fases anteriores): `GET /api/news` y `GET /api/news/:id` (sin sesión, `getServerSessionUser` degrada a `token: ''`) devolvieron datos reales (20 noticias, imágenes con ids numéricos, descripción HTML larga) mapeados correctamente por `mapNews`/`mapNewDetail` — confirma servicio + mapper + endpoint de punta a punta contra datos de producción reales, no solo mocks.
- Guard de rol: `/panel/noticias`, `/panel/noticias/nueva`, `/panel/noticias/[id]` y sus variantes `/en/dashboard/news*` sin sesión → `302` a `/sin-acceso`/`/not-access` (mismo comportamiento que `users`). **No verificado con sesión autenticada real** (a diferencia de la Fase 8 de `users`, aquí no había credenciales de prueba disponibles en este entorno) — el ciclo CRUD completo (alta con subida de imagen, edición, borrado) y la hidratación cliente sin mismatches quedan pendientes de un smoke test manual con sesión real, igual que el resto de piezas marcadas como tal en fases anteriores.
- Nota: en el momento de este port, `/sin-acceso`/`/not-access` no tenía página propia (`VUE_ROUTER_R0004` en el log al redirigir ahí) — gap preexistente heredado de `users`/`dashboard.ts`, no introducido por `news`. **Resuelto después** — ver sección «Páginas de error: 404 (`not-found`) y sin acceso (`not-access`)» más abajo.

## Puerto del dominio `faqs` (tercer dominio del dashboard, el más simple)

Tercera aplicación de la plantilla `users`/`news` (servicios → mapper → `server/api/` → páginas → componentes de dominio → tests). `Faq { id, title, description }` es el dominio más plano de los tres: **sin paginación, sin orden, sin filtros/búsqueda, sin imagen, y sin ningún concepto de categoría** (confirmado contra el original Next: `getFaqs()` no acepta ningún parámetro de query y devuelve el array directo, sin `{data,total}`). Las tres decisiones de alcance heredadas de `users`/`news` (`EDIT_INLINE` fijo en `"true"`, sin capa de "actions", token de sesión resuelto server-side en cada handler — ver decisiones 1/5/6 arriba) se aplican sin cambios.

### Piezas de este dominio

- `shared/types/project/faq.ts` (`Faq`), `shared/mappers/project/mapFaqs.ts` (`mapFaq`/`mapFaqs`) — sin variante `Detail` ni dependencia de otro mapper (sin imagen).
- `server/services/project/faqs/{getFaqs,getFaqById,addFaq,updateFaq,deleteFaq}.ts` — mismo patrón try/catch/`ServiceResult` que `news`/`users`. `getFaqs` no construye ningún `URLSearchParams` (sin query). `addFaq`/`updateFaq` mapean la respuesta con `mapFaq()` antes de devolverla (a diferencia de `addNew`/`updateNew`, que devuelven la respuesta cruda) — port literal del comportamiento real de Next, ver `.project_docs/api_client.md`.
- `server/api/faqs/{index.get,index.post,[id].get,[id].patch,[id].delete}.ts` — mismo patrón que `server/api/news/*.ts`, saneando `description` con `sanitizeRichText` en `POST`/`PATCH`.
- `app/components/domain/project/dashboard/faqs/{Faqs.vue,FaqsBreadCrumbs.vue,components/{AddFaq,FaqsActionButton,FaqsActions}.vue,delete/DeleteFaq.vue,faq/{faqFormSchema.ts,FaqForm.vue}}` — analogs directos de `News`/`NewsBreadCrumbs`/etc. `FaqsActionButton.vue`/`FaqsActions.vue` van **prefijados desde el inicio** (ver gotcha `NUXT_B3011` documentado arriba): `faqs` no necesita un `Filters.vue` (sin barra de búsqueda/filtros en el original), así que solo esos dos nombres colisionaban. `Faqs.vue` no usa `AppPagination` — nada que paginar, coherente con que la API no la soporta (no se ha inventado paginación que no existe server-side). `FaqForm.vue` es el formulario más simple portado hasta ahora: dos campos (`title` + `description` vía `FormAppRichTextEditor`), sin imagen/slug/fecha/destacada.
- `app/pages/dashboard/faqs/{index,new,[id]}.vue` — `index.vue` llama `useFetch<Faq[]>('/api/faqs')` sin objeto `query` (nada que pasar).

### Tabla de páginas añadidas

| Ruta lógica (ES / EN) | Archivo | Qué renderiza |
|---|---|---|
| `/panel/preguntas-frecuentes` \| `/dashboard/faqs` | `app/pages/dashboard/faqs/index.vue` | `Faqs.vue` (`DataTable`, columna única `title`, sin `AppPagination`) + `FaqsActions.vue` (solo alta, sin filtros). |
| `/panel/preguntas-frecuentes/nueva` \| `/dashboard/faqs/new` | `app/pages/dashboard/faqs/new.vue` | `FaqForm.vue` en `mode="create"`. |
| `/panel/preguntas-frecuentes/[id]` \| `/dashboard/faqs/[id]` | `app/pages/dashboard/faqs/[id].vue` | `FaqForm.vue` en `mode="edit"` directo; `Faq.id` ya es `string` (a diferencia de `New.id: number`), sin necesidad de castear el segmento de ruta. |

`server/api/faqs/**` sigue exactamente la tabla de endpoints de `users`/`news` (mismo verbo/nombre de archivo, `getServerSessionUser(event)` en cada handler).

### Verificación de este dominio

- Suite de tests (`npm run test`): 109 tests, 27 archivos, todos en verde (79 previos de `users`+`news` + 30 nuevos de `faqs`).
- `npx nuxt prepare` limpio, sin `NUXT_B3011`.
- Backend real (`localhost:4000`) **no estaba levantado en esta sesión** (a diferencia del port de `news`, donde sí lo estaba) — no se pudo repetir la verificación de lectura contra datos de producción reales que sí tuvo `news`. En su lugar se verificó con el servidor de desarrollo (`nuxt dev`) sin backend: `/api/faqs` responde `500` limpio (`Error getting faqs`, sin excepción sin capturar) en vez de crashear — confirma que `getFaqs`/el handler degradan igual de bien que el resto de servicios cuando la API externa no responde.
- Guard de rol: `/panel/preguntas-frecuentes`, `/panel/preguntas-frecuentes/nueva`, `/panel/preguntas-frecuentes/[id]` y sus variantes `/en/dashboard/faqs*` sin sesión → `302` a `/sin-acceso`/`/not-access` (mismo comportamiento que `users`/`news`). **No verificado con sesión autenticada real ni contra la API real** (ni lectura ni escritura) — a diferencia de `news`, que sí tuvo verificación de lectura real — el ciclo CRUD completo y la hidratación cliente sin mismatches quedan pendientes de un smoke test manual cuando haya backend + sesión real disponibles en el mismo entorno.

## Parte pública — sección de noticias (listado + detalle, botón de menú)

Primera pieza de contenido público real fuera de la home (que sigue vacía) y del menú (fase anterior, solo `home`). Réplica parcial de `src/app/[locale]/(project)/news/{page,layout}.tsx` + `.../[slug]/{page,layout}.tsx` (Next): parcial porque no se portan JSON-LD (`NewsSchema`/`NewSchema`, dependen de un tipo/mapper `SEO` que este proyecto no tiene, ver decisión de `shared/types/project/new.ts` en la sección de `news` de dashboard) ni `GoToEdit` (atajo de edición inline para admin) — ver «Fuera de alcance» abajo.

### ⚠️ Corrección de alcance previo: `pages.news` estaba mal nombrado

El port del dominio `news` (sección anterior) usó el namespace `pages.news` para el **listado de dashboard**, cuando el propio proyecto Next reserva `pages.news` para la página **pública** y `pages.dashboard_news` para el dashboard (confirmado leyendo `src/app/[locale]/(project)/dashboard/news/*` vs `src/app/[locale]/(project)/news/*` en el original) — el resto de dominios (`users`, `faqs`) no expuso esta inconsistencia porque no tienen página pública, solo dashboard, así que `pages.users`/`pages.faqs` nunca colisionaron con nada. Como esta tarea sí necesita un `pages.news` público real, se corrigió el desajuste: **todas** las referencias `pages.news.*` de los archivos de `app/components/domain/project/dashboard/news/**` y `app/pages/dashboard/news/**` se renombraron a `pages.dashboard_news.*` (mismo contenido, solo la clave cambia — verificado que sigue habiendo `302` limpio en el guard de rol tras el cambio), y se creó un `pages.news` nuevo y más pequeño (`seo_title`, `seo_description`, `title`, `description`, `pagination_items`) para las páginas públicas de esta tarea. `nav.news`/`nav.dashboard_news` ya estaban correctamente separados desde el port de `news` — solo `pages.*` tenía el error.

### Piezas nuevas

- `server/services/project/news/getNewBySlug.ts` — variante pública de `getNew.ts` (dashboard, por id numérico vía `/news/id/:id`, sin cambios): hace `GET ${API_URL}/news/:slug` directo (mismo endpoint externo que usa `src/services/project/news/getNew.ts` en Next), reusa `mapNewDetail`.
- `server/api/news/slug/[slug].get.ts` — BFF hacia `getNewBySlug`. Vive bajo `/api/news/slug/:slug` (no `/api/news/:id`, ya ocupado por la variante dashboard) para que ambos patrones convivan en Nitro sin ambigüedad. `GET /api/news` (listado) se **reusa tal cual** para la parte pública — ya era alcanzable sin sesión desde el port de `news` (dashboard), no hizo falta un endpoint de listado propio.
- `app/components/domain/project/news/{PublicNewsBreadCrumbs,NewCard,PublicNews}.vue` — analogía pública de `dashboard/news/{NewsBreadCrumbs,News}.vue`. `PublicNewsBreadCrumbs`/`PublicNews` van prefijados con `Public` (no `News`/`NewsBreadCrumbs` a secas) porque esos nombres ya los tiene el dominio dashboard — mismo gotcha `NUXT_B3011` de siempre (ver sección de `news` arriba), aquí el recién llegado es el que se prefija. `NewCard.vue` no colisiona con nada, se mantiene el nombre literal de Next (`NewCard.tsx`). Sin el trío `Figure`/`ImageLoader`/`NoImage` del original (subsistema de imagen no portado, ver decisión 46 de la Fase 8): `NewCard.vue` usa el mismo patrón `<img>` nativo + fallback en `@error` que ya usa `Thumbnail.vue` (dashboard/news).
- `app/pages/news/{index,[slug]}.vue` — listado público (sin filtros de búsqueda/destacada/fecha, a diferencia del dashboard) y detalle por slug. Reusan `MainContent`/`MainContentHeader`/`Title` (ya existentes desde la fase del menú principal).
- `nav.news` conectado a `MainHeader.vue` (`navItems` pasa de `[home]` a `[home, news]`), con `linkalt` — primer consumidor real de esa lógica de `useIsNavActive` (antes sin uso, ver «Fuera de alcance» de la sección del menú principal, ahora resuelto).
- `i18n.pages` (`nuxt.config.ts`): dos entradas nuevas, `news` (`app/pages/news/index.vue`) y `news-slug` (`app/pages/news/[slug].vue`), valores literales de `nav.news.link` (`/noticias` \| `/news`).

### Decisiones de alcance de esta tarea (y por qué)

- **Sort del listado público fijo a `date_desc` (un único campo), no el multi-sort del original** (`featured desc, date desc`): `server/api/news/index.get.ts` (compartido con el dashboard) solo acepta un `sort` de un campo (`"campo_orden"`, `split('_')`) — el propio listado de dashboard ya asume este límite (`sort` por defecto `date_desc` sin orden por destacada primero). Añadir soporte multi-campo tocaría ese endpoint compartido con el dashboard; se deja fuera de alcance de esta tarea.
- **Sin `description` con `prose`/`@tailwindcss/typography`**: el proyecto no tiene el plugin de Typography instalado (`@theme` a mano, ver `.project_docs/design_system.md`) y esta es la primera vez que se renderiza HTML de `AppRichTextEditor` en modo lectura — en vez de añadir una dependencia nueva solo para esto, el detalle usa un puñado de utilidades Tailwind con selectores de descendiente (`[&_h2]:...`, `[&_a]:...`) directamente en la página.
- **404 de detalle**: mismo patrón que `dashboard/{users,news,faqs}/[id].vue` — `navigateTo(localePath(t('nav.content_error.link')))` si `getNewBySlug` no encuentra el slug. `nav.content_error.link` (`/error-contenido`) sigue sin página propia (gap heredado, no introducido aquí, ver la nota equivalente en la sección de `news` dashboard) — verificado que degrada a un `404` limpio de Nuxt (`VUE_ROUTER_R0004`), no a un crash.

### ⚠️ Observación (no arreglada): warning `VUE_ROUTER_R0004` benigno en SSR con locale no-default

Los enlaces construidos con el patrón ya establecido en el proyecto (`localePath(\`${t('nav.news.link')}/${slug}\`)`, igual que `NewsBreadCrumbs.vue`/`UsersBreadCrumbs.vue` en el dashboard) emiten un `WARN [VUE_ROUTER_R0004]` en el log de SSR cuando el locale activo es `en` (no el default): `localePath()` intenta primero resolver la cadena cruda sin prefijo (`/news/slug`, que no coincide con ninguna ruta registrada porque `en` sí necesita prefijo) antes de corregirlo internamente. **El href final generado es correcto** (verificado con `curl`: `/en/news/<slug>` responde `200`, el `href` renderizado en el HTML ya lleva el prefijo `/en/` correcto) — es ruido de consola del propio `localePath()` sobre un path crudo, no un enlace roto. No se ha tocado porque el mismo patrón (`t('nav.X.link') + '/' + param` → `localePath(...)`) es la convención ya establecida en todo el proyecto (breadcrumbs de `users`/`news`/`faqs`, acciones de fila de `News.vue`) — cambiarlo aquí a un enfoque basado en nombre de ruta (`localePath({name:'news-slug', params:{slug}})`) sería divergir de esa convención en un solo sitio. Probablemente el mismo warning ya ocurre en las rutas de dashboard equivalentes en locale `en`, sin haberse detectado antes porque su verificación en `en` se limitó a comprobar el redirect del guard de rol (sin sesión), nunca una navegación real con enlaces generados.

### Fuera de alcance de esta tarea

- **JSON-LD** (`NewsSchema`/`NewSchema`, `SEO`/`mapSeo`): el original genera `<script type="application/ld+json">` con datos estructurados `Blog`/`BlogPosting`. Este proyecto no tiene tipo/mapper `SEO` (ver `shared/types/project/new.ts`, sin campo `seo` en `NewDetail`) — añadirlo es una pieza nueva no pedida explícitamente en esta tarea.
- **`GoToEdit`**: atajo de edición inline en la página de detalle para usuarios admin (gated por `EDIT_INLINE`+rol). No portado — no pedido explícitamente.
- **`NewsCards`** (carrusel de noticias destacadas para la home): widget de home, fuera de alcance mientras la home siga deliberadamente vacía.
- **Filtros públicos**: el listado público no tiene búsqueda/destacada/fecha, igual que el original (`searchParams` de la página pública de Next solo acepta `page`/`limit`/`sort`).

### Verificación de esta tarea

Contra la API real (`localhost:4000`, backend + Postgres levantados en esta sesión, 20 noticias reales):

- `npx nuxt prepare` limpio, sin `NUXT_B3011` (nombres nuevos: `PublicNewsBreadCrumbs`, `NewCard`, `PublicNews` — ninguno colisiona).
- Suite de tests (`npm run test`): 109/109 en verde, sin regresiones (esta tarea no añade tests propios — mismo criterio que la fase del menú principal, ver «Pendiente» abajo).
- Listado (`/noticias` es, `/en/news` en): `200` en ambos locales, SSR con datos reales (20 noticias), grid de tarjetas con imagen/título/fecha/descripción corta, paginación (`page=2` devuelve las 8 noticias restantes de 20 con `limit=12`), sin selector "por página" (`hideResultsPerPage`, a diferencia del dashboard).
- Detalle (`/noticias/prueba-44444b`): `200`, título/fecha/descripción corta/imagen de portada/descripción larga (HTML real) renderizados; breadcrumb `Inicio > Noticias`.
- Slug inexistente (`/noticias/no-existe-esto`): `getNewBySlug` degrada a `null` → redirect a `/error-contenido` → `404` limpio de Nuxt (gap preexistente, ver arriba), sin crash ni `500`.
- Botón "News" en `MainHeader` visible y funcional en ambos locales (enlaza a `/noticias`\|`/en/news`).
- Guard de rol del dashboard de `news` no afectado por el renombrado `pages.news` → `pages.dashboard_news`: `/panel/noticias`, `/en/dashboard/news` siguen devolviendo `302` limpio sin sesión.

### Pendiente (no resuelto todavía)

- Tests de `getNewBySlug`/`server/api/news/slug/[slug].get.ts`/`PublicNews.vue`/`NewCard.vue`/`app/pages/news/**` — sin suite propia todavía, mismo criterio incremental que la fase del menú principal (se añaden cuando se retome la suite de tests para dominios/páginas fuera de `users`/`news` dashboard/`faqs`).
- JSON-LD, `GoToEdit`, `NewsCards` (widget de home), filtros públicos, sort multi-campo del listado — ver «Fuera de alcance» arriba.
- El warning `VUE_ROUTER_R0004` en SSR con locale `en` — ver «Observación» arriba, cosmético, no repara el patrón de construcción de enlaces en todo el proyecto.

## Sección `(auth)` — login/signup/reset/activate

Port de `src/app/[locale]/(auth)/{layout,login/page,signup/page,reset/page,activate/page}.tsx` + `src/components/auth/{login,signup,reset/request,reset/reset,activate}/**` (Next). Primera vez que se conecta autenticación real de usuario final (hasta ahora `authOptions.ts`/`useClientSessionUser`/el guard de `dashboard.ts` de la Fase 5/8 solo se habían probado con una sesión obtenida a mano vía `POST /api/auth/callback/credentials` directo — ver `.project_docs/auth.md`, decisión 30). Detalle completo de los guards/endpoints/gotcha de `getSession()` en `.project_docs/auth.md`, decisiones 75-81 — esta sección solo cubre las piezas de routing/páginas.

### Piezas nuevas

- `app/pages/{login,signup,reset,activate}.vue` — las 4 páginas, todas con `definePageMeta({ middleware: 'guest' })` (ver `.project_docs/auth.md`) y `<Recaptcha/>` en el propio `<template>` (no en un layout nombrado — las 4 siguen usando el layout `default`, igual que en Next el layout `(auth)` anida dentro del layout raíz sin sustituir `MainHeader`).
- `i18n.pages` (`nuxt.config.ts`): 4 entradas nuevas (`login`, `signup`, `reset`, `activate`), valores literales de `nav.{login,signup,reset,activate}.link` — esas 4 claves de `nav` ya existían desde el esqueleto inicial de i18n (Fase 3), sin consumidor real hasta ahora.
- `app/middleware/guest.ts` — guard "invitado", ver `.project_docs/auth.md` decisión 75 (y el gotcha real de `getSession()` en la 76).
- `server/api/auth/{verify-captcha,signup,request-password,reset-password,activate}.post.ts` — ver `.project_docs/api_client.md`.
- `app/components/domain/auth/{login/LoginForm,signup/SignupForm,reset/request/RequestForm,reset/reset/ResetForm,activate/ActivateForm}.vue` + sus `*FormSchema.ts` — ver `.project_docs/components.md`.
- `app/components/common/AppLink.vue` — port de `AppLink.tsx` (Next), primer uso real de un link con estilo "texto subrayado" fuera de la navegación principal. A diferencia del original (que usa `next/link` directo, sin resolver el prefijo de locale explícitamente), aquí se aplica `useLocalePath()` internamente sobre el prop `link` — mismo criterio que `useIsNavActive.ts`/`MainNavigationButton.vue` (`NuxtLink` no prefija de locale un string crudo por sí solo). Los llamantes pasan el valor crudo de `nav.*.link` (p. ej. `t('nav.login.link')`), sin resolverlo ellos mismos.
- `app/components/domain/auth/Recaptcha.vue` — port de `Recaptcha.tsx` (Next), inyección del script de reCAPTCHA v3 al montar. Sin salida visual real (`<span hidden />`, Vue no tiene un equivalente directo de `<></>` con cero nodos DOM dentro de una SFC).

### Ninguna colisión `NUXT_B3011`

Los 5 nombres de componente nuevos (`LoginForm`, `SignupForm`, `RequestForm`, `ResetForm`, `ActivateForm`, `Recaptcha`, `AppLink`) no colisionan con ningún componente existente de `domain/`/`common/` — confirmado con `npx nuxt prepare` limpio tras el port.

### Verificación de esta tarea

Contra la API real (`localhost:4000`, backend levantado en esta sesión):

- `npx nuxt build` y `npx nuxt prepare` limpios; `tsc --noEmit` contra los 3 tsconfig generados sin errores nuevos (mismo ruido preexistente de `.vue` sin `vue-tsc` de siempre).
- Las 8 combinaciones de URL (4 páginas × es/en: `/iniciar-sesion`, `/crear-cuenta`, `/restablecer-contrasena`, `/activar-cuenta`, `/en/login`, `/en/sign-up`, `/en/reset-password`, `/en/activate-account`) responden `200` con contenido SSR real (título, formulario, bloque de credenciales de demo en login, `RequestForm` vs `ResetForm` condicionado a `?verify=` en reset).
- `POST /api/auth/callback/credentials` con las credenciales de demo del propio `login.vue` (mismo request que dispara `LoginForm.vue` vía `signIn()`) → sesión completa e hidratada (`GET /api/auth/session` con `role: "superadmin"`, imagen, etc.) — confirma el caso de éxito completo de `authOptions.ts` que la Fase 5 había dejado pendiente de verificar (ver `.project_docs/auth.md`, decisión 81).
- Con esa sesión activa: `/iniciar-sesion` → `302` a `/` (guard `guest.ts` funcionando); `/panel/usuarios` (guard `dashboard.ts`, sin tocar en esta tarea) sigue devolviendo `200` — sin regresión cruzada entre los dos guards, que comparten el mismo `useAuth().getSession()`.
- `server/api/auth/*` probados con datos inválidos/inexistentes (sin captcha, captcha bogus, signup con campos vacíos, activate con `verify` inventado): todos degradan limpio (`422 captcha_error` / `500 error`), nunca una excepción sin capturar — sin crear datos reales en el backend conectado (signup/reset-password/activate con datos válidos no se probaron para no mutar el backend compartido, ver `.project_docs/auth.md` decisión 81).

### Pendiente (no resuelto todavía)

- Tests de `LoginForm.vue`/`SignupForm.vue`/`RequestForm.vue`/`ResetForm.vue`/`ActivateForm.vue`/`AppLink.vue`/`Recaptcha.vue`/`app/middleware/guest.ts`/`server/api/auth/*` — sin suite propia todavía, mismo criterio incremental que el resto de páginas públicas (`app/pages/news/**`, ver sección anterior).
- Flujo de escritura real de signup/reset-password/activate contra la API — no verificado por no mutar el backend compartido de esta sesión, ver «Verificación» arriba.

## Menú de usuario y dashboard (`LoginLogout`/`AccountMenu`/`DashboardMenu`)

Port de `src/components/main/navigation/account/{AccountMenu,AccountNavigation,AccountNavigationButton,DashboardMenu,LoginLogout,LogoutButton}.tsx` (Next) — el botón con icono de usuario en `MainHeader` que, con sesión activa, abre un panel (`ui/sheet`, mismo patrón que `MobileMenu.vue`) con navegación de cuenta + dashboard + cerrar sesión; sin sesión, es un link directo a login.

### Alcance de esta tarea (deviation deliberada respecto a Next)

`DashboardMenu.vue` solo incluía `users`, `dashboard_news` y `dashboard_faqs` — **sin** `dashboard_carousel` (pendiente de una fase futura, ver CLAUDE.md "Decisiones pendientes") ni `dashboard_products` (el dominio `products` no se porta, ni dashboard ni público — enlazarlo daría un 404). El `DashboardMenu.tsx` de Next incluye los 5. Petición explícita de esta tarea, no un olvido. **`dashboard_carousel` se añadió después** en el port del dominio `carousel`/`slides` (ver sección propia más abajo) — `dashboard_products` sigue sin portar, mismo motivo.

### Piezas nuevas

- `app/components/domain/main/navigation/account/{AccountNavigationButton,AccountNavigation,DashboardMenu,AccountMenu,LoginLogout,LogoutButton}.vue` — mismo split de responsabilidades que el original. `AccountNavigationButton`/`AccountNavigation` reusan `useIsNavActive`/`NavItem` ya portados (Fase 3/8), sin novedad de infraestructura.
- `server/api/auth/logout.post.ts` — pieza nueva sin equivalente 1:1 en Next: `LogoutButton.tsx` (Next) importa `logout()` (el servicio) directo desde un componente cliente, algo que solo "funciona" porque ese servicio nunca alcanza su parte server-only (stub `return true` temprano, ver `server/services/auth/logout.ts`, CLAUDE.md Fase 4/decisión 20). En Nuxt, `server/services/**` es exclusivo de Nitro (nunca se bundlea a `app/`, ver CLAUDE.md decisión 3) — hace falta este endpoint intermedio. Resuelve el token con `getServerSessionUser(event)`, mismo patrón que `server/api/users/*` (el cliente nunca lo envía explícito).
- 2 claves i18n nuevas en `pages.login` (`{es,en}.json`), que Next sí tenía pero el port de la sección `(auth)` no había copiado (esa tarea no las necesitaba — `LoginForm.vue` solo consume `login_button`/`access_data_not_valid`): `logout_button`, `are_sure_logout`, `logout_error`. Encontrado por un `[intlify] Not found` real en consola durante la verificación de esta tarea, no por revisión de código — ver «Verificación» abajo.
- `nav.account.menu_description` (`{es,en}.json`), clave nueva sin equivalente en Next: `AccountMenu.vue` añade un `SheetDescription` (oculto, `sr-only`) que Next's `AccountMenu.tsx` no tiene — mismo motivo que ya llevó a `MobileMenu.vue` (Fase 8) a añadir el suyo (`main.menu_description`): sin él, Reka UI emite `Warning: Missing 'Description' for DialogContent` en consola (accesibilidad, no next-intl/next tiene ese requisito con Radix). Se usa una clave propia de `nav.account` en vez de reusar `main.menu_description` porque el texto describe un panel distinto (cuenta/dashboard, no la navegación principal del sitio).

### Reactividad: por qué no se reusa `useClientSessionUser()` aquí

`useClientSessionUser()` (`app/composables/useClientSessionUser.ts`, Fase 5) desreferencia `useAuth().data.value` **dentro** del propio composable y devuelve `user`/`token` ya como valores planos — una foto fija tomada una única vez, en el momento en que se llama (ver CLAUDE.md, decisión 58). Sirve bien para `UserForm.vue` (un componente de página, que remonta en cada navegación). No sirve para `LoginLogout.vue`/`DashboardMenu.vue`: ambos viven dentro de `MainHeader`, montado por el layout `default` (`app/layouts/default.vue`), que **persiste** entre navegaciones dentro de las páginas públicas (incluidas las 4 de `(auth)`, que también usan `default` — ver decisión 75 más arriba). Tras un login en `/iniciar-sesion` con `navigateTo()` (sin recarga completa), el `MainHeader` ya montado necesita reflejar la sesión nueva sin remontar.

Fix: `LoginLogout.vue`/`DashboardMenu.vue` llaman `useAuth()` directo y derivan un `computed(() => session.value?.user...)` — la lectura de `.value` ocurre dentro del getter reactivo, así que Vue sí trackea la dependencia y recalcula en cada cambio de `session.value` (login o logout), sin necesitar remontar el componente. Mismo patrón de comprobación que `app/middleware/guest.ts` (`session?.user`, no el objeto `session` a secas — con o sin sesión, `useAuth().data` puede resolver a `{}`, truthy en JS, ver decisión 76 en `.project_docs/auth.md`).

### `LogoutButton.vue`: `signOut()` + `navigateTo()`, no un hard reload

El original hace `signOut({ redirect: false })` seguido de `router.push()` + `router.refresh()` (fuerza a los Server Components de Next a re-resolver con la sesión ya limpia). Aquí no hace falta el equivalente de `router.refresh()`: `useAuth().data` es un ref reactivo compartido por todo el árbol de componentes (confirmado en la verificación de esta tarea — tras logout, el header vuelve a "Iniciar sesión" sin recargar la página), así que `navigateTo(localePath(t('nav.home.link')))` basta.

### Ninguna colisión `NUXT_B3011`

Los 6 nombres de componente nuevos (`AccountNavigationButton`, `AccountNavigation`, `DashboardMenu`, `AccountMenu`, `LoginLogout`, `LogoutButton`) no colisionan con ningún componente existente de `domain/`/`common/` — confirmado con `npx nuxt prepare` limpio tras el port.

### Verificación de esta tarea

Contra la API real (`localhost:4000`, backend levantado en esta sesión):

- `npx nuxt build`/`npx nuxt prepare` limpios; `tsc --noEmit` contra los 3 tsconfig generados sin errores nuevos en los archivos tocados (mismo ruido preexistente de `.vue` sin `vue-tsc` de siempre, entorno sin `vue-tsc` instalable en esta sesión — ver nota de Fase 8 en este mismo doc).
- Home (`/`) sin sesión: SSR devuelve el link "Iniciar sesión" (`href="/iniciar-sesion"`), no el trigger de `AccountMenu`.
- `POST /api/auth/callback/credentials` con las credenciales de demo de `login.vue` (superadmin) → cookie de sesión real.
- Headless Chrome vía CDP con esa cookie inyectada: el trigger de `AccountMenu` sustituye al link de login; al abrir el panel aparecen exactamente `Perfil`, `Contraseña`, `Usuarios`, `Noticias`, `Preguntas frecuentes`, `Cerrar sesión` — **sin** `Carrusel` ni `Productos`, confirmando el alcance pedido. Los dos primeros (`Perfil`/`Contraseña`) resuelven a rutas que todavía no existen (`/mi-cuenta/perfil`, `/mi-cuenta/contrasena` — páginas pendientes, ver CLAUDE.md "Decisiones pendientes"): `VUE_ROUTER_R0004` en consola al resolver el `href`, esperado y no se ha intentado navegar a ellas.
- Clic en "Cerrar sesión" → `AlertDialog` de confirmación → clic en "Confirmar" → `POST /api/auth/logout` (`200`) → `signOut()` → `navigateTo(home)` → el header vuelve a mostrar "Iniciar sesión", **sin recarga completa de página** — confirma la reactividad de `computed(() => session.value?.user)` descrita arriba, en el mismo `MainHeader` que nunca se remontó.
- Sin errores/warnings de consola nuevos aparte de los ya conocidos y documentados arriba (rutas `mi-cuenta/*` inexistentes) y el ya preexistente `VUE_ROUTER_R0004` de `useIsNavActive` con `nav.news.link`/`nav.login.link` (ver el mismo patrón ya presente antes de esta tarea en `MainNavigationButton.vue`, no introducido aquí).

### Pendiente (no resuelto todavía)

- Tests de los 6 componentes nuevos y de `server/api/auth/logout.post.ts` — sin suite propia todavía, mismo criterio incremental que el resto (ver `.project_docs/tests.md`).
- Theme switcher sigue sin aparecer junto al menú de usuario en `MainHeader` (pendiente de su propia fase, ver CLAUDE.md). Selector de idioma **portado después** — ver sección «Selector de idioma (`SelectLocale`)» más abajo.

## Perfil y contraseña de mi-cuenta (`/mi-cuenta/perfil` \| `/my-account/profile`, `/mi-cuenta/contrasena` \| `/my-account/password`)

Resuelve el último hueco de la sección `(auth)`/menú de usuario: las páginas de perfil y cambio de contraseña que `AccountMenu.vue` ya enlazaba (`nav.account.profile.link`/`nav.account.password.link`) pero que no existían todavía. Port de `src/app/[locale]/account/{layout,page,profile/page,password/page}.tsx` + `src/components/account/**` + `src/components/auth/password/PasswordForm.tsx` (Next). Detalle de las decisiones de sesión/auth en `.project_docs/auth.md` (sección «Perfil y contraseña de mi-cuenta»); esta sección cubre routing/páginas/i18n.

### Piezas nuevas

- `app/middleware/account.ts` — guard "sesión sin restricción de rol" (equivalente a `checkHasSession()` sin argumento `role` en `account/layout.tsx`), aplicado vía `definePageMeta({ middleware: 'account' })` en las 3 páginas. Layout `default` (con `MainHeader`), no `dashboard` — a diferencia de `/panel/**`, `account/layout.tsx` (Next) no envuelve en ningún `MainContent` de sidebar, cada página pone su propio `<MainContent>`.
- `shared/types/profile.ts` (`Profile`) + `shared/mappers/account/mapProfile.ts` (`mapProfile`) + `server/services/account/{getProfile,updateProfile}.ts` + `server/api/account/{profile.get,profile.patch}.ts` — ver `.project_docs/models.md`/`.project_docs/api_client.md`.
- `app/components/domain/account/profile/{profileFormSchema.ts,ProfileForm.vue}` — port de `src/components/account/{profileFormSchema,ProfileForm}.tsx`, simplificado igual que `UserForm.vue` (Fase 8): con `EDIT_INLINE` fijo en `"true"`, el original siempre acaba en `mode="edit"`/`editable=true` a través de `ProfileFormContainer` — se porta directo ese único camino, sin `ProfileFormContainer`/`EditProfileForm`/`AlertDialog` ni el prop `mode`. Usa `ImageUploader` (recorte circular 1:1, mismo que avatar de `UserForm.vue`) + los mismos `FormApp*` que `UserForm`/`SignupForm` (texto, fecha, select género, teléfono, email). Tras un `PATCH` exitoso llama `useAuth().getSession()` para refrescar la sesión (el callback `session` de `authOptions.ts` rehidrata con `getMe()` en cada resolución — no hace falta fusionar campos a mano como el `update()` de next-auth/react del original).
- `app/components/domain/auth/password/{passwordFormSchema.ts,PasswordForm.vue}` — `passwordFormSchema.ts` ganó `getPasswordSchema`/`PasswordFormValues` (antes solo tenía `MIN_PASSWORD_LENGTH`/`MAX_PASSWORD_LENGTH`, pendientes desde la Fase 8). `PasswordForm.vue` sigue el mismo patrón `useForm`+`$fetch`+try/catch que `LoginForm.vue`/`UserForm.vue`, con la misma cuadrícula de `RuleCheck` (2×3) que `UserForm.vue`/`SignupForm.vue` sobre `newpassword`. Llama a `POST /api/account/change-password` **sin enviar el token** (se resuelve server-side, ver el gotcha de ubicación de endpoint en `.project_docs/api_client.md`).
- `app/pages/account/{index,profile,password}.vue` — `index.vue` redirige siempre a `nav.account.profile.link` (equivalente a `account/page.tsx`, que solo hace `redirect(...)`). `profile.vue` hace `useFetch('/api/account/profile')` y redirige a `nav.content_error.link` si no hay perfil (mismo patrón que `dashboard/users/[id].vue`). `password.vue` no hace fetch (todo lo resuelve `PasswordForm.vue`/el endpoint).
- `i18n.pages` (`nuxt.config.ts`): 3 entradas nuevas (`account`, `account-profile`, `account-password`), valores literales de `nav.account.link`/`nav.account.profile.link`/`nav.account.password.link`.
- `pages.account` en `app/i18n/locales/{es,en}.json` — namespace nuevo (`seo_title`/`seo_description` compartidos por las 3 páginas, igual que el original los resuelve una sola vez en `account/layout.tsx`; `profile.title`/`profile.profile_update_success`/`profile.profile_update_error`; `password.title`/`password.current_password_label`/... /`password.password_update_success`/`password.password_update_error`) — solo las claves que el código realmente consume, mismo criterio que la decisión 73 de CLAUDE.md (`faqs`). El `en.json` de Next tiene claves `password_update_success_title`/`_message` inconsistentes con el `es.json` (`password_update_success` a secas) que `PasswordForm.tsx` tampoco consume — no se han copiado, se usó una única clave `password_update_success`/`password_update_error` en ambos locales.

### ⚠️ Gotcha real (grave, afecta a todo el proyecto): `Title` colisionaba con el componente global que el propio Nuxt registra para `<Title>`

Encontrado verificando esta tarea (no introducido por ella): **todo** uso de `common/texts/Title.vue` en el proyecto (`users`, `news`, `faqs`, auth, home, mi-cuenta — 20 archivos) renderizaba un `<h1>`/`<h2>`... **completamente vacío** en el HTML servido por SSR. Causa raíz, confirmada leyendo `.nuxt/components.d.ts`: Nuxt registra un componente global propio llamado `Title` (`nuxt/dist/head/runtime/components`, parte de la integración de `@unhead/vue` para fijar `document.title` declarativamente, análogo a `<Meta>`/`<Link>`/`<Head>`) — ese componente **gana** la colisión de nombre sobre cualquier componente de usuario que se llame igual, no escribe nada en el `<body>` y no lee ninguna prop `title` propia. El navegador "arreglaba" visualmente el problema al hidratar (Vue recupera el mismatch de hidratación SSR/cliente creando el nodo correcto en el cliente), así que ningún smoke test anterior con headless Chrome lo había detectado — solo es visible inspeccionando el HTML servido antes de hidratar (confirmado con `curl` contra `nuxt dev` real).

**Fix aplicado**: `app/components/common/texts/Title.vue` renombrado a `PageTitle.vue` (sin colisión, confirmado contra `.nuxt/components.d.ts`) y actualizados los 20 usos existentes (`s/<Title/<PageTitle/`, todas las invocaciones eran self-closing, sin `</Title>` que ajustar). De paso se encontró y corrigió un segundo bug real, independiente, en el propio componente: `<component :is="headingType" v-html="title" />` (`:is` dinámico + `v-html`) tampoco interpolaba el contenido en el codegen SSR real de este proyecto (confirmado con `curl`, no solo en teoría) — sustituido por una cadena `v-if`/`v-else-if` de tags estáticos (`h1`..`h6`), cada uno con `v-html` directo, que sí renderiza bien en SSR (confirmado con `@vue/compiler-sfc` `compileTemplate({ ssr: true })` y con `curl` real). **Regla para el resto del proyecto**: no nombrar un componente global igual que uno de los reservados por Nuxt/Unhead (`Title`, `Meta`, `Link`, `Base`, `Style`, `Script`, `NoScript`, `Head`, `Html`, `Body`) — comprobar `.nuxt/components.d.ts` si un componente nuevo no parece renderizar nada pese a no dar ningún error.

### Tabla de páginas añadidas

| Ruta lógica (ES / EN) | Archivo | Protegida | Qué renderiza |
|---|---|---|---|
| `/mi-cuenta` \| `/my-account` | `app/pages/account/index.vue` | Sí (`middleware: 'account'`) | Nada — redirige siempre a `/mi-cuenta/perfil`\|`/my-account/profile`. |
| `/mi-cuenta/perfil` \| `/my-account/profile` | `app/pages/account/profile.vue` | Sí (`middleware: 'account'`) | `ProfileForm.vue` con los datos de `useFetch('/api/account/profile')`. |
| `/mi-cuenta/contrasena` \| `/my-account/password` | `app/pages/account/password.vue` | Sí (`middleware: 'account'`) | `PasswordForm.vue`, sin datos que precargar. |

### Verificación de esta tarea

Contra la API real (`localhost:4000`, backend levantado en esta sesión, misma cuenta superadmin de tareas anteriores):

- `npx nuxt prepare` limpio, sin `NUXT_B3011` (nombres nuevos: `ProfileForm`, `PasswordForm` — ninguno colisiona entre sí ni con nada existente; `PageTitle` tampoco, confirmado tras el rename).
- `tsc --noEmit` contra los 3 tsconfig generados: sin errores nuevos en los archivos de esta tarea (mismo ruido preexistente de `.vue` sin `vue-tsc` de siempre).
- Las 6 combinaciones de URL (3 páginas × es/en) responden `200` con sesión real, `302` a `/sin-acceso`/`/not-access` sin sesión (guard `account.ts`).
- `GET`/`PATCH /api/account/profile`: datos reales devueltos y mutados correctamente (cambio de teléfono, verificado con un `GET` posterior y revertido al terminar).
- `POST /api/account/change-password` con contraseña actual incorrecta: `500`/`statusMessage: 'error'` limpio (la API externa responde `401 Current password is incorrect`), sin excepción sin capturar — confirma el fix del gotcha de ubicación de endpoint (ver `.project_docs/api_client.md`). No probado con datos válidos, para no mutar la contraseña real del usuario demo compartido.
- El gotcha de `Title`→`PageTitle` (arriba) se encontró precisamente verificando esta tarea con `curl` — confirmado también resuelto en páginas preexistentes (`/panel/usuarios`, `/noticias`), no solo en las nuevas.
- Suite de tests (`npm run test`): **17 de 109 tests fallan** (`DeleteFaq`/`DeleteNew`/`DeleteUser`/`FaqForm`/`NewForm`/`UserForm` — todos los que esperan `AppToast.success`/`AppToast.error` tras una mutación async, con un `waitFor` que agota el timeout). Confirmado que es preexistente a esta tarea y no causado por ella: ninguno de los 6 archivos afectados fue tocado en esta sesión, la única dependencia compartida real (`passwordFormSchema.ts`, que `userFormSchema.ts` importa) solo ganó exports nuevos sin tocar los existentes, y el fallo es 100% determinista (reproducido 3 veces seguidas, no es flaky). No se ha investigado la causa raíz (fuera de alcance: los 6 archivos pertenecen a los dominios `users`/`news`/`faqs`, no a `mi-cuenta`) — queda documentado en `.project_docs/tests.md` como pendiente para la próxima vez que se toque alguno de esos dominios.

### Pendiente (no resuelto todavía)

- Tests de `ProfileForm.vue`/`PasswordForm.vue`/`app/middleware/account.ts`/`server/api/account/**` — sin suite propia todavía, mismo criterio incremental que el resto de páginas fuera de `users`/`news`/`faqs` dashboard.
- El fallo preexistente de 17 tests (`DeleteFaq`/`DeleteNew`/`DeleteUser`/`FaqForm`/`NewForm`/`UserForm`) — ver «Verificación» arriba y `.project_docs/tests.md`.
- `PasswordForm`/`ProfileForm` no verificados con datos válidos contra la API real (cambio de contraseña real, edición de perfil con imagen nueva) — por no mutar el backend/credenciales compartidos de esta sesión.

## Puerto del dominio `carousel`/`slides` (cuarto dominio del dashboard) + carrusel público de la home

Cuarta aplicación de la plantilla `users`/`news`/`faqs` (servicios → mapper → `server/api/` → páginas → componentes de dominio), más el botón de `DashboardMenu` (hueco pendiente desde la sección anterior) y la primera pieza real de la home (hasta ahora deliberadamente vacía, ver decisión 12 de `CLAUDE.md`). Port de `src/{types,mappers}/project/{slide.ts,main.ts,mapSlides.ts}` + `src/services/project/home/{getSlides,getSlideById,addSlide,updateSlide,deleteSlide}.ts` + `src/components/project/dashboard/carousel/**` + `src/components/project/home/HomeHero.tsx` + `src/components/common/media/gallery/{Hero,components/{Arrow,Dots}}.tsx` (Next).

### Naming: `carousel` (rutas/nav) vs `slides` (entidad/API), igual que en Next

El propio proyecto Next ya usa dos nombres distintos para la misma pieza: la ruta/nav es `dashboard_carousel` (`/panel/carrusel`), pero el tipo de dominio es `Slide`, el mapper `mapSlides`, el store `slides-store` y el endpoint externo `/slides`. Se replica esa misma dualidad en vez de forzar un nombre único:

- **`carousel`** para todo lo orientado a ruta/nav/UI de dashboard: `app/pages/dashboard/carousel/**`, `app/components/domain/project/dashboard/carousel/**`, `nav.dashboard_carousel.*`, `pages.dashboard_carousel.*`.
- **`slides`** para todo lo orientado a la entidad/API externa: `shared/types/project/slide.ts`, `shared/mappers/project/mapSlides.ts`, `server/services/project/slides/**`, `server/api/slides/**` (coincide con el path real del endpoint externo, `{API_URL}/slides` — mismo criterio que `server/api/faqs`↔`/faqs`, `server/api/news`↔`/news`). **Deviation deliberada respecto a Next**: el original agrupa los 5 servicios bajo `src/services/project/home/` (junto a otro código de la página de inicio); aquí se prefirió `server/services/project/slides/` para seguir la convención ya establecida de este proyecto (una carpeta de servicios por dominio/entidad, no por página consumidora).

### Piezas nuevas

- `shared/types/project/main.ts` (`CTA`) + `shared/types/project/slide.ts` (`Slide`, `SlideData`) — `Slide.id` es `string` (igual que `Faq.id`, a diferencia de `New.id: number`), `image` no-nullable, `data` opcional (un slide puede no tener contenido, solo imagen).
- `shared/mappers/project/mapSlides.ts` (`mapCTA`/`mapSlideData`/`mapSlide`/`mapSlides`) — port literal, mismo patrón defensivo `??` que `mapFaqs.ts`/`mapNews.ts`.
- `server/services/project/slides/{getSlides,getSlideById,addSlide,updateSlide,deleteSlide}.ts` — mismo patrón try/catch/`ServiceResult` que `faqs`. `getSlides` sin query params (la API de slides no pagina ni ordena, igual que `faqs`). `addSlide`/`updateSlide` reciben `cta?: CTA | null` y solo incluyen la clave en el body si es distinta de `undefined` — permite un `null` explícito para vaciar un CTA existente en edición, sin afectar al caso "sin CTA" en creación (donde la clave se omite entera).
- `server/api/slides/{index.get,index.post,[id].get,[id].patch,[id].delete}.ts` — mismo patrón que `server/api/faqs/*.ts`, **sin** `sanitizeRichText` en `description`: a diferencia de `faqs`/`news`, `SlideData.description` no es contenido rich text en el original (`FormAppTextArea` en `slideFormSchema.ts`, no `FormAppRichTextEditor` — confirmado leyendo `SlideForm.tsx`), así que no hay HTML que sanear.
- `app/components/domain/project/dashboard/carousel/{Slides.vue,SlidesBreadCrumbs.vue,components/{AddSlide,CarouselActions,CarouselActionButton,CarouselThumbnail}.vue,slide/{slideFormSchema.ts,SlideForm.vue},delete/DeleteSlide.vue}` — analogs directos de `Faqs`/`FaqsBreadCrumbs`/etc., con imagen (como `news`, no como `faqs`). `CarouselActions.vue`/`CarouselActionButton.vue`/`CarouselThumbnail.vue` van **prefijados desde el inicio** (mismo gotcha `NUXT_B3011` de siempre, ver sección de `news` arriba) — `CarouselThumbnail` colisionaba con el `Thumbnail.vue` ya existente de `news/components/`, no solo con `Actions`/`ActionButton` como en tareas anteriores. `Slides.vue` no necesita el wrapper `NewsRow`/`numericId` de `News.vue`: `Slide.id` ya es `string`.
- `app/components/domain/project/dashboard/carousel/slide/slideFormSchema.ts` — port del `superRefine` de `hasCta` (si `hasCta` es `true`, `ctaLabel`/`ctaLink` obligatorios), **sin** el `superRefine` que exige `imageId` del original: mismo criterio ya establecido para `NewForm.vue` (`imageId` opcional en el schema, sin validación que lo bloquee) — `SlideForm.vue` sigue ese precedente en vez de portar la validación más estricta de Next.
- `SlideForm.vue` — mismo patrón que `NewForm.vue` (`ImageUploader` 16:9 rect, `folder="slides"`, `outputSize`/`thumbnailSize`/`smallSize` explícitos) más los campos de CTA (`FormAppSwitch` "Añadir botón de acción" +, condicionalmente, `FormAppInputText`×2 + `FormAppSelect` para destino). El cuerpo del `PATCH`/`POST` envía `cta: undefined` (clave omitida) al crear sin CTA y `cta: null` explícito al editar para vaciar un CTA existente — mismo matiz que `addSlide`/`updateSlide` arriba.
- `app/pages/dashboard/carousel/{index,new,[id]}.vue` — mismo patrón que `dashboard/faqs/*.vue` (sin query params en el listado).
- `i18n.pages` (`nuxt.config.ts`): 3 entradas nuevas (`dashboard-carousel`, `dashboard-carousel-new`, `dashboard-carousel-id`), valores literales de `nav.dashboard_carousel.link`/`nav.dashboard_carousel.new.link` — esas claves de `nav` ya existían desde una fase anterior (pre-seed sin consumidor, ver `.project_docs/i18n.md`), sin haberse conectado a ninguna ruta real hasta ahora.
- `pages.dashboard_carousel` en `app/i18n/locales/{es,en}.json` — namespace nuevo, solo las claves que el código consume (mismo criterio que la decisión 73 de `CLAUDE.md`, `faqs`): sin `edit_slide_*` (no hay modal de edición, `EDIT_INLINE` fijo en `"true"`). 15 claves nuevas en `main.*` (`cta_label*`, `cta_link*`, `cta_target*`, `destination`, `external`, `internal`, `previous_slide`, `next_slide`, `go_to_slide`, `description_placeholder`) — el original las tenía todas bajo `main`, ninguna existía todavía en este proyecto.
- `DashboardMenu.vue` — entrada `dashboard_carousel` añadida en la misma posición que Next (justo después de `users`, antes de `dashboard_news`), resolviendo el hueco documentado en la sección anterior.
- **Carrusel público de la home**: `app/components/common/media/gallery/{Hero.vue,components/{Arrow,Dots}.vue}` + `app/components/domain/project/home/HomeHero.vue`, conectado en `app/pages/index.vue`. `HomeHero.vue` consume `useFetch('/api/slides')` (no llama al servicio directo: `server/services/**` es exclusivo de Nitro, decisión 3 de `CLAUDE.md` — a diferencia del original, que al ser un server component sí puede llamar a `getSlides()` directo). **Deviation deliberada respecto a Next**: `Hero.tsx` usa `framer-motion` (`AnimatePresence`+`motion.div`) para el cross-fade entre slides y el stagger de título/descripción/CTA — sin esa dependencia instalada en este proyecto (ni un equivalente Vue ya presente), se replica con un `<Transition>` nativo de Vue sin `mode` (enter/leave se solapan por defecto vía CSS, dando el mismo cross-fade que `AnimatePresence`) y `@keyframes` CSS con `animation-delay` para el stagger (0.3s/0.5s/0.7s, mismos tiempos que el original). Autoplay con `setInterval`, arrows/dots con los mismos aria-label (`main.previous_slide`/`main.next_slide`/`main.go_to_slide`) — misma UX, sin dependencia nueva.
- `app/pages/index.vue` deja de estar vacía: renderiza `<HomeHero />` dentro de `<MainContent maxWidth="max-w-none" padding="">`. Sin `HomeSchema`/`NewsCards`/`ProductsCards` todavía (fuera de alcance de esta tarea; `NewsCards` se portó en una tarea posterior, ver sección siguiente).

### Ninguna colisión `NUXT_B3011` (tras el prefijo aplicado)

`npx nuxt prepare` limpio. Nombres nuevos que sí necesitaron prefijo (ver arriba): `CarouselActions`, `CarouselActionButton`, `CarouselThumbnail`. El resto (`Slides`, `SlidesBreadCrumbs`, `AddSlide`, `SlideForm`, `DeleteSlide`, `Hero`, `Arrow`, `Dots`, `HomeHero`) no colisiona con ningún componente existente.

### Verificación de esta tarea

Contra la API real (`localhost:4000`, backend ya levantado en esta sesión):

- `npx nuxt prepare` limpio, sin `NUXT_B3011`.
- `tsc --noEmit` contra los 3 tsconfig generados (`server`/`app`/`shared`): sin errores nuevos en los archivos de esta tarea (mismo ruido preexistente de `.vue` sin `vue-tsc` de siempre).
- Suite de tests (`npm run test`): mismos 92/109 en verde que antes de esta tarea — los 17 fallos son el mismo conjunto preexistente y determinista documentado en la sección anterior (`DeleteFaq`/`DeleteNew`/`DeleteUser`/`FaqForm`/`NewForm`/`UserForm`), sin archivos de esta tarea entre ellos y sin regresión de conteo.
- `GET /api/slides` (sin sesión) devuelve datos reales (varios slides con imagen 1920×1080 + `thumbnail`/`small`, título, descripción y, en algunos, `cta`) mapeados correctamente por `mapSlides` — confirma servicio + mapper + endpoint de punta a punta contra datos de producción reales, no solo mocks. La forma real de la respuesta (incluido `id` numérico pese al tipo `Slide.id: string`, igual que ya ocurre con `Faq.id`/la API de `faqs`) coincide con lo asumido al escribir `mapSlide`.
- Home (`/`): SSR con datos reales — el HTML servido antes de hidratar ya contiene el título del primer slide y la imagen de fondo (confirmado con `curl`, no solo tras hidratar).
- Guard de rol: `/panel/carrusel`, `/panel/carrusel/nuevo`, `/panel/carrusel/[id]` y sus variantes `/en/dashboard/carousel*` sin sesión → `302` a `/sin-acceso`/`/not-access`, mismo comportamiento que `users`/`news`/`faqs`. **No verificado con sesión autenticada real** (no se dispuso de credenciales de prueba en el momento de esta verificación) — el ciclo CRUD completo (alta con imagen+CTA, edición, borrado) y la hidratación cliente del listado/formulario del dashboard quedan pendientes de un smoke test manual con sesión real, mismo gap que quedó para `news`/`faqs` en su momento (ver decisiones 69/74 de `CLAUDE.md`).

### Pendiente (no resuelto todavía)

- Tests de `Slides.vue`/`SlideForm.vue`/`DeleteSlide.vue`/`Hero.vue`/`HomeHero.vue`/servicios de `slides`/`server/api/slides/**` — sin suite propia todavía, mismo criterio incremental que el resto de dominios/páginas fuera de `users`/`news`/`faqs` dashboard.
- Ciclo CRUD completo del dashboard de `carousel` y su hidratación cliente con sesión real — ver «Verificación» arriba.
- `HomeSchema`/`ProductsCards` en la home — fuera de alcance de esta tarea, la home sigue sin esas piezas. `NewsCards` se portó en una tarea posterior, ver sección siguiente.

## Noticias destacadas de la home (`NewsCards`) + primitiva `ui/carousel`

Port de `src/components/project/news/NewsCards.tsx` (Next), la pieza que faltaba de `app/pages/index.vue` tras el carrusel de la home (`HomeHero`, ver sección anterior). Primer consumidor de una primitiva `ui/carousel` en este proyecto — a diferencia de `Hero.vue`/`HomeHero.vue` (carrusel de fondo a pantalla completa, con cross-fade nativo de Vue por decisión deliberada de no añadir `framer-motion`, ver sección anterior), aquí el original sí usa la primitiva `ui/carousel` de shadcn/ui (React + `embla-carousel-react`) para una fila de tarjetas deslizable — se porta igual, primitiva por primitiva, en vez de reinventar con CSS puro.

- **`app/components/ui/carousel/`** — añadida con `npx shadcn-vue@latest add carousel` (dependencias nuevas: `embla-carousel-vue`, base del `Carousel`/`CarouselContent`/`CarouselItem`/`CarouselNext`/`CarouselPrevious`; `@vueuse/core` ya estaba instalado). Mismo gotcha de reinyección de tokens de siempre (`--font-heading`, `@import` de Google Fonts, `@layer base { * { border-border… } body { bg-background… } }`) — revertido igual que en cada `shadcn-vue add` anterior, ver `.project_docs/design_system.md`.
- **`app/components/domain/project/news/NewsCards.vue`** — port literal de `NewsCards.tsx`: `useFetch('/api/news', { query: { featured: true, sort: 'date_desc', page: 1, limit } })` (no llama al servicio `getNews` directo — `server/services/**` es exclusivo de Nitro, decisión 3 de `CLAUDE.md` — mismo patrón que `HomeHero.vue`/`app/pages/news/index.vue`), sin sesión (listado público). Reusa `NewCard.vue`, ya portado con la sección pública de `news`. Solo `Carousel`+`CarouselContent`+`CarouselItem`, sin `CarouselNext`/`CarouselPrevious`: mismo subconjunto que renderiza el original en este componente concreto (sin flechas, solo scroll/swipe).
- **`pages.news.featured_title`** (`app/i18n/locales/{es,en}.json`) y **`main.welcome`** — dos claves nuevas, ambas existían ya en Next sin haberse portado todavía (`main.welcome` no tenía consumidor hasta ahora: el `<Title>`/`<PageTitle>` de bienvenida de la home no se había portado junto con `HomeHero`).
- `app/pages/index.vue` — añade `<PageTitle :title="t('main.welcome')" align="text-center" />` + `<NewsCards :limit="5" padding="px-4 pb-12" />` tras `<HomeHero />`, mismo orden que `Home()` en Next. Sigue sin `HomeSchema`/`ProductsCards` (fuera de alcance).

### Ninguna colisión `NUXT_B3011`

`npx nuxt prepare` limpio tras crear `NewsCards.vue` — no colisiona con ningún nombre existente (`News.vue`, dashboard, es un nombre de archivo distinto).

### Verificación de esta tarea

Contra la API real (`localhost:4000`, backend disponible en esta sesión):

- `npx nuxt prepare` limpio, sin `NUXT_B3011`.
- SSR real (`curl`): home en `es`/`en` sirve el título "Bienvenido a nuestra aplicación"/"Welcome to our application", la sección "Noticias destacadas"/"Featured news" y las tarjetas de noticias destacadas reales (2 en los datos de prueba disponibles) ya en el HTML antes de hidratar.
- Headless Chrome vía CDP: sin errores de consola ni excepciones tras hidratar, `embla-carousel-vue` inicializa correctamente (`[data-slot="carousel-content"]` presente, con los 2 `[data-slot="carousel-item"]` esperados). Único warning en consola es el ya documentado y no relacionado con esta tarea (`VUE_ROUTER_R0004` de un CTA de `HomeHero` que enlaza a `/productos/...`, dominio `products` no portado).
- **No verificado**: comportamiento del carrusel con más de ~5 noticias destacadas (suficientes para desbordar el ancho y requerir scroll/swipe real) — los datos de prueba disponibles en esta sesión solo tenían 2 noticias con `featured: true`. La primitiva (`embla-carousel-vue`) es la misma base que usa el resto del catálogo shadcn-vue probado en Next, sin razón para esperar un comportamiento distinto, pero no se ha confirmado visualmente con overflow real.
- Sin tests unitarios propios (`NewsCards.vue` no tiene suite): mismo criterio incremental que `HomeHero.vue`/`Hero.vue` — pendiente, ver `.project_docs/tests.md`.
- El fallo preexistente de 17 tests (`DeleteFaq`/`DeleteNew`/`DeleteUser`/`FaqForm`/`NewForm`/`UserForm`) — sin relación con esta tarea, ver la sección anterior y `.project_docs/tests.md`.

## Footer (`MainFooter`) + menú de footer

Port de `src/components/main/footer/MainFooter.tsx` + `src/components/main/navigation/footer/{FooterMenu,FooterNavigationButton}.tsx` (Next) — última pieza pendiente de `layout.tsx` fuera de `LoginLogout` (ya portado, ver sección «Menú de usuario y dashboard» arriba). `SelectLocale`/`ThemeToggle` seguían pendientes en el momento de esta tarea, **portados después** — ver secciones «Selector de idioma (`SelectLocale`)» y «Theme switcher (`ThemeToggle`)» más abajo. Petición explícita de esta tarea: el menú de footer solo incluye, por ahora, el botón de acceso a `faqs`.

### Piezas nuevas

- `app/components/domain/main/footer/MainFooter.vue` — port de `MainFooter.tsx`. `navItems` es un `computed<NavItem[]>` con una única entrada (`faqs`, usando las claves `nav.faqs.link`/`nav.faqs.label` ya existentes desde el esqueleto inicial de i18n) — **sin `demo`** (el otro item del original: el dominio `demo` no está portado en este proyecto, ni dashboard ni público, enlazarlo daría un `404`) y **sin `<CookiesConfigurator>`** (módulo de cookies/`CookiesConsent` no portado todavía, ver CLAUDE.md "Decisiones pendientes").
- `app/components/domain/main/navigation/footer/FooterMenu.vue` — port de `FooterMenu.tsx`, mismo patrón `visibleItems = navItems.filter(item => item.visible !== false)` que `MainNavigation.vue`. Sin `<CookiesConfigurator>`, mismo motivo que arriba.
- `app/components/domain/main/navigation/footer/FooterNavigationButton.vue` — port de `FooterNavigationButton.tsx`, mismas clases (`text-base sm:text-sm main-transition-color` + `text-primary-400`/`hover:text-primary-400` según `active`) y mismo `useIsNavActive` que `MainNavigationButton.vue` (menú principal, Fase de `MainHeader`) — reusado tal cual, sin adaptación. **Diferencia deliberada respecto a `MainNavigationButton.vue`**: no declara `emit('clickButton')` — ese emit solo tiene sentido en el menú principal para cerrar el `Sheet` de `MobileMenu.vue` al navegar; el footer no vive dentro de ningún `Sheet`, así que se omite en vez de dejar un emit sin listener.

### `MainFooter` se conecta en `app/layouts/default.vue` — visible también en `/dashboard/**`

Igual que `MainHeader`, `<MainFooter />` se añade directo en `app/layouts/default.vue`, tras el `<main id="main-content">`. Como `app/layouts/dashboard.vue` ya envuelve su contenido en `<NuxtLayout name="default">` (ver el gotcha de `MainHeader` desaparecido documentado en la sección de `users` arriba), el footer aparece automáticamente también en toda página de `/panel/**`\|`/dashboard/**`, sin tocar ese layout — mismo comportamiento que Next, donde `MainFooter` vive en `src/app/[locale]/layout.tsx` (el layout raíz que envuelve **toda** la app, dashboard incluido, porque `dashboard/layout.tsx` anida dentro de él).

No se ha tocado el `<div>` raíz de `default.vue` (sin `flex flex-col`/`h-full`): el `main.grow.flex.flex-col` ya presente desde antes de esta tarea no tenía ningún padre flex que lo activara (las clases base de `<body>` de Next — `h-full flex flex-col` — nunca se portaron, ver «Fuera de alcance» de la sección del menú principal) — gap preexistente, no introducido por esta tarea. En la práctica el footer simplemente queda justo debajo del contenido de cada página, sin pegarse al fondo del viewport en páginas cortas.

### Ninguna colisión `NUXT_B3011`

`npx nuxt prepare` limpio. Los 3 nombres nuevos (`MainFooter`, `FooterMenu`, `FooterNavigationButton`) no colisionan con ningún componente existente de `domain/` (`FooterNavigationButton` no colisiona con `MainNavigationButton`, nombres de archivo distintos).

### Verificación de esta tarea

- `npx nuxt prepare` limpio, sin `NUXT_B3011`.
- Smoke test con `curl` contra el `dev` server: `/` (es) sirve `<footer>` con el link `href="/preguntas-frecuentes"` y el texto "Preguntas frecuentes"; `/en` sirve `href="/faqs"` con "Frequently Asked Questions" — SSR correcto en ambos locales, ya en el HTML antes de hidratar.
- `/panel/preguntas-frecuentes` sin sesión sigue devolviendo `302` (guard de `dashboard.ts` no afectado por el footer).
- Suite de tests (`npm run test`): mismos 92/109 en verde que antes de esta tarea — los 17 fallos son el mismo conjunto preexistente y determinista ya documentado (`DeleteFaq`/`DeleteNew`/`DeleteUser`/`FaqForm`/`NewForm`/`UserForm`, ver sección de «mi-cuenta» arriba y `.project_docs/tests.md`), confirmado corriendo esos mismos archivos en aislamiento (pasan sueltos — el fallo agregado es un timeout de entorno bajo carga, no una regresión). Sin archivos de esta tarea entre los fallos.

### Pendiente (no resuelto todavía)

- Tests de `MainFooter.vue`/`FooterMenu.vue`/`FooterNavigationButton.vue` — sin suite propia todavía, mismo criterio incremental que el resto de componentes de navegación (`MainHeader`/`MainNavigation*`, ver «Pendiente» de la sección del menú principal).
- `demo` en el menú de footer, `<CookiesConfigurator>`, resto de `layout.tsx` (fuente `Commissioner`, `NextTopLoader`, `GlobalLoading`, `CookiesConsent`, skip-link, clases base de `<body>`) — ver «Fuera de alcance» de la sección del menú principal arriba. `LoginLogout`/`SelectLocale`/`ThemeToggle` ya portados, ver secciones «Menú de usuario y dashboard», «Selector de idioma (`SelectLocale`)» y «Theme switcher (`ThemeToggle`)».

## Parte pública — sección de preguntas frecuentes (`faqs`)

Port de `src/app/[locale]/(project)/faqs/{page,layout}.tsx` + `src/components/project/faqs/{FaqsBreadCrumbs,FAQs}.tsx` + `src/components/common/texts/Text.tsx` (Next) — el listado público en acordeón al que ya enlaza el footer (`MainFooter`, sección anterior). A diferencia de `news`, no hay página de detalle: es un único listado, sin paginación (la API de `faqs` no pagina, mismo comportamiento ya conocido del dashboard).

### ⚠️ Corrección de alcance previo: `pages.faqs` estaba mal nombrado (mismo desajuste que ya tuvo `news`)

El port del dominio `faqs` (dashboard, ver sección «Puerto del dominio `faqs`» arriba) usó el namespace `pages.faqs` para el listado/formulario de dashboard — exactamente el mismo error que tuvo `news` (ver «Corrección de alcance previo: `pages.news` estaba mal nombrado» arriba), sin detectarse entonces porque en ese momento no existía todavía ninguna página pública de `faqs` que expusiera el choque de nombres. El propio proyecto Next reserva `pages.faqs` para la página **pública** y `pages.dashboard_faqs` para el dashboard.

**Fix aplicado, mismo patrón que `news`**: las 8 referencias `pages.faqs.*` de `app/components/domain/project/dashboard/faqs/**` y `app/pages/dashboard/faqs/**` (incluidos `FaqForm.test.ts`/`DeleteFaq.test.ts`) se renombraron a `pages.dashboard_faqs.*` (mismo contenido, solo la clave — verificado que el guard de rol y los tests de dashboard siguen en verde tras el cambio), y se creó un `pages.faqs` nuevo y más pequeño (`seo_title`, `seo_description`, `title`, `description`) para la página pública de esta tarea. `nav.faqs`/`nav.dashboard_faqs` ya estaban correctamente separados desde el port del dominio — solo `pages.*` tenía el desajuste, igual que en `news`. Detalle en `.project_docs/i18n.md`.

### Piezas nuevas

- `app/components/common/texts/Text.vue` — port de `src/components/common/texts/Text.tsx` (Next), que usa `html-react-parser` para renderizar HTML embebido en `text`; equivalente nativo de Vue: `v-html` sobre un `<span>` estático — mismo patrón ya establecido en `PageTitle.vue` y en `app/pages/news/[slug].vue`, sin el gotcha de ese componente (`:is` dinámico + `v-html`, aquí no hay tag variable). Primer consumidor real de la clase `.ckcontent` fuera de `AppRichTextEditor.vue` (portada en la Fase 7, con el comentario explícito "se porta cuando el componente que lo usa se porte" — este es ese componente).
- `app/components/domain/project/faqs/PublicFaqsBreadCrumbs.vue` — port de `FaqsBreadCrumbs.tsx` (público). Prefijado `Public*` (mismo motivo que `PublicNewsBreadCrumbs.vue`: colisión de nombre con el análogo del dashboard, `FaqsBreadCrumbs.vue`, ver gotcha `NUXT_B3011` en CLAUDE.md). Sin prop `link` (a diferencia de `PublicNewsBreadCrumbs.vue`): la sección pública de faqs no tiene página de detalle por pregunta, el breadcrumb es siempre `Inicio > Preguntas frecuentes`.
- `app/components/domain/project/faqs/PublicFaqs.vue` — port de `FAQs.tsx`. Prefijado `Public*` por el mismo motivo: el dashboard ya tiene `Faqs.vue` (listado, `app/components/domain/project/dashboard/faqs/Faqs.vue`) — en Next los nombres solo se diferencian por capitalización (`FAQs.tsx` vs `Faqs.tsx`), una distinción demasiado frágil para replicar como nombre de componente global en Nuxt. `Accordion`+`AccordionItem`+`AccordionTrigger`+`AccordionContent` (`ui/accordion`, nueva primitiva — ver `.project_docs/design_system.md`) con `type="multiple"`, sin `default-value` (todos los items cerrados al cargar, igual que el original); cada trigger usa `PageTitle` `type="h3"`, cada contenido usa `Text` (arriba) sobre `faq.description`.
- `app/pages/faqs/index.vue` — `useFetch<Faq[]>('/api/faqs')`, reusando el mismo endpoint que ya consume el dashboard (`server/api/faqs/index.get.ts`, alcanzable sin sesión — mismo patrón que `/api/news`, ver sección de `news` público arriba), sin query params. Fallback sin resultados: `<p>{{ t('main.no_results') }}</p>` — mismo patrón ya establecido por `app/pages/news/index.vue`, en vez de portar el componente `NoContent.vue` del original (icono + título + mensaje) solo para este único consumidor.
- `i18n.pages` (`nuxt.config.ts`): una entrada nueva, `faqs` (`app/pages/faqs/index.vue` → nombre de ruta `faqs`), valor literal de `nav.faqs.link` (`/preguntas-frecuentes` \| `/faqs`).
- `--main-card-bg`/`--main-card-border` (`app/assets/css/main.css`) — tokens pendientes desde la Fase 2 (documentados como "todavía no portado" en `.project_docs/design_system.md`), añadidos ahora: primer consumidor real es `PublicFaqs.vue` (`bg-main-card-bg`/`border-main-card-border` en cada `AccordionTrigger`/`AccordionItem`).

### Sin JSON-LD ni `NoContent.vue` (fuera de alcance, mismo criterio que `news`)

- **`FaqsSchema`**: el original genera `<script type="application/ld+json">` (`WebPage`+`BreadcrumbList`). Mismo motivo que la sección pública de `news` (ver «Fuera de alcance» de esa sección): este proyecto no tiene tipo/mapper `SEO` todavía.
- **`NoContent.vue`**: no se ha portado como componente propio — se sigue el patrón ya establecido por `app/pages/news/index.vue` (un `<p>` con `main.no_results`), evitando introducir un componente nuevo (con icono `BanIcon` y una clave `main.no_results_message` que no existe todavía) para un único consumidor.

### Ninguna colisión `NUXT_B3011`

`npx nuxt prepare` limpio. Los nombres nuevos que sí necesitaron prefijo (mismo gotcha de siempre, ver sección de `news` dashboard arriba): `PublicFaqsBreadCrumbs`, `PublicFaqs`. `Text` no colisiona con nada existente.

### Verificación de esta tarea

Contra la API real (backend disponible en esta sesión):

- `npx nuxt prepare` limpio, sin `NUXT_B3011`.
- SSR real (`curl`): `/preguntas-frecuentes` (es) y `/en/faqs` sirven título/`<h1>`/breadcrumb correctos (`<title>Preguntas frecuentes | MyNuxtApp</title>`/`<title>Frequently Asked Questions | MyNuxtApp</title>`) y 5 `[data-slot="accordion-item"]`/`[data-slot="accordion-trigger"]` con datos reales (`GET /api/faqs` real, ids numéricos pese al tipo `Faq.id: string` — mismo desajuste ya conocido de `faqs`/`slides`, no nuevo) — confirma servicio + mapper + endpoint reusado de punta a punta.
- Tokens `bg-main-card-bg`/`border-main-card-border` presentes en el HTML servido (5 de cada, uno por pregunta).
- `[data-slot="accordion-content"]` cerrado por defecto se sirve como `<!--v-if-->` en SSR (reka-ui no monta el contenido hasta que el item se abre, mismo comportamiento que `CollapsibleContent` de Radix/el original) — no se pudo confirmar con `curl` el HTML interno de `Text.vue`/`.ckcontent` dentro de un item cerrado; verificado indirectamente por `GET /api/faqs` devolviendo HTML válido y por ser el mismo patrón `v-html` ya verificado en `PageTitle.vue`/`app/pages/news/[slug].vue`.
- `/panel/preguntas-frecuentes` (dashboard) sigue devolviendo un redirect de guard sin sesión (en el momento de este port degradaba a `404` porque `/sin-acceso`/`/not-access` no tenía página propia — gap preexistente heredado, no introducido aquí, resuelto después, ver sección «Páginas de error: 404 (`not-found`) y sin acceso (`not-access`)» más abajo) — confirma que el rename `pages.faqs`→`pages.dashboard_faqs` no rompió el guard ni el dashboard.
- Suite de tests (`npm run test`): mismos 86/109 en verde (14 fallos + `FaqForm.test.ts` con 3 más al ejecutarse en el mismo archivo, 17 en total) que el conjunto preexistente y determinista ya documentado (`DeleteFaq`/`DeleteNew`/`DeleteUser`/`FaqForm`/`NewForm`/`UserForm`) — confirmado corriendo `Faqs.test.ts`/`FaqForm.test.ts` en aislamiento (`Faqs.test.ts` pasa suelto; `FaqForm.test.ts` reproduce los mismos 3 fallos de `waitFor`/`AppToast` ya conocidos, no relacionados con el rename de `pages.faqs`). Sin archivos de esta tarea entre los fallos nuevos.

### Pendiente (no resuelto todavía)

- Tests de `PublicFaqs.vue`/`PublicFaqsBreadCrumbs.vue`/`Text.vue`/`app/pages/faqs/index.vue` — sin suite propia todavía, mismo criterio incremental que el resto de páginas públicas (`app/pages/news/**`, ver sección anterior).
- JSON-LD (`FaqsSchema`), `NoContent.vue` — ver «Sin JSON-LD ni `NoContent.vue`» arriba.
- Verificación con headless Chrome/Playwright de la interacción real del acordeón (abrir un item y confirmar que `Text.vue`/`.ckcontent` renderiza el HTML de la descripción sin errores de consola) — no se completó en esta sesión (sin `playwright`/`puppeteer` instalado como dependencia del proyecto, solo un binario CLI suelto sin el paquete npm correspondiente disponible). Confianza alta por ser el mismo patrón `v-html` ya verificado en `PageTitle.vue` y en el detalle público de `news`, pero sin confirmación visual directa — pendiente de un smoke test manual.
- El fallo preexistente de 17 tests (`DeleteFaq`/`DeleteNew`/`DeleteUser`/`FaqForm`/`NewForm`/`UserForm`) — sin relación con esta tarea, ver secciones anteriores y `.project_docs/tests.md`.

## Selector de idioma (`SelectLocale`)

Port de `src/components/main/navigation/i18n/SelectLocale.tsx` (Next) — la primera de las dos piezas que quedaban pendientes en la columna derecha de `MainHeader` (junto al `ThemeToggle`, que sigue sin portar), colgada en el hueco `LOCALE` que dejó preparado una tarea anterior (ver «Fuera de alcance» de la sección del menú principal).

### Piezas nuevas

- `app/components/domain/main/navigation/i18n/SelectLocale.vue` — reusa `common/forms/AppSelect.vue` (ya portado, Fase 7), igual que el original. **Adaptación, no port literal**: el original construye un estado `selected`/`isPending` local con `useTransition` de React porque cambiar de idioma con next-intl exige reconstruir el pathname a mano (`router.replace({ pathname, params }, { locale })`); aquí `setLocale()` — el método que `useI18n()` expone por extensión propia de `@nuxtjs/i18n` sobre el composer de vue-i18n, no de vue-i18n en sí — ya resuelve la navegación a la ruta localizada y actualiza `locale` de forma reactiva, así que el `value` del `AppSelect` se liga directo a `locale` sin estado propio. Se conserva un `pending` local solo para deshabilitar el select mientras `setLocale()` resuelve (equivalente a `isPending`).
- `main.select_language` en `app/i18n/locales/{es,en}.json` — única clave nueva, placeholder del select (`t('main.select_language')`), copiada literal del namespace `main` de Next. Sin ningún `@` literal (ver el gotcha ya conocido del compilador de vue-i18n, `.project_docs/i18n.md`).
- `MainHeader.vue` — reemplaza el placeholder `<div>LOCALE</div>` de la columna derecha por `<SelectLocale />`, sin más cambios de layout.

### Sin cambios frente al original (más allá de la adaptación de navegación)

Las opciones del select (`languageOptions`) se siguen construyendo desde `routingConfig` (`app/i18n/routing.ts`, ya existente desde la Fase 3) — `Object.entries(routingConfig.aliases)` para mapear cada alias corto (`es`/`en`, el valor real del `<option>`, el mismo que usa `@nuxtjs/i18n` como prefijo de ruta) a su nombre legible en `routingConfig.names`. Ningún cambio en `routingConfig` ni en el bloque `i18n` de `nuxt.config.ts`.

### Verificación de esta tarea

- `npx nuxt prepare` limpio, sin `NUXT_B3011` (`SelectLocale` no colisiona con ningún componente existente).
- SSR real (`curl`): `/` sirve el placeholder "Selecciona tu idioma" y ambas opciones ("Español"/"English") en el HTML; `/en` sirve "Select your language" — namespace `main` resuelto correctamente en los dos locales.
- Smoke test con headless Chrome vía CDP (mismo método que fases anteriores, driving directo del protocolo con el paquete `ws` ya presente como dependencia transitiva — sin `playwright`/`puppeteer` instalados): en `/`, clicar el trigger del select (`id="locale"`) abre las 2 opciones (`role="option"`); clicar "English" navega a `http://localhost:3000/en` **sin recarga completa** (`performance.getEntriesByType("navigation")` solo contiene la entrada `"navigate"` inicial, ninguna adicional) y el trigger pasa a mostrar "English" — confirma que `setLocale()` navega client-side y que el select refleja el locale nuevo sin remontar. Sin errores de consola nuevos (el único warning visto, `VUE_ROUTER_R0004` sobre una ruta `/productos/**` sin match, es preexistente y no relacionado: el dominio público `products` no está portado, ver «Decisiones pendientes» del `CLAUDE.md`).

### Pendiente (no resuelto todavía)

- Test de componente de `SelectLocale.vue` — sin suite propia todavía, mismo criterio incremental que el resto de componentes de navegación (`MainHeader`/`MainNavigation*`, ver «Pendiente» de la sección del menú principal).
- `<html lang>` dinámico (`useLocaleHead()`) — cambiar de idioma no actualiza el atributo `lang` del documento; ya estaba listado como pendiente en `.project_docs/i18n.md` antes de esta tarea, sin relación directa con `SelectLocale` pero visible ahora que hay un selector real con el que probarlo.

`ThemeToggle` (el último hueco de la columna derecha de `MainHeader`) ya se portó — ver sección «Theme switcher (`ThemeToggle`)» más abajo.

## Theme switcher (`ThemeToggle`)

Port de `src/components/common/ThemeToggle.tsx` (Next) — el último hueco pendiente de la columna derecha de `MainHeader` (ver «Fuera de alcance» de la sección del menú principal y «Decisiones pendientes» del `CLAUDE.md`). Reemplaza el placeholder `<div>THEME</div>`.

### Piezas nuevas

- **`@nuxtjs/color-mode` (nueva dependencia)**, no una reimplementación manual de la máquina de estados de `next-themes`: añade el script inline que fija la clase `dark`/`light` en `<html>` antes del primer paint (evita el flash de tema incorrecto, mismo objetivo que el script inline que inyecta `next-themes`) más el composable `useColorMode()` (auto-importado). `classPrefix`/`classSuffix` se dejan en su default (`''` ambos) porque ya generan exactamente la clase `dark`/`light` que espera `@custom-variant dark (&:where(.dark, .dark *))` en `main.css` (preparado desde la Fase 2 a la espera de este switcher). Config en `nuxt.config.ts` (bloque `colorMode`):
  - `preference: process.env.NUXT_PUBLIC_DEFAULT_THEME || 'dark'` — equivalente a `defaultTheme={NEXT_PUBLIC_DEFAULT_THEME ?? "dark"}` del original; al no ser nunca `'system'` (el único valor especial que activa la detección por `prefers-color-scheme`), replica `enableSystem={false}` sin necesitar un flag aparte — `ThemeToggle.vue` nunca asigna `'system'` a `colorMode.preference`.
  - `storageKey: \`${process.env.NUXT_PUBLIC_APP_NAME}-theme\`` — equivalente a `storageKey={\`${NEXT_PUBLIC_APP_NAME}-theme\`}`. Leído directo de `process.env` en `nuxt.config.ts` (contexto Node, nunca bundleado al cliente), mismo criterio que `API_URL` (decisión 19 de `CLAUDE.md`) — no vía `runtimeConfig.public`, porque el valor solo se consume al generar la config del módulo, no en código de cliente.
  - Nueva variable `NUXT_PUBLIC_DEFAULT_THEME` en `.env`/`.env.example`.
- **`app/components/common/ThemeToggle.vue`** — icono sol/interruptor/icono luna, mismas clases que el original (`Switch` de `ui/switch` directo, sin wrapper `AppSwitch`, igual que el original no envuelve su `Switch` tampoco). `isDark = computed(() => colorMode.value === 'dark')`, `onCheckedChange` asigna `colorMode.preference` (nunca `'system'`). Claves `main.switch_to_light_theme`/`main.switch_to_dark_theme` añadidas a `app/i18n/locales/{es,en}.json`, copiadas literales del namespace `main` de Next.
- **`app/components/ui/sonner/Sonner.vue` sincronizado con el tema real**: el original (`ui/sonner.tsx`) pasa `theme={theme}` de `useTheme()` al `Toaster` de `sonner` para que los toasts usen la paleta claro/oscuro correcta; el `Sonner.vue` ya portado en la Fase 8 no pasaba ningún `theme` (sin consecuencia visible hasta ahora porque no existía ningún tema oscuro alcanzable). Se añade `const theme = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')` y se liga a `:theme="theme"` antes de `v-bind="delegatedProps"` (mismo orden que el spread `{...props}` posterior al `theme=` explícito del original — si un consumidor pasa `theme` como prop, sigue ganando).
- `MainHeader.vue` — reemplaza el placeholder `<div>THEME</div>` por `<ThemeToggle />`.

### ⚠️ Gotcha real, encontrado y corregido en esta tarea: `:disabled="colorMode.unknown"` rompía el switch tras la primera hidratación

Primer intento, traducción literal del guard de hidratación del original (`disabled={!mounted}`, necesario en next-themes porque `resolvedTheme` es literalmente `undefined` hasta que next-themes hidrata en cliente): `:disabled="colorMode.unknown"` (`unknown` es el flag equivalente de `@nuxtjs/color-mode`, `true` durante SSR y hasta que el plugin cliente del módulo resuelve el valor real tras montar la app).

Confirmado con headless Chrome (Playwright): esto producía un **hydration attribute mismatch real de Vue** — SSR renderiza `disabled="true"` (`colorMode.unknown` es `true` en servidor), pero el primer render de cliente ya esperaba `disabled` ausente; Vue **no repara** esta clase de mismatch en el DOM (`"this mismatch is check-only... DOM will not be rectified"`), dejando el `<button>` real permanentemente deshabilitado — ni un click real de usuario ni uno sintético forzado lo destraba, en todas las cargas probadas (`/`, tras reload, en `/en`).

**Fix — se elimina el prop `disabled` por completo**, no se persigue el guard: a diferencia de `resolvedTheme` en next-themes, `colorMode.value` de `@nuxtjs/color-mode` **nunca es `undefined`** — ya viene resuelto desde el primer render SSR al valor de `preference` configurado, así que leerlo/escribirlo antes de montar es siempre seguro y el guard no protegía nada real en este entorno. Verificado de nuevo con headless Chrome tras el fix: ciclo completo click→toggle→persistencia→reload→click en ambas direcciones, sin ningún warning de hidratación, sin flash de tema incorrecto tras reload (`<html>` ya lleva la clase correcta en `domcontentloaded`, antes de que corra ningún JS de cliente).

### Verificación de esta tarea

- `npx nuxt prepare` limpio, sin `NUXT_B3011`.
- Headless Chrome (Playwright, dos rondas — la segunda tras el fix del gotcha de arriba): carga inicial con `<html class="dark">` y switch en estado "on"; click real togglea `<html>` a sin clase `dark` (modo claro), cambia el color de fondo visible (verificado leyendo `background-color` computado del header, no solo el atributo), actualiza `aria-checked`/`data-state`, y persiste en `localStorage['MyNuxtApp-theme']`; reload completo conserva el tema elegido sin flash (clase correcta ya presente en `domcontentloaded`); click de vuelta a oscuro funciona igual. Sin warnings de hidratación ni errores de consola nuevos en ninguna carga (único ruido: los `VUE_ROUTER_R0004` preexistentes de `/productos/**`, sin relación, dominio `products` no portado).
- `aria-label` verificado en ambos locales: "Cambiar a tema claro"/"Cambiar a tema oscuro" en `/`, "Switch to light theme"/"Switch to dark theme" en `/en` — namespace `main` resuelto, sin `[intlify] Not found`.

### Pendiente (no resuelto todavía)

- Test de componente de `ThemeToggle.vue` — sin suite propia todavía, mismo criterio incremental que `SelectLocale.vue`/`HomeHero.vue`/`NewsCards.vue`.
- `<html lang>` dinámico (`useLocaleHead()`) — pendiente preexistente, sin relación con esta tarea, ver arriba.

## Páginas de error: 404 (`not-found`) y sin acceso (`not-access`)

Cierra el gap documentado repetidas veces desde el port de `news` («`/sin-acceso`/`/not-access` no tiene página propia todavía» — ver notas de `users`/`news`/`faqs`/`account`/`carousel` más arriba): cada guard de sesión/rol (`dashboard.ts`, `account.ts`, `guest.ts`) ya redirigía a `nav.not_access.link`, pero sin página que la resolviera degradaba a `404`. Port de `src/app/[locale]/(error)/not-access/page.tsx` + `src/app/[locale]/not-found.tsx` + `src/components/error/ErrorContent.tsx` (Next). `content-error`/`ContentErrorPage` (la tercera página de `(error)/` en Next) queda fuera de alcance de esta tarea — sin consumidor que redirija ahí todavía en este proyecto (a diferencia de `not-access`, ya referenciado desde los tres guards).

### Piezas nuevas

- **`app/components/domain/error/ErrorContent.vue`**: port literal de `ErrorContent.tsx` — `<h1>` con `code`/`title` + `<span>` de `message`, mismas clases (`text-neutral-900 dark:text-neutral-200`). Sin lógica, solo 3 props.
- **`app/pages/not-access.vue`**: página normal (layout `default`, con `MainHeader`/`MainFooter`, igual que el original la anida dentro del layout raíz), sin middleware de guard propio — es el destino de una redirección, no una ruta protegida. `ErrorContent` con `code="401"` + `pages.not_access.title/message`. Ruta registrada en `nuxt.config.ts` (`i18n.pages['not-access']`, `es: '/sin-acceso'` / `en: '/not-access'`) — coincide con los valores ya existentes de `nav.not_access.link`, portados junto con el menú de usuario/dashboard (ver decisión 85 de `CLAUDE.md`) pero sin página que los resolviera hasta ahora.
- **`app/error.vue`**: fichero especial de Nuxt (equivalente combinado del `not-found.tsx` de Next + su convención de catch-all `[...slug]/page.tsx` — Nuxt no distingue "página no encontrada" de "error genérico", ambos pasan por este único fichero raíz). Envuelve el contenido en `<NuxtLayout name="default">` a mano (un `error.vue` no hereda ningún layout automáticamente, a diferencia de una página normal) para conservar header/footer, igual que el `not-found.tsx` original al vivir dentro del layout `[locale]`. Si `error.statusCode === 404` usa `pages.not_found.title/message`; cualquier otro código cae a un fallback genérico con el `statusCode`/`statusMessage`/`message` reales del error (sin inventar una página `content-error` que nada usa todavía).
- `pages.not_found` (`title`/`message`) y `pages.not_access` (`seo_title`/`seo_description`/`title`/`message`) añadidas a `app/i18n/locales/{es,en}.json`, copiadas literales del namespace `pages` de Next (`nav.not_access`/`nav.content_error` ya existían desde el port del menú de usuario/dashboard, sin cambios).

### Verificación de esta tarea

- `npx nuxt prepare` limpio, sin `NUXT_B3011` (no hacía falta prefijo: ni `ErrorContent` ni `not-access` colisionan con ningún componente/ruta existente).
- `curl` contra el dev server, ambos locales: `GET /esto-no-existe` y `GET /en/this-does-not-exist` responden `404` con `Accept: text/html` (con el `Accept: */*` por defecto de `curl`, Nitro devuelve el JSON de error nativo en vez de renderizar `error.vue` — comportamiento esperado de h3, no un bug; un navegador real siempre manda `text/html`) — título/mensaje traducidos correctamente en el locale correspondiente (`Página no encontrada`/`Page Not Found`), con `<header>`/`<footer>` presentes. **Confirma que la detección de locale de `@nuxtjs/i18n` funciona también en rutas sin match** (`/en/lo-que-sea` resuelve a `en`, no cae al default `es`) — no daba por sentado que esto funcionara igual que en una ruta con match real. `GET /sin-acceso` y `GET /en/not-access` responden `200` con el título/mensaje correctos (`Sin acceso`/`No Access`).
- No verificado con headless Chrome (sin sesión real disponible para confirmar el guard→`not-access`→render end-to-end en el navegador, solo la redirección a nivel de URL ya estaba confirmada desde el port de `carousel`/`account`) — la verificación de esta tarea se limitó a `curl`.

### Pendiente (no resuelto todavía)

- `content-error`/`ContentErrorPage` (tercera página de `(error)/` en Next) — sin consumidor real en este proyecto todavía (ningún `redirect`/`navigateTo` apunta ahí), se porta cuando exista uno.
- Tests de `ErrorContent.vue`/`app/pages/not-access.vue`/`app/error.vue` — sin suite propia todavía, mismo criterio incremental que el resto de páginas públicas/`ThemeToggle`/`SelectLocale`.
- Verificación interactiva (headless Chrome) del flujo completo guard→`not-access` en navegador real.
