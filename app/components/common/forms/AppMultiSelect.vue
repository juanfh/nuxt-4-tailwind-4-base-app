<script setup lang="ts">
import { CheckIcon, ChevronDownIcon, XIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface AppMultiSelectOption {
  label: string
  value: string
}

interface Props {
  id: string
  label?: string
  options: AppMultiSelectOption[]
  value: string[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  maxVisibleOptions?: number
  error?: string
  onChange: (value: string[]) => void
}

const props = withDefaults(defineProps<Props>(), {
  maxVisibleOptions: 8,
})

const optionRowHeightPx = 32
const optionsContainerMaxHeight = computed(() => props.maxVisibleOptions * optionRowHeightPx)

const tagsContainerRef = ref<HTMLDivElement>()
const isOverflowing = ref(false)
const isOpen = ref(false)

const selectedOptions = computed(() => props.options.filter(option => props.value.includes(option.value)))

const updateOverflow = () => {
  const tagsContainer = tagsContainerRef.value
  if (!tagsContainer) {
    isOverflowing.value = false
    return
  }
  isOverflowing.value = tagsContainer.scrollWidth > tagsContainer.clientWidth
}

watch(selectedOptions, () => nextTick(updateOverflow), { immediate: true })

onMounted(() => window.addEventListener('resize', updateOverflow))
onUnmounted(() => window.removeEventListener('resize', updateOverflow))

const toggleValue = (optionValue: string) => {
  if (props.disabled) return

  const exists = props.value.includes(optionValue)
  const nextValue = exists
    ? props.value.filter(currentOptionValue => currentOptionValue !== optionValue)
    : [...props.value, optionValue]

  props.onChange(nextValue)
}

const removeValue = (optionValue: string) => {
  if (props.disabled) return
  props.onChange(props.value.filter(currentOptionValue => currentOptionValue !== optionValue))
}
</script>

<template>
  <div class="w-full">
    <Label v-if="label !== undefined" :for="id" class="mb-1 flex flex-row items-center gap-1 text-form-item-text">
      {{ label || ' ' }} <span v-if="required" class="text-red-500">*</span>
    </Label>

    <Popover v-model:open="isOpen">
      <PopoverTrigger as-child>
        <Button
          :id="id"
          type="button"
          variant="outline"
          :disabled="disabled"
          :aria-label="placeholder"
          :aria-required="required"
          :class="cn(
            'h-9 w-full justify-between bg-form-item-bg border px-3 py-2 text-left text-sm font-normal hover:bg-form-item-bg focus:border-primary-500 focus-visible:border-primary-500 focus-visible:ring-primary-500/30',
            isOpen ? 'border-primary-500' : 'border-form-item-border',
            error && 'border-red-500 focus:border-red-500',
          )"
        >
          <div class="relative min-w-0 flex-1">
            <div ref="tagsContainerRef" class="flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap">
              <template v-if="selectedOptions.length > 0">
                <span
                  v-for="option in selectedOptions"
                  :key="option.value"
                  class="inline-flex shrink-0 items-center gap-1 rounded-md border border-form-item-border bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 text-xs text-form-item-text"
                >
                  {{ option.label }}
                  <span
                    role="button"
                    :tabindex="disabled ? -1 : 0"
                    :aria-label="`Eliminar ${option.label}`"
                    class="inline-flex items-center rounded-sm text-neutral-500 dark:text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-neutral-200 disabled:opacity-50"
                    @click.prevent.stop="removeValue(option.value)"
                    @keydown="(event: KeyboardEvent) => {
                      if (disabled) return
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        event.stopPropagation()
                        removeValue(option.value)
                      }
                    }"
                  >
                    <XIcon class="size-3" />
                  </span>
                </span>
              </template>
              <span v-else class="truncate text-neutral-500 dark:text-neutral-400">
                {{ placeholder }}
              </span>
            </div>

            <span
              v-if="isOverflowing && selectedOptions.length > 0"
              class="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 bg-form-item-bg pl-1 text-neutral-500 dark:text-neutral-400"
            >
              ...
            </span>
          </div>

          <ChevronDownIcon class="size-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" class="w-[var(--anchor-width)] bg-form-item-bg border border-form-item-border p-1">
        <div
          :style="{ maxHeight: `${optionsContainerMaxHeight}px` }"
          class="overflow-y-auto pr-1 [scrollbar-color:theme(colors.neutral.500)_theme(colors.neutral.800)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-thumb:hover]:bg-neutral-400"
        >
          <div
            v-for="option in options"
            :key="option.value"
            role="button"
            :tabindex="disabled ? -1 : 0"
            :aria-disabled="disabled"
            class="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-sm text-form-item-text transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-50"
            @click="toggleValue(option.value)"
            @keydown="(event: KeyboardEvent) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                toggleValue(option.value)
              }
            }"
          >
            <Checkbox
              :model-value="value.includes(option.value)"
              class="border-neutral-500 dark:border-neutral-400 data-[checked]:bg-neutral-200 dark:data-[checked]:bg-neutral-700 data-[checked]:text-form-item-text"
              @click.stop
              @update:model-value="(checked) => {
                if (disabled) return
                if (checked) {
                  onChange(Array.from(new Set([...value, option.value])))
                  return
                }
                removeValue(option.value)
              }"
            />
            <span class="flex-1">{{ option.label }}</span>
            <CheckIcon v-if="value.includes(option.value)" class="size-4 text-form-item-text" />
          </div>
        </div>
      </PopoverContent>
    </Popover>

    <span v-if="error" class="text-red-500 text-xs mt-1 block">
      {{ error }}
    </span>
  </div>
</template>
