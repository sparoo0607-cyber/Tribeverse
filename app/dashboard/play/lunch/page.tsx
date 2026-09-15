'use client'

import StageGuard from '@/components/StageGuard'
import { useState } from 'react'

const POLLS = [
 { id: 'biryani', name: 'Paradise Biryani', count: 42, icon: ''},
 { id: 'shawarma', name: 'Special Chicken Shawarma', count: 28, icon: ''},
 { id: 'pizza', name: 'Cheesy Loaded Pizza', count: 19, icon: ''},
 { id: 'dosa', name: 'Ghee Karam Dosa', count: 35, icon: ''},
]

export default function LunchBreakPage() {
 const [voted, setVoted] = useState<string | null>(null)
 const [pollData, setPollData] = useState(POLLS)
 const [vibeCount, setVibeCount] = useState(128)

 const handleVote = (id: string) =>{
 if (voted) return
 setVoted(id)
 setPollData(prev =>prev.map(p =>p.id === id ? { ...p, count: p.count + 1 } : p))
 }

 return (
 <StageGuard slug="lunch" title="Lunch Break Vibes" stageNumber="03" points={200}>
 <div className="space-y-6 max-w-4xl mx-auto">
 <div className="bg-gradient-to-r from-[#FF6B1A]/20 via-[#FFE600]/20 to-[#FF2D87]/20 p-6 md:p-8 rounded-3xl border border-[#FF6B1A]/30 flex flex-col md:flex-row items-center justify-between gap-6">
 <div>
 <span className="px-3 py-1 bg-[#FF6B1A]/20 text-[#FF6B1A] text-xs font-black rounded-full font-display uppercase tracking-widest">Stage 03 · Chill Zone</span>
 <h1 className="text-3xl md:text-5xl font-black text-white font-display mt-2">Lunch Break Vibes</h1>
 <p className="text-white/70 text-sm mt-1">Recharge, grab food, vote in the campus food battle, and jam to the curated freshers playlist.</p>
 </div>
 <button
 onClick={() =>setVibeCount(v =>v + 1)}
 className="bg-[#FFE600] text-black font-black px-6 py-4 rounded-2xl font-display hover:scale-105 active:scale-95 transition-all text-center flex flex-col items-center shadow-lg"
 >
 <span className="text-2xl">Send Good Vibes</span>
 <span className="text-xs text-black/60 font-mono mt-0.5">{vibeCount} Vibes Sent Today</span>
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Food Poll */}
 <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-xl font-black text-white font-display">Campus Food Battle</h3>
 <span className="text-xs text-white/40">Live Voting</span>
 </div>
 <p className="text-white/60 text-sm">What is your go-to lunch fuel for today's TRIBEVERSE victory?</p>

 <div className="space-y-3">
 {pollData.map(item =>{
 const total = pollData.reduce((acc, p) =>acc + p.count, 0)
 const pct = Math.round((item.count / total) * 100)
 const isSelected = voted === item.id
 return (
 <button
 key={item.id}
 disabled={voted !== null}
 onClick={() =>handleVote(item.id)}
 className={` w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden ${isSelected ? 'border-[#FFE600] bg-[#FFE600]/10': 'border-white/10 bg-white/5 hover:border-white/30'}`}
 >
 <div
 className="absolute inset-y-0 left-0 bg-[#FFE600]/10 pointer-events-none transition-all duration-500"
 style={{ width: `${pct}%`}}
 />
 <div className="relative flex items-center justify-between z-10">
 <span className="font-bold text-white font-display text-sm flex items-center gap-2">
 <span className="text-xl">{item.icon}</span> {item.name}
 </span>
 <span className="font-mono text-xs font-bold text-[#FFE600]">{pct}% ({item.count})</span>
 </div>
 </button>
 )
 })}
 </div>
 {voted &&<p className="text-green-400 text-xs font-display text-center font-bold">Your vote has been recorded!</p>}
 </div>

 {/* Music Player Embed */}
 <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
 <div>
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-xl font-black text-white font-display">Freshers Chill Tape</h3>
 <span className="text-xs bg-[#1A6FFF]/20 text-[#1A6FFF] px-2.5 py-0.5 rounded-full font-bold font-display">LIVE PLAYLIST</span>
 </div>
 <p className="text-white/60 text-sm mb-4">Lo-fi beats, indie tracks, and high-energy hip hop for the break.</p>
 
 <div className="space-y-2">
 {[
 { title: 'Starboy', artist: 'The Weeknd, Daft Punk', time: '3:50', playing: true },
 { title: 'Sunflower', artist: 'Post Malone, Swae Lee', time: '2:38', playing: false },
 { title: 'Naatu Naatu (Remix)', artist: 'Rahul Sipligunj, Kaala Bhairava', time: '3:34', playing: false },
 { title: 'Midnight City', artist: 'M83', time: '4:03', playing: false },
 ].map((song, i) =>(
 <div key={i} className={` flex items-center justify-between p-3 rounded-xl border ${song.playing ? 'bg-[#1A6FFF]/20 border-[#1A6FFF]/40': 'bg-black/30 border-white/5'}`}>
 <div className="flex items-center gap-3">
 <span className="text-xs text-white/40 font-mono">0{i+1}</span>
 <div>
 <p className={` text-sm font-bold font-display ${song.playing ? 'text-[#FFE600]': 'text-white'}`}>{song.title}</p>
 <p className="text-white/40 text-xs">{song.artist}</p>
 </div>
 </div>
 <span className="text-white/40 font-mono text-xs">{song.time}</span>
 </div>
 ))}
 </div>
 </div>

 <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40 font-display">
 <span>Sound System: Campus Central Hub</span>
 <span className="text-[#00FFD1] font-bold">● Broadcasting</span>
 </div>
 </div>
 </div>
 </div>
 </StageGuard>
 )
}
