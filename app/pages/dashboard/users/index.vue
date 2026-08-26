<script setup lang="ts">
import type { User } from '#shared/types/project/user'

// Port de src/app/[locale]/(project)/dashboard/users/page.tsx (Next), con
// EDIT_INLINE fijado a "true" (ver decisión de alcance de la Fase 8) — sin
// el botón "Ver" ni el flujo de edición en modal. A diferencia del Server
// Component original (que llama a getUsers() directo), esta página pasa por
// server/api/users (Nitro) vía useFetch — ver CLAUDE.md, decisión 3.
definePageMeta({
  layout: 'dashboard',
  middleware: 'dashboard',
})

const { t } = useI18n()
const route = useRoute()
// `useRuntimeConfig()` debe leerse aquí, no dentro del getter perezoso de
// useSeoMeta: unhead resuelve esos getters durante el renderizado de <head>,
// fuera del contexto de Nuxt activo — confirmado en el smoke test de esta
// fase ("A composable that requires access to the Nuxt instance was called
// outside of a plugin, Nuxt hook, Nuxt middleware, or Vue setup function").
const { appName } = useRuntimeConfig().public

const mainLimits = [5, 10, 20]

const page = computed(() => Number(route.query.page ?? '1'))
const limit = computed(() => Number(route.query.limit ?? String(mainLimits[0])))
const search = computed(() => (typeof route.query.search === 'string' ? route.query.search : undefined))
const sort = computed(() => (typeof route.query.sort === 'string' ? route.query.sort : 'name_asc'))

const { data } = await useFetch<{ data: User[], total: number }>('/api/users', {
  query: { search, page, limit, sort },
})

const users = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.total ?? 0)

useSeoMeta({
  title: () => `${t('pages.users.seo_title')} | ${appName}`,
  description: () => t('pages.users.seo_description'),
})
</script>

<template>
  <MainContentHeader>
    <UsersBreadCrumbs />
    <PageTitle :title="t('pages.users.title')" />
  </MainContentHeader>
  <Actions />
  <Users
    :users="users"
    :total="total"
    :page="page"
    :limit="limit"
    :main-limits="mainLimits"
  />
</template>
