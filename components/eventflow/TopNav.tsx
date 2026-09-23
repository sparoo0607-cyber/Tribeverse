'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TopNav({ eventLive }: { eventLive: boolean }) {
  const pathname = usePathname()

  return (
    <div className="ef-topnav">
      <div className="ef-topnav-inner">
        <div className="ef-topnav-logo">
          <span className="ef-topnav-st">st.</span>
          <span className="ef-topnav-label">TRIBEVERSE V1</span>
        </div>
        <div className="ef-topnav-tabs">
          <span className={`ef-tab ${pathname === '/event-flow' ? 'ef-tab-active' : ''}`}>Event Flow</span>
          <Link href="/display" target="_blank" className="ef-tab">Live Display</Link>
          <Link href="/admin" className="ef-tab">Settings</Link>
        </div>
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
