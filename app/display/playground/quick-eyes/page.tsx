'use client'

import { useEffect, useState } from 'react'
import { fetchQuickEyesState, subscribeToQuickEyesRound, QERoundState } from '@/lib/quickEyes'

function useCountdown(phaseStartedAt: string | null, durationSeconds: number, active: boolean) {
  const [remaining, setRemaining] = useState(durationSeconds)

  useEffect(() => {
    if (!active || !phaseStartedAt) { setRemaining(durationSeconds); return }
    const startedAt = new Date(phaseStartedAt).getTime()

    function tick() {
      const elapsed = (Date.now() - startedAt) / 1000
      setRemaining(Math.max(0, Math.ceil(durationSeconds - elapsed)))
    }
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [phaseStartedAt, durationSeconds, active])

  return remaining
}

export default function QuickEyesDisplayPage() {
  const [state, setState] = useState<QERoundState | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const s = await fetchQuickEyesState()
      if (!cancelled) setState(s)
    }
    load()
    const unsubscribe = subscribeToQuickEyesRound(load)
    return () => { cancelled = true; unsubscribe() }
  }, [])

  const remaining = useCountdown(state?.phaseStartedAt ?? null, state?.durationSeconds ?? 15, state?.phase === 'timer' || state?.phase === 'question')

  if (!state) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white/40 font-display">Loading…</div>
  }

  const q = state.question

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center px-8 py-12 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#1A6FFF]/20 border border-[#1A6FFF]/40 rounded-full mb-8">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[#1A6FFF] font-black text-sm tracking-[0.3em] font-display uppercase">Quick Eyes · Tribe Playground</span>
      </div>

      {state.phase === 'idle' && (
        <h1 className="text-6xl font-black text-white/30 font-display">AWAITING HOST</h1>
      )}

      {(state.phase === 'visual' || state.phase === 'timer') && (
        <div className="space-y-8 max-w-4xl">
          {q?.image_url && <img src={q.image_url} alt="Challenge visual" className="rounded-3xl border border-white/10 mx-auto max-w-2xl w-full" />}
          {state.phase === 'visual' ? (
            <p className="text-4xl font-black text-white font-display">OBSERVE CAREFULLY…</p>
          ) : (
            <p className="text-9xl font-black text-[#FFE600] font-display tabular-nums">{remaining}</p>
          )}
        </div>
      )}

      {(state.phase === 'question' || state.phase === 'closed') && q && (
        <div className="space-y-8 max-w-3xl w-full">
          <p className={`text-7xl font-black font-display tabular-nums ${remaining <= 5 ? 'text-red-500' : 'text-[#FFE600]'}`}>{remaining}</p>
          <h2 className="text-3xl font-black text-white font-display leading-tight">{q.question_text}</h2>
          <div className="grid grid-cols-2 gap-4">
            {q.options.map(opt => (
              <div key={opt.label} className="p-6 bg-white/[0.06] border border-white/15 rounded-2xl text-left">
                <span className="font-mono font-black text-white/40 text-xl mr-3">{opt.label}</span>
                <span className="text-white font-bold text-xl">{opt.text}</span>
              </div>
            ))}
          </div>
          {state.phase === 'closed' && <p className="text-white/40 font-display uppercase tracking-widest text-sm">Answers locked — calculating result…</p>}
        </div>
      )}

      {state.phase === 'revealed' && q && (
        <div className="space-y-8 max-w-3xl w-full">
          <p className="text-2xl font-black text-white/50 font-display uppercase tracking-widest">Correct Answer</p>
          <div className="p-8 bg-green-500/10 border-2 border-green-500/40 rounded-3xl">
            <p className="text-4xl font-black text-green-400 font-display">
              {q.options.find(o => o.label === q.correct_option)?.text}
            </p>
          </div>
          <div className="p-8 bg-gradient-to-r from-[#FFE600]/20 via-[#FFE600]/10 to-[#FFE600]/20 border-2 border-[#FFE600]/50 rounded-3xl">
            <p className="text-sm uppercase tracking-widest text-[#FFE600] font-black font-display">Champion</p>
            <h2 className="text-5xl font-black text-white font-display mt-2">{state.winnerTeamName ?? 'No correct answers'}</h2>
            {state.winnerTeamName && <p className="text-white/60 font-mono mt-2">+{q.points} points awarded</p>}
          </div>
        </div>
      )}
    </div>
  )
}
