<script setup lang="ts">
import { useField } from 'vee-validate'

// `control` (RHF) no tiene equivalente en VeeValidate: useField() recoge el
// formulario ambiente vía provide/inject desde el useForm() del ancestro más
// cercano, sin necesitar que se le pase explícito — se omite el prop control
// en todos los FormApp*, ver .project_docs/components.md.
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
