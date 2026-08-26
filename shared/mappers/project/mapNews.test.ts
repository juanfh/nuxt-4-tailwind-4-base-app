import { describe, expect, it } from 'vitest'
import { mapNew, mapNewDetail, mapNews } from './mapNews'

// Sin el caso de `seo` (no portado, ver shared/types/project/new.ts).
describe('mapNews', () => {
  it('coerces a string id to number', () => {
    const result = mapNew({ id: '42', title: 'Title', slug: 'title', date: '2026-01-01' })

    expect(result.id).toBe(42)
  })

  it('defaults featured to false when missing', () => {
    const result = mapNew({ id: 1, title: 'Title', slug: 'title', date: '2026-01-01' })

    expect(result.featured).toBe(false)
  })

  it('maps a full news item, including its image via mapImage', () => {
    const result = mapNew({
      id: 1,
      title: 'Title',
      shortDescription: 'Short',
      date: '2026-01-01',
      slug: 'title',
      featured: true,
      image: { id: 'i1', name: null, url: 'https://cdn.test/cover.png', width: 992, height: 558 },
    })

    expect(result).toEqual({
      id: 1,
      title: 'Title',
      shortDescription: 'Short',
      date: '2026-01-01',
      slug: 'title',
      featured: true,
      image: {
        id: 'i1',
        name: '',
        width: 992,
        height: 558,
        url: 'https://cdn.test/cover.png',
        thumbnail: { width: 992, height: 558, url: 'https://cdn.test/cover.png' },
        small: { width: 992, height: 558, url: 'https://cdn.test/cover.png' },
      },
    })
  })

  it('maps list and empty', () => {
    expect(mapNews([{ id: 1 }])).toHaveLength(1)
    expect(mapNews(undefined)).toEqual([])
  })

  it('adds description on mapNewDetail', () => {
    const result = mapNewDetail({ id: 1, title: 'Title', description: '<p>Body</p>' })

    expect(result.description).toBe('<p>Body</p>')
  })

  it('defaults description to empty string when missing', () => {
    const result = mapNewDetail({ id: 1, title: 'Title' })

    expect(result.description).toBe('')
  })
})
