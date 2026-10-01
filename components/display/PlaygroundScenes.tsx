'use client'

import { useEffect, useRef, useState } from 'react'
import { Scene } from '@/lib/displayDeck'

type Of<K extends Scene['kind']> = Extract<Scene, { kind: K }>

// Counts down while `active`; going inactive (or changing resetKey) puts it back to full.
function useCountdown(seconds: number, resetKey: string, active = true) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    setLeft(seconds)
    if (!active) return
    const id = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [seconds, resetKey, active])
  return left
}

function TimerBadge({ left, total }: { left: number; total: number }) {
  const pct = (left / total) * 100
  return (
    <div className="flex flex-col items-center gap-3">
      <span className={`font-display font-black text-[9vw] leading-none ${left <= 5 ? 'text-red-500' : 'text-white'}`}>{left}</span>
      <div className="w-[40vw] h-3 rounded-full bg-black/40 overflow-hidden">
        <div className="h-full bg-white transition-all duration-1000 ease-linear" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-6 py-2 rounded-full bg-black text-[#FFE600] font-display font-black tracking-[0.3em] text-lg md:text-2xl">{children}</span>
  )
}

export function RoundScene({ scene }: { scene: Of<'round'> }) {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center text-center px-10" style={{ background: scene.color }}>
      <div className="mb-6"><Pill>ROUND {scene.n} OF 5</Pill></div>
      <h1 className="font-display font-black text-white text-[11vw] leading-none" style={{ textShadow: '6px 6px 0 #000' }}>{scene.name.toUpperCase()}</h1>
      <p className="font-display font-black text-black text-2xl md:text-4xl mt-8">Skill: {scene.skill}</p>
      {scene.format && <p className="font-display font-bold text-white/90 text-xl md:text-3xl mt-3 max-w-5xl">{scene.format}</p>}
      {scene.scoring && <p className="font-display font-black text-[#FFE600] text-lg md:text-2xl mt-6 bg-black/40 px-6 py-3 rounded-2xl">{scene.scoring}</p>}
    </div>
  )
}

function ReadySlate({ color, label, hint }: { color: string; label: string; hint: string }) {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center text-center px-10" style={{ background: color }}>
      <div className="mb-8"><Pill>{label}</Pill></div>
      <h1 className="font-display font-black text-white text-[9vw] leading-none" style={{ textShadow: '6px 6px 0 #000' }}>GET READY</h1>
      <p className="font-display font-bold text-white/90 text-xl md:text-3xl mt-6">{hint}</p>
    </div>
  )
}

// phase: 0 ready · 1 image + timer (then the question appears by itself) · 2 question · 3 answer
export function QVisualScene({ scene, phase }: { scene: Of<'qvisual'>; phase: number }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [scene.src])
  const left = useCountdown(scene.seconds, `${scene.src}:${phase}`, phase === 1)
  const label = `QUICK EYES · Q${scene.q}`

  if (phase === 0) return <ReadySlate color={scene.color} label={label} hint="Look carefully at the picture" />

  const asQuestion = (answerPhase: number) => (
    <QuestionScene
      phase={answerPhase}
      scene={{ kind: 'question', title: scene.title, label, prompt: scene.prompt, options: scene.options, color: scene.color, reveal: scene.reveal }}
    />
  )

  // Timer finished: the question replaces the picture automatically
  if (phase === 2 || (phase === 1 && left === 0)) return asQuestion(0)
  if (phase === 3 && scene.reveal) return asQuestion(1)

  const picture = failed ? (
    <div className="text-center px-8">
      <p className="text-white/40 uppercase tracking-widest text-sm font-display mb-3">Missing visual</p>
      <h2 className="text-5xl font-black text-white font-display mb-3">Quick Eyes · Q{scene.q}</h2>
      <p className="text-white/50 font-mono text-sm">Add public{scene.src}</p>
    </div>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={scene.src} alt={`Quick Eyes ${scene.q}`} onError={() => setFailed(true)} className="h-full w-full object-contain" />
  )

  return (
    <div className="h-screen w-screen bg-black relative flex items-center justify-center">
      {picture}
      {phase === 1 ? (
        <>
          <div className="absolute top-6 right-8 px-6 py-2 rounded-2xl bg-black/70 font-display font-black text-white text-4xl">{left}</div>
          <div className="absolute top-6 left-8 px-5 py-2 rounded-2xl bg-[#1A6FFF] font-display font-black text-white text-xl tracking-widest">WATCH CAREFULLY · Q{scene.q}</div>
        </>
      ) : (
        <div className="absolute bottom-0 inset-x-0 bg-[#16A34A] text-white text-center font-display font-black text-3xl md:text-5xl py-5">ANSWER · {scene.prompt}</div>
      )}
    </div>
  )
}

// phase: 0 question · 1 answer shown (correct option highlighted)
export function QuestionScene({ scene, phase = 0 }: { scene: Of<'question'>; phase?: number }) {
  const revealed = phase >= 1
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center px-[6vw]" style={{ background: scene.color }}>
      <div className="mb-8"><Pill>{scene.label}</Pill></div>
      <h1 className="font-display font-black text-white text-center leading-tight text-[4.6vw] max-w-6xl" style={{ textShadow: '4px 4px 0 rgba(0,0,0,.5)' }}>{scene.prompt}</h1>
      {scene.options && (
        <div className="grid grid-cols-2 gap-5 mt-10 w-full max-w-5xl">
          {scene.options.map((o) => {
            const isCorrect = revealed && scene.correct === o
            const dim = revealed && scene.correct && !isCorrect
            return (
              <div
                key={o}
                className={`rounded-2xl font-display font-black text-3xl md:text-5xl px-8 py-6 border-4 border-black shadow-[6px_6px_0_#000] transition-all ${isCorrect ? 'bg-[#16A34A] text-white scale-105' : 'bg-white text-black'} ${dim ? 'opacity-30' : ''}`}
              >
                {o}
              </div>
            )
          })}
        </div>
      )}
      {revealed && !scene.options && scene.reveal && (
        <div className="mt-10 rounded-2xl bg-[#16A34A] text-white font-display font-black text-5xl md:text-7xl px-10 py-6 border-4 border-black shadow-[6px_6px_0_#000]">{scene.reveal}</div>
      )}
      {revealed && scene.options && scene.reveal && (
        <p className="mt-8 font-display font-bold text-white text-xl md:text-3xl text-center max-w-5xl bg-black/40 px-6 py-3 rounded-2xl">{scene.reveal}</p>
      )}
    </div>
  )
}

// phase: 0 ready · 1 timer running · 2 answer (topic revealed)
export function DrawScene({ scene, phase }: { scene: Of<'draw'>; phase: number }) {
  const left = useCountdown(scene.seconds, `${scene.topic}:${phase}`, phase === 1)
  if (phase === 2) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center text-center px-10 bg-[#16A34A]">
        <div className="mb-6"><Pill>QUICK DRAW · Q{scene.q}</Pill></div>
        <p className="font-display font-bold text-white/90 text-2xl md:text-4xl mb-4">The answer was</p>
        <h1 className="font-display font-black text-white text-[9vw] leading-none" style={{ textShadow: '6px 6px 0 #000' }}>{scene.topic}</h1>
      </div>
    )
  }
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center text-center px-10 bg-[#FF1A75]">
      <div className="mb-6"><Pill>QUICK DRAW · Q{scene.q}</Pill></div>
      <p className="font-display font-bold text-white/90 text-2xl md:text-3xl mb-2">Only the drawer sees the topic.</p>
      <p className="font-display font-black text-black text-xl md:text-2xl mb-8">No words · No letters · No numbers</p>
      <TimerBadge left={left} total={scene.seconds} />
      {phase === 0 && <p className="font-display font-black text-white/80 text-lg mt-8">Get ready…</p>}
    </div>
  )
}

// phase: 0 waiting · 1 sound playing (audio starts)
export function SoundScene({ scene, phase }: { scene: Of<'sound'>; phase: number }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [blocked, setBlocked] = useState(false)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    setMissing(false)
    setBlocked(false)
    const a = audioRef.current
    if (!a) return
    if (phase === 1) {
      a.currentTime = 0
      a.play().catch(() => setBlocked(true))
    } else {
      a.pause()
    }
  }, [phase, scene.audio])

  const playing = phase === 1
  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center text-center bg-[#FF5500] px-10"
      onClick={() => { if (blocked) { audioRef.current?.play().then(() => setBlocked(false)).catch(() => {}) } }}
    >
      <audio ref={audioRef} src={scene.audio} preload="auto" onError={() => setMissing(true)} />
      <div className="mb-8"><Pill>SOUND CHECK · Q{scene.q}</Pill></div>
      <div className="flex items-end gap-3 h-[22vh] mb-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`w-[2.2vw] bg-white rounded-t-lg ${playing ? 'sc-bar' : ''}`}
            style={{ height: playing ? undefined : '12%', animationDuration: `${0.4 + (i % 5) * 0.12}s`, animationDelay: `${(i % 4) * 0.1}s` }}
          />
        ))}
      </div>
      <h1 className="font-display font-black text-white text-[8vw] leading-none" style={{ textShadow: '5px 5px 0 #000' }}>{playing ? 'SOUND PLAYING…' : 'GET READY'}</h1>
      <p className="font-display font-black text-black text-2xl md:text-4xl mt-6">{playing ? 'Listen closely. Buzz when you know!' : 'Listen closely…'}</p>
      {playing && blocked && <p className="font-mono text-white/90 text-sm mt-4 bg-black/40 px-4 py-2 rounded-xl">Tap the screen once to enable sound</p>}
      {playing && missing && <p className="font-mono text-white/90 text-sm mt-4 bg-black/40 px-4 py-2 rounded-xl">Add public{scene.audio}</p>}
      <style>{`.sc-bar{height:15%;animation:scBar ease-in-out infinite alternate}@keyframes scBar{from{height:12%}to{height:100%}}`}</style>
    </div>
  )
}

// phase: 0 get ready · 1 items shown (then blank when time is up) · 2 answer
export function MemoryScene({ scene, phase }: { scene: Of<'memory'>; phase: number }) {
  const left = useCountdown(scene.seconds, `${scene.level}:${phase}`, phase === 1)
  const label = `MEMORY CHAIN · LEVEL ${scene.level}`
  const small = scene.items.length >= 9

  if (phase === 0) return <ReadySlate color="#00B894" label={label} hint={`${scene.items.length} items · remember the exact order`} />

  if (phase === 1 && left === 0) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center text-center bg-[#0A0A0A]">
        <p className="font-display font-black text-white/25 text-3xl tracking-[0.4em]">NOW WRITE THE ORDER</p>
      </div>
    )
  }

  const answer = phase === 2
  return (
    <div className={`h-screen w-screen flex flex-col items-center justify-center text-center px-[4vw] ${answer ? 'bg-[#16A34A]' : 'bg-[#00B894]'}`}>
      <div className="mb-8"><Pill>{answer ? `${label} · ANSWER` : label}</Pill></div>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-5 max-w-[92vw]">
        {scene.items.map((it, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`rounded-2xl bg-white text-black font-display font-black border-4 border-black shadow-[5px_5px_0_#000] flex flex-col items-center justify-center ${small ? 'px-4 py-3 text-3xl md:text-5xl min-w-[9vw]' : 'px-6 py-4 text-4xl md:text-6xl min-w-[10vw]'}`}>
              {it.emoji && <span className={small ? 'text-5xl md:text-7xl' : 'text-6xl md:text-8xl'}>{it.emoji}</span>}
              <span>{it.text}</span>
              {answer && <span className="text-xs font-mono text-black/50">{i + 1}</span>}
            </div>
            {i < scene.items.length - 1 && <span className="font-display font-black text-white text-4xl">→</span>}
          </div>
        ))}
      </div>
      {phase === 1 && (
        <div className="absolute top-6 right-8 px-6 py-2 rounded-2xl bg-black/70 font-display font-black text-white text-4xl">{left}</div>
      )}
    </div>
  )
}
