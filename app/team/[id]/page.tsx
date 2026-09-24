'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { TRIBE_TEAM_MEMBERS } from '@/lib/teamData'
import Icon from '@/components/icons/Icon'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function IndividualTeamMemberPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const idOrSlug = decodeURIComponent(resolvedParams.id).toLowerCase()

  const memberIndex = TRIBE_TEAM_MEMBERS.findIndex(
    (m) => m.id.toLowerCase() === idOrSlug || m.slug?.toLowerCase() === idOrSlug
  )

  if (memberIndex === -1) {
    notFound()
  }

  const member = TRIBE_TEAM_MEMBERS[memberIndex]
  const prevMember = memberIndex > 0 ? TRIBE_TEAM_MEMBERS[memberIndex - 1] : TRIBE_TEAM_MEMBERS[TRIBE_TEAM_MEMBERS.length - 1]
  const nextMember = memberIndex < TRIBE_TEAM_MEMBERS.length - 1 ? TRIBE_TEAM_MEMBERS[memberIndex + 1] : TRIBE_TEAM_MEMBERS[0]

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [profileUrl, setProfileUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    setFlipped(false)
  }, [member.id])

  useEffect(() => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/team/${member.id}` : `https://tribeverse.in/team/${member.id}`
    setProfileUrl(url)

    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    }).then((dataUrl) => {
      setQrCodeDataUrl(dataUrl)
    }).catch(console.error)
  }, [member])

  function handleCopy() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  function handleDownloadQR() {
    if (!qrCodeDataUrl) return
    const link = document.createElement('a')
    link.href = qrCodeDataUrl
    link.download = `StudentTribe-QR-${member.name.replace(/\s+/g, '_')}.png`
    link.click()
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white selection:bg-[#FFE600] selection:text-black">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-[#FFE600]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-[#FF2D87]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#1A6FFF]/10 rounded-full blur-[140px]" />
      </div>

      {/* Header Navigation */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-8 flex items-center justify-between border-b border-white/10">
        <Link href="/" className="inline-flex items-baseline gap-2 group">
          <span className="font-black text-3xl text-[#FFE600] tracking-tight group-hover:scale-105 transition-transform" style={{ fontFamily: 'Outfit, sans-serif' }}>st.</span>
          <span className="font-bold text-xs tracking-widest text-white/70 uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>STUDENT TRIBE</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <Link
            href="/team"
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all flex items-center gap-1.5"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <span>←</span>
            <span>All Ambassadors</span>
          </Link>

          <Link
            href="/register"
            className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-[#FFE600] hover:bg-[#FFE600]/90 text-black shadow-lg transition-all"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Register Pass →
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 space-y-10">
        
        {/* Top Breadcrumb & Next/Prev Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
            <Link href="/team" className="hover:text-white">Tribeverse Squad</Link>
            <span>/</span>
            <span className="text-[#FFE600] font-bold">{member.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/team/${prevMember.id}`}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/70 hover:text-white transition-all"
              title={`Previous: ${prevMember.name}`}
            >
              ← Prev
            </Link>
            <Link
              href={`/team/${nextMember.id}`}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/70 hover:text-white transition-all"
              title={`Next: ${nextMember.name}`}
            >
              Next →
            </Link>
          </div>
        </div>

        {/* ── 2 COLUMN PROFILE & QR SHOWCASE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Official ID Card View (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center animate-card-in">
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden bg-[#11141D] border-2 border-[#FFE600] shadow-[0_0_50px_rgba(255,230,0,0.25)] p-2 [perspective:1400px]">
              <div
                className="relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.4,0.2,0.2,1)] [transform-style:preserve-3d]"
                style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              >
                {/* Front */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden [backface-visibility:hidden]">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-full h-full object-cover object-top shadow-xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-6xl font-black text-[#FFE600]">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Back */}
                {member.backAvatarUrl && (
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden [backface-visibility:hidden]"
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    <img
                      src={member.backAvatarUrl}
                      alt={`${member.name} — ID back`}
                      className="w-full h-full object-cover object-top shadow-xl"
                    />
                  </div>
                )}
              </div>
            </div>

            {member.backAvatarUrl && (
              <button
                onClick={() => setFlipped((f) => !f)}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white/5 hover:bg-[#FFE600] hover:text-black border border-white/10 text-white/80 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Icon name="refresh" />
                <span>{flipped ? 'Show Front' : 'Flip to Back'}</span>
              </button>
            )}

            <p className="text-[11px] text-white/40 font-mono mt-3 text-center">
              Official Student Tribe Verified Credential
            </p>
          </div>

          {/* Right: Ambassador Details & Individual QR Code (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Badge & Name */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFE600]/15 border border-[#FFE600]/30 text-[#FFE600] rounded-full text-xs font-black uppercase tracking-widest font-display">
                  <Icon name="sparkle" /> {member.role}
                </span>
                {member.category && (
                  <span className="px-2.5 py-1 bg-[#FF2D87]/20 border border-[#FF2D87]/40 text-[#FF2D87] rounded-full text-[10px] font-black uppercase">
                    {member.category} SQUAD
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
                {member.name}
              </h1>

              <div className="flex items-center gap-2 text-sm text-[#00FFD1] font-bold font-display">
                <Icon name="graduation-cap" />
                <span>{member.branch}</span>
              </div>
            </div>

            {/* Bio Card */}
            <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFE600] block font-display">
                Ambassador Profile & Experience
              </span>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                {member.experience}
              </p>
            </div>

            {/* ── INDIVIDUAL QR CODE BOX ── */}
            <div className="p-6 bg-gradient-to-br from-[#151922] to-[#0E1116] border-2 border-[#FFE600]/40 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-black text-[#FFE600] uppercase tracking-widest block">
                    INDIVIDUAL SCANNABLE QR CODE
                  </span>
                  <h3 className="text-base font-black text-white font-display mt-0.5">
                    Scan to Open {member.name}&apos;s Official Profile
                  </h3>
                </div>
                <Icon name="phone" className="w-6 h-6 text-[#FFE600]" />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                {/* QR Code Canvas/Image */}
                <div className="p-3 bg-white rounded-2xl shadow-xl flex-shrink-0 flex items-center justify-center">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt={`QR Code for ${member.name}`}
                      className="w-32 h-32 object-contain"
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center text-xs text-black font-mono">
                      Generating QR…
                    </div>
                  )}
                </div>

                {/* QR Actions */}
                <div className="space-y-3 w-full sm:w-auto flex-1">
                  <div className="p-2.5 bg-black/40 border border-white/10 rounded-xl">
                    <span className="text-[10px] text-white/40 block font-mono">Profile Link</span>
                    <p className="text-xs font-mono text-[#FFE600] truncate font-bold">
                      {profileUrl || `/team/${member.id}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex-1 py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Icon name="check" /> : <Icon name="clipboard" />}
                      <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                    </button>

                    <button
                      onClick={handleDownloadQR}
                      className="flex-1 py-2.5 px-4 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black rounded-xl text-xs font-black font-display uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Icon name="download" />
                      <span>Download QR</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Social & Contact Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              {member.linkedinUrl && (
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#0077B5]/25 hover:bg-[#0077B5] border border-[#0077B5]/50 text-white text-xs font-bold font-display transition-all hover:scale-105 shadow-md"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span>Connect on LinkedIn</span>
                </a>
              )}

              {member.instagramUrl && (
                <a
                  href={member.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#E1306C]/25 hover:bg-[#E1306C] border border-[#E1306C]/50 text-white text-xs font-bold font-display transition-all hover:scale-105 shadow-md"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-xs text-white/40">
        Student Tribe Presents TRIBEVERSE V1 · Empowering Students Across India
      </footer>

    </div>
  )
}
