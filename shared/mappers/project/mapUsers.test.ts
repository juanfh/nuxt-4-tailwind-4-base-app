import { describe, expect, it } from 'vitest'
import { mapUser, mapUsers } from './mapUsers'

// Port de src/mappers/project/mapUsers.test.ts (Next).
describe('mapUsers', () => {
  it('maps user with no avatar to null image', () => {
    expect(
      mapUser({
        id: 'e1',
        email: 'a@test.com',
        profile: { name: 'Ana', surname: 'Lopez', phone: '123' },
      }),
    ).toEqual({
      id: 'e1',
      name: 'Ana',
      surname: 'Lopez',
      birthdate: '',
      gender: '',
      phone: '123',
      email: 'a@test.com',
      role: '',
      image: null,
    })
  })

  it('maps role from the raw response', () => {
    const result = mapUser({
      id: 'e1',
      email: 'a@test.com',
      role: 'admin',
      profile: { name: 'Ana', surname: 'Lopez' },
    })

    expect(result.role).toBe('admin')
  })

  it('maps user avatar via mapImage', () => {
    const result = mapUser({
      id: 'e1',
      email: 'a@test.com',
      profile: {
        name: 'Ana',
        surname: 'Lopez',
        phone: '123',
        image: { id: 84, name: null, url: 'https://cdn.test/avatar.png', width: 200, height: 200 },
      },
    })

    expect(result.image).toEqual({
      id: 84,
      name: '',
      width: 200,
      height: 200,
      url: 'https://cdn.test/avatar.png',
      thumbnail: { width: 200, height: 200, url: 'https://cdn.test/avatar.png' },
      small: { width: 200, height: 200, url: 'https://cdn.test/avatar.png' },
    })
  })

  it('maps list and empty', () => {
    expect(mapUsers([{ id: 'e1' }])).toHaveLength(1)
    expect(mapUsers(undefined)).toEqual([])
  })
})
