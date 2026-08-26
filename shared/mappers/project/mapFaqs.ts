import type { Faq } from '#shared/types/project/faq'

export const mapFaq = (faq: any): Faq => ({
  id: faq?.id ?? '',
  title: faq?.title ?? '',
  description: faq?.description ?? '',
})

export const mapFaqs = (faqs: any): Faq[] => {
  const data = faqs && faqs.length > 0 ? faqs.map((faq: any) => mapFaq(faq)) : []
  return data
}
