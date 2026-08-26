<script setup lang="ts">
import { ChevronsLeftIcon, ChevronLeftIcon, ChevronsRightIcon, ChevronRightIcon } from '@lucide/vue'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import NumPages from './NumPages.vue'
import ResultsPerPage from './ResultsPerPage.vue'

interface Props {
  page: number
  total: number
  limit: number
  visiblePages?: number
  mainLimits?: number[]
  itemsName?: string
  hideNumPages?: boolean
  hideResultsPerPage?: boolean
}

const props = defineProps<Props>()

const route = useRoute()

const showNumPages = computed(() => !props.hideNumPages)
const showResultsPerPage = computed(() => !props.hideResultsPerPage)
const showContainer = computed(() => showNumPages.value || showResultsPerPage.value)

const totalPages = computed(() => getTotalPages(props.total, props.limit))

const createPageQuery = (newPage: number) => {
  const query = { ...route.query }
  if (newPage === 1) delete query.page
  else query.page = String(newPage)
  return query
}

const pages = computed<(number | string)[]>(() => {
  const list: (number | string)[] = []
  const visible = props.visiblePages ?? 3

  if (totalPages.value <= visible + 2) {
    for (let i = 1; i <= totalPages.value; i++) list.push(i)
    return list
  }

  const start = Math.max(2, props.page - 1)
  const end = Math.min(totalPages.value - 1, props.page + 1)

  list.push(1)
  if (start > 2) list.push('...')
  for (let i = start; i <= end; i++) list.push(i)
  if (end < totalPages.value - 1) list.push('...')
  list.push(totalPages.value)

  return list
})
</script>

<template>
  <div v-if="totalPages > 0" class="flex flex-col lg:flex-row items-center justify-between gap-4">
    <div v-if="showNumPages" class="hidden lg:flex flex-col items-center">
      <NumPages :page="page" :total="total" :limit="limit" :items-name="itemsName" />
    </div>

    <nav v-if="totalPages > 1" role="navigation" aria-label="pagination" class="mx-auto flex w-full justify-center">
      <ul class="flex flex-row items-center gap-1">
        <li>
          <NuxtLink
            :to="{ path: route.path, query: createPageQuery(1) }"
            :class="cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'w-fit pl-1 pr-3', page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-neutral-100 dark:hover:bg-neutral-900 main-transition-color')"
          >
            <ChevronsLeftIcon />
            <span class="hidden sm:block">{{ $t('pagination.first') }}</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            :to="{ path: route.path, query: createPageQuery(Math.max(page - 1, 1)) }"
            :class="cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'w-fit pl-1 pr-3', page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-neutral-100 dark:hover:bg-neutral-900 main-transition-color')"
          >
            <ChevronLeftIcon />
            <span class="hidden sm:block">{{ $t('pagination.previous') }}</span>
          </NuxtLink>
        </li>

        <div class="md:px-4 flex flex-row items-center gap-1">
          <template v-for="(p, i) in pages" :key="p === '...' ? `ellipsis-${i}` : p">
            <span v-if="p === '...'" class="flex size-9 items-center justify-center">&#8230;</span>
            <NuxtLink
              v-else
              :to="{ path: route.path, query: createPageQuery(p as number) }"
              :class="cn(buttonVariants({ variant: p === page ? 'outline' : 'ghost', size: 'icon' }), 'border', p === page ? 'bg-neutral-100 dark:bg-neutral-900' : '', 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 main-transition-color')"
            >
              {{ p }}
            </NuxtLink>
          </template>
        </div>

        <li>
          <NuxtLink
            :to="{ path: route.path, query: createPageQuery(Math.min(page + 1, totalPages)) }"
            :class="cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'w-fit pl-3 pr-1', page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-neutral-100 dark:hover:bg-neutral-900 main-transition-color')"
          >
            <span class="hidden sm:block">{{ $t('pagination.next') }}</span>
            <ChevronRightIcon />
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            :to="{ path: route.path, query: createPageQuery(totalPages) }"
            :class="cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'w-fit pl-3 pr-1', page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-neutral-100 dark:hover:bg-neutral-900 main-transition-color')"
          >
            <span class="hidden sm:block">{{ $t('pagination.last') }}</span>
            <ChevronsRightIcon />
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div v-if="showContainer" class="w-full lg:w-fit flex flex-row items-center justify-between">
      <div v-if="showNumPages" class="lg:hidden">
        <NumPages :page="page" :total="total" :limit="limit" :items-name="itemsName" />
      </div>
      <ResultsPerPage v-if="showResultsPerPage" :limit="limit" :main-limits="mainLimits ?? [10, 20, 50]" :items-name="itemsName" />
    </div>
  </div>
</template>
