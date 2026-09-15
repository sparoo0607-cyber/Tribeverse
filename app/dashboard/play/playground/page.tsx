'use client'

import StageGuard from '@/components/StageGuard'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Round, TeamMember } from '@/lib/types'

const ROUND_COLORS = ['#FFE600', '#FF6B1A', '#FF2D87', '#00FFD1', '#7B2FFF']

export default function PlaygroundPage() {
 const [rounds, setRounds] = useState<Round[]>([])
 const [membership, setMembership] = useState<TeamMember|null>(null)
 const [userId, setUserId] = useState<string|null>(null)
 const supabase = createClient()

 useEffect(()=>{
 async function load() {
 const {data:{user}} = await supabase.auth.getUser()
 if (!user) return
 setUserId(user.id)
 const {data:act} = await supabase.from('activities').select('id').eq('slug', 'playground').single()
 if (act) {
 const {data:r} = await supabase.from('rounds').select('*').eq('activity_id',act.id).order('round_number')
 setRounds(r??[])
 }
 const {data:m} = await supabase.from('team_members').select('*').eq('user_id',user.id).single()
 setMembership(m)
 }
 load()
 },[])

 const assignedRound = membership?.assigned_round

 return (
 <StageGuard slug="playground" title="Tribe Playground" stageNumber="01" points={500}>
 <div className="space-y-6">
 <div>
 <h1 className="font-black text-4xl text-white font-display">Tribe Playground</h1>
 <p className="text-white/50 text-sm mt-1">5 Rounds · 5 Members · 5 Different Abilities</p>
 {assignedRound && (
 <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#FFE600]/10 border border-[#FFE600]/30 rounded-full">
 <span className="text-[#FFE600] font-black text-sm font-display">Your Round: #{assignedRound}</span>
 </div>
 )}
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {rounds.map((round) =>{
 const isAssigned = round.round_number === assignedRound
 const isLive = round.status ==='live'
 const canPlay = isAssigned && isLive
 const color = ROUND_COLORS[(round.round_number-1)%5]
 return (
 <div key={round.id}
 className={` rounded-2xl border p-5 transition-all duration-300 ${canPlay? 'border-[#FFE600]/50 bg-[#FFE600]/5': 'bg-white/[0.03] border-white/[0.07]'} ${isAssigned? 'ring-1 ring-[#FFE600]/20': ''}`}>
 <div className="flex items-center gap-3 mb-3">
 <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black font-display text-black"
 style={{background:color}}>
 {String(round.round_number).padStart(2, '0')}
 </div>
 <span className="text-2xl">{round.icon}</span>
 {isAssigned &&<span className="ml-auto text-xs font-black text-[#FFE600] font-display px-2 py-0.5 bg-[#FFE600]/10 rounded-full">YOUR ROUND</span>}
 </div>
 <h3 className="font-black text-white text-lg font-display mb-1">{round.name}</h3>
 <p className="text-white/50 text-sm mb-4">{round.description}</p>
 <div className="flex items-center justify-between">
 <span className={` text-xs font-bold px-2 py-1 rounded-full font-display ${isLive? 'bg-green-500/20 text-green-400':round.status==='completed'? 'bg-white/10 text-white/50': 'bg-white/5 text-white/30'}`}>
 {isLive? 'LIVE':round.status==='completed'? 'DONE': 'LOCKED'}
 </span>
 {canPlay ? (
 <Link href={`/dashboard/play/playground/${round.slug}`}
 className="bg-[#FFE600] text-black font-black text-xs px-4 py-2 rounded-xl font-display hover:bg-[#D4FF00] transition-colors">
 PLAY 
 </Link>
 ) : isAssigned && !isLive ? (
 <span className="text-white/30 text-xs font-bold font-display">Waiting for unlock</span>
 ) : !isAssigned ? (
 <span className="text-white/20 text-xs font-display">Not your round</span>
 ) : null}
 </div>
 </div>
 )
 })}
 </div>

 <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
 <h3 className="font-black text-white text-sm font-display mb-2">How It Works</h3>
 <ul className="space-y-1 text-white/50 text-sm">
 <li>• Each team member is assigned one specific round</li>
 <li>• Only your assigned round will be playable by you</li>
 <li>• Wait for the admin to unlock your round</li>
 <li>• Complete your round to earn points for your team</li>
 </ul>
 </div>
 </div>
 </StageGuard>
 )
}
