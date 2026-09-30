'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Row {
  id: string
  full_name: string
  total_score: number
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, total_score')
        .eq('role', 'student')
        .gt('total_score', 0)
        .order('total_score', { ascending: false })
        .limit(100)
      if (!cancelled) {
        setRows((data ?? []) as Row[])
        setLoading(false)
      }
    }
    load()

    const channel = supabase
      .channel('leaderboard-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load)
      .subscribe()
    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [])

  const filtered = rows
    .map((r, i) => ({ ...r, rank: i + 1 }))
    .filter((r) => r.full_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-display">Leaderboard</h1>
          <p className="text-white/50 text-sm mt-0.5">Top 100 participants by points, updated live.</p>
        </div>
        <input
          type="text"
          placeholder="Search name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#FFE600]"
        />
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#FFE600] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-white/40 text-sm py-12">No points scored yet. Play a stage to get on the board.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className={`font-mono font-black w-8 ${r.rank <= 3 ? 'text-[#FFE600]' : 'text-white/40'}`}>
                  {String(r.rank).padStart(2, '0')}
                </span>
                <span className="flex-1 font-bold text-white font-display text-sm truncate">{r.full_name}</span>
                <span className="font-mono font-black text-[#FFE600]">{r.total_score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
