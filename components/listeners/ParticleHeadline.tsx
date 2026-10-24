'use client'

import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { INTRO_REVEAL_EVENT } from '@/components/intro/IntroNavigation'

const VERTEX = `
precision highp float;
attribute vec3 aTarget;
attribute vec3 aSeed;
uniform vec2 uSize,uPointer,uTextSize,uOffset;
uniform float uTime,uAssemble,uDpr,uMotion,uHover,uImpulse;
varying float vAlpha;
varying vec3 vColor;
void main(){
  float t=smoothstep(0.0,1.0,clamp((uAssemble-aSeed.z*.18)/.82,0.0,1.0));
  vec3 direction=normalize(aSeed-.5+vec3(.001));
  float radius=pow(fract(sin(dot(aSeed.xy,vec2(12.9898,78.233)))*43758.5453),.3333);
  vec3 cloud=direction*radius*vec3(uTextSize.x*.34,uTextSize.y*.4,130.0);
  vec3 p=mix(cloud,aTarget,t);
  float settle=1.0-t;
  p.xy+=vec2(sin(uTime*.65+aSeed.y*32.0),cos(uTime*.54+aSeed.x*24.0))*(.65+settle*14.0)*uMotion;
  p.z+=sin(uTime*.3+aSeed.z*12.0)*2.0*uMotion;
  vec2 delta=p.xy-uPointer;
  float dist=length(delta), influence=(1.0-smoothstep(0.0,85.0,dist))*uHover*uMotion;
  p.xy+=delta/max(dist,1.0)*influence*19.0;
  p.z+=influence*18.0;
  // A held burst occupies an organic volume, rather than extending a text-shaped box.
  vec3 burst=direction*radius*vec3(uTextSize.x*.43,uTextSize.y*.85,105.0);
  burst.xy+=vec2(sin(direction.y*5.0+uTime*.4),cos(direction.x*4.0-uTime*.3))*radius*12.0;
  p=mix(p,burst,uImpulse*uMotion);
  p+=direction*uImpulse*min(uTextSize.x*.025,18.0)*uMotion;
  float perspective=800.0/(800.0-p.z);
  vec2 projected=p.xy*perspective+uOffset;
  gl_Position=vec4(projected.x/uSize.x*2.0,-projected.y/uSize.y*2.0,0.0,1.0);
  gl_PointSize=(1.65+aSeed.z*.9)*uDpr;
  // Dissolve only at the far outer edge of the hero-wide render surface.
  vec2 edge=uSize*.5-abs(projected);
  vAlpha=(.8+aSeed.x*.2)*smoothstep(.02,.38,uAssemble)*smoothstep(0.0,32.0,min(edge.x,edge.y));
  vColor=mix(vec3(.98),vec3(.78,.82,.91),step(0.0,aTarget.y));
  vColor=mix(vColor,vec3(.43,.55,.91),step(.984,aSeed.y)*.65);
}`
const FRAGMENT = `
precision mediump float;
varying float vAlpha; varying vec3 vColor;
void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;
  gl_FragColor=vec4(vColor,vAlpha*(1.0-smoothstep(.22,.5,r)));}
`

/** Font-sampled particle lettering, adapted from mutable-matter's AGAIN geometry. */
export function ParticleHeadline() {
  const heading = useRef<HTMLHeadingElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [host, setHost] = useState<HTMLElement | null>(null)
  useEffect(() => { setHost(heading.current?.closest<HTMLElement>('.listener-hero') || null) }, [])
  useEffect(() => {
    const element = canvas.current, title = heading.current
    if (!element || !title || !host) return
    const gl = element.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' })
    if (!gl) return
    let disposed = false, frame = 0, visible = true, width = 1, height = 1, count = 0
    let started = false, assemble = 0, elapsed = 0, previous = 0, hover = 0, contextLost = false, impulse = 0, heldPointer: number | null = null, pulseUntil = 0
    const pointer = { x: 10000, y: 10000, targetX: 10000, targetY: 10000, inside: false }
    const surface = host
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const shaders: WebGLShader[] = [], buffers: WebGLBuffer[] = []
    const program = gl.createProgram()
    if (!program) return
    function compile(type: number, source: string) {
      const shader = gl!.createShader(type)
      if (!shader) throw new Error('Shader unavailable')
      shaders.push(shader); gl!.shaderSource(shader, source); gl!.compileShader(shader)
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error('Shader compilation failed')
      return shader
    }
    try {
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX)); gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Link failed')
    } catch { shaders.forEach(shader => gl.deleteShader(shader)); gl.deleteProgram(program); return }
    gl.useProgram(program); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    const uniforms = Object.fromEntries(['uSize','uTextSize','uOffset','uPointer','uTime','uAssemble','uDpr','uMotion','uHover','uImpulse'].map(key => [key, gl.getUniformLocation(program, key)]))
    for (const name of ['aTarget', 'aSeed']) {
      const buffer = gl.createBuffer()
      if (!buffer) continue
      buffers.push(buffer); gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      const location = gl.getAttribLocation(program, name)
      gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0)
    }
    const seed = (n: number) => { const v = Math.sin(n * 127.1 + 41.7) * 43758.5453123; return v - Math.floor(v) }
    function build() {
      if (disposed || buffers.length !== 2) return
      const rect = element!.getBoundingClientRect()
      width = Math.max(1, rect.width); height = Math.max(1, rect.height)
      const dpr = Math.min(devicePixelRatio || 1, 1.75)
      element!.width = Math.round(width * dpr); element!.height = Math.round(height * dpr)
      gl!.viewport(0, 0, element!.width, element!.height)
      const textRect = title!.getBoundingClientRect()
      const textWidth = Math.max(1, textRect.width), textHeight = Math.max(1, textRect.height)
      const mask = document.createElement('canvas'); mask.width = Math.ceil(textWidth); mask.height = Math.ceil(textHeight)
      const ctx = mask.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      const style = getComputedStyle(title!)
      let fontSize = parseFloat(style.fontSize)
      ctx.font = `900 ${fontSize}px ${style.fontFamily}`
      fontSize *= Math.min(1, textWidth * .91 / ctx.measureText('YOU WON’T').width)
      ctx.font = `900 ${fontSize}px ${style.fontFamily}`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'
      const lineGap = fontSize * 1.02
      ctx.fillText('YOU WON’T', textWidth / 2, textHeight / 2 - lineGap / 2)
      ctx.fillText('BELIEVE.', textWidth / 2, textHeight / 2 + lineGap / 2)
      const pixels = ctx.getImageData(0, 0, mask.width, mask.height).data
      const positions: number[] = [], seeds: number[] = []
      const step = textWidth < 600 ? 1.9 : 2.5
      for (let y = 0; y < mask.height; y += step) for (let x = 0; x < mask.width; x += step) {
        if (pixels[(Math.floor(y) * mask.width + Math.floor(x)) * 4 + 3] < 110) continue
        const i = positions.length / 3
        positions.push(x - textWidth / 2 + (seed(i + 4) - .5) * .6, y - textHeight / 2, (seed(i + 8) - .5) * 9)
        seeds.push(seed(i + 11), seed(i + 19), seed(i + 31))
      }
      count = positions.length / 3
      ;[positions, seeds].forEach((data, index) => { gl!.bindBuffer(gl!.ARRAY_BUFFER, buffers[index]); gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array(data), gl!.STATIC_DRAW) })
      gl!.uniform2f(uniforms.uSize, width, height)
      gl!.uniform2f(uniforms.uTextSize, textWidth, textHeight)
      gl!.uniform2f(uniforms.uOffset, textRect.left + textWidth / 2 - rect.left - width / 2,
        textRect.top + textHeight / 2 - rect.top - height / 2); gl!.uniform1f(uniforms.uDpr, dpr)
      setReady(true); start()
    }
    function draw(now: number) {
      frame = 0
      if (disposed || contextLost || !visible || document.hidden || !count) return
      const dt = previous ? Math.min((now - previous) / 1000, .05) : 0; previous = now
      if (!reduced.matches) elapsed += dt
      if (started) assemble = reduced.matches ? 1 : Math.min(1, assemble + dt / 1.9)
      const impulseTarget = !reduced.matches && (heldPointer !== null || now < pulseUntil) ? 1 : 0
      impulse += (impulseTarget - impulse) * (1 - Math.exp(-dt * (impulseTarget ? 7 : 4)))
      hover += ((pointer.inside ? 1 : 0) - hover) * (1 - Math.exp(-dt * 8))
      pointer.x += (pointer.targetX - pointer.x) * (1 - Math.exp(-dt * 12))
      pointer.y += (pointer.targetY - pointer.y) * (1 - Math.exp(-dt * 12))
      gl!.clearColor(0, 0, 0, 0); gl!.clear(gl!.COLOR_BUFFER_BIT)
      gl!.uniform1f(uniforms.uAssemble, assemble); gl!.uniform1f(uniforms.uTime, elapsed)
      gl!.uniform1f(uniforms.uImpulse, impulse); gl!.uniform1f(uniforms.uMotion, reduced.matches ? 0 : 1); gl!.uniform1f(uniforms.uHover, hover)
      gl!.uniform2f(uniforms.uPointer, pointer.x, pointer.y); gl!.drawArrays(gl!.POINTS, 0, count)
      if (!reduced.matches) frame = requestAnimationFrame(draw)
    }
    function start() { if (!disposed && visible && !document.hidden && !frame) { previous = 0; frame = requestAnimationFrame(draw) } }
    function reveal() { started = true; start() }
    function refresh() { cancelAnimationFrame(frame); frame = 0; start() }
    function onPointer(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return
      pointer.targetX = event.clientX - title!.getBoundingClientRect().left - title!.getBoundingClientRect().width / 2; pointer.targetY = event.clientY - title!.getBoundingClientRect().top - title!.getBoundingClientRect().height / 2
      if (!pointer.inside) { pointer.x = pointer.targetX; pointer.y = pointer.targetY }
      pointer.inside = true
    }
    function leave() { pointer.inside = false; heldPointer = null }
    function press(event: PointerEvent) {
      if (event.button !== 0 || !event.isPrimary || reduced.matches || document.querySelector('.intro-root')) return
      const target = event.target
      if (target instanceof Element && target.closest('button,a,input,textarea,select,[role="button"],[contenteditable="true"]')) return
      heldPointer = event.pointerId
      pulseUntil = performance.now() + 260
      start()
    }
    function release(event: PointerEvent) { if (event.pointerId === heldPointer) heldPointer = null }
    function cancel() { heldPointer = null; pulseUntil = 0; pointer.inside = false }
    function visibilityChange() { if (document.hidden) cancel(); refresh() }
    function lost(event: Event) { contextLost = true; event.preventDefault(); cancelAnimationFrame(frame); frame = 0; setReady(false) }
    function restored() { setReady(false) /* The readable HTML title remains available after GPU reset. */ }
    const resize = new ResizeObserver(() => { if (count) build() })
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; refresh() })
    resize.observe(title); resize.observe(surface); observer.observe(surface)
    surface.addEventListener('pointermove', onPointer); surface.addEventListener('pointerleave', leave)
    surface.addEventListener('pointerdown', press)
    window.addEventListener('pointerup', release); window.addEventListener('pointercancel', release); window.addEventListener('blur', cancel)
    element.addEventListener('webglcontextlost', lost); element.addEventListener('webglcontextrestored', restored)
    window.addEventListener(INTRO_REVEAL_EVENT, reveal)
    document.addEventListener('visibilitychange', visibilityChange); reduced.addEventListener('change', refresh)
    void document.fonts.ready.then(() => {
      if (disposed) return
      started = !document.querySelector('.intro-root') || Boolean(document.querySelector('.site-reveal--visible')) || Boolean(location.hash)
      if (reduced.matches) assemble = 1
      build()
    })
    return () => {
      disposed = true; cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect()
      surface.removeEventListener('pointermove', onPointer); surface.removeEventListener('pointerleave', leave)
      surface.removeEventListener('pointerdown', press)
      window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release); window.removeEventListener('blur', cancel)
      element.removeEventListener('webglcontextlost', lost); element.removeEventListener('webglcontextrestored', restored)
      window.removeEventListener(INTRO_REVEAL_EVENT, reveal)
      document.removeEventListener('visibilitychange', visibilityChange); reduced.removeEventListener('change', refresh)
      buffers.forEach(buffer => gl.deleteBuffer(buffer)); shaders.forEach(shader => gl.deleteShader(shader)); gl.deleteProgram(program)
    }
  }, [host])
  return <h1 ref={heading} id="listener-hero-title" className="particle-headline" data-ready={ready}>
    <span className="particle-headline__fallback"><span>You won’t</span><span>believe.</span></span>
    {host && createPortal(<canvas ref={canvas} className={`particle-headline__canvas${ready ? ' is-ready' : ''}`} aria-hidden="true" />, host)}
  </h1>
}
