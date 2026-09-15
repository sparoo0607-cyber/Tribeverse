'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  fetchQuickEyesState,
  subscribeToQuickEyesRound,
  fetchAttempts,
  subscribeToQuickEyesAttempts,
  startVisual,
  startTimer,
  showQuestion,
  closeAnswers,
  revealResult,
  resetRound,
  QERoundState,
  QEAttempt,
} from '@/lib/quickEyes'

const STEPS: { phase: string; label: string; action: (roundId: string) => Promise<void> }[] = [
  { phase: 'idle', label: 'START VISUAL', action: startVisual },
  { phase: 'visual', label: 'START TIMER', action: startTimer },
  { phase: 'timer', label: 'SHOW QUESTION', action: showQuestion },
  { phase: 'question', label: 'CLOSE ANSWERS', action: closeAnswers },
  { phase: 'closed', label: 'REVEAL RESULT', action: revealResult },
]

export default function QuickEyesAdminPage() {
  const [state, setState] = useState<QERoundState | null>(null)
  const [attempts, setAttempts] = useState<QEAttempt[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    let unsubAttempts: (() => void) | null = null

    async function load() {
      const s = await fetchQuickEyesState()
      if (cancelled || !s) return
      setState(s)

      const a = await fetchAttempts(s.roundId)
      if (!cancelled) setAttempts(a)

      if (!unsubAttempts) {
        unsubAttempts = subscribeToQuickEyesAttempts(s.roundId, async () => {
          const updated = await fetchAttempts(s.roundId)
          if (!cancelled) setAttempts(updated)
        })
      }
    }
    load()
    const unsubRound = subscribeToQuickEyesRound(load)

    return () => { cancelled = true; unsubRound(); unsubAttempts?.() }
  }, [])

  if (!state) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-[#FFE600] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const step = STEPS.find(s => s.phase === state.phase)
  const correctCount = attempts.filter(a => a.is_correct).length
  const wrongCount = attempts.length - correctCount

  const runAction = async (action: (roundId: string) => Promise<void>) => {
    setBusy(true)
    await action(state.roundId)
    setBusy(false)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-white/40 font-display">
        <Link href="/admin/games" className="hover:text-white">Game Manager</Link>
        <span>/</span>
        <span className="text-white/70">Quick Eyes</span>
      </div>

      <div className="bg-gradient-to-r from-[#1A6FFF]/20 to-[#7B2FFF]/20 p-6 rounded-3xl border border-[#1A6FFF]/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-3 py-0.5 bg-[#1A6FFF] text-white text-[10px] font-black rounded-full font-display uppercase tracking-widest">
            Playground · Round 1
          </span>
          <span className="text-xs text-green-400 font-mono font-bold">Phase: {state.phase.toUpperCase()}</span>
        </div>
        <h1 className="text-3xl font-black text-white font-display">Quick Eyes Controller</h1>
        <p className="text-white/60 text-xs mt-1">Observation round · every phase change pushes instantly to student phones and the projector display.</p>
        <Link
          href="/admin/display/playground/quick-eyes"
          target="_blank"
          className="inline-block mt-3 text-xs font-bold text-[#FFE600] hover:underline font-display"
        >
          Open Event Display →
        </Link>
      </div>

      {/* Question preview */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-black text-white/50 font-display uppercase tracking-widest">Question (visible to admin only)</h3>
        {state.question ? (
          <>
            {state.question.image_url && (
              <img src={state.question.image_url} alt="Challenge visual" className="w-full rounded-2xl border border-white/10" />
            )}
            <p className="text-white font-bold text-lg">{state.question.question_text}</p>
            <div className="grid grid-cols-2 gap-2">
              {state.question.options.map(opt => (
                <div
                  key={opt.label}
                  className={`p-3 rounded-xl border text-sm ${opt.label === state.question!.correct_option ? 'bg-green-500/10 border-green-500/40 text-green-300' : 'bg-white/5 border-white/10 text-white/70'}`}
                >
                  <span className="font-mono font-black mr-2">{opt.label}.</span>{opt.text}
                  {opt.label === state.question!.correct_option && <span className="ml-2 text-[10px] font-black uppercase">Correct</span>}
                </div>
              ))}
            </div>
            <div className="flex gap-4 text-xs text-white/50 font-mono">
              <span>Timer: {state.durationSeconds}s</span>
              <span>Points: +{state.question.points}</span>
            </div>
          </>
        ) : (
          <p className="text-white/40 text-sm">No question configured for this round.</p>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-black text-white/50 font-display uppercase tracking-widest">Live Controls</h3>
        <div className="flex flex-wrap gap-2">
          {STEPS.map(s => (
            <div
              key={s.phase}
              className={`px-4 py-2 rounded-xl text-xs font-black font-display uppercase ${
                state.phase === s.phase ? 'bg-white/10 text-white/40' :
                STEPS.findIndex(x => x.phase === state.phase) > STEPS.findIndex(x => x.phase === s.phase) || state.phase === 'revealed'
                  ? 'bg-emerald-500/10 text-emerald-400/60'
                  : 'bg-white/5 text-white/20'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        {step ? (
          <button
            disabled={busy}
            onClick={() => runAction(step.action)}
            className="w-full py-4 bg-gradient-to-r from-[#FFE600] to-[#00FFD1] text-black font-black text-sm uppercase tracking-wider rounded-xl font-display hover:scale-[1.01] transition-transform disabled:opacity-50"
          >
            {busy ? 'Please wait…' : `▶ ${step.label}`}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-[#FFE600]/10 border border-[#FFE600]/30 rounded-xl text-center">
              <p className="text-xs text-white/50 uppercase font-display font-bold">Winner</p>
              <p className="text-2xl font-black text-[#FFE600] font-display">{state.winnerTeamName ?? 'No correct answers'}</p>
            </div>
            <button
              disabled={busy}
              onClick={() => runAction(resetRound)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider rounded-xl font-display transition-colors disabled:opacity-50"
            >
              Reset & Run Again
            </button>
          </div>
        )}
      </div>

      {/* Live answers */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white/50 font-display uppercase tracking-widest">Live Participant Answers</h3>
          <div className="flex gap-3 text-xs font-mono font-bold">
            <span className="text-green-400">{correctCount} correct</span>
            <span className="text-red-400">{wrongCount} wrong</span>
          </div>
        </div>
        {attempts.length === 0 ? (
          <p className="text-white/30 text-sm">No answers submitted yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {attempts.map(a => (
              <div key={a.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="font-bold text-white">{a.full_name}</span>
                  <span className="text-white/40 text-xs ml-2">{a.team_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-white/50">{a.time_taken_ms != null ? `${(a.time_taken_ms / 1000).toFixed(2)}s` : ''}</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${a.is_correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {a.selected_option}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
