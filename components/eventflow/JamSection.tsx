'use client'

import { useEffect, useState } from 'react'
import { fetchJamQueue, subscribeToJamQueue, startNext, pauseCurrent, removeFromQueue, JamEntry } from '@/lib/jam'

export default function JamSection() {
  const [open, setOpen] = useState(false)
  const [nowPlaying, setNowPlaying] = useState<JamEntry | null>(null)
  const [upNext, setUpNext] = useState<JamEntry[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    async function load() {
      const q = await fetchJamQueue()
      setNowPlaying(q.nowPlaying)
      setUpNext(q.upNext)
    }
    load()
    const unsub = subscribeToJamQueue(load)
    return () => unsub()
  }, [])

  async function handleNext() {
    setBusy(true)
    await startNext()
    setBusy(false)
  }

  return (
    <section className="section jam-sec ef-anchor" id="jam">
      <div className="jam-wavy-top"></div>
      <div className="section-inner">
        <div className="sec-num" aria-hidden="true">06</div>
        <div className="jam-header">
          <h2 className="sec-title jam-t">TRIBE JAM</h2>
          <p className="jam-sub">Music. Expression. Vibes. This is the beat of TRIBEVERSE.</p>
        </div>
        <div className="jam-layout">
          <div className="jam-visual">
            <div className="equalizer">
              {Array.from({ length: 12 }).map((_, i) => <div key={i} className="eq-bar"></div>)}
            </div>
          </div>
          <div className="jam-info">
            <div className="jd">
              <span className="ji">🎤</span>
              <div>
                <strong>Now Playing</strong>
                <p>{nowPlaying ? `${nowPlaying.title}${nowPlaying.artist ? ' — ' + nowPlaying.artist : ''}${nowPlaying.teamName ? ` (${nowPlaying.teamName})` : ''}` : 'Nobody yet — hit Start on the queue below.'}</p>
              </div>
            </div>
            <div className="jd">
              <span className="ji">🎶</span>
              <div>
                <strong>Up Next ({upNext.length})</strong>
                <p>{upNext.slice(0, 3).map((s) => s.title).join(' · ') || 'Queue is empty'}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, marginTop: '2.5rem' }}>
          <button onClick={() => setOpen((v) => !v)} className={`ef-open-btn ${open ? 'ef-active' : ''}`}>
            {open ? '✕ Close Control' : '▶ Open Control'}
          </button>
        </div>

        {open && (
          <div className="ef-panel">
            <p className="ef-panel-label">Queue Controller</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button className="ef-btn ef-btn-primary" disabled={busy || upNext.length === 0} onClick={handleNext}>
                {nowPlaying ? 'Next →' : 'Start →'}
              </button>
              <button className="ef-btn" disabled={busy || !nowPlaying} onClick={() => pauseCurrent()}>Pause</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {upNext.map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '0.6rem 1rem' }}>
                  <span style={{ color: '#fff', fontSize: '0.85rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', marginRight: 8 }}>{String(i + 1).padStart(2, '0')}</span>
                    {s.title}{s.artist ? ` — ${s.artist}` : ''}{s.teamName ? ` (${s.teamName})` : ''}
                  </span>
                  <button className="ef-btn ef-btn-danger" style={{ padding: '4px 12px' }} onClick={() => removeFromQueue(s.id)}>Remove</button>
                </div>
              ))}
              {upNext.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>No songs queued.</p>}
            </div>
          </div>
        )}
      </div>
      <div className="jam-wavy-bottom"></div>
    </section>
  )
}
