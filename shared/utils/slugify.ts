const DIACRITICS_REGEX = new RegExp('[\\u0300-\\u036f]', 'g')

export const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const slugify = (value: string) => {
  return value
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
