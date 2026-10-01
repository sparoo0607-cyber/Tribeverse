'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchStageStates, subscribeToStageChanges, fetchEventFlow, subscribeToEventChanges } from '@/lib/stageStore'
import { DECKS } from '@/lib/displayDeck'
import SceneView from '@/components/display/Scenes'

// Stages that already have a dedicated fullscreen display route wired up.
const STAGE_DISPLAY_ROUTE: Record<string, string> = {
}

export default function DisplayHomePage() {
  const [liveStageName, setLiveStageName] = useState<string | null>(null)
  const [liveSlug, setLiveSlug] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState(0)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function syncStep() {
      const flow = await fetchEventFlow()
      if (!cancelled && flow) { setStep(flow.currentStep); setPhase(flow.phase) }
    }

    async function sync() {
      const stages = await fetchStageStates()
      if (cancelled) return
      const live = Object.values(stages).find((s) => s.status === 'live')
      if (live) {
        setLiveStageName(live.name)
        setLiveSlug(live.slug)
        const route = STAGE_DISPLAY_ROUTE[live.slug]
        if (route) { router.replace(route); return }
      } else {
        setLiveStageName(null)
        setLiveSlug(null)
      }
    }

    sync()
    syncStep()
    const unsub = subscribeToStageChanges(sync)
    const unsubEvent = subscribeToEventChanges(syncStep)
    return () => { cancelled = true; unsub(); unsubEvent() }
  }, [router])

  const deck = liveSlug ? DECKS[liveSlug] : undefined
  if (deck && deck.length > 0) {
    return <SceneView scene={deck[Math.min(Math.max(step, 0), deck.length - 1)]} phase={phase} />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(26,111,255,0.15),transparent_60%)]" />
      <div className="relative">
        <div className="flex items-baseline justify-center gap-3 mb-6">
          <span className="font-black text-6xl text-[#FFE600] font-display">st.</span>
          <span className="font-bold text-lg tracking-widest text-white/60 uppercase font-display">Student Tribe</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white font-display uppercase mb-4">TRIBEVERSE V1</h1>
        {liveStageName ? (
          <>
            <p className="text-white/50 text-sm uppercase tracking-widest font-display mb-2">Now Live</p>
            <p className="text-2xl sm:text-4xl font-black text-[#00FFD1] font-display">{liveStageName}</p>
          </>
        ) : (
          <p className="text-white/40 text-sm uppercase tracking-widest font-display">Waiting for the Event Controller to go live…</p>
        )}
      </div>
    </div>
  )
}
