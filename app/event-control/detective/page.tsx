'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  fetchDetectiveRounds,
  subscribeToDetectiveRounds,
  fetchTeamsWithMembers,
  fetchAssignmentsForRound,
  assignRole,
  updateRoundContent,
  startDetectiveRound,
  setDetectivePhase,
  resetDetectiveRound,
  revealDetectiveRound,
  fetchGuessProgress,
  subscribeToDetectiveGuesses,
  DetectiveRound,
  TeamWithMembers,
} from '@/lib/detective'

const PHASE_FLOW = ['idle', 'scenario', 'guessing_open', 'guessing_closed', 'revealed'] as const

export default function DetectiveControllerPage() {
  const [rounds, setRounds] = useState<DetectiveRound[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [teams, setTeams] = useState<TeamWithMembers[]>([])
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [rolePoolDraft, setRolePoolDraft] = useState('')
  const [scenarioDraft, setScenarioDraft] = useState('')
  const [progress, setProgress] = useState({ submitted: 0, expected: 0 })
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState('')
  const [syncedRoundId, setSyncedRoundId] = useState<string | null>(null)

  const round = rounds.find((r) => r.slug === selectedSlug) ?? null

  // Re-seed the editable drafts whenever the selected round actually
  // changes (not on every re-render) — done during render rather than in
  // an effect, per React's "adjusting state when a prop changes" pattern.
  if (round && round.id !== syncedRoundId) {
    setSyncedRoundId(round.id)
    setRolePoolDraft(round.rolePool.join(', '))
    setScenarioDraft(round.scenarioText ?? '')
  }

  useEffect(() => {
    async function loadRounds() {
      const data = await fetchDetectiveRounds()
      setRounds(data)
      setSelectedSlug((prev) => prev ?? data[0]?.slug ?? null)
    }
    loadRounds()
    const unsub = subscribeToDetectiveRounds(loadRounds)
    fetchTeamsWithMembers().then(setTeams)
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!round) return
    const roundId = round.id
    let cancelled = false
    async function loadRoundData() {
      const [a, p] = await Promise.all([fetchAssignmentsForRound(roundId), fetchGuessProgress(roundId)])
      if (cancelled) return
      setAssignments(a)
      setProgress(p)
    }
    loadRoundData()
    const unsub = subscribeToDetectiveGuesses(roundId, loadRoundData)
    return () => { cancelled = true; unsub() }
  }, [round?.id])

  function say(msg: string) {
    setFlash(msg)
    setTimeout(() => setFlash(''), 3000)
  }

  async function saveContent() {
    if (!round) return
    setBusy(true)
    const pool = rolePoolDraft.split(',').map((s) => s.trim()).filter(Boolean)
    await updateRoundContent(round.id, pool, scenarioDraft)
    setBusy(false)
    say('Role pool & scenario saved.')
  }

  async function handleAssign(userId: string, teamId: string, role: string) {
    if (!round) return
    await assignRole(round.id, userId, teamId, role)
    setAssignments((prev) => ({ ...prev, [userId]: role }))
  }

  async function advancePhase() {
    if (!round) return
    setBusy(true)
    if (round.status === 'locked') {
      await startDetectiveRound(round.id)
    } else if (round.phase === 'guessing_closed') {
      await revealDetectiveRound(round.id)
    } else {
      const idx = PHASE_FLOW.indexOf(round.phase)
      const next = PHASE_FLOW[Math.min(idx + 1, PHASE_FLOW.length - 1)]
      await setDetectivePhase(round.id, next)
    }
    setBusy(false)
  }

  async function handleReset() {
    if (!round) return
    setBusy(true)
    await resetDetectiveRound(round.id)
    setBusy(false)
    say('Round reset to locked.')
  }

  if (!round) return <div className="text-white/40">Loading Detective rounds…</div>

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-white/40 font-display">
        <Link href="/event-control" className="hover:text-white">Event Control</Link>
        <span>/</span>
        <span className="text-white/70">Detective</span>
      </div>

      {flash && (
        <div className="p-3 bg-green-500/20 border border-green-500/40 rounded-xl text-green-300 font-bold font-display text-sm text-center">{flash}</div>
      )}

      {/* Round selector */}
      <div className="flex flex-wrap gap-2">
        {rounds.map((r) => (
          <button
            key={r.slug}
            onClick={() => setSelectedSlug(r.slug)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase font-display transition-all border ${
              r.slug === selectedSlug ? 'bg-[#00FFD1] text-black border-[#00FFD1]' : 'bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/[0.06]'
            }`}
          >
            {r.icon} {r.name}
            <span className={`ml-2 inline-block w-1.5 h-1.5 rounded-full ${r.status === 'live' ? 'bg-green-400' : r.status === 'completed' ? 'bg-emerald-500' : 'bg-white/20'}`} />
          </button>
        ))}
      </div>

      {/* Round header + phase control */}
      <div className="bg-gradient-to-r from-[#7B2FFF]/20 to-[#00FFD1]/10 p-6 rounded-3xl border border-[#7B2FFF]/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white font-display">{round.icon} {round.name}</h1>
            <p className="text-white/60 text-xs mt-1">Status: <span className="text-white font-bold">{round.status}</span> · Phase: <span className="text-[#00FFD1] font-bold">{round.phase}</span></p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs font-display uppercase">Guesses Submitted</p>
            <p className="text-2xl font-black text-[#FFE600] font-mono">{progress.submitted} / {progress.expected}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={advancePhase}
            disabled={busy || round.phase === 'revealed'}
            className="px-5 py-2.5 bg-[#FFE600] text-black font-black text-xs uppercase rounded-xl font-display disabled:opacity-40 hover:scale-105 transition-transform"
          >
            {round.status === 'locked' ? 'Start Round → Scenario' : round.phase === 'scenario' ? 'Open Guessing' : round.phase === 'guessing_open' ? 'Close Guessing' : round.phase === 'guessing_closed' ? 'Reveal & Award Points' : 'Revealed'}
          </button>
          <button
            onClick={handleReset}
            disabled={busy}
            className="px-5 py-2.5 bg-white/10 border border-white/20 text-white font-black text-xs uppercase rounded-xl font-display hover:bg-white/20 transition-colors"
          >
            Reset Round
          </button>
        </div>
      </div>

      {/* Role pool + scenario editor */}
      <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-3">
        <h3 className="text-lg font-black text-white font-display">Round Content</h3>
        <div>
          <label className="block text-white/40 text-xs uppercase font-display mb-1">Role Pool (comma-separated)</label>
          <textarea
            rows={2}
            value={rolePoolDraft}
            onChange={(e) => setRolePoolDraft(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#FFE600]"
          />
        </div>
        <div>
          <label className="block text-white/40 text-xs uppercase font-display mb-1">Scenario Text (shown to students)</label>
          <textarea
            rows={2}
            value={scenarioDraft}
            onChange={(e) => setScenarioDraft(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#FFE600]"
          />
        </div>
        <button onClick={saveContent} disabled={busy} className="px-5 py-2 bg-[#1A6FFF] text-white font-black text-xs uppercase rounded-xl font-display hover:bg-blue-600 transition-colors">
          Save Content
        </button>
      </div>

      {/* Manual role assignment */}
      <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-4">
        <h3 className="text-lg font-black text-white font-display">Assign Secret Roles</h3>
        <p className="text-white/50 text-xs">Set each participant&apos;s secret role for this round before it goes live. Students never see this — only their own role.</p>
        {teams.map((team) => (
          <div key={team.teamId} className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
            <p className="text-xs font-bold text-white/40 font-display uppercase mb-2">{team.teamName}</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {team.members.map((m) => (
                <div key={m.userId} className="flex items-center justify-between gap-2 bg-black/30 px-3 py-2 rounded-xl">
                  <span className="text-white text-xs font-display truncate">{m.fullName}</span>
                  <select
                    value={assignments[m.userId] ?? ''}
                    onChange={(e) => handleAssign(m.userId, team.teamId, e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs font-display focus:outline-none focus:border-[#FFE600]"
                  >
                    <option value="" className="bg-[#111418]">—</option>
                    {round.rolePool.map((role) => (
                      <option key={role} value={role} className="bg-[#111418]">{role}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
