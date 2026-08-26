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
  <AppRichTextEditor
    :id="name"
    :label="label"
    :value="value ?? ''"
    :on-change="(v: string) => handleChange(v)"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :error="errorMessage"
  />
</template>
