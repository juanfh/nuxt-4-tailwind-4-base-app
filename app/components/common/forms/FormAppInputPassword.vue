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

// El original usa useTranslations("pages.account.password") como fallback de
// label/placeholder (current_password_label/placeholder) — ese namespace no
// está portado (pertenece a una fase de cuenta/password todavía sin migrar).
// Sin fallback por defecto aquí: los consumidores deben pasar label/placeholder
// explícitos hasta que se porte ese namespace — ver .project_docs/components.md.
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
