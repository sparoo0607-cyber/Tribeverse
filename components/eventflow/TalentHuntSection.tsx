'use client'

import { useState } from 'react'
import StageRow from './StageRow'
import { setStageStatus } from '@/lib/stageStore'
import Icon from '@/components/icons/Icon'

const TALENT_CATEGORIES = [
  { name: 'Vocals & Singing', icon: 'mic', count: 6 },
  { name: 'Dance & Movement', icon: 'bolt', count: 4 },
  { name: 'Beatbox & Rap', icon: 'headphones', count: 3 },
  { name: 'Stand-up & Mimicry', icon: 'smiley', count: 2 },
  { name: 'Instrumental', icon: 'piano', count: 4 },
  { name: 'Creative Arts', icon: 'palette', count: 3 },
]

export default function TalentHuntSection({ status }: { status?: string }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [vibeScore, setVibeScore] = useState(88)

  async function change(next: 'locked' | 'live' | 'completed') {
    setBusy(true)
    await setStageStatus('talent-hunt', next)
    setBusy(false)
  }

  return (
    <div className="ef-anchor" id="talent-hunt">
      <StageRow
        num="03"
        color="purple"
        title="Talent Hunt"
        desc="10:30 – 11:00 AM · Open platform for students to showcase their talents, raw passion and creative skills."
        sideNote="Unfiltered Passion. Real Talent"
        sideIcon={<Icon name="sparkle" />}
      >
        <div className="efb-card-head"><Icon name="mic" /> Showcase Categories & Spotlight</div>
        <div className="efb-card-body">
          <div className="efb-grid-mini">
            {TALENT_CATEGORIES.map((cat) => (
              <div key={cat.name} className="efb-chip">
                {cat.name}
              </div>
            ))}
          </div>
        </div>
        <div className="efb-card-foot">
          <button className="efb-btn-play purple" onClick={() => setOpen((v) => !v)}>
            <Icon name="sparkle" /> Open Stage Console
          </button>
          <button className="efb-btn-full" onClick={() => setOpen((v) => !v)}>
            {open ? 'Close Control' : 'Stage Management'}
          </button>
        </div>

        {open && (
          <div className="efb-detail">
            <p className="efb-round-label">Talent Hunt Stage Status: {status || 'locked'}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
              <button className={`ef-btn ${status === 'locked' ? 'ef-btn-danger' : ''}`} disabled={busy} onClick={() => change('locked')}>Lock Stage</button>
              <button className={`ef-btn ${status === 'live' ? 'ef-btn-live' : ''}`} disabled={busy} onClick={() => change('live')}>Go Live (Spotlight On)</button>
              <button className={`ef-btn ${status === 'completed' ? 'ef-btn-primary' : ''}`} disabled={busy} onClick={() => change('completed')}>Conclude Showcase</button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '0.8rem', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="efb-round-label" style={{ margin: 0 }}>Audience Cheer / Vibe Meter</span>
                <span style={{ color: 'var(--cyan)', fontWeight: 900, fontFamily: 'var(--font-display)' }}>{vibeScore}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={vibeScore}
                onChange={(e) => setVibeScore(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--cyan)' }}
              />
            </div>
          </div>
        )}
      </StageRow>
    </div>
  )
}
