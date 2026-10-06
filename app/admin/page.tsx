'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { fetchStageStates, subscribeToStageChanges } from '@/lib/stageStore'
import Icon, { IconName } from '@/components/icons/Icon'

export default function AdminDashboardPage() {
  const [participants, setParticipants] = useState<number | null>(null)
  const [tagsIssued, setTagsIssued] = useState<number | null>(null)
  const [pendingPosts, setPendingPosts] = useState<number | null>(null)
  const [liveStages, setLiveStages] = useState<string[]>([])

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function load() {
      const [people, tags, pending, stages] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('tag_issued', true),
        supabase.from('wall_posts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        fetchStageStates(),
      ])
      if (cancelled) return
      setParticipants(people.count ?? 0)
      setTagsIssued(tags.count ?? 0)
      setPendingPosts(pending.count ?? 0)
      setLiveStages(Object.values(stages).filter((s) => s.status === 'live').map((s) => s.name))
    }
    load()
    const unsubscribe = subscribeToStageChanges(load)
    return () => { cancelled = true; unsubscribe() }
  }, [])

  const show = (n: number | null) => (n === null ? '...' : n)

  const metrics = [
    { label: 'Registered Participants', val: show(participants), icon: 'graduation-cap' as IconName, color: '#00FFD1', link: '/admin/participants' },
    { label: 'Wristbands Issued', val: show(tagsIssued), icon: 'tag' as IconName, color: '#00FF88', link: '/admin/scanner' },
    { label: 'Wall Posts Awaiting Approval', val: show(pendingPosts), icon: 'chat' as IconName, color: '#FF2D87', link: '/event-control#wall' },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-black text-white font-display">Control Center</h1>
          <p className="text-white/50 text-sm">TRIBEVERSE V1 · POSTPONED · new date TBA</p>
        </div>
        <span className={`self-start px-3 py-1 text-xs font-black rounded-full font-display ${liveStages.length ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>
          {liveStages.length ? `LIVE: ${liveStages.join(', ')}` : 'NO STAGE LIVE'}
        </span>
      </div>

      <div className="bg-gradient-to-r from-[#1A6FFF]/20 via-[#FFE600]/15 to-[#FF2D87]/20 border-2 border-[#FFE600]/40 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFE600] text-black flex items-center justify-center shrink-0">
            <Icon name="camera" className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#FFE600] font-black uppercase">Gate check-in</span>
            <h3 className="text-xl font-black text-white font-display">QR Scanner & Wristbands</h3>
            <p className="text-white/70 text-xs mt-0.5">
              <strong className="text-green-400">{show(tagsIssued)}</strong> of {show(participants)} participants checked in.
            </p>
          </div>
        </div>
        <Link
          href="/admin/scanner"
          className="px-6 py-3.5 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black font-black text-xs uppercase tracking-widest rounded-xl font-display whitespace-nowrap"
        >
          Open Gate Scanner →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <Link key={m.label} href={m.link} className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-3">
              <Icon name={m.icon} className="w-6 h-6" style={{ color: m.color }} />
              <span className="text-xs font-bold text-white/40 font-display">VIEW</span>
            </div>
            <p className="text-3xl font-black text-white font-display mb-1">{m.val}</p>
            <p className="text-white/50 text-xs font-display">{m.label}</p>
          </Link>
        ))}
      </div>

      <Link href="/event-control" className="flex items-start gap-4 bg-white/[0.03] border border-white/10 hover:border-white/25 p-5 rounded-2xl transition-all">
        <span className="p-2.5 rounded-xl shrink-0 bg-[#00FFD1]/15 text-[#00FFD1]">
          <Icon name="monitor" className="w-5 h-5" />
        </span>
        <div>
          <h3 className="font-black text-white font-display">Event Control</h3>
          <p className="text-white/50 text-xs mt-0.5">Lock, go live and conclude each stage, send announcements, approve Tribe Wall posts and reset the event.</p>
        </div>
      </Link>
    </div>
  )
}
