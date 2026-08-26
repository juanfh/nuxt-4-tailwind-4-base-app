<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { useDebounceFn } from '@vueuse/core'

interface Props {
  placeholder?: string
}

defineProps<Props>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const search = computed(() => (typeof route.query.search === 'string' ? route.query.search : ''))

// `useForm()` sin schema, solo para dar contexto ambiente a FormAppInputText
// (useField) — port de SearchFilter.tsx (Next), que también usa
// `useForm()` de react-hook-form sin resolver por el mismo motivo.
useForm({ initialValues: { search: search.value } })
const { value: searchValue } = useField<string>('search')

const changeSearchParam = useDebounceFn((value: string) => {
  const query = { ...route.query }
  delete query.page
  if (value === '') delete query.search
  else query.search = value
  router.push({ path: route.path, query })
}, 500)

const isFirstRender = ref(true)

watch(searchValue, (value) => {
  if (isFirstRender.value) {
    isFirstRender.value = false
    return
  }
  if (value === search.value) return
  changeSearchParam(value ?? '')
})
</script>

<template>
  <div class="w-72">
    <FormAppInputText
      name="search"
      :label="t('main.search')"
      :placeholder="placeholder ?? t('main.search_placeholder')"
      clearable
    />
  </div>
</template>
