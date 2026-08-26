<script setup lang="ts">
definePageMeta({
  middleware: 'account',
})

const { t } = useI18n()
const localePath = useLocalePath()

await navigateTo(localePath(t('nav.account.profile.link')))
</script>

<template />
