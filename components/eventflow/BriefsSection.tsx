'use client'

import { useState } from 'react'
import StageRow from './StageRow'
import Icon from '@/components/icons/Icon'

const DIVISIONS = ['Content', 'Commerce', 'Community', 'Care', 'Clothing', 'Careers']

const SLIDES = [
  { image: '/handbook/handbook-01-cover.png', title: 'THE STUDENT TRIBE ECOSYSTEM', body: 'Structure. Purpose. Teamwork.' },
  { image: '/handbook/handbook-02-mission-careers.png', title: 'MISSION & CAREERS', body: 'Skill development, upskilling, mentorship.' },
  { image: '/handbook/handbook-03-commerce-community.png', title: 'COMMERCE & COMMUNITY', body: 'Brand collabs, campus chapters, regional teams.' },
  { image: '/handbook/handbook-04-content-care.png', title: 'CONTENT & CARE', body: 'Media, storytelling, mental well-being.' },
  { image: '/handbook/handbook-05-clothing-culture.png', title: 'CLOTHING & CULTURE', body: 'Streetwear, design, workplace vibe.' },
]

const CHIP_COLORS = ['#FF2D87', '#7B2FFF', '#FF6B1A', '#00C27A', '#FFE600', '#1A6FFF']

export default function BriefsSection() {
  const [open, setOpen] = useState(false)
  const [slide, setSlide] = useState(0)
  const s = SLIDES[slide]

  return (
    <div className="ef-anchor" id="briefs">
      <StageRow
        num="02"
        color="blue"
        title="Student Tribe Briefs"
        desc="Meet the tribe. Understand the tribe. Become part of the tribe."
        sideNote="Different People. Same Tribe"
      >
        <div className="efb-card-head"><Icon name="book" /> The 6 Divisions</div>
        <div className="efb-card-body">
          <div className="efb-grid-mini">
            {DIVISIONS.map((d, i) => (
              <div key={d} className="efb-chip" style={{ background: CHIP_COLORS[i] }}>{d}</div>
            ))}
          </div>
        </div>
        <div className="efb-card-foot">
          <button className="efb-btn-play blue" onClick={() => setOpen((v) => !v)}><Icon name="play" /> Play</button>
          <button className="efb-btn-full" onClick={() => setOpen((v) => !v)}>{open ? 'Close Full Control' : 'Open Full Control'}</button>
        </div>

        {open && (
          <div className="efb-detail" style={{ textAlign: 'center' }}>
            <div className="polaroid-card" style={{ maxWidth: 320, margin: '0 auto 0.8rem', transform: 'rotate(-1deg)' }}>
              <img src={s.image} alt={s.title} style={{ width: '100%', borderRadius: 2, display: 'block' }} />
            </div>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}>{s.title}</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', marginBottom: '0.8rem' }}>{s.body}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <button className="efb-slide-arrow" onClick={() => setSlide((i) => Math.max(0, i - 1))} disabled={slide === 0}>←</button>
              <span className="efb-slide-meta">Slide {slide + 1} / {SLIDES.length}</span>
              <button className="efb-slide-arrow" onClick={() => setSlide((i) => Math.min(SLIDES.length - 1, i + 1))} disabled={slide === SLIDES.length - 1}>→</button>
            </div>
          </div>
        )}
      </StageRow>
    </div>
  )
}
