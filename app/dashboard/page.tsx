'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { fetchStageStates, subscribeToStageChanges } from '@/lib/stageStore'
import Icon from '@/components/icons/Icon'

const EVENT_DATE = new Date('2026-09-23T09:30:00+05:30')

const OFFICIAL_ITINERARY = [
  { time: '9:30 – 10:00 AM', name: 'Inauguration', slug: 'inauguration', desc: 'Official opening of TRIBEVERSE and welcome to participants.' },
  { time: '10:00 – 10:30 AM', name: 'ST Brief', slug: 'brief', desc: 'Introduction to Student Tribe, community opportunities & handbook.' },
  { time: '10:30 – 11:00 AM', name: 'Talent Hunt', slug: 'talent-hunt', desc: 'Open platform for students to showcase creative talents.' },
  { time: '11:00 AM – 12:00 PM', name: 'Tribe Playground', slug: 'playground', desc: 'Interactive games focused on participation, creativity and quick thinking.' },
  { time: '12:00 – 1:00 PM', name: 'Lunch Break', slug: 'lunch', desc: 'Break for lunch, relaxation and informal interaction.' },
  { time: '1:00 – 2:00 PM', name: 'Tribe Playground (Continuous)', slug: 'playground-cont', desc: 'Continuation of Playground activities & student participation.' },
  { time: '2:00 – 3:00 PM', name: 'Tribe Jam', slug: 'jam', desc: 'Pure Jamming Session with live keyboard, singing, dance & rap.' },
  { time: '3:00 – 3:20 PM', name: 'Tribeverse Reveal', slug: 'reveal', desc: 'Closing reveal connecting the day & welcoming freshers to Student Tribe.' },
  { time: '3:20 – 3:30 PM', name: 'Closing', slug: 'closing', desc: 'Final thank you, group moments, and next chapter.' },
] as const

const JOIN_IN = [
  { slug: 'playground', name: 'Tribe Playground', desc: 'Interactive activities focused on participation, creativity and quick thinking.', href: '/dashboard/play/playground' },
  { slug: 'jam', name: 'Tribe Jam', desc: 'Pure Jamming Session with live keyboard, singing, dance and rap.', href: '/dashboard/play/jam' },
  { slug: 'wall', name: 'The Tribe Wall', desc: 'Share a goal, thought or aspiration as a collective closing activity.', href: '/dashboard/wall' },
  { slug: 'reveal', name: 'Tribeverse Reveal', desc: 'Closing reveal connecting the day with the TRIBEVERSE identity.', href: '/dashboard/reveal' },
] as const

function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })

  useEffect(() => {
    function calc() {
      const diff = EVENT_DATE.getTime() - Date.now()
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 }); return }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {[['days', timeLeft.days], ['hrs', timeLeft.hours], ['min', timeLeft.mins], ['sec', timeLeft.secs]].map(([label, val]) => (
        <div key={label as string} className="bg-black/40 border border-white/10 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-center min-w-[48px] sm:min-w-[54px]">
          <div className="font-black text-lg sm:text-xl text-[#FFE600] font-mono">
            {String(val).padStart(2, '0')}
          </div>
          <div className="text-white/40 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">{label}</div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [fullName, setFullName] = useState('Student')
  const [stageStatuses, setStageStatuses] = useState<Record<string, string>>({})

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
      if (!cancelled) setStageStatuses(Object.fromEntries(Object.entries(stages).map(([slug, s]) => [slug, s.status])))
    }
    load()
    const unsubscribe = subscribeToStageChanges(load)

    return () => { cancelled = true; unsubscribe() }
  }, [])

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1A6FFF] via-[#0D1B4B] to-[#7B2FFF] p-6 sm:p-8 md:p-10 border border-[#1A6FFF]/40 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black text-xs font-black rounded-full font-display uppercase tracking-widest">
              TRIBEVERSE V1 DASHBOARD
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white font-display">
              Welcome, <span className="text-[#FFE600]">{fullName.split(' ')[0]}!</span>
            </h1>
            <p className="text-white/80 font-medium text-sm sm:text-base max-w-xl">
              Your official participant portal for TRIBEVERSE V1 at ANITS. Experience activities, talent hunt, live keyboard jamming, and community reveals.
            </p>
          </div>

          <div className="bg-black/50 backdrop-blur-md border border-white/15 p-4 sm:p-5 rounded-2xl flex flex-col items-center sm:items-start gap-2 sm:gap-3">
            <span className="text-xs text-white/50 font-bold uppercase tracking-wider font-display">Event Countdown</span>
            <Countdown />
          </div>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dashboard/pass"
          className="p-5 bg-gradient-to-br from-[#FFE600]/15 to-transparent border border-[#FFE600]/30 rounded-2xl hover:border-[#FFE600] transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 bg-[#FFE600]/20 text-[#FFE600] rounded-xl group-hover:scale-110 transition-transform">
              <Icon name="ticket" className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono text-[#FFE600] font-bold">READY</span>
          </div>
          <h3 className="font-black text-white font-display text-base">Digital Event Pass</h3>
          <p className="text-white/50 text-xs mt-1">View & download your scannable QR ticket</p>
        </Link>

        <Link
          href="/dashboard/play"
          className="p-5 bg-gradient-to-br from-[#1A6FFF]/15 to-transparent border border-[#1A6FFF]/30 rounded-2xl hover:border-[#1A6FFF] transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 bg-[#1A6FFF]/20 text-[#1A6FFF] rounded-xl group-hover:scale-110 transition-transform">
              <Icon name="game-controller" className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono text-[#1A6FFF] font-bold">2 STAGES</span>
          </div>
          <h3 className="font-black text-white font-display text-base">Play</h3>
          <p className="text-white/50 text-xs mt-1">Tribe Playground & Tribe Jam</p>
        </Link>

        <Link
          href="/dashboard/event"
          className="p-5 bg-gradient-to-br from-[#00FFD1]/15 to-transparent border border-[#00FFD1]/30 rounded-2xl hover:border-[#00FFD1] transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 bg-[#00FFD1]/20 text-[#00FFD1] rounded-xl group-hover:scale-110 transition-transform">
              <Icon name="book" className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono text-[#00FFD1] font-bold">9:30 – 3:30</span>
          </div>
          <h3 className="font-black text-white font-display text-base">Official Itinerary</h3>
          <p className="text-white/50 text-xs mt-1">9 scheduled segments throughout the day</p>
        </Link>

        <Link
          href="/dashboard/wall"
          className="p-5 bg-gradient-to-br from-[#FF2D87]/15 to-transparent border border-[#FF2D87]/30 rounded-2xl hover:border-[#FF2D87] transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 bg-[#FF2D87]/20 text-[#FF2D87] rounded-xl group-hover:scale-110 transition-transform">
              <Icon name="chat" className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono text-[#FF2D87] font-bold">LIVE</span>
          </div>
          <h3 className="font-black text-white font-display text-base">The Tribe Wall</h3>
          <p className="text-white/50 text-xs mt-1">Pin your dreams & graduation ambitions</p>
        </Link>
      </div>

      {/* Official 9-Segment Schedule Timeline */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#FFE600] uppercase tracking-widest font-black block">
              OFFICIAL EVENT FLOW
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
              Today's Itinerary (9:30 AM – 3:30 PM)
            </h2>
          </div>
          <Link
            href="/dashboard/event"
            className="text-xs text-[#FFE600] font-bold font-display hover:underline flex items-center gap-1"
          >
            <span>Full Guide</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {OFFICIAL_ITINERARY.map((seg, idx) => (
            <div
              key={idx}
              className="p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/20 rounded-2xl transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono font-bold text-[#00FFD1] bg-[#00FFD1]/10 px-2 py-0.5 rounded-md">
                  {seg.time}
                </span>
                <span className="text-[10px] font-mono text-white/30 font-bold">
                  #{String(idx + 1).padStart(2, '0')}
                </span>
              </div>
              <h4 className="text-sm font-black text-white font-display">{seg.name}</h4>
              <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">{seg.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Join In */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black text-white font-display">Join In</h2>
          <p className="text-white/50 text-xs mt-0.5">Open to every participant when the stage goes live</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {JOIN_IN.map((act) => {
            const status = stageStatuses[act.slug] ?? 'locked'
            return (
              <Link
                key={act.slug}
                href={act.href}
                className="p-5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#FFE600]/40 rounded-2xl transition-all flex items-start gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase ${
                      status === 'live' ? 'bg-green-500/20 text-green-400' : status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'
                    }`}>
                      {status === 'live' ? 'live' : status === 'completed' ? 'done' : 'upcoming'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white font-display truncate group-hover:text-[#FFE600] transition-colors">{act.name}</h3>
                  <p className="text-white/50 text-xs line-clamp-2 mt-0.5">{act.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
