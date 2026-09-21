'use client'

import Link from 'next/link'

export default function TopNav({ eventLive }: { eventLive: boolean }) {
  return (
    <div className="ef-topnav">
      <div className="ef-topnav-inner">
        <div className="ef-topnav-logo">
          <span className="ef-topnav-st">st.</span>
          <span className="ef-topnav-label">TRIBEVERSE V1</span>
        </div>
        <div className="ef-topnav-center">EVENT FLOW</div>
        <div className="ef-topnav-right">
          <span className="ef-live-pill">
            <span className="ef-live-dot" />
            {eventLive ? 'LIVE' : 'STANDBY'}
          </span>
          <Link href="/admin" className="ef-exit-btn">EXIT</Link>
        </div>
      </div>
    </div>
  )
}
