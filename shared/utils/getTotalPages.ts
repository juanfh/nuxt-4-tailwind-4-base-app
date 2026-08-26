export const getTotalPages = (total: number, limit: number): number => {
  return total > 0 ? Math.ceil(total / limit) : 0
}
