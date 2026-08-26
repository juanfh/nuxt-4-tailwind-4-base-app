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

const ALL_VALUE = 'all'

const featured = computed(() => (route.query.featured === 'true' || route.query.featured === 'false' ? route.query.featured : ALL_VALUE))

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
