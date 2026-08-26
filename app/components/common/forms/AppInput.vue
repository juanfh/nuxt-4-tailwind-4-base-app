<script setup lang="ts">
import { EyeIcon, EyeOffIcon, RefreshCcwDotIcon, XIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

defineOptions({
  inheritAttrs: false,
})

interface Props {
  id: string
  type?: string
  label?: string
  error?: string
  passwordToggle?: boolean
  clearable?: boolean
  required?: boolean
  value?: string
  prefix?: string
  suffix?: string
  disabled?: boolean
  placeholder?: string
  onChange?: (value: string) => void
  onClear?: () => void
  onGenerate?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  passwordToggle: false,
  clearable: false,
  required: false,
})

const showPassword = ref(false)
const isPassword = computed(() => props.passwordToggle && props.type === 'password')
const inputType = computed(() => isPassword.value ? (showPassword.value ? 'text' : 'password') : props.type)
const showClearButton = computed(() => props.clearable && !!props.value && !isPassword.value)
const showGenerateButton = computed(() => !!props.onGenerate && !showClearButton.value && !props.disabled)
const showRightButton = computed(() => isPassword.value || showClearButton.value || showGenerateButton.value)
</script>

<template>
  <div class="w-full">
    <Label v-if="label !== undefined" :for="id" class="mb-1 flex flex-row items-center gap-1 text-form-item-text">
      {{ label || ' ' }} <span v-if="required" class="text-red-500">*</span>
    </Label>

    <div class="relative">
      <span v-if="prefix" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500 dark:text-neutral-400">
        {{ prefix }}
      </span>

      <Input
        :id="id"
        :type="inputType"
        :class="cn(
          'bg-form-item-bg border',
          error ? 'border-red-500 focus:border-red-500' : 'border-form-item-border focus:border-primary-500',
          prefix ? 'pl-6' : '',
          suffix || showRightButton ? 'pr-12' : '',
        )"
        :model-value="value"
        :disabled="disabled"
        :placeholder="placeholder"
        v-bind="$attrs"
        @update:model-value="onChange?.(String($event ?? ''))"
      />

      <span v-if="suffix" class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500 dark:text-neutral-400">
        {{ suffix }}
      </span>

      <Button
        v-if="isPassword"
        type="button"
        variant="ghost"
        size="sm"
        :class="cn('absolute top-1/2 -translate-y-1/2 p-1 cursor-pointer', suffix ? 'right-8' : 'right-0')"
        :tabindex="-1"
        @click="showPassword = !showPassword"
      >
        <EyeOffIcon v-if="showPassword" class="w-4 h-4" />
        <EyeIcon v-else class="w-4 h-4" />
      </Button>

      <Button
        v-if="showClearButton"
        type="button"
        variant="ghost"
        size="sm"
        :class="cn('absolute top-1/2 -translate-y-1/2 p-1 cursor-pointer', suffix ? 'right-8' : 'right-0')"
        :tabindex="-1"
        @click="onClear?.()"
      >
        <XIcon class="w-4 h-4 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200" />
      </Button>

      <Button
        v-if="showGenerateButton"
        type="button"
        variant="ghost"
        size="sm"
        :class="cn('absolute top-1/2 -translate-y-1/2 p-1 cursor-pointer', suffix ? 'right-8' : 'right-0')"
        :tabindex="-1"
        @click="onGenerate?.()"
      >
        <RefreshCcwDotIcon class="w-4 h-4 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200" />
      </Button>
    </div>

    <span v-if="error" class="text-red-500 text-xs mt-1 block">
      {{ error }}
    </span>
  </div>
</template>
