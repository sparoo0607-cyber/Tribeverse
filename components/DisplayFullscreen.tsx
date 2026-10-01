'use client'

import { useEffect, useState } from 'react'

// Projector helper: a Fullscreen button (hidden once fullscreen), plus
// F key or double-click anywhere to toggle. Browsers only allow fullscreen
// after a click or key press, so it can't start by itself.
export default function DisplayFullscreen() {
  const [full, setFull] = useState(false)

  useEffect(() => {
    const sync = () => setFull(!!document.fullscreenElement)
    const toggle = () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
      else document.documentElement.requestFullscreen().catch(() => {})
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') toggle()
    }
    document.addEventListener('fullscreenchange', sync)
    window.addEventListener('keydown', onKey)
    window.addEventListener('dblclick', toggle)
    sync()
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('dblclick', toggle)
    }
  }, [])

  if (full) return null
  return (
    <button
      onClick={() => document.documentElement.requestFullscreen().catch(() => {})}
      className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-white/80 text-xs font-black font-display uppercase tracking-wider backdrop-blur"
    >
      Fullscreen ⛶ (F)
    </button>
  )
}
