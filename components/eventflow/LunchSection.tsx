'use client'

import { useState } from 'react'
import { setStageStatus } from '@/lib/stageStore'

export default function LunchSection({ status }: { status: string }) {
  const [busy, setBusy] = useState(false)

  async function toggle() {
    setBusy(true)
    await setStageStatus('lunch', status === 'live' ? 'completed' : 'live')
    setBusy(false)
  }

  return (
    <section className="section lunch-sec ef-anchor" id="lunch">
      <div className="lunch-inner">
        <div className="lunch-content">
          <div className="lunch-emoji">🍕</div>
          <h2 className="lunch-title">LUNCH / FREE TRIBE TIME</h2>
          <p className="lunch-time">EAT. TALK. MEET SOMEONE NEW.</p>
          <p className="lunch-vibe">Your tribe isn&apos;t just the people you came with.</p>
          <div className="lunch-dots-row"><span></span><span></span><span></span><span></span><span></span></div>

          <button
            onClick={toggle}
            disabled={busy}
            style={{ marginTop: '2rem', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 32px', borderRadius: 100, border: '2px solid #000', cursor: 'pointer', background: status === 'live' ? '#000' : 'transparent', color: status === 'live' ? '#FFE600' : '#000' }}
          >
            {status === 'live' ? 'Continue Event →' : 'Open Break'}
          </button>
        </div>
      </div>
    </section>
  )
}
