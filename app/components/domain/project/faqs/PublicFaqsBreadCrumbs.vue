<script setup lang="ts">
import { ChevronRightIcon } from '@lucide/vue'
import BreadCrumb from '@/components/domain/main/navigation/breadcrumbs/BreadCrumb.vue'
import BreadCrumbs from '@/components/domain/main/navigation/breadcrumbs/BreadCrumbs.vue'

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <BreadCrumbs>
    <BreadCrumb :url="localePath(t('nav.home.link'))" :title="t('nav.home.label')" />
    <ChevronRightIcon class="w-4 h-4 text-neutral-400" />
    <BreadCrumb :url="localePath(t('nav.faqs.link'))" :title="t('nav.faqs.label')" />
  </BreadCrumbs>
</template>
