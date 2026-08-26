<script lang="ts">
export { isValidFormattedNumber } from '@/components/common/forms/AppInputNumber.vue'
</script>

<script setup lang="ts">
import { useField } from 'vee-validate'

interface Props {
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
  thousandsSeparator?: boolean
  allowDecimals?: boolean
  prefix?: string
  suffix?: string
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  clearable: false,
  thousandsSeparator: false,
  allowDecimals: false,
})

const { t } = useI18n()
const { value, errorMessage, handleChange } = useField<string>(() => props.name)
</script>

<template>
  <AppInputNumber
    :id="name"
    :label="label ?? t('main.number')"
    :placeholder="placeholder ?? '123'"
    :error="errorMessage"
    :value="value"
    :prefix="prefix"
    :suffix="suffix"
    :required="required"
    :disabled="disabled"
    :clearable="clearable"
    :thousands-separator="thousandsSeparator"
    :allow-decimals="allowDecimals"
    :on-change="(v: string) => handleChange(v)"
  />
</template>
