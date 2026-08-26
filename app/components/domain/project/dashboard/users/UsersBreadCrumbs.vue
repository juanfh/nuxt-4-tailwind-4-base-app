<script setup lang="ts">
import { ChevronRightIcon } from '@lucide/vue'
import BreadCrumb from '@/components/domain/main/navigation/breadcrumbs/BreadCrumb.vue'
import BreadCrumbs from '@/components/domain/main/navigation/breadcrumbs/BreadCrumbs.vue'

interface LinkProp {
  title: string
  slug?: string
  url?: string
}

interface Props {
  link?: LinkProp
}

const props = defineProps<Props>()

const { t } = useI18n()
const localePath = useLocalePath()

const linkUrl = computed(() => {
  if (!props.link) return undefined
  return props.link.url ?? `${t('nav.users.link')}/${props.link.slug}`
})
</script>

<template>
  <BreadCrumbs>
    <BreadCrumb :url="localePath(t('nav.home.link'))" :title="t('nav.home.label')" />
    <ChevronRightIcon class="w-4 h-4 text-neutral-400" />
    <BreadCrumb :url="localePath(t('nav.users.link'))" :title="t('nav.users.label')" />
    <template v-if="link">
      <ChevronRightIcon class="w-4 h-4 text-neutral-400" />
      <BreadCrumb :url="localePath(linkUrl!)" :title="link.title" />
    </template>
  </BreadCrumbs>
</template>
