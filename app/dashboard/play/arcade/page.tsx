'use client'

import StageGuard from '@/components/StageGuard'
import { useState, useEffect, useRef } from 'react'

type ArcadeGame ='menu'|'speed'|'color'|'math'

export default function TribeArcadePage() {
 const [activeGame, setActiveGame] = useState<ArcadeGame>('menu')
 const [score, setScore] = useState(0)
 const [highScore, setHighScore] = useState(0)

 // Speed Tapper state
 const [tapperClicks, setTapperClicks] = useState(0)
 const [tapperTimer, setTapperTimer] = useState(10)
 const [tapperActive, setTapperActive] = useState(false)

 // Color Match state
 const [targetColor, setTargetColor] = useState({ name: 'RED', color: '#FF2D87'})
 const [colorOptions, setColorOptions] = useState<string[]>([])
 const [colorStreak, setColorStreak] = useState(0)

 // Math Blitz state
 const [mathProblem, setMathProblem] = useState({ text: '12 + 15', answer: 27 })
 const [mathOptions, setMathOptions] = useState<number[]>([])
 const [mathStreak, setMathStreak] = useState(0)

 // 1. SPEED TAPPER
 useEffect(() =>{
 let interval: any
 if (tapperActive && tapperTimer >0) {
 interval = setInterval(() =>setTapperTimer(t =>t - 1), 1000)
 } else if (tapperTimer === 0 && tapperActive) {
 setTapperActive(false)
 const pts = tapperClicks * 10
 setScore(pts)
 if (pts >highScore) setHighScore(pts)
 }
 return () =>clearInterval(interval)
 }, [tapperActive, tapperTimer, tapperClicks, highScore])

 const startSpeedTapper = () =>{
 setTapperClicks(0)
 setTapperTimer(10)
 setTapperActive(true)
 setScore(0)
 }

 // 2. COLOR MATCH GENERATOR
 const generateColorQuestion = () =>{
 const colors = [
 { name: 'RED', hex: '#FF2D87'},
 { name: 'BLUE', hex: '#1A6FFF'},
 { name: 'YELLOW', hex: '#FFE600'},
 { name: 'GREEN', hex: '#00D9C4'},
 { name: 'PURPLE', hex: '#7B2FFF'},
 ]
 const textItem = colors[Math.floor(Math.random() * colors.length)]
 const inkItem = colors[Math.floor(Math.random() * colors.length)]
 setTargetColor({ name: textItem.name, color: inkItem.hex })
 setColorOptions(colors.map(c =>c.hex).sort(() =>0.5 - Math.random()))
 }

 const handleColorChoice = (chosenHex: string) =>{
 // If user matches INK color:
 if (chosenHex === targetColor.color) {
 setColorStreak(s =>s + 1)
 setScore(s =>s + 50)
 generateColorQuestion()
 } else {
 alert('Wrong ink color! Streak reset.')
 setColorStreak(0)
 generateColorQuestion()
 }
 }

 // 3. MATH BLITZ GENERATOR
 const generateMathQuestion = () =>{
 const num1 = Math.floor(Math.random() * 20) + 10
 const num2 = Math.floor(Math.random() * 20) + 10
 const isPlus = Math.random() >0.5
 const ans = isPlus ? num1 + num2 : num1 - num2
 setMathProblem({ text: `${num1} ${isPlus ? '+': '-'} ${num2}`, answer: ans })
 
 const wrongs = [ans + 2, ans - 3, ans + 5, ans - 2].filter(x =>x !== ans)
 const all = [ans, wrongs[0], wrongs[1], wrongs[2]].sort(() =>0.5 - Math.random())
 setMathOptions(all)
 }

 const handleMathChoice = (chosenAns: number) =>{
 if (chosenAns === mathProblem.answer) {
 setMathStreak(s =>s + 1)
 setScore(s =>s + 60)
 generateMathQuestion()
 } else {
 alert(` Wrong! The answer was ${mathProblem.answer}. Streak reset.`)
 setMathStreak(0)
 generateMathQuestion()
 }
 }

 return (
 <StageGuard slug="arcade" title="Tribe Arcade" stageNumber="04" points={800}>
 <div className="space-y-6 max-w-4xl mx-auto">
 <div className="flex items-center justify-between bg-gradient-to-r from-[#7B2FFF]/30 to-[#FF2D87]/30 p-6 rounded-3xl border border-[#7B2FFF]/40">
 <div>
 <span className="px-3 py-1 bg-[#7B2FFF]/30 text-[#00FFD1] text-xs font-black rounded-full font-display uppercase tracking-widest">Stage 04 · Live Arcade</span>
 <h1 className="text-3xl md:text-5xl font-black text-white font-display mt-2">Tribe Arcade</h1>
 <p className="text-white/70 text-sm mt-1">Retro arcade games. Compete for individual glory and team leaderboard boosts.</p>
 </div>
 {activeGame !=='menu'&& (
 <button
 onClick={() =>setActiveGame('menu')}
 className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold font-display text-xs"
 >
 Back to Games
 </button>
 )}
 </div>

 {activeGame ==='menu'&& (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl flex flex-col justify-between hover:border-[#FFE600] transition-all group">
 <div>
 <span className="text-5xl block mb-4"></span>
 <h3 className="text-2xl font-black text-white font-display">Speed Tapper</h3>
 <p className="text-white/60 text-sm mt-2">How many taps can you land in 10 seconds? Test your ultra-fast finger reflexes.</p>
 </div>
 <button
 onClick={() =>{ setActiveGame('speed'); startSpeedTapper(); }}
 className="w-full mt-6 bg-[#FFE600] text-black font-black py-3 rounded-xl font-display text-sm hover:bg-[#D4FF00] transition-colors"
 >
 PLAY SPEED TAPPER
 </button>
 </div>

 <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl flex flex-col justify-between hover:border-[#FF2D87] transition-all group">
 <div>
 <span className="text-5xl block mb-4"></span>
 <h3 className="text-2xl font-black text-white font-display">Stroop Color Frenzy</h3>
 <p className="text-white/60 text-sm mt-2">Match the INK color of the word, not what the word says! Don't let your brain get tricked.</p>
 </div>
 <button
 onClick={() =>{ setActiveGame('color'); generateColorQuestion(); setScore(0); setColorStreak(0); }}
 className="w-full mt-6 bg-[#FF2D87] text-white font-black py-3 rounded-xl font-display text-sm hover:bg-pink-600 transition-colors"
 >
 PLAY COLOR FRENZY
 </button>
 </div>

 <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl flex flex-col justify-between hover:border-[#00D9C4] transition-all group">
 <div>
 <span className="text-5xl block mb-4"></span>
 <h3 className="text-2xl font-black text-white font-display">Math Blitz</h3>
 <p className="text-white/60 text-sm mt-2">Rapid fire arithmetic calculations. Perfect for quick logic champions.</p>
 </div>
 <button
 onClick={() =>{ setActiveGame('math'); generateMathQuestion(); setScore(0); setMathStreak(0); }}
 className="w-full mt-6 bg-[#00D9C4] text-black font-black py-3 rounded-xl font-display text-sm hover:bg-teal-300 transition-colors"
 >
 PLAY MATH BLITZ
 </button>
 </div>
 </div>
 )}

 {/* Speed Tapper Active */}
 {activeGame ==='speed'&& (
 <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl text-center space-y-6">
 <div className="flex justify-between items-center max-w-sm mx-auto">
 <div>
 <p className="text-white/40 text-xs font-display uppercase">Time Left</p>
 <p className={` text-4xl font-black font-mono ${tapperTimer<= 3 ? 'text-red-400 animate-ping': 'text-[#FFE600]'}`}>{tapperTimer}s</p>
 </div>
 <div>
 <p className="text-white/40 text-xs font-display uppercase">Total Taps</p>
 <p className="text-4xl font-black text-white font-mono">{tapperClicks}</p>
 </div>
 </div>

 {tapperActive ? (
 <button
 onClick={() =>setTapperClicks(c =>c + 1)}
 className="w-48 h-48 rounded-full bg-gradient-to-tr from-[#FF2D87] to-[#FFE600] text-black font-black text-3xl font-display mx-auto shadow-2xl active:scale-90 transition-transform select-none flex items-center justify-center border-4 border-white"
 >
 TAP! 
 </button>
 ) : (
 <div className="space-y-4">
 <h2 className="text-3xl font-black text-white font-display">Time's Up!</h2>
 <p className="text-xl text-[#FFE600] font-bold font-display">Final Score: {score} Points ({tapperClicks} taps)</p>
 <button
 onClick={startSpeedTapper}
 className="bg-[#FFE600] text-black font-black px-8 py-3.5 rounded-2xl font-display hover:bg-[#D4FF00] transition-colors"
 >
 TRY AGAIN 
 </button>
 </div>
 )}
 </div>
 )}

 {/* Color Frenzy Active */}
 {activeGame ==='color'&& (
 <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl text-center space-y-6">
 <div className="flex justify-between items-center max-w-sm mx-auto">
 <div>
 <p className="text-white/40 text-xs font-display uppercase">Streak</p>
 <p className="text-3xl font-black text-[#00FFD1] font-display">{colorStreak}</p>
 </div>
 <div>
 <p className="text-white/40 text-xs font-display uppercase">Arcade Points</p>
 <p className="text-3xl font-black text-[#FFE600] font-display">{score}</p>
 </div>
 </div>

 <div className="py-8 bg-black/40 rounded-2xl border border-white/5">
 <p className="text-white/40 text-xs uppercase tracking-widest font-display mb-2">Tap the INK color (not the word text)</p>
 <p className="text-6xl font-black font-display" style={{ color: targetColor.color }}>
 {targetColor.name}
 </p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-lg mx-auto">
 {colorOptions.map((hex, i) =>(
 <button
 key={i}
 onClick={() =>handleColorChoice(hex)}
 style={{ background: hex }}
 className="h-16 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all border border-white/20"
 />
 ))}
 </div>
 </div>
 )}

 {/* Math Blitz Active */}
 {activeGame ==='math'&& (
 <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl text-center space-y-6">
 <div className="flex justify-between items-center max-w-sm mx-auto">
 <div>
 <p className="text-white/40 text-xs font-display uppercase">Streak</p>
 <p className="text-3xl font-black text-[#00FFD1] font-display">{mathStreak}</p>
 </div>
 <div>
 <p className="text-white/40 text-xs font-display uppercase">Points</p>
 <p className="text-3xl font-black text-[#FFE600] font-display">{score}</p>
 </div>
 </div>

 <div className="py-8 bg-black/40 rounded-2xl border border-white/5">
 <p className="text-white/40 text-xs uppercase tracking-widest font-display mb-2">Quick Arithmetic</p>
 <p className="text-6xl font-black text-white font-mono">
 {mathProblem.text} = ?
 </p>
 </div>

 <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
 {mathOptions.map((opt, i) =>(
 <button
 key={i}
 onClick={() =>handleMathChoice(opt)}
 className="p-5 bg-white/10 hover:bg-[#FFE600] hover:text-black text-white font-mono font-black text-2xl rounded-2xl border border-white/10 transition-all active:scale-95"
 >
 {opt}
 </button>
 ))}
 </div>
 </div>
 )}
 </div>
 </StageGuard>
 )
}
