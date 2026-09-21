'use client'

import { JOURNEY } from './types'

export default function Journey({ stageStatuses }: { stageStatuses: Record<string, string> }) {
  return (
    <section className="ef-journey-sec ef-anchor" id="journey">
      <div className="ef-journey-inner">
        <p className="ef-journey-title">The Journey</p>
        <div className="ef-journey-list">
          {JOURNEY.map((stage) => {
            const status = stage.slug ? stageStatuses[stage.slug] : null
            const isLive = status === 'live'
            const isDone = status === 'completed'
            return (
              <a
                key={stage.anchor}
                href={`#${stage.anchor}`}
                className={`ef-journey-item ${isLive ? 'ef-live' : ''} ${isDone ? 'ef-done' : ''}`}
              >
                <span className="ef-journey-num">{stage.num}</span>
                <span className="ef-journey-name">{stage.name}</span>
                {status && (
                  <span className="ef-journey-status">{isLive ? '● Live' : isDone ? 'Done' : 'Locked'}</span>
                )}
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
