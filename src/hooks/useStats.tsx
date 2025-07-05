// hooks/useStats.ts
'use client'

import { useEffect } from 'react'
import Stats from 'three/examples/jsm/libs/stats.module.js'

export function useStats(container: HTMLElement | null) {
  useEffect(() => {
    if (!container) return

    const stats = new Stats()
    stats.showPanel(0)
    stats.dom.style.position = 'absolute'
    stats.dom.style.top = '0px'
    stats.dom.style.left = '0px'
    container.appendChild(stats.dom)

    let raf = 0
    const animate = () => {
      stats.begin()
      stats.end()
      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      stats.dom.remove()
    }
  }, [container])
}
