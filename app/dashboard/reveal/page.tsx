'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import StageGuard from '@/components/StageGuard'

export default function TribeverseRevealPage() {
 const [unlocked, setUnlocked] = useState(false)
 const [countdown, setCountdown] = useState(10)

 useEffect(() =>{
 if (countdown >0 && !unlocked) {
 const t = setTimeout(() =>setCountdown(c =>c - 1), 1000)
 return () =>clearTimeout(t)
 } else {
 setUnlocked(true)
 }
 }, [countdown, unlocked])

 return (
 <StageGuard slug="reveal" title="Tribeverse Reveal" stageNumber="08" points={2000}>
 <div className="space-y-8 max-w-4xl mx-auto text-center py-6">
 <div className="space-y-3">
 <span className="px-4 py-1.5 bg-[#FFE600]/20 text-[#FFE600] text-xs font-black rounded-full font-display uppercase tracking-widest">Grand Finale</span>
 <h1 className="text-4xl md:text-7xl font-black text-white font-display">
 THE <span className="text-[#FFE600]">TRIBEVERSE</span> REVEAL
 </h1>
 <p className="text-white/70 text-lg max-w-xl mx-auto">
 The ultimate conclusion of TRIBEVERSE V1. Student Tribe's next-generation student ecosystem.
 </p>
 </div>

 {!unlocked ? (
 <div className="bg-white/[0.03] border border-white/10 p-12 rounded-3xl space-y-4">
 <p className="text-white/40 uppercase font-display text-sm">Revealing In</p>
 <p className="text-8xl font-black text-[#00FFD1] font-mono animate-pulse">{countdown}</p>
 <p className="text-white/50 text-xs">Awaiting synchronised admin broadcast trigger...</p>
 </div>
 ) : (
 <div className="space-y-6">
 <div className="relative rounded-3xl overflow-hidden border-2 border-[#FFE600]/50 bg-gradient-to-tr from-[#0D1B4B] via-[#1A6FFF] to-[#7B2FFF] p-8 md:p-12 text-left shadow-2xl">
 <div className="max-w-2xl space-y-4">
 <span className="px-3 py-1 bg-white/20 text-white text-xs font-black rounded-full font-display">WELCOME TO THE FUTURE</span>
 <h2 className="text-3xl md:text-5xl font-black text-white font-display">You Are The First Tribe Pioneers.</h2>
 <p className="text-white/80 leading-relaxed text-base">
 TRIBEVERSE V1 is more than a 1-day event. It is the permanent gateway to hackathons, startup incubators, exclusive campus perks, and student communities across India.
 </p>
 <div className="flex flex-wrap gap-4 pt-4">
 <Link
 href="/dashboard/leaderboard"
 className="bg-[#FFE600] text-black font-black px-8 py-3.5 rounded-2xl font-display text-sm hover:bg-[#D4FF00] transition-colors"
 >
 VIEW FINAL PODIUM WINNERS 
 </Link>
 <Link
 href="/dashboard/profile"
 className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-2xl font-display text-sm transition-colors"
 >
 CLAIM YOUR TRIBE BADGE 
 </Link>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </StageGuard>
 )
}
