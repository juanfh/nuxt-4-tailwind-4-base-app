// El tipo más simple de los tres dominios de dashboard portados hasta ahora:
// sin variante `FaqDetail` (a diferencia de New/NewDetail) porque
// `description` ya viene incluida.
export interface Faq {
  id: string
  title: string
  description: string
}
