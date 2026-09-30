'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Icon, { IconName } from '@/components/icons/Icon'

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/admin', label: 'Control Center', icon: 'bolt' },
  { href: '/event-control', label: 'Event Control', icon: 'monitor' },
  { href: '/admin/scanner', label: 'QR Check-in & Tags', icon: 'camera' },
  { href: '/admin/participants', label: 'Participants', icon: 'users' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
 const [name, setName] = useState('')
 const [sidebarOpen, setSidebarOpen] = useState(false)
 const pathname = usePathname()
 const router = useRouter()
 const supabase = createClient()

 useEffect(() =>{
 supabase.auth.getUser().then(({data:{user}}) =>{
 if (!user) return
 supabase.from('profiles').select('full_name,role').eq('id', user.id).single().then(({data}) =>{
 setName(data?.full_name ?? 'Lead Admin')
 })
 })
 }, [])

 async function signOut() {
 await supabase.auth.signOut(); router.push('/')
 }

 return (
 <div className="min-h-screen bg-[#0A0A0A] flex">
 <aside className={` fixed inset-y-0 left-0 z-50 w-64 bg-[#050505] border-r border-white/[0.06] transform transition-transform duration-300 flex flex-col lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${sidebarOpen? 'translate-x-0': '-translate-x-full'}`}>
 <div className="p-6 border-b border-white/[0.06]">
 <div className="flex items-baseline gap-2 mb-1">
 <span className="font-black text-3xl text-[#FF2D87] font-display">st.</span>
 <span className="font-bold text-xs tracking-widest text-white/60 uppercase font-display">Admin</span>
 </div>
 <p className="font-black text-[#FFE600] text-sm tracking-widest font-display">TRIBEVERSE CONTROL</p>
 </div>
 <div className="p-4 border-b border-white/[0.06]">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-lg bg-[#FF2D87] flex items-center justify-center text-white font-bold text-sm">
 {name.charAt(0)}
 </div>
 <div>
 <p className="font-bold text-white text-sm truncate font-display">{name}</p>
 <p className="text-[#FF2D87] text-xs font-bold">ADMIN</p>
 </div>
 </div>
 </div>
 <nav className="p-4 flex-1 overflow-y-auto">
 <ul className="space-y-1">
 {NAV.map(item =>{
 const active = pathname === item.href || (item.href !=='/admin'&& pathname.startsWith(item.href))
 return (
 <li key={item.href}>
 <Link href={item.href} onClick={()=>setSidebarOpen(false)}
 className={` flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all font-display ${active? 'bg-[#FF2D87] text-white': 'text-white/50 hover:text-white hover:bg-white/[0.06]'}`}>
 <Icon name={item.icon} className="w-5 h-5" /> {item.label}
 </Link>
 </li>
 )
 })}
 </ul>
 </nav>
 <div className="shrink-0 p-4 border-t border-white/[0.06]">
 <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 font-bold text-sm transition-colors font-display">
 Sign Out
 </button>
 </div>
 </aside>

 {sidebarOpen &&<div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}

 <div className="flex-1 flex flex-col min-w-0">
 <header className="lg:hidden sticky top-0 z-30 bg-[#050505]/90 backdrop-blur border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
 <button onClick={()=>setSidebarOpen(true)} className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-white"><Icon name="menu" className="w-5 h-5" /></button>
 <span className="font-black text-[#FF2D87] font-display">ADMIN</span>
 <div className="w-9 h-9 rounded-xl bg-[#FF2D87] flex items-center justify-center text-white font-bold">{name.charAt(0)}</div>
 </header>
 <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
 </div>
 </div>
 )
}
