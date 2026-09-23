'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import StageRow from './StageRow'
import {
  fetchDetectiveRounds,
  subscribeToDetectiveRounds,
  startDetectiveRound,
  setDetectivePhase,
  revealDetectiveRound,
  resetDetectiveRound,
  fetchGuessProgress,
  DetectiveRound,
} from '@/lib/detective'

const PHASE_FLOW = ['idle', 'scenario', 'guessing_open', 'guessing_closed', 'revealed'] as const

export default function DetectiveSection() {
  const [open, setOpen] = useState(false)
  const [rounds, setRounds] = useState<DetectiveRound[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [progress, setProgress] = useState({ submitted: 0, expected: 0 })
  const [busy, setBusy] = useState(false)

  const round = rounds.find((r) => r.slug === selectedSlug) ?? null

  useEffect(() => {
    async function load() {
      const data = await fetchDetectiveRounds()
      setRounds(data)
      setSelectedSlug((prev) => prev ?? data[0]?.slug ?? null)
    }
    load()
    const unsub = subscribeToDetectiveRounds(load)
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!round) return
    let cancelled = false
    fetchGuessProgress(round.id).then((p) => { if (!cancelled) setProgress(p) })
    return () => { cancelled = true }
  }, [round?.id, round?.phase])

  async function advance() {
    if (!round) return
    setBusy(true)
    if (round.status === 'locked') await startDetectiveRound(round.id)
    else if (round.phase === 'guessing_closed') await revealDetectiveRound(round.id)
    else {
      const idx = PHASE_FLOW.indexOf(round.phase)
      await setDetectivePhase(round.id, PHASE_FLOW[Math.min(idx + 1, PHASE_FLOW.length - 1)])
    }
    setBusy(false)
  }

  return (
    <div className="ef-anchor" id="detective">
      <StageRow
        num="04"
        color="purple"
        title="The Tribe Detective"
        desc="Play. Think the person. Five rounds. Five abilities?"
        sideNote="Same People. Different Stories"
        sideIcon="🔍"
      >
        <div className="efb-card-head">🕵️ Select Round</div>
        <div className="efb-card-body">
          <div className="efb-grid-mini">
            {rounds.map((r) => (
              <div
                key={r.slug}
                onClick={() => setSelectedSlug(r.slug)}
                className={`efb-chip ${r.slug === selectedSlug ? 'efb-chip-active' : ''}`}
                style={r.slug === selectedSlug ? { background: '#00FFD1' } : undefined}
              >
                {r.icon} {r.name}
              </div>
            ))}
            {rounds.length === 0 && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Loading rounds…</span>}
          </div>
        </div>
        <div className="efb-card-foot">
          <button className="efb-btn-play purple" onClick={() => setOpen((v) => !v)}>🎩 Open Control</button>
        </div>

        {open && round && (
          <div className="efb-detail">
            <p className="efb-round-label">{round.name} — Status: {round.status} · Phase: {round.phase} · Guesses: {progress.submitted}/{progress.expected}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              <button className="ef-btn ef-btn-primary" disabled={busy || round.phase === 'revealed'} onClick={advance}>
                {round.status === 'locked' ? 'Start Round →' : round.phase === 'scenario' ? 'Open Guessing' : round.phase === 'guessing_open' ? 'Close Guessing' : round.phase === 'guessing_closed' ? 'Reveal & Award' : 'Revealed'}
              </button>
              <button className="ef-btn ef-btn-danger" disabled={busy} onClick={() => resetDetectiveRound(round.id)}>Reset Round</button>
              <Link href="/event-control/detective" target="_blank" className="ef-btn">Role Assignment Console →</Link>
            </div>
          </div>
        )}
      </StageRow>
    </div>
  )
}
