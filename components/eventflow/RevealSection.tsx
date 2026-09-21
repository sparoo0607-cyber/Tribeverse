'use client'

import { useState } from 'react'
import Link from 'next/link'
import { setStageStatus } from '@/lib/stageStore'

const LINES = [
  'YOU CAME AS STRANGERS.',
  'YOU PLAYED TOGETHER.',
  'YOU DISCOVERED EACH OTHER.',
  'YOU CHALLENGED YOURSELF.',
  'YOU LAUGHED.',
  'YOU LEARNED.',
  'AND SOMEWHERE ALONG THE WAY...',
  'YOU FOUND YOUR TRIBE.',
]

export default function RevealSection({ status }: { status: string }) {
  const [open, setOpen] = useState(false)
  const [revealedCount, setRevealedCount] = useState(1)
  const [busy, setBusy] = useState(false)

  async function activateFinal() {
    setBusy(true)
    await setStageStatus('reveal', 'completed')
    setBusy(false)
  }

  return (
    <section className="section reveal-final ef-anchor" id="reveal">
      <div className="rf-bg"></div>
      <div className="section-inner rf-inner">
        <div className="sec-num light-num" aria-hidden="true">08</div>
        <div className="rf-header">
          <span className="rf-label">TRIBEVERSE REVEAL</span>
        </div>
        <div className="rf-lines">
          {LINES.slice(0, open ? revealedCount : LINES.length).map((line, i) => (
            <p key={i} className={`rf-line ${i === LINES.length - 1 ? 'rf-highlight' : ''}`}>{line}</p>
          ))}
        </div>

        {status === 'completed' && (
          <>
            <div className="rf-divider"></div>
            <div className="rf-welcome show">
              <h2 className="rf-welcome-title">WELCOME TO TRIBEVERSE.</h2>
              <p className="rf-welcome-sub">YOUR JOURNEY STARTS HERE.</p>
              <div className="rf-logo">
                <span className="rfl-st">st.</span>
                <span className="rfl-txt">Student Tribe</span>
              </div>
            </div>
          </>
        )}

        <div style={{ marginTop: '3rem' }}>
          <button onClick={() => setOpen((v) => !v)} className={`ef-open-btn ${open ? 'ef-active' : ''}`}>
            {open ? '✕ Close Control' : '▶ Run Cinematic Reveal'}
          </button>
        </div>

        {open && (
          <div className="ef-panel" style={{ textAlign: 'left', maxWidth: 480, marginInline: 'auto' }}>
            <p className="ef-panel-label">Line {revealedCount} / {LINES.length}</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="ef-btn" onClick={() => setRevealedCount((c) => Math.max(1, c - 1))} disabled={revealedCount === 1}>← Back</button>
              <button className="ef-btn ef-btn-primary" onClick={() => setRevealedCount((c) => Math.min(LINES.length, c + 1))} disabled={revealedCount === LINES.length}>Next Line →</button>
              <button className="ef-btn ef-btn-live" disabled={busy || status === 'completed'} onClick={activateFinal}>Activate Final Reveal</button>
              <Link href="/admin/scores" target="_blank" className="ef-btn">View Final Leaderboard →</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
