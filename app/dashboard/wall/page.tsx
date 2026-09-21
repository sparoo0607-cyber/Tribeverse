'use client'

import { useEffect, useState } from 'react'
import StageGuard from '@/components/StageGuard'
import { createClient } from '@/lib/supabase/client'
import { fetchAllWallPosts, subscribeToWallPosts, submitWallPost, likePost, WallPostRow } from '@/lib/wall'

const COLORS = ['#FFE600', '#FF6BDE', '#00FFD1', '#FF8C42', '#6BFFA0']
const DEGS = ['-3deg', '-2deg', '-1deg', '1deg', '2deg', '3deg']

function WallGame() {
  const [userId, setUserId] = useState<string | null>(null)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [authorName, setAuthorName] = useState('')
  const [posts, setPosts] = useState<WallPostRow[]>([])
  const [dream, setDream] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function loadIdentity() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      if (!cancelled) setUserId(user.id)

      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      const { data: membership } = await supabase.from('team_members').select('team_id, team:teams(name, team_number)').eq('user_id', user.id).maybeSingle()
      if (cancelled) return

      const team = Array.isArray(membership?.team) ? membership?.team[0] : membership?.team
      setTeamId(membership?.team_id ?? null)
      setAuthorName(team ? `${profile?.full_name ?? 'Participant'} (${team.name})` : profile?.full_name ?? 'Participant')
    }

    async function loadPosts() {
      const data = await fetchAllWallPosts()
      if (!cancelled) setPosts(data)
    }

    loadIdentity()
    loadPosts()
    const unsub = subscribeToWallPosts(loadPosts)
    return () => { cancelled = true; unsub() }
  }, [])

  async function handlePin(e: React.FormEvent) {
    e.preventDefault()
    if (!dream.trim() || !userId) return
    setSubmitting(true)
    await submitWallPost({ userId, teamId, authorName: authorName || 'Participant', content: dream.trim() })
    setDream('')
    setSubmitting(false)
    setJustSubmitted(true)
    setTimeout(() => setJustSubmitted(false), 4000)
  }

  const approved = posts.filter((p) => p.status === 'approved')
  const myPending = posts.filter((p) => p.status === 'pending' && p.userId === userId)

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <span className="px-3 py-1 bg-[#D4FF00]/20 text-[#D4FF00] text-xs font-black rounded-full font-display uppercase tracking-widest">
          Interactive Dream Wall
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white font-display" style={{ background: 'linear-gradient(135deg, #D4FF00, #00FFD1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          THE TRIBE WALL
        </h1>
        <p className="text-white/80 font-bold text-lg sm:text-xl font-display">&quot;BEFORE I GRADUATE, I WANT TO...&quot;</p>
        <p className="text-white/40 text-xs">{approved.length} Dreams Live on the Wall</p>
      </div>

      {/* Pin Input Form */}
      <div className="max-w-xl mx-auto bg-white/[0.04] border border-[#D4FF00]/30 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
        <h3 className="font-black text-white text-base font-display mb-3">Pin Your Dream to the Live Wall</h3>
        <form onSubmit={handlePin} className="space-y-3">
          <textarea
            required
            rows={2}
            maxLength={120}
            placeholder="Before I graduate, I want to..."
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#D4FF00]"
          />
          <button
            type="submit"
            disabled={submitting || !dream.trim()}
            className="w-full bg-[#D4FF00] text-black font-black py-3 rounded-xl font-display text-xs uppercase tracking-wider hover:bg-[#FFE600] transition-colors disabled:opacity-40"
          >
            {submitting ? 'Pinning…' : 'PIN TO WALL'}
          </button>
        </form>
        {justSubmitted && (
          <p className="text-[#D4FF00] text-xs font-bold mt-3 text-center">Submitted! It&apos;ll appear once the Event Controller approves it.</p>
        )}
        {myPending.length > 0 && (
          <p className="text-white/40 text-xs mt-3 text-center">{myPending.length} of your dream(s) awaiting approval</p>
        )}
      </div>

      {/* Sticky Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {approved.map((post, i) => (
          <div
            key={post.id}
            className="p-5 rounded-xl shadow-xl flex flex-col justify-between transition-transform hover:scale-105 select-none"
            style={{ background: COLORS[i % COLORS.length], transform: `rotate(${DEGS[i % DEGS.length]})`, color: '#0A0A0A' }}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 font-display">{post.authorName}</p>
              <p className="font-bold text-base leading-snug font-sans">{post.content}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
              <button
                onClick={() => likePost(post.id, post.likesCount)}
                className="flex items-center gap-1.5 px-3 py-1 bg-black/10 hover:bg-black/20 rounded-full text-xs font-bold transition-colors"
              >
                ❤️ {post.likesCount}
              </button>
              <span className="text-[10px] font-mono opacity-50">{post.isPinned ? '★ Featured' : 'Student Tribe'}</span>
            </div>
          </div>
        ))}
        {approved.length === 0 && (
          <p className="col-span-full text-center text-white/30 text-sm py-8">No dreams on the wall yet — be the first to pin one!</p>
        )}
      </div>
    </div>
  )
}

export default function TribeWallPage() {
  return (
    <StageGuard slug="wall" title="The Tribe Wall" stageNumber="07" points={300}>
      <WallGame />
    </StageGuard>
  )
}
