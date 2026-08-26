<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

defineOptions({
  inheritAttrs: false,
})

interface Props {
  id: string
  label?: string
  value: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  onChange: (value: string) => void
}

defineProps<Props>()
</script>

<template>
  <div class="w-full">
    <Label v-if="label !== undefined" :for="id" class="mb-1 flex flex-row items-center gap-1 text-form-item-text">
      {{ label || ' ' }} <span v-if="required" class="text-red-500">*</span>
    </Label>
    <Textarea
      :id="id"
      :class="cn(
        'bg-form-item-bg border text-form-item-text',
        error ? 'border-red-500 focus:border-red-500' : 'border-form-item-border focus:border-primary-500',
      )"
      :model-value="value"
      :placeholder="placeholder"
      :disabled="disabled"
      v-bind="$attrs"
      @update:model-value="onChange(String($event ?? ''))"
    />
    <span v-if="error" class="text-red-500 text-xs mt-1 block">
      {{ error }}
    </span>
  </div>
</template>
