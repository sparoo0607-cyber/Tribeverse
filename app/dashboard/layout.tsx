'use client'

import PostponedBanner from '@/components/PostponedBanner'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LiveBroadcastBanner from '@/components/LiveBroadcastBanner'
import type { Profile } from '@/lib/types'
import Icon, { IconName } from '@/components/icons/Icon'

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/dashboard', label: 'Home', icon: 'home' },
  { href: '/dashboard/pass', label: 'Event Pass', icon: 'ticket' },
  { href: '/dashboard/event', label: 'Event Guide', icon: 'book' },
  { href: '/dashboard/play', label: 'Play', icon: 'game-controller' },
  { href: '/dashboard/wall', label: 'Tribe Wall', icon: 'chat' },
  { href: '/dashboard/profile', label: 'My Profile', icon: 'user' },
]

const TABS: { href: string; short: string; icon: IconName }[] = [
  { href: '/dashboard', short: 'Home', icon: 'home' },
  { href: '/dashboard/pass', short: 'Pass', icon: 'ticket' },
  { href: '/dashboard/event', short: 'Guide', icon: 'book' },
  { href: '/dashboard/play', short: 'Play', icon: 'game-controller' },
  { href: '/dashboard/wall', short: 'Wall', icon: 'chat' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
 const [profile, setProfile] = useState<Profile | null>(null)
 const pathname = usePathname()
 const router = useRouter()
 const supabase = createClient()

 useEffect(() =>{
 async function load() {
 const { data: { user } } = await supabase.auth.getUser()
 if (!user) return

 const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
 setProfile(p ?? { id: user.id, full_name: user.email?.split('@')[0] ?? 'Student', role: 'student', created_at: new Date().toISOString() })

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
 <aside className="hidden lg:flex flex-col sticky top-0 h-screen shrink-0 w-64 bg-[#0A0A0A] border-r border-white/[0.06]">
 {/* Logo */}
 <div className="p-6 border-b border-white/[0.06] shrink-0">
 <Link href="/dashboard" className="flex items-baseline gap-2">
 <span className="font-black text-3xl text-[#FFE600] font-display">st.</span>
 <span className="font-bold text-xs tracking-widest text-white/60 uppercase font-display">TRIBEVERSE V1</span>
 </Link>
 <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-[#FFE600]/10 rounded-xl border border-[#FFE600]/20">
 <div className="w-2.5 h-2.5 rounded-full bg-[#00FFD1] animate-pulse" />
 <span className="text-[11px] font-bold text-white truncate font-display">Official Participant</span>
 <span className="text-[10px] text-[#FFE600] font-mono ml-auto font-bold">ANITS</span>
 </div>
 </div>

 {/* Nav */}
 <nav className="p-4 flex-1 overflow-y-auto">
 <ul className="space-y-1">
 {NAV.map(item =>{
 const active = pathname === item.href || (item.href !=='/dashboard'&& pathname.startsWith(item.href))
 return (
 <li key={item.href}>
 <Link
 href={item.href}
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
 <div className="p-4 border-t border-white/[0.06] shrink-0">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3 min-w-0">
 <div className="w-9 h-9 rounded-xl bg-[#1A6FFF] flex items-center justify-center text-white font-bold text-sm font-display flex-shrink-0">
 {profile?.full_name?.charAt(0) ?? 'S'}
 </div>
 <div className="min-w-0">
 <p className="font-bold text-white text-sm truncate font-display">{profile?.full_name ?? 'Student'}</p>
 <p className="text-white/40 text-xs truncate">Student Tribe · Freshers V1</p>
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

 {/* Main content */}
 <div className="flex-1 flex flex-col min-w-0">
 <header className="lg:hidden sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
 <Link href="/dashboard" className="flex items-baseline gap-2">
 <span className="font-black text-2xl text-[#FFE600] font-display">st.</span>
 <span className="font-black text-sm tracking-widest text-white font-display">TRIBEVERSE</span>
 </Link>
 <Link
 href="/dashboard/profile"
 aria-label="My profile"
 className="w-9 h-9 rounded-xl bg-[#1A6FFF] flex items-center justify-center text-white font-bold text-sm font-display"
 >
 {profile?.full_name?.charAt(0) ?? 'S'}
 </Link>
 </header>

 <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 overflow-auto">
 <PostponedBanner className="mb-4" />
 {children}
 </main>

 {/* Mobile bottom tab bar */}
 <nav
 aria-label="Primary"
 className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0A0A0A]/95 backdrop-blur border-t border-white/10"
 style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
 >
 <ul className="grid grid-cols-5">
 {TABS.map(item => {
 const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
 return (
 <li key={item.href}>
 <Link
 href={item.href}
 className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold font-display ${active ? 'text-[#FFE600]' : 'text-white/50'}`}
 >
 <Icon name={item.icon} className="w-5 h-5" />
 {item.short}
 </Link>
 </li>
 )
 })}
 </ul>
 </nav>
 </div>
 </div>
 </div>
 )
}
