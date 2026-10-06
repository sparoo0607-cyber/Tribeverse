'use client'

import { useState } from 'react'
import { AMBASSADOR_DEPARTMENTS, AMBASSADOR_SECTIONS, AMBASSADOR_SKILLS, AMBASSADOR_YEARS } from '@/lib/ambassador'

const ROLES = [
  { icon: '🎓', label: 'Open to ANITS students' },
  { icon: '🤝', label: 'Community & Event Operations' },
  { icon: '📣', label: 'Promotion & Outreach' },
  { icon: '🎤', label: 'Event Coordination' },
  { icon: '🎮', label: 'Game / Activity Management' },
  { icon: '📸', label: 'Media & Content' },
]

const field =
  'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF2D87] transition-colors'
const label = 'block text-xs font-bold tracking-widest text-white/60 mb-2 font-display uppercase'

export default function AmbassadorPage() {
  const [form, setForm] = useState({
    full_name: '', roll_number: '', section: '', department: '', year: '', phone: '', email: '',
    motivation: '', experience: '', instagram: '', linkedin: '', extra: '', website: '',
  })
  const [skills, setSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const toggleSkill = (s: string) =>
    setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/ambassador/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, skills }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not submit. Please try again.')
      } else {
        setDone(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#FFE600] text-black flex items-center justify-center text-4xl font-black">✓</div>
          <h1 className="font-black text-3xl sm:text-4xl text-white font-display tracking-tight">APPLICATION RECEIVED</h1>
          <p className="mt-4 text-[#FF2D87] font-black text-xl font-display">Welcome to the Tribe.</p>
          <p className="mt-2 text-white/60">We&apos;ll get back to you soon.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-12 sm:pt-24 text-center">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(255,45,135,0.25), transparent 70%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <p className="font-black text-[#FFE600] text-xs sm:text-sm tracking-[0.3em] font-display">TRIBEVERSE CAMPUS AMBASSADORS</p>
          <h1 className="mt-5 font-black font-display leading-[0.95] text-5xl sm:text-7xl tracking-tight">
            BUILD THE EXPERIENCE.<br />
            <span className="text-[#FF2D87]">LEAD THE TRIBE.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/70">
            Don&apos;t just attend the event.<br />Help build it.
          </p>
          <p className="mt-3 inline-block px-3 py-1 rounded-full bg-[#FFE600]/10 text-[#FFE600] text-xs font-bold tracking-widest font-display">
            APPLICATIONS ARE NOW OPEN
          </p>
          <div className="mt-8">
            <a href="#apply" className="inline-block bg-[#FF2D87] hover:bg-[#ff4a99] text-white font-black font-display tracking-wider px-8 py-4 rounded-2xl transition-colors">
              APPLY NOW →
            </a>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="px-4 pb-14">
        <ul className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ROLES.map((r) => (
            <li key={r.label} className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 font-bold font-display">
              <span className="text-2xl">{r.icon}</span>
              {r.label}
            </li>
          ))}
        </ul>
      </section>

      {/* Form */}
      <section id="apply" className="px-4 pb-24">
        <form onSubmit={submit} className="max-w-2xl mx-auto space-y-10">
          <div>
            <h2 className="font-black text-2xl font-display text-[#FFE600] tracking-wider mb-5">PERSONAL DETAILS</h2>
            <div className="space-y-4">
              <div>
                <label className={label} htmlFor="full_name">Full Name *</label>
                <input id="full_name" required maxLength={120} className={field} value={form.full_name} onChange={set('full_name')} autoComplete="name" />
              </div>
              <div>
                <label className={label} htmlFor="roll_number">Roll Number *</label>
                <input id="roll_number" required maxLength={40} className={`${field} uppercase`} value={form.roll_number} onChange={set('roll_number')} />
              </div>
              <div>
                <label className={label} htmlFor="section">Section *</label>
                <select id="section" required className={field} value={form.section} onChange={set('section')}>
                  <option value="" className="bg-[#0A0A0A]">Select…</option>
                  {AMBASSADOR_SECTIONS.map((s) => <option key={s} value={s} className="bg-[#0A0A0A]">{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={label} htmlFor="department">Department *</label>
                  <select id="department" required className={field} value={form.department} onChange={set('department')}>
                    <option value="" className="bg-[#0A0A0A]">Select…</option>
                    {AMBASSADOR_DEPARTMENTS.map((d) => <option key={d} value={d} className="bg-[#0A0A0A]">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={label} htmlFor="year">Year *</label>
                  <select id="year" required className={field} value={form.year} onChange={set('year')}>
                    <option value="" className="bg-[#0A0A0A]">Select…</option>
                    {AMBASSADOR_YEARS.map((y) => <option key={y} value={y} className="bg-[#0A0A0A]">{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={label} htmlFor="phone">Phone Number *</label>
                  <input id="phone" required type="tel" inputMode="tel" maxLength={20} className={field} value={form.phone} onChange={set('phone')} autoComplete="tel" />
                </div>
                <div>
                  <label className={label} htmlFor="email">Email *</label>
                  <input id="email" required type="email" maxLength={200} className={field} value={form.email} onChange={set('email')} autoComplete="email" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-black text-2xl font-display text-[#FFE600] tracking-wider mb-5">ABOUT YOU</h2>
            <div className="space-y-5">
              <div>
                <label className={label} htmlFor="motivation">Why do you want to be a TRIBEVERSE Campus Ambassador? *</label>
                <textarea id="motivation" required rows={4} maxLength={2000} className={field} value={form.motivation} onChange={set('motivation')} />
              </div>
              <div>
                <span className={label}>What are you good at?</span>
                <div className="flex flex-wrap gap-2">
                  {AMBASSADOR_SKILLS.map((s) => {
                    const on = skills.includes(s)
                    return (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleSkill(s)}
                        className={`px-4 py-2 rounded-full text-sm font-bold font-display border transition-colors ${on ? 'bg-[#FF2D87] border-[#FF2D87] text-white' : 'bg-white/[0.04] border-white/10 text-white/70 hover:border-white/30'}`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className={label} htmlFor="experience">Previous experience?</label>
                <textarea id="experience" rows={3} maxLength={2000} className={field} value={form.experience} onChange={set('experience')} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={label} htmlFor="instagram">Instagram</label>
                  <input id="instagram" maxLength={300} placeholder="@handle or link" className={field} value={form.instagram} onChange={set('instagram')} />
                </div>
                <div>
                  <label className={label} htmlFor="linkedin">LinkedIn</label>
                  <input id="linkedin" maxLength={300} placeholder="Profile link" className={field} value={form.linkedin} onChange={set('linkedin')} />
                </div>
              </div>
              <div>
                <label className={label} htmlFor="extra">Anything else you want us to know?</label>
                <textarea id="extra" rows={3} maxLength={2000} className={field} value={form.extra} onChange={set('extra')} />
              </div>
            </div>
          </div>

          {/* Honeypot — hidden from people, bots fill it */}
          <input
            type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
            value={form.website} onChange={set('website')}
            className="absolute -left-[9999px] w-px h-px opacity-0"
          />

          {error && <p role="alert" className="text-red-400 font-bold text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF2D87] hover:bg-[#ff4a99] disabled:opacity-50 text-white font-black font-display tracking-widest py-4 rounded-2xl transition-colors"
          >
            {loading ? 'SUBMITTING…' : 'SUBMIT APPLICATION'}
          </button>
        </form>
      </section>
    </main>
  )
}
