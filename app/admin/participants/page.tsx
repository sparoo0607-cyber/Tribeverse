'use client'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ParticipantRow {
  id: string
  full_name: string
  student_id: string | null
  branch: string | null
  section: string | null
  phone: string | null
  tag_issued: boolean | null
  created_at: string
}

type Filter = 'all' | 'checked-in' | 'not-yet'

export default function AdminParticipantsPage() {
  const [rows, setRows] = useState<ParticipantRow[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, student_id, branch, section, phone, tag_issued, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false })
      if (!cancelled) {
        setRows((data ?? []) as ParticipantRow[])
        setLoading(false)
      }
    }
    load()

    const channel = supabase
      .channel('admin-participants-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load)
      .subscribe()
    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [])

  const checkedIn = rows.filter((r) => r.tag_issued).length

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (filter === 'checked-in' && !r.tag_issued) return false
      if (filter === 'not-yet' && r.tag_issued) return false
      if (!q) return true
      return (
        r.full_name.toLowerCase().includes(q) ||
        (r.student_id ?? '').toLowerCase().includes(q) ||
        (r.phone ?? '').includes(q) ||
        (r.branch ?? '').toLowerCase().includes(q)
      )
    })
  }, [rows, search, filter])

  function exportCsv() {
    const esc = (v: string | null | undefined) => `"${(v ?? '').replace(/"/g, '""')}"`
    const lines = [
      'Name,Pass ID,Branch,Section,Phone,Checked in',
      ...filtered.map((r) => [esc(r.full_name), esc(r.student_id), esc(r.branch), esc(r.section), esc(r.phone), r.tag_issued ? 'Yes' : 'No'].join(',')),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'tribeverse-participants.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const chip = (id: Filter, label: string) => (
    <button
      key={id}
      onClick={() => setFilter(id)}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-display ${filter === id ? 'bg-[#FF2D87] text-white' : 'bg-white/5 text-white/50 hover:text-white'}`}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-display">Participants</h1>
          <p className="text-white/50 text-sm">
            {rows.length} registered · {checkedIn} checked in · {rows.length - checkedIn} yet to arrive
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="self-start px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold font-display uppercase tracking-wider disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          type="text"
          placeholder="Search name, pass ID, phone, branch"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF2D87]"
        />
        <div className="flex gap-2">
          {chip('all', 'All')}
          {chip('checked-in', 'Checked in')}
          {chip('not-yet', 'Not yet')}
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#FF2D87] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-white/40 text-sm py-12">No participants found.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 sm:px-5 py-3.5">
                <div className="flex-1 min-w-[160px]">
                  <p className="font-bold text-white font-display text-sm">{r.full_name}</p>
                  <p className="text-white/40 text-xs font-mono">{r.student_id ?? 'No pass ID'}</p>
                </div>
                <p className="text-white/50 text-xs">{[r.branch, r.section].filter(Boolean).join(' · ') || '-'}</p>
                <p className="text-white/40 text-xs font-mono">{r.phone || '-'}</p>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black font-display uppercase ${r.tag_issued ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                  {r.tag_issued ? 'Checked in' : 'Not yet'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
