export const ADMIN_ROLES = ['admin', 'superadmin']
export const SUPERADMIN_ROLE = 'superadmin'

export const isAdminRole = (role: string | null) => {
  return !!role && ADMIN_ROLES.includes(role)
}

export const isSuperAdminRole = (role: string | null) => {
  return role === SUPERADMIN_ROLE
}
