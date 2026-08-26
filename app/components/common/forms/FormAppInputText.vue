<script setup lang="ts">
import { useField } from 'vee-validate'

interface Props {
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
  onGenerate?: () => void
  onBlurTransform?: (value: string) => string
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  clearable: false,
})

const { value, errorMessage, handleChange } = useField<string>(() => props.name)
</script>

<template>
  <AppInputText
    :id="name"
    :label="label"
    :placeholder="placeholder"
    :error="errorMessage"
    :value="value ?? ''"
    :required="required"
    :disabled="disabled"
    :clearable="clearable"
    :on-change="(v: string) => handleChange(v)"
    :on-generate="onGenerate"
    :on-blur-transform="onBlurTransform"
  />
</template>
