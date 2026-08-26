// Port literal de src/types/project/main.ts (Next). Único consumidor por
// ahora: Slide.data.cta (shared/types/project/slide.ts).
export interface CTA {
  label: string
  link: string
  target: 'self' | 'blank'
}
