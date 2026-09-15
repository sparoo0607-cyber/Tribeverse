'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { fetchStageStates, subscribeToStageChanges } from '@/lib/stageStore'

const EVENT_DATE = new Date('2026-09-23T09:00:00+05:30')

const STAGE_META = [
  { slug: 'playground', name: 'Tribe Playground', description: '5 Rounds · 5 Members · 5 Different Abilities', points: 500 },
  { slug: 'detective', name: 'Tribe Detective', description: 'Campus riddle trail & in-app cipher hunt', points: 600 },
  { slug: 'lunch', name: 'Lunch Break Vibes', description: 'Campus food battle & freshers playlist chill lounge', points: 200 },
  { slug: 'arcade', name: 'Tribe Arcade', description: 'Speed tapping, color frenzy & math blitz', points: 800 },
  { slug: 'impossible', name: 'The Impossible Challenge', description: '100-Second intense countdown logic puzzle gauntlet', points: 1500 },
  { slug: 'jam', name: 'Tribe Jam', description: 'Live DJ song queue voting & audience cheer meter', points: 400 },
  { slug: 'wall', name: 'The Tribe Wall', description: 'Live student photo & dream note social board', points: 300 },
  { slug: 'reveal', name: 'Tribeverse Reveal', description: 'Grand Finale reveal, teaser showcase & winner podium', points: 2000 },
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
    <div className="flex items-center gap-3">
      {[['days', timeLeft.days], ['hrs', timeLeft.hours], ['min', timeLeft.mins], ['sec', timeLeft.secs]].map(([label, val]) => (
        <div key={label as string} className="bg-black/40 border border-white/10 px-3 py-2 rounded-xl text-center min-w-[54px]">
          <div className="font-black text-xl text-[#FFE600] font-mono">
            {String(val).padStart(2, '0')}
          </div>
          <div className="text-white/40 text-[9px] font-bold uppercase tracking-widest">{label}</div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [fullName, setFullName] = useState('Student')
  const [teamName, setTeamName] = useState('Unassigned')
  const [teamNumber, setTeamNumber] = useState<number | null>(null)
  const [teamScore, setTeamScore] = useState(0)
  const [teamRank, setTeamRank] = useState<number | null>(null)
  const [totalTeams, setTotalTeams] = useState(20)
  const [assignedRound, setAssignedRound] = useState<number | null>(null)
  const [stageStatuses, setStageStatuses] = useState<Record<string, string>>({})

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      if (!cancelled && profile) setFullName(profile.full_name)

      const { data: membership } = await supabase
        .from('team_members')
        .select('assigned_round, team:teams(id, name, team_number, total_score)')
        .eq('user_id', user.id)
        .maybeSingle()

      const team = Array.isArray(membership?.team) ? membership?.team[0] : membership?.team
      if (!cancelled && team) {
        setTeamName(team.name)
        setTeamNumber(team.team_number)
        setTeamScore(team.total_score)
      }
      if (!cancelled) setAssignedRound(membership?.assigned_round ?? null)

      const { data: allTeams } = await supabase.from('teams').select('id, total_score').order('total_score', { ascending: false })
      if (!cancelled && allTeams) {
        setTotalTeams(allTeams.length)
        if (team) {
          const rank = allTeams.findIndex(t => t.id === team.id)
          if (rank >= 0) setTeamRank(rank + 1)
        }
      }

      const stages = await fetchStageStates()
      if (!cancelled) setStageStatuses(Object.fromEntries(Object.entries(stages).map(([slug, s]) => [slug, s.status])))
    }
    load()
    const unsubscribe = subscribeToStageChanges(load)

    const channel = supabase
      .channel('dashboard-teams-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, load)
      .subscribe()

    return () => { cancelled = true; unsubscribe(); supabase.removeChannel(channel) }
  }, [])

  const activeStage = STAGE_META.find(s => stageStatuses[s.slug] === 'live')

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1A6FFF] via-[#0D1B4B] to-[#7B2FFF] p-6 sm:p-8 md:p-10 border border-[#1A6FFF]/40 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black text-xs font-black rounded-full font-display uppercase tracking-widest">
              LIVE EVENT DASHBOARD
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white font-display">
              Welcome, <span className="text-[#FFE600]">{fullName.split(' ')[0]}!</span>
            </h1>
            <p className="text-white/80 font-medium text-sm sm:text-base max-w-xl">
              You are representing <strong className="text-white font-bold">{teamName}{teamNumber ? ` (#${String(teamNumber).padStart(2, '0')})` : ''}</strong>. Today is the day your tribe competes across 8 epic stages.
            </p>
          </div>

          <div className="bg-black/50 backdrop-blur-md border border-white/15 p-5 rounded-2xl flex flex-col items-center sm:items-start gap-3">
            <span className="text-xs text-white/50 font-bold uppercase tracking-wider font-display">Grand Event Countdown</span>
            <Countdown />
          </div>
        </div>
      </div>

      {/* Official Event Pass Ready Banner */}
      <div className="bg-gradient-to-r from-[#FFE600]/15 via-[#FF6B1A]/10 to-[#FF2D87]/15 border border-[#FFE600]/30 rounded-3xl p-5 sm:p-6 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFE600] text-black font-black text-2xl font-display flex items-center justify-center flex-shrink-0 shadow-lg">
            🎟️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#FFE600] font-display">
                ✦ OFFICIAL PASS GENERATED
              </span>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 font-bold text-[10px] rounded-full">
                ACTIVE
              </span>
            </div>
            <h3 className="text-lg font-black text-white font-display mt-0.5">
              Your Digital Event Pass & QR Ticket
            </h3>
            <p className="text-xs text-white/60">
              Present your scannable badge at the main auditorium check-in on Sep 23, 2026.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/pass"
          className="px-5 py-3 rounded-xl bg-[#FFE600] hover:bg-[#ffe600]/90 text-black font-black text-xs uppercase tracking-widest font-display transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap"
        >
          <span>View / Download Pass</span>
          <span>→</span>
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Team Total Score', value: `${teamScore} PTS`, color: '#FFE600', link: '/dashboard/leaderboard' },
          { label: 'Current Leaderboard Rank', value: teamRank ? `#${teamRank} of ${totalTeams}` : '—', color: '#00FFD1', link: '/dashboard/leaderboard' },
          { label: 'Your Assigned Ability', value: assignedRound ? `Round #0${assignedRound}` : '—', color: '#FF2D87', link: '/dashboard/play/playground' },
          { label: 'Campus Stage Active', value: activeStage ? activeStage.name : 'None Live Yet', color: '#D4FF00', link: '/dashboard/play' },
        ].map((s, i) => (
          <Link key={i} href={s.link} className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 p-5 rounded-2xl transition-all group">
            <div className="flex items-center justify-end mb-2">
              <span className="text-xs text-white/30 group-hover:text-white transition-colors font-mono">VIEW</span>
            </div>
            <p className="font-black text-xl md:text-2xl font-display truncate" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-white/50 font-display uppercase tracking-wider mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Main Action CTAs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/play/playground"
          className="p-6 rounded-2xl bg-[#FFE600] text-black font-black font-display flex items-center justify-between shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
        >
          <div>
            <span className="text-xs uppercase tracking-widest text-black/60 block mb-1">Your Mission</span>
            <h3 className="text-xl">PLAY YOUR ROUND</h3>
            <p className="text-xs text-black/70 mt-1 font-sans font-bold">{assignedRound ? `Round #${assignedRound}` : 'Awaiting team assignment'}</p>
          </div>
        </Link>

        <Link
          href="/dashboard/leaderboard"
          className="p-6 rounded-2xl bg-white/[0.05] border border-white/15 text-white font-black font-display flex items-center justify-between hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <div>
            <span className="text-xs uppercase tracking-widest text-[#00FFD1] block mb-1">Live Standings</span>
            <h3 className="text-xl">VIEW LEADERBOARD</h3>
            <p className="text-xs text-white/50 mt-1 font-sans">{totalTeams} Teams competing in real-time</p>
          </div>
        </Link>

        <Link
          href="/dashboard/wall"
          className="p-6 rounded-2xl bg-white/[0.05] border border-white/15 text-white font-black font-display flex items-center justify-between hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <div>
            <span className="text-xs uppercase tracking-widest text-[#FF2D87] block mb-1">Social Feed</span>
            <h3 className="text-xl">THE TRIBE WALL</h3>
            <p className="text-xs text-white/50 mt-1 font-sans">Pin your dreams & photos</p>
          </div>
        </Link>
      </div>

      {/* Activities Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white font-display">All Event Activities</h2>
            <p className="text-white/50 text-xs mt-0.5">Participate across all 8 stages to maximize your team&apos;s total points</p>
          </div>
          <Link href="/dashboard/play" className="text-xs text-[#FFE600] font-bold font-display hover:underline">
            View All Stages (8)
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STAGE_META.map((act, i) => {
            const status = stageStatuses[act.slug] ?? 'locked'
            return (
              <Link
                key={act.slug}
                href={`/dashboard/play/${act.slug}`}
                className="p-5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#FFE600]/40 rounded-2xl transition-all flex items-start gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-white/40 font-bold">STAGE 0{i + 1}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase ${
                      status === 'live' ? 'bg-green-500/20 text-green-400' : status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {status === 'live' ? 'live' : status === 'completed' ? 'done' : 'locked'}
                    </span>
                    <span className="text-xs text-[#FFE600] font-mono font-bold ml-auto">+{act.points} PTS</span>
                  </div>
                  <h3 className="text-lg font-black text-white font-display truncate group-hover:text-[#FFE600] transition-colors">{act.name}</h3>
                  <p className="text-white/50 text-xs line-clamp-2 mt-0.5">{act.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
