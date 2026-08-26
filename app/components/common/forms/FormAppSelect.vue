<script setup lang="ts">
import { useField } from 'vee-validate'

export interface SelectOption {
  label: string
  value: string
  selected?: boolean
  main?: boolean
}

interface Props {
  name: string
  width?: string
  label?: string
  options: SelectOption[]
  value?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  loading?: boolean
  onChange?: (value: string) => void
  onClear?: () => void
}

const props = defineProps<Props>()

// Nota: el original (FormAppSelect.tsx) tampoco pasa fieldState.error a
// AppSelect — AppSelect no muestra mensaje de error, se replica igual.
const { value: fieldValue, handleChange } = useField<string>(() => props.name)
</script>

<template>
  <AppSelect
    :id="name"
    :width="width"
    :label="label"
    :options="options"
    :value="fieldValue ?? value ?? ''"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :loading="loading"
    :on-change="(v: string) => { handleChange(v); onChange?.(v) }"
    :on-clear="() => { handleChange(''); onClear?.() }"
  />
</template>
