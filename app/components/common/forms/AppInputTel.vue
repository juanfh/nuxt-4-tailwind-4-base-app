<script setup lang="ts">
interface Props {
  id: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
  value?: string
  error?: string
  onChange: (value: string) => void
}

withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  clearable: false,
})
</script>

<template>
  <AppInput
    :id="id"
    :label="label"
    :placeholder="placeholder"
    type="tel"
    :error="error"
    :value="value"
    :required="required"
    :disabled="disabled"
    :clearable="clearable"
    :on-change="onChange"
    :on-clear="() => onChange('')"
  />
</template>
