'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { TeamMemberCard } from '@/lib/types'
import Icon from '@/components/icons/Icon'

interface TeamCardProps {
  member: TeamMemberCard
  index?: number
}

export default function TeamCard({ member, index = 0 }: TeamCardProps) {
  const [imageError, setImageError] = useState(false)
  const [backImageError, setBackImageError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [flipped, setFlipped] = useState(false)

  const profilePath = `/team/${member.id}`
  const hasBack = !!member.backAvatarUrl && !backImageError

  useEffect(() => {
    if (qrModalOpen && !qrCodeDataUrl) {
      const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${profilePath}` : `https://tribeverse.in${profilePath}`
      QRCode.toDataURL(fullUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      }).then(setQrCodeDataUrl).catch(console.error)
    }
  }, [qrModalOpen, qrCodeDataUrl, profilePath])

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${profilePath}` : `https://tribeverse.in${profilePath}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div
        className="group relative w-full h-[450px] rounded-3xl overflow-hidden bg-[#10141D] border border-white/10 hover:border-[#FFE600] transition-all duration-500 shadow-xl hover:shadow-[0_0_40px_rgba(255,230,0,0.3)] flex flex-col justify-end animate-card-in"
        style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
      >

        {/* Background ID Card Image — flips between front & back on click */}
        <div className="absolute inset-0 w-full h-full bg-[#151A26] overflow-hidden [perspective:1200px]">
          <div
            className="relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.4,0.2,0.2,1)] [transform-style:preserve-3d] group-hover:scale-105"
            style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            {/* Front Face */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center [backface-visibility:hidden]">
              {!imageError && member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover object-top filter brightness-95 group-hover:brightness-105 transition-[filter] duration-700"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1E2433] to-[#0D1017] text-white/40 p-6 text-center">
                  <span className="text-6xl font-black text-[#FFE600]/50 font-display">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Back Face */}
            <div
              className="absolute inset-0 w-full h-full flex items-center justify-center [backface-visibility:hidden]"
              style={{ transform: 'rotateY(180deg)' }}
            >
              {hasBack ? (
                <img
                  src={member.backAvatarUrl!}
                  alt={`${member.name} — ID back`}
                  onError={() => setBackImageError(true)}
                  className="w-full h-full object-cover object-top filter brightness-95 group-hover:brightness-105 transition-[filter] duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1E2433] to-[#0D1017] text-white/30 text-xs font-mono">
                  No back side
                </div>
              )}
            </div>
          </div>

          {/* Subtle Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/70 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Top Quick Action Icons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-end z-10">
          <div className="flex items-center gap-1.5">
            {/* Flip Card Button */}
            {hasBack && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setFlipped((f) => !f)
                }}
                className="p-1.5 bg-black/80 hover:bg-[#FFE600] hover:text-black text-white text-xs rounded-full backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md active:rotate-180 duration-300"
                title="Flip ID Card"
              >
                <Icon name="refresh" />
              </button>
            )}

            {/* Quick QR Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setQrModalOpen(true)
              }}
              className="p-1.5 bg-black/80 hover:bg-[#FFE600] hover:text-black text-white text-xs rounded-full backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md"
              title="View Individual QR Code"
            >
              <Icon name="phone" />
            </button>

            {/* Quick Zoom Card Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setModalOpen(true)
              }}
              className="px-2.5 py-1 bg-black/70 hover:bg-[#FFE600] hover:text-black text-white/80 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center gap-1"
              title="View Full ID Card"
            >
              <Icon name="search" />
              <span>Card</span>
            </button>
          </div>
        </div>

        {/* Main Details (Bottom Overlay) */}
        <div className="relative z-10 p-5 transform transition-transform duration-500 group-hover:-translate-y-1 bg-gradient-to-t from-black via-black/90 to-transparent pt-8">
          
          {/* Branch Tag */}
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#00FFD1]/15 border border-[#00FFD1]/30 text-[11px] font-bold text-[#00FFD1] mb-1.5 font-display">
            <Icon name="graduation-cap" />
            <span className="truncate max-w-[220px]">{member.branch}</span>
          </div>

          {/* Member Name & Role */}
          <h3 className="text-xl font-black text-white font-display tracking-tight group-hover:text-[#FFE600] transition-colors line-clamp-1">
            <Link href={profilePath} className="hover:underline">
              {member.name}
            </Link>
          </h3>
          <p className="text-xs font-semibold text-white/75 mt-0.5 line-clamp-1">
            {member.role}
          </p>

          {/* ── EXPANDED HOVER DETAILS (Reveal on Hover) ── */}
          <div className="max-h-0 opacity-0 group-hover:max-h-64 group-hover:opacity-100 transition-all duration-500 overflow-hidden mt-2.5 pt-2.5 border-t border-white/15 space-y-2.5">
            
            {/* Experience / Bio */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFE600] block mb-0.5 font-display">
                Campus Ambassador Bio
              </span>
              <p className="text-[11px] text-white/80 leading-snug line-clamp-2">
                {member.experience}
              </p>
            </div>

            {/* Individual Link & Actions Row */}
            <div className="flex items-center gap-2">
              <Link
                href={profilePath}
                className="flex-1 py-1.5 px-2.5 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black font-black text-[11px] uppercase tracking-wider rounded-xl font-display text-center transition-all shadow-md flex items-center justify-center gap-1"
              >
                <span>Individual Link</span>
                <span>→</span>
              </Link>

              <button
                onClick={handleCopy}
                className="py-1.5 px-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-[11px] font-bold font-display uppercase tracking-wider transition-all cursor-pointer"
                title="Copy Individual Profile Link"
              >
                {copied ? (
                  <span className="inline-flex items-center gap-1"><Icon name="check" /> Copied</span>
                ) : (
                  <span className="inline-flex items-center gap-1"><Icon name="link" /> Link</span>
                )}
              </button>
            </div>

            {/* Social Profiles (LinkedIn & Instagram) */}
            <div className="flex items-center gap-2 pt-0.5">
              {member.linkedinUrl ? (
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-[#0077B5]/25 hover:bg-[#0077B5] border border-[#0077B5]/50 text-white text-xs font-bold font-display transition-all hover:scale-105 shadow-md cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>
              ) : null}

              {member.instagramUrl ? (
                <a
                  href={member.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-[#E1306C]/25 hover:bg-[#E1306C] border border-[#E1306C]/50 text-white text-xs font-bold font-display transition-all hover:scale-105 shadow-md cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
              ) : null}
            </div>

          </div>

        </div>

      </div>

      {/* ── FULL HIGH-RESOLUTION ID CARD MODAL ── */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="relative max-w-sm w-full bg-[#121620] border-2 border-[#FFE600] rounded-3xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <span className="font-mono text-xs font-bold text-[#FFE600]">
                {member.name}
              </span>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="p-2 max-h-[80vh] overflow-y-auto flex flex-col items-center justify-center gap-3">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-full rounded-2xl object-contain shadow-lg"
                />
              ) : null}
              {hasBack && (
                <img
                  src={member.backAvatarUrl!}
                  alt={`${member.name} — ID back`}
                  className="w-full rounded-2xl object-contain shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── INDIVIDUAL QR CODE POPUP MODAL ── */}
      {qrModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setQrModalOpen(false)}
        >
          <div 
            className="relative max-w-xs w-full bg-[#121620] border-2 border-[#FFE600] rounded-3xl overflow-hidden shadow-2xl p-6 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-mono text-xs font-black text-[#FFE600] uppercase inline-flex items-center gap-1.5">
                <Icon name="phone" /> Individual QR Code
              </span>
              <button
                onClick={() => setQrModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="p-3 bg-white rounded-2xl mx-auto inline-block shadow-xl">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt={`QR Code for ${member.name}`} className="w-44 h-44 object-contain" />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-black text-xs font-mono">Generating QR…</div>
              )}
            </div>

            <div>
              <h4 className="text-base font-black text-white font-display">{member.name}</h4>
              <p className="text-xs text-[#00FFD1] font-bold mt-0.5">{member.role}</p>
            </div>

            <div className="flex gap-2 pt-1">
              <Link
                href={profilePath}
                className="flex-1 py-2.5 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black font-black text-xs uppercase tracking-wider rounded-xl font-display"
              >
                Open Page →
              </Link>
              <button
                onClick={handleCopy}
                className="py-2.5 px-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-bold font-display uppercase tracking-wider"
              >
                {copied ? <Icon name="check" /> : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
