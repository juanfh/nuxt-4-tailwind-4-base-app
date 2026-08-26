<script setup lang="ts">
import { XIcon } from '@lucide/vue'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

export interface SelectOption {
  label: string
  value: string
  selected?: boolean
  main?: boolean
}

interface Props {
  id: string
  width?: string
  label?: string
  options: SelectOption[]
  value: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  loading?: boolean
  onChange?: (value: string) => void
  onClear?: () => void
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div :class="width ?? 'w-full'">
    <Label v-if="label !== undefined" :for="id" class="mb-1 flex flex-row items-center gap-1 text-form-item-text">
      {{ label || ' ' }} <span v-if="required" class="text-red-500">*</span>
    </Label>
    <Select
      :model-value="value"
      :disabled="disabled"
      :required="required"
      @update:model-value="(v) => onChange?.(String(v))"
    >
      <div class="relative">
        <SelectTrigger
          :id="id"
          :aria-label="placeholder"
          :aria-required="required"
          class="w-full min-w-18 bg-form-item-bg border border-form-item-border focus:border-primary-500 focus-visible:border-primary-500 aria-expanded:border-primary-500 data-[open]:border-primary-500 data-[popup-open]:border-primary-500 [&_[data-slot=select-icon]_svg]:!opacity-100"
        >
          <div v-if="loading" class="flex items-center gap-2">
            <Spinner />
            <span>{{ t('main.loading') }}...</span>
          </div>
          <SelectValue v-else :placeholder="placeholder" />
        </SelectTrigger>
        <button
          v-if="onClear && value && !disabled"
          type="button"
          class="absolute right-4 top-1/2 -translate-y-1/2 bg-form-item-bg text-neutral-500 dark:text-neutral-400"
          :aria-label="t('main.clear_button')"
          @click.stop="onClear()"
        >
          <XIcon :size="14" />
        </button>
      </div>
      <SelectContent class="custom-select-content bg-form-item-bg border border-form-item-border p-1">
        <SelectGroup>
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            :label="option.label"
            class="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            {{ option.label }}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
</template>
