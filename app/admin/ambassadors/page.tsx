'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AMBASSADOR_SKILLS,
  AMBASSADOR_STATUSES,
  type AmbassadorApplication,
  type AmbassadorStatus,
} from '@/lib/ambassador'

type Filter = 'ALL' | AmbassadorStatus

const STATUS_STYLE: Record<AmbassadorStatus, { dot: string; chip: string }> = {
  NEW: { dot: '🟢', chip: 'bg-emerald-500/15 text-emerald-300' },
  SHORTLISTED: { dot: '🟡', chip: 'bg-[#FFE600]/15 text-[#FFE600]' },
  SELECTED: { dot: '🔵', chip: 'bg-sky-500/15 text-sky-300' },
  REJECTED: { dot: '🔴', chip: 'bg-red-500/15 text-red-300' },
}

const select = 'bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF2D87]'

export default function AdminAmbassadorsPage() {
  const [apps, setApps] = useState<AmbassadorApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<Filter>('ALL')
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('')
  const [year, setYear] = useState('')
  const [skill, setSkill] = useState('')
  const [experienceOnly, setExperienceOnly] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/ambassadors')
    const data = await res.json().catch(() => ({}))
    if (!res.ok) setError(data.error || 'Could not load applications')
    else { setApps(data.applications); setError('') }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function patch(id: string, body: { status?: AmbassadorStatus; admin_notes?: string }) {
    const res = await fetch('/api/admin/ambassadors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...body }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setError(data.error || 'Update failed'); return }
    setError('')
    setApps((cur) => cur.map((a) => (a.id === id ? data.application : a)))
  }

  const counts = useMemo(() => {
    const c: Record<AmbassadorStatus, number> = { NEW: 0, SHORTLISTED: 0, SELECTED: 0, REJECTED: 0 }
    apps.forEach((a) => { c[a.status]++ })
    return c
  }, [apps])

  const departments = useMemo(() => [...new Set(apps.map((a) => a.department))].sort(), [apps])
  const years = useMemo(() => [...new Set(apps.map((a) => a.year))].sort(), [apps])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return apps.filter((a) => {
      if (filter !== 'ALL' && a.status !== filter) return false
      if (dept && a.department !== dept) return false
      if (year && a.year !== year) return false
      if (skill && !a.skills.includes(skill)) return false
      if (experienceOnly && !(a.experience ?? '').trim()) return false
      if (!q) return true
      return [a.full_name, a.roll_number, a.email, a.phone, a.motivation].some((v) => v.toLowerCase().includes(q))
    })
  }, [apps, filter, search, dept, year, skill, experienceOnly])

  const open = apps.find((a) => a.id === openId) ?? null

  return (
    <div className="max-w-5xl mx-auto">
      <p className="font-black text-[#FFE600] text-xs tracking-[0.3em] font-display">TRIBEVERSE</p>
      <h1 className="font-black text-3xl sm:text-4xl text-white font-display tracking-tight">AMBASSADOR CONTROL</h1>
      <p className="mt-1 text-white/50 text-sm">
        Applications: <span className="font-black text-white">{apps.length}</span>
        {' · '}Public form: <a href="/ambassador" target="_blank" className="text-[#FF2D87] font-bold">/ambassador</a>
      </p>

      {/* Status tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(['ALL', ...AMBASSADOR_STATUSES] as Filter[]).map((f) => {
          const n = f === 'ALL' ? apps.length : counts[f]
          const active = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-black font-display tracking-wide transition-colors ${active ? 'bg-[#FF2D87] text-white' : 'bg-white/[0.05] text-white/60 hover:text-white'}`}
            >
              {f} <span className={active ? 'text-white/80' : 'text-white/40'}>{n}</span>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, roll no, email…"
          className={`${select} flex-1 min-w-[200px]`}
        />
        <select value={dept} onChange={(e) => setDept(e.target.value)} className={select}>
          <option value="" className="bg-[#0A0A0A]">All departments</option>
          {departments.map((d) => <option key={d} value={d} className="bg-[#0A0A0A]">{d}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} className={select}>
          <option value="" className="bg-[#0A0A0A]">All years</option>
          {years.map((y) => <option key={y} value={y} className="bg-[#0A0A0A]">{y}</option>)}
        </select>
        <select value={skill} onChange={(e) => setSkill(e.target.value)} className={select}>
          <option value="" className="bg-[#0A0A0A]">All skills</option>
          {AMBASSADOR_SKILLS.map((s) => <option key={s} value={s} className="bg-[#0A0A0A]">{s}</option>)}
        </select>
        <label className={`${select} flex items-center gap-2 cursor-pointer`}>
          <input type="checkbox" checked={experienceOnly} onChange={(e) => setExperienceOnly(e.target.checked)} className="accent-[#FF2D87]" />
          Has experience
        </label>
      </div>

      {error && <p role="alert" className="mt-4 text-red-400 text-sm font-bold">{error}</p>}

      {/* Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && <p className="text-white/40">Loading…</p>}
        {!loading && filtered.length === 0 && <p className="text-white/40">No applications match.</p>}
        {filtered.map((a) => (
          <article key={a.id} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-black text-lg text-white font-display uppercase truncate">{a.full_name}</h2>
                <p className="text-white/50 text-sm">{a.department} · {a.year} · {a.section}</p>
              </div>
              <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-black font-display ${STATUS_STYLE[a.status].chip}`}>
                {STATUS_STYLE[a.status].dot} {a.status}
              </span>
            </div>
            {a.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.skills.map((s) => <span key={s} className="px-2 py-0.5 rounded-md bg-white/[0.06] text-white/70 text-xs font-bold">{s}</span>)}
              </div>
            )}
            <p className="mt-3 text-[11px] font-bold tracking-widest text-white/40 font-display">WHY TRIBEVERSE?</p>
            <p className="text-white/80 text-sm italic line-clamp-3">&ldquo;{a.motivation}&rdquo;</p>
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap gap-2 mt-auto">
              <button onClick={() => setOpenId(a.id)} className="px-3 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-black font-display">VIEW FULL</button>
              <button disabled={a.status === 'SHORTLISTED'} onClick={() => patch(a.id, { status: 'SHORTLISTED' })} className="px-3 py-2 rounded-lg bg-[#FFE600] text-black text-xs font-black font-display disabled:opacity-30">SHORTLIST</button>
              <button disabled={a.status === 'REJECTED'} onClick={() => patch(a.id, { status: 'REJECTED' })} className="px-3 py-2 rounded-lg bg-red-500/20 text-red-300 text-xs font-black font-display disabled:opacity-30">REJECT</button>
            </div>
          </article>
        ))}
      </div>

      {open && <DetailModal key={open.id} app={open} onClose={() => setOpenId(null)} onPatch={(b) => patch(open.id, b)} />}
    </div>
  )
}

function DetailModal({
  app,
  onClose,
  onPatch,
}: {
  app: AmbassadorApplication
  onClose: () => void
  onPatch: (b: { status?: AmbassadorStatus; admin_notes?: string }) => Promise<void>
}) {
  const [note, setNote] = useState(app.admin_notes ?? '')
  const [saved, setSaved] = useState(false)

  const social = (v: string | null) => {
    if (!v) return <span className="text-white/30">—</span>
    const href = /^https?:\/\//i.test(v) ? v : null
    return href ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#FF2D87] break-all">{v}</a> : <span className="break-all">{v}</span>
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="bg-[#0F0F0F] border border-white/10 w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-black text-2xl text-white font-display uppercase">{app.full_name}</h2>
            <p className="text-white/50 text-sm">{app.department} • {app.year} • {app.section} • {app.roll_number}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white text-2xl leading-none">×</button>
        </div>

        <Section title="Contact">
          <dl className="grid grid-cols-[90px_1fr] gap-y-1.5 text-sm text-white/80">
            <dt className="text-white/40">Phone</dt><dd><a href={`tel:${app.phone}`}>{app.phone}</a></dd>
            <dt className="text-white/40">Email</dt><dd className="break-all"><a href={`mailto:${app.email}`}>{app.email}</a></dd>
            <dt className="text-white/40">Instagram</dt><dd>{social(app.instagram)}</dd>
            <dt className="text-white/40">LinkedIn</dt><dd>{social(app.linkedin)}</dd>
          </dl>
        </Section>

        <Section title="Skills">
          {app.skills.length ? (
            <div className="flex flex-wrap gap-2">
              {app.skills.map((s) => <span key={s} className="px-3 py-1 rounded-full bg-[#FF2D87]/15 text-[#FF2D87] text-xs font-black font-display uppercase">{s}</span>)}
            </div>
          ) : <p className="text-white/30 text-sm">None selected</p>}
        </Section>

        <Section title="Why do you want to join?"><Long text={app.motivation} /></Section>
        <Section title="Previous Experience"><Long text={app.experience} /></Section>
        {app.extra && <Section title="Anything else"><Long text={app.extra} /></Section>}

        <Section title="Decision">
          <p className="text-xs text-white/40 mb-2">Current: {STATUS_STYLE[app.status].dot} {app.status}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onPatch({ status: 'SHORTLISTED' })} className="px-4 py-2 rounded-lg bg-[#FFE600] text-black text-sm font-black font-display">SHORTLIST</button>
            <button onClick={() => onPatch({ status: 'SELECTED' })} className="px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-black font-display">SELECT</button>
            <button onClick={() => onPatch({ status: 'REJECTED' })} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 text-sm font-black font-display">REJECT</button>
          </div>
        </Section>

        <Section title="Internal Note">
          <textarea
            value={note}
            onChange={(e) => { setNote(e.target.value); setSaved(false) }}
            rows={3}
            maxLength={4000}
            placeholder="Good communication. Consider for event operations."
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF2D87]"
          />
          <button
            onClick={async () => { await onPatch({ admin_notes: note }); setSaved(true) }}
            className="mt-2 px-4 py-2 rounded-lg bg-white/[0.1] text-white text-sm font-black font-display"
          >
            {saved ? 'SAVED ✓' : 'SAVE NOTE'}
          </button>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="text-[11px] font-black tracking-widest text-[#FFE600] font-display uppercase mb-2">{title}</h3>
      {children}
    </div>
  )
}

function Long({ text }: { text: string | null }) {
  return text?.trim()
    ? <p className="text-white/80 text-sm whitespace-pre-wrap">{text}</p>
    : <p className="text-white/30 text-sm">—</p>
}
