'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Moon, Sun, ArrowUpRight } from '@phosphor-icons/react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)
type Theme = 'light' | 'dark'
export function WorkspaceFrame({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const [theme, setTheme] = useState<Theme | null>(null)
  const path = usePathname()
  const params = useSearchParams()
  useEffect(() => {
    const system = window.matchMedia('(prefers-color-scheme: dark)')
    let saved: string | null = null
    try {
      saved = localStorage.getItem('nothing-workspace-theme')
    } catch {
      /* System theme remains available. */
    }
    setTheme(saved === 'light' || saved === 'dark' ? saved : system.matches ? 'dark' : 'light')
    const change = () => {
      let preference: string | null = null
      try {
        preference = localStorage.getItem('nothing-workspace-theme')
      } catch {
        /* Use system preference. */
      }
      if (!preference) setTheme(system.matches ? 'dark' : 'light')
    }
    let active = true
    document.fonts.ready.then(() => {
      if (active) ScrollTrigger.refresh()
    })
    system.addEventListener('change', change)
    return () => {
      active = false
      system.removeEventListener('change', change)
    }
  }, [])
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      const enter = (selector: string, vars: gsap.TweenVars) => {
        const elements = root.current?.querySelectorAll(selector)
        if (elements?.length) gsap.from(elements, vars)
      }
      media.add('(prefers-reduced-motion: no-preference)', () => {
        enter('.portal-heading > div, .portal-stats > div', {
          y: 18,
          opacity: 0,
          duration: 0.65,
          stagger: 0.06,
          ease: 'power3.out',
          clearProps: 'all',
        })
        enter('.portal-auth-line > span', {
          yPercent: 110,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          clearProps: 'all',
        })
        enter('.portal-auth-box', {
          y: 20,
          opacity: 0,
          duration: 0.75,
          ease: 'power3.out',
          clearProps: 'all',
        })
        enter('.portal-auth-visual img', {
          scale: 0.92,
          opacity: 0,
          duration: 1.1,
          ease: 'power2.out',
          clearProps: 'all',
        })
      })
      media.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const story = root.current?.querySelector('.portal-auth-story')
        const visual = root.current?.querySelector('.portal-auth-visual')
        if (story && visual) {
          ScrollTrigger.create({
            trigger: story,
            start: 'top top',
            end: () => `+=${Math.max(1, (root.current?.scrollHeight || 0) - window.innerHeight)}`,
            pin: true,
            pinSpacing: false,
            invalidateOnRefresh: true,
          })
          gsap.to(visual, {
            y: -35,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1 },
          })
        }
      })
      return () => media.revert()
    },
    { scope: root, dependencies: [path, params.toString()], revertOnUpdate: true }
  )
  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.workspaceTheme = next
    try {
      localStorage.setItem('nothing-workspace-theme', next)
    } catch {
      /* Theme still changes for this visit. */
    }
  }
  return (
    <div ref={root} className={`workspace-theme ${className}`} data-theme={theme || undefined}>
      {children}
      <button
        className="workspace-theme-toggle"
        onClick={toggle}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        title="Change workspace theme"
      >
        {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
      </button>
    </div>
  )
}
export function WorkspaceNav({
  links,
  preview,
  workspace,
}: {
  links: string[][]
  preview: boolean
  workspace: string
}) {
  const pathname = usePathname()
  const params = useSearchParams()
  const view = params.get('view') || 'overview'
  return (
    <nav className="portal-nav" aria-label="Workspace">
      {links.map(([label, href], i) => {
        const target = i === 0 ? 'overview' : href.split('/').at(-1)
        const active = preview
          ? view === target || (target === 'releases' && ['release', 'new'].includes(view))
          : i === 0
            ? pathname === href
            : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={preview ? `/preview?workspace=${workspace}&view=${target}` : href}
            aria-current={active ? 'page' : undefined}
          >
            {label}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        )
      })}
    </nav>
  )
}
