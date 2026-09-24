'use client'

import { useState } from 'react'
import Link from 'next/link'
import StageRow from './StageRow'
import { setStageStatus } from '@/lib/stageStore'
import Icon from '@/components/icons/Icon'

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
    <div className="ef-anchor" id="reveal">
      <StageRow
        num="08"
        color="dark"
        title="Tribeverse Reveal"
        desc="You came as strangers. Now you leave as a tribe."
        sideNote="Same Tribe. Bigger World"
        sideIcon={<Icon name="rocket" />}
      >
        <div className="efb-card-head"><Icon name="clapperboard" /> Final Sequence</div>
        <div className="efb-card-body">
          <div className="efb-slide-preview">
            <button className="efb-slide-arrow" onClick={() => setRevealedCount((c) => Math.max(1, c - 1))} disabled={revealedCount === 1}>←</button>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div className="efb-slide-meta">Slide {revealedCount} of {LINES.length}</div>
              <div className="efb-slide-title">{LINES[revealedCount - 1]}</div>
            </div>
            <button className="efb-slide-arrow" onClick={() => setRevealedCount((c) => Math.min(LINES.length, c + 1))} disabled={revealedCount === LINES.length}>→</button>
          </div>
        </div>
        <div className="efb-card-foot">
          <button className="efb-btn-play dark" onClick={() => setOpen((v) => !v)}><Icon name="play" /> Play Sequence</button>
          <button className="efb-btn-full" onClick={() => setOpen((v) => !v)}>{open ? 'Close Full Control' : 'Open Full Control'}</button>
        </div>

        {open && (
          <div className="efb-detail">
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button className="ef-btn ef-btn-live" disabled={busy || status === 'completed'} onClick={activateFinal}>Activate Final Reveal</button>
              <Link href="/admin/scores" target="_blank" className="ef-btn">View Final Leaderboard →</Link>
            </div>
            {status === 'completed' && (
              <p style={{ marginTop: '1rem', color: 'var(--lime)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                WELCOME TO TRIBEVERSE. YOUR JOURNEY STARTS HERE.
              </p>
            )}
          </div>
        )}
      </StageRow>
    </div>
  )
}
