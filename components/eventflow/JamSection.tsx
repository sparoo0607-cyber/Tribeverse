'use client'

import { useEffect, useState } from 'react'
import StageRow from './StageRow'
import { fetchJamQueue, subscribeToJamQueue, startNext, pauseCurrent, removeFromQueue, JamEntry } from '@/lib/jam'
import Icon from '@/components/icons/Icon'

export default function JamSection() {
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
    <div className="ef-anchor" id="jam">
      <StageRow
        num="06"
        color="red"
        title="Tribe Jam"
        desc="Music. People. Energy. The stage is yours."
        sideNote="Good Music. Brighter People"
        sideIcon={<Icon name="music-note" />}
      >
        <div className="efb-card-head"><Icon name="mic" /> Live Queue</div>
        <div className="efb-card-body">
          <div className="efb-queue">
            {nowPlaying && (
              <div className="efb-queue-row">
                <span className="efb-queue-idx">1</span>
                <span className="efb-queue-name">{nowPlaying.title}</span>
                <span className="efb-queue-sub">{nowPlaying.artist}</span>
                <span className="efb-tag efb-tag-now">Now</span>
              </div>
            )}
            {upNext.slice(0, 4).map((s, i) => (
              <div key={s.id} className="efb-queue-row">
                <span className="efb-queue-idx">{i + (nowPlaying ? 2 : 1)}</span>
                <span className="efb-queue-name">{s.title}</span>
                <span className="efb-queue-sub">{s.artist}</span>
                <span className={`efb-tag ${i === 0 ? 'efb-tag-next' : 'efb-tag-queue'}`}>{i === 0 ? 'Up Next' : 'In Queue'}</span>
                <button className="ef-btn ef-btn-danger" style={{ padding: '3px 10px', fontSize: '0.6rem' }} onClick={() => removeFromQueue(s.id)}>Remove</button>
              </div>
            ))}
            {!nowPlaying && upNext.length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>Queue is empty.</p>
            )}
          </div>
        </div>
        <div className="efb-card-foot">
          <button className="efb-btn-play red" disabled={busy || upNext.length === 0} onClick={handleNext}>
            <Icon name="play" /> {nowPlaying ? 'Call Next' : 'Start'}
          </button>
          <button className="efb-btn-full" disabled={busy || !nowPlaying} onClick={() => pauseCurrent()}><Icon name="pause" /> Pause</button>
        </div>
      </StageRow>
    </div>
  )
}
