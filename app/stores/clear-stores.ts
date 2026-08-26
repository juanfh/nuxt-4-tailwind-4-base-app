export const clearAllStores = () => {
  useUsersStore().clearUsersIds()
}

export const clearStores = {
  clearUsers: () => useUsersStore().clearUsersIds(),
}
