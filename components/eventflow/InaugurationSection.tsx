'use client'

import { useState } from 'react'

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
    <section className="section inaug-sec ef-anchor" id="inauguration">
      <div className="section-inner">
        <div className="sec-num" aria-hidden="true">01</div>
        <div className="inaug-layout">
          <div className="inaug-text">
            <h2 className="sec-title lime-t">INAUGURATION</h2>
            <p className="inaug-desc">Every great story has a beginning. TRIBEVERSE begins with a declaration — 100 freshers stepping into something larger than themselves. Today is the day your tribe is born.</p>
            <div className="inaug-details">
              <div className="idetail"><span className="ilabel">PHASE</span><span className="ival">Stage 01 · Launch</span></div>
              <div className="idetail"><span className="ilabel">FORMAT</span><span className="ival">Opening Ceremony</span></div>
              <div className="idetail"><span className="ilabel">TEAMS</span><span className="ival">All 20 Present</span></div>
            </div>
            <button onClick={() => setOpen((v) => !v)} className={`ef-open-btn ${open ? 'ef-active' : ''}`} style={{ marginTop: '2rem' }}>
              {open ? '✕ Close Control' : '▶ Run Inauguration'}
            </button>
          </div>
          <div className="inaug-emblem">
            <div className="emb-ring er1"></div>
            <div className="emb-ring er2"></div>
            <div className="emb-ring er3"></div>
            <div className="emb-center">
              <span className="emb-st">st.</span>
              <span className="emb-lbl">Student Tribe</span>
            </div>
          </div>
        </div>

        {open && (
          <div className="ef-panel">
            <p className="ef-panel-label">Slide {slide + 1} / {SLIDES.length}</p>
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <span className="hb-pill hb-pill-lime" style={{ display: 'inline-block', marginBottom: '1.25rem' }}>{s.badge}</span>
              <h3 className="bubble-title" style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', color: '#fff' }}>{s.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 560, margin: '1rem auto 0' }}>{s.body}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <button className="ef-btn" onClick={() => setSlide((i) => Math.max(0, i - 1))} disabled={slide === 0}>← Previous</button>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', fontSize: '0.75rem' }}>
                {SLIDES.map((_, i) => (i === slide ? '●' : '○')).join(' ')}
              </span>
              <button className="ef-btn ef-btn-primary" onClick={() => setSlide((i) => Math.min(SLIDES.length - 1, i + 1))} disabled={slide === SLIDES.length - 1}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
