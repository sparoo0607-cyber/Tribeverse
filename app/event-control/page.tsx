'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import WallModeration from '@/components/WallModeration'
import {
 fetchStageStates,
 subscribeToStageChanges,
 setStageStatus,
 pushBroadcast,
 StageState,
} from '@/lib/stageStore'

// Only the stages that are on the official itinerary, in running order.
const ITINERARY_SLUGS = ['inauguration', 'briefs', 'talent-hunt', 'playground', 'lunch', 'playground-continuous', 'jam', 'reveal', 'wall']

export default function AdminGamesManagerPage() {
 const [stages, setStages] = useState<Record<string, StageState>>({})
 const [broadcastText, setBroadcastText] = useState('')
 const [lastActionMsg, setLastActionMsg] = useState('')
 const [busySlug, setBusySlug] = useState<string | null>(null)

 useEffect(() =>{
 let cancelled = false

 async function load() {
 const states = await fetchStageStates()
 if (!cancelled) setStages(states)
 }
 load()

 const unsubscribe = subscribeToStageChanges(load)
 return () =>{ cancelled = true; unsubscribe() }
 }, [])

 const flash = (msg: string) =>{
 setLastActionMsg(msg)
 setTimeout(() =>setLastActionMsg(''), 4000)
 }

 const handleStatusChange = async (slug: string, status: 'locked'|'live'|'completed') =>{
 setBusySlug(slug)
 await setStageStatus(slug, status)
 if (slug === 'reveal' && status === 'live') {
 const supabase = createClient()
 await supabase.from('events').update({ reveal_activated: true }).neq('id', '00000000-0000-0000-0000-000000000000')
 await pushBroadcast('The Tribeverse Reveal is live! Head to the main stage now.', 'winner')
 }
 setBusySlug(null)
 flash(` Stage "${slug.toUpperCase()}" status changed to ${status.toUpperCase()}! Student screens updated everywhere.`)
 }

 const handleReset = async () =>{
 if (!window.confirm('Reset the event? Every stage goes back to LOCKED and the reveal is switched off. Participants and wall posts are kept.')) return
 const supabase = createClient()
 await supabase.from('activities').update({ status: 'locked', winner_user_id: null, winner_points: null, revealed_answers: null, custom_note: null }).neq('slug', '')
 await supabase.from('events').update({ status: 'live', reveal_activated: false }).neq('id', '00000000-0000-0000-0000-000000000000')
 flash('Event reset. All stages are locked and the reveal is off.')
 }

 const handleGlobalBroadcast = async (e: React.FormEvent) =>{
 e.preventDefault()
 if (!broadcastText.trim()) return
 await pushBroadcast(broadcastText.trim(), 'info')
 flash(` Global Alert broadcasted to all active participants!`)
 setBroadcastText('')
 }

 return (
 <div className="space-y-8 max-w-5xl mx-auto">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#FF2D87]/20 to-[#7B2FFF]/20 p-6 rounded-3xl border border-[#FF2D87]/30">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="px-3 py-0.5 bg-[#FF2D87] text-white text-[10px] font-black rounded-full font-display uppercase tracking-widest">
 MISSION CONTROL
 </span>
 <span className="text-xs text-green-400 font-mono font-bold">● REALTIME SYNC ACTIVE (Supabase)</span>
 </div>
 <h1 className="text-3xl font-black text-white font-display">Live Game & Stage Controller</h1>
 <p className="text-white/60 text-xs mt-1">
 Lock games so students cannot see questions early. Launch stages live when ready, and reveal official solutions & winners upon conclusion: every change pushes instantly to all connected devices.
 </p>
 </div>
 </div>

 {lastActionMsg && (
 <div className="p-4 bg-green-500/20 border border-green-500/40 rounded-2xl text-green-300 font-bold font-display text-sm text-center animate-bounce-short">
 {lastActionMsg}
 </div>
 )}

 {/* Global Broadcast Push */}
 <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl space-y-3">
 <h3 className="text-base font-black text-white font-display flex items-center gap-2">
 Send Flash Push Alert to All Student Screens
 </h3>
 <form onSubmit={handleGlobalBroadcast} className="flex flex-col sm:flex-row gap-2">
 <input
 type="text"
 required
 placeholder="e.g. Tribe Playground is LIVE! Head to the main arena now."
 value={broadcastText}
 onChange={(e) =>setBroadcastText(e.target.value)}
 className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FFE600]"
 />
 <button
 type="submit"
 className="bg-[#FFE600] text-black font-black px-6 py-2.5 rounded-xl font-display text-xs uppercase tracking-wider hover:bg-[#D4FF00] transition-colors whitespace-nowrap"
 >
 PUSH BROADCAST 
 </button>
 </form>
 </div>

 {/* All 8 Stages Control List */}
 <div className="space-y-4">
 <h3 className="text-xl font-black text-white font-display">Itinerary Stages</h3>

 <div className="space-y-4">
 {ITINERARY_SLUGS.map((slug) => stages[slug]).filter(Boolean).map((st) =>{
 const isLive = st.status ==='live'
 const isLocked = st.status ==='locked'
 const isCompleted = st.status ==='completed'
 const isBusy = busySlug === st.slug

 return (
 <div
 key={st.slug}
 className={` p-6 rounded-3xl border transition-all ${
 isLive
 ? 'bg-green-500/10 border-green-500/40 shadow-lg'
 : isCompleted
 ? 'bg-emerald-950/20 border-emerald-500/30'
 : 'bg-white/[0.03] border-white/10'
 } ${isBusy ? 'opacity-60 pointer-events-none': ''}`}
 >
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 {/* Stage Info */}
 <div className="flex items-start gap-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="font-mono text-[10px] text-white/40 uppercase font-bold">/{st.slug}</span>
 <span
 className={` px-2.5 py-0.5 rounded-full text-[10px] font-black font-display uppercase tracking-wider ${
 isLive
 ? 'bg-green-500/20 text-green-400 border border-green-500/40 animate-pulse'
 : isCompleted
 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
 : 'bg-red-500/20 text-red-400 border border-red-500/40'
 }`}
 >
 {isLive ? 'LIVE': isCompleted ? 'COMPLETED': 'LOCKED'}
 </span>
 </div>
 <h4 className="text-xl font-black text-white font-display">{st.name}</h4>
 </div>
 </div>

 {/* Status Toggle Buttons */}
 <div className="flex flex-wrap items-center gap-2">
 <button
 onClick={() =>handleStatusChange(st.slug, 'locked')}
 className={` px-4 py-2 rounded-xl text-xs font-black font-display uppercase transition-all ${
 isLocked ? 'bg-red-600 text-white shadow-lg': 'bg-white/5 hover:bg-white/10 text-white/50'
 }`}
 >
 Lock Stage
 </button>
 <button
 onClick={() =>handleStatusChange(st.slug, 'live')}
 className={` px-4 py-2 rounded-xl text-xs font-black font-display uppercase transition-all ${
 isLive ? 'bg-green-500 text-black shadow-lg font-black': 'bg-white/5 hover:bg-green-500/20 text-green-400'
 }`}
 >
 Go Live
 </button>
 <button
 onClick={() =>handleStatusChange(st.slug, 'completed')}
 className={` px-4 py-2 rounded-xl text-xs font-black font-display uppercase transition-all ${
 isCompleted ? 'bg-emerald-600 text-white shadow-lg': 'bg-white/5 hover:bg-emerald-500/20 text-emerald-400'
 }`}
 >
 Conclude
 </button>
 </div>
 </div>

 {st.slug ==='playground'&& (
 <div className="mt-4 pt-4 border-t border-white/10">
 <p className="text-xs font-bold text-white/40 font-display uppercase tracking-widest mb-2">Per-Round Controllers</p>
 <div className="flex flex-wrap gap-2">
 <Link
 href="/event-control/playground/quick-eyes"
 className="px-3 py-2 bg-[#1A6FFF]/20 hover:bg-[#1A6FFF]/30 border border-[#1A6FFF]/40 text-[#1A6FFF] rounded-xl text-xs font-black font-display uppercase transition-colors"
 >
 Quick Eyes →
 </Link>
 {['Quick Draw', 'Think Fast', 'Sound Check', 'Reaction Game'].map(name =>(
 <span key={name} className="px-3 py-2 bg-white/[0.03] border border-white/10 text-white/25 rounded-xl text-xs font-black font-display uppercase cursor-not-allowed">
 {name} (soon)
 </span>
 ))}
 </div>
 </div>
 )}

 </div>
 )
 })}
 </div>
 </div>

 <WallModeration />

 <div className="bg-white/[0.03] border border-red-500/20 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h3 className="text-lg font-black text-white font-display">Reset the Event</h3>
 <p className="text-white/50 text-xs mt-0.5">Locks every stage and switches the reveal off. Use it before the event or after a rehearsal.</p>
 </div>
 <button onClick={handleReset} className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black font-display uppercase tracking-wider">Reset Everything</button>
 </div>
 </div>
 )
}
