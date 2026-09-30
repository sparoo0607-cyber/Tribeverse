'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ParticipantRow {
 id: string
 full_name: string
 student_id: string | null
 total_score: number
}

export default function AdminParticipantsPage() {
 const [rows, setRows] = useState<ParticipantRow[]>([])
 const [search, setSearch] = useState('')
 const [loading, setLoading] = useState(true)
 const [busyId, setBusyId] = useState<string | null>(null)

 useEffect(() =>{
 const supabase = createClient()
 let cancelled = false

 async function load() {
 const { data } = await supabase
 .from('profiles')
 .select('id, full_name, student_id, total_score')
 .eq('role', 'student')
 .order('total_score', { ascending: false })
 if (!cancelled && data) setRows(data as ParticipantRow[])
 if (!cancelled) setLoading(false)
 }
 load()

 const channel = supabase
 .channel('admin-participants-sync')
 .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles'}, load)
 .subscribe()
 return () =>{ cancelled = true; supabase.removeChannel(channel) }
 }, [])

 async function adjustScore(p: ParticipantRow, delta: number) {
 const supabase = createClient()
 setBusyId(p.id)
 setRows(prev =>prev.map(r =>r.id === p.id ? { ...r, total_score: Math.max(0, r.total_score + delta) } : r))
 await supabase.rpc('add_user_points', { p_user_id: p.id, p_points: delta })
 setBusyId(null)
 }

 const q = search.toLowerCase()
 const filtered = rows.filter(r =>r.full_name.toLowerCase().includes(q) || (r.student_id ?? '').toLowerCase().includes(q))

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-3xl font-black text-white font-display">Participants & Scores</h1>
 <p className="text-white/50 text-sm">All registered participants with their individual points and quick score overrides.</p>
 </div>
 <input
 type="text"
 placeholder="Search name or ID"
 value={search}
 onChange={(e) =>setSearch(e.target.value)}
 className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#FFE600]"
 />
 </div>

 <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
 {loading ? (
 <div className="flex items-center justify-center py-16">
 <div className="w-8 h-8 border-4 border-[#FFE600] border-t-transparent rounded-full animate-spin"/>
 </div>
 ) : filtered.length === 0 ? (
 <p className="text-center text-white/40 text-sm py-12">No participants found.</p>
 ) : (
 <div className="divide-y divide-white/5">
 {filtered.map(p =>(
 <div key={p.id} className={` flex flex-wrap items-center gap-x-3 gap-y-2 px-4 sm:px-5 py-3.5 hover:bg-white/[0.02] ${busyId === p.id ? 'opacity-60': ''}`}>
 <div className="flex-1 min-w-[100px]">
 <p className="font-bold text-white font-display text-sm">{p.full_name}</p>
 <p className="text-white/30 text-xs font-mono">{p.student_id ?? 'No ID'}</p>
 </div>
 <span className="font-mono font-black text-[#FFE600] shrink-0">{p.total_score}</span>
 <div className="flex gap-1.5 shrink-0 ml-auto">
 <button
 disabled={busyId === p.id}
 onClick={() =>adjustScore(p, 50)}
 className="px-2.5 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold rounded-lg text-xs disabled:opacity-40"
 >
 +50
 </button>
 <button
 disabled={busyId === p.id}
 onClick={() =>adjustScore(p, -50)}
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
