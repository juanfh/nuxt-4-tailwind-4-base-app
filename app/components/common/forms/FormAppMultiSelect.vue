<script setup lang="ts">
import { useField } from 'vee-validate'
import type { AppMultiSelectOption } from '@/components/common/forms/AppMultiSelect.vue'

interface Props {
  name: string
  label?: string
  options: AppMultiSelectOption[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  maxVisibleOptions?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisibleOptions: 8,
})

const { value, errorMessage, handleChange } = useField<string[]>(() => props.name)
</script>

<template>
  <AppMultiSelect
    :id="name"
    :label="label"
    :options="options"
    :value="Array.isArray(value) ? value : []"
    :on-change="(v: string[]) => handleChange(v)"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :max-visible-options="maxVisibleOptions"
    :error="errorMessage"
  />
</template>
