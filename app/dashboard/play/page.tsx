'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchStageStates, subscribeToStageChanges } from '@/lib/stageStore'
import Icon, { IconName } from '@/components/icons/Icon'

const STAGES: { slug: string; time: string; name: string; desc: string; href: string; icon: IconName }[] = [
  {
    slug: 'playground',
    time: '11:00 AM to 12:00 PM, and 1:00 to 2:00 PM',
    name: 'Tribe Playground',
    desc: 'Interactive activities focused on participation, creativity and quick thinking.',
    href: '/dashboard/play/playground',
    icon: 'game-controller',
  },
  {
    slug: 'jam',
    time: '2:00 to 3:00 PM',
    name: 'Tribe Jam',
    desc: 'Pure Jamming Session with live keyboard, singing, dance and rap.',
    href: '/dashboard/play/jam',
    icon: 'piano',
  },
]

export default function PlayPage() {
  const [statuses, setStatuses] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      const stages = await fetchStageStates()
      if (!cancelled) setStatuses(Object.fromEntries(Object.entries(stages).map(([slug, s]) => [slug, s.status])))
    }
    load()
    const unsubscribe = subscribeToStageChanges(load)
    return () => { cancelled = true; unsubscribe() }
  }, [])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-display">Play</h1>
        <p className="text-white/50 text-sm mt-1">Open to every participant when a stage goes live.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {STAGES.map((st) => {
          const status = statuses[st.slug] ?? 'locked'
          return (
            <Link
              key={st.slug}
              href={st.href}
              className="p-6 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#FFE600]/40 rounded-2xl transition-all flex items-start gap-4 group"
            >
              <span className="p-3 bg-[#FFE600]/10 text-[#FFE600] rounded-xl">
                <Icon name={st.icon} className="w-6 h-6" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono font-bold text-[#00FFD1]">{st.time}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase ${
                    status === 'live' ? 'bg-green-500/20 text-green-400' : status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'
                  }`}>
                    {status === 'live' ? 'live' : status === 'completed' ? 'done' : 'upcoming'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white font-display group-hover:text-[#FFE600] transition-colors">{st.name}</h3>
                <p className="text-white/50 text-sm mt-1">{st.desc}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
