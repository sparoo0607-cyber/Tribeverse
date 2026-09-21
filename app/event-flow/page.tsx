'use client'

import { useEffect, useState } from 'react'
import '../landing.css'
import './event-flow.css'
import { fetchStageStates, subscribeToStageChanges } from '@/lib/stageStore'
import { createClient } from '@/lib/supabase/client'
import TopNav from '@/components/eventflow/TopNav'
import Journey from '@/components/eventflow/Journey'
import InaugurationSection from '@/components/eventflow/InaugurationSection'
import BriefsSection from '@/components/eventflow/BriefsSection'
import PlaygroundSection from '@/components/eventflow/PlaygroundSection'
import DetectiveSection from '@/components/eventflow/DetectiveSection'
import LunchSection from '@/components/eventflow/LunchSection'
import JamSection from '@/components/eventflow/JamSection'
import WallSection from '@/components/eventflow/WallSection'
import RevealSection from '@/components/eventflow/RevealSection'

export default function EventFlowPage() {
  const [stageStatuses, setStageStatuses] = useState<Record<string, string>>({})
  const [eventLive, setEventLive] = useState(false)

  useEffect(() => {
    async function loadStages() {
      const stages = await fetchStageStates()
      setStageStatuses(Object.fromEntries(Object.entries(stages).map(([slug, s]) => [slug, s.status])))
    }
    loadStages()
    const unsub = subscribeToStageChanges(loadStages)

    async function loadEvent() {
      const supabase = createClient()
      const { data } = await supabase.from('events').select('status').order('created_at').limit(1).maybeSingle()
      setEventLive(data?.status === 'live')
    }
    loadEvent()

    return () => unsub()
  }, [])

  return (
    <div className="landing-body">
      <TopNav eventLive={eventLive} />

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-bg-grid"></div>
        <div className="hero-sparkles">
          <span className="sparkle s1"></span><span className="sparkle s2"></span>
          <span className="sparkle s3"></span><span className="sparkle s4"></span>
          <span className="sparkle s5"></span><span className="sparkle s6"></span>
          <span className="sparkle s7"></span><span className="sparkle s8"></span>
        </div>
        <div className="hero-wavy-deco top-deco"></div>
        <div className="hero-inner">
          <div className="hero-badge">EVENT OPERATING SCREEN</div>
          <p className="hero-org">TRIBEVERSE V1</p>
          <h1 className="hero-title">
            <span className="ht-tribe">THE EVENT</span>
            <span className="ht-verse">FLOW</span>
          </h1>
          <p className="hero-tagline">ONE TRIBE.<br/>ONE EXPERIENCE.<br/>ONE JOURNEY.</p>
          <div className="hero-stats">
            <div className="hero-stat"><span className="stat-num">100</span><span className="stat-label">Participants</span></div>
            <span className="stat-dot">·</span>
            <div className="hero-stat"><span className="stat-num">20</span><span className="stat-label">Teams</span></div>
            <span className="stat-dot">·</span>
            <div className="hero-stat"><span className="stat-num">5</span><span className="stat-label">Members</span></div>
          </div>
          <div className="hero-actions">
            <a href="#journey" className="hero-cta-secondary">Begin The Journey ↓</a>
          </div>
        </div>
        <div className="hero-wavy-deco bottom-deco"></div>
      </section>

      <Journey stageStatuses={stageStatuses} />

      <InaugurationSection />
      <BriefsSection />
      <PlaygroundSection status={stageStatuses.playground ?? 'locked'} />
      <DetectiveSection />
      <LunchSection status={stageStatuses.lunch ?? 'locked'} />
      <JamSection />
      <WallSection />
      <RevealSection status={stageStatuses.reveal ?? 'locked'} />

      <footer className="footer">
        <div className="footer-wavy"></div>
        <div className="footer-inner">
          <div className="footer-logo">
            <span className="fl-st">st.</span>
            <span className="fl-txt">Student Tribe</span>
          </div>
          <p className="footer-tag">Event Operating Screen — TRIBEVERSE V1</p>
        </div>
      </footer>
    </div>
  )
}
