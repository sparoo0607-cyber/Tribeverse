'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TRIBE_TEAM_MEMBERS } from '@/lib/teamData'
import TeamCard from '@/components/TeamCard'
import Icon from '@/components/icons/Icon'

const CATEGORIES = ['All', 'Lead', 'Tech', 'Operations', 'Design', 'Host', 'Core'] as const

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function TeamPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [search, setSearch] = useState('')
  // Start with the source order for a stable server render, then shuffle
  // client-side after mount to avoid a hydration mismatch.
  const [shuffledMembers, setShuffledMembers] = useState(TRIBE_TEAM_MEMBERS)

  useEffect(() => {
    setShuffledMembers(shuffle(TRIBE_TEAM_MEMBERS))
  }, [])

  const filteredMembers = shuffledMembers.filter((m) => {
    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.branch.toLowerCase().includes(search.toLowerCase()) ||
      m.teamIdBadge.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white selection:bg-[#FFE600] selection:text-black">
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-[#FFE600]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-[#FF2D87]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#1A6FFF]/10 rounded-full blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex items-center justify-between border-b border-white/10 gap-2">
        <Link href="/" className="inline-flex items-baseline gap-2 group flex-shrink-0">
          <span className="font-black text-2xl sm:text-3xl text-[#FFE600] tracking-tight group-hover:scale-105 transition-transform" style={{ fontFamily: 'Outfit, sans-serif' }}>st.</span>
          <span className="font-bold text-[10px] sm:text-xs tracking-widest text-white/70 uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>STUDENT TRIBE</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Link
            href="/"
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            ← Back
          </Link>
          <Link
            href="/register"
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider bg-[#FFE600] hover:bg-[#FFE600]/90 text-black shadow-lg transition-all"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Register →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-10">
        
        {/* Title & Description */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 px-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 sm:px-4 sm:py-1.5 bg-[#FFE600]/15 border border-[#FFE600]/30 text-[#FFE600] rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest font-display">
            <Icon name="sparkle" /> TRIBE ORGANIZING COMMITTEE & LEADS
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-display">
            MEET THE <span className="text-[#FFE600]">TRIBE TEAM</span>
          </h1>
          <p className="text-white/60 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Official Student Tribe ambassadors leading the TRIBEVERSE experience at ANITS. Tap any card to view the full ID and flip in 3D.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto">
            {CATEGORIES.map((cat) => {
              const count = cat === 'All'
                ? TRIBE_TEAM_MEMBERS.length
                : TRIBE_TEAM_MEMBERS.filter((m) => m.category === cat).length

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-[#FFE600] text-black shadow-[0_0_20px_rgba(255,230,0,0.3)] scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'
                  }`}
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    selectedCategory === cat ? 'bg-black/20 text-black' : 'bg-white/10 text-white/50'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search Input */}
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search by name, role, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-[#FFE600] rounded-xl px-4 py-2 sm:py-2.5 text-white placeholder-white/30 text-xs focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredMembers.map((member, i) => (
            <TeamCard key={member.id} member={member} index={i} />
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="py-20 text-center text-white/40 font-display">
            No team members found matching your search.
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-xs text-white/40">
        Student Tribe Presents TRIBEVERSE V1 · Empowering Students Across India
      </footer>

    </div>
  )
}
