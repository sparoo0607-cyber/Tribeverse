'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TeamRow {
 id: string
 name: string
 team_number: number
 color: string
 total_score: number
}

export default function LeaderboardPage() {
 const [teams, setTeams] = useState<TeamRow[]>([])
 const [loading, setLoading] = useState(true)
 const [search, setSearch] = useState('')

 useEffect(() =>{
 const supabase = createClient()
 let cancelled = false

 async function load() {
 const { data } = await supabase
 .from('teams')
 .select('id, name, team_number, color, total_score')
 .order('total_score', { ascending: false })
 if (!cancelled && data) setTeams(data)
 if (!cancelled) setLoading(false)
 }
 load()

 const channel = supabase
 .channel('leaderboard-sync')
 .on('postgres_changes', { event: '*', schema: 'public', table: 'teams'}, load)
 .subscribe()

 return () =>{ cancelled = true; supabase.removeChannel(channel) }
 }, [])

 const filtered = teams.filter(t =>t.name.toLowerCase().includes(search.toLowerCase()) || String(t.team_number).includes(search))
 const [first, second, third] = teams

 return (
 <div className="space-y-8 max-w-5xl mx-auto">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"/>
 <span className="text-xs text-green-400 font-bold uppercase tracking-widest font-display">Live Standings</span>
 </div>
 <h1 className="text-3xl sm:text-5xl font-black text-white font-display">Team Leaderboard</h1>
 <p className="text-white/50 text-sm mt-0.5">Real-time team rankings across all 20 competing tribes</p>
 </div>
 <input
 type="text"
 placeholder="Search team or #..."
 value={search}
 onChange={(e) =>setSearch(e.target.value)}
 className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FFE600] w-full sm:w-64"
 />
 </div>

 {loading ? (
 <div className="flex items-center justify-center py-24">
 <div className="w-10 h-10 border-4 border-[#FFE600] border-t-transparent rounded-full animate-spin"/>
 </div>
 ) : teams.length === 0 ? (
 <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-12 text-center text-white/50">
 No teams have been registered yet.
 </div>
 ) : (
 <>
 {/* Podium Showcase (Top 3) */}
 <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-8 pb-4 max-w-xl mx-auto">
 {/* Rank 2 (Silver) */}
 <div className="flex flex-col items-center">
 <span className="text-3xl sm:text-4xl mb-1"></span>
 <div className="text-center mb-2">
 <p className="font-black text-xs sm:text-sm text-white font-display truncate max-w-[100px]">{second?.name ?? '—'}</p>
 <p className="text-xs font-mono font-bold text-gray-300">{second?.total_score ?? 0} pts</p>
 </div>
 <div className="w-full h-28 sm:h-36 rounded-t-2xl bg-gradient-to-t from-gray-700 to-gray-400 flex items-center justify-center font-black text-2xl sm:text-4xl text-black font-display shadow-lg">
 #2
 </div>
 </div>

 {/* Rank 1 (Gold) */}
 <div className="flex flex-col items-center">
 <span className="text-4xl sm:text-5xl mb-1 animate-bounce"></span>
 <div className="text-center mb-2">
 <p className="font-black text-sm sm:text-base text-white font-display truncate max-w-[120px]">{first?.name ?? '—'}</p>
 <p className="text-sm font-mono font-black text-[#FFE600]">{first?.total_score ?? 0} pts</p>
 </div>
 <div className="w-full h-36 sm:h-48 rounded-t-2xl bg-gradient-to-t from-yellow-600 via-[#FFE600] to-yellow-300 flex items-center justify-center font-black text-3xl sm:text-5xl text-black font-display shadow-2xl border-t-2 border-white/40">
 #1
 </div>
 </div>

 {/* Rank 3 (Bronze) */}
 <div className="flex flex-col items-center">
 <span className="text-3xl sm:text-4xl mb-1"></span>
 <div className="text-center mb-2">
 <p className="font-black text-xs sm:text-sm text-white font-display truncate max-w-[100px]">{third?.name ?? '—'}</p>
 <p className="text-xs font-mono font-bold text-amber-500">{third?.total_score ?? 0} pts</p>
 </div>
 <div className="w-full h-20 sm:h-28 rounded-t-2xl bg-gradient-to-t from-amber-900 to-amber-600 flex items-center justify-center font-black text-2xl sm:text-3xl text-white font-display shadow-lg">
 #3
 </div>
 </div>
 </div>

 {/* Rankings Table */}
 <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
 <div className="grid grid-cols-[50px_1fr_100px] sm:grid-cols-[60px_1fr_120px] px-5 py-3.5 bg-white/5 border-b border-white/10 text-xs font-black text-white/40 font-display uppercase tracking-widest">
 <span>Rank</span>
 <span>Team Name</span>
 <span className="text-right">Total Score</span>
 </div>
 <div className="divide-y divide-white/5">
 {filtered.map((t, idx) =>(
 <div
 key={t.id}
 className={` grid grid-cols-[50px_1fr_100px] sm:grid-cols-[60px_1fr_120px] px-5 py-3.5 items-center transition-colors hover:bg-white/[0.04] ${idx< 3 ? 'bg-white/[0.02]': ''}`}
 >
 <div className="flex items-center">
 {idx === 0 ?<span className="text-lg"></span>: idx === 1 ?<span className="text-lg"></span>: idx === 2 ?<span className="text-lg"></span>: (
 <span className="font-mono text-white/40 font-bold text-sm">#{idx + 1}</span>
 )}
 </div>
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs font-display flex-shrink-0" style={{ background: t.color }}>
 {String(t.team_number).padStart(2, '0')}
 </div>
 <p className="font-bold text-white font-display text-sm truncate">{t.name}</p>
 </div>
 <div className="text-right">
 <span className="font-mono font-black text-[#FFE600] text-base">{t.total_score}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </>
 )}
 </div>
 )
}
