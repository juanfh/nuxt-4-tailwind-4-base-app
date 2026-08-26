export const useUsersStore = defineStore('users', () => {
  const selectedUsersIds = ref<string[]>([])

  const setSelectedUsersIds = (ids: string[]) => {
    selectedUsersIds.value = ids
  }

  const addUserId = (id: string) => {
    if (!selectedUsersIds.value.includes(id)) {
      selectedUsersIds.value = [...selectedUsersIds.value, id]
    }
  }

  const addUsersIds = (ids: string[]) => {
    const newIds = ids.filter(id => !selectedUsersIds.value.includes(id))
    if (newIds.length > 0) {
      selectedUsersIds.value = [...selectedUsersIds.value, ...newIds]
    }
  }

  const removeUserId = (id: string) => {
    selectedUsersIds.value = selectedUsersIds.value.filter(userId => userId !== id)
  }

  const removeUsersIds = (ids: string[]) => {
    selectedUsersIds.value = selectedUsersIds.value.filter(userId => !ids.includes(userId))
  }

  const clearUsersIds = () => {
    selectedUsersIds.value = []
  }

  return {
    selectedUsersIds,
    setSelectedUsersIds,
    addUserId,
    addUsersIds,
    removeUserId,
    removeUsersIds,
    clearUsersIds,
  }
}, {
  persist: {
    key: persistedStoreKey('users'),
  },
})
