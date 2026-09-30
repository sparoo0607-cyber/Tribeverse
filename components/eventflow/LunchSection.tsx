'use client'

import { useState } from 'react'
import StageRow from './StageRow'
import { setStageStatus } from '@/lib/stageStore'
import Icon from '@/components/icons/Icon'

export default function LunchSection({ status }: { status: string }) {
  const [busy, setBusy] = useState(false)

  async function toggle() {
    setBusy(true)
    await setStageStatus('lunch', status === 'live' ? 'completed' : 'live')
    setBusy(false)
  }

  return (
    <div className="ef-anchor" id="lunch">
      <StageRow
        num="05"
        color="orange"
        title="Lunch Break"
        desc="12:00 – 1:00 PM · Break for lunch, relaxation and informal interaction among participants."
        sideNote="Recharge. Connect. Good Food"
        sideIcon={<Icon name="pizza" />}
      >
        <div className="efb-card-head"><Icon name="coffee" /> Break Time</div>
        <div className="efb-card-body" style={{ textAlign: 'center', padding: '0.75rem 0' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>Good food. Better conversations.</p>
        </div>
        <div className="efb-card-foot" style={{ justifyContent: 'center' }}>
          <button className="efb-btn-play orange" disabled={busy} onClick={toggle}>
            {status === 'live' ? <><Icon name="pause" /> Continue Event</> : <><Icon name="play" /> Start Break</>}
          </button>
        </div>
      </StageRow>
    </div>
  )
}
