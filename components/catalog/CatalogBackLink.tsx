'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export function CatalogBackLink() {
  const [href, setHref] = useState('/#catalog')
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('from') === 'artists') setHref('/for-artists?catalog=1')
  }, [])
  return <Link href={href} prefetch={false}>← Back to catalog</Link>
}
