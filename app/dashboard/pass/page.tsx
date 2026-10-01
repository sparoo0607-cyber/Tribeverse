'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/client'
import Icon from '@/components/icons/Icon'

const EVENT = {
  name: 'TRIBEVERSE V1',
  date: 'Wednesday, 23 Sep 2026',
  time: '9:30 AM to 3:30 PM',
  venue: 'ANITS, Visakhapatnam',
}

const ROUND_NAMES: Record<number, string> = {
  1: 'Quick Eyes',
  2: 'Quick Draw',
  3: 'Think Fast',
  4: 'Sound Check',
  5: 'Memory Chain',
}

interface PassProfile {
  full_name: string
  student_id: string
  roll_number?: string | null
  branch?: string
  section?: string
  tag_issued?: boolean
  assigned_round?: number | null
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Draws the pass to a canvas and returns it as a PNG data URL.
async function renderPassPng(p: PassProfile, qrDataUrl: string): Promise<string> {
  const W = 1080
  const H = 1790
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const font = '"Helvetica Neue", Arial, sans-serif'

  // Background
  ctx.fillStyle = '#0A0D14'
  ctx.fillRect(0, 0, W, H)

  // Ticket body
  const x = 60
  const y = 60
  const w = W - 120
  const h = H - 120
  roundRect(ctx, x, y, w, h, 48)
  ctx.fillStyle = '#151A24'
  ctx.fill()

  // Header band
  ctx.save()
  roundRect(ctx, x, y, w, h, 48)
  ctx.clip()
  const grad = ctx.createLinearGradient(x, y, x + w, y)
  grad.addColorStop(0, '#FFE600')
  grad.addColorStop(0.55, '#FF6B1A')
  grad.addColorStop(1, '#FF2D87')
  ctx.fillStyle = grad
  ctx.fillRect(x, y, w, 250)
  ctx.restore()

  ctx.fillStyle = '#0A0D14'
  ctx.font = `900 84px ${font}`
  ctx.textAlign = 'left'
  ctx.fillText('st.', x + 60, y + 120)
  ctx.font = `800 34px ${font}`
  ctx.fillText('STUDENT TRIBE', x + 190, y + 100)
  ctx.font = `600 28px ${font}`
  ctx.fillText('OFFICIAL PARTICIPANT PASS', x + 190, y + 140)
  ctx.font = `900 64px ${font}`
  ctx.fillText(EVENT.name, x + 60, y + 218)

  // Participant
  ctx.fillStyle = '#FFE600'
  ctx.font = `700 28px ${font}`
  ctx.fillText('PARTICIPANT', x + 60, y + 340)
  ctx.fillStyle = '#FFFFFF'
  let nameSize = 76
  ctx.font = `900 ${nameSize}px ${font}`
  while (ctx.measureText(p.full_name).width > w - 120 && nameSize > 40) {
    nameSize -= 4
    ctx.font = `900 ${nameSize}px ${font}`
  }
  ctx.fillText(p.full_name, x + 60, y + 340 + nameSize + 8)
  ctx.fillStyle = '#00FFD1'
  ctx.font = `700 40px "Courier New", monospace`
  ctx.fillText(p.student_id, x + 60, y + 340 + nameSize + 76)

  // Details
  const rows: [string, string][] = [
    ['DATE', EVENT.date],
    ['TIME', EVENT.time],
    ['VENUE', EVENT.venue],
    ['ROLL NUMBER', p.roll_number || '-'],
    ['BRANCH', [p.branch, p.section].filter(Boolean).join('  |  ') || 'Freshers'],
  ]
  let ry = y + 340 + nameSize + 150
  for (const [label, value] of rows) {
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = `700 24px ${font}`
    ctx.fillText(label, x + 60, ry)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `700 38px ${font}`
    ctx.fillText(value, x + 60, ry + 46)
    ry += 100
  }

  // Tear line
  const ty = ry + 10
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 3
  ctx.setLineDash([16, 14])
  ctx.beginPath()
  ctx.moveTo(x + 40, ty)
  ctx.lineTo(x + w - 40, ty)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = '#0A0D14'
  ctx.beginPath()
  ctx.arc(x, ty, 30, 0, Math.PI * 2)
  ctx.arc(x + w, ty, 30, 0, Math.PI * 2)
  ctx.fill()

  // QR
  const qr = await new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = qrDataUrl
  })
  const qs = 440
  const qx = (W - qs) / 2
  const qy = ty + 60
  roundRect(ctx, qx - 30, qy - 30, qs + 60, qs + 60, 32)
  ctx.fillStyle = '#FFFFFF'
  ctx.fill()
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(qr, qx, qy, qs, qs)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#FFE600'
  ctx.font = `800 32px ${font}`
  ctx.fillText('SCAN AT THE ENTRY GATE', W / 2, qy + qs + 100)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = `600 26px ${font}`
  ctx.fillText('Non-transferable. Carry your college ID.', W / 2, qy + qs + 148)

  return canvas.toDataURL('image/png')
}

function EventPassContent() {
  const [profile, setProfile] = useState<PassProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrUrl, setQrUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [isNewRegistration, setIsNewRegistration] = useState(false)

  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') setIsNewRegistration(true)

    async function load() {
      // Instant render from the registration cache, then replace with the real profile.
      try {
        const cached = localStorage.getItem('tribeverse_pass_data')
        if (cached) {
          const c = JSON.parse(cached)
          if (c.fullName && c.studentId) {
            setProfile({
              full_name: c.fullName,
              student_id: c.studentId,
              roll_number: c.rollNumber,
              branch: c.branch,
              section: c.section,
              assigned_round: c.assignedRound,
            })
            setLoading(false)
          }
        }
      } catch {}

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      setProfile({
        full_name: p?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Participant',
        roll_number: p?.roll_number || user.user_metadata?.roll_number || null,
        student_id: p?.student_id || user.user_metadata?.student_id || `ST-2026-TRB-${user.id.substring(0, 4).toUpperCase()}`,
        branch: p?.branch || user.user_metadata?.branch,
        section: p?.section || user.user_metadata?.section,
        tag_issued: p?.tag_issued || false,
        assigned_round: p?.assigned_round ?? null,
      })
      setLoading(false)
    }
    load()
  }, [searchParams])

  // The QR encodes the pass ID, which is exactly what the gate scanner searches by.
  useEffect(() => {
    if (!profile?.student_id) return
    QRCode.toDataURL(profile.student_id, {
      width: 640,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: { dark: '#000000', light: '#FFFFFF' },
    }).then(setQrUrl).catch(() => setQrUrl(''))
  }, [profile?.student_id])

  function handleCopy() {
    if (!profile) return
    navigator.clipboard.writeText(profile.student_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownload() {
    if (!profile || !qrUrl) return
    setDownloading(true)
    try {
      const png = await renderPassPng(profile, qrUrl)
      const a = document.createElement('a')
      a.href = png
      a.download = `tribeverse-pass-${profile.student_id}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-white/50 font-display">Loading your pass…</div>
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto text-center bg-white/[0.03] border border-white/10 rounded-3xl p-10 space-y-4">
        <Icon name="ticket" className="w-10 h-10 mx-auto text-[#FFE600]" />
        <h2 className="text-2xl font-black text-white font-display">Sign in to see your pass</h2>
        <p className="text-white/50 text-sm">Your personal QR pass appears here once you are logged in.</p>
        <Link href="/register" className="inline-block px-6 py-3 bg-[#FFE600] text-black font-black text-xs uppercase rounded-xl font-display">
          Register / Login
        </Link>
      </div>
    )
  }

  const details: { label: string; value: string }[] = [
    { label: 'Date', value: EVENT.date },
    { label: 'Time', value: EVENT.time },
    { label: 'Venue', value: EVENT.venue },
    { label: 'Roll Number', value: profile.roll_number || '-' },
    { label: 'Branch', value: [profile.branch, profile.section].filter(Boolean).join(' · ') || 'Freshers' },
  ]

  return (
    <div className="max-w-md mx-auto space-y-5 pb-12">
      {isNewRegistration && (
        <div className="bg-[#FFE600]/10 border border-[#FFE600]/40 rounded-2xl p-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-black text-white text-sm font-display">You are registered!</h3>
            <p className="text-white/70 text-xs mt-0.5">Download your pass and show the QR at the entry gate.</p>
          </div>
          <button onClick={() => setIsNewRegistration(false)} className="text-white/50 hover:text-white" aria-label="Dismiss">
            <Icon name="close" />
          </button>
        </div>
      )}

      {/* Ticket */}
      <div className="rounded-[28px] overflow-hidden bg-[#151A24] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="bg-gradient-to-r from-[#FFE600] via-[#FF6B1A] to-[#FF2D87] p-6 text-[#0A0D14]">
          <div className="flex items-center gap-3">
            <span className="font-black text-4xl font-display leading-none">st.</span>
            <div className="leading-tight">
              <p className="font-black text-sm tracking-widest uppercase font-display">Student Tribe</p>
              <p className="font-bold text-[11px] tracking-wider uppercase">Official Participant Pass</p>
            </div>
          </div>
          <h1 className="font-black text-3xl font-display mt-4">{EVENT.name}</h1>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#FFE600] uppercase">Participant</span>
            <h2 className="text-2xl font-black text-white font-display break-words">{profile.full_name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono font-bold text-[#00FFD1] text-sm">{profile.student_id}</span>
              <button onClick={handleCopy} className="text-[11px] text-white/50 hover:text-white underline">
                {copied ? 'Copied' : 'Copy ID'}
              </button>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
            {details.map((d) => (
              <div key={d.label} className={d.label === 'Venue' || d.label === 'Branch' || d.label === 'Roll Number' ? 'col-span-2' : ''}>
                <dt className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{d.label}</dt>
                <dd className="text-sm font-bold text-white mt-0.5">{d.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Tear line */}
        <div className="relative">
          <div className="border-t-2 border-dashed border-white/20 mx-6" />
          <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[#111418]" />
          <span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-[#111418]" />
        </div>

        <div className="p-6 flex flex-col items-center gap-3">
          <div className="p-3 bg-white rounded-2xl">
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt={`QR code for ${profile.student_id}`} className="w-56 h-56 sm:w-64 sm:h-64" />
            ) : (
              <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center text-black/40 text-xs">Generating QR…</div>
            )}
          </div>
          <p className="text-[#FFE600] font-black text-xs tracking-widest uppercase font-display">Scan at the entry gate</p>
          <p className="text-white/40 text-[11px] text-center">Non-transferable. Carry your college ID.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDownload}
          disabled={!qrUrl || downloading}
          className="px-4 py-3 bg-[#FFE600] text-black rounded-xl text-xs font-black font-display uppercase tracking-wider disabled:opacity-50"
        >
          {downloading ? 'Preparing…' : 'Download Pass'}
        </button>
        <Link
          href="/dashboard/event"
          className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-bold font-display uppercase tracking-wider text-center"
        >
          Event Guide
        </Link>
      </div>

      {profile.assigned_round ? (
        <p className="text-center text-white/50 text-xs">
          Your Playground round: <strong className="text-[#FFE600]">#{profile.assigned_round} {ROUND_NAMES[profile.assigned_round]}</strong>
        </p>
      ) : null}
    </div>
  )
}

export default function EventPassPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-white/50 font-display">Loading your pass…</div>}>
      <EventPassContent />
    </Suspense>
  )
}
