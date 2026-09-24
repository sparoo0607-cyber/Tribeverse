'use client'

import { ReactNode } from 'react'

export default function StageRow({
  num,
  color,
  title,
  desc,
  sideNote,
  sideIcon,
  children,
}: {
  num: string
  color: 'pink' | 'blue' | 'yellow' | 'purple' | 'orange' | 'red' | 'teal' | 'dark'
  title: string
  desc: string
  sideNote?: string
  sideIcon?: ReactNode
  children: ReactNode
}) {
  return (
    <section className={`efb-band efb-${color}`}>
      <div className="efb-wrap">
        <div className="efb-left">
          <div className="efb-num">{num}</div>
          <h3 className="efb-title">{title}</h3>
          <p className="efb-desc">{desc}</p>
        </div>
        <div className="efb-card">{children}</div>
        {sideNote && (
          <div className="efb-side">
            {sideIcon && <span className="efb-side-icon">{sideIcon}</span>}
            <span>{sideNote}</span>
          </div>
        )}
      </div>
    </section>
  )
}
