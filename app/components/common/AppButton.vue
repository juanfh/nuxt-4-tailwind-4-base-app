<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Button, type ButtonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type AppButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  component?: 'button' | 'a' | 'link'
  variant?: AppButtonVariant
  bsize?: 'default' | 'small' | 'large'
  label?: string
  url?: string
  rel?: string
  iconPosition?: 'left' | 'right'
  ariaLabel?: string
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  component: 'button',
  variant: 'default',
  bsize: 'default',
  iconPosition: 'left',
})

const linkSizeClass = 'text-sm h-9 px-4 py-2'

const variantClasses = {
  default: '!bg-primary-500 hover:!bg-primary-600 !text-white',
  secondary: '!bg-secondary-700 hover:!bg-secondary-600 !text-white',
  outline: '!border !border-neutral-300 dark:!border-neutral-600 hover:!bg-neutral-900/10 dark:hover:!bg-neutral-200/10',
  ghost: '!bg-transparent hover:!text-neutral-500 dark:hover:!text-neutral-400',
  destructive: '!bg-red-500 hover:!bg-red-600 !text-neutral-950',
  linkButton: '!bg-transparent !underline hover:!bg-transparent !text-primary-500 hover:!text-primary-600 !p-0 !h-auto',
  linkAsLinkOrA: `!bg-primary-500 hover:!bg-primary-600 !text-white ${linkSizeClass}`,
} as const

const buttonClass = computed(() => cn(
  'flex items-center justify-center rounded-sm cursor-pointer main-transition-color',
  props.variant !== 'link' && variantClasses[props.variant],
  props.variant === 'link' && props.component === 'button' && variantClasses.linkButton,
  props.variant === 'link' && props.component !== 'button' && variantClasses.linkAsLinkOrA,
  props.variant !== 'link' && props.component !== 'button' && linkSizeClass,
  props.bsize === 'small' && 'text-xs h-6 !px-2',
  props.bsize === 'large' && 'h-12 !px-6',
  props.class,
))

const buttonVariant = computed<ButtonVariants['variant']>(() =>
  props.variant === 'link' ? 'default' : props.variant,
)
</script>

<template>
  <Button
    v-if="component === 'button'"
    :type="type"
    :variant="buttonVariant"
    :rel="rel"
    :class="buttonClass"
    :aria-label="ariaLabel"
  >
    <slot v-if="iconPosition === 'left'" name="icon" />
    <slot>{{ label }}</slot>
    <slot v-if="iconPosition === 'right'" name="icon" />
  </Button>
  <NuxtLink
    v-else-if="component === 'link' && url"
    :to="url"
    :rel="rel"
    :class="cn('w-fit gap-2', buttonClass)"
    :aria-label="ariaLabel"
  >
    <slot v-if="iconPosition === 'left'" name="icon" />
    <slot>{{ label }}</slot>
    <slot v-if="iconPosition === 'right'" name="icon" />
  </NuxtLink>
  <a
    v-else-if="component === 'a' && url"
    :href="url"
    :rel="rel ?? 'noopener noreferrer'"
    target="_blank"
    :class="buttonClass"
    :aria-label="ariaLabel"
  >
    <slot v-if="iconPosition === 'left'" name="icon" />
    <slot>{{ label }}</slot>
    <slot v-if="iconPosition === 'right'" name="icon" />
  </a>
</template>
