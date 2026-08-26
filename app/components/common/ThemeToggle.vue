<script setup lang="ts">
/* 
`colorMode.value` ya viene resuelto desde el primer render SSR (al valor de `preference` en nuxt.config.ts) y nunca es `undefined`, así que
leerlo/escribirlo antes de montar es seguro — no hace falta un guard de hidratación.

⚠️ Un `:disabled="colorMode.unknown"` provoca un mismatch de hidratación (SSR renderiza `disabled="true"`, el cliente lo espera ausente) que Vue no
repara en el DOM, dejando el switch deshabilitado para siempre tras hidratar — de ahí que el prop `disabled` no se use aquí. 
*/
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
