<script setup lang="ts">
import { useField } from 'vee-validate'

interface Props {
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

const props = defineProps<Props>()

const { value, errorMessage, handleChange } = useField<string>(() => props.name)
</script>

<template>
  <AppTextArea
    :id="name"
    :label="label"
    :value="value ?? ''"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :error="errorMessage"
    :on-change="(v: string) => handleChange(v)"
  />
</template>
