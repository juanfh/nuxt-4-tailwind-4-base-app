<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import { EditIcon, TrashIcon } from '@lucide/vue'
import type { Faq } from '#shared/types/project/faq'
import DataTable from '@/components/common/tables/DataTable.vue'
import DeleteFaq from './delete/DeleteFaq.vue'
import type { DataTableAction } from '@/components/common/tables/types/table'

interface Props {
  faqs: Faq[]
}

const props = defineProps<Props>()

const { t } = useI18n()
const router = useRouter()
const localePath = useLocalePath()

const faqToDelete = ref<Faq | null>(null)

// Copia local reactiva de `faqs`, mismo patrón que `newsList` en News.vue.
const faqsList = ref<Faq[]>(props.faqs)
watch(() => props.faqs, (faqs) => { faqsList.value = faqs })

const faqsStore = useFaqsStore()
onMounted(() => faqsStore.clearFaqsIds())

// `Faq.id` ya es `string` (a diferencia de `New.id: number`) — sin necesidad
// del wrapper `NewsRow`/`numericId` que usa News.vue.
const columns: ColumnDef<Faq>[] = [
  {
    accessorKey: 'title',
    header: t('main.title'),
    minSize: 320,
    cell: ({ row }) => row.original.title,
  },
]

const rowActions = (faqRow: Faq): DataTableAction<Faq>[] => [
  {
    label: t('main.edit_button'),
    icon: EditIcon,
    onClick: () => router.push(localePath(`${t('nav.dashboard_faqs.link')}/${faqRow.id}`)),
  },
  {
    label: t('main.delete_button'),
    icon: TrashIcon,
    onClick: () => { faqToDelete.value = faqsList.value.find(f => f.id === faqRow.id) ?? null },
  },
]

const onFaqDelete = (deletedFaq: Faq) => {
  faqsList.value = faqsList.value.filter(f => f.id !== deletedFaq.id)
  faqToDelete.value = null
}
</script>

<template>
  <DeleteFaq
    v-if="faqToDelete"
    :key="faqToDelete.id"
    :faq="faqToDelete"
    @faq-delete="onFaqDelete"
  />

  <div class="w-full flex flex-col gap-4">
    <DataTable
      :columns="columns"
      :data="faqsList"
      selectable
      :selected-ids="faqsStore.selectedFaqsIds"
      :on-select-one="faqsStore.addFaqId"
      :on-deselect-one="faqsStore.removeFaqId"
      :on-select-all="faqsStore.addFaqsIds"
      :on-deselect-all="faqsStore.removeFaqsIds"
      :actions="rowActions"
    />
  </div>
</template>
