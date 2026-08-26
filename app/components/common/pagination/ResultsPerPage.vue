<script setup lang="ts">
interface Props {
  limit: number
  mainLimits: number[]
  itemsName?: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// `newLimit === 1` (no `mainLimits[0]`) es un port literal de un aparente
// residuo del original (ResultsPerPage.tsx, Next) — no se "arregla" aquí,
// mismo criterio que otras inconsistencias heredadas ya documentadas
// (ver .project_docs/i18n.md, nav.signup.link).
const onChangeLimit = (value: string) => {
  const newLimit = Number(value)
  const query = { ...route.query }
  if (newLimit === 1) {
    delete query.limit
  }
  else {
    query.limit = String(newLimit)
  }
  delete query.page
  router.push({ path: route.path, query })
}
</script>

<template>
  <div class="flex flex-col xl:flex-row items-end xl:items-center gap-1">
    <span class="capitalize-first text-xs text-right lg:whitespace-nowrap">{{ t('pagination.items_per_page', { items: itemsName ?? t('pagination.elements') }) }}:</span>
    <AppSelect
      id="results-per-page"
      :options="mainLimits.map((l) => ({ label: String(l), value: String(l) }))"
      :value="String(limit)"
      :placeholder="String(limit)"
      :on-change="onChangeLimit"
    />
  </div>
</template>
