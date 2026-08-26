<script setup lang="ts">
import { useForm } from 'vee-validate'
import type { SelectOption } from '@/components/common/forms/AppSelect.vue'

interface Props {
  feminine?: boolean
}

const props = defineProps<Props>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// Reka UI (a diferencia de Radix UI/React que usa el original Next) prohíbe
// `<SelectItem value="">` en runtime ("A <SelectItem /> must have a value
// prop that is not an empty string" — está reservado para representar
// "sin selección"/placeholder) — se usa un sentinel `ALL_VALUE` solo para el
// value interno del Select, traducido a/desde ausencia de `?featured=` en la
// URL en el borde de este componente (featured/changeFeaturedParam), sin
// tocar AppSelect/ui/select (genéricos, otros consumidores sí pueden usar
// value: '' legítimamente).
const ALL_VALUE = 'all'

const featured = computed(() => (route.query.featured === 'true' || route.query.featured === 'false' ? route.query.featured : ALL_VALUE))

// `useForm()` sin schema, solo para dar contexto ambiente a FormAppSelect
// (useField) — mismo patrón que SearchFilter.vue/DateRangeFilter.vue.
useForm({ initialValues: { featured: featured.value } })

const options = computed<SelectOption[]>(() => props.feminine
  ? [
      { label: t('main.featured_filter_all_feminine'), value: ALL_VALUE },
      { label: t('main.featured_filter_featured_feminine'), value: 'true' },
      { label: t('main.featured_filter_not_featured_feminine'), value: 'false' },
    ]
  : [
      { label: t('main.featured_filter_all'), value: ALL_VALUE },
      { label: t('main.featured_filter_featured'), value: 'true' },
      { label: t('main.featured_filter_not_featured'), value: 'false' },
    ])

const changeFeaturedParam = (value: string) => {
  const query = { ...route.query }
  delete query.page
  if (value === ALL_VALUE) delete query.featured
  else query.featured = value
  router.push({ path: route.path, query })
}
</script>

<template>
  <FormAppSelect
    name="featured"
    label=""
    width="w-48"
    :options="options"
    :on-change="changeFeaturedParam"
  />
</template>
