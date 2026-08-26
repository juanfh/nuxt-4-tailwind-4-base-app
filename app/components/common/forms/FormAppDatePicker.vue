<script setup lang="ts">
import { format } from 'date-fns'
import { useField } from 'vee-validate'

interface Props {
  name: string
  label: string
  value?: string | Date
  required?: boolean
  onChange?: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  minDate?: string | Date
  maxDate?: string | Date
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Selecciona una fecha',
})

const getDateValue = (value?: string | Date) => {
  if (!value) return undefined
  const parsedValue = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsedValue.getTime()) ? undefined : parsedValue
}

const { value: fieldValue, errorMessage, handleChange } = useField<string>(() => props.name)

const handleDateChange = (nextDate: Date | undefined) => {
  const nextValue = nextDate ? format(nextDate, 'yyyy-MM-dd') : ''
  handleChange(nextValue)
  props.onChange?.(nextValue)
}
</script>

<template>
  <AppDatePicker
    :id="name"
    :label="label"
    :value="getDateValue(fieldValue ?? value)"
    :required="required"
    :on-change="handleDateChange"
    :placeholder="placeholder"
    :error="errorMessage"
    :disabled="disabled"
    :min-date="getDateValue(minDate)"
    :max-date="getDateValue(maxDate)"
  />
</template>
