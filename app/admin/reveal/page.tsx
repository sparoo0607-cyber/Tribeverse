'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { pushBroadcast } from '@/lib/stageStore'

export default function AdminRevealControlPage() {
 const [eventId, setEventId] = useState<string | null>(null)
 const [scoresLocked, setScoresLocked] = useState(false)
 const [revealTriggered, setRevealTriggered] = useState(false)
 const [loading, setLoading] = useState(true)

 useEffect(() =>{
 const supabase = createClient()
 let cancelled = false

 async function load() {
 const { data } = await supabase.from('events').select('id, status, reveal_activated').order('created_at').limit(1).maybeSingle()
 if (cancelled || !data) return
 setEventId(data.id)
 setScoresLocked(data.status ==='ended')
 setRevealTriggered(data.reveal_activated)
 setLoading(false)
 }
 load()

 const channel = supabase
 .channel('admin-reveal-sync')
 .on('postgres_changes', { event: '*', schema: 'public', table: 'events'}, load)
 .subscribe()

 return () =>{ cancelled = true; supabase.removeChannel(channel) }
 }, [])

 const toggleScoreLock = async () =>{
 if (!eventId) return
 const supabase = createClient()
 const next = !scoresLocked
 setScoresLocked(next)
 await supabase.from('events').update({ status: next ? 'ended': 'live'}).eq('id', eventId)
 if (next) await pushBroadcast('Final scores are now locked! No further submissions will be counted.', 'alert')
 }

 const triggerReveal = async () =>{
 if (!eventId || revealTriggered) return
 const supabase = createClient()
 setRevealTriggered(true)
 await supabase.from('events').update({ reveal_activated: true }).eq('id', eventId)
 await supabase.from('activities').update({ status: 'live'}).eq('slug', 'reveal')
 await pushBroadcast('THE GRAND FINALE REVEAL IS LIVE! Head to the main stage now!', 'winner')
 }

 return (
 <div className="space-y-6 max-w-4xl">
 <div>
 <h1 className="text-3xl font-black text-white font-display">Tribeverse Reveal Control</h1>
 <p className="text-white/50 text-sm">Lock final scores, freeze the leaderboard, and trigger the synchronized Grand Finale reveal broadcast.</p>
 </div>

 <div className={` grid grid-cols-1 md:grid-cols-2 gap-6 ${loading ? 'opacity-50 pointer-events-none': ''}`}>
 <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-4">
 <h3 className="text-xl font-black text-white font-display">Step 1: Score Lock</h3>
 <p className="text-white/60 text-sm">Freeze all game points and disable further student submissions.</p>
 <button
 onClick={toggleScoreLock}
 className={` w-full py-4 rounded-xl font-black font-display text-sm uppercase tracking-wider transition-all ${scoresLocked ? 'bg-red-500/20 text-red-400 border border-red-500/40': 'bg-red-600 text-white hover:bg-red-500'}`}
 >
 {scoresLocked ? 'SCORES LOCKED': 'FREEZE LEADERBOARD SCORES'}
 </button>
 </div>

 <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-4">
 <h3 className="text-xl font-black text-white font-display">Step 2: Trigger Finale Reveal</h3>
 <p className="text-white/60 text-sm">Push the Tribeverse Reveal stage live and broadcast the winner podium announcement to all student screens.</p>
 <button
 disabled={revealTriggered}
 onClick={triggerReveal}
 className="w-full py-4 rounded-xl font-black font-display text-sm uppercase tracking-wider bg-gradient-to-r from-[#FFE600] to-[#00FFD1] text-black hover:scale-[1.02] transition-transform disabled:opacity-50"
 >
 {revealTriggered ? 'FINALE BROADCAST LIVE': 'LAUNCH GRAND FINALE REVEAL'}
 </button>
 </div>
 </div>
 </div>
 )
}
