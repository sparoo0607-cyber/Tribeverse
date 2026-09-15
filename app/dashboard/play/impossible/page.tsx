'use client'

import StageGuard from '@/components/StageGuard'
import { useState, useEffect } from 'react'

const CHALLENGES = [
 {
 id: 1,
 question: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost in cents?",
 options: ["10 cents", "5 cents", "1 cent", "20 cents"],
 correctIndex: 1,
 explanation: "If the ball is X, bat is X + $1.00. Total 2X + $1.00 = $1.10 =>2X = $0.10 =>X = $0.05 (5 cents)."
 },
 {
 id: 2,
 question: "If it takes 5 machines 5 minutes to make 5 widgets, how many minutes would it take 100 machines to make 100 widgets?",
 options: ["100 minutes", "50 minutes", "5 minutes", "1 minute"],
 correctIndex: 2,
 explanation: "Each machine takes 5 minutes to make 1 widget. So 100 machines will produce 100 widgets in 5 minutes!"
 },
 {
 id: 3,
 question: "In a lake, there is a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days to cover the entire lake, how long does it take to cover half?",
 options: ["24 days", "47 days", "12 days", "36 days"],
 correctIndex: 1,
 explanation: "Since it doubles every day, on day 47 it was exactly half covered!"
 }
]

export default function ImpossibleChallengePage() {
 const [currentIdx, setCurrentIdx] = useState(0)
 const [timeLeft, setTimeLeft] = useState(100)
 const [active, setActive] = useState(false)
 const [selectedOpt, setSelectedOpt] = useState<number | null>(null)
 const [locked, setLocked] = useState(false)
 const [score, setScore] = useState(0)
 const [completed, setCompleted] = useState(false)

 useEffect(() =>{
 let timer: any
 if (active && timeLeft >0 && !completed) {
 timer = setInterval(() =>setTimeLeft(t =>t - 1), 1000)
 } else if (timeLeft === 0) {
 setActive(false)
 setCompleted(true)
 }
 return () =>clearInterval(timer)
 }, [active, timeLeft, completed])

 const startChallenge = () =>{
 setActive(true)
 setTimeLeft(100)
 setCurrentIdx(0)
 setScore(0)
 setCompleted(false)
 setSelectedOpt(null)
 }

 const handleAnswer = (index: number) =>{
 if (locked) return
 setSelectedOpt(index)
 setLocked(true)

 const isCorrect = index === CHALLENGES[currentIdx].correctIndex
 if (isCorrect) setScore(s =>s + 500)

 setTimeout(() =>{
 setLocked(false)
 setSelectedOpt(null)
 if (currentIdx + 1< CHALLENGES.length) {
 setCurrentIdx(i =>i + 1)
 } else {
 setCompleted(true)
 setActive(false)
 }
 }, 1200)
 }

 const currentQ = CHALLENGES[currentIdx]

 return (
 <StageGuard slug="impossible" title="The Impossible Challenge" stageNumber="05" points={1500}>
 <div className="space-y-6 max-w-4xl mx-auto">
 <div className="bg-gradient-to-r from-red-950 via-[#111418] to-purple-950 p-6 md:p-8 rounded-3xl border border-red-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
 <div>
 <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-black rounded-full font-display uppercase tracking-widest">Stage 05 · High Stakes</span>
 <h1 className="text-3xl md:text-5xl font-black text-white font-display mt-2">The Impossible Challenge</h1>
 <p className="text-white/70 text-sm mt-1">100-Second Timed Gauntlet. 3 Mind-Bending Puzzles. +1500 Total Points.</p>
 </div>
 <div className="text-center bg-black/60 px-6 py-4 rounded-2xl border border-red-500/40">
 <p className="text-white/40 text-xs uppercase font-display">Countdown Timer</p>
 <p className={` text-4xl font-black font-mono ${timeLeft<= 20 ? 'text-red-500 animate-pulse': 'text-[#FFE600]'}`}>
 {timeLeft}s
 </p>
 </div>
 </div>

 {!active && !completed && (
 <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl text-center space-y-6">
 <span className="text-6xl block"></span>
 <h2 className="text-2xl md:text-3xl font-black text-white font-display">Ready for the 100-Second Trial?</h2>
 <p className="text-white/60 text-sm max-w-lg mx-auto">
 Once you press Start, your 100-second timer begins immediately. Coordinate with your team and lock in the right logical answers!
 </p>
 <button
 onClick={startChallenge}
 className="bg-red-600 hover:bg-red-500 text-white font-black px-10 py-4 rounded-2xl font-display text-lg uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
 >
 START THE GAUNTLET 
 </button>
 </div>
 )}

 {active && !completed && currentQ && (
 <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl space-y-6">
 <div className="flex justify-between items-center border-b border-white/10 pb-4">
 <span className="text-white/40 font-display text-xs uppercase">Question {currentIdx + 1} of {CHALLENGES.length}</span>
 <span className="text-[#FFE600] font-black font-display text-sm">+500 PTS</span>
 </div>

 <p className="text-xl md:text-2xl font-black text-white font-display leading-relaxed">
 {currentQ.question}
 </p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
 {currentQ.options.map((opt, i) =>{
 const isSelected = selectedOpt === i
 const isCorrect = i === currentQ.correctIndex
 let btnStyle ="bg-white/5 border-white/10 text-white hover:bg-white/10"
 if (locked) {
 if (isSelected && isCorrect) btnStyle ="bg-green-600 border-green-400 text-white"
 else if (isSelected && !isCorrect) btnStyle ="bg-red-600 border-red-400 text-white"
 else if (isCorrect) btnStyle ="bg-green-600/40 border-green-500 text-white"
 }
 return (
 <button
 key={i}
 disabled={locked}
 onClick={() =>handleAnswer(i)}
 className={` p-5 rounded-2xl border text-left font-bold font-display text-base transition-all ${btnStyle}`}
 >
 <span className="text-white/40 mr-2">[{String.fromCharCode(65 + i)}]</span> {opt}
 </button>
 )
 })}
 </div>
 </div>
 )}

 {completed && (
 <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl text-center space-y-6">
 <span className="text-6xl block"></span>
 <h2 className="text-3xl font-black text-white font-display">Challenge Completed!</h2>
 <p className="text-2xl font-black text-[#FFE600] font-display">
 Earned: {score} / 1500 Points
 </p>
 <div className="max-w-md mx-auto space-y-2 text-left bg-black/40 p-4 rounded-xl border border-white/5 text-xs text-white/70">
 {CHALLENGES.map((c, i) =>(
 <p key={i}><strong className="text-white">Q{i+1}:</strong> {c.explanation}</p>
 ))}
 </div>
 <button
 onClick={startChallenge}
 className="bg-[#1A6FFF] text-white font-black px-8 py-3.5 rounded-2xl font-display hover:bg-blue-600 transition-colors"
 >
 PLAY AGAIN 
 </button>
 </div>
 )}
 </div>
 </StageGuard>
 )
}
