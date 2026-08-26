<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { XIcon } from '@lucide/vue'

interface Props {
  fromLabel?: string
  toLabel?: string
}

defineProps<Props>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const dateFrom = computed(() => (typeof route.query.date_from === 'string' ? route.query.date_from : ''))
const dateTo = computed(() => (typeof route.query.date_to === 'string' ? route.query.date_to : ''))

useForm({ initialValues: { dateFrom: dateFrom.value, dateTo: dateTo.value } })
const { value: dateFromValue, setValue: setDateFromValue } = useField<string>('dateFrom')
const { value: dateToValue, setValue: setDateToValue } = useField<string>('dateTo')

const changeDateParam = (key: 'date_from' | 'date_to', value: string) => {
  const query = { ...route.query }
  delete query.page
  if (value === '') delete query[key]
  else query[key] = value
  router.push({ path: route.path, query })
}

const handleClearDates = () => {
  setDateFromValue('')
  setDateToValue('')
  const query = { ...route.query }
  delete query.page
  delete query.date_from
  delete query.date_to
  router.push({ path: route.path, query })
}
</script>

<template>
  <div class="flex flex-row items-end gap-2">
    <div class="w-44">
      <FormAppDatePicker
        name="dateFrom"
        :label="fromLabel ?? t('main.start_date')"
        :placeholder="t('main.start_date_placeholder')"
        :max-date="dateToValue || undefined"
        :on-change="(value: string) => changeDateParam('date_from', value)"
      />
    </div>
    <div class="w-44">
      <FormAppDatePicker
        name="dateTo"
        :label="toLabel ?? t('main.end_date')"
        :placeholder="t('main.end_date_placeholder')"
        :min-date="dateFromValue || undefined"
        :on-change="(value: string) => changeDateParam('date_to', value)"
      />
    </div>
    <AppButton
      :label="t('main.clear_button')"
      :disabled="!dateFromValue && !dateToValue"
      @click="handleClearDates"
    >
      <template #icon>
        <XIcon class="flex-none h-4 aspect-square" />
      </template>
    </AppButton>
  </div>
</template>
