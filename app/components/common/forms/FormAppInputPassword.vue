<script setup lang="ts">
import { useField } from 'vee-validate'

interface Props {
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
  autoComplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  clearable: false,
})

const { value, errorMessage, handleChange } = useField<string>(() => props.name)
</script>

<template>
  <AppInputPassword
    :id="name"
    :label="label"
    :placeholder="placeholder"
    :error="errorMessage"
    :value="value ?? ''"
    :required="required"
    :disabled="disabled"
    :clearable="clearable"
    :auto-complete="autoComplete"
    :on-change="(v: string) => handleChange(v)"
  />
</template>
