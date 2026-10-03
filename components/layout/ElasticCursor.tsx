'use client'

import { useEffect, useRef } from 'react'

const INTERACTIVE = 'a[href], button, [role="button"], summary, label[for], [data-cursor="hover"]'
const EDITABLE = 'textarea, [contenteditable]:not([contenteditable="false"]), input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="file"]):not([type="color"])'
const ROOT_CLASS = 'elastic-cursor-active'

export function ElasticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    // Native dialogs live in the browser's top layer. A manual popover lets
    // the decorative cursor share that layer without changing dialog focus.
    const raiseCursor = () => {
      if (typeof cursor.showPopover !== 'function') return
      if (cursor.matches(':popover-open')) cursor.hidePopover()
      cursor.showPopover()
    }
    raiseCursor()
    const dialogObserver = new MutationObserver(records => {
      const dialogChanged = records.some(record =>
        record.type === 'attributes' && record.target instanceof HTMLDialogElement ||
        [...record.addedNodes, ...record.removedNodes].some(node =>
          node instanceof Element && (node.matches('dialog') || node.querySelector('dialog'))
        )
      )
      if (dialogChanged) raiseCursor()
    })
    dialogObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] })

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    let frame = 0
    let previousTime = 0
    let targetX = 0
    let targetY = 0
    let x = 0
    let y = 0
    let vx = 0
    let vy = 0
    let stretch = 0
    let stretchVelocity = 0
    let size = 1
    let targetSize = 1
    let angle = 0

    const hide = () => {
      visible = false
      cursor.style.opacity = '0'
      document.documentElement.classList.remove(ROOT_CLASS)
      window.cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
    }

    const draw = () => {
      // Equal-area deformation: elongation compresses the perpendicular axis.
      const axisScale = Math.sqrt(1 + Math.max(0, stretch))
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${angle}rad) scale(${size * axisScale}, ${size / axisScale})`
    }

    const update = (time: number) => {
      frame = 0
      if (!visible) return
      const dt = Math.min(0.064, Math.max(0, (time - previousTime) / 1000))
      previousTime = time

      if (reducedMotion.matches) {
        x = targetX
        y = targetY
        vx = vy = stretch = stretchVelocity = angle = 0
        size = targetSize
      } else {
        // Unit mass, critically damped position spring. Small substeps keep
        // the response stable on both low and high refresh-rate displays.
        const steps = Math.max(1, Math.ceil(dt / (1 / 240)))
        const step = dt / steps
        for (let i = 0; i < steps; i++) {
          vx += ((targetX - x) * 6400 - vx * 160) * step
          vy += ((targetY - y) * 6400 - vy * 160) * step
          x += vx * step
          y += vy * step

          const speed = Math.hypot(vx, vy)
          const targetStretch = 1.25 * (1 - Math.exp(-speed / 1800))
          // The softer shape spring retains a little momentum after a flick.
          stretchVelocity += ((targetStretch - stretch) * 900 - stretchVelocity * 54) * step
          stretch += stretchVelocity * step
          size += (targetSize - size) * (1 - Math.exp(-18 * step))

          if (speed > 25) {
            const direction = Math.atan2(vy, vx)
            // An ellipse has no front: use the shortest turn modulo pi,
            // so reversing direction does not spin the cursor through 180°.
            const turn = 0.5 * Math.atan2(Math.sin(2 * (direction - angle)), Math.cos(2 * (direction - angle)))
            angle += turn * (1 - Math.exp(-24 * step))
          }
        }
      }

      draw()
      if (Math.hypot(targetX - x, targetY - y) > 0.05 || Math.hypot(vx, vy) > 0.5 || Math.abs(stretch) > 0.001 || Math.abs(stretchVelocity) > 0.01 || Math.abs(size - targetSize) > 0.001) {
        frame = window.requestAnimationFrame(update)
      }
    }

    const wake = () => {
      if (!frame && visible) {
        previousTime = performance.now()
        frame = window.requestAnimationFrame(update)
      }
    }

    const checkTarget = (element: Element | null) => {
      if (element?.closest(EDITABLE)) {
        hide()
        return false
      }
      const control = element?.closest(INTERACTIVE)
      targetSize = control && !control.matches(':disabled, [aria-disabled="true"]') ? 1.45 : 1
      return true
    }

    const move = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType !== 'mouse') {
        hide()
        return
      }
      targetX = event.clientX
      targetY = event.clientY
      if (!checkTarget(event.target instanceof Element ? event.target : null)) return
      if (!visible) {
        visible = true
        x = targetX
        y = targetY
        vx = vy = stretch = stretchVelocity = angle = 0
        size = targetSize
        draw()
        cursor.style.opacity = '1'
        document.documentElement.classList.add(ROOT_CLASS)
      }
      wake()
    }

    const refreshTarget = () => {
      if (!visible) return
      checkTarget(document.elementFromPoint(targetX, targetY))
      wake()
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') hide()
    }
    const handleVisibility = () => { if (document.hidden) hide() }
    const handlePreference = () => {
      if (!finePointer.matches) hide()
      else wake()
    }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('pointercancel', hide)
    window.addEventListener('scroll', refreshTarget, { passive: true, capture: true })
    window.addEventListener('blur', hide)
    document.documentElement.addEventListener('mouseleave', hide)
    document.addEventListener('visibilitychange', handleVisibility)
    finePointer.addEventListener('change', handlePreference)
    reducedMotion.addEventListener('change', handlePreference)
    return () => {
      hide()
      dialogObserver.disconnect()
      if (typeof cursor.hidePopover === 'function' && cursor.matches(':popover-open')) cursor.hidePopover()
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointercancel', hide)
      window.removeEventListener('scroll', refreshTarget, true)
      window.removeEventListener('blur', hide)
      document.documentElement.removeEventListener('mouseleave', hide)
      document.removeEventListener('visibilitychange', handleVisibility)
      finePointer.removeEventListener('change', handlePreference)
      reducedMotion.removeEventListener('change', handlePreference)
    }
  }, [])

  return <div ref={cursorRef} className="elastic-cursor" popover="manual" aria-hidden="true" />
}
