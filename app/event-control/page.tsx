'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
 fetchStageStates,
 subscribeToStageChanges,
 setStageStatus,
 revealStageWinner,
 pushBroadcast,
 StageState,
} from '@/lib/stageStore'

interface TeamOption {
 id: string
 name: string
 team_number: number
}

export default function AdminGamesManagerPage() {
 const [stages, setStages] = useState<Record<string, StageState>>({})
 const [teams, setTeams] = useState<TeamOption[]>([])
 const [selectedTeam, setSelectedTeam] = useState<Record<string, string>>({})
 const [customPoints, setCustomPoints] = useState<Record<string, number>>({})
 const [broadcastText, setBroadcastText] = useState('')
 const [lastActionMsg, setLastActionMsg] = useState('')
 const [busySlug, setBusySlug] = useState<string | null>(null)

 useEffect(() =>{
 const supabase = createClient()
 let cancelled = false

 async function load() {
 const states = await fetchStageStates()
 if (!cancelled) setStages(states)

 const { data } = await supabase.from('teams').select('id, name, team_number').order('team_number')
 if (!cancelled && data) setTeams(data)
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
 setBusySlug(null)
 flash(` Stage "${slug.toUpperCase()}" status changed to ${status.toUpperCase()}! Student screens updated everywhere.`)
 }

 const handleRevealWinner = async (slug: string) =>{
 const teamId = selectedTeam[slug] || teams[0]?.id
 if (!teamId) return
 const pts = customPoints[slug] || (slug ==='impossible'? 1500 : slug ==='arcade'? 800 : slug ==='reveal'? 2000 : slug ==='detective'? 600 : 500)

 setBusySlug(slug)
 await revealStageWinner(slug, teamId, pts)
 setBusySlug(null)

 const teamName = teams.find(t =>t.id === teamId)?.name ?? 'A team'
 await pushBroadcast(`${teamName} won Stage: ${stages[slug]?.name}! +${pts} Points awarded. Answers & solutions revealed on student screens!`, 'winner')
 flash(` Results & Official Answers for ${stages[slug]?.name} revealed to all students!`)
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
 Lock games so students cannot see questions early. Launch stages live when ready, and reveal official solutions & winners upon conclusion — every change pushes instantly to all connected devices.
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
 placeholder="e.g. Stage 02 Detective is LIVE! Head to Auditorium. Clues unlock now."
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
 <h3 className="text-xl font-black text-white font-display">8 Event Stages Orchestration</h3>

 <div className="space-y-4">
 {Object.values(stages).map((st) =>{
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
 {isLive ? 'LIVE (Students Playing)': isCompleted ? 'COMPLETED & REVEALED': 'LOCKED (Hidden)'}
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
 Conclude & Show Answers
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

 {st.slug ==='detective'&& (
 <div className="mt-4 pt-4 border-t border-white/10">
 <p className="text-xs font-bold text-white/40 font-display uppercase tracking-widest mb-2">Round-by-Round Controller</p>
 <Link
 href="/event-control/detective"
 className="inline-block px-3 py-2 bg-[#00FFD1]/20 hover:bg-[#00FFD1]/30 border border-[#00FFD1]/40 text-[#00FFD1] rounded-xl text-xs font-black font-display uppercase transition-colors"
 >
 Role Assignment & 5 Rounds →
 </Link>
 </div>
 )}

 {/* Winner Awarding & Results Controller */}
 <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/30 p-4 rounded-2xl">
 <div className="flex flex-wrap items-center gap-2 flex-1">
 <span className="text-xs font-bold text-white/50 font-display">Award Winner:</span>
 <select
 value={selectedTeam[st.slug] || teams[0]?.id ||''}
 onChange={(e) =>setSelectedTeam({ ...selectedTeam, [st.slug]: e.target.value })}
 className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-white font-display text-xs focus:outline-none focus:border-[#FFE600]"
 >
 {teams.map(tm =>(
 <option key={tm.id} value={tm.id} className="bg-[#111418] text-white">
 {tm.name} (#{String(tm.team_number).padStart(2, '0')})
 </option>
 ))}
 </select>

 <input
 type="number"
 placeholder="Points"
 defaultValue={st.result?.winnerPoints || 500}
 onChange={(e) =>setCustomPoints({ ...customPoints, [st.slug]: parseInt(e.target.value) || 500 })}
 className="w-24 bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-[#FFE600] font-mono font-bold text-xs focus:outline-none focus:border-[#FFE600]"
 />
 </div>

 <button
 onClick={() =>handleRevealWinner(st.slug)}
 disabled={teams.length === 0}
 className="px-5 py-2 bg-gradient-to-r from-[#FFE600] to-[#00FFD1] text-black font-black text-xs uppercase tracking-wider rounded-xl font-display hover:scale-105 transition-transform disabled:opacity-40"
 >
 REVEAL ANSWERS & AWARD TEAM 
 </button>
 </div>
 </div>
 )
 })}
 </div>
 </div>
 </div>
 )
}
