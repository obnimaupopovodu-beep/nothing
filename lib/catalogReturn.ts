export const CATALOG_RETURN_KEY = 'uwbelieve:catalog-return'

export function catalogReturnRequested() {
  if (typeof window === 'undefined') return false
  if (new URLSearchParams(window.location.search).get('catalog') === '1') return true
  try { return window.sessionStorage.getItem(CATALOG_RETURN_KEY) === '1' }
  catch { return false }
}

export function rememberCatalogReturn() {
  try { window.sessionStorage.setItem(CATALOG_RETURN_KEY, '1') } catch { /* storage can be disabled */ }
}

export function consumeCatalogReturn() {
  try { window.sessionStorage.removeItem(CATALOG_RETURN_KEY) } catch { /* storage can be disabled */ }
  const url = new URL(window.location.href)
  if (url.searchParams.has('catalog')) {
    url.searchParams.delete('catalog')
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  }
}
