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
  onGenerate?: () => void
  onBlurTransform?: (value: string) => string
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  clearable: false,
})

const handleBlur = () => {
  if (!props.onBlurTransform) return
  const transformed = props.onBlurTransform(props.value ?? '')
  if (transformed !== props.value) props.onChange(transformed)
}
</script>

<template>
  <AppInput
    :id="id"
    :label="label"
    :placeholder="placeholder"
    type="text"
    :error="error"
    :value="value"
    :required="required"
    :disabled="disabled"
    :clearable="clearable"
    :on-change="onChange"
    :on-clear="() => onChange('')"
    :on-generate="onGenerate"
    @blur="handleBlur"
  />
</template>
