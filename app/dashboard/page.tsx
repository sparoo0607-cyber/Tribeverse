'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { fetchStageStates, subscribeToStageChanges } from '@/lib/stageStore'
import Icon, { IconName } from '@/components/icons/Icon'

const ITINERARY: { time: string; name: string; icon: IconName; color: string; desc: string }[] = [
  { time: '9:30 to 10:00 AM', name: 'Inauguration', icon: 'clapperboard', color: '#FFE600', desc: 'Official opening of TRIBEVERSE and welcome to participants.' },
  { time: '10:00 to 10:30 AM', name: 'ST Brief', icon: 'book', color: '#00FFD1', desc: 'Introduction to Student Tribe, the community and student opportunities.' },
  { time: '10:30 to 11:00 AM', name: 'Talent Hunt', icon: 'sparkles', color: '#7B2FFF', desc: 'Open platform to showcase your talents and creative skills.' },
  { time: '11:00 AM to 12:00 PM', name: 'Tribe Playground', icon: 'game-controller', color: '#FF2D87', desc: 'Interactive activities for participation, creativity and quick thinking.' },
  { time: '12:00 to 1:00 PM', name: 'Lunch Break', icon: 'pizza', color: '#FF6B1A', desc: 'Lunch, relaxation and informal interaction.' },
  { time: '1:00 to 2:00 PM', name: 'Tribe Playground Continues', icon: 'game-controller', color: '#FF2D87', desc: 'Remaining Playground activities and participation.' },
  { time: '2:00 to 3:00 PM', name: 'Tribe Jam', icon: 'piano', color: '#FF2D2D', desc: 'Live keyboard, singing, dance and rap.' },
  { time: '3:00 to 3:20 PM', name: 'Tribeverse Reveal', icon: 'globe', color: '#1A6FFF', desc: 'Closing reveal connecting the day with the TRIBEVERSE identity.' },
  { time: '3:20 to 3:30 PM', name: 'Closing', icon: 'confetti', color: '#D4FF00', desc: 'Final thank you, group moments and the next chapter.' },
]

const QUICK: { href: string; title: string; sub: string; icon: IconName; color: string }[] = [
  { href: '/dashboard/pass', title: 'Event Pass', sub: 'Your QR ticket', icon: 'ticket', color: '#FFE600' },
  { href: '/dashboard/play', title: 'Play', sub: 'Playground and Jam', icon: 'game-controller', color: '#1A6FFF' },
  { href: '/dashboard/event', title: 'Guide', sub: 'Schedule and Playbook', icon: 'book', color: '#00FFD1' },
  { href: '/dashboard/wall', title: 'Tribe Wall', sub: 'Pin your dream', icon: 'chat', color: '#FF2D87' },
]

const JOIN_IN: { slug: string; name: string; desc: string; href: string; icon: IconName; color: string }[] = [
  { slug: 'playground', name: 'Tribe Playground', desc: 'Interactive activities for participation, creativity and quick thinking.', href: '/dashboard/play/playground', icon: 'game-controller', color: '#FF2D87' },
  { slug: 'jam', name: 'Tribe Jam', desc: 'Live keyboard, singing, dance and rap.', href: '/dashboard/play/jam', icon: 'piano', color: '#FF6B1A' },
  { slug: 'wall', name: 'The Tribe Wall', desc: 'Share a goal, thought or aspiration with the tribe.', href: '/dashboard/wall', icon: 'chat', color: '#00FFD1' },
  { slug: 'reveal', name: 'Tribeverse Reveal', desc: 'The closing reveal of the TRIBEVERSE identity.', href: '/dashboard/reveal', icon: 'globe', color: '#1A6FFF' },
]

const TILES: { icon: IconName; pos: string; rot: string }[] = [
  { icon: 'game-controller', pos: 'top-5 left-[4%]', rot: '-8deg' },
  { icon: 'piano', pos: 'top-[38%] right-[3%]', rot: '8deg' },
  { icon: 'ticket', pos: 'bottom-6 left-[12%]', rot: '6deg' },
  { icon: 'trophy', pos: 'top-6 right-[16%]', rot: '-6deg' },
]

const GRID_BG = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
  backgroundSize: '120px 120px, 120px 120px, 30px 30px, 30px 30px',
  WebkitMaskImage: 'radial-gradient(ellipse 90% 85% at 50% 50%, #000 40%, transparent 100%)',
  maskImage: 'radial-gradient(ellipse 90% 85% at 50% 50%, #000 40%, transparent 100%)',
} as const

const STICKER_TEXT = {
  WebkitTextStroke: '3px #0D1B4B',
  paintOrder: 'stroke fill',
  textShadow: '0 5px 0 #0D1B4B',
} as const

export default function DashboardPage() {
  const [fullName, setFullName] = useState('')
  const [stageStatuses, setStageStatuses] = useState<Record<string, string>>({})
  const [stageNames, setStageNames] = useState<Record<string, string>>({})

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        if (!cancelled && profile?.full_name) setFullName(profile.full_name)
      }

      const stages = await fetchStageStates()
      if (cancelled) return
      setStageStatuses(Object.fromEntries(Object.entries(stages).map(([slug, s]) => [slug, s.status])))
      setStageNames(Object.fromEntries(Object.entries(stages).map(([slug, s]) => [slug, s.name])))
    }
    load()
    const unsubscribe = subscribeToStageChanges(load)
    return () => { cancelled = true; unsubscribe() }
  }, [])

  const firstName = fullName.split(' ')[0]
  const liveSlug = Object.keys(stageStatuses).find((s) => stageStatuses[s] === 'live')

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A6FFF] via-[#3B4BFF] to-[#7B2FFF] px-5 py-8 sm:px-10 sm:py-12 text-center border border-white/20 shadow-2xl">
        <div className="absolute inset-0 pointer-events-none" style={GRID_BG} />
        <div className="absolute -left-16 top-4 w-56 h-56 rounded-full bg-[#7B2FFF]/60 blur-3xl pointer-events-none" />
        <div className="absolute -right-16 bottom-0 w-56 h-56 rounded-full bg-[#00D9C4]/40 blur-3xl pointer-events-none" />

        {TILES.map((t, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`hidden sm:grid absolute ${t.pos} w-12 h-12 place-items-center rounded-2xl bg-white/15 border border-white/30 text-white backdrop-blur-sm shadow-lg`}
            style={{ transform: `rotate(${t.rot})` }}
          >
            <Icon name={t.icon} className="w-6 h-6" />
          </span>
        ))}

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/30 text-[10px] sm:text-xs font-black tracking-[0.18em] uppercase text-white font-display">
            <Icon name="sparkles" className="w-3.5 h-3.5" /> TRIBEVERSE V1 · Freshers Edition
          </span>

          <h1 className="mt-4 font-display font-black uppercase leading-[0.95] tracking-tight text-[2.6rem] sm:text-7xl">
            <span className="block text-white" style={STICKER_TEXT}>Welcome{firstName ? ',' : ''}</span>
            {firstName && <span className="block text-[#FFE600] break-words" style={STICKER_TEXT}>{firstName}!</span>}
          </h1>

          <p className="mt-4 text-white/90 font-bold text-xs sm:text-sm tracking-[0.14em] uppercase font-display">
            One day. Nine moments. One Tribe.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link href="/dashboard/pass" className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#FFE600] hover:bg-[#D4FF00] text-black font-black text-xs sm:text-sm uppercase tracking-wider font-display shadow-lg transition-colors">
              Open My Pass →
            </Link>
            <Link href="/dashboard/event" className="w-full sm:w-auto px-7 py-3 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-black text-xs sm:text-sm uppercase tracking-wider font-display transition-colors">
              Event Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Live now */}
      {liveSlug && (
        <div className="flex items-center gap-3 rounded-2xl bg-green-500/10 border border-green-500/30 px-4 py-3">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-400" />
          </span>
          <p className="text-sm text-green-300 font-bold font-display">
            Live now: <span className="text-white">{stageNames[liveSlug] ?? liveSlug}</span>
          </p>
        </div>
      )}

      {/* Quick actions */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {QUICK.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="group rounded-2xl border p-4 sm:p-5 transition-all hover:-translate-y-1"
            style={{ background: `linear-gradient(145deg, ${q.color}26, transparent 70%)`, borderColor: `${q.color}55` }}
          >
            <span className="grid place-items-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl mb-3 group-hover:scale-110 transition-transform" style={{ background: `${q.color}26`, color: q.color }}>
              <Icon name={q.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <h3 className="font-black text-white font-display text-sm sm:text-base">{q.title}</h3>
            <p className="text-white/50 text-[11px] sm:text-xs mt-0.5">{q.sub}</p>
          </Link>
        ))}
      </section>

      {/* Itinerary timeline */}
      <section className="rounded-3xl bg-white/[0.03] border border-white/10 p-4 sm:p-8">
        <div className="flex items-end justify-between gap-3 mb-5 sm:mb-7">
          <div>
            <span className="text-[10px] font-mono text-[#FFE600] uppercase tracking-widest font-black">Official flow</span>
            <h2 className="text-xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">Today&apos;s Itinerary</h2>
            <p className="text-white/40 text-xs mt-0.5">9:30 AM to 3:30 PM</p>
          </div>
          <Link href="/dashboard/event" className="text-xs text-[#FFE600] font-bold font-display hover:underline shrink-0">Full guide →</Link>
        </div>

        <ol className="relative space-y-3 sm:space-y-4 before:content-[''] before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
          {ITINERARY.map((seg, i) => (
            <li key={i} className="relative flex gap-3 sm:gap-4">
              <span className="relative z-10 grid place-items-center w-11 h-11 rounded-xl shrink-0 border border-white/10 bg-[#111418]" style={{ color: seg.color }}>
                <Icon name={seg.icon} className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0 rounded-2xl bg-white/[0.03] border border-white/5 px-3.5 py-2.5 sm:px-4 sm:py-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-black text-white font-display truncate">{seg.name}</h3>
                  <span className="text-[10px] font-mono font-bold text-[#00FFD1] bg-[#00FFD1]/10 px-2 py-0.5 rounded-md whitespace-nowrap">{seg.time}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-white/50 mt-1 leading-relaxed">{seg.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Join in */}
      <section className="space-y-3 sm:space-y-4">
        <div>
          <h2 className="text-xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">Join In</h2>
          <p className="text-white/50 text-xs mt-0.5">Open to every participant when the stage goes live</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {JOIN_IN.map((act) => {
            const status = stageStatuses[act.slug] ?? 'locked'
            return (
              <Link
                key={act.slug}
                href={act.href}
                className="group flex items-start gap-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/25 p-4 sm:p-5 transition-all"
              >
                <span className="grid place-items-center w-11 h-11 rounded-xl shrink-0 group-hover:scale-110 transition-transform" style={{ background: `${act.color}26`, color: act.color }}>
                  <Icon name={act.icon} className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-white font-display text-sm sm:text-base truncate group-hover:text-[#FFE600] transition-colors">{act.name}</h3>
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase shrink-0 ${
                      status === 'live' ? 'bg-green-500/20 text-green-400' : status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'
                    }`}>
                      {status === 'live' ? 'live' : status === 'completed' ? 'done' : 'upcoming'}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs mt-1 leading-relaxed">{act.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
