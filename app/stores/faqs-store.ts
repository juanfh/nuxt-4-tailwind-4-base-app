// Port literal de src/stores/faqs-store.ts (Next, zustand persist).
export const useFaqsStore = defineStore('faqs', () => {
  const selectedFaqsIds = ref<string[]>([])

  const setSelectedFaqsIds = (ids: string[]) => {
    selectedFaqsIds.value = ids
  }

  const addFaqId = (id: string) => {
    if (!selectedFaqsIds.value.includes(id)) {
      selectedFaqsIds.value = [...selectedFaqsIds.value, id]
    }
  }

  const addFaqsIds = (ids: string[]) => {
    const newIds = ids.filter(id => !selectedFaqsIds.value.includes(id))
    if (newIds.length > 0) {
      selectedFaqsIds.value = [...selectedFaqsIds.value, ...newIds]
    }
  }

  const removeFaqId = (id: string) => {
    selectedFaqsIds.value = selectedFaqsIds.value.filter(faqId => faqId !== id)
  }

  const removeFaqsIds = (ids: string[]) => {
    selectedFaqsIds.value = selectedFaqsIds.value.filter(faqId => !ids.includes(faqId))
  }

  const clearFaqsIds = () => {
    selectedFaqsIds.value = []
  }

  return {
    selectedFaqsIds,
    setSelectedFaqsIds,
    addFaqId,
    addFaqsIds,
    removeFaqId,
    removeFaqsIds,
    clearFaqsIds,
  }
}, {
  persist: {
    key: persistedStoreKey('faqs'),
  },
})
