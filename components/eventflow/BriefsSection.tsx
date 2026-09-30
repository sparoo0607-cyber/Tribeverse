'use client'

import { useState } from 'react'
import StageRow from './StageRow'
import Icon from '@/components/icons/Icon'
import PlaybookSlideViewer from '@/components/PlaybookSlideViewer'

const DIVISIONS = ['Content', 'Commerce', 'Community', 'Care', 'Clothing', 'Careers']
const CHIP_COLORS = ['#FF2D87', '#7B2FFF', '#FF6B1A', '#00C27A', '#FFE600', '#1A6FFF']

export default function BriefsSection() {
  const [open, setOpen] = useState(false)

  return (
    <div className="ef-anchor" id="briefs">
      <StageRow
        num="02"
        color="blue"
        title="Student Tribe Briefs"
        desc="10:00 – 10:30 AM · Introduction to Student Tribe, our vibrant community, 6 divisions, and student opportunities."
        sideNote="Different People. Same Tribe"
      >
        <div className="efb-card-head"><Icon name="book" /> ST Playbook &amp; 6 Divisions</div>
        <div className="efb-card-body">
          <div className="efb-grid-mini">
            {DIVISIONS.map((d, i) => (
              <div key={d} className="efb-chip" style={{ background: CHIP_COLORS[i] }}>{d}</div>
            ))}
          </div>
        </div>
        <div className="efb-card-foot">
          <button className="efb-btn-play blue" onClick={() => setOpen((v) => !v)}>
            <Icon name="play" /> {open ? 'Hide Deck' : 'Present Deck'}
          </button>
          <button className="efb-btn-full" onClick={() => setOpen((v) => !v)}>
            {open ? 'Close Viewer' : 'Open Slide Presentation'}
          </button>
        </div>

        {open && (
          <div className="efb-detail">
            <PlaybookSlideViewer />
          </div>
        )}
      </StageRow>
    </div>
  )
}
