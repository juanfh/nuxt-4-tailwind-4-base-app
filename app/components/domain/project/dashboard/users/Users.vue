<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { EditIcon, TrashIcon } from '@lucide/vue'
import type { User } from '#shared/types/project/user'
import DataTable from '@/components/common/tables/DataTable.vue'
import AppPagination from '@/components/common/pagination/AppPagination.vue'
import Avatar from './components/Avatar.vue'
import DeleteUser from './delete/DeleteUser.vue'
import type { DataTableAction } from '@/components/common/tables/types/table'

interface Props {
  users: User[]
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

const DEFAULT_SORT_KEY = 'name'
const DEFAULT_SORT_DIR: 'asc' | 'desc' = 'asc'

const sortParam = computed(() => (typeof route.query.sort === 'string' ? route.query.sort : undefined))
const [sortKeyFromParam, sortDirFromParam] = sortParam.value?.split('_') ?? [DEFAULT_SORT_KEY, DEFAULT_SORT_DIR]

const userToDelete = ref<User | null>(null)

// Copia local reactiva de `users`: permite eliminar una fila al instante
// (DeleteUser splice local) sin depender de que la página vuelva a pedir la
// lista a la API. Se resincroniza cuando `users` cambia (nueva navegación
// con distinta página/orden/búsqueda ⇒ nuevo useFetch en la página ⇒ nuevo
// array aquí).
const usersList = ref<User[]>(props.users)
watch(() => props.users, (users) => { usersList.value = users })

const usersStore = useUsersStore()
onMounted(() => usersStore.clearUsersIds())

// editInline fijado a "true" (ver decisión de alcance de la Fase 8): sin el
// botón/acción "Ver" ni el flujo de EditUserForm en modal — Editar siempre
// navega a la página de detalle. La búsqueda/orden/paginación se resuelven
// contra la query de la propia ruta, no contra estado local (server/api/users
// ya recibe esos mismos query params vía useFetch en la página).
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

// ⚠️ Gotcha (Fase 8): `FlexRender` (@tanstack/vue-table) invoca cada `cell`
// vía `h(cell, context)` — Vue lo trata como un componente funcional. Un
// componente funcional que devuelve `''` (string vacío) se normaliza de
// forma distinta en SSR que en cliente ("Hydration completed but contains
// mismatches", confirmado con headless Chrome contra la API real, sin
// crashear pero sí con una advertencia real) — devolver `undefined` en su
// lugar es la forma soportada de "no renderizar nada" y resuelve el
// mismatch. No aplica a `row.original.phone` (puede ser `undefined` de
// origen, nunca `''`), solo a los cálculos propios con fallback ternario.
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'image',
    header: t('main.image'),
    size: 72,
    cell: ({ row }) => h(Avatar, {
      name: `${row.original.name} ${row.original.surname}`,
      image: row.original.image?.small?.url,
      size: 'w-12',
    }),
  },
  {
    accessorKey: 'name',
    header: t('main.name'),
    size: 160,
    minSize: 120,
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: 'surname',
    header: t('main.surname'),
    size: 160,
    minSize: 120,
    cell: ({ row }) => row.original.surname,
  },
  {
    accessorKey: 'email',
    header: t('main.email'),
    minSize: 320,
    cell: ({ row }) => row.original.email,
  },
  {
    accessorKey: 'phone',
    header: t('main.phone'),
    size: 130,
    minSize: 110,
    cell: ({ row }) => row.original.phone,
  },
  {
    accessorKey: 'birthdate',
    header: t('main.birthdate'),
    size: 130,
    minSize: 110,
    cell: ({ row }) => (row.original.birthdate ? formatDate({ date: row.original.birthdate, locale: locale.value, format: FormatDate.SHORT }) : undefined),
  },
  {
    accessorKey: 'gender',
    header: t('main.gender'),
    size: 110,
    minSize: 90,
    cell: ({ row }) => (row.original.gender ? t(`main.${row.original.gender}`) : undefined),
  },
]

const rowActions = (user: User): DataTableAction<User>[] => [
  {
    label: t('main.edit_button'),
    icon: EditIcon,
    onClick: () => router.push(localePath(`${t('nav.users.link')}/${user.id}`)),
  },
  {
    label: t('main.delete_button'),
    icon: TrashIcon,
    onClick: () => { userToDelete.value = user },
  },
]

const onUserDelete = (deletedUser: User) => {
  usersList.value = usersList.value.filter(u => u.id !== deletedUser.id)
  userToDelete.value = null
}
</script>

<template>
  <DeleteUser
    v-if="userToDelete"
    :key="userToDelete.id"
    :user="userToDelete"
    @user-delete="onUserDelete"
  />

  <div class="w-full flex flex-col gap-4">
    <DataTable
      :columns="columns"
      :data="usersList"
      selectable
      :selected-ids="usersStore.selectedUsersIds"
      :on-select-one="usersStore.addUserId"
      :on-deselect-one="usersStore.removeUserId"
      :on-select-all="usersStore.addUsersIds"
      :on-deselect-all="usersStore.removeUsersIds"
      :sortable-columns="['name', 'surname', 'email', 'phone', 'birthdate', 'gender']"
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
      :items-name="t('pages.users.pagination_items')"
    />
  </div>
</template>
