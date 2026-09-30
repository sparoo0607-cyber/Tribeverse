'use client'

import { JOURNEY } from './types'

export default function Journey({ stageStatuses }: { stageStatuses: Record<string, string> }) {
  const row1 = JOURNEY.slice(0, 5)
  const row2 = JOURNEY.slice(5, 9)

  const renderRow = (stages: typeof JOURNEY) => (
    <div className="ef-journey-row">
      {stages.map((stage, i) => {
        const status = stage.slug ? stageStatuses[stage.slug] : null
        const isLive = status === 'live'
        const isDone = status === 'completed'
        return (
          <div key={stage.anchor} style={{ display: 'flex', alignItems: 'flex-start' }}>
            <a href={`#${stage.anchor}`} className={`ef-jnode ${isLive ? 'ef-live' : ''} ${isDone ? 'ef-done' : ''}`}>
              <span className={`ef-jnode-circle jc-${stage.color}`}>{stage.num}</span>
              <span className="ef-jnode-name">{stage.name}</span>
              <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.45)', fontWeight: 700 }}>{stage.time}</span>
              {status && <span className="ef-jnode-status">{isLive ? '● Live' : isDone ? 'Done' : 'Locked'}</span>}
            </a>
            {i < stages.length - 1 && <span className="ef-jarrow">→</span>}
          </div>
        )
      })}
    </div>
  )

  return (
    <section className="ef-journey-grid-sec ef-anchor" id="journey">
      <p className="ef-journey-grid-title">The Journey: 9:30 AM to 3:30 PM · From Strangers To A Tribe</p>
      <div className="ef-journey-rows">
        {renderRow(row1)}
        {renderRow(row2)}
      </div>
    </section>
  )
}
