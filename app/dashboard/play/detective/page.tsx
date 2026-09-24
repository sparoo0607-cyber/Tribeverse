'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import StageGuard from '@/components/StageGuard'
import { createClient } from '@/lib/supabase/client'
import Icon from '@/components/icons/Icon'
import {
  fetchLiveDetectiveRound,
  subscribeToDetectiveRounds,
  fetchTeammates,
  fetchMyGuesses,
  fetchAssignmentsForRound,
  submitGuess,
  DetectiveRound,
  Teammate,
  GuessResult,
} from '@/lib/detective'

function DetectiveGame() {
  const [userId, setUserId] = useState<string | null>(null)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [round, setRound] = useState<DetectiveRound | null | 'none'>(null)
  const [teammates, setTeammates] = useState<Teammate[]>([])
  const [guesses, setGuesses] = useState<Record<string, GuessResult>>({})
  const [actualRoles, setActualRoles] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [submittingFor, setSubmittingFor] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function loadIdentity() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      if (!cancelled) setUserId(user.id)
      const { data: membership } = await supabase.from('team_members').select('team_id').eq('user_id', user.id).maybeSingle()
      if (!cancelled) setTeamId(membership?.team_id ?? null)
    }

    async function loadRound() {
      const live = await fetchLiveDetectiveRound()
      if (cancelled) return
      setRound(live ?? 'none')
    }

    loadIdentity()
    loadRound()
    const unsub = subscribeToDetectiveRounds(loadRound)
    return () => { cancelled = true; unsub() }
  }, [])

  useEffect(() => {
    if (!round || round === 'none' || !teamId || !userId) return
    let cancelled = false

    async function loadTeamState() {
      if (round === 'none' || round === null) return
      const [mates, myGuesses] = await Promise.all([
        fetchTeammates(teamId as string, userId as string),
        fetchMyGuesses(round.id, userId as string),
      ])
      if (cancelled) return
      setTeammates(mates)
      setGuesses(myGuesses)

      if (round.phase === 'revealed') {
        const roles = await fetchAssignmentsForRound(round.id)
        if (!cancelled) setActualRoles(roles)
      }
    }
    loadTeamState()
    return () => { cancelled = true }
  }, [round, teamId, userId])

  async function handleSubmit(targetUserId: string) {
    if (!round || round === 'none' || !userId || !teamId) return
    const guessedRole = draft[targetUserId]
    if (!guessedRole) return
    setSubmittingFor(targetUserId)
    await submitGuess({ roundId: round.id, guesserUserId: userId, targetUserId, teamId, guessedRole })
    const myGuesses = await fetchMyGuesses(round.id, userId)
    setGuesses(myGuesses)
    setSubmittingFor(null)
  }

  if (round === null) {
    return <div className="flex items-center justify-center min-h-[300px] text-white/40">Loading round…</div>
  }

  if (round === 'none') {
    return (
      <div className="max-w-2xl mx-auto text-center bg-white/[0.03] border border-white/10 rounded-3xl p-10 space-y-4">
        <Icon name="hat" className="w-10 h-10 mx-auto text-[#FFE600]" />
        <h2 className="text-2xl font-black text-white font-display">No Round Live Yet</h2>
        <p className="text-white/50 text-sm">The Event Controller hasn&apos;t started a Detective round. Check back once they announce it, or try the Bonus Cipher Hunt while you wait.</p>
        <Link href="/dashboard/bonus/cipher-hunt" className="inline-block px-5 py-2.5 bg-[#FFE600] text-black font-black text-xs uppercase rounded-xl font-display hover:scale-105 transition-transform">
          Try Bonus Cipher Hunt →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-[#0D1B4B] to-[#7B2FFF]/20 p-6 rounded-3xl border border-[#7B2FFF]/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-[#00FFD1]/20 text-[#00FFD1] text-xs font-black rounded-full font-display uppercase tracking-widest">
            Round {round.roundNumber} of 5
          </span>
          <span className="text-white/40 text-xs uppercase font-display">{round.phase.replace('_', ' ')}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white font-display">{round.icon} {round.name}</h1>
        <p className="text-white/70 text-sm mt-1">{round.description}</p>
      </div>

      {round.phase === 'idle' && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center text-white/50">
          This round is about to begin. Stay tuned to the main screen.
        </div>
      )}

      {round.phase === 'scenario' && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center space-y-3">
          <Icon name="clapperboard" className="w-8 h-8 mx-auto text-[#FFE600]" />
          <p className="text-white text-lg font-bold font-display max-w-lg mx-auto">{round.scenarioText}</p>
          <p className="text-white/40 text-xs uppercase tracking-widest font-display">Guessing opens shortly…</p>
        </div>
      )}

      {(round.phase === 'guessing_open' || round.phase === 'guessing_closed') && (
        <div className="space-y-3">
          <p className="text-white/40 text-xs uppercase tracking-widest font-display">
            {round.phase === 'guessing_open' ? 'Guess each teammate\'s secret role' : 'Guessing is closed — waiting for reveal'}
          </p>
          {teammates.map((tm) => {
            const existing = guesses[tm.userId]
            const locked = !!existing || round.phase === 'guessing_closed'
            return (
              <div key={tm.userId} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="font-bold text-white font-display">{tm.fullName}</span>
                {existing ? (
                  <span className="text-xs font-bold text-green-400 font-display uppercase">Guessed: {existing.guessedRole}</span>
                ) : round.phase === 'guessing_closed' ? (
                  <span className="text-xs font-bold text-red-400 font-display uppercase">No guess submitted</span>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={draft[tm.userId] ?? ''}
                      onChange={(e) => setDraft({ ...draft, [tm.userId]: e.target.value })}
                      disabled={locked}
                      className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-display focus:outline-none focus:border-[#FFE600]"
                    >
                      <option value="" className="bg-[#111418]">Select role…</option>
                      {round.rolePool.map((role) => (
                        <option key={role} value={role} className="bg-[#111418]">{role}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleSubmit(tm.userId)}
                      disabled={!draft[tm.userId] || submittingFor === tm.userId}
                      className="px-4 py-2 bg-[#FFE600] text-black font-black text-xs uppercase rounded-xl font-display disabled:opacity-40 hover:scale-105 transition-transform"
                    >
                      {submittingFor === tm.userId ? '…' : 'Lock In'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {round.phase === 'revealed' && (
        <div className="space-y-3">
          <p className="text-white/40 text-xs uppercase tracking-widest font-display">Results</p>
          {teammates.map((tm) => {
            const g = guesses[tm.userId]
            const actual = actualRoles[tm.userId]
            return (
              <div key={tm.userId} className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${g?.isCorrect ? 'bg-green-500/10 border-green-500/40' : 'bg-white/[0.03] border-white/10'}`}>
                <span className="font-bold text-white font-display">{tm.fullName}</span>
                <div className="text-xs font-display text-right">
                  <p className="text-white/50">Your guess: <span className="text-white font-bold">{g?.guessedRole ?? '—'}</span></p>
                  <p className="text-white/50">Actual role: <span className="text-[#FFE600] font-bold">{actual ?? '—'}</span></p>
                  <p className={`font-black uppercase mt-0.5 ${g?.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {g?.isCorrect ? `+${g.pointsAwarded} PTS` : 'Incorrect'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function TribeDetectivePage() {
  return (
    <StageGuard slug="detective" title="The Tribe Detective" stageNumber="02" points={600}>
      <DetectiveGame />
    </StageGuard>
  )
}
