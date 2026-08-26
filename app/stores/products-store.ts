export const useProductsStore = defineStore('products', () => {
  const selectedProductsIds = ref<string[]>([])

  const setSelectedProductsIds = (ids: string[]) => {
    selectedProductsIds.value = ids
  }

  const addProductId = (id: string) => {
    if (!selectedProductsIds.value.includes(id)) {
      selectedProductsIds.value = [...selectedProductsIds.value, id]
    }
  }

  const addProductsIds = (ids: string[]) => {
    const newIds = ids.filter(id => !selectedProductsIds.value.includes(id))
    if (newIds.length > 0) {
      selectedProductsIds.value = [...selectedProductsIds.value, ...newIds]
    }
  }

  const removeProductId = (id: string) => {
    selectedProductsIds.value = selectedProductsIds.value.filter(productId => productId !== id)
  }

  const removeProductsIds = (ids: string[]) => {
    selectedProductsIds.value = selectedProductsIds.value.filter(productId => !ids.includes(productId))
  }

  const clearProductsIds = () => {
    selectedProductsIds.value = []
  }

  return {
    selectedProductsIds,
    setSelectedProductsIds,
    addProductId,
    addProductsIds,
    removeProductId,
    removeProductsIds,
    clearProductsIds,
  }
}, {
  persist: {
    key: persistedStoreKey('products'),
  },
})
