<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { EditIcon, TrashIcon } from '@lucide/vue'
import type { New } from '#shared/types/project/new'
import DataTable from '@/components/common/tables/DataTable.vue'
import AppPagination from '@/components/common/pagination/AppPagination.vue'
import Thumbnail from './components/Thumbnail.vue'
import DeleteNew from './delete/DeleteNew.vue'
import type { DataTableAction } from '@/components/common/tables/types/table'

interface Props {
  news: New[]
  total: number
  page: number
  limit: number
  mainLimits?: number[]
}

const props = defineProps<Props>()

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()

const DEFAULT_SORT_KEY = 'date'
const DEFAULT_SORT_DIR: 'asc' | 'desc' = 'desc'

const sortParam = computed(() => (typeof route.query.sort === 'string' ? route.query.sort : undefined))
const [sortKeyFromParam, sortDirFromParam] = sortParam.value?.split('_') ?? [DEFAULT_SORT_KEY, DEFAULT_SORT_DIR]

const newsToDelete = ref<New | null>(null)

const newsList = ref<New[]>(props.news)
watch(() => props.news, (news) => { newsList.value = news })

const newsStore = useNewsStore()
onMounted(() => newsStore.clearNewsIds())

interface NewsRow extends Omit<New, 'id'> {
  id: string
  numericId: number
}

const newsRows = computed<NewsRow[]>(() => newsList.value.map(n => ({ ...n, id: String(n.id), numericId: n.id })))

const changeSortParam = (key: string, direction: 'asc' | 'desc' | null) => {
  const query = { ...route.query }
  if (key === DEFAULT_SORT_KEY && direction === DEFAULT_SORT_DIR) {
    delete query.sort
  }
  else {
    query.sort = `${key}_${direction}`
  }
  router.push({ path: route.path, query })
}

const columns: ColumnDef<NewsRow>[] = [
  {
    accessorKey: 'image',
    header: t('main.image'),
    size: 96,
    cell: ({ row }) => h(Thumbnail, {
      alt: row.original.title,
      image: row.original.image?.small?.url,
      size: 'w-16',
    }),
  },
  {
    accessorKey: 'title',
    header: t('main.title'),
    minSize: 220,
    cell: ({ row }) => row.original.title,
  },
  {
    accessorKey: 'date',
    header: t('main.date'),
    size: 130,
    minSize: 110,
    cell: ({ row }) => (row.original.date ? formatDate({ date: row.original.date, locale: locale.value, format: FormatDate.SHORT }) : undefined),
  },
  {
    accessorKey: 'featured',
    header: t('pages.dashboard_news.featured_column'),
    size: 110,
    minSize: 90,
    cell: ({ row }) => (row.original.featured ? t('main.yes') : t('main.no')),
  },
]

const rowActions = (newsRow: NewsRow): DataTableAction<NewsRow>[] => [
  {
    label: t('main.edit_button'),
    icon: EditIcon,
    onClick: () => router.push(localePath(`${t('nav.dashboard_news.link')}/${newsRow.numericId}`)),
  },
  {
    label: t('main.delete_button'),
    icon: TrashIcon,
    onClick: () => { newsToDelete.value = newsList.value.find(n => n.id === newsRow.numericId) ?? null },
  },
]

const onNewsDelete = (deletedNews: New) => {
  newsList.value = newsList.value.filter(n => n.id !== deletedNews.id)
  newsToDelete.value = null
}
</script>

<template>
  <DeleteNew
    v-if="newsToDelete"
    :key="newsToDelete.id"
    :news-item="newsToDelete"
    @news-delete="onNewsDelete"
  />

  <div class="w-full flex flex-col gap-4">
    <DataTable
      :columns="columns"
      :data="newsRows"
      selectable
      :selected-ids="newsStore.selectedNewsIds"
      :on-select-one="newsStore.addNewId"
      :on-deselect-one="newsStore.removeNewId"
      :on-select-all="newsStore.addNewsIds"
      :on-deselect-all="newsStore.removeNewsIds"
      :sortable-columns="['title', 'date', 'featured']"
      :current-sort="{ key: sortKeyFromParam ?? '', direction: (sortDirFromParam as 'asc' | 'desc' | null) ?? null }"
      :on-sort-change="changeSortParam"
      :actions="rowActions"
    />
    <AppPagination
      :page="page"
      :total="total"
      :limit="limit"
      :visible-pages="5"
      :main-limits="mainLimits"
      :items-name="t('pages.dashboard_news.pagination_items')"
    />
  </div>
</template>
