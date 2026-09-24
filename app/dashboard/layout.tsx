'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LiveBroadcastBanner from '@/components/LiveBroadcastBanner'
import type { Profile, Team, TeamMember } from '@/lib/types'
import Icon, { IconName } from '@/components/icons/Icon'

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/dashboard', label: 'Home', icon: 'home' },
  { href: '/dashboard/pass', label: 'Event Pass', icon: 'ticket' },
  { href: '/dashboard/event', label: 'Event Guide', icon: 'book' },
  { href: '/dashboard/play', label: 'Play Arena', icon: 'game-controller' },
  { href: '/dashboard/bonus/cipher-hunt', label: 'Bonus: Cipher Hunt', icon: 'search' },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: 'trophy' },
  { href: '/dashboard/wall', label: 'Tribe Wall', icon: 'chat' },
  { href: '/dashboard/profile', label: 'My Profile', icon: 'user' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
 const [profile, setProfile] = useState<Profile | null>(null)
 const [team, setTeam] = useState<Team | null>(null)
 const [membership, setMembership] = useState<TeamMember | null>(null)
 const [sidebarOpen, setSidebarOpen] = useState(false)
 const pathname = usePathname()
 const router = useRouter()
 const supabase = createClient()

 useEffect(() =>{
 async function load() {
 const { data: { user } } = await supabase.auth.getUser()
 if (!user) {
 // Fallback for demo preview
 setProfile({ id: 'demo-student', full_name: 'Rohan Varma', role: 'student', created_at: new Date().toISOString() })
 setTeam({ id: 'demo-team', name: 'Team Titans', team_number: 1, color: '#1A6FFF', total_score: 920, created_at: new Date().toISOString() })
 setMembership({ id: 'demo-mem', team_id: 'demo-team', user_id: 'demo-student', assigned_round: 3, joined_at: new Date().toISOString() })
 return
 }

 const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
 setProfile(p ?? { id: user.id, full_name: user.email?.split('@')[0] ?? 'Student', role: 'student', created_at: new Date().toISOString() })

 const { data: m } = await supabase
 .from('team_members')
 .select('*, team:teams(*)')
 .eq('user_id', user.id)
 .single()
 setMembership(m)
 setTeam(m?.team ?? { id: 'team-1', name: 'Team Titans', team_number: 1, color: '#1A6FFF', total_score: 920, created_at: new Date().toISOString() })
 }
 load()
 }, [])

 async function signOut() {
 await supabase.auth.signOut()
 router.push('/')
 }

 return (
 <div className="min-h-screen bg-[#111418] flex flex-col">
 {/* Real-time Broadcast Banner from Admin */}
 <LiveBroadcastBanner />

 <div className="flex-1 flex">
 {/* Sidebar */}
 <aside className={`
 fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0A0A] border-r border-white/[0.06]
 transform transition-transform duration-300
 lg:relative lg:translate-x-0
 ${sidebarOpen ? 'translate-x-0': '-translate-x-full'}
`}>
 {/* Logo */}
 <div className="p-6 border-b border-white/[0.06]">
 <Link href="/dashboard" className="flex items-baseline gap-2">
 <span className="font-black text-3xl text-[#FFE600] font-display">st.</span>
 <span className="font-bold text-xs tracking-widest text-white/60 uppercase font-display">TRIBEVERSE V1</span>
 </Link>
 {team && (
 <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
 <div className="w-4 h-4 rounded-full" style={{ background: team.color }} />
 <span className="text-xs font-bold text-white truncate font-display">{team.name}</span>
 <span className="text-[10px] text-[#FFE600] font-mono ml-auto font-bold">{team.total_score}p</span>
 </div>
 )}
 </div>

 {/* Nav */}
 <nav className="p-4">
 <ul className="space-y-1">
 {NAV.map(item =>{
 const active = pathname === item.href || (item.href !=='/dashboard'&& pathname.startsWith(item.href))
 return (
 <li key={item.href}>
 <Link
 href={item.href}
 onClick={() =>setSidebarOpen(false)}
 className={`
 flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all font-display
 ${active
 ? 'bg-[#1A6FFF] text-white shadow-lg shadow-[#1A6FFF]/20'
 : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
 }
`}
 >
 <Icon name={item.icon} className="w-5 h-5" />
 {item.label}
 </Link>
 </li>
 )
 })}
 </ul>
 </nav>

 {/* Bottom user */}
 <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.06]">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3 min-w-0">
 <div className="w-9 h-9 rounded-xl bg-[#1A6FFF] flex items-center justify-center text-white font-bold text-sm font-display flex-shrink-0">
 {profile?.full_name?.charAt(0) ?? 'S'}
 </div>
 <div className="min-w-0">
 <p className="font-bold text-white text-sm truncate font-display">{profile?.full_name ?? 'Student'}</p>
 <p className="text-white/40 text-xs truncate">Team Titans (#01)</p>
 </div>
 </div>
 <button
 onClick={signOut}
 className="text-white/40 hover:text-red-400 text-xs p-1.5 rounded-lg hover:bg-white/5 transition-colors font-mono"
 title="Sign out"
 >
 <Icon name="logout" className="w-4 h-4" />
 </button>
 </div>
 </div>
 </aside>

 {/* Mobile overlay */}
 {sidebarOpen && (
 <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() =>setSidebarOpen(false)} />
 )}

 {/* Main content */}
 <div className="flex-1 flex flex-col min-w-0">
 <header className="lg:hidden sticky top-0 z-30 bg-[#0A0A0A]/90 backdrop-blur border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
 <button
 onClick={() =>setSidebarOpen(true)}
 className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white"
 >
 <Icon name="menu" className="w-5 h-5" />
 </button>
 <span className="font-black text-lg text-white font-display">
 <span className="text-[#FFE600]">TRIBE</span>VERSE
 </span>
 <div className="w-9 h-9 rounded-xl bg-[#1A6FFF] flex items-center justify-center text-white font-bold text-sm font-display">
 {profile?.full_name?.charAt(0) ?? 'S'}
 </div>
 </header>

 <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
 {children}
 </main>
 </div>
 </div>
 </div>
 )
}
