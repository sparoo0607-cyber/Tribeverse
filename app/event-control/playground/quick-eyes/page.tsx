'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { DECKS, sceneAnswer, sceneActions, Scene } from '@/lib/displayDeck'
import { PG_ROUNDS } from '@/lib/playgroundQuestions'
import {
  fetchEventFlow,
  setEventFlowStep,
  subscribeToEventChanges,
  fetchStageStates,
  subscribeToStageChanges,
  setStageStatus,
  StageState,
} from '@/lib/stageStore'

// One controller for all 5 Tribe Playground games. Each game is a tab; every
// question / level has a button that puts it on the projector.
interface Section {
  key: string
  name: string
  color: string
  items: { index: number; scene: Scene }[]
}

function buildSections(deck: Scene[]): Section[] {
  const sections: Section[] = [{ key: 'overview', name: 'Overview', color: '#FFE600', items: [] }]
  deck.forEach((scene, index) => {
    if (scene.kind === 'round') {
      const r = PG_ROUNDS[scene.n - 1]
      sections.push({ key: `r${scene.n}`, name: r.name, color: r.color, items: [] })
    }
    sections[sections.length - 1].items.push({ index, scene })
  })
  return sections
}

export default function PlaygroundController() {
  const deck = DECKS.playground
  const sections = useMemo(() => buildSections(deck), [deck])
  const [flow, setFlow] = useState<{ id: string; currentStep: number; phase: number } | null>(null)
  const [stage, setStage] = useState<StageState | null>(null)
  const [tab, setTab] = useState('overview')
  const [tabTouched, setTabTouched] = useState(false)

  useEffect(() => {
    let cancelled = false
    const loadFlow = async () => { const f = await fetchEventFlow(); if (!cancelled) setFlow(f) }
    const loadStage = async () => { const s = await fetchStageStates(); if (!cancelled) setStage(s['playground'] ?? null) }
    loadFlow()
    loadStage()
    const u1 = subscribeToEventChanges(loadFlow)
    const u2 = subscribeToStageChanges(loadStage)
    return () => { cancelled = true; u1(); u2() }
  }, [])

  const step = flow ? Math.min(Math.max(flow.currentStep, 0), deck.length - 1) : 0
  const live = stage?.status === 'live'

  // Follow the projector's game until the controller picks a tab by hand
  useEffect(() => {
    if (tabTouched) return
    const s = sections.find((sec) => sec.items.some((it) => it.index === step))
    if (s) setTab(s.key)
  }, [step, sections, tabTouched])

  const goTo = async (index: number) => {
    if (!flow) return
    const next = Math.min(Math.max(index, 0), deck.length - 1)
    setFlow({ ...flow, currentStep: next, phase: 0 })
    await setEventFlowStep(flow.id, next, 0)
  }

  const setPhase = async (phase: number) => {
    if (!flow) return
    setFlow({ ...flow, phase })
    await setEventFlowStep(flow.id, step, phase)
  }

  const goLive = async () => {
    await setStageStatus('playground', 'live')
    await goTo(0)
  }

  // ← / → move the projector
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      e.preventDefault()
      goTo(step + (e.key === 'ArrowRight' ? 1 : -1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const current = deck[step]
  const currentAnswer = sceneAnswer(current)
  const active = sections.find((s) => s.key === tab) ?? sections[0]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-white/40 font-display">
        <Link href="/event-control" className="hover:text-white">Event Control</Link>
        <span>/</span>
        <span className="text-white/70">Tribe Playground</span>
      </div>

      <div className="bg-gradient-to-r from-[#1A6FFF]/20 to-[#FF1A75]/20 p-6 rounded-3xl border border-white/10">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="px-3 py-0.5 bg-[#FF1A75] text-white text-[10px] font-black rounded-full font-display uppercase tracking-widest">Tribe Playground</span>
          <span className={`text-xs font-mono font-bold ${live ? 'text-green-400' : 'text-red-400'}`}>{live ? '● LIVE ON PROJECTOR' : '● NOT LIVE'}</span>
        </div>
        <h1 className="text-3xl font-black text-white font-display">Playground Controller</h1>
        <p className="text-white/60 text-xs mt-1">5 games · 5 rounds each. Pick a game, then put any question on the projector.</p>
        <div className="flex flex-wrap gap-3 mt-3">
          {!live && (
            <button onClick={goLive} className="px-4 py-2 bg-green-500 text-black rounded-xl text-xs font-black font-display uppercase">Go Live</button>
          )}
          <Link href="/event-control/playground/host" className="px-4 py-2 bg-[#FFE600]/20 border border-[#FFE600]/40 text-[#FFE600] rounded-xl text-xs font-black font-display uppercase">Host Sheet →</Link>
          <Link href="/display" target="_blank" className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-black font-display uppercase">Open Projector →</Link>
        </div>
      </div>

      {/* Now showing + Prev / Next */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 space-y-3">
        <p className="text-[10px] font-black text-white/40 font-display uppercase tracking-widest">Now on projector</p>
        <p className="text-white text-xl font-black font-display">{step + 1} / {deck.length} · {current.title}</p>
        {currentAnswer && (
          <p className="text-xs text-[#FFE600] bg-[#FFE600]/10 border border-[#FFE600]/30 rounded-xl px-3 py-2 font-bold">Host only: {currentAnswer}</p>
        )}
        {sceneActions(current).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {sceneActions(current).map((a) => {
              const on = flow?.phase === a.phase && a.phase !== 0
              return (
                <button
                  key={a.label}
                  onClick={() => setPhase(a.phase)}
                  className={`px-5 py-3 rounded-xl text-sm font-black font-display uppercase transition-colors ${
                    a.phase === 0 ? 'bg-white/10 hover:bg-white/20 text-white/70' : on ? 'bg-green-500 text-black' : 'bg-[#1A6FFF] hover:bg-[#1A6FFF]/80 text-white'
                  }`}
                >
                  {a.label}
                </button>
              )
            })}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => goTo(step - 1)} className="flex-1 sm:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-black font-display uppercase">← Prev</button>
          <button onClick={() => goTo(step + 1)} className="flex-1 sm:flex-none px-8 py-3 bg-[#FFE600] hover:bg-[#D4FF00] text-black rounded-xl text-sm font-black font-display uppercase">Next →</button>
          <button onClick={() => goTo(0)} className="px-4 py-3 text-white/50 hover:text-white text-xs font-bold font-display uppercase">Restart</button>
        </div>
        <p className="text-[10px] text-white/30 font-mono">Keyboard: ← Prev · → Next</p>
      </div>

      {/* Game tabs */}
      <div className="flex flex-wrap gap-2">
        {sections.map((s, i) => (
          <button
            key={s.key}
            onClick={() => { setTab(s.key); setTabTouched(true) }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black font-display uppercase transition-colors ${tab === s.key ? 'text-white' : 'bg-white/5 hover:bg-white/10 text-white/60'}`}
            style={tab === s.key ? { background: s.color, color: s.key === 'overview' ? '#000' : '#fff' } : undefined}
          >
            {i === 0 ? s.name : `${i}. ${s.name}`}
          </button>
        ))}
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-3xl divide-y divide-white/10 overflow-hidden">
        {active.items.map(({ index, scene }) => {
          const here = index === step
          const ans = sceneAnswer(scene)
          return (
            <div key={index} className={`p-4 flex items-start gap-3 ${here ? 'bg-white/[0.06]' : ''}`}>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">{scene.title}</p>
                {ans && <p className="text-white/50 text-xs mt-1 break-words">Answer: {ans}</p>}
              </div>
              <button
                onClick={() => goTo(index)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black font-display uppercase ${here ? 'bg-green-500 text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                {here ? 'Showing' : 'Show'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
