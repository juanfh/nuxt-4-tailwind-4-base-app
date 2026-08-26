import sanitizeHtml from 'sanitize-html'

// Port literal de src/utils/sanitizeHtml.ts (Next). Server-only (no
// shared/): solo lo consume server/api/news/*.ts antes de persistir la
// descripción rich text — no hay ninguna llamada desde el cliente que lo
// necesite, así que no tiene sentido incluir `sanitize-html` en el bundle
// del navegador. Acotado al set de etiquetas que genera
// AppRichTextEditor/FormAppRichTextEditor.
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
