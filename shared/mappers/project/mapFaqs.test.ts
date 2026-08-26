import { describe, expect, it } from 'vitest'
import { mapFaq, mapFaqs } from './mapFaqs'

describe('mapFaqs', () => {
  it('maps a full faq', () => {
    const result = mapFaq({ id: '1', title: 'Title', description: '<p>Body</p>' })

    expect(result).toEqual({ id: '1', title: 'Title', description: '<p>Body</p>' })
  })

  it('defaults every field to an empty string when missing', () => {
    const result = mapFaq({})

    expect(result).toEqual({ id: '', title: '', description: '' })
  })

  it('maps a list of faqs', () => {
    expect(mapFaqs([{ id: '1' }, { id: '2' }])).toHaveLength(2)
  })

  it('returns an empty array for an empty/falsy input', () => {
    expect(mapFaqs(undefined)).toEqual([])
    expect(mapFaqs([])).toEqual([])
  })
})
