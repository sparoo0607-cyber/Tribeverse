'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Question } from '@/lib/types'

type Phase ='loading'|'ready'|'playing'|'result'|'done'

export default function ThinkFastGame() {
 const [phase, setPhase] = useState<Phase>('loading')
 const [questions, setQuestions] = useState<Question[]>([])
 const [qIdx, setQIdx] = useState(0)
 const [selected, setSelected] = useState<string|null>(null)
 const [isCorrect, setIsCorrect] = useState<boolean|null>(null)
 const [timeLeft, setTimeLeft] = useState(30)
 const [score, setScore] = useState(0)
 const [roundId, setRoundId] = useState<string|null>(null)
 const [teamId, setTeamId] = useState<string|null>(null)
 const [userId, setUserId] = useState<string|null>(null)
 const timerRef = useRef<NodeJS.Timeout|null>(null)
 const supabase = createClient()
 const router = useRouter()

 useEffect(()=>{
 async function load(){
 const {data:{user}} = await supabase.auth.getUser()
 if (!user) return
 setUserId(user.id)
 const {data:m} = await supabase.from('team_members').select('team_id').eq('user_id',user.id).single()
 setTeamId(m?.team_id??null)
 const {data:act} = await supabase.from('activities').select('id').eq('slug', 'playground').single()
 if (!act) return
 const {data:round} = await supabase.from('rounds').select('id,duration_seconds').eq('activity_id',act.id).eq('slug', 'think-fast').single()
 if (!round) return
 setRoundId(round.id)
 setTimeLeft(round.duration_seconds??30)
 const {data:qs} = await supabase.from('questions').select('*').eq('round_id',round.id).eq('active',true).order('order_index')
 if (qs && qs.length >0) { setQuestions(qs); setPhase('ready') }
 else setPhase('done')
 }
 load()
 },[])

 const startTimer = useCallback((duration: number) =>{
 if (timerRef.current) clearInterval(timerRef.current)
 setTimeLeft(duration)
 timerRef.current = setInterval(() =>{
 setTimeLeft(prev =>{
 if (prev<= 1) {
 clearInterval(timerRef.current!)
 handleTimeout()
 return 0
 }
 return prev - 1
 })
 }, 1000)
 },[qIdx, questions])

 function handleTimeout() {
 setSelected('__timeout__')
 setIsCorrect(false)
 setPhase('result')
 saveAttempt('__timeout__', false, 0)
 }

 async function saveAttempt(answer: string, correct: boolean, earned: number) {
 if (!userId || !teamId || !roundId) return
 await supabase.from('game_attempts').insert({
 user_id: userId, team_id: teamId, round_id: roundId,
 question_id: questions[qIdx]?.id,
 answer_given: answer, is_correct: correct, score_earned: earned,
 })
 if (earned >0) {
 // Update team score
 await supabase.rpc('refresh_team_score', { p_team_id: teamId })
 }
 }

 function handleSelect(opt: string) {
 if (selected) return
 if (timerRef.current) clearInterval(timerRef.current)
 const q = questions[qIdx]
 const correct = opt === q.correct_answer
 const earned = correct ? q.points : 0
 setSelected(opt); setIsCorrect(correct)
 if (correct) setScore(s =>s + earned)
 setPhase('result')
 saveAttempt(opt, correct, earned)
 }

 function next() {
 const nextIdx = qIdx + 1
 if (nextIdx >= questions.length) { setPhase('done'); return }
 setQIdx(nextIdx); setSelected(null); setIsCorrect(null)
 setPhase('playing')
 startTimer(30)
 }

 function startGame() {
 setPhase('playing')
 startTimer(questions[0]?.points ? 30 : 30)
 }

 useEffect(() =>{ return () =>{ if (timerRef.current) clearInterval(timerRef.current) } }, [])

 const q = questions[qIdx]
 const pct = Math.round((qIdx / Math.max(questions.length,1)) * 100)

 if (phase ==='loading') return (
 <div className="flex items-center justify-center h-64">
 <div className="w-12 h-12 border-4 border-[#FF2D87] border-t-transparent rounded-full animate-spin"/>
 </div>
 )

 if (phase ==='done') return (
 <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
 <div className="text-6xl"></div>
 <h1 className="font-black text-5xl text-white font-display">Round Complete!</h1>
 <div className="bg-white/[0.05] border border-white/[0.1] rounded-2xl px-12 py-6">
 <p className="text-white/50 text-sm font-bold font-display uppercase tracking-widest">Your Score</p>
 <p className="font-black text-7xl text-[#FFE600] font-display">{score}</p>
 <p className="text-white/40 text-sm">points earned</p>
 </div>
 <button onClick={()=>router.push('/dashboard/play/playground')}
 className="bg-[#1A6FFF] text-white font-black px-8 py-3 rounded-xl font-display hover:bg-blue-500 transition-colors">
 Back to Playground
 </button>
 </div>
 )

 if (phase ==='ready') return (
 <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
 <div className="text-6xl"></div>
 <h1 className="font-black text-4xl text-white font-display">Think Fast</h1>
 <p className="text-white/60 max-w-md">{questions.length} questions. 30 seconds each. Your first instinct is your best one.</p>
 <div className="flex gap-6 text-center">
 {[['Questions',questions.length],['Sec/Q',30],['Pts/Q',questions[0]?.points??10]].map(([l,v])=>(
 <div key={l as string} className="bg-white/[0.05] rounded-xl px-6 py-3">
 <p className="font-black text-2xl text-[#FFE600] font-display">{v}</p>
 <p className="text-white/40 text-xs uppercase tracking-widest">{l}</p>
 </div>
 ))}
 </div>
 <button onClick={startGame}
 className="bg-[#FFE600] text-black font-black text-lg px-10 py-4 rounded-xl font-display hover:bg-[#D4FF00] transition-colors hover:scale-105">
 START 
 </button>
 </div>
 )

 return (
 <div className="max-w-2xl mx-auto space-y-6">
 {/* Progress */}
 <div>
 <div className="flex justify-between text-xs text-white/40 mb-1 font-display">
 <span>Question {qIdx+1} of {questions.length}</span>
 <span>{score} pts</span>
 </div>
 <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
 <div className="h-full bg-[#FFE600] rounded-full transition-all duration-500" style={{width: `${pct}%`}}/>
 </div>
 </div>

 {/* Timer */}
 <div className="flex justify-center">
 <div className={` w-20 h-20 rounded-full border-4 flex items-center justify-center font-black text-3xl font-display transition-colors ${timeLeft<= 10 ? 'border-red-500 text-red-400 timer-danger': 'border-[#1A6FFF] text-white'}`}>
 {timeLeft}
 </div>
 </div>

 {/* Question */}
 <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 text-center">
 <p className="font-black text-2xl text-white font-display leading-tight">{q?.question_text}</p>
 </div>

 {/* Options */}
 {q?.options && (
 <div className="grid grid-cols-2 gap-3">
 {q.options.map(opt =>{
 let style ='bg-white/[0.05] border-white/[0.1] text-white hover:bg-white/[0.1] hover:border-white/[0.2]'
 if (selected) {
 if (opt.text === q.correct_answer) style ='bg-green-500/20 border-green-500/50 text-green-300'
 else if (opt.text === selected) style ='bg-red-500/20 border-red-500/50 text-red-300'
 else style ='bg-white/[0.03] border-white/[0.05] text-white/30'
 }
 return (
 <button key={opt.label} onClick={()=>handleSelect(opt.text)} disabled={!!selected}
 className={` border rounded-xl p-4 text-left transition-all duration-200 ${style} ${!selected? 'cursor-pointer hover:scale-[1.01]': 'cursor-default'}`}>
 <span className="font-black text-xs text-white/40 font-display">{opt.label}.</span>
 <p className="font-bold mt-1 font-display text-sm">{opt.text}</p>
 </button>
 )
 })}
 </div>
 )}

 {/* Result feedback */}
 {phase ==='result'&& (
 <div className={` flex flex-col items-center gap-4 p-6 rounded-2xl ${isCorrect? 'bg-green-500/10 border border-green-500/30': 'bg-red-500/10 border border-red-500/30'}`}>
 <p className={` font-black text-2xl font-display ${isCorrect? 'text-green-400': 'text-red-400'}`}>
 {selected==='__timeout__'? 'Time\'s Up!': isCorrect ? ` CORRECT! +${q?.points} pts `: 'Wrong — 0 pts'}
 </p>
 {!isCorrect && selected !=='__timeout__'&& (
 <p className="text-white/50 text-sm">Correct answer:<strong className="text-white">{q?.correct_answer}</strong></p>
 )}
 <button onClick={next}
 className="bg-[#1A6FFF] text-white font-black px-8 py-3 rounded-xl font-display hover:bg-blue-500 transition-colors">
 {qIdx+1 >= questions.length ? 'Finish': 'Next Question'}
 </button>
 </div>
 )}
 </div>
 )
}
