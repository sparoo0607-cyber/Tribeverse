'use client'

import { useState } from 'react'
import StageRow from './StageRow'

const SLIDES = [
  { badge: 'FRESHERS EDITION', title: 'TRIBEVERSE V1', body: 'ONE TEAM. FIVE PEOPLE. FIVE EXPERIENCES.' },
  { badge: 'WELCOME', title: 'Every Great Story Has A Beginning', body: '100 freshers stepping into something larger than themselves. Today is the day your tribe is born.' },
  { badge: 'GUEST INTRODUCTION', title: 'Chief Guest', body: 'Introduce the guest of honor — name, designation, organization.' },
  { badge: 'STUDENT TRIBE INTRODUCTION', title: 'Who We Are', body: 'A quick word on Student Tribe before the journey begins.' },
  { badge: 'EVENT OPENING', title: 'TRIBEVERSE Launch', body: 'Introduction → Tribe Intro → Team Reveal → Interactive Opening → Launch.' },
]

export default function InaugurationSection() {
  const [open, setOpen] = useState(false)
  const [slide, setSlide] = useState(0)
  const s = SLIDES[slide]

  return (
    <div className="ef-anchor" id="inauguration">
      <StageRow
        num="01"
        color="pink"
        title="Inauguration"
        desc="Welcome to TRIBEVERSE. The beginning of the journey."
        sideNote="A New Chapter Begins"
      >
        <div className="efb-card-head">🖥️ Event Control</div>
        <div className="efb-card-body">
          <div className="efb-slide-preview">
            <button className="efb-slide-arrow" onClick={() => setSlide((i) => Math.max(0, i - 1))} disabled={slide === 0}>←</button>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div className="efb-slide-meta">Slide {slide + 1} of {SLIDES.length}</div>
              <div className="efb-slide-title">{s.title}</div>
            </div>
            <button className="efb-slide-arrow" onClick={() => setSlide((i) => Math.min(SLIDES.length - 1, i + 1))} disabled={slide === SLIDES.length - 1}>→</button>
          </div>
        </div>
        <div className="efb-card-foot">
          <button className="efb-btn-play pink" onClick={() => setOpen((v) => !v)}>▶ Play</button>
          <button className="efb-btn-full" onClick={() => setOpen((v) => !v)}>{open ? 'Close Full Control' : 'Open Full Control'}</button>
        </div>

        {open && (
          <div className="efb-detail" style={{ textAlign: 'center' }}>
            <span className="hb-pill hb-pill-lime" style={{ display: 'inline-block', marginBottom: '0.9rem' }}>{s.badge}</span>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem' }}>{s.body}</p>
          </div>
        )}
      </StageRow>
    </div>
  )
}
