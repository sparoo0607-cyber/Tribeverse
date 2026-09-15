'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import StageGuard from '@/components/StageGuard'
import { createClient } from '@/lib/supabase/client'
import {
  fetchQuickEyesState,
  subscribeToQuickEyesRound,
  fetchMyAttempt,
  submitAnswer,
  QERoundState,
} from '@/lib/quickEyes'

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
    const id = setInterval(tick, 200)
    return () => clearInterval(id)
  }, [phaseStartedAt, durationSeconds, active])

  return remaining
}

function QuickEyesGame() {
  const [state, setState] = useState<QERoundState | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const currentRoundId = useRef<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      if (!cancelled) setUserId(user.id)

      const { data: membership } = await supabase.from('team_members').select('team_id').eq('user_id', user.id).maybeSingle()
      if (!cancelled) setTeamId(membership?.team_id ?? null)

      const s = await fetchQuickEyesState()
      if (cancelled || !s) return

      if (currentRoundId.current !== s.roundId || s.phase === 'idle' || s.phase === 'visual') {
        // fresh round instance — reset local answer state
        if (currentRoundId.current !== s.roundId) { setSelected(null); setWasCorrect(null) }
      }
      currentRoundId.current = s.roundId
      setState(s)

      const mine = await fetchMyAttempt(s.roundId, user.id)
      if (!cancelled && mine) {
        setSelected(mine.selected_option)
        setWasCorrect(mine.is_correct)
      }
    }
    load()
    const unsubscribe = subscribeToQuickEyesRound(load)
    return () => { cancelled = true; unsubscribe() }
  }, [])

  const remaining = useCountdown(state?.phaseStartedAt ?? null, state?.durationSeconds ?? 15, state?.phase === 'timer' || state?.phase === 'question')

  async function handleSubmit(optionLabel: string) {
    if (!state?.question || !userId || !teamId || selected || submitting) return
    setSubmitting(true)
    const startedAt = state.phaseStartedAt ? new Date(state.phaseStartedAt).getTime() : Date.now()
    const timeTakenMs = Date.now() - startedAt
    setSelected(optionLabel)
    const correct = await submitAnswer({
      roundId: state.roundId,
      questionId: state.question.id,
      userId,
      teamId,
      selectedOption: optionLabel,
      correctOption: state.question.correct_option,
      points: state.question.points,
      timeTakenMs,
    })
    setWasCorrect(correct)
    setSubmitting(false)
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-[#FFE600] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 text-center py-6">
      <div>
        <span className="text-6xl block mb-2">👁</span>
        <h1 className="text-3xl font-black text-white font-display">Quick Eyes</h1>
        <p className="text-white/50 text-sm">Round 1 · Tribe Playground</p>
      </div>

      {state.phase === 'idle' && (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-10">
          <p className="text-white/60 font-display font-bold">Waiting for the host to start Quick Eyes…</p>
        </div>
      )}

      {(state.phase === 'visual' || state.phase === 'timer') && (
        <div className="bg-gradient-to-b from-[#1A6FFF]/20 to-black/40 border border-[#1A6FFF]/30 rounded-3xl p-10 space-y-4">
          <span className="text-5xl block">📺</span>
          <p className="text-2xl font-black text-white font-display">LOOK AT THE MAIN SCREEN!</p>
          {state.phase === 'timer' && (
            <p className="text-6xl font-black text-[#FFE600] font-display tabular-nums">{remaining}</p>
          )}
        </div>
      )}

      {(state.phase === 'question' || state.phase === 'closed' || state.phase === 'revealed') && state.question && (
        <div className="space-y-5">
          <p className={`text-5xl font-black font-display tabular-nums ${remaining <= 5 && state.phase === 'question' ? 'text-red-500' : 'text-[#FFE600]'}`}>
            {state.phase === 'question' ? remaining : ''}
          </p>
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
            <p className="font-bold text-white text-lg">{state.question.question_text}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {state.question.options.map(opt => {
              let style = 'bg-white/[0.05] border-white/[0.1] text-white'
              if (state.phase === 'revealed') {
                if (opt.label === state.question!.correct_option) style = 'bg-green-500/20 border-green-500/50 text-green-300'
                else if (opt.label === selected) style = 'bg-red-500/20 border-red-500/50 text-red-300'
                else style = 'bg-white/[0.03] border-white/[0.05] text-white/30'
              } else if (selected === opt.label) {
                style = 'bg-[#1A6FFF]/20 border-[#1A6FFF]/50 text-white'
              }
              return (
                <button
                  key={opt.label}
                  disabled={!!selected || state.phase !== 'question'}
                  onClick={() => handleSubmit(opt.label)}
                  className={`border rounded-xl p-4 text-left transition-all ${style} ${!selected && state.phase === 'question' ? 'hover:scale-[1.02] cursor-pointer' : 'cursor-default'}`}
                >
                  <span className="font-black text-xs text-white/40 font-display">{opt.label}.</span>
                  <p className="font-bold mt-1 text-sm">{opt.text}</p>
                </button>
              )
            })}
          </div>

          {selected && state.phase !== 'revealed' && (
            <p className="text-white/50 text-sm font-display">Answer Submitted ✓ — waiting for host to reveal…</p>
          )}

          {state.phase === 'revealed' && (
            <div className={`p-6 rounded-2xl border ${wasCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <p className={`font-black text-2xl font-display ${wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {selected == null ? "Time's up!" : wasCorrect ? `CORRECT! +${state.question.points}` : 'Wrong — 0 pts'}
              </p>
              {state.winnerTeamName && (
                <p className="text-white/60 text-sm mt-2">Champion: <strong className="text-white">{state.winnerTeamName}</strong></p>
              )}
            </div>
          )}
        </div>
      )}

      <Link href="/dashboard/play/playground" className="inline-block text-xs text-white/40 hover:text-white font-display">
        ← Back to Playground
      </Link>
    </div>
  )
}

export default function QuickEyesPage() {
  return (
    <StageGuard slug="playground" title="Tribe Playground" stageNumber="01" points={500}>
      <QuickEyesGame />
    </StageGuard>
  )
}
