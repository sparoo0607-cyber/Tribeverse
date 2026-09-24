'use client'

import StageGuard from '@/components/StageGuard'
import { useState, useEffect } from 'react'
import Icon from '@/components/icons/Icon'

export default function TribeJamPage() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [tempo, setTempo] = useState<'chill' | 'hype' | 'fire'>('hype')
  const [perfType, setPerfType] = useState('Singing / Vocals')
  const [performerName, setPerformerName] = useState('')
  const [trackName, setTrackName] = useState('')
  const [submittedEntry, setSubmittedEntry] = useState<any>(null)
  const [vibePoints, setVibePoints] = useState(380)
  const [isBeating, setIsBeating] = useState(false)

  const handlePerformanceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!performerName.trim()) return
    setSubmittedEntry({
      type: perfType,
      performer: performerName,
      track: trackName || 'Original Freestlye / Jam',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
    setVibePoints((prev) => prev + 50)
  }

  const triggerBeat = () => {
    setIsBeating(true)
    setVibePoints((v) => v + 1)
    setTimeout(() => setIsBeating(false), 200)
  }

  return (
    <StageGuard slug="jam" title="Tribe Jam" stageNumber="06" points={400}>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header matching index.html exact styling */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#111418] via-[#0A0A0A] to-[#111418] p-6 md:p-10 border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600]/10 border border-[#FFE600]/30 rounded-full text-[#FFE600] text-xs font-black font-display uppercase tracking-widest mb-3">
                <Icon name="sparkle" /> STAGE 06 · LIVE MUSIC ARENA <Icon name="sparkle" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight bg-gradient-to-r from-[#FFE600] via-[#FF6B1A] to-[#FF2D87] bg-clip-text text-transparent">
                TRIBE JAM
              </h1>
              <p className="text-white/70 text-base md:text-lg font-medium mt-2 max-w-xl">
                Music. Expression. Vibes. This is the beat of TRIBEVERSE.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/[0.04] border border-white/10 p-4 rounded-2xl">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block">Tribe Vibe Index</span>
                <span className="text-3xl font-black font-mono text-[#FFE600] inline-flex items-center gap-1">{vibePoints} <Icon name="fire" /></span>
              </div>
              <button
                onClick={triggerBeat}
                className={`px-4 py-3 bg-gradient-to-r from-[#FF2D87] to-[#FF6B1A] hover:scale-105 active:scale-95 text-white font-black text-xs uppercase font-display rounded-xl shadow-lg transition-all inline-flex items-center gap-1.5 ${
                  isBeating ? 'scale-110 ring-2 ring-[#FFE600]' : ''
                }`}
              >
                <Icon name="drum" /> Drop Beat
              </button>
            </div>
          </div>
        </div>

        {/* Exact Layout from index.html */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-black/40 border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-md relative overflow-hidden">
          
          {/* Left Column: Equalizer Visual from index.html */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-2xl relative min-h-[320px]">
            {/* Floating Music Notes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
              <Icon name="music-note" className="absolute top-4 left-6 w-6 h-6 text-[#FFE600] opacity-60 animate-bounce" style={{ animationDuration: '3s' }} />
              <Icon name="music-notes" className="absolute top-8 right-8 w-7 h-7 text-[#FF2D87] opacity-60 animate-bounce" style={{ animationDuration: '2.4s', animationDelay: '0.7s' }} />
              <Icon name="music-note" className="absolute bottom-16 left-10 w-6 h-6 text-[#FF6B1A] opacity-50 animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '1.4s' }} />
              <Icon name="music-notes" className="absolute top-1/2 right-12 w-6 h-6 text-[#00FFD1] opacity-60 animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '2.1s' }} />
            </div>

            {/* The 12-Bar Equalizer */}
            <div className="flex items-end justify-center gap-2 md:gap-3 h-48 w-full max-w-sm px-4 pb-4">
              {[
                { delay: '0s', dur: tempo === 'hype' ? '0.55s' : tempo === 'fire' ? '0.35s' : '0.85s', min: '18%', max: '82%' },
                { delay: '0.07s', dur: tempo === 'hype' ? '0.70s' : tempo === 'fire' ? '0.45s' : '0.95s', min: '32%', max: '98%' },
                { delay: '0.14s', dur: tempo === 'hype' ? '0.50s' : tempo === 'fire' ? '0.30s' : '0.75s', min: '12%', max: '52%' },
                { delay: '0.21s', dur: tempo === 'hype' ? '0.80s' : tempo === 'fire' ? '0.50s' : '1.10s', min: '42%', max: '100%' },
                { delay: '0.28s', dur: tempo === 'hype' ? '0.45s' : tempo === 'fire' ? '0.28s' : '0.65s', min: '20%', max: '78%' },
                { delay: '0.35s', dur: tempo === 'hype' ? '0.65s' : tempo === 'fire' ? '0.40s' : '0.90s', min: '48%', max: '95%' },
                { delay: '0.42s', dur: tempo === 'hype' ? '0.75s' : tempo === 'fire' ? '0.48s' : '1.05s', min: '15%', max: '68%' },
                { delay: '0.49s', dur: tempo === 'hype' ? '0.52s' : tempo === 'fire' ? '0.32s' : '0.70s', min: '38%', max: '92%' },
                { delay: '0.56s', dur: tempo === 'hype' ? '0.68s' : tempo === 'fire' ? '0.42s' : '0.95s', min: '22%', max: '74%' },
                { delay: '0.63s', dur: tempo === 'hype' ? '0.58s' : tempo === 'fire' ? '0.36s' : '0.80s', min: '46%', max: '100%' },
                { delay: '0.70s', dur: tempo === 'hype' ? '0.88s' : tempo === 'fire' ? '0.55s' : '1.20s', min: '26%', max: '62%' },
                { delay: '0.77s', dur: tempo === 'hype' ? '0.60s' : tempo === 'fire' ? '0.38s' : '0.85s', min: '16%', max: '88%' },
              ].map((bar, idx) => (
                <div
                  key={idx}
                  className="w-4 md:w-5 rounded-t-md bg-gradient-to-t from-[#FFE600] via-[#FF6B1A] to-[#FF2D87] transition-all duration-300 shadow-[0_0_12px_rgba(255,107,26,0.4)]"
                  style={{
                    height: isPlaying ? bar.max : '15%',
                    animation: isPlaying ? `eqDance${idx} ${bar.dur} ease-in-out infinite alternate` : 'none',
                    animationDelay: bar.delay,
                  }}
                />
              ))}
            </div>

            {/* EQ Controls */}
            <div className="flex items-center gap-3 mt-4 z-10">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-black font-display uppercase tracking-wider transition-colors"
              >
                {isPlaying ? <span className="inline-flex items-center gap-1"><Icon name="pause" /> Pause EQ</span> : <span className="inline-flex items-center gap-1"><Icon name="play" /> Play EQ</span>}
              </button>
              <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-lg">
                {(['chill', 'hype', 'fire'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTempo(mode)}
                    className={`px-2.5 py-1 text-[10px] font-black uppercase font-display rounded-md transition-all ${
                      tempo === mode ? 'bg-[#FFE600] text-black shadow' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: The 3 Exact Information Cards from index.html */}
          <div className="lg:col-span-6 space-y-4">
            {/* Card 1: Performance Round */}
            <div className="flex items-start gap-4 p-5 bg-white/[0.04] border border-white/10 hover:border-[#FFE600]/40 rounded-2xl transition-all group">
              <span className="p-3 bg-[#FFE600]/10 border border-[#FFE600]/20 rounded-xl group-hover:scale-110 transition-transform text-[#FFE600]">
                <Icon name="mic" className="w-7 h-7" />
              </span>
              <div>
                <strong className="block text-lg font-black text-[#FFE600] font-display mb-1">
                  Performance Round
                </strong>
                <p className="text-white/60 text-sm leading-relaxed">
                  Sing, rap, beatbox, hum — any expression of music counts here.
                </p>
              </div>
            </div>

            {/* Card 2: Team Vibe */}
            <div className="flex items-start gap-4 p-5 bg-white/[0.04] border border-white/10 hover:border-[#FF6B1A]/40 rounded-2xl transition-all group">
              <span className="p-3 bg-[#FF6B1A]/10 border border-[#FF6B1A]/20 rounded-xl group-hover:scale-110 transition-transform text-[#FF6B1A]">
                <Icon name="guitar" className="w-7 h-7" />
              </span>
              <div>
                <strong className="block text-lg font-black text-[#FF6B1A] font-display mb-1">
                  Team Vibe
                </strong>
                <p className="text-white/60 text-sm leading-relaxed">
                  Your team's musical energy becomes your biggest advantage. Feel it together.
                </p>
              </div>
            </div>

            {/* Card 3: Music is Tribe Language */}
            <div className="flex items-start gap-4 p-5 bg-white/[0.04] border border-white/10 hover:border-[#FF2D87]/40 rounded-2xl transition-all group">
              <span className="p-3 bg-[#FF2D87]/10 border border-[#FF2D87]/20 rounded-xl group-hover:scale-110 transition-transform text-[#FF2D87]">
                <Icon name="music-notes" className="w-7 h-7" />
              </span>
              <div>
                <strong className="block text-lg font-black text-[#FF2D87] font-display mb-1">
                  Music is Tribe Language
                </strong>
                <p className="text-white/60 text-sm leading-relaxed">
                  No perfect pitch required. Just passion, rhythm, and your authentic self.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Live Performance Slot Registration */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-2xl font-black text-white font-display">
                Tribe Stage Performance Entry
              </h3>
              <p className="text-white/50 text-xs mt-1">
                Register your team representative for the live TRIBE JAM stage round.
              </p>
            </div>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-black rounded-full font-display uppercase tracking-wider self-start sm:self-auto">
              Stage Slot Available
            </span>
          </div>

          {submittedEntry ? (
            <div className="p-6 bg-gradient-to-r from-[#FFE600]/10 via-[#FF6B1A]/10 to-transparent border border-[#FFE600]/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#FFE600] font-black uppercase tracking-wider font-display">
                  <Icon name="check" /> Slot Confirmed & Registered
                </span>
                <h4 className="text-xl font-black text-white font-display">{submittedEntry.performer}</h4>
                <p className="text-white/60 text-sm">
                  {submittedEntry.type} · <strong className="text-white">{submittedEntry.track}</strong>
                </p>
                <span className="text-[10px] text-white/40 font-mono">Registered at {submittedEntry.timestamp}</span>
              </div>
              <button
                onClick={() => setSubmittedEntry(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold font-display text-xs"
              >
                Edit Entry
              </button>
            </div>
          ) : (
            <form onSubmit={handlePerformanceSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/50 text-xs uppercase font-display font-bold mb-1.5">
                  Performance Style
                </label>
                <select
                  value={perfType}
                  onChange={(e) => setPerfType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FFE600]"
                >
                  <option value="Singing / Vocals" className="bg-[#111418] text-white">Singing / Vocals</option>
                  <option value="Rap / Freestyle" className="bg-[#111418] text-white">Rap / Freestyle</option>
                  <option value="Beatboxing" className="bg-[#111418] text-white">Beatboxing</option>
                  <option value="Acoustic / Instrument" className="bg-[#111418] text-white">Acoustic / Instrument</option>
                  <option value="Group Vibe Anthem" className="bg-[#111418] text-white">Group Vibe Anthem</option>
                </select>
              </div>

              <div>
                <label className="block text-white/50 text-xs uppercase font-display font-bold mb-1.5">
                  Performer / Member Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={performerName}
                  onChange={(e) => setPerformerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FFE600]"
                />
              </div>

              <div>
                <label className="block text-white/50 text-xs uppercase font-display font-bold mb-1.5">
                  Track / Song Title (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Believer / Freestyle"
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FFE600]"
                  />
                  <button
                    type="submit"
                    className="px-6 bg-[#FFE600] hover:bg-[#D4FF00] text-black font-black font-display text-xs uppercase tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap shadow-lg"
                  >
                    Submit Entry
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes eqDance0  { 0% { height: 18%; } 100% { height: 82%; } }
        @keyframes eqDance1  { 0% { height: 32%; } 100% { height: 98%; } }
        @keyframes eqDance2  { 0% { height: 12%; } 100% { height: 52%; } }
        @keyframes eqDance3  { 0% { height: 42%; } 100% { height: 100%; } }
        @keyframes eqDance4  { 0% { height: 20%; } 100% { height: 78%; } }
        @keyframes eqDance5  { 0% { height: 48%; } 100% { height: 95%; } }
        @keyframes eqDance6  { 0% { height: 15%; } 100% { height: 68%; } }
        @keyframes eqDance7  { 0% { height: 38%; } 100% { height: 92%; } }
        @keyframes eqDance8  { 0% { height: 22%; } 100% { height: 74%; } }
        @keyframes eqDance9  { 0% { height: 46%; } 100% { height: 100%; } }
        @keyframes eqDance10 { 0% { height: 26%; } 100% { height: 62%; } }
        @keyframes eqDance11 { 0% { height: 16%; } 100% { height: 88%; } }
      `}</style>
    </StageGuard>
  )
}

