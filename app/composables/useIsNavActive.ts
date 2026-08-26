import type { NavItem } from '#shared/types/navigation'

const cleanPath = (path: string) => (path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path)

export const useIsNavActive = (navItem: NavItem) => {
  const route = useRoute()
  const localePath = useLocalePath()

  const href = computed(() => localePath(navItem.link))

  const active = computed(() => {
    const currentPath = cleanPath(route.path)
    const link = cleanPath(href.value)
    const linkAlt = navItem.linkalt ? cleanPath(localePath(navItem.linkalt)) : undefined

    return currentPath === link || (!!linkAlt && (currentPath === linkAlt || currentPath.startsWith(`${linkAlt}/`)))
  })

  return { href, active }
}
