'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { fetchStageStates, subscribeToStageChanges } from '@/lib/stageStore'

// /event-control (index) already lists and controls all 8 stages in one
// screen. Only stages with a dedicated per-round controller drill further —
// today that's just Playground → Quick Eyes. Add an entry here once a
// stage gets its own route so the sidebar never links to a 404.
const STAGES = [
  { href: '/event-control', label: 'All Stages', slug: null, icon: '🎬' },
  { href: '/event-control/playground/quick-eyes', label: 'Playground · Quick Eyes', slug: 'playground', icon: '🎮' },
  { href: '/event-control/detective', label: 'Detective', slug: 'detective', icon: '🕵️' },
]

export default function EventControlLayout({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stageStatuses, setStageStatuses] = useState<Record<string, string>>({})
  const [teamCount, setTeamCount] = useState(20)
  const [studentCount, setStudentCount] = useState(100)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setName('Event Controller'); return }
      supabase.from('profiles').select('full_name').eq('id', user.id).single().then(({ data }) => {
        setName(data?.full_name ?? 'Event Controller')
      })
    })

    async function loadStages() {
      const stages = await fetchStageStates()
      setStageStatuses(Object.fromEntries(Object.entries(stages).map(([slug, s]) => [slug, s.status])))
    }
    loadStages()
    const unsub = subscribeToStageChanges(loadStages)

    async function loadCounts() {
      const { count: teams } = await supabase.from('teams').select('*', { count: 'exact', head: true })
      const { count: students } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      if (teams) setTeamCount(teams)
      if (students) setStudentCount(students)
    }
    loadCounts()

    return () => unsub()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const liveStage = STAGES.find((s) => s.slug && stageStatuses[s.slug] === 'live')

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Left sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#050505] border-r border-white/[0.06] transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-black text-3xl text-[#00FFD1] font-display">st.</span>
            <span className="font-bold text-xs tracking-widest text-white/60 uppercase font-display">Event Control</span>
          </div>
          <p className="font-black text-[#FFE600] text-sm tracking-widest font-display">TRIBEVERSE COCKPIT</p>
          <span className="inline-block mt-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-black rounded-full font-display">● LIVE STATUS</span>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {STAGES.map((item) => {
              const active = pathname === item.href || (item.href !== '/event-control' && pathname.startsWith(item.href))
              const status = item.slug ? stageStatuses[item.slug] ?? 'locked' : null
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all font-display ${active ? 'bg-[#00FFD1] text-black' : 'text-white/50 hover:text-white hover:bg-white/[0.06]'}`}
                  >
                    <span className="flex items-center gap-3"><span className="text-lg">{item.icon}</span>{item.label}</span>
                    {status && (
                      <span className={`w-2 h-2 rounded-full ${status === 'live' ? 'bg-green-400' : status === 'completed' ? 'bg-emerald-500' : 'bg-white/20'}`} />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.06] space-y-1">
          <p className="text-white/40 text-xs px-2">{name}</p>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 font-bold text-sm transition-colors font-display">
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main + right status panel */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        <div className="flex-1 min-w-0">
          <header className="lg:hidden sticky top-0 z-30 bg-[#050505]/90 backdrop-blur border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-white">☰</button>
            <span className="font-black text-[#00FFD1] font-display">EVENT CONTROL</span>
            <div className="w-9 h-9" />
          </header>
          <main className="p-6 lg:p-8">{children}</main>
        </div>

        <aside className="lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-white/[0.06] p-6 space-y-4">
          <h3 className="text-xs font-black text-white/40 uppercase tracking-widest font-display">Live Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3">
              <span className="text-white/50 text-xs font-display">Participants</span>
              <span className="text-white font-black font-mono">{studentCount}</span>
            </div>
            <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3">
              <span className="text-white/50 text-xs font-display">Teams</span>
              <span className="text-white font-black font-mono">{teamCount}</span>
            </div>
            <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3">
              <span className="text-white/50 text-xs font-display">Current Stage</span>
              <span className="text-[#FFE600] font-black font-mono text-xs text-right">{liveStage ? liveStage.label : 'None Live'}</span>
            </div>
            <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3">
              <span className="text-white/50 text-xs font-display">System</span>
              <span className="text-green-400 font-black font-mono text-xs">CONNECTED</span>
            </div>
          </div>
          <Link
            href="/display"
            target="_blank"
            className="block text-center mt-4 px-4 py-3 rounded-xl bg-[#FFE600] text-black font-black text-xs uppercase font-display hover:scale-105 transition-transform"
          >
            Open Projector Display →
          </Link>
        </aside>
      </div>
    </div>
  )
}
