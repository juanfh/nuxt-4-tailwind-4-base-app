// El campo `icon` (React.ReactNode) no se porta: ningún consumidor de
// NavItem en next-16-tailwind-4-base-app lo usa todavía (confirmado por
// grep) — se añade cuando un dominio real lo necesite, igual criterio que
// el resto del proyecto (no construir para hipotéticos futuros).
export interface NavItem {
  id: string | number
  link: string
  linkalt?: string
  label?: string
  rel?: string
  visible?: boolean
}
