'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ActivityItem {
 id: string
 stageNumber: string
 name: string
 slug: string
 icon: string
 category: 'solo'|'team'|'social'|'finale'
 categoryLabel: string
 description: string
 skills: string[]
 points: number
 status: 'live'|'locked'|'completed'
 route: string
 gradient: string
 accentColor: string
}

const ACTIVITIES: ActivityItem[] = [
 {
 id: '1',
 stageNumber: '01',
 name: 'Tribe Playground',
 slug: 'playground',
 icon: '',
 category: 'solo',
 categoryLabel: 'Solo Ability Split',
 description: '5 members take on 5 unique individual ability trials: Quick Eyes, Quick Draw, Think Fast, Sound Check, and Reaction Game.',
 skills: ['Visual Reflex', 'Fast Sketching', 'Rapid Trivia', 'Audio ID', 'Reaction Speed'],
 points: 500,
 status: 'live',
 route: '/dashboard/play/playground',
 gradient: 'from-[#1A6FFF]/20 via-[#0D1B4B]/40 to-transparent',
 accentColor: '#1A6FFF',
 },
 {
 id: '2',
 stageNumber: '02',
 name: 'The Tribe Detective',
 slug: 'detective',
 icon: '',
 category: 'team',
 categoryLabel: 'Mystery Hunt',
 description: 'Solve cryptic campus clues, crack ROT-13 & Caesar ciphers, and find physical QR checkpoints to upload evidence.',
 skills: ['Cryptanalysis', 'Campus Exploration', 'Deduction', 'Observation'],
 points: 600,
 status: 'live',
 route: '/dashboard/play/detective',
 gradient: 'from-[#00FFD1]/20 via-[#0D1B4B]/40 to-transparent',
 accentColor: '#00FFD1',
 },
 {
 id: '3',
 stageNumber: '03',
 name: 'Lunch Break Vibes',
 slug: 'lunch',
 icon: '',
 category: 'social',
 categoryLabel: 'Chill Zone',
 description: 'Vote in the campus food battle poll, chill out with the curated Freshers music tape, and send live vibe energy.',
 skills: ['Social Voting', 'Vibe Sharing', 'Music Appreciation'],
 points: 200,
 status: 'live',
 route: '/dashboard/play/lunch',
 gradient: 'from-[#FF6B1A]/20 via-[#0D1B4B]/40 to-transparent',
 accentColor: '#FF6B1A',
 },
 {
 id: '4',
 stageNumber: '04',
 name: 'Tribe Arcade',
 slug: 'arcade',
 icon: '',
 category: 'solo',
 categoryLabel: 'Retro Arcade',
 description: 'Lightning speed tapping test, Stroop ink color match frenzy, and rapid-fire mental arithmetic math blitz.',
 skills: ['Finger Speed', 'Stroop Focus', 'Mental Math', 'High Score Run'],
 points: 800,
 status: 'live',
 route: '/dashboard/play/arcade',
 gradient: 'from-[#7B2FFF]/20 via-[#0D1B4B]/40 to-transparent',
 accentColor: '#7B2FFF',
 },
 {
 id: '5',
 stageNumber: '05',
 name: 'The Impossible Challenge',
 slug: 'impossible',
 icon: '',
 category: 'team',
 categoryLabel: 'High Stakes Gauntlet',
 description: '100-Second high-intensity timed logic puzzle gauntlet. No second chances, maximum team coordination required.',
 skills: ['Extreme Time Pressure', 'Counter-Intuitive Logic', 'Team Consensus'],
 points: 1500,
 status: 'live',
 route: '/dashboard/play/impossible',
 gradient: 'from-[#FF2D87]/20 via-red-950/40 to-transparent',
 accentColor: '#FF2D87',
 },
 {
 id: '6',
 stageNumber: '06',
 name: 'Tribe Jam',
 slug: 'jam',
 icon: '',
 category: 'social',
 categoryLabel: 'Music & Expression',
 description: 'Music. Expression. Vibes. Performance Round (sing, rap, beatbox, hum), team musical energy & vibe language.',
 skills: ['Performance Round', 'Team Vibe', 'Music Expression', 'Authentic Energy'],
 points: 400,
 status: 'live',
 route: '/dashboard/play/jam',
 gradient: 'from-[#FFE600]/20 via-[#FF2D87]/20 to-transparent',
 accentColor: '#FFE600',
 },
 {
 id: '7',
 stageNumber: '07',
 name: 'The Tribe Wall',
 slug: 'wall',
 icon: '',
 category: 'social',
 categoryLabel: 'Dream Board',
 description: '"Before I Graduate, I Want To..." interactive dream sticky note board. Pin your ambition and like fellow freshers dreams.',
 skills: ['Ambition Pinning', 'Community Storytelling', 'Social Upvoting'],
 points: 300,
 status: 'live',
 route: '/dashboard/wall',
 gradient: 'from-[#D4FF00]/20 via-[#00D9C4]/20 to-transparent',
 accentColor: '#D4FF00',
 },
 {
 id: '8',
 stageNumber: '08',
 name: 'Tribeverse Reveal',
 slug: 'reveal',
 icon: '',
 category: 'finale',
 categoryLabel: 'Grand Finale',
 description: 'Final score freeze, live countdown to the grand reveal broadcast, winner podium celebrations, and digital credentials.',
 skills: ['Podium Reveal', 'Badge Unlock', 'Tribe Initiation'],
 points: 2000,
 status: 'live',
 route: '/dashboard/reveal',
 gradient: 'from-[#FFE600]/20 via-[#1A6FFF]/30 to-purple-950',
 accentColor: '#FFE600',
 },
]

import { fetchStageStates, subscribeToStageChanges } from '@/lib/stageStore'

export default function PlayHubPage() {
 const [activeCategory, setActiveCategory] = useState<'all'|'solo'|'team'|'social'|'finale'>('all')
 const [searchQuery, setSearchQuery] = useState('')
 const [activities, setActivities] = useState<ActivityItem[]>(ACTIVITIES)

 useEffect(() =>{
 let cancelled = false

 const syncStates = async () =>{
 const states = await fetchStageStates()
 if (cancelled) return
 setActivities(prev =>
 prev.map(localAct =>{
 const current = states[localAct.slug]
 return current ? { ...localAct, status: current.status } : localAct
 })
 )
 }

 syncStates()
 const unsubscribe = subscribeToStageChanges(syncStates)
 return () =>{ cancelled = true; unsubscribe() }
 }, [])

 const filtered = activities.filter(act =>{
 const matchCat = activeCategory ==='all'|| act.category === activeCategory
 const matchSearch = act.name.toLowerCase().includes(searchQuery.toLowerCase()) || act.description.toLowerCase().includes(searchQuery.toLowerCase())
 return matchCat && matchSearch
 })

 const totalPoints = activities.reduce((acc, a) =>acc + a.points, 0)
 const liveCount = activities.filter(a =>a.status ==='live').length

 return (
 <div className="space-y-8 max-w-6xl mx-auto">
 {/* Hero Header */}
 <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1A6FFF] via-[#0D1B4B] to-[#7B2FFF] p-6 sm:p-8 md:p-10 border border-[#1A6FFF]/40 shadow-2xl">
 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="space-y-2">
 <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black text-xs font-black rounded-full font-display uppercase tracking-widest">
 ACTIVITY ARENA
 </div>
 <h1 className="text-3xl sm:text-5xl font-black text-white font-display">
 Play & Compete
 </h1>
 <p className="text-white/80 font-medium text-sm sm:text-base max-w-xl">
 8 unique stages engineered to test your speed, detective logic, reflexes, and team synergy. Every challenge earns points for <strong className="text-[#FFE600]">Team Titans (#01)</strong>.
 </p>
 </div>

 <div className="grid grid-cols-2 gap-3 bg-black/50 backdrop-blur-md border border-white/15 p-4 rounded-2xl min-w-[220px]">
 <div className="text-center p-2 border-r border-white/10">
 <span className="text-[10px] text-white/40 uppercase font-bold font-display block">Live Stages</span>
 <span className="text-2xl font-black text-green-400 font-mono">{liveCount} / 8</span>
 </div>
 <div className="text-center p-2">
 <span className="text-[10px] text-white/40 uppercase font-bold font-display block">Total Earnable</span>
 <span className="text-2xl font-black text-[#FFE600] font-mono">+{totalPoints}</span>
 </div>
 </div>
 </div>
 </div>

 {/* Controls & Category Filter */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 {/* Category Tabs */}
 <div className="flex gap-2 overflow-x-auto pb-1">
 {[
 { id: 'all', label: 'All Stages (8)'},
 { id: 'solo', label: 'Solo Ability'},
 { id: 'team', label: 'Team Trials'},
 { id: 'social', label: 'Social & Music'},
 { id: 'finale', label: 'Finale Reveal'},
 ].map(tab =>(
 <button
 key={tab.id}
 onClick={() =>setActiveCategory(tab.id as any)}
 className={` px-4 py-2.5 rounded-xl font-bold font-display text-xs whitespace-nowrap transition-all ${
 activeCategory === tab.id
 ? 'bg-[#FFE600] text-black shadow-lg scale-105'
 : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 {/* Search */}
 <input
 type="text"
 placeholder="Search activity name or skill..."
 value={searchQuery}
 onChange={(e) =>setSearchQuery(e.target.value)}
 className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-[#FFE600] w-full sm:w-64"
 />
 </div>

 {/* Activities Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {filtered.map((act) =>{
 const isLive = act.status ==='live'
 return (
 <div
 key={act.id}
 className={` rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between p-6 sm:p-7 group bg-gradient-to-br ${act.gradient} ${
 isLive
 ? 'border-white/15 hover:border-white/40 hover:shadow-2xl hover:scale-[1.01]'
 : 'border-white/5 opacity-50 bg-black/40'
 }`}
 >
 <div>
 {/* Header Meta */}
 <div className="flex items-center justify-between gap-2 mb-4">
 <div className="flex items-center gap-2">
 <span className="font-mono text-xs font-black text-white/40">
 STAGE {act.stageNumber}
 </span>
 <span
 className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-display uppercase tracking-wider"
 style={{ background: act.accentColor +'22', color: act.accentColor, border: ` 1px solid ${act.accentColor}44 `}}
 >
 {act.categoryLabel}
 </span>
 </div>

 <span className="font-mono font-black text-xs text-[#FFE600] px-2.5 py-1 bg-black/40 rounded-lg border border-white/10">
 +{act.points} PTS
 </span>
 </div>

 {/* Title & Icon */}
 <div className="flex items-start gap-4 mb-3">
 <span className="text-4xl sm:text-5xl flex-shrink-0 group-hover:scale-110 transition-transform">
 {act.icon}
 </span>
 <div>
 <h3 className="text-xl sm:text-2xl font-black text-white font-display leading-tight group-hover:text-[#FFE600] transition-colors">
 {act.name}
 </h3>
 <p className="text-white/60 text-xs sm:text-sm mt-1.5 leading-relaxed">
 {act.description}
 </p>
 </div>
 </div>

 {/* Skills Tags */}
 <div className="flex flex-wrap gap-1.5 my-4">
 {act.skills.map((skill, idx) =>(
 <span
 key={idx}
 className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/50 text-[10px] font-mono"
 >
 #{skill}
 </span>
 ))}
 </div>
 </div>

 {/* Action Footer */}
 <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-2">
 <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 font-display">
 <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"/>
 ● LIVE STAGE
 </span>

 <Link
 href={act.route}
 className="px-6 py-2.5 rounded-xl font-black font-display text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg bg-[#FFE600] text-black hover:bg-[#D4FF00] hover:scale-105 active:scale-95"
 >
 ENTER STAGE
 </Link>
 </div>
 </div>
 )
 })}
 </div>

 {/* Guide Card */}
 <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
 <div className="space-y-1">
 <h3 className="text-lg font-black text-white font-display">How Event Scoring Works</h3>
 <p className="text-white/60 text-xs sm:text-sm max-w-xl">
 You don't have to play alone. Individual rounds score points for your team, while team stages like Detective and Impossible Challenge require all 5 minds.
 </p>
 </div>
 <Link
 href="/dashboard/event"
 className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold font-display text-xs rounded-xl uppercase tracking-wider transition-all whitespace-nowrap"
 >
 View Full Event Playbook 
 </Link>
 </div>
 </div>
 )
}
