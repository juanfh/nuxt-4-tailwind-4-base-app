import sanitizeHtml from 'sanitize-html'

export const sanitizeRichText = (html: string): string =>
  sanitizeHtml(html, {
    allowedTags: ['p', 'strong', 'em', 's', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a', 'br'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      p: ['style'],
      h2: ['style'],
      h3: ['style'],
    },
    allowedStyles: {
      p: { 'text-align': [/^left$/, /^center$/, /^right$/, /^justify$/] },
      h2: { 'text-align': [/^left$/, /^center$/, /^right$/, /^justify$/] },
      h3: { 'text-align': [/^left$/, /^center$/, /^right$/, /^justify$/] },
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  })
