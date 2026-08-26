/* watch=técnicas, waca=analíticas, wacf=funcionalidad/personalización, wacp=publicitarias. */
export const useCookiesStore = defineStore('cookies', () => {
  const state = reactive({
    hasHydrated: false,
    watch: false,
    waca: false,
    wacf: false,
    wacp: false,
  })

  const setHasHydrated = (value: boolean) => {
    state.hasHydrated = value
  }

  const setStoreCookie = (type: string, value: boolean) => {
    (state as Record<string, boolean>)[type] = value
  }

  return {
    ...toRefs(state),
    setHasHydrated,
    setStoreCookie,
  }
}, {
  persist: {
    key: persistedStoreKey('cookies'),
    pick: ['watch', 'waca', 'wacf', 'wacp'],
    afterHydrate: (ctx) => {
      (ctx.store as unknown as { setHasHydrated: (value: boolean) => void }).setHasHydrated(true)
    },
  },
})
