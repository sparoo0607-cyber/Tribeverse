'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TeamRow {
 id: string
 name: string
 team_number: number
 color: string
 total_score: number
 member_count: number
}

export default function AdminTeamsPage() {
 const [teams, setTeams] = useState<TeamRow[]>([])
 const [search, setSearch] = useState('')
 const [loading, setLoading] = useState(true)
 const [busyId, setBusyId] = useState<string | null>(null)

 useEffect(() =>{
 const supabase = createClient()
 let cancelled = false

 async function load() {
 const { data: teamRows } = await supabase
 .from('teams')
 .select('id, name, team_number, color, total_score')
 .order('team_number')
 const { data: memberRows } = await supabase.from('team_members').select('team_id')

 if (cancelled || !teamRows) return
 const counts = new Map<string, number>()
 for (const m of memberRows ?? []) {
 counts.set(m.team_id, (counts.get(m.team_id) ?? 0) + 1)
 }
 setTeams(teamRows.map(t =>({ ...t, member_count: counts.get(t.id) ?? 0 })))
 setLoading(false)
 }
 load()

 const channel = supabase
 .channel('admin-teams-sync')
 .on('postgres_changes', { event: '*', schema: 'public', table: 'teams'}, load)
 .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members'}, load)
 .subscribe()

 return () =>{ cancelled = true; supabase.removeChannel(channel) }
 }, [])

 const adjustScore = async (team: TeamRow, delta: number) =>{
 const supabase = createClient()
 const nextScore = Math.max(0, team.total_score + delta)
 setBusyId(team.id)
 setTeams(prev =>prev.map(t =>t.id === team.id ? { ...t, total_score: nextScore } : t))
 await supabase.from('teams').update({ total_score: nextScore }).eq('id', team.id)
 setBusyId(null)
 }

 const filtered = teams.filter(t =>t.name.toLowerCase().includes(search.toLowerCase()) || String(t.team_number).includes(search))

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-3xl font-black text-white font-display">Team Directory</h1>
 <p className="text-white/50 text-sm">Manage all 20 competing teams, member assignments, and score overrides.</p>
 </div>
 <input
 type="text"
 placeholder="Search team name or #"
 value={search}
 onChange={(e) =>setSearch(e.target.value)}
 className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#FFE600]"
 />
 </div>

 <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
 <div className="hidden sm:grid grid-cols-[60px_1fr_100px_140px] px-5 py-3 bg-white/5 border-b border-white/10 text-xs font-black text-white/40 font-display uppercase">
 <span>#</span>
 <span>Team</span>
 <span>Score</span>
 <span className="text-right">Quick Adjust</span>
 </div>
 {loading ? (
 <div className="flex items-center justify-center py-16">
 <div className="w-8 h-8 border-4 border-[#FFE600] border-t-transparent rounded-full animate-spin"/>
 </div>
 ) : (
 <div className="divide-y divide-white/5">
 {filtered.map(t =>(
 <div key={t.id} className={` flex flex-wrap items-center gap-x-3 gap-y-2 px-4 sm:px-5 py-3.5 hover:bg-white/[0.02] ${busyId === t.id ? 'opacity-60': ''}`}>
 <span className="font-mono text-white/40 font-bold w-9 shrink-0">#{String(t.team_number).padStart(2, '0')}</span>
 <div className="flex-1 min-w-[100px]">
 <p className="font-bold text-white font-display text-sm">{t.name}</p>
 <p className="text-white/30 text-xs">{t.member_count} Members</p>
 </div>
 <span className="font-mono font-black text-[#FFE600] shrink-0">{t.total_score}</span>
 <div className="flex gap-1.5 shrink-0 ml-auto">
 <button
 disabled={busyId === t.id}
 onClick={() =>adjustScore(t, 50)}
 className="px-2.5 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold rounded-lg text-xs disabled:opacity-40"
 >
 +50
 </button>
 <button
 disabled={busyId === t.id}
 onClick={() =>adjustScore(t, -50)}
 className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-lg text-xs disabled:opacity-40"
 >
 -50
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )
}
