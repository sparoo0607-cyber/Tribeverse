'use client'

import { useEffect, useState } from 'react'
import StageRow from './StageRow'
import { fetchAllWallPosts, subscribeToWallPosts, approvePost, hidePost, togglePin, WallPostRow } from '@/lib/wall'
import Icon from '@/components/icons/Icon'

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
    <div className="ef-anchor" id="wall">
      <StageRow
        num="07"
        color="teal"
        title="The Tribe Wall"
        desc={`"Before I graduate, I want to..."`}
        sideNote={`${approved.length} Dreams. One Tribe`}
        sideIcon={<Icon name="crown" />}
      >
        <div className="efb-card-head"><Icon name="pencil" /> Live Submissions</div>
        <div className="efb-card-body">
          <div className="efb-submissions-grid">
            {approved.slice(0, 5).map((p) => (
              <div key={p.id} className="efb-sub-chip">{p.content}</div>
            ))}
            {approved.length > 5 && <div className="efb-more">+{approved.length - 5} more</div>}
            {approved.length === 0 && <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>No dreams posted yet.</span>}
          </div>
        </div>
        <div className="efb-card-foot">
          <button className="efb-btn-play teal" onClick={() => setOpen((v) => !v)}>
            <Icon name="clipboard" /> Review Submissions{pending.length ? ` (${pending.length})` : ''}
          </button>
          <button className="efb-btn-full" onClick={() => setOpen((v) => !v)}>{open ? 'Close Wall' : 'Open Wall'}</button>
        </div>

        {open && (
          <div className="efb-detail">
            <p className="efb-round-label">Pending Submissions ({pending.length})</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {pending.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '0.6rem 0.9rem' }}>
                  <span style={{ color: '#fff', fontSize: '0.8rem' }}>{p.content} <span style={{ color: 'rgba(255,255,255,0.35)' }}>— {p.authorName}</span></span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button className="ef-btn ef-btn-live" style={{ padding: '4px 12px' }} onClick={() => approvePost(p.id)}>Approve</button>
                    <button className="ef-btn ef-btn-danger" style={{ padding: '4px 12px' }} onClick={() => hidePost(p.id)}>Hide</button>
                  </div>
                </div>
              ))}
              {pending.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>Nothing pending.</p>}
            </div>

            <p className="efb-round-label">Live on the Wall ({approved.length})</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {approved.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '0.55rem 0.9rem' }}>
                  <span style={{ color: '#fff', fontSize: '0.8rem' }}>{p.content}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button className="ef-btn" style={{ padding: '4px 12px' }} onClick={() => togglePin(p.id, !p.isPinned)}>{p.isPinned ? 'Unfeature' : 'Feature'}</button>
                    <button className="ef-btn ef-btn-danger" style={{ padding: '4px 12px' }} onClick={() => hidePost(p.id)}>Hide</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </StageRow>
    </div>
  )
}
