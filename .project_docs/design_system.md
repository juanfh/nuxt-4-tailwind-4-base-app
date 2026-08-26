# Design system — nuxt-4-tailwind-4-base-app

Consultar cuando: se necesite tocar/crear una primitiva en `app/components/ui/`, entender el sistema de temas/colores de Tailwind v4, añadir un componente nuevo con `shadcn-vue add`, o diagnosticar por qué una clase `bg-primary`/`bg-destructive` no pinta como se espera.

Fase 2 del proyecto: migración a Tailwind v4 + primitivas shadcn-vue mínimas (button, input, dialog, select, table, sonner) + `AppButton.vue`. Réplica deliberada de las decisiones de `next-16-tailwind-4-base-app/.project_docs/design_system.md`, adaptadas a Vue/shadcn-vue.

**Actualización Fase 7**: se añadieron las primitivas `label`, `textarea`, `switch`, `checkbox`, `popover`, `separator`, `tooltip`, `calendar`, `spinner` (controles de formulario, ver `.project_docs/components.md`) + los tokens `--form-border`/`--form-item-{bg,border,text}` + el bloque `.ckcontent`/estilos de `[data-slot='calendar-cell-trigger']` en `@layer components`. El gotcha de reinyección de tokens (siguiente sección) se reprodujo de nuevo al ejecutar `shadcn-vue add` para esas 9 primitivas — se revirtió igual que la primera vez.

**Actualización Fase 8**: se añadieron `alert-dialog` y `dropdown-menu` (usadas por `common/AppAlertDialogContent.vue` y `common/tables/DataTable.vue` respectivamente, ver `.project_docs/routes.md`) + los tokens `--dialog-border`/`--toast-*`. Mismo gotcha de reinyección reproducido y revertido una vez más. Se creó también `.npmrc` (`legacy-peer-deps=true`) en la raíz — el conflicto de peer dependencies `zod@4` vs `@vee-validate/zod`'s `zod@^3` (ya conocido desde la Fase 7) bloqueaba el `npm install` interno que dispara `shadcn-vue add` al no aceptar flags propios; con `.npmrc` persistente ya no hace falta repetir `--legacy-peer-deps` a mano en cada instalación futura.

**Actualización — parte pública (menú principal)**: se añadió `sheet` (usada por `MobileMenu.vue`, ver `.project_docs/routes.md`, sección «Parte pública»). Mismo gotcha de reinyección reproducido y revertido una tercera vez. Gotcha nuevo (real, encontrado con headless Chrome vía CDP contra el `dev` server): `SheetContent` sin una `SheetDescription` produce el warning de accesibilidad de reka-ui `Missing 'Description' or 'aria-describedby' for DialogContent` (Sheet se construye sobre `DialogRoot` de reka-ui) — mismo defecto que ya se había corregido una vez en `ImageCropDialog.vue` (Fase 8, ver `.project_docs/routes.md`). Fix aplicado igual que allí: `SheetDescription` con clase `sr-only` (clave nueva `main.menu_description`, sin texto visible) dentro de `SheetContent`. Regla para futuros consumidores de `ui/sheet`/`ui/dialog`/`ui/alert-dialog`: si el diseño no incluye una descripción visible, añadir siempre una `*Description` `sr-only` — no es un caso puntual, se ha repetido dos veces ya.

**Actualización — theme switcher (`ThemeToggle`)**: se añadió `@nuxtjs/color-mode` (nueva dependencia, no una primitiva `ui/*` de shadcn-vue) — resuelve la clase `dark`/`light` de `<html>` (equivalente Nuxt de `next-themes`), consumida por `app/components/common/ThemeToggle.vue`. Detalle completo (config del módulo, gotcha real de hidratación con `disabled` encontrado y corregido) en `.project_docs/routes.md`, sección «Theme switcher (`ThemeToggle`)». No toca el catálogo `ui/*` ni reintroduce el gotcha de reinyección de tokens (no pasa por `shadcn-vue add`).

**Actualización — parte pública de `faqs`**: se añadió `accordion` (usada por `PublicFaqs.vue`, ver `.project_docs/routes.md`, sección «Parte pública — sección de preguntas frecuentes») + los tokens `--main-card-bg`/`--main-card-border` (`:root`/`.dark`/`@theme inline`, mismo patrón que `--dialog-border`) — pendientes desde la Fase 2 (ver "Todavía no portado" más abajo), primer consumidor real. Mismo gotcha de reinyección reproducido y revertido una quinta vez (import de Google Fonts, `--font-heading`, `@layer base { * {border-border...} body {bg-background...} }`). `AccordionTrigger.vue`/`AccordionContent.vue` (generados) referencian algunos tokens semánticos no portados (`ring`, `muted-foreground`, `foreground`) — se dejan tal cual, mismo criterio que el resto de primitivas de este proyecto: solo se resuelve `--border` (decisión 8 de `CLAUDE.md`), el resto de superficies de color pasan por los wrappers `common/App*.vue` o, si no tienen wrapper todavía (como este acordeón, consumido directo sin uno), simplemente no pintan esos detalles menores (foco, texto muted) — no es una regresión nueva, ya ocurría con `select`/`calendar`/`dialog`.

## Stack base

| Pieza | Versión | Rol |
|---|---|---|
| `tailwindcss` + `@tailwindcss/vite` | `4.3.3` | Tailwind v4 puro, sin módulo Nuxt intermedio (se descartó `@nuxtjs/tailwindcss`, que instalaba v3 — ver decisión en `CLAUDE.md`) |
| `shadcn-vue` | `2.8.2` | CLI de generación de primitivas. **Nota de versión**: esta versión ya no usa los nombres `default`/`new-york` de shadcn/ui clásico — usa presets con nombre propio (`vega`, `nova`, `maia`, `lyra`, `mira`...) sin mapeo documentado a los antiguos. Se usó el preset por defecto de la CLI (`reka-nova`, ver `components.json`) sin buscar una equivalencia forzada con el `new-york` del proyecto Next |
| `reka-ui` | `2.10.3` | Sucesora de Radix Vue — primitivas headless/accesibles. Base declarada en `components.json` (`"base": "reka"`), equivalente Vue de `@base-ui/react` en el proyecto Next |
| `class-variance-authority` | `0.7.1` | Igual que en Next: variantes (`variant`, `size`) tipadas con `cva()` |
| `tailwind-merge` + `clsx` | `3.6.0` / `2.1.1` | Combinadas en `cn()` — `app/lib/utils.ts`: `cn = (...inputs) => twMerge(clsx(inputs))`, idéntico a `src/lib/utils.ts` en Next |
| `tw-animate-css` | `1.4.0` | Igual que en Next — animaciones de las primitivas (accordion, dialog...) |
| `@lucide/vue` | `1.34.0` | Iconografía, declarado como `iconLibrary` en `components.json` (equivalente Vue de `lucide-react`) |
| `components.json` | raíz | Config shadcn-vue: `style: "reka-nova"`, `baseColor: "neutral"`, `cssVariables: true`, alias `@/components/ui`, `@/lib`, `@/composables`; ver tabla de alias abajo |

No instalado todavía (fuera de alcance de la Fase 2): `next-themes`/theme switcher, react-hook-form↔VeeValidate, tanstack-table (para `DataTable`), `AppInput`/`AppSelect`/`AppToast` y el resto de wrappers `common/`.

## Alias de `components.json` (equivalencia con Next)

| Alias | Next (`@/...`) | Nuxt (`@/...`) |
|---|---|---|
| `components` | `src/components` | `app/components` |
| `ui` | `src/components/ui` | `app/components/ui` |
| `lib` | `src/lib` | `app/lib` (nuevo — no existía en el mapa de carpetas de la Fase 1; es implementación interna de shadcn-vue para `cn()`, no una capa de dominio) |
| `utils` | `src/lib/utils` | `app/lib/utils` |
| `composables` | `src/hooks` | `app/composables` |

## Primitivas portadas (Fase 2 — solo las de Fase 8 users)

| Carpeta `ui/*` | Base reka-ui | Notas |
|---|---|---|
| `button/` | `Primitive` (reka-ui) | `data-slot="button"`, `data-variant`, `data-size`; variantes `default/outline/secondary/ghost/destructive/link` × tamaños `default/xs/sm/lg/icon/icon-xs/icon-sm/icon-lg`; base de `common/AppButton.vue` |
| `input/` | ninguna (HTML plano) | — |
| `dialog/` | `@reka-ui` dialog | Sub-exports: `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogTrigger`, `DialogClose`, `DialogOverlay`, `DialogScrollContent` |
| `select/` | `@reka-ui` select | Sub-exports: `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectItemText`, `SelectLabel`, `SelectScrollUpButton`, `SelectScrollDownButton`, `SelectSeparator`, `SelectTrigger`, `SelectValue` |
| `table/` | ninguna (HTML `<table>` semántico) | Sub-exports: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`, `TableEmpty` (este último no existe en el `table.tsx` de Next) |
| `sonner/` | paquete `vue-sonner` (vía shadcn-vue) | Equivalente Vue de `ui/sonner.tsx` (que usa `sonner` de React) |

**Fase 7** añadió `label/`, `textarea/`, `switch/`, `checkbox/`, `popover/`, `separator/`, `tooltip/`, `calendar/` (+ `native-select/`, dependencia interna del layout `month-and-year` de `calendar/`) y `spinner/` (`ui/spinner`, sin base reka-ui — un `<Loader2Icon>` de `@lucide/vue` con `animate-spin`, igual que el original) — usadas por los controles `common/forms/App*.vue`, ver `.project_docs/components.md`.

**Fase 8** añadió `alert-dialog/` (base `AlertDialogPrimitive` de reka-ui, usada por `common/AppAlertDialogContent.vue` — confirmación de borrado, alta/edición en modal cuando `EDIT_INLINE=false`, fuera de alcance) y `dropdown-menu/` (base `DropdownMenuPrimitive`, usada por `common/tables/components/DataTableRowActions.vue` — menú de acciones por fila) — ver `.project_docs/routes.md`.

**Parte pública (menú principal)** añadió `sheet/` (base `DialogRoot`/`DialogTrigger`/`DialogContent`/`DialogClose`/`DialogTitle`/`DialogDescription` de reka-ui, exactamente las mismas primitivas headless que `dialog/` con una capa de estilos distinta para paneles laterales — `data-side="left|right|top|bottom"`) — usada por `MobileMenu.vue`, el menú de navegación en móvil. Ver gotcha de la `SheetDescription` arriba y `.project_docs/routes.md`.

**Noticias destacadas de la home (`NewsCards`)** añadió `carousel/` (`Carousel`/`CarouselContent`/`CarouselItem`/`CarouselNext`/`CarouselPrevious`, base `embla-carousel-vue` — equivalente Vue oficial de `embla-carousel-react`, que usa el `ui/carousel.tsx` original — más `@vueuse/core`, ya instalado desde antes) — usada por `NewsCards.vue` (solo `Carousel`+`CarouselContent`+`CarouselItem`, sin flechas). Mismo gotcha de reinyección de tokens reproducido y revertido una cuarta vez. Distinto del carrusel de `HomeHero`/`Hero.vue` (fondo a pantalla completa con cross-fade, deliberadamente sin `framer-motion` ni primitiva shadcn — ver `.project_docs/routes.md`): `NewsCards` sí porta la primitiva `ui/carousel` porque el propio Next también la usa ahí.

**Parte pública de `faqs`** añadió `accordion/` (`Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent`, base `AccordionRoot`/`AccordionItem`/`AccordionHeader`/`AccordionTrigger`/`AccordionContent` de reka-ui — mismo primitivo `Collapsible` headless que usa el `ui/accordion.tsx` original vía Radix) — usada por `PublicFaqs.vue` (`type="multiple"`, sin `defaultValue`, igual que el original). Mismo gotcha de reinyección de tokens reproducido y revertido una quinta vez. `AccordionContent` renderiza su contenido con `v-if` interno (solo monta cuando el item está abierto, mismo comportamiento que `CollapsibleContent` de Radix) — no confundir con un bug de hidratación si un `curl` a un acordeón cerrado no muestra el contenido interno.

Resto del catálogo shadcn-vue (pagination...) **no portado todavía** — se añade fase a fase, igual que en Next, con `npx shadcn-vue@latest add <nombre>`. `common/pagination/AppPagination.vue` (Fase 8) se construyó directamente sobre `NuxtLink` + `buttonVariants` (exportado por `ui/button`), sin portar un `ui/pagination` propio — el original de Next tampoco usa una primitiva shadcn genérica ahí, solo `Link`+`buttonVariants` a mano.

## Temas / colores (`app/assets/css/main.css`) — único archivo de estilos global

- Import order: `@import "tailwindcss"` → `@import "tw-animate-css"` → `@import "shadcn-vue/tailwind.css"` (este último es nuevo en shadcn-vue 2.8, no tiene equivalente en Next: aporta `@custom-variant data-open/data-closed/data-checked/...` y utilidades `scroll-fade`/`shimmer` que consumen internamente las primitivas del registry — no define ningún color).
- `@custom-variant dark (&:where(.dark, .dark *))`: idéntico a Next — Tailwind v4 usa `prefers-color-scheme` por defecto para `dark:`; se redefine para depender de la clase `.dark` en `<html>` — clase que añade/quita `@nuxtjs/color-mode` (`ThemeToggle.vue`, ver `.project_docs/routes.md`, sección «Theme switcher (`ThemeToggle`)»), equivalente Nuxt de `next-themes` en el original.
- **`@theme` block**: define **únicamente** las dos escalas de marca `--color-primary-{5,50,100..950}` y `--color-secondary-{5,50,100..950}` (mismos valores hex que Next, índigo/teal) más `--breakpoint-xs: 30rem`. Igual que en Next, **no se definen** `--color-background`, `--color-destructive`, `--color-accent`, `--color-popover`, `--color-muted`, `--color-input`, `--color-ring`, `--color-foreground`, `--radius`, `--color-card*`, `--color-sidebar*`, `--color-chart*` — los tokens semánticos que shadcn-vue genera por defecto en `button/index.ts`, etc. **siguen sin resolver a ningún valor real**.
  - Consecuencia práctica idéntica a Next: el código de producto NO usa las variantes por defecto de `ui/button` tal cual — usa `common/AppButton.vue`, que sobreescribe con `!bg-primary-500`/`!bg-secondary-700`/clases Tailwind explícitas de las escalas custom vía `cn()`.
- **Token `--border`**: único token semántico de shadcn definido (igual razón que en Next — `ui/select` y cualquier futuro `ui/separator`/`ui/dropdown-menu` dependen de `bg-border`/`border-border`). Valor idéntico: `neutral-200` (claro) / `neutral-700` (oscuro), puenteado con `@theme inline { --color-border: var(--border) }`.
- **`@layer components`**: portado mínimo — solo `.main-transition-color` (usada por `AppButton.vue`). El resto del `@layer components` de Next (`.grecaptcha-badge`, scrollbars de dialog/select, `.ckcontent`, bloques de código...) se porta cuando el componente que lo consume se porte, no antes.
- **Portados en Fase 7**: `--form-border` (usado por `InlineFormContainer.vue`) y `--form-item-{bg,border,text}` (usados por los 6 controles de formulario persistidos con fondo/borde propio: input, select, textarea, datepicker, switch, multiselect, richtext) — valores idénticos a Next. Ver `.project_docs/components.md`.
- **Portados en Fase 8**: `--toast-*` (`AppToast.vue`, sobre `vue-sonner` — también se montó `<Toaster />` en `app/app.vue`, que hasta esta fase no tenía ningún consumidor de `ui/sonner`) y `--dialog-border` (`AppAlertDialogContent.vue`).
- **Portado — parte pública de `faqs`**: `--main-card-bg`/`--main-card-border` (`PublicFaqs.vue`, ver arriba). **Todavía no portado**: `--autofill-*` de Next — pertenece a autofill de inputs, sin consumidor todavía en este proyecto. Mismo criterio: se añade cuando se porte su wrapper consumidor.

## ⚠️ Gotcha recurrente: `shadcn-vue init`/`add` reinyecta tokens por defecto

Cada vez que se ejecuta `npx shadcn-vue@latest init` o `add`, la CLI **reescribe** `app/assets/css/main.css` y vuelve a añadir automáticamente, si no están ya:
1. Un `@import url('https://fonts.googleapis.com/css2?family=Geist...')` (Google Fonts).
2. Una línea `--font-heading: var(--font-sans)` dentro de `@theme inline`.
3. Un bloque `@layer base { * { @apply border-border outline-ring/50; } body { @apply bg-background text-foreground; } }`.

Los tres dependen de tokens semánticos (`--font-sans`, `--ring`, `--background`, `--foreground`) que este proyecto elimina deliberadamente (ver arriba). **Tras cualquier `shadcn-vue add`, hay que revisar `main.css` y volver a quitar estas tres inserciones a mano** antes de dar la tarea por terminada — no es un fallo puntual, se repite en cada ejecución de la CLI.

## Convención `common/AppButton.vue`

Réplica de `src/components/common/AppButton.tsx` de Next. Mismo contrato de variantes de color (`default/secondary/outline/ghost/destructive/link`) y los mismos valores exactos de Tailwind con `!important` (`!bg-primary-500 hover:!bg-primary-600`, etc.) — ver el propio archivo para la tabla completa. Diferencias deliberadas por idiomatismo Vue (no son bugs, son adaptaciones):

- El prop `icon` (React `ReactNode`) se sustituye por un **slot nombrado `icon`** — Vue no tiene equivalente directo a pasar un nodo React por prop; un slot es la forma idiomática.
- El contenido de `label` admite tanto el prop `label` (string, igual que Next) como el **slot por defecto** (`<AppButton>Texto</AppButton>`), vía `<slot>{{ label }}</slot>` — añadido extra, no rompe el uso por prop.
- `otherClasses` se renombra a `class` — sigue la misma convención que ya usan todas las primitivas `ui/*.vue` generadas por shadcn-vue (`props.class` + `cn()` al final), en vez de un nombre de prop custom.
- `onClick`/`disabled` no se declaran como props explícitos: Vue los aplica automáticamente al elemento raíz vía fallthrough de `$attrs` (equivalente idiomático al spread `{...props}` de React), salvo en las ramas `component="link"|"a"` donde — igual que en Next — no se pasan explícitamente.

**Regla dura heredada de Next**: nunca usar las variantes de color por defecto de `components/ui/button/Button.vue` directamente en código de producto — usar siempre `components/common/AppButton.vue`. Si se porta una primitiva nueva con superficie de color (`checkbox`, `switch`...), replicar el mismo patrón de wrapper antes de usarla en una página/componente de dominio.

## Convenciones a respetar al crear/tocar `ui/*` (heredadas de Next, vía shadcn-vue)

- Seguir siempre `cn(baseClasses, props.class)` al final del `:class` calculado, nunca reemplazar la clase recibida.
- Mantener `data-slot="<nombre>"` en el elemento raíz de cualquier subcomponente nuevo (ya generado así por la CLI).
- Las variantes de color reales del proyecto son `primary-{5..950}` y `secondary-{5..950}` (definidas en `@theme`) más la paleta estándar de Tailwind (`neutral`, `red`...); no asumir que `primary`/`destructive`/`accent` "pelados" existen como color resuelto.
- Iconografía: `@lucide/vue`, import directo por icono.
