export const persistedStoreKey = (name: string) => () => {
  const { public: { appName } } = useRuntimeConfig()
  return `${appName}-${name}-store`
}
