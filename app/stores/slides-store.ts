// Port literal de src/stores/slides-store.ts (Next, zustand persist).
export const useSlidesStore = defineStore('slides', () => {
  const selectedSlidesIds = ref<string[]>([])

  const setSelectedSlidesIds = (ids: string[]) => {
    selectedSlidesIds.value = ids
  }

  const addSlideId = (id: string) => {
    if (!selectedSlidesIds.value.includes(id)) {
      selectedSlidesIds.value = [...selectedSlidesIds.value, id]
    }
  }

  const addSlidesIds = (ids: string[]) => {
    const newIds = ids.filter(id => !selectedSlidesIds.value.includes(id))
    if (newIds.length > 0) {
      selectedSlidesIds.value = [...selectedSlidesIds.value, ...newIds]
    }
  }

  const removeSlideId = (id: string) => {
    selectedSlidesIds.value = selectedSlidesIds.value.filter(slideId => slideId !== id)
  }

  const removeSlidesIds = (ids: string[]) => {
    selectedSlidesIds.value = selectedSlidesIds.value.filter(slideId => !ids.includes(slideId))
  }

  const clearSlidesIds = () => {
    selectedSlidesIds.value = []
  }

  return {
    selectedSlidesIds,
    setSelectedSlidesIds,
    addSlideId,
    addSlidesIds,
    removeSlideId,
    removeSlidesIds,
    clearSlidesIds,
  }
}, {
  persist: {
    key: persistedStoreKey('slides'),
  },
})
