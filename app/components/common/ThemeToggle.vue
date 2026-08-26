<script setup lang="ts">
// A diferencia de next-themes en el original (useTheme() + guard de
// hidratación con un estado `mounted` propio, porque `resolvedTheme` es
// literalmente `undefined` hasta que next-themes hidrata en cliente), aquí no
// hace falta ningún guard: `colorMode.value` de @nuxtjs/color-mode ya viene
// resuelto desde el primer render SSR (al valor de `preference` configurado
// en nuxt.config.ts) y nunca es `undefined`, así que leerlo/escribirlo antes
// de montar es siempre seguro.
//
// ⚠️ Gotcha real (confirmado con headless Chrome): `:disabled="colorMode.unknown"`
// — la traducción literal del guard `disabled={!mounted}` del original —
// producía un hydration attribute mismatch real de Vue (SSR renderiza
// `disabled="true"`, el cliente ya espera `disabled` ausente) que Vue NO
// repara en el DOM ("this mismatch is check-only"), dejando el switch
// permanentemente deshabilitado tras la primera hidratación, en todas las
// cargas probadas. Se elimina el prop `disabled` por completo en vez de
// perseguir el guard: no protege nada real aquí (ver arriba) y sí introduce
// esta clase de bug.
import { MoonIcon, SunIcon } from '@lucide/vue'
import { Switch } from '@/components/ui/switch'

const colorMode = useColorMode()
const { t } = useI18n()

const isDark = computed(() => colorMode.value === 'dark')

function onCheckedChange(checked: boolean) {
  colorMode.preference = checked ? 'dark' : 'light'
}
</script>

<template>
  <div class="flex items-center gap-2">
    <SunIcon class="h-4 aspect-square text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
    <Switch
      :model-value="isDark"
      :aria-label="isDark ? t('main.switch_to_light_theme') : t('main.switch_to_dark_theme')"
      class="bg-form-item-bg border border-form-item-border data-checked:*:bg-neutral-300 data-unchecked:*:bg-neutral-500 *:data-[slot='switch-thumb']:border *:data-[slot='switch-thumb']:border-form-item-bg cursor-pointer"
      @update:model-value="onCheckedChange(!!$event)"
    />
    <MoonIcon class="h-4 aspect-square text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
  </div>
</template>
