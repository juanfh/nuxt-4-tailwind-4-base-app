// watch=técnicas, waca=analíticas,
// wacf=funcionalidad/personalización, wacp=publicitarias.
//
// `pick` es el equivalente de `partialize`: solo watch/waca/wacf/wacp se
// persisten, hasHydrated nunca. `afterHydrate` es el equivalente de
// `onRehydrateStorage` — marca hasHydrated=true tras la hidratación desde
// localStorage (patrón anti-flash: los componentes consumidores, todavía sin
// portar, deben esperar a hasHydrated antes de fiarse de watch/waca/wacf/wacp
// para evitar servir el valor por defecto durante el hidratado SSR→cliente).
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
