'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchStageStates, subscribeToStageChanges, StageState } from '@/lib/stageStore'

interface StageGuardProps {
 slug: string
 title: string
 stageNumber: string
 points: number
 children: React.ReactNode
}

export default function StageGuard({ slug, title, stageNumber, points, children }: StageGuardProps) {
 const [stageState, setStageState] = useState<StageState | null>(null)
 const [mounted, setMounted] = useState(false)

 useEffect(() =>{
 setMounted(true)
 let cancelled = false

 const update = async () =>{
 const states = await fetchStageStates()
 if (!cancelled && states[slug]) setStageState(states[slug])
 }
 update()

 // Listen for real-time changes pushed by the Admin from any device
 const unsubscribe = subscribeToStageChanges(update)
 return () =>{ cancelled = true; unsubscribe() }
 }, [slug])

 if (!mounted) {
 return (
 <div className="flex items-center justify-center min-h-[300px]">
 <div className="w-10 h-10 border-4 border-[#FFE600] border-t-transparent rounded-full animate-spin"/>
 </div>
 )
 }

 const status = stageState?.status ?? 'locked'
 const result = stageState?.result

 // 1. LOCKED STATE (Students cannot see questions or solutions)
 if (status ==='locked') {
 return (
 <div className="max-w-3xl mx-auto space-y-6">
 <div className="bg-gradient-to-b from-[#1A6FFF]/20 via-black/60 to-black/90 border border-[#1A6FFF]/30 p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-2xl">
 <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black rounded-full font-display uppercase tracking-widest">
 STAGE LOCKED BY HOST
 </div>

 <div className="space-y-2">
 <span className="font-mono text-xs text-white/40 font-bold block uppercase tracking-widest">STAGE {stageNumber}</span>
 <h1 className="text-3xl sm:text-5xl font-black text-white font-display">{title}</h1>
 <p className="text-white/60 text-sm sm:text-base max-w-lg mx-auto">
 This challenge is currently locked. The questions, ciphers, and submission buzzers will activate automatically when the <strong>Event Admin</strong> launches this stage on the main arena screen.
 </p>
 </div>

 <div className="bg-white/5 border border-white/10 p-5 rounded-2xl max-w-md mx-auto space-y-2 text-left">
 <div className="flex justify-between items-center text-xs">
 <span className="text-white/40 uppercase font-display font-bold">Stage Stakes</span>
 <span className="text-[#FFE600] font-black font-mono">+{points} PTS</span>
 </div>
 <div className="flex justify-between items-center text-xs">
 <span className="text-white/40 uppercase font-display font-bold">Live Status</span>
 <span className="text-yellow-400 font-bold">Awaiting Admin Trigger</span>
 </div>
 </div>

 <div className="pt-4 flex flex-wrap justify-center gap-3">
 <Link
 href="/dashboard/play"
 className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl font-display transition-colors"
 >
 Back to Activity Hub
 </Link>
 <Link
 href="/dashboard/leaderboard"
 className="px-6 py-3 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider rounded-xl font-display hover:bg-[#D4FF00] transition-colors"
 >
 Check Current Standings 
 </Link>
 </div>
 </div>
 </div>
 )
 }

 // 2. COMPLETED STATE (Show Round Winner, Answers & Points)
 if (status ==='completed') {
 return (
 <div className="max-w-4xl mx-auto space-y-6">
 {/* Stage Completed Header */}
 <div className="bg-gradient-to-r from-emerald-950/60 via-black to-emerald-950/60 border border-emerald-500/40 p-6 sm:p-8 rounded-3xl text-center space-y-4 shadow-2xl">
 <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black rounded-full font-display uppercase tracking-widest">
 STAGE CONCLUDED & REVEALED
 </div>

 <div>
 <span className="font-mono text-xs text-white/40 font-bold block uppercase tracking-widest">STAGE {stageNumber}</span>
 <h1 className="text-3xl sm:text-5xl font-black text-white font-display mt-1">{title}</h1>
 </div>

 {/* Winner Banner */}
 {result?.winningTeam && (
 <div className="bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-yellow-500/20 border-2 border-[#FFE600]/50 p-6 rounded-2xl max-w-xl mx-auto shadow-xl">
 <p className="text-xs uppercase tracking-widest text-[#FFE600] font-black font-display">Stage 0{stageNumber} Champions</p>
 <h2 className="text-2xl sm:text-3xl font-black text-white font-display my-1">{result.winningTeam}</h2>
 <p className="text-sm font-mono font-bold text-green-400">+{result.winnerPoints ?? points} Points Credited to Leaderboard</p>
 {result.customNote && <p className="text-xs text-white/70 mt-2 font-sans italic">{result.customNote}</p>}
 </div>
 )}
 </div>

 {/* Revealed Official Answers & Logic */}
 {result?.revealedAnswers && result.revealedAnswers.length > 0 && (
 <div className="bg-white/[0.03] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-4">
 <div className="flex items-center justify-between border-b border-white/10 pb-3">
 <h3 className="text-xl font-black text-white font-display flex items-center gap-2">
 Official Revealed Answers & Explanations
 </h3>
 <span className="text-xs text-white/40 font-mono">Verified by Admin</span>
 </div>

 <div className="space-y-4 pt-2">
 {result.revealedAnswers.map((ans, idx) =>(
 <div key={idx} className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-1.5">
 <div className="flex items-center justify-between">
 <span className="font-bold text-white font-display text-sm">{ans.title}</span>
 <span className="text-[10px] font-mono text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded">CORRECT</span>
 </div>
 <p className="font-mono font-bold text-[#FFE600] text-base">{ans.answer}</p>
 <p className="text-white/60 text-xs leading-relaxed font-sans">{ans.explanation}</p>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Action Footer */}
 <div className="flex justify-between items-center bg-white/5 border border-white/10 p-5 rounded-2xl">
 <Link
 href="/dashboard/play"
 className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl font-display transition-colors"
 >
 Next Available Stage
 </Link>
 <Link
 href="/dashboard/leaderboard"
 className="px-6 py-2.5 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider rounded-xl font-display hover:bg-[#D4FF00] transition-colors"
 >
 View Live Leaderboard 
 </Link>
 </div>
 </div>
 )
 }

 // 3. LIVE STATE (Render the active interactive game for the student)
 return <>{children}</>
}
