'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { pushBroadcast } from '@/lib/stageStore'

type EventStatus ='upcoming'|'live'|'paused'|'ended'

export default function AdminEventControlPage() {
 const [eventId, setEventId] = useState<string | null>(null)
 const [eventStatus, setEventStatus] = useState<EventStatus>('upcoming')
 const [loading, setLoading] = useState(true)
 const [broadcastMessage, setBroadcastMessage] = useState('')
 const [broadcastSent, setBroadcastSent] = useState(false)

 useEffect(() =>{
 const supabase = createClient()
 let cancelled = false

 async function load() {
 const { data } = await supabase.from('events').select('id, status').order('created_at').limit(1).maybeSingle()
 if (cancelled || !data) return
 setEventId(data.id)
 setEventStatus(data.status)
 setLoading(false)
 }
 load()

 const channel = supabase
 .channel('admin-event-sync')
 .on('postgres_changes', { event: '*', schema: 'public', table: 'events'}, load)
 .subscribe()

 return () =>{ cancelled = true; supabase.removeChannel(channel) }
 }, [])

 const setStatus = async (status: EventStatus) =>{
 if (!eventId) return
 const supabase = createClient()
 setEventStatus(status)
 await supabase.from('events').update({ status }).eq('id', eventId)
 }

 const handleBroadcast = async (e: React.FormEvent) =>{
 e.preventDefault()
 if (!broadcastMessage.trim()) return
 await pushBroadcast(broadcastMessage.trim(), 'alert')
 setBroadcastSent(true)
 setTimeout(() =>setBroadcastSent(false), 2000)
 setBroadcastMessage('')
 }

 return (
 <div className="space-y-6 max-w-4xl">
 <div>
 <h1 className="text-3xl font-black text-white font-display">Event & Stage Controller</h1>
 <p className="text-white/50 text-sm">Control the global event state and send emergency broadcasts. Per-stage lock/live/reveal lives in Game Manager.</p>
 </div>

 {/* Global Event State */}
 <div className={` bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-4 ${loading ? 'opacity-50 pointer-events-none': ''}`}>
 <h3 className="text-lg font-black text-white font-display">Global Event Status</h3>
 <div className="flex flex-wrap gap-3">
 {(['upcoming', 'live', 'paused', 'ended'] as const).map(st =>(
 <button
 key={st}
 onClick={() =>setStatus(st)}
 className={` px-6 py-3 rounded-xl font-black font-display text-sm uppercase transition-all ${eventStatus === st ? (st ==='live'? 'bg-green-500 text-black': st ==='paused'? 'bg-[#FFE600] text-black': st ==='ended'? 'bg-red-500 text-white': 'bg-white/20 text-white') : 'bg-white/5 text-white/50'}`}
 >
 {st ==='live'? 'Live': st ==='paused'? 'Paused': st ==='ended'? 'Ended': 'Upcoming'}
 </button>
 ))}
 </div>
 <p className="text-white/40 text-xs">This pushes instantly to every connected device via Supabase Realtime.</p>
 </div>

 {/* Link to per-stage controller */}
 <Link
 href="/event-control"
 className="block bg-white/[0.03] border border-white/10 hover:border-[#FFE600]/40 p-6 rounded-2xl transition-all"
 >
 <h3 className="text-lg font-black text-white font-display">Lock / Go Live / Reveal per Stage</h3>
 <p className="text-white/50 text-sm mt-1">Manage each of the 8 stages individually, award winners, and reveal official answers in the Game Manager.</p>
 </Link>

 {/* Global Broadcast */}
 <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-4">
 <h3 className="text-lg font-black text-white font-display">Push Global Emergency Broadcast</h3>
 <form onSubmit={handleBroadcast} className="space-y-3">
 <input
 type="text"
 required
 placeholder="e.g. All teams report to the Main Auditorium immediately"
 value={broadcastMessage}
 onChange={(e) =>setBroadcastMessage(e.target.value)}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FFE600]"
 />
 <button
 type="submit"
 className="bg-[#FFE600] text-black font-black px-6 py-3 rounded-xl font-display text-sm hover:bg-[#D4FF00] transition-colors"
 >
 BROADCAST TO ALL PARTICIPANTS 
 </button>
 </form>
 {broadcastSent && (
 <p className="text-green-400 text-xs font-display font-bold">Broadcast pushed to all active participant dashboards!</p>
 )}
 </div>
 </div>
 )
}
