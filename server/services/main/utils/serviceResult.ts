// Port literal de src/services/main/utils/serviceResult.ts (Next). Sin
// consumidores todavía en esta fase (ningún servicio de auth lo usa) — se
// porta porque es parte de server/services/main/, listo para cuando una
// fase futura migre un servicio de escritura que necesite distinguir un
// 409/conflicto del resto de errores en vez de colapsar a null.
export type ServiceResult<T> =
  | { ok: true, data: T }
  | { ok: false, message: string, status?: number }
