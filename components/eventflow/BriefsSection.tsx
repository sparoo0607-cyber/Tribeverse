'use client'

import { useState } from 'react'

const DIVISIONS = [
  { n: '1', name: 'CAREERS', color: 'hb-pill-yellow', desc: 'ST School skill development, upskilling, mentorship.' },
  { n: '2', name: 'COMMERCE', color: 'hb-pill-cyan', desc: 'Swiggy, Uber, Duolingo, SBI brand collaborations.' },
  { n: '3', name: 'COMMUNITY', color: 'hb-pill-lime', desc: 'Campus chapters, regional teams, active engagement.' },
  { n: '4', name: 'CONTENT', color: 'hb-pill-purple', desc: 'Media decks, viral reels, articles & movie marketing.' },
  { n: '5', name: 'CARE', color: 'hb-pill-cyan', desc: 'Mental health, well-being sessions, safe listener spaces.' },
  { n: '6', name: 'CLOTHING', color: 'hb-pill-yellow', desc: 'Beast collections, graphic streetwear & design platform.' },
]

const SLIDES = [
  { image: '/handbook/handbook-01-cover.png', title: 'THE STUDENT TRIBE ECOSYSTEM', body: 'Structure. Purpose. Teamwork.' },
  { image: '/handbook/handbook-02-mission-careers.png', title: 'MISSION & CAREERS', body: 'Skill development, upskilling, mentorship.' },
  { image: '/handbook/handbook-03-commerce-community.png', title: 'COMMERCE & COMMUNITY', body: 'Brand collabs, campus chapters, regional teams.' },
  { image: '/handbook/handbook-04-content-care.png', title: 'CONTENT & CARE', body: 'Media, storytelling, mental well-being.' },
  { image: '/handbook/handbook-05-clothing-culture.png', title: 'CLOTHING & CULTURE', body: 'Streetwear, design, workplace vibe.' },
]

export default function BriefsSection() {
  const [open, setOpen] = useState(false)
  const [slide, setSlide] = useState(0)
  const s = SLIDES[slide]

  return (
    <section className="section ef-anchor" id="briefs" style={{ background: 'var(--blue)', position: 'relative', overflow: 'hidden' }}>
      <div className="pg-wavy-top"></div>
      <div className="section-inner">
        <div className="sec-num light-num" aria-hidden="true">02</div>
        <div className="sec-header" style={{ textAlign: 'center' }}>
          <h2 className="sec-title white-t">STUDENT TRIBE BRIEFS</h2>
          <p className="sec-sub light-sub">MEET THE TRIBE. UNDERSTAND THE TRIBE. BECOME PART OF THE TRIBE.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem', position: 'relative', zIndex: 2 }}>
          {DIVISIONS.map((d) => (
            <div key={d.n} className={`hb-pill ${d.color}`}>
              <span className="hb-num-badge" style={{ fontSize: '1.8rem', WebkitTextStroke: '2px #000' }}>{d.n}</span>
              <div style={{ marginTop: 6 }}>{d.name}</div>
              <p style={{ fontWeight: 500, fontSize: '0.78rem', marginTop: 4, WebkitTextStroke: 0 }}>{d.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <button onClick={() => setOpen((v) => !v)} className={`ef-open-btn ${open ? 'ef-active' : ''}`}>
            {open ? '✕ Close Control' : '▶ Present Tribe Briefs'}
          </button>
        </div>

        {open && (
          <div className="ef-panel">
            <p className="ef-panel-label">Slide {slide + 1} / {SLIDES.length}</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
              <div className="polaroid-card" style={{ maxWidth: 420, transform: 'rotate(-1deg)' }}>
                <img src={s.image} alt={s.title} style={{ width: '100%', borderRadius: 2, display: 'block' }} />
              </div>
              <h3 className="bubble-title" style={{ fontSize: 'clamp(1.3rem, 3vw, 2rem)', color: '#fff' }}>{s.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)' }}>{s.body}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="ef-btn" onClick={() => setSlide((i) => Math.max(0, i - 1))} disabled={slide === 0}>← Previous</button>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)', fontSize: '0.75rem' }}>SLIDE {slide + 1} / {SLIDES.length}</span>
              <button className="ef-btn ef-btn-primary" onClick={() => setSlide((i) => Math.min(SLIDES.length - 1, i + 1))} disabled={slide === SLIDES.length - 1}>Next →</button>
            </div>
          </div>
        )}
      </div>
      <div className="pg-wavy-bottom"></div>
    </section>
  )
}
