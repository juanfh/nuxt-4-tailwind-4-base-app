# Modelos — nuxt-4-tailwind-4-base-app

Consultar cuando: se necesite añadir un tipo nuevo en `shared/types/`, un mapper nuevo en `shared/mappers/`, o entender por qué un mapper vive en una subcarpeta distinta a la del tipo que produce.

Fase 4 del proyecto: solo se han portado las entidades `user`/`session`/`image` (y su dependencia `Image`), necesarias para los servicios de `server/services/auth/`. Réplica literal de `src/types/{user,session,image}.ts` y `src/mappers/{mapUsers,project/mapImages}.ts` de `next-16-tailwind-4-base-app`. El resto de entidades (`project/product`, `profile`...) se porta fase a fase, según el dominio que se migre — `project/faq`, `project/new`, `project/slide` ya se portaron (ver abajo).

**Actualización Fase 5**: `session.ts` dejó de ser una adaptación standalone — con `@sidebase/nuxt-auth` (provider `authjs`, sobre `next-auth` v4) ya resuelto como librería de sesión, vuelve a extender `Session`/`User` de `next-auth` igual que el original. Ver `.project_docs/auth.md`.

## Tipos portados (`shared/types/`)

| Archivo | Tipos | Notas |
|---|---|---|
| `image.ts` | `ImageBase`, `Image` | Port literal de `src/types/image.ts`. Dependencia de `User.image`. |
| `user.ts` | `UserMin`, `User`, `LoginUser`, `LoginUserMin` | Port literal de `src/types/user.ts`. `User extends UserMin` con `role`/`image`. |
| `session.ts` | `ExtendedUser`, `ExtendedSession` | Port literal desde la Fase 5 (extiende `next-auth`) — ver `.project_docs/auth.md`. |

## `session.ts` extiende `next-auth`

Igual que el original (`src/types/session.ts`): `ExtendedUser extends User { token: string }` y `ExtendedSession = Omit<Session, "user"> & { user: ExtendedUser }`, donde `Session` viene de la librería `next-auth` (instalada en Fase 5 como dependencia de `@sidebase/nuxt-auth`, provider `authjs`):

```ts
import type { Session } from 'next-auth'
export interface ExtendedUser extends User { token: string }
export type ExtendedSession = Omit<Session, 'user'> & { user: ExtendedUser }
```

`import type` se borra en build — no bundlea código de `next-auth` al cliente pese a vivir en `shared/types/` (isomórfico). En Fase 4 este tipo era una adaptación standalone (sin librería de auth resuelta todavía); superado en Fase 5, ver `.project_docs/auth.md`.

## Mappers portados (`shared/mappers/`)

| Archivo | Funciones | Notas |
|---|---|---|
| `mapUsers.ts` (raíz, no bajo `project/`) | `mapUserMin`, `mapUser`, `mapUsers` | Port literal de `src/mappers/mapUsers.ts` — vive en la raíz de `mappers/` en el proyecto Next (no bajo `project/`, a diferencia de `mapImages`), así que se replica igual aquí pese a la inconsistencia aparente. |
| `project/mapImages.ts` | `mapImageBase`, `mapImage`, `mapImages` | Port literal de `src/mappers/project/mapImages.ts`. Dependencia de `mapUser` (campo `image`). |

Todos los mappers reciben `any` (sin tipar el shape de la respuesta cruda de la API, igual que el original) y aplican *nullish coalescing* defensivo en cada campo (`user?.profile?.name ?? ''`) — la API externa nunca puede tirar el mapper con un `undefined`.

**Import explícito, no auto-import**: `shared/mappers/` no es uno de los dos nombres reservados de Nuxt (`shared/utils/`, `shared/types/`), así que sus funciones se importan siempre explícitas vía el alias `#shared/mappers/...` (ej. `import { mapUser } from '#shared/mappers/mapUsers'`) — decisión ya documentada en `CLAUDE.md` (Fase 1, decisión 1). `shared/types/` sí se auto-importa; los `import type` explícitos que aparecen en este código son solo por claridad, no estrictamente necesarios.

## Dominio `news` (segundo dominio de dashboard portado)

- `shared/types/project/new.ts`: `New` (`id: number`, `slug`, `title`, `shortDescription`, `image: Image` — **no** nullable, a diferencia de `User.image: Image | null` — `date`, `featured`) y `NewDetail extends New { description: string }`. Port de `src/types/project/new.ts` (Next) **sin el campo `seo: SEO`** de `NewDetail`: este slice es dashboard-only (ver `.project_docs/routes.md`), nada renderiza JSON-LD, y este proyecto no tiene `SEO`/`mapSeo` portado — añadirlo habría sido código sin consumidor.
- `shared/mappers/project/mapNews.ts`: `mapNew`, `mapNews`, `mapNewDetail` — mismo estilo defensivo que `mapUsers.ts`, reutiliza `mapImage` de `mapImages.ts` sin cambios (dependencia ya existente, domain-agnostic).
- `shared/utils/slugify.ts` (`slugify`, `SLUG_REGEX`) y `shared/utils/stripHtml.ts` — nuevos, puros, port literal de `src/utils/{slugify,stripHtml}.ts` (Next). No son mappers ni types pero se documentan aquí por ser dependencias directas de `newFormSchema.ts` (validación del `slug` y de que el rich text de `description` no esté vacío tras quitar las etiquetas HTML).
- `shared/utils/formatDate.ts` ganó `toISODateTime`/`toISODateTimeEndOfDay` (pendientes desde la Fase 8) — ver `.project_docs/api_client.md` para su uso en `getNews.ts`/`addNew.ts`/`updateNew.ts`.

## Dominio `faqs` (tercer dominio de dashboard portado)

- `shared/types/project/faq.ts`: `Faq { id: string, title: string, description: string }` — port literal de `src/types/project/faq.ts` (Next). El tipo más simple de los tres: sin variante `FaqDetail` (a diferencia de `New`/`NewDetail`), porque `description` ya viene incluida en el único tipo.
- `shared/mappers/project/mapFaqs.ts`: `mapFaq`, `mapFaqs` — mismo estilo defensivo (nullish coalescing, `''` por defecto en cada campo) que `mapUsers.ts`/`mapNews.ts`. Sin dependencias de otros mappers (a diferencia de `mapNews`, que reutiliza `mapImage`): `faqs` no tiene imagen.
- Sin utilidades nuevas: `faqs` no necesita `slugify`/`stripHtml` propios de dominio (`stripHtml` ya existe desde el port de `news` y se reutiliza tal cual en `faqFormSchema.ts` para el refine de `description`), ni fechas.

## Dominio `carousel`/`slides` (cuarto dominio de dashboard portado)

- `shared/types/project/main.ts`: `CTA { label, link, target: 'self' | 'blank' }` — port literal de `src/types/project/main.ts` (Next). Único consumidor: `SlideData.cta`.
- `shared/types/project/slide.ts`: `Slide { id: string, image: Image, data?: SlideData }`, `SlideData { title, description?, cta? }` — port literal de `src/types/project/slide.ts` (Next). `id` es `string` (igual que `Faq.id`, no `number` como `New.id`), `image` no-nullable (igual que `New.image`), `data` opcional (a diferencia de `New`/`Faq`, un slide puede no tener contenido, solo imagen).
- `shared/mappers/project/mapSlides.ts`: `mapCTA`, `mapSlideData`, `mapSlide`, `mapSlides` — mismo estilo defensivo que el resto, reutiliza `mapImage` de `mapImages.ts` (campo `image`, igual que `mapNew`/`mapUser`).
- Sin utilidades nuevas: `carousel` no necesita `slugify`/`stripHtml`/fechas propias — `description` no es rich text en este dominio (ver `.project_docs/api_client.md`).

## `Profile` (perfil de mi-cuenta)

- `shared/types/profile.ts`: `Profile { id, name, surname, birthdate, gender, phone, email, image: Image | null }` — port literal de `src/types/profile.ts` (Next). Distinto de `shared/types/project/user.ts` (el `User` completo del dashboard, con `role`) — `Profile` es el shape que devuelve `GET {API_URL}/auth/profile` (el propio usuario autenticado, sin `role`), no un recurso de administración de otros usuarios.
- `shared/mappers/account/mapProfile.ts`: `mapProfile` — mismo estilo defensivo que el resto, reutiliza `mapImage` de `mapImages.ts` (campo `image`, igual que `mapUser`). Vive en `shared/mappers/account/` (no en la raíz ni bajo `project/`) porque así lo hace el original (`src/mappers/account/mapProfile.ts`).
