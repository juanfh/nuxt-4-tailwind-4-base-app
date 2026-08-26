# Componentes de formulario — nuxt-4-tailwind-4-base-app

Consultar cuando: se necesite tocar un control `common/forms/App*.vue`/`FormApp*.vue`, entender cómo se integra VeeValidate+Zod, añadir un control de formulario nuevo, o saber por qué el prop `control` de React no existe en la versión Vue.

Fase 7 del proyecto: port literal de `src/components/common/forms/**` (Next, react-hook-form + Zod) a Vue + VeeValidate + Zod. Se portan los 12 controles base `App*` + los 11 wrappers `FormApp*` + `InlineFormContainer` — **no** los formularios de dominio (`UserForm`, `ProductForm`...), que se portan fase a fase junto con el dominio que consumen (ver `next-16-tailwind-4-base-app/.project_docs/components.md` para su documentación).

## Por qué VeeValidate (no otra librería)

Es el equivalente directo de react-hook-form en el ecosistema Vue: `useForm()`/`useField()` sobre Composition API, con el mismo adaptador de validación por schema (`@vee-validate/zod`'s `toTypedSchema()`, equivalente a `@hookform/resolvers/zod`'s `zodResolver()`). `zod` se instaló en la misma versión exacta que usa Next (`4.4.3`, ver `package.json` de ambos proyectos) — fidelidad deliberada, no una coincidencia.

## Patrón `App<Control>` + `FormApp<Control>` — igual intención, mecanismo distinto

Mismo patrón de dos capas que el original (ver `next-16-tailwind-4-base-app/.project_docs/components.md`, sección "common/forms/"):

1. **`App<Control>.vue`** (controlado, sin VeeValidate): recibe `value`/`label`/`required`/`disabled`/`error` como props planos — igual que el original.
2. **`FormApp<Control>.vue`** (integración VeeValidate): envuelve el anterior, resolviendo `value`/`error`/`onChange` desde `useField(name)` en vez de desde un render-prop `<FormField control={control} name={name} render={...}>`.

### ⚠️ Diferencia deliberada: sin prop `control`

React necesita pasar el objeto `control` de `useForm()` explícito a cada `<FormField>` porque RHF no tiene un mecanismo de contexto ambiente accesible fuera de componentes React con hooks propios. VeeValidate sí lo tiene: `useForm()` provee el formulario vía `provide`/`inject` de Vue, y **cualquier** descendiente que llame a `useField(name)` en su propio `setup()` lo recoge automáticamente, sin necesitar que se le pase explícito — incluso a través de componentes intermedios como `FormApp*.vue`. Por eso **ningún `FormApp*.vue` de este proyecto declara un prop `control`**: se omite entero, no se sustituye por otra cosa. Al portar un formulario de dominio, el único cambio real respecto al JSX original es borrar `control={control}` de cada `<FormApp*>` — el resto de props (`name`, `label`, `placeholder`, `required`...) se mantienen con el mismo nombre.

### ⚠️ Diferencia deliberada: `App*` usa props-callback (`onChange`/`onClear`/`onGenerate`), no `emit`

Los controles `App*` reciben `onChange`/`onClear`/`onGenerate` como **props función** (`onChange: (value: string) => void`), no como eventos Vue (`emit('change', ...)`). Es una excepción al patrón "usar emits" que sí seguirían la mayoría de componentes Vue idiomáticos, elegida a propósito: `AppInput.vue` necesita saber en el propio `<script setup>` si `onGenerate` fue pasado o no, para decidir si mostrar el botón de generar (`showGenerateButton = !!onGenerate && ...`, port literal de la condición original). Un `emit('generate')` declarado vía `defineEmits` **no puede inspeccionarse así** — Vue excluye los emits declarados de `$attrs`, así que no hay forma de comprobar "¿hay algún listener enganchado?" sin recurrir a hacks fragiles. Usar props-función evita el problema y además es la traducción más literal de la API original (`value`/`onChange` como props, casi 1:1 con el JSX). Aplica a los 12 `App*`, no a los `FormApp*` (que consumen `handleChange`/`errorMessage` de `useField` directamente).

## Tabla de controles portados

| Control base (`App*.vue`) | Wrapper (`FormApp*.vue`) | Primitivas `ui/*` que usa | Notas |
|---|---|---|---|
| `AppInput.vue` | — (base interna) | `input`, `button`, `label` | Soporta `clearable`, `passwordToggle`, `onGenerate` (mismo botón-slot que `clear`, mutuamente excluyentes). `inheritAttrs: false` + `v-bind="$attrs"` sobre `ui/input` para que atributos nativos (`autocomplete`, `inputmode`, `pattern`, `@blur`...) lleguen al `<input>` real, no al `<div>` contenedor |
| `AppInputText.vue` | `FormAppInputText.vue` | — | `onBlurTransform?: (value) => string` (usado por `slug` en formularios futuros de producto/noticia, ver original) |
| `AppInputEmail.vue` | `FormAppInputEmail.vue` | — | Label/placeholder por defecto desde `main.email`/`main.email_placeholder` (i18n) |
| `AppInputTel.vue` | `FormAppInputTel.vue` | — | Label/placeholder por defecto desde `main.phone`/`main.phone_placeholder` |
| `AppInputPassword.vue` | `FormAppInputPassword.vue` | — | **Sin label/placeholder por defecto** (el original los toma de `pages.account.password.*`, namespace no portado — ver más abajo) |
| `AppInputNumber.vue` | `FormAppInputNumber.vue` | — | Formateo de miles/decimales portado literal (`normalizeNumericValue`); exporta `isValidFormattedNumber` desde un segundo bloque `<script lang="ts">` no-setup (mismo patrón que el `export { isValidFormattedNumber } from "./AppInputNumber"` del original) |
| `AppTextArea.vue` | `FormAppTextArea.vue` | `textarea`, `label` | — |
| `AppSelect.vue` | `FormAppSelect.vue` | `select`, `label`, `spinner` | `Select` de reka-ui usa `model-value`/`@update:model-value`, no `value`/`onValueChange` (API Radix de React) — ver gotcha abajo |
| `AppMultiSelect.vue` | `FormAppMultiSelect.vue` | `popover`, `checkbox`, `button`, `label` | Lista con checkboxes en un Popover, port literal del original (no usa `ui/select`) |
| `AppSwitch.vue` | `FormAppSwitch.vue` | `switch`, `label` | — |
| `AppDatePicker.vue` | `FormAppDatePicker.vue` | `popover`, `calendar`, `button`, `label` | Único control con conversión de modelo de datos no trivial — ver gotcha abajo |
| `AppRichTextEditor.vue` | `FormAppRichTextEditor.vue` | `popover`, `separator`, `input`, `label` | Tiptap (`@tiptap/vue-3`), toolbar con `common/SquareIconButton.vue` + `common/AppTooltip.vue` — ver gotcha de versión abajo |
| `InlineFormContainer.vue` | — (no es un control) | — | Port literal, contenedor de layout |

Todos viven en `app/components/common/forms/`, auto-importados globalmente (mismo mecanismo que `common/AppButton.vue`, `nuxt.config.ts` ya incluye `~/components/common` de forma recursiva).

## Piezas nuevas fuera de `forms/`

- **`common/SquareIconButton.vue`**: port de `SquareIconButton.tsx`, envuelve `AppButton` — mismo patrón `icon` prop→slot que `AppButton.vue` (Fase 2). Prop `otherClasses` (no `class`, a diferencia de `AppButton.vue`) porque así se llama en el original y no colisiona con nada.
- **`common/AppTooltip.vue`**: port de `AppTooltip.tsx`, envuelve `ui/tooltip` (nueva primitiva, ver abajo). Incluye su propio `TooltipProvider` interno (`:delay-duration="0"`) para que cada uso sea autosuficiente, sin depender de un provider montado una sola vez en la raíz de la app.

## Primitivas `ui/*` nuevas (Fase 7)

`label`, `textarea`, `switch`, `checkbox`, `popover`, `separator`, `tooltip`, `calendar`, `spinner` — generadas con `npx shadcn-vue@latest add`. Gotcha de reinyección de tokens (`--font-heading`, `@layer base { * { @apply border-border...} }`, import de Google Fonts) reproducido de nuevo tras el `add`, mismo tratamiento que en Fase 2 (ver `design_system.md`): revertido a mano.

## ⚠️ Gotcha: `reka-ui` usa `modelValue`/`update:modelValue`, no la API Radix de React

Las primitivas de reka-ui (`Select`, `Switch`, `Checkbox`, `Popover`...) exponen su estado controlado como `modelValue`/`update:modelValue` (convención `v-model` de Vue), **no** `value`/`onValueChange` ni `checked`/`onCheckedChange` como sus equivalentes React (Radix). Todos los controles de esta fase que envuelven una de estas primitivas usan `:model-value="x" @update:model-value="fn"` en vez de intentar replicar los nombres de prop de React. Confirmado leyendo los `.d.ts` generados de `reka-ui` (`SwitchRootProps`, `CheckboxRootProps`, `SelectRootProps`), no la documentación pública.

## ⚠️ Gotcha: `AppDatePicker.vue` — conversión `Date` ↔ `DateValue`

El `Calendar` de shadcn-vue (sobre `reka-ui` + `@internationalized/date`) trabaja internamente con `DateValue`/`CalendarDate` de `@internationalized/date`, no con `Date` nativo de JS — a diferencia del original (react-day-picker + `date-fns`, ambos sobre `Date`). Se instaló `@internationalized/date` como dependencia nueva y se convierte en el borde del componente (`toCalendarDate`/`toJsDate`) para que la API pública (`value`/`onChange`, prop `minDate`/`maxDate`) siga siendo `Date`, igual que el original — el consumidor (`FormAppDatePicker.vue` y, más adelante, cualquier formulario de dominio) no necesita saber nada de `@internationalized/date`.

`date-fns` se sigue usando igual que en Next, pero solo para **formatear la fecha mostrada en el botón** (`format(value, dateFormat, {locale})`) — no para gobernar el propio calendario.

**Locale**: `next-intl`'s `useLocale()` devolvía el locale completo (`es-ES`/`en-US`) en Next; `@nuxtjs/i18n`'s `locale.value` devuelve el alias corto (`es`/`en`, ver `routingConfig` de la Fase 3) porque así se configuró `nuxt.config.ts`. El `localeMap` de `AppDatePicker.vue` se reindexa sobre el alias corto en vez de sobre el ISO — mismo resultado práctico (solo hay 2 locales), sin necesitar resolver `localeProperties.iso`.

**Estilos de celda**: react-day-picker (Next) exponía un prop `classNames={{day, today, selected, disabled}}` para forzar los colores custom del proyecto (`primary-500`/`secondary-500`) sobre los tokens semánticos sin resolver. El `Calendar.vue` agregado de shadcn-vue no expone ese hook por-parte (`CalendarCellTrigger` está hardcodeado dentro de `Calendar.vue`, sin slot de clase). Se resolvió con selectores CSS globales sobre `[data-slot='calendar-cell-trigger']` en `app/assets/css/main.css` (`@layer components`) en vez de forkear el componente agregado — ver ese archivo para el detalle exacto.

## ⚠️ Gotcha: `@tiptap/vue-3` fijado en `2.27.2`, no la última

`npm install` sin pin instaló Tiptap **v3** por defecto. La v3 de `StarterKit` incluye `Link`/`Underline` integrados por defecto (cambio de la v3, no existía en v2) — el proyecto Next usa Tiptap **2.27.2** exacto (`package.json`), donde `StarterKit` no los trae, por eso el original los añade explícitos (`TiptapLink`, `Underline` como extensiones separadas). Instalar v3 con ese mismo código produjo un warning real en runtime (`[tiptap warn]: Duplicate extension names found: ['link', 'underline']`), detectado en el smoke test manual (no por `tsc`/build). Se fijaron las 7 dependencias `@tiptap/*` a `2.27.2` exacto (con `--legacy-peer-deps`, necesario porque `npm` no resolvía limpio el downgrade en un solo paso) para igualar la versión de Next y eliminar el warning de raíz, en vez de adaptar el código a la API de v3.

`useEditor()` en `@tiptap/vue-3` devuelve un `ShallowRef<Editor | undefined>` (hay que leer `.value`), a diferencia del hook de React que devuelve el `Editor` directo — único ajuste estructural real entre versiones, el resto de la API (`chain()`, `isActive()`, `getHTML()`, `setContent()`, extensiones) es idéntica. El workaround de React con `onChangeRef`/`useRef` (para evitar closures obsoletas entre renders) **no se porta**: Composition API no tiene ese problema (`props` es siempre la referencia reactiva actual dentro de `onUpdate`), así que `AppRichTextEditor.vue` llama a `props.onChange(...)` directo.

## i18n: namespace `main` (subconjunto)

Los controles de esta fase consumen claves de `main.*` de Next (`loading`, `clear_button`, `email`, `email_placeholder`, `phone`, `phone_placeholder`, `number`, `rich_text_*` ×17) que no estaban portadas (solo `nav` lo estaba desde la Fase 3). Se añadió el subconjunto exacto que usan estos controles a `app/i18n/locales/{es,en}.json` — no el namespace `main` completo del original (que incluye muchas más claves de otros dominios sin portar todavía). Ver `.project_docs/i18n.md` si se necesita extender.

**`FormAppInputPassword.vue` no tiene label/placeholder por defecto**: el original los toma de `useTranslations("pages.account.password")` (`current_password_label`/`current_password_placeholder`) — un namespace de una fase de cuenta/password que no existe todavía. Se deja sin fallback (label/placeholder deben pasarse explícitos) hasta que se porte ese namespace real, en vez de inventar contenido fuera de lugar.

**⚠️ Gotcha real encontrado**: `email_placeholder` no puede contener un `@` literal (`"tu@email.com"`) — vue-i18n reserva `@` para "mensajes enlazados" (`@:key`) y su compilador lanza `Message compilation error: Invalid linked format` en cuanto ve un `@` fuera de esa sintaxis, tanto en runtime como (peor) **en cada SSR request** (confirmado con `curl`, `500` en todas las peticiones a cualquier página que renderizase ese control). Ni siquiera el escape documentado (`%@`) lo resolvió en pruebas. Se cambió el placeholder a un texto descriptivo sin `@` ("tu correo electrónico" / "your email address") en vez de un email de ejemplo — pequeña desviación de contenido respecto al original, documentada aquí para que no se reintroduzca un `@` sin más en `main.json` sin volver a probar.

## Verificación de esta fase

- `npx nuxt build` limpio (client + server + Nitro).
- `tsc --noEmit` limpio contra `.nuxt/tsconfig.{app,server,shared}.json` (mismo ruido preexistente de `.vue` sin `vue-tsc`, no relacionado).
- Smoke test manual con una página temporal (`_smoke-test-forms.vue`, eliminada tras verificar) montando un `useForm({validationSchema: toTypedSchema(zodSchema)})` real con los 11 `FormApp*` a la vez, cargada en Chrome headless real (no `curl`, que no ejecuta JS de cliente):
  - **Fase inválida** (valores por defecto vacíos + submit): `errors` se pobló correctamente para `title`/`email`/`password`/`role` con los mensajes de Zod esperados; `submitted` quedó vacío (submit bloqueado) — confirma que `useField`+`toTypedSchema`+Zod+la propagación de `errorMessage` a cada `App*` funciona de punta a punta.
  - **Fase válida** (`setValues()` con datos completos + submit): `submitted` reprodujo exactamente los valores puestos, incluidos los controles más complejos — `AppSelect` (`role: "admin"`), `AppMultiSelect` (`tags: ["a","b"]`), `AppSwitch` (`featured: true`), `AppDatePicker` (`publishedAt: "2026-01-15"`, conversión `Date`→string `yyyy-MM-dd` correcta) y `AppRichTextEditor` (`description: "<p>Rich text</p>"`, `setContent`/`getHTML()` de Tiptap correctos) — `errors` quedó vacío.
  - Sin warnings de consola ni *hydration mismatches* en la ejecución limpia final (una primera ejecución mostró *hydration mismatches* y errores `NUXT_E1005`, coincidiendo con una recarga completa disparada por el HMR de Vite en pleno arranque del dev server — reproducido igual en la ruta `/` ya existente, no relacionado con el código de esta fase; desapareció al repetir la prueba contra un dev server ya caliente).
  - Este smoke test fue el que detectó los dos gotchas reales documentados arriba (Tiptap v3 vs v2, y el `@` de vue-i18n) — ninguno de los dos lo habría detectado `tsc`/`build`.
- **No se ha probado** contra un formulario de dominio real (`UserForm`, `ProductForm`...) porque ninguno está portado todavía — la Fase 7 se limita a los controles reutilizables, ver alcance abajo.

## Fuera de alcance de esta fase (pendiente)

- Los formularios de dominio (`ProductForm`, login/signup/password/activate) — se portan fase a fase junto con el dominio que consumen, reusando estos `FormApp*` con la única adaptación de quitar `control` de cada uso. **`UserForm.vue` (Fase 8), `NewForm.vue` (dominio `news`), `FaqForm.vue` (dominio `faqs`), `SlideForm.vue` (dominio `carousel`/`slides`) y `LoginForm.vue`/`SignupForm.vue`/`RequestForm.vue`/`ResetForm.vue`/`ActivateForm.vue`/`PasswordForm.vue`/`ProfileForm.vue` ya se portaron** — ver `.project_docs/routes.md`. Solo `ProductForm` sigue pendiente.
- `DateRangeFilter`/`FeaturedFilter` (`project/filters/`) — **ya portados** (junto con el dominio `news`, primer consumidor real; `SearchFilter.vue` ya se había portado en la Fase 8). Ver `.project_docs/routes.md`.
- El namespace i18n `pages.account.password` (label/placeholder por defecto de `FormAppInputPassword`) — sigue sin consumidor: la sección `(auth)` no usa `FormAppInputPassword` sin label/placeholder explícito en ningún punto (`LoginForm.vue`/`SignupForm.vue`/`ResetForm.vue` siempre pasan `label`/`placeholder` desde `main.*`).
- `RuleCheck.tsx` — **ya se portó en la Fase 8** (`app/components/common/RuleCheck.vue`, usado por `UserForm.vue`) y **ya tiene un segundo/tercer consumidor real** en `SignupForm.vue`/`ResetForm.vue` (sección `(auth)`, ver `.project_docs/routes.md`) — sigue pendiente su uso en el formulario de cambio de contraseña (`mi-cuenta/contrasena`, no portado).

## Sección `(auth)` — `AppLink.vue`, `Recaptcha.vue`, `LoginForm`/`SignupForm`/`RequestForm`/`ResetForm`/`ActivateForm`

Detalle de routing/páginas/guards en `.project_docs/routes.md`; detalle de sesión/captcha server-side en `.project_docs/auth.md` (decisiones 75-81). Aquí solo las piezas de UI:

- **`app/components/common/AppLink.vue`** (nuevo) — port de `AppLink.tsx` (Next). Aplica `useLocalePath()` internamente sobre el prop `link` (el original usa `next/link` directo sin resolver el prefijo de locale) — mismo criterio que `useIsNavActive.ts`. Los llamantes pasan el valor crudo de `nav.*.link` (p. ej. `t('nav.login.link')`), igual que `MainHeader.vue` pasa `t('nav.news.link')` a un `NavItem`.
- **`app/components/domain/auth/Recaptcha.vue`** (nuevo) — port de `Recaptcha.tsx` (Next): inyecta el script de reCAPTCHA v3 en `onMounted`, lo retira en `onUnmounted`, con el mismo dedupe de tags duplicados del original. Sin salida visual real — Vue SFC exige al menos un nodo raíz en `<template>` (a diferencia de `<></>` de React), se usa `<span hidden />`.
- **`LoginForm.vue`/`SignupForm.vue`/`RequestForm.vue`/`ResetForm.vue`/`ActivateForm.vue`** (nuevos, `app/components/domain/auth/{login,signup,reset/request,reset/reset,activate}/`) — mismo patrón `useForm`+`toTypedSchema(zodSchema)`+`$fetch`+try/catch/finally que `UserForm.vue`/`FaqForm.vue`/`NewForm.vue`, no un port literal de `useActionState` (React-específico, sin equivalente en Vue) — ver `.project_docs/auth.md` decisión 79. `SignupForm.vue`/`ResetForm.vue` reusan el patrón de `UserForm.vue` de una segunda suscripción `useField('password')` para alimentar los 5 `RuleCheck` en vivo.
- Sus `*FormSchema.ts` (`loginFormSchema.ts`, `signupFormSchema.ts`, `requestFormSchema.ts`, `resetFormSchema.ts` — `ActivateForm.vue` no tiene campos de formulario, sin schema) siguen el mismo idioma `getXSchema(tMain: (key, params) => string)` que `userFormSchema.ts`/`faqFormSchema.ts`/`newFormSchema.ts`, reusando `MIN_PASSWORD_LENGTH`/`MAX_PASSWORD_LENGTH` de `app/components/domain/auth/password/passwordFormSchema.ts` (ya portado desde la Fase 8, decisión 47 de CLAUDE.md).

## `NewForm.vue` (dominio `news`) — primer consumidor real de `FormAppRichTextEditor`

`FormAppRichTextEditor`/`AppRichTextEditor` (Tiptap) se portaron en esta misma Fase 7 pero sin ningún formulario de dominio que los usara todavía (`UserForm.vue` no tiene campos rich text). `NewForm.vue` (campo `description`) es el primer uso real — verificado contra HTML devuelto por la API real (párrafos largos, sin errores de consola). En tests de componente, se sustituye por un `<textarea>` nativo conectado al `useField()` real (mismo patrón que `FormAppDatePicker`/`FormAppSelect` en `UserForm.test.ts`) en vez de montar el editor Tiptap/ProseMirror real — evita depender del polyfill de `Range`/`getBoundingClientRect` que jsdom no trae de serie (ver `.project_docs/tests.md`), sin necesidad de tocar `test/setup.ts` para este slice.

`NewForm.vue` también reconfigura `ImageUploader` para un recorte rectangular 16:9 (`crop-shape="rect"`, salida `992×558`) en vez del recorte circular 1:1 que usa el avatar de `UserForm.vue` — mismo componente genérico (`app/components/domain/project/dashboard/uploader/ImageUploader.vue`), solo cambian las props.

## `SlideForm.vue` (dominio `carousel`/`slides`) — primer formulario con campos condicionales de CTA

`app/components/domain/project/dashboard/carousel/slide/SlideForm.vue` combina el mismo patrón de imagen que `NewForm.vue` (`ImageUploader` 16:9 rect, `folder="slides"`, con `outputSize`/`thumbnailSize`/`smallSize` explícitos — el único formulario, junto con `NewForm`, que pasa las tres) con un bloque de campos que solo aparece si `FormAppSwitch name="hasCta"` está activo: `FormAppInputText` ×2 (`ctaLabel`/`ctaLink`) + `FormAppSelect` (`ctaTarget`, opciones `self`/`blank`). La visibilidad condicional (`v-if="values.hasCta"`) lee el objeto `values` reactivo que devuelve `useForm()` — mismo mecanismo que Next usa vía `form.watch("hasCta")`, sin necesidad de una segunda suscripción `useField()` como hace `NewForm.vue` para leer `title` en vivo (aquí basta con `values`, ya reactivo por sí solo).

`slideFormSchema.ts` porta el `superRefine` que exige `ctaLabel`/`ctaLink` cuando `hasCta` es `true`, pero **no** el `superRefine` que exige `imageId` del original (`slideFormSchema.ts` de Next) — mismo criterio ya establecido para `newFormSchema.ts` (`imageId: z.number().optional()`, sin validación que lo bloquee): la imagen de portada tampoco es obligatoria a nivel de validación en este proyecto pese a que `New.image`/`Slide.image` son no-nullable en el tipo de dominio.

## `Hero.vue`/`Arrow.vue`/`Dots.vue` (`common/media/gallery/`) — primer carrusel público, sin `framer-motion`

Port de `src/components/common/media/gallery/{Hero,components/{Arrow,Dots}}.tsx` (Next), consumido por `HomeHero.vue` en la home (`app/pages/index.vue`) — ver `.project_docs/routes.md` para el detalle del dominio `carousel`/`slides` completo. Primera pieza de `common/media/` en este proyecto (no existía la carpeta).

**Deviation deliberada respecto a Next**: el original usa `framer-motion` (`AnimatePresence`+`motion.div`) para el cross-fade entre slides y el stagger de título/descripción/CTA (delays 0.3s/0.5s/0.7s) — sin esa dependencia instalada aquí (ni un equivalente Vue ya presente en el proyecto), `Hero.vue` lo resuelve con primitivas nativas de Vue/CSS:
- **Cross-fade**: un único `<Transition name="hero-fade">` (sin `mode`) envolviendo el slide activo (`v-if="currentSlide" :key="current"`) — sin `mode`, Vue solapa las transiciones de salida/entrada por defecto (ambas corren a la vez vía CSS `transition: opacity`), dando el mismo efecto visual que `AnimatePresence` sin necesitar la librería.
- **Stagger**: `@keyframes hero-in` + tres clases (`hero-in-title`/`hero-in-description`/`hero-in-cta`) con `animation-delay` distinto cada una (0.3s/0.5s/0.7s, mismos tiempos que el original) — sustituye a los tres `motion.div` con `transition={{delay: ...}}` de Next.
- Autoplay con `setInterval`/`clearInterval` (idéntico al original, sin adaptación), reseteado en cada interacción manual (flecha/dot) — mismo comportamiento que `resetAutoplay()` en Next.
