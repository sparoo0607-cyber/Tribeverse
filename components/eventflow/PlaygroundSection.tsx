'use client'

import { useState } from 'react'
import Link from 'next/link'
import StageRow from './StageRow'
import { setStageStatus } from '@/lib/stageStore'

const ROUNDS = [
  { icon: '👀', name: 'Quick Eyes', sub: 'Observation', live: true },
  { icon: '🎨', name: 'Quick Draw', sub: 'Creativity', live: false },
  { icon: '🧠', name: 'Think Fast', sub: 'Logic', live: false },
  { icon: '🎧', name: 'Sound Check', sub: 'Listening', live: false },
  { icon: '⚡', name: 'Reaction Game', sub: 'Reflex', live: false },
]

export default function PlaygroundSection({ status }: { status: string }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [selected, setSelected] = useState(0)

  async function change(next: 'locked' | 'live' | 'completed') {
    setBusy(true)
    await setStageStatus('playground', next)
    setBusy(false)
  }

  return (
    <div className="ef-anchor" id="playground">
      <StageRow
        num="03"
        color="yellow"
        title="Tribe Playground"
        desc="Play. Think. Create. React. Five rounds. Five abilities."
        sideNote="Play. Learn. Connect"
        sideIcon="🙂"
      >
        <div className="efb-card-head">🎮 Select Round</div>
        <div className="efb-card-body">
          <div className="efb-grid-mini">
            {ROUNDS.map((r, i) => (
              <div
                key={r.name}
                onClick={() => setSelected(i)}
                className={`efb-chip ${selected === i ? 'efb-chip-active' : ''}`}
                style={selected === i ? { background: '#FFE600' } : undefined}
              >
                {r.icon} {r.name}<br /><span style={{ opacity: 0.6, fontWeight: 600 }}>{r.sub}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="efb-card-foot">
          <button className="efb-btn-play yellow" onClick={() => setOpen((v) => !v)}>🎮 Open Control</button>
        </div>

        {open && (
          <div className="efb-detail">
            <p className="efb-round-label">Stage Status: {status}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
              <button className={`ef-btn ${status === 'locked' ? 'ef-btn-danger' : ''}`} disabled={busy} onClick={() => change('locked')}>Lock Stage</button>
              <button className={`ef-btn ${status === 'live' ? 'ef-btn-live' : ''}`} disabled={busy} onClick={() => change('live')}>Go Live</button>
              <button className={`ef-btn ${status === 'completed' ? 'ef-btn-primary' : ''}`} disabled={busy} onClick={() => change('completed')}>Mark Complete</button>
            </div>
            <p className="efb-round-label">Per-Round Controllers</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              <Link href="/event-control/playground/quick-eyes" target="_blank" className="ef-btn ef-btn-primary">Quick Eyes Console →</Link>
              {ROUNDS.filter((r) => !r.live).map((r) => (
                <span key={r.name} className="ef-btn" style={{ opacity: 0.35, cursor: 'not-allowed' }}>{r.name} (soon)</span>
              ))}
            </div>
          </div>
        )}
      </StageRow>
    </div>
  )
}
