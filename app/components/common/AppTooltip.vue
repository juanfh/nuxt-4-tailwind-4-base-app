<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Props {
  content: string
  position?: 'top' | 'right' | 'bottom' | 'left'
}

defineProps<Props>()
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <Tooltip>
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipContent
        :side="position"
        :side-offset="6"
        class="relative overflow-visible bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200 shadow-lg after:absolute after:size-2 after:rotate-45 after:bg-white dark:after:bg-neutral-900 after:content-[''] data-[side=top]:after:top-full data-[side=top]:after:left-1/2 data-[side=top]:after:-mt-1 data-[side=top]:after:-translate-x-1/2 data-[side=bottom]:after:bottom-full data-[side=bottom]:after:left-1/2 data-[side=bottom]:after:-mb-1 data-[side=bottom]:after:-translate-x-1/2 data-[side=left]:after:left-full data-[side=left]:after:top-1/2 data-[side=left]:after:-ml-1 data-[side=left]:after:-translate-y-1/2 data-[side=right]:after:right-full data-[side=right]:after:top-1/2 data-[side=right]:after:-mr-1 data-[side=right]:after:-translate-y-1/2"
      >
        <span>{{ content }}</span>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
