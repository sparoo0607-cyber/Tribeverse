'use client'
import React from 'react'
import Link from 'next/link'
import Icon, { IconName } from '@/components/icons/Icon'

const SCHEDULE: { stage: string; name: string; icon: IconName; type: string; badgeBg: string; desc: string }[] = [
  { stage: 'STAGE 01', name: 'Inauguration · Welcome to TRIBEVERSE', icon: 'clapperboard', type: 'Launch', badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', desc: 'Introduction → Tribe Intro → Team Reveal → Interactive Opening → Launch' },
  { stage: 'STAGE 02', name: 'Tribe Playground (5 Rounds)', icon: 'game-controller', type: 'Playground', badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/30', desc: '5 Members · 5 Abilities: Quick Eyes, Quick Draw, Think Fast, Sound Check, Reaction Game' },
  { stage: 'STAGE 03', name: 'The Tribe Detective (5 Rounds)', icon: 'hat', type: 'Mystery', badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', desc: 'Secret Roles • Guess • Reveal: Professions, Characters, Superpowers, Campus Roles, Wild Card' },
  { stage: 'BREAK', name: 'Lunch / Free Tribe Time', icon: 'pizza', type: 'Break', badgeBg: 'bg-green-500/20 text-green-300 border-green-500/30', desc: 'Eat → Talk → Meet New People → Photos → Music → Explore' },
  { stage: 'STAGE 04', name: 'Tribe Jam', icon: 'piano', type: 'Music', badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30', desc: 'Keyboard → Guitar → Singing → Open Participation → TRIBE JAM SWITCH' },
  { stage: 'STAGE 05', name: 'The Tribe Wall', icon: 'brick', type: 'Interactive', badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', desc: '“BEFORE I GRADUATE, I WANT TO…” — 100 Students → 100 Dreams → One Tribe Wall' },
  { stage: 'FINALE', name: 'TRIBEVERSE REVEAL', icon: 'globe', type: 'Finale', badgeBg: 'bg-[#FFE600] text-black font-black', desc: 'You came as strangers. You played together. AND SOMEWHERE ALONG THE WAY... YOU FOUND YOUR TRIBE.' },
]

export default function EventGuidePage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-[#1A6FFF]/20 text-[#00FFD1] text-xs font-black rounded-full font-display uppercase tracking-widest">
            Event Playbook &amp; Flow
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-display mt-2">
            Event Flow &amp; Guide
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Complete flow sequence for the TRIBEVERSE V1 experience.
          </p>
        </div>
      </div>

      {/* Flow Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-black text-white font-display text-base">Full Event Flow</h3>
          <span className="text-xs text-[#00FFD1] font-mono font-bold">Sequential Stages</span>
        </div>
        <div className="divide-y divide-white/5">
          {SCHEDULE.map((item, idx) => (
            <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start sm:items-center gap-4">
                <span className="font-mono font-bold text-xs text-[#FFE600] bg-white/5 px-2.5 py-1 rounded border border-white/10 min-w-[85px] text-center">{item.stage}</span>
                <div>
                  <p className="font-bold text-white font-display text-base flex items-center gap-2">
                    <Icon name={item.icon} />
                    {item.name}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-bold font-display rounded-full border self-start sm:self-auto ${item.badgeBg}`}>
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rules of Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-3">
          <h3 className="text-lg font-black text-white font-display flex items-center gap-2">
            Scoring Rules
          </h3>
          <ul className="space-y-2 text-white/70 text-xs leading-relaxed">
            <li>• Every member's game attempt contributes to the overall team total.</li>
            <li>• Speed matters: Faster completions in Trivia &amp; Reaction earn streak bonuses.</li>
            <li>• Detective submissions undergo admin verification before points credit.</li>
            <li>• Leaderboard freezes 15 minutes before the Grand Finale reveal.</li>
          </ul>
        </div>

        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-3">
          <h3 className="text-lg font-black text-white font-display flex items-center gap-2">
            Tribe Spirit Code
          </h3>
          <ul className="space-y-2 text-white/70 text-xs leading-relaxed">
            <li>• 100 participants enter as strangers, leave as a unified tribe.</li>
            <li>• Support your teammates across all individual ability rounds.</li>
            <li>• Fair play, zero toxicity, and maximum high-energy celebration.</li>
            <li>• In case of disputes, Admin desk decisions are final and binding.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
