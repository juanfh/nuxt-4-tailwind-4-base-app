<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  type?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  title: string
  size?: string
  weight?: string
  color?: string
  align?: string
  nobalance?: boolean
  otherClasses?: string
}

const props = defineProps<Props>()

const headingType = computed(() => props.type ?? 'h1')

// ⚠️ Gotcha real (encontrado portando mi-cuenta/perfil+contraseña, no algo
// introducido por esa tarea: afecta a todo uso previo de este componente en
// el proyecto, incluidos users/news/faqs). El nombre original, `Title`,
// colisiona con el componente global que el propio Nuxt registra para
// `<Title>` (`nuxt/dist/head/runtime/components`, el equivalente de
// `@unhead/vue` para fijar `document.title` declarativamente) — confirmado
// leyendo `.nuxt/components.d.ts`: la entrada final para `Title` apuntaba al
// componente interno de Nuxt, no a este archivo. El de Nuxt no renderiza
// nada en el `<body>` (solo escribe en `<head>`) y no lee ninguna prop
// `title` propia, así que cada `<Title :title="...">` de la app renderizaba
// un `<h1>`/`<h2>`... completamente vacío — invisible en cualquier
// verificación con headless Chrome (Vue recupera el mismatch de hidratación
// SSR/cliente creando el nodo bien en el cliente, así que la pantalla se
// veía correcta) y solo detectable inspeccionando el HTML servido antes de
// hidratar. Fix: renombrar el archivo/componente a `PageTitle` (sin
// colisión, confirmado contra `.nuxt/components.d.ts`) y actualizar los 20
// usos existentes.
//
// Segundo gotcha real, encontrado al verificar el fix anterior: incluso ya
// resuelta la colisión de nombre, `<component :is="headingType" v-html="title" />`
// seguía sirviendo un `<h1>` vacío en SSR (confirmado con curl contra
// `nuxt dev`, no solo en teoría) — combinar `v-html` con un `:is` dinámico
// no interpola el contenido en el codegen SSR real de este proyecto. Fix:
// sustituir por una cadena `v-if`/`v-else-if` de tags estáticos (h1..h6),
// cada uno con `v-html` directo — el mismo prop pero sin combinarlo con un
// `:is` dinámico, que sí interpola bien en SSR (confirmado con
// `@vue/compiler-sfc` `compileTemplate({ ssr: true })` y con curl real).
const className = computed(() => cn(
  props.color ?? 'text-neutral-900 dark:text-neutral-200',
  props.align ?? 'text-left',
  !props.nobalance && 'balance-text',
  props.weight ?? 'font-semibold',
  (headingType.value === 'h1' && (props.size ?? 'text-4xl'))
  || (headingType.value === 'h2' && (props.size ?? 'text-2xl'))
  || props.size,
  props.otherClasses,
))
</script>

<template>
  <h1 v-if="headingType === 'h1'" :class="className" v-html="title" />
  <h2 v-else-if="headingType === 'h2'" :class="className" v-html="title" />
  <h3 v-else-if="headingType === 'h3'" :class="className" v-html="title" />
  <h4 v-else-if="headingType === 'h4'" :class="className" v-html="title" />
  <h5 v-else-if="headingType === 'h5'" :class="className" v-html="title" />
  <h6 v-else :class="className" v-html="title" />
</template>
