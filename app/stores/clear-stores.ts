// El original accede al
// store fuera de un componente vía `useUsersStore.getState()` (patrón
// imperativo de zustand); el equivalente en Pinia es llamar directamente al
// composable del store — devuelve la misma instancia singleton mientras haya
// una Pinia activa (@pinia/nuxt la instala globalmente), sin necesitar un
// `.getState()` explícito.
//
// clearAllStores/clearStores no tienen consumidores en el proyecto Next
// (código muerto/preparado para un flujo de logout aún no conectado, ver
// .project_docs/state.md) — se replica igual, sin conectar nada nuevo.
export const clearAllStores = () => {
  useUsersStore().clearUsersIds()
}

export const clearStores = {
  clearUsers: () => useUsersStore().clearUsersIds(),
}
