<script setup lang="ts">
// Port de src/app/[locale]/account/page.tsx (Next) — redirige siempre a
// /mi-cuenta/perfil. `middleware: 'account'` replica el guard de sesión de
// account/layout.tsx (Next), que envuelve tanto esta ruta como profile/password.
definePageMeta({
  middleware: 'account',
})

const { t } = useI18n()
const localePath = useLocalePath()

await navigateTo(localePath(t('nav.account.profile.link')))
</script>

<template />
