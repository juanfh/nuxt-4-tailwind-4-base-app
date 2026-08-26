<script setup lang="ts">
import { UserIcon, XIcon } from '@lucide/vue'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import type { NavItem } from '#shared/types/navigation'

const { t } = useI18n()
const open = ref(false)

const navItems = computed<NavItem[]>(() => [
  {
    id: 'profile',
    link: t('nav.account.profile.link'),
    label: t('nav.account.profile.label'),
  },
  {
    id: 'password',
    link: t('nav.account.password.link'),
    label: t('nav.account.password.label'),
  },
])
</script>

<template>
  <Sheet v-model:open="open">
    <SheetTrigger as-child>
      <div class="cursor-pointer h-6 aspect-square bg-white dark:bg-neutral-800 rounded-full grid grid-cols-1 place-items-center hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-primary-400 main-transition-color">
        <UserIcon class="h-4 aspect-square" />
      </div>
    </SheetTrigger>

    <SheetContent side="right" :show-close-button="false" class="w-full max-w-md! flex flex-col gap-8 p-6 bg-white dark:bg-neutral-900 border-0">
      <SheetHeader class="p-0 flex flex-row items-center justify-between">
        <SheetTitle class="text-lg font-semibold">
          {{ t('nav.account.label') }}
        </SheetTitle>
        <SheetClose as-child>
          <XIcon class="h-5 aspect-square cursor-pointer" />
        </SheetClose>
      </SheetHeader>
      <SheetDescription class="sr-only">
        {{ t('nav.account.menu_description') }}
      </SheetDescription>

      <nav class="grow flex flex-col gap-4">
        <AccountNavigation :nav-items="navItems" @click-button="open = false" />
        <DashboardMenu @click-button="open = false" />
      </nav>

      <div class="flex flex-col gap-4">
        <Separator />
        <LogoutButton />
      </div>
    </SheetContent>
  </Sheet>
</template>
