<script setup lang="ts">
import type { Faq } from '#shared/types/project/faq'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface Props {
  faqs: Faq[]
}

// Prefijado `Public*`
// (mismo motivo que PublicNews.vue): el dominio dashboard ya tiene un
// componente de listado en app/components/domain/project/dashboard/faqs/
// Faqs.vue — nombres de archivo distintos (`Faqs.vue` vs `FAQs.tsx` en Next,
// solo diferenciados por capitalización) habrían sido una colisión frágil e
// implícita de resolver, se evita con el mismo prefijo ya usado para `news`.
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
