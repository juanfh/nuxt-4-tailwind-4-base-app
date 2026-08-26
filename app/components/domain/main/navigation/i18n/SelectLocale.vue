<script setup lang="ts">
// `setLocale` de @nuxtjs/i18n ya resuelve la navegación a la ruta
// localizada y actualiza `locale` de forma reactiva, así que no hace falta
// estado `selected` propio: el `value` del select se liga directo a
// `locale`.
import { routingConfig } from '@/i18n/routing'
import type { SelectOption } from '@/components/common/forms/AppSelect.vue'

const { t, locale, setLocale } = useI18n()

const languageOptions = computed<SelectOption[]>(() =>
  Object.entries(routingConfig.aliases).map(([fullLocale, alias]) => ({
    label: routingConfig.names[fullLocale as keyof typeof routingConfig.names],
    value: alias,
  })),
)

const pending = ref(false)

const handleChangeLanguage = async (newLocale: string) => {
  if (newLocale === locale.value || pending.value) return
  pending.value = true
  try {
    await setLocale(newLocale)
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <AppSelect
    id="locale"
    :options="languageOptions"
    :value="locale"
    :placeholder="t('main.select_language')"
    :disabled="pending"
    :required="true"
    :on-change="handleChangeLanguage"
  />
</template>
