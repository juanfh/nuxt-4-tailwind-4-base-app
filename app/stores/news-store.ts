// Port literal de src/stores/news-store.ts (Next, zustand persist).
export const useNewsStore = defineStore('news', () => {
  const selectedNewsIds = ref<string[]>([])

  const setSelectedNewsIds = (ids: string[]) => {
    selectedNewsIds.value = ids
  }

  const addNewId = (id: string) => {
    if (!selectedNewsIds.value.includes(id)) {
      selectedNewsIds.value = [...selectedNewsIds.value, id]
    }
  }

  const addNewsIds = (ids: string[]) => {
    const newIds = ids.filter(id => !selectedNewsIds.value.includes(id))
    if (newIds.length > 0) {
      selectedNewsIds.value = [...selectedNewsIds.value, ...newIds]
    }
  }

  const removeNewId = (id: string) => {
    selectedNewsIds.value = selectedNewsIds.value.filter(newsId => newsId !== id)
  }

  const removeNewsIds = (ids: string[]) => {
    selectedNewsIds.value = selectedNewsIds.value.filter(newsId => !ids.includes(newsId))
  }

  const clearNewsIds = () => {
    selectedNewsIds.value = []
  }

  return {
    selectedNewsIds,
    setSelectedNewsIds,
    addNewId,
    addNewsIds,
    removeNewId,
    removeNewsIds,
    clearNewsIds,
  }
}, {
  persist: {
    key: persistedStoreKey('news'),
  },
})
