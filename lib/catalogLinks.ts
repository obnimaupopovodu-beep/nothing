// Keep punctuation in display titles, while using unambiguous path segments.
export const catalogUrlSlug = (slug: string) => slug.replace(/\?/g, '')
export const catalogReleasePath = (slug: string) => `/catalog/${encodeURIComponent(catalogUrlSlug(slug))}`
