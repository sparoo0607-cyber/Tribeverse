'use client'

import { useState } from 'react'
import Link from 'next/link'
import StageRow from './StageRow'
import { setStageStatus } from '@/lib/stageStore'
import Icon from '@/components/icons/Icon'

export default function PlaygroundContinuousSection({ status }: { status?: string }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function change(next: 'locked' | 'live' | 'completed') {
    setBusy(true)
    await setStageStatus('playground-continuous', next)
    setBusy(false)
  }

  return (
    <div className="ef-anchor" id="playground-continuous">
      <StageRow
        num="06"
        color="green"
        title="Tribe Playground (Cont.)"
        desc="1:00 – 2:00 PM · Continuation of Playground activities and completion of remaining participation & challenges."
        sideNote="High Energy. Tribe Victory"
        sideIcon={<Icon name="trophy" />}
      >
        <div className="efb-card-head"><Icon name="trophy" /> Final Rounds & Wrap-up</div>
        <div className="efb-card-body">
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>
            Completing team ability rounds, final score tally, and bonus lightning rounds.
          </p>
        </div>
        <div className="efb-card-foot">
          <button className="efb-btn-play green" onClick={() => setOpen((v) => !v)}>
            <Icon name="play" /> Control Section
          </button>
          <button className="efb-btn-full" onClick={() => setOpen((v) => !v)}>
            {open ? 'Close' : 'View Scoring'}
          </button>
        </div>

        {open && (
          <div className="efb-detail">
            <p className="efb-round-label">Playground Continuous Status: {status || 'locked'}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
              <button className={`ef-btn ${status === 'locked' ? 'ef-btn-danger' : ''}`} disabled={busy} onClick={() => change('locked')}>Lock Stage</button>
              <button className={`ef-btn ${status === 'live' ? 'ef-btn-live' : ''}`} disabled={busy} onClick={() => change('live')}>Resume Live</button>
              <button className={`ef-btn ${status === 'completed' ? 'ef-btn-primary' : ''}`} disabled={busy} onClick={() => change('completed')}>Complete Playground</button>
            </div>
            <Link href="/admin/scores" target="_blank" className="ef-btn ef-btn-primary">
              Open Live Leaderboard Console →
            </Link>
          </div>
        )}
      </StageRow>
    </div>
  )
}
