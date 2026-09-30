'use client'

import React from 'react'
import Link from 'next/link'
import Icon, { IconName } from '@/components/icons/Icon'
import PlaybookSlideViewer from '@/components/PlaybookSlideViewer'

const SCHEDULE: { time: string; stage: string; name: string; icon: IconName; type: string; badgeBg: string; desc: string }[] = [
  { time: '9:30 – 10:00 AM', stage: 'SEGMENT 01', name: 'Inauguration', icon: 'clapperboard', type: 'Welcome', badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', desc: 'Official opening of TRIBEVERSE and welcome to all participants.' },
  { time: '10:00 – 10:30 AM', stage: 'SEGMENT 02', name: 'ST Brief', icon: 'book', type: 'Community', badgeBg: 'bg-[#1A6FFF]/20 text-[#00FFD1] border-[#1A6FFF]/30', desc: 'Introduction to Student Tribe, its community, and student opportunities.' },
  { time: '10:30 – 11:00 AM', stage: 'SEGMENT 03', name: 'Talent Hunt', icon: 'sparkle', type: 'Talent', badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', desc: 'Open platform for students to showcase their talents and creative skills.' },
  { time: '11:00 AM – 12:00 PM', stage: 'SEGMENT 04', name: 'Tribe Playground', icon: 'game-controller', type: 'Activities', badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/30', desc: 'Interactive activities focused on participation, creativity and quick thinking.' },
  { time: '12:00 – 1:00 PM', stage: 'BREAK', name: 'Lunch Break', icon: 'pizza', type: 'Break', badgeBg: 'bg-green-500/20 text-green-300 border-green-500/30', desc: 'Break for lunch, relaxation and informal interaction among participants.' },
  { time: '1:00 – 2:00 PM', stage: 'SEGMENT 05', name: 'Tribe Playground (Continuous)', icon: 'game-controller', type: 'Activities', badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/30', desc: 'Continuation of Playground activities and completion of remaining participation.' },
  { time: '2:00 – 3:00 PM', stage: 'SEGMENT 06', name: 'Tribe Jam', icon: 'piano', type: 'Pure Jam', badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30', desc: 'Pure Jamming Session with live keyboard, singing, dance, rap, and beats.' },
  { time: '3:00 – 3:20 PM', stage: 'SEGMENT 07', name: 'Tribeverse Reveal', icon: 'globe', type: 'Reveal', badgeBg: 'bg-[#FFE600] text-black font-black', desc: 'Closing reveal connecting the day & welcoming freshers into Student Tribe.' },
  { time: '3:20 – 3:30 PM', stage: 'SEGMENT 08', name: 'Closing', icon: 'check', type: 'Closing', badgeBg: 'bg-white/10 text-white/80 border-white/20', desc: 'Final thank you, celebration and student community induction.' },
]

export default function EventGuidePage() {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-[#FFE600]/15 text-[#FFE600] text-xs font-black rounded-full font-display uppercase tracking-widest">
            OFFICIAL ITINERARY & PLAYBOOK
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-display mt-2">
            Event Flow &amp; Guide
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Official 9-segment schedule for the TRIBEVERSE V1 campus experience (9:30 AM – 3:30 PM).
          </p>
        </div>
      </div>

      {/* Official Timeline Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-black text-white font-display text-base sm:text-lg">Today&apos;s Schedule</h3>
          <span className="text-xs text-[#00FFD1] font-mono font-bold">9:30 AM – 3:30 PM</span>
        </div>
        <div className="divide-y divide-white/5">
          {SCHEDULE.map((item, idx) => (
            <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <span className="font-mono font-bold text-[11px] text-[#FFE600] bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 min-w-[120px] text-center">
                  {item.time}
                </span>
                <div>
                  <p className="font-bold text-white font-display text-base flex items-center gap-2">
                    <Icon name={item.icon} />
                    {item.name}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-[11px] font-bold font-display rounded-full border self-start sm:self-auto whitespace-nowrap ${item.badgeBg}`}>
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Official Student Tribe Playbook Presentation */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div>
          <span className="text-[10px] font-mono text-[#FFE600] uppercase tracking-widest font-black block">
            OFFICIAL SLIDE DECK
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
            Student Tribe Playbook (13 Official Slides)
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Browse through the official Student Tribe presentation slide by slide.
          </p>
        </div>
        <PlaybookSlideViewer />
      </div>

      {/* Rules of Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-3">
          <h3 className="text-lg font-black text-white font-display flex items-center gap-2 text-[#FFE600]">
            Participation
          </h3>
          <ul className="space-y-2 text-white/70 text-xs leading-relaxed">
            <li>• Every activity is open to all participants. Just join in.</li>
            <li>• Live jam session welcomes keyboard players, vocalists, and dancers.</li>
            <li>• Permanent ambition notes are preserved on the Tribe Wall.</li>
          </ul>
        </div>

        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-3">
          <h3 className="text-lg font-black text-white font-display flex items-center gap-2 text-[#00FFD1]">
            Tribe Spirit Code
          </h3>
          <ul className="space-y-2 text-white/70 text-xs leading-relaxed">
            <li>• You enter as freshers, participate together, and discover your tribe.</li>
            <li>• Open support across all creative talent showcases and jam sessions.</li>
            <li>• High energy, authenticity, and celebration throughout the day.</li>
            <li>• Welcome to the Student Tribe community at ANITS!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
