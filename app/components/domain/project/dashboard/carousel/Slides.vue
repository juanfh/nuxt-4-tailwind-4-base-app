<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { EditIcon, TrashIcon } from '@lucide/vue'
import type { Slide } from '#shared/types/project/slide'
import DataTable from '@/components/common/tables/DataTable.vue'
import CarouselThumbnail from './components/CarouselThumbnail.vue'
import DeleteSlide from './delete/DeleteSlide.vue'
import type { DataTableAction } from '@/components/common/tables/types/table'

interface Props {
  slides: Slide[]
}

const props = defineProps<Props>()

const { t } = useI18n()
const router = useRouter()
const localePath = useLocalePath()

const slideToDelete = ref<Slide | null>(null)

const slidesList = ref<Slide[]>(props.slides)
watch(() => props.slides, (slides) => { slidesList.value = slides })

const slidesStore = useSlidesStore()
onMounted(() => slidesStore.clearSlidesIds())

const columns: ColumnDef<Slide>[] = [
  {
    accessorKey: 'image',
    header: t('main.image'),
    size: 96,
    cell: ({ row }) => h(CarouselThumbnail, {
      alt: row.original.data?.title ?? '',
      image: row.original.image?.small?.url,
      size: 'w-20',
    }),
  },
  {
    accessorKey: 'title',
    header: t('main.title'),
    minSize: 320,
    cell: ({ row }) => row.original.data?.title,
  },
  {
    accessorKey: 'link',
    header: t('main.cta_link'),
    size: 260,
    cell: ({ row }) => row.original.data?.cta?.link ?? '--',
  },
  {
    accessorKey: 'target',
    header: t('main.destination'),
    size: 120,
    cell: ({ row }) => {
      const cta = row.original.data?.cta
      return cta ? (cta.target === 'blank' ? t('main.external') : t('main.internal')) : '--'
    },
  },
]

const rowActions = (slideRow: Slide): DataTableAction<Slide>[] => [
  {
    label: t('main.edit_button'),
    icon: EditIcon,
    onClick: () => router.push(localePath(`${t('nav.dashboard_carousel.link')}/${slideRow.id}`)),
  },
  {
    label: t('main.delete_button'),
    icon: TrashIcon,
    onClick: () => { slideToDelete.value = slidesList.value.find(s => s.id === slideRow.id) ?? null },
  },
]

const onSlideDelete = (deletedSlide: Slide) => {
  slidesList.value = slidesList.value.filter(s => s.id !== deletedSlide.id)
  slideToDelete.value = null
}
</script>

<template>
  <DeleteSlide
    v-if="slideToDelete"
    :key="slideToDelete.id"
    :slide="slideToDelete"
    @slide-delete="onSlideDelete"
  />

  <div class="w-full flex flex-col gap-4">
    <DataTable
      :columns="columns"
      :data="slidesList"
      selectable
      :selected-ids="slidesStore.selectedSlidesIds"
      :on-select-one="slidesStore.addSlideId"
      :on-deselect-one="slidesStore.removeSlideId"
      :on-select-all="slidesStore.addSlidesIds"
      :on-deselect-all="slidesStore.removeSlidesIds"
      :actions="rowActions"
    />
  </div>
</template>
