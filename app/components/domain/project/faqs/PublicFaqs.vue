<script setup lang="ts">
import type { Faq } from '#shared/types/project/faq'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface Props {
  faqs: Faq[]
}

defineProps<Props>()
</script>

<template>
  <Accordion type="multiple" class="w-full flex flex-col gap-4">
    <AccordionItem
      v-for="(faq, i) in faqs"
      :key="faq.id"
      :value="`item-${i}`"
      class="border last:border border-main-card-border rounded-md"
    >
      <AccordionTrigger class="bg-main-card-bg px-4 cursor-pointer hover:no-underline">
        <PageTitle type="h3" :title="faq.title" />
      </AccordionTrigger>
      <AccordionContent class="pt-4 px-4">
        <Text :text="faq.description" />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
