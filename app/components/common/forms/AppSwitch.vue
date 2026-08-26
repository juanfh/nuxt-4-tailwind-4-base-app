<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface Props {
  id: string
  label?: string
  checked?: boolean
  disabled?: boolean
  onChange?: (active: boolean) => void
}

defineProps<Props>()
</script>

<template>
  <div class="flex items-center space-x-2">
    <Switch
      :id="id"
      :model-value="checked"
      :disabled="disabled"
      class="bg-form-item-bg border border-form-item-border data-checked:*:bg-neutral-300 data-unchecked:*:bg-neutral-500 *:data-[slot='switch-thumb']:border *:data-[slot='switch-thumb']:border-form-item-bg cursor-pointer"
      @update:model-value="onChange?.(!!$event)"
    />
    <Label :for="id" class="text-form-item-text">{{ label }}</Label>
  </div>
</template>
