'use client'

import { useEffect, useState } from 'react'
import { Scene, GAMES, REVEAL_NAMES } from '@/lib/displayDeck'
import { RoundScene, QVisualScene, QuestionScene, DrawScene, SoundScene, MemoryScene } from '@/components/display/PlaygroundScenes'
import { fetchAllWallPosts, subscribeToWallPosts, WallPostRow } from '@/lib/wall'

function Missing({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center text-center px-8">
      <p className="text-white/40 uppercase tracking-widest text-sm font-display mb-3">Missing file</p>
      <h2 className="text-5xl font-black text-white font-display mb-3">{title}</h2>
      <p className="text-white/50 font-mono text-sm">{hint}</p>
    </div>
  )
}

function ImageScene({ scene }: { scene: Extract<Scene, { kind: 'image' }> }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [scene.src])
  if (failed) return <Missing title={scene.title} hint={`Add public${scene.src}`} />
  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={scene.src}
        alt={scene.title}
        onError={() => setFailed(true)}
        className={`h-full w-full ${scene.fit === 'cover' ? 'object-cover' : 'object-contain'}`}
      />
    </div>
  )
}

function VideoScene({ scene }: { scene: Extract<Scene, { kind: 'video' }> }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [scene.src])
  if (failed) return <Missing title={scene.title} hint={`Add public${scene.src}`} />
  return (
    <div className="h-screen w-screen bg-black">
      <video
        key={scene.src}
        src={scene.src}
        autoPlay
        controls
        playsInline
        onError={() => setFailed(true)}
        className="h-full w-full object-contain"
      />
    </div>
  )
}

// Animated Talent Hunt opener: spotlights sweeping a stage, floating notes, big title.
function TalentScene() {
  return (
    <div className="h-screen w-screen relative overflow-hidden bg-[#07040f] flex items-center justify-center">
      <div className="th-beam th-b1" />
      <div className="th-beam th-b2" />
      <div className="th-beam th-b3" />
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="th-note"
          style={{ left: `${5 + i * 6.7}%`, animationDelay: `${(i % 7) * 0.7}s`, animationDuration: `${6 + (i % 4)}s` }}
        >
          {['♪', '♫', '★', '✦'][i % 4]}
        </span>
      ))}
      <div className="relative text-center">
        <p className="th-tag font-display font-black tracking-[0.5em] text-[#00FFD1] text-xl md:text-3xl mb-4">STUDENT TRIBE PRESENTS</p>
        <h1 className="th-title font-display font-black leading-none text-[#FFE600] text-[16vw]">TALENT</h1>
        <h1 className="th-title th-delay font-display font-black leading-none text-white text-[16vw]">HUNT</h1>
        <p className="th-tag th-delay2 font-display font-bold tracking-[0.4em] text-white/70 text-lg md:text-2xl mt-6">SING · DANCE · RAP · SHINE</p>
      </div>
      <div className="th-floor" />
      <style>{`
        .th-beam{position:absolute;top:-10%;width:22vw;height:140%;background:linear-gradient(to bottom,rgba(255,230,0,.35),transparent 80%);filter:blur(18px);transform-origin:top center;mix-blend-mode:screen}
        .th-b1{left:10%;background:linear-gradient(to bottom,rgba(255,45,135,.45),transparent 80%);animation:thSweep 5s ease-in-out infinite alternate}
        .th-b2{left:40%;animation:thSweep 6s ease-in-out infinite alternate-reverse}
        .th-b3{left:70%;background:linear-gradient(to bottom,rgba(0,255,209,.4),transparent 80%);animation:thSweep 4.5s ease-in-out infinite alternate}
        @keyframes thSweep{from{transform:rotate(-22deg)}to{transform:rotate(22deg)}}
        .th-note{position:absolute;bottom:-10%;font-size:3rem;color:rgba(255,255,255,.35);animation:thFloat linear infinite}
        @keyframes thFloat{from{transform:translateY(0) rotate(0);opacity:0}15%{opacity:1}to{transform:translateY(-120vh) rotate(40deg);opacity:0}}
        .th-title{animation:thPop .9s cubic-bezier(.2,1.6,.4,1) both;text-shadow:0 0 40px rgba(255,230,0,.35),6px 6px 0 rgba(0,0,0,.6)}
        .th-delay{animation-delay:.35s}
        .th-tag{animation:thFade 1s ease both}
        .th-delay2{animation-delay:.9s}
        @keyframes thPop{from{transform:scale(.3) translateY(60px);opacity:0}to{transform:none;opacity:1}}
        @keyframes thFade{from{opacity:0;letter-spacing:1em}to{opacity:1}}
        .th-floor{position:absolute;bottom:0;left:0;right:0;height:18%;background:radial-gradient(ellipse at 50% 100%,rgba(255,45,135,.5),transparent 70%)}
      `}</style>
    </div>
  )
}

function WelcomeScene() {
  return (
    <div className="h-screen w-screen relative overflow-hidden flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#1A6FFF] via-[#4F26E9] to-[#7B2FFF]">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      <p className="relative font-display font-black tracking-[0.5em] text-white/80 text-xl md:text-3xl mb-4">STUDENT TRIBE PRESENTS</p>
      <h1 className="relative font-display font-black leading-none text-white text-[13vw]" style={{ textShadow: '6px 6px 0 #000' }}>TRIBE</h1>
      <h1 className="relative font-display font-black leading-none text-[#FFE600] text-[13vw]" style={{ textShadow: '6px 6px 0 #000' }}>VERSE V1</h1>
      <p className="relative font-display font-black tracking-[0.4em] text-white text-lg md:text-3xl mt-8">INAUGURATION</p>
    </div>
  )
}

function IntroScene({ scene }: { scene: Extract<Scene, { kind: 'intro' }> }) {
  const [photoOk, setPhotoOk] = useState(true)
  useEffect(() => setPhotoOk(true), [scene.photo])
  const initials = scene.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="h-screen w-screen flex items-center justify-center gap-[5vw] px-[6vw]" style={{ background: scene.color }}>
      <div className="relative shrink-0 w-[34vw] max-w-[520px] aspect-square rounded-[2.5rem] border-[10px] border-black bg-[#FFE600] shadow-[16px_16px_0_#000] overflow-hidden flex items-center justify-center">
        {scene.photo && photoOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={scene.photo} alt={scene.name} onError={() => setPhotoOk(false)} className="h-full w-full object-cover" />
        ) : (
          <span className="font-display font-black text-black text-[10vw]">{initials}</span>
        )}
      </div>
      <div className="text-left min-w-0">
        <span className="inline-block px-6 py-2 rounded-full bg-black text-[#FFE600] font-display font-black tracking-[0.3em] text-lg md:text-2xl mb-6">{scene.role}</span>
        <h1 className="font-display font-black text-white leading-[0.95] text-[7vw]" style={{ textShadow: '5px 5px 0 #000' }}>{scene.name}</h1>
        {scene.subtitle && <p className="font-display font-bold text-white/90 text-xl md:text-3xl mt-6">{scene.subtitle}</p>}
      </div>
    </div>
  )
}

function GamesScene() {
  const colors = ['#FF1A75', '#7B2FFF', '#FF5500', '#1A6FFF', '#00B894']
  return (
    <div className="h-screen w-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-10">
      <h1 className="text-6xl md:text-8xl font-black font-display text-[#FFE600] mb-2">TRIBE PLAYGROUND</h1>
      <p className="text-white/60 font-display uppercase tracking-[0.4em] mb-10">5 games · 5 rounds each</p>
      <div className="grid grid-cols-5 gap-4 w-full max-w-7xl">
        {GAMES.map((g, i) => (
          <div key={g} className="rounded-3xl border-4 border-black p-5 text-center shadow-[6px_6px_0_#000]" style={{ background: colors[i] }}>
            <p className="text-white/80 font-black font-display text-sm">GAME {i + 1}</p>
            <p className="text-white font-black font-display text-2xl md:text-3xl leading-tight my-3 min-h-[5rem] flex items-center justify-center">{g}</p>
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((r) => (
                <span key={r} className="w-8 h-8 rounded-full bg-black/40 text-white font-black text-sm flex items-center justify-center">{r}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LunchScene() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center text-center bg-[#FFE600]">
      <h1 className="text-[14vw] font-black font-display text-black leading-none">LUNCH</h1>
      <p className="text-3xl md:text-5xl font-black font-display text-black/70 mt-4">BACK AT 1:00 PM</p>
    </div>
  )
}

// Tribe Jam: wide high/low music bars with a glow.
function JamScene() {
  const BARS = 28
  return (
    <div className="h-screen w-screen relative overflow-hidden bg-[#0A0510] flex flex-col items-center justify-end">
      <h1 className="absolute top-[6vh] text-6xl md:text-8xl font-black font-display text-white text-center">
        TRIBE <span className="text-[#FF2D87]">JAM</span>
      </h1>
      <div className="relative w-full h-[65vh] flex items-end justify-center gap-[0.6vw] px-[3vw] pb-[4vh]">
        {Array.from({ length: BARS }).map((_, i) => {
          const hue = 320 - (i / BARS) * 140
          return (
            <div
              key={i}
              className="jam-bar flex-1 rounded-t-xl"
              style={{
                background: `linear-gradient(to top, hsl(${hue} 100% 55%), hsl(${hue + 30} 100% 70%))`,
                boxShadow: `0 0 24px hsl(${hue} 100% 55% / .55)`,
                animationDuration: `${0.5 + ((i * 37) % 11) / 14}s`,
                animationDelay: `${((i * 53) % 9) / 10}s`,
              }}
            />
          )
        })}
      </div>
      <style>{`
        .jam-bar{height:12%;animation:jamDance ease-in-out infinite alternate}
        @keyframes jamDance{0%{height:10%}30%{height:55%}60%{height:28%}100%{height:98%}}
      `}</style>
    </div>
  )
}

function RevealScene() {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (shown >= REVEAL_NAMES.length) return
    const t = setTimeout(() => setShown((s) => s + 1), 1800)
    return () => clearTimeout(t)
  }, [shown])
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#0D1B4B] via-[#1A6FFF] to-[#7B2FFF] px-10">
      <h1 className="text-6xl md:text-8xl font-black font-display text-[#FFE600] mb-10">THE TRIBE REVEAL</h1>
      {REVEAL_NAMES.length === 0 ? (
        <p className="text-white/70 font-display text-2xl">Names coming up…</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-4 max-w-6xl">
          {REVEAL_NAMES.slice(0, shown).map((n) => (
            <span key={n} className="px-8 py-4 rounded-2xl bg-white text-black font-black font-display text-3xl md:text-5xl border-4 border-black shadow-[6px_6px_0_#000] reveal-pop">
              {n}
            </span>
          ))}
        </div>
      )}
      <style>{`.reveal-pop{animation:revealPop .5s ease both}@keyframes revealPop{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>
  )
}

function WallScene() {
  const [posts, setPosts] = useState<WallPostRow[]>([])
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const p = await fetchAllWallPosts()
      if (!cancelled) setPosts(p.filter((x) => x.status === 'approved'))
    }
    load()
    const unsub = subscribeToWallPosts(load)
    return () => { cancelled = true; unsub() }
  }, [])
  const colors = ['#FF1A75', '#7B2FFF', '#FF5500', '#1A6FFF', '#00B894', '#FFE600']
  return (
    <div className="h-screen w-screen bg-[#0A0A0A] overflow-hidden p-8">
      <h1 className="text-5xl md:text-7xl font-black font-display text-white text-center mb-6">
        THE TRIBE <span className="text-[#FFE600]">WALL</span>
      </h1>
      {posts.length === 0 ? (
        <p className="text-white/40 text-center font-display text-xl mt-20">Dreams will appear here as they are approved…</p>
      ) : (
        <div className="columns-2 md:columns-4 gap-4">
          {posts.map((p, i) => {
            const bg = colors[i % colors.length]
            return (
              <div key={p.id} className="break-inside-avoid mb-4 rounded-2xl p-5 border-4 border-black shadow-[4px_4px_0_#000]" style={{ background: bg, color: bg === '#FFE600' ? '#000' : '#fff' }}>
                <p className="font-bold text-lg leading-snug">{p.content}</p>
                <p className="text-xs font-black opacity-80 mt-2 uppercase">— {p.authorName}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SceneView({ scene, phase = 0 }: { scene: Scene; phase?: number }) {
  switch (scene.kind) {
    case 'image': return <ImageScene scene={scene} />
    case 'video': return <VideoScene scene={scene} />
    case 'welcome': return <WelcomeScene />
    case 'intro': return <IntroScene scene={scene} />
    case 'talent': return <TalentScene />
    case 'games': return <GamesScene />
    case 'round': return <RoundScene scene={scene} />
    case 'qvisual': return <QVisualScene scene={scene} phase={phase} />
    case 'question': return <QuestionScene scene={scene} phase={phase} />
    case 'draw': return <DrawScene scene={scene} phase={phase} />
    case 'sound': return <SoundScene scene={scene} phase={phase} />
    case 'memory': return <MemoryScene scene={scene} phase={phase} />
    case 'lunch': return <LunchScene />
    case 'jam': return <JamScene />
    case 'reveal': return <RevealScene />
    case 'wall': return <WallScene />
  }
}
