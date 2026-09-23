'use client'

import { JOURNEY } from './types'

export default function Journey({ stageStatuses }: { stageStatuses: Record<string, string> }) {
  const row1 = JOURNEY.slice(0, 4)
  const row2 = JOURNEY.slice(4, 8)

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
      <p className="ef-journey-grid-title">The Journey — From Strangers To A Tribe</p>
      <div className="ef-journey-rows">
        {renderRow(row1)}
        {renderRow(row2)}
      </div>
    </section>
  )
}
