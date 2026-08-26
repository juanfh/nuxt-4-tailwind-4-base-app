// Port literal de src/utils/getInitials.ts (Next).
export const getInitials = (name: string) => {
  const [firstName, lastName] = name.split(' ')
  const firstInitial = firstName ? firstName.charAt(0) : ''
  const secondInitial = lastName ? lastName.charAt(0) : ''

  return `${firstInitial}${secondInitial}`
}
