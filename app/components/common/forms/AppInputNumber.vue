<script lang="ts">
export interface AppInputNumberFormatOptions {
  thousandsSeparator: boolean
  allowDecimals: boolean
}

const formatThousands = (digits: string) => {
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const normalizeNumericValue = (rawValue: string, { thousandsSeparator, allowDecimals }: AppInputNumberFormatOptions) => {
  if (!rawValue) return ''

  if (!allowDecimals) {
    const digitsOnly = rawValue.replace(/\D/g, '')
    return thousandsSeparator ? formatThousands(digitsOnly) : digitsOnly
  }

  const cleanedValue = rawValue.replace(/[^\d,]/g, '')
  const commaIndex = cleanedValue.indexOf(',')

  const integerRaw = commaIndex === -1 ? cleanedValue : cleanedValue.slice(0, commaIndex)
  const decimalRaw = commaIndex === -1 ? '' : cleanedValue.slice(commaIndex + 1).replace(/,/g, '')

  const integerDigits = integerRaw.replace(/\D/g, '')
  const decimalDigits = decimalRaw.replace(/\D/g, '').slice(0, 2)
  const formattedInteger = thousandsSeparator ? formatThousands(integerDigits) : integerDigits

  if (commaIndex !== -1) {
    return `${formattedInteger},${decimalDigits}`
  }

  return formattedInteger
}

export const isValidFormattedNumber = (value: string, { thousandsSeparator, allowDecimals }: AppInputNumberFormatOptions) => {
  if (allowDecimals && thousandsSeparator) return /^\d{1,3}(\.\d{3})*(,\d{1,2})?$/.test(value)
  if (allowDecimals && !thousandsSeparator) return /^\d+(,\d{1,2})?$/.test(value)
  if (!allowDecimals && thousandsSeparator) return /^\d{1,3}(\.\d{3})*$/.test(value)
  return /^\d+$/.test(value)
}
</script>

<script setup lang="ts">
interface Props {
  id: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
  thousandsSeparator?: boolean
  allowDecimals?: boolean
  prefix?: string
  suffix?: string
  value?: string
  error?: string
  onChange: (value: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  clearable: false,
  thousandsSeparator: false,
  allowDecimals: false,
})

const handleChange = (rawValue: string) => {
  props.onChange(normalizeNumericValue(rawValue, {
    thousandsSeparator: props.thousandsSeparator,
    allowDecimals: props.allowDecimals,
  }))
}
</script>

<template>
  <AppInput
    :id="id"
    :label="label"
    :placeholder="placeholder"
    type="text"
    inputmode="numeric"
    :pattern="allowDecimals ? '[0-9,.]*' : '[0-9.]*'"
    :error="error"
    :value="value"
    :prefix="prefix"
    :suffix="suffix"
    :required="required"
    :disabled="disabled"
    :clearable="clearable"
    :on-change="handleChange"
    :on-clear="() => onChange('')"
  />
</template>
