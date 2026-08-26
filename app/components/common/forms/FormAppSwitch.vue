<script setup lang="ts">
import { useField } from 'vee-validate'

interface Props {
  name: string
  label?: string
  checked?: boolean
  disabled?: boolean
  onChange?: (active: boolean) => void
}

const props = defineProps<Props>()

const { value, handleChange } = useField<boolean>(() => props.name)
</script>

<template>
  <AppSwitch
    :id="name"
    :label="label"
    :checked="value ?? checked"
    :disabled="disabled"
    :on-change="(active: boolean) => { handleChange(active); onChange?.(active) }"
  />
</template>
