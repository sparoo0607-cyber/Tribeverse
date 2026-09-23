'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    teams: 20,
    students: 100,
    tagsIssued: 0,
    activeStage: 'Stage 01 · Tribe Playground',
    totalSubmissions: 48,
    wallPosts: 32,
  })
  const supabase = createClient()

  useEffect(() => {
    async function loadStats() {
      const { count: teamCount } = await supabase.from('teams').select('*', { count: 'exact', head: true })
      const { count: profCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: tagCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('tag_issued', true)
      if (teamCount) setStats((s) => ({ ...s, teams: teamCount }))
      if (profCount) setStats((s) => ({ ...s, students: profCount }))
      if (tagCount !== null) setStats((s) => ({ ...s, tagsIssued: tagCount }))
    }
    loadStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white font-display">Mission Control</h1>
          <p className="text-white/50 text-sm">Real-time TRIBEVERSE V1 event orchestration, QR gate scan & live monitoring</p>
        </div>
        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-black rounded-full font-display">● SYSTEM ONLINE</span>
      </div>

      {/* Spotlight: Gate Check-in & QR Scanner */}
      <div className="bg-gradient-to-r from-[#1A6FFF]/20 via-[#FFE600]/15 to-[#FF2D87]/20 border-2 border-[#FFE600]/40 rounded-3xl p-6 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFE600] text-black flex items-center justify-center text-3xl font-bold shadow-lg">
            📷
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#FFE600] font-black uppercase">
              GATE ADMISSIONS & WRISTBANDS
            </span>
            <h3 className="text-xl font-black text-white font-display">
              Participant QR Scanner & Tag Issuance
            </h3>
            <p className="text-white/70 text-xs mt-0.5">
              Live scanner open at entrance. Verified: <strong className="text-green-400">{stats.tagsIssued}</strong> / {stats.students} wristbands issued.
            </p>
          </div>
        </div>
        <Link
          href="/admin/scanner"
          className="px-6 py-3.5 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black font-black text-xs uppercase tracking-widest rounded-xl font-display transition-all shadow-[0_4px_20px_rgba(255,230,0,0.3)] hover:scale-105 flex items-center gap-2 whitespace-nowrap"
        >
          <span>Open Gate Scanner</span>
          <span>→</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Registered Teams', val: stats.teams, icon: '👥', color: '#1A6FFF', link: '/admin/teams' },
          { label: 'Active Students', val: stats.students, icon: '🎓', color: '#00FFD1', link: '/admin/teams' },
          { label: 'Tags / Wristbands Issued', val: stats.tagsIssued, icon: '🏷️', color: '#00FF88', link: '/admin/scanner' },
          { label: 'Wall Photos & Posts', val: stats.wallPosts, icon: '💬', color: '#FF2D87', link: '/admin/monitor' },
        ].map((m, i) => (
          <Link key={i} href={m.link} className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{m.icon}</span>
              <span className="text-xs font-bold text-white/40 font-display">VIEW</span>
            </div>
            <p className="text-3xl font-black text-white font-display mb-1">{m.val}</p>
            <p className="text-white/50 text-xs font-display">{m.label}</p>
          </Link>
        ))}
      </div>

 {/* Quick Stage Controls */}
 <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-4">
 <h2 className="text-xl font-black text-white font-display">Quick Stage Actions</h2>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
 {[
 { name: 'Playground', route: '/event-control', color: '#1A6FFF'},
 { name: 'Detective', route: '/event-control/detective', color: '#00FFD1'},
 { name: 'Lunch Break', route: '/admin/event', color: '#FF6B1A'},
 { name: 'Jam', route: '/event-flow#jam', color: '#7B2FFF'},
 { name: 'Wall', route: '/event-flow#wall', color: '#D4FF00'},
 { name: 'Reveal', route: '/admin/reveal', color: '#FFE600'},
 ].map((act, i) =>(
 <Link
 key={i}
 href={act.route}
 className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center font-bold text-white font-display text-xs transition-all hover:scale-105"
 >
 <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ background: act.color }} />
 {act.name}
 </Link>
 ))}
 </div>
 </div>
 </div>
 )
}
