'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Icon from '@/components/icons/Icon'

const ROUND_NAMES: Record<number, string> = {
  1: 'Quick Eyes',
  2: 'Quick Draw',
  3: 'Think Fast',
  4: 'Sound Check',
  5: 'Memory Chain',
}

interface Me {
  full_name: string
  student_id: string | null
  roll_number: string | null
  branch: string | null
  section: string | null
  assigned_round: number | null
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      setMe({
        full_name: data?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Participant',
        student_id: data?.student_id ?? null,
        roll_number: data?.roll_number ?? user.user_metadata?.roll_number ?? null,
        branch: data?.branch ?? null,
        section: data?.section ?? null,
        assigned_round: data?.assigned_round ?? null,
      })
      setLoading(false)
    }
    load()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div className="p-12 text-center text-white/50 font-display">Loading…</div>

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-white font-display">My Profile</h1>
          <p className="text-white/50 text-sm">Your TRIBEVERSE V1 participant details.</p>
        </div>
        <Link
          href="/dashboard/pass"
          className="px-4 py-2 bg-[#FFE600] text-black font-black font-display text-xs uppercase tracking-wider rounded-xl inline-flex items-center gap-1.5 shrink-0"
        >
          <Icon name="ticket" /> My Pass
        </Link>
      </div>

      {me && (
        <div className="rounded-3xl bg-gradient-to-br from-[#1A6FFF] via-[#0D1B4B] to-[#7B2FFF] p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#FFE600] text-black font-black text-3xl font-display flex items-center justify-center shrink-0">
              {me.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-black text-white font-display break-words">{me.full_name}</h2>
              {me.student_id && <p className="text-[#00FFD1] text-xs font-mono font-bold">{me.student_id}</p>}
              {me.roll_number && <p className="text-white/60 text-xs font-mono mt-0.5">Roll No. {me.roll_number}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-black/40 p-4 rounded-2xl border border-white/10 text-xs">
            <div>
              <span className="text-white/40 block font-display uppercase">Branch</span>
              <strong className="text-white font-bold text-sm">{[me.branch, me.section].filter(Boolean).join(' · ') || 'Freshers'}</strong>
            </div>
            <div>
              <span className="text-white/40 block font-display uppercase">Playground round</span>
              <strong className="text-[#FFE600] font-bold text-sm">
                {me.assigned_round ? `#${me.assigned_round} ${ROUND_NAMES[me.assigned_round] ?? ''}` : 'Assigned on the day'}
              </strong>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-white/40 font-mono">
            <span>TRIBEVERSE V1</span>
            <span>23 SEP 2026</span>
          </div>
        </div>
      )}

      <button
        onClick={handleSignOut}
        className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 font-bold font-display text-xs uppercase tracking-wider hover:bg-red-500/10 transition-colors"
      >
        Sign Out
      </button>
    </div>
  )
}
