<script setup lang="ts">
// Port de src/components/main/navigation/i18n/SelectLocale.tsx (Next). El
// original construye sus propias opciones de idioma desde `routingConfig` y
// gestiona un estado `selected`/`isPending` local con `useTransition` porque
// el cambio de idioma con next-intl exige reconstruir el pathname a mano
// (`router.replace({ pathname, params }, { locale })`). Aquí `setLocale` de
// @nuxtjs/i18n ya resuelve la navegación a la ruta localizada y actualiza
// `locale` de forma reactiva, así que no hace falta estado `selected`
// propio: el `value` del select se liga directo a `locale`.
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
