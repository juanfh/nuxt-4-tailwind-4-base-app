<script setup lang="ts">
// Sin SelectLocale/ThemeToggle en la franja inferior del panel (a diferencia
// del original): ambos son piezas pendientes de esta fase (selector de
// idioma y theme switcher, ver CLAUDE.md "Decisiones pendientes") — se
// añaden cuando se porten.
import { MenuIcon, XIcon } from '@lucide/vue'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { NavItem } from '#shared/types/navigation'

interface Props {
  navItems: NavItem[]
}

defineProps<Props>()

const { t } = useI18n()
const open = ref(false)

const handleResize = () => {
  if (window.innerWidth >= 640) {
    open.value = false
  }
}

onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))
</script>

<template>
  <Sheet v-model:open="open">
    <SheetTrigger as-child class="md:hidden">
      <MenuIcon class="h-6 aspect-square cursor-pointer hover:text-primary-400 main-transition-color" />
    </SheetTrigger>

    <SheetContent side="left" :show-close-button="false" class="w-full max-w-none! flex flex-col gap-8 p-6 bg-white dark:bg-neutral-900 border-0">
      <SheetHeader class="p-0 flex flex-row items-center justify-between">
        <SheetTitle class="text-lg font-semibold">
          {{ t('main.menu') }}
        </SheetTitle>
        <SheetClose as-child>
          <XIcon class="h-5 aspect-square cursor-pointer" />
        </SheetClose>
      </SheetHeader>
      <SheetDescription class="sr-only">
        {{ t('main.menu_description') }}
      </SheetDescription>

      <nav class="grow flex flex-col gap-4">
        <MainNavigation :nav-items="navItems" @click-button="open = false" />
      </nav>
    </SheetContent>
  </Sheet>
</template>
