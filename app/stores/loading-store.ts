export const useGlobalLoading = defineStore('loading', () => {
  const globalLoading = ref(false)
  const globalLoadingMessage = ref<string | null>(null)
  const localLoading = ref(false)
  const provincesLoading = ref(false)

  const showGlobalLoading = (message?: string) => {
    globalLoading.value = true
    globalLoadingMessage.value = message ?? null
  }

  const hideGlobalLoading = () => {
    globalLoading.value = false
    globalLoadingMessage.value = null
  }

  const showLocalLoading = () => {
    localLoading.value = true
  }

  const hideLocalLoading = () => {
    localLoading.value = false
  }

  const showProvincesLoading = () => {
    provincesLoading.value = true
  }

  const hideProvincesLoading = () => {
    provincesLoading.value = false
  }

  return {
    globalLoading,
    globalLoadingMessage,
    showGlobalLoading,
    hideGlobalLoading,
    localLoading,
    showLocalLoading,
    hideLocalLoading,
    provincesLoading,
    showProvincesLoading,
    hideProvincesLoading,
  }
})
