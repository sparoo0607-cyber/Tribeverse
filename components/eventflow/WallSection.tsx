'use client'

import { useEffect, useState } from 'react'
import { fetchAllWallPosts, subscribeToWallPosts, approvePost, hidePost, togglePin, WallPostRow } from '@/lib/wall'

const COLORS = ['#FFE600', '#FF6BDE', '#00FFD1', '#FF8C42', '#6BFFA0']

export default function WallSection() {
  const [open, setOpen] = useState(false)
  const [posts, setPosts] = useState<WallPostRow[]>([])

  useEffect(() => {
    async function load() {
      setPosts(await fetchAllWallPosts())
    }
    load()
    const unsub = subscribeToWallPosts(load)
    return () => unsub()
  }, [])

  const approved = posts.filter((p) => p.status === 'approved')
  const pending = posts.filter((p) => p.status === 'pending')

  return (
    <section className="section wall-sec ef-anchor" id="wall">
      <div className="section-inner">
        <div className="sec-num" aria-hidden="true">07</div>
        <div className="wall-header">
          <h2 className="sec-title wall-t">THE TRIBE WALL</h2>
          <p className="wall-prompt">&quot;BEFORE I GRADUATE, I WANT TO...&quot;</p>
          <p className="wall-count">{approved.length} DREAMS ON THE WALL</p>
        </div>
        <div className="wall-grid">
          {approved.map((post, i) => (
            <div key={post.id} className="sticky-note" style={{ ['--r' as string]: `${(i % 5) - 2}deg`, ['--c' as string]: COLORS[i % COLORS.length] }}>
              {post.content}
              {post.isPinned && <span style={{ display: 'block', fontSize: '0.65rem', marginTop: 6, fontWeight: 900 }}>★ FEATURED</span>}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <button onClick={() => setOpen((v) => !v)} className={`ef-open-btn ${open ? 'ef-active' : ''}`}>
            {open ? '✕ Close Control' : `▶ Moderate Wall${pending.length ? ` (${pending.length} pending)` : ''}`}
          </button>
        </div>

        {open && (
          <div className="ef-panel">
            <p className="ef-panel-label">Pending Submissions ({pending.length})</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {pending.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '0.75rem 1rem' }}>
                  <span style={{ color: '#fff', fontSize: '0.85rem' }}>{p.content} <span style={{ color: 'rgba(255,255,255,0.35)' }}>— {p.authorName}</span></span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button className="ef-btn ef-btn-live" style={{ padding: '4px 12px' }} onClick={() => approvePost(p.id)}>Approve</button>
                    <button className="ef-btn ef-btn-danger" style={{ padding: '4px 12px' }} onClick={() => hidePost(p.id)}>Hide</button>
                  </div>
                </div>
              ))}
              {pending.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Nothing pending.</p>}
            </div>

            <p className="ef-panel-label">Live on the Wall ({approved.length})</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {approved.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '0.6rem 1rem' }}>
                  <span style={{ color: '#fff', fontSize: '0.85rem' }}>{p.content}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button className="ef-btn" style={{ padding: '4px 12px' }} onClick={() => togglePin(p.id, !p.isPinned)}>{p.isPinned ? 'Unfeature' : 'Feature'}</button>
                    <button className="ef-btn ef-btn-danger" style={{ padding: '4px 12px' }} onClick={() => hidePost(p.id)}>Hide</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
