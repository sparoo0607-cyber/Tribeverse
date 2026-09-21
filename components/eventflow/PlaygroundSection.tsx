'use client'

import { useState } from 'react'
import Link from 'next/link'
import { setStageStatus } from '@/lib/stageStore'

const ROUNDS = [
  { icon: '👀', name: 'QUICK EYES', desc: 'Spot it before anyone else.', live: true },
  { icon: '🎨', name: 'QUICK DRAW', desc: 'Sketch it fast. Make your team guess it.', live: false },
  { icon: '🧠', name: 'THINK FAST', desc: 'No time to overthink.', live: false },
  { icon: '🎧', name: 'SOUND CHECK', desc: 'Listen. Identify. Win.', live: false },
  { icon: '⚡', name: 'REACTION GAME', desc: 'Pure instinct. Zero hesitation.', live: false },
]

export default function PlaygroundSection({ status }: { status: string }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function change(next: 'locked' | 'live' | 'completed') {
    setBusy(true)
    await setStageStatus('playground', next)
    setBusy(false)
  }

  return (
    <section className="section playground-sec ef-anchor" id="playground">
      <div className="pg-wavy-top"></div>
      <div className="section-inner">
        <div className="sec-num light-num" aria-hidden="true">03</div>
        <div className="sec-header">
          <h2 className="sec-title white-t">TRIBE PLAYGROUND</h2>
          <p className="sec-sub light-sub">5 Rounds · 5 Members · 5 Different Abilities</p>
        </div>
        <div className="rounds-grid">
          {ROUNDS.map((r) => (
            <div key={r.name} className="round-card">
              <div className="ricon">{r.icon}</div>
              <h3 className="rname">{r.name}</h3>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <button onClick={() => setOpen((v) => !v)} className={`ef-open-btn ${open ? 'ef-active' : ''}`}>
            {open ? '✕ Close Control' : '▶ Open Control'}
          </button>
        </div>

        {open && (
          <div className="ef-panel">
            <p className="ef-panel-label">Stage Status: {status}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button className={`ef-btn ${status === 'locked' ? 'ef-btn-danger' : ''}`} disabled={busy} onClick={() => change('locked')}>Lock Stage</button>
              <button className={`ef-btn ${status === 'live' ? 'ef-btn-live' : ''}`} disabled={busy} onClick={() => change('live')}>Go Live</button>
              <button className={`ef-btn ${status === 'completed' ? 'ef-btn-primary' : ''}`} disabled={busy} onClick={() => change('completed')}>Mark Complete</button>
            </div>
            <p className="ef-panel-label">Per-Round Controllers</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Link href="/event-control/playground/quick-eyes" target="_blank" className="ef-btn ef-btn-primary">Quick Eyes Console →</Link>
              {ROUNDS.filter((r) => !r.live).map((r) => (
                <span key={r.name} className="ef-btn" style={{ opacity: 0.35, cursor: 'not-allowed' }}>{r.name} (soon)</span>
              ))}
            </div>
          </div>
        )}

        <p className="pg-quote">&quot;One playground. Five ways to prove yourself.&quot;</p>
      </div>
      <div className="pg-wavy-bottom"></div>
    </section>
  )
}
