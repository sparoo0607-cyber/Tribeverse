'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type GameState ='idle'|'wait'|'ready'|'tapped'|'wrong'|'finished'

export default function ReactionGame() {
 const [state, setState] = useState<GameState>('idle')
 const [round, setRound] = useState(0)
 const [score, setScore] = useState(0)
 const [reactionTime, setReactionTime] = useState<number|null>(null)
 const [scores, setScores] = useState<number[]>([])
 const [roundId, setRoundId] = useState<string|null>(null)
 const [teamId, setTeamId] = useState<string|null>(null)
 const [userId, setUserId] = useState<string|null>(null)
 const startRef = useRef<number>(0)
 const timerRef = useRef<NodeJS.Timeout|null>(null)
 const supabase = createClient()
 const router = useRouter()
 const TOTAL_ROUNDS = 5

 useEffect(()=>{
 async function load(){
 const {data:{user}} = await supabase.auth.getUser()
 if (!user) return
 setUserId(user.id)
 const {data:m} = await supabase.from('team_members').select('team_id').eq('user_id',user.id).single()
 setTeamId(m?.team_id??null)
 const {data:act} = await supabase.from('activities').select('id').eq('slug', 'playground').single()
 if (!act) return
 const {data:r} = await supabase.from('rounds').select('id').eq('activity_id',act.id).eq('slug', 'reaction-game').single()
 setRoundId(r?.id??null)
 }
 load()
 return () =>{ if (timerRef.current) clearTimeout(timerRef.current) }
 },[])

 function startRound() {
 setState('wait')
 const delay = 1500 + Math.random() * 2500
 timerRef.current = setTimeout(() =>{
 setState('ready')
 startRef.current = Date.now()
 }, delay)
 }

 function handleTap() {
 if (state ==='wait') {
 // Tapped too early
 if (timerRef.current) clearTimeout(timerRef.current)
 setState('wrong')
 const newScores = [...scores, 0]
 setScores(newScores)
 const newRound = round + 1
 setRound(newRound)
 if (newRound >= TOTAL_ROUNDS) finishGame(newScores)
 else setTimeout(() =>setState('idle'), 1200)
 } else if (state ==='ready') {
 const ms = Date.now() - startRef.current
 setReactionTime(ms)
 const pts = Math.max(0, Math.round(1000 - ms / 2))
 const newScores = [...scores, pts]
 setScores(newScores)
 setScore(s =>s + pts)
 setState('tapped')
 const newRound = round + 1
 setRound(newRound)
 if (newRound >= TOTAL_ROUNDS) setTimeout(() =>finishGame(newScores), 1000)
 else setTimeout(() =>setState('idle'), 1200)
 }
 }

 async function finishGame(finalScores: number[]) {
 setState('finished')
 const total = finalScores.reduce((a,b)=>a+b,0)
 if (userId && teamId && roundId) {
 await supabase.from('game_attempts').insert({
 user_id: userId, team_id: teamId, round_id: roundId,
 is_correct: true, score_earned: total,
 attempt_data: { scores: finalScores, reaction_times: finalScores }
 })
 await supabase.rpc('refresh_team_score', { p_team_id: teamId })
 }
 }

 const bg = state==='ready'? 'bg-green-500':state==='wrong'? 'bg-red-500':state==='wait'? 'bg-[#1A6FFF]': 'bg-[#111418]'

 if (state ==='finished') return (
 <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
 <div className="text-6xl"></div>
 <h1 className="font-black text-5xl text-white font-display">Reaction Score!</h1>
 <div className="bg-white/[0.05] border border-white/[0.1] rounded-2xl px-12 py-6">
 <p className="text-white/50 text-sm font-bold font-display uppercase tracking-widest">Total Score</p>
 <p className="font-black text-7xl text-[#FFE600] font-display">{score.toLocaleString()}</p>
 <div className="flex gap-4 mt-4 justify-center">
 {scores.map((s,i)=>(
 <div key={i} className="text-center">
 <p className="font-black text-lg font-display text-white">{s}</p>
 <p className="text-white/30 text-xs">R{i+1}</p>
 </div>
 ))}
 </div>
 </div>
 <button onClick={()=>router.push('/dashboard/play/playground')}
 className="bg-[#1A6FFF] text-white font-black px-8 py-3 rounded-xl font-display">Back to Playground</button>
 </div>
 )

 return (
 <div className="space-y-6">
 <div><h1 className="font-black text-4xl text-white font-display">Reaction Game</h1>
 <p className="text-white/50 text-sm mt-1">Tap when it turns GREEN. Don't tap RED.</p></div>
 <div className="flex items-center gap-4">
 {Array.from({length:TOTAL_ROUNDS}).map((_,i)=>(
 <div key={i} className={` flex-1 h-2 rounded-full ${i<round? 'bg-[#FFE600]': 'bg-white/10'}`}/>
 ))}
 <span className="text-white/50 text-sm font-display">{round}/{TOTAL_ROUNDS}</span>
 </div>
 <div onClick={handleTap}
 className={` rounded-3xl flex flex-col items-center justify-center min-h-[300px] cursor-pointer transition-colors duration-100 select-none ${bg}`}>
 {state==='idle'&&<div className="text-center"><p className="font-black text-3xl text-white font-display mb-4">Round {round+1}</p><button onClick={e=>{e.stopPropagation();startRound()}} className="bg-[#FFE600] text-black font-black px-8 py-4 rounded-xl font-display text-lg">TAP TO START</button></div>}
 {state==='wait'&&<div className="text-center"><p className="font-black text-6xl font-display text-white"></p><p className="text-white/70 text-xl font-display mt-2">Wait for it…</p></div>}
 {state==='ready'&&<div className="text-center"><p className="font-black text-8xl font-display text-white"></p><p className="font-black text-3xl text-white font-display">TAP NOW!</p></div>}
 {state==='tapped'&&<div className="text-center"><p className="font-black text-5xl font-display text-white">{reactionTime}ms</p><p className="text-white/70 font-display">+{Math.max(0,Math.round(1000-(reactionTime??0)/2))} pts</p></div>}
 {state==='wrong'&&<div className="text-center"><p className="font-black text-6xl font-display"></p><p className="font-black text-2xl text-white font-display">Too early! 0 pts</p></div>}
 </div>
 <div className="text-center"><p className="font-black text-4xl text-[#FFE600] font-display">{score.toLocaleString()} pts</p></div>
 </div>
 )
}
