'use client'

import { createContext, useContext, useEffect, useRef, type RefObject } from 'react'
import Lenis from 'lenis'

const SmoothScrollContext = createContext<RefObject<Lenis | null> | null>(null)

export function useSmoothScroll() {
  return useContext(SmoothScrollContext)
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const controller = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
    })
    controller.current = lenis

    let raf: number
    function animate(time: number) {
      lenis.raf(time)
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      controller.current = null
    }
  }, [])

  return <SmoothScrollContext.Provider value={controller}>{children}</SmoothScrollContext.Provider>
}
