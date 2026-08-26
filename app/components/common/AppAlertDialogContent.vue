<script setup lang="ts">
import { Loader2Icon, XIcon } from '@lucide/vue'
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface Props {
  size?: string
  cancel?: boolean
  title?: string
  description?: string
  isLoading?: boolean
  cancelLabel?: string
  confirmLabel?: string
  confirmVariant?: 'default' | 'destructive'
  onConfirm?: () => void
}

const props = defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <AlertDialogTrigger v-if="$slots.trigger" as-child>
    <slot name="trigger" />
  </AlertDialogTrigger>
  <AlertDialogContent :class="cn('bg-form-item-bg border-dialog-border shadow-md', size)">
    <AlertDialogCancel
      v-if="cancel"
      class="group absolute right-2 top-2 border-0 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer rounded-md main-transition-color"
      as-child
    >
      <SquareIconButton
        variant="ghost"
        :aria-label="t('main.close')"
        other-classes="absolute right-2 top-2"
      >
        <template #icon>
          <XIcon class="h-4 w-4" />
        </template>
      </SquareIconButton>
    </AlertDialogCancel>

    <AlertDialogHeader v-if="title || description">
      <AlertDialogTitle v-if="title">{{ title }}</AlertDialogTitle>
      <AlertDialogDescription v-if="description">{{ description }}</AlertDialogDescription>
    </AlertDialogHeader>

    <slot />

    <AlertDialogFooter v-if="cancelLabel || confirmLabel" class="flex flex-row items-center gap-2">
      <AlertDialogCancel v-if="cancelLabel" as-child>
        <AppButton
          variant="outline"
          :label="cancelLabel"
          :disabled="isLoading"
        >
          <template #icon>
            <XIcon class="flex-none h-4 aspect-square" />
          </template>
        </AppButton>
      </AlertDialogCancel>
      <AlertDialogAction v-if="confirmLabel" as-child @click="onConfirm">
        <AppButton
          :label="confirmLabel"
          :disabled="isLoading"
          :variant="confirmVariant ?? 'default'"
        >
          <template v-if="$slots.confirmIcon" #icon>
            <Loader2Icon v-if="isLoading" class="animate-spin flex-none h-4 aspect-square" />
            <slot v-else name="confirmIcon" />
          </template>
        </AppButton>
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</template>
