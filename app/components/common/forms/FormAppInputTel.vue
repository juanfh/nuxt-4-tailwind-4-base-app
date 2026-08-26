<script setup lang="ts">
import { useField } from 'vee-validate'

interface Props {
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  clearable: false,
})

const { t } = useI18n()
const { value, errorMessage, handleChange } = useField<string>(() => props.name)
</script>

<template>
  <AppInputTel
    :id="name"
    :label="label ?? t('main.phone')"
    :placeholder="placeholder ?? t('main.phone_placeholder')"
    :error="errorMessage"
    :value="value ?? ''"
    :required="required"
    :disabled="disabled"
    :clearable="clearable"
    :on-change="(v: string) => handleChange(v)"
  />
</template>
