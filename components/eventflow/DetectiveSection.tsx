'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
    if (!open) return
    async function load() {
      const data = await fetchDetectiveRounds()
      setRounds(data)
      setSelectedSlug((prev) => prev ?? data[0]?.slug ?? null)
    }
    load()
    const unsub = subscribeToDetectiveRounds(load)
    return () => unsub()
  }, [open])

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
    <section className="section detective-sec ef-anchor" id="detective">
      <div className="det-bg-dots"></div>
      <div className="section-inner">
        <div className="sec-num" aria-hidden="true">04</div>
        <div className="det-header">
          <div className="det-tape">CASE FILE: CLASSIFIED</div>
          <h2 className="sec-title det-t">THE TRIBE DETECTIVE</h2>
          <p className="det-sub">YOU KNOW THE PERSON. BUT DO YOU KNOW THE ROLE?</p>
        </div>
        <div className="det-content">
          <div className="case-file">
            <div className="cf-header">
              <span className="cf-id">5 ROUNDS</span>
              <span className="cf-status">● ACTIVE</span>
            </div>
            <div className="cf-body">
              {['Professions', 'Characters', 'Superpowers', 'Campus Roles', 'Wild Card'].map((r) => (
                <div key={r} className="clue"><span className="cl-icon">🕵️</span><div><strong>{r}</strong><p>Guess your teammates&apos; secret {r.toLowerCase()}.</p></div></div>
              ))}
            </div>
          </div>
          <blockquote className="det-quote">&quot;Every team has a detective.<br/>Today, yours will be tested.&quot;</blockquote>
        </div>

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, marginTop: '2.5rem' }}>
          <button onClick={() => setOpen((v) => !v)} className={`ef-open-btn ${open ? 'ef-active' : ''}`}>
            {open ? '✕ Close Control' : '▶ Open Control'}
          </button>
        </div>

        {open && (
          <div className="ef-panel">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {rounds.map((r) => (
                <button
                  key={r.slug}
                  onClick={() => setSelectedSlug(r.slug)}
                  className="ef-btn"
                  style={r.slug === selectedSlug ? { background: '#00FFD1', color: '#000', borderColor: '#00FFD1' } : undefined}
                >
                  {r.icon} {r.name}
                  <span style={{ marginLeft: 6, width: 6, height: 6, borderRadius: '50%', display: 'inline-block', background: r.status === 'live' ? '#00E68A' : r.status === 'completed' ? 'var(--lime)' : 'rgba(255,255,255,0.25)' }} />
                </button>
              ))}
            </div>

            {round && (
              <>
                <p className="ef-panel-label">{round.name} — Status: {round.status} · Phase: {round.phase} · Guesses: {progress.submitted}/{progress.expected}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <button className="ef-btn ef-btn-primary" disabled={busy || round.phase === 'revealed'} onClick={advance}>
                    {round.status === 'locked' ? 'Start Round →' : round.phase === 'scenario' ? 'Open Guessing' : round.phase === 'guessing_open' ? 'Close Guessing' : round.phase === 'guessing_closed' ? 'Reveal & Award' : 'Revealed'}
                  </button>
                  <button className="ef-btn ef-btn-danger" disabled={busy} onClick={() => resetDetectiveRound(round.id)}>Reset Round</button>
                  <Link href="/event-control/detective" target="_blank" className="ef-btn">Role Assignment Console →</Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
