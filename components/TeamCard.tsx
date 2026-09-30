'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
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
  const [popupFlipped, setPopupFlipped] = useState(false)

  const profilePath = `/team/${member.id}`
  const hasBack = !!member.backAvatarUrl && !backImageError

  function handleOpenModal(e: React.MouseEvent) {
    e.stopPropagation()
    setPopupFlipped(false)
    setModalOpen(true)
  }

  // Lock background scroll and listen for Escape key when popup is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setModalOpen(false)
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [modalOpen])

  return (
    <>
      {/* Responsive Grid Card Item */}
      <div
        onClick={handleOpenModal}
        className="group relative w-full max-w-sm mx-auto aspect-[1060/1484] rounded-3xl overflow-hidden bg-[#10141D] border border-white/10 hover:border-[#FFE600] transition-all duration-500 shadow-xl hover:shadow-[0_0_40px_rgba(255,230,0,0.3)] flex flex-col justify-end animate-card-in cursor-pointer select-none"
        style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
        title="Tap to view full ID card"
      >
        {/* Background ID Card Image */}
        <div className="absolute inset-0 w-full h-full bg-[#151A26] overflow-hidden">
          <div className="relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.4,0.2,0.2,1)] group-hover:scale-105">
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

          {/* Subtle Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/70 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Main Details (Bottom Overlay) */}
        <div className="relative z-10 p-3 sm:p-6 transform transition-transform duration-500 group-hover:-translate-y-1 bg-gradient-to-t from-black via-black/90 to-transparent pt-8">
          
          {/* Branch Tag */}
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#00FFD1]/15 border border-[#00FFD1]/30 text-[11px] font-bold text-[#00FFD1] mb-1.5 font-display max-w-full">
            <Icon name="graduation-cap" />
            <span className="truncate">{member.branch}</span>
          </div>

          {/* Member Name & Role */}
          <h3 className="text-sm sm:text-xl font-black text-white font-display tracking-tight group-hover:text-[#FFE600] transition-colors line-clamp-1">
            {member.name}
          </h3>
          <p className="text-xs font-semibold text-white/75 mt-0.5 line-clamp-1">
            {member.role}
          </p>

          {/* ── EXPANDED HOVER / TAP ACTIONS ── */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-all duration-500 overflow-hidden mt-2.5 pt-2.5 border-t border-white/15 space-y-2.5"
          >
            {/* View Profile Button */}
            <Link
              href={profilePath}
              className="w-full h-9 whitespace-nowrap px-3 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black font-black text-xs uppercase tracking-wider rounded-xl font-display text-center transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Profile</span>
              <span>→</span>
            </Link>

            {/* Social Profiles (LinkedIn & Instagram) */}
            <div className="flex items-center gap-2">
              {member.linkedinUrl ? (
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 basis-0 min-w-0 h-9 whitespace-nowrap flex items-center justify-center gap-1.5 px-2 rounded-xl bg-[#0077B5]/25 hover:bg-[#0077B5] border border-[#0077B5]/50 text-white text-xs font-bold font-display transition-all hover:scale-105 shadow-md cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span className="hidden sm:inline">LinkedIn</span>
                </a>
              ) : null}

              {member.instagramUrl ? (
                <a
                  href={member.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 basis-0 min-w-0 h-9 whitespace-nowrap flex items-center justify-center gap-1.5 px-2 rounded-xl bg-[#E1306C]/25 hover:bg-[#E1306C] border border-[#E1306C]/50 text-white text-xs font-bold font-display transition-all hover:scale-105 shadow-md cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="hidden sm:inline">Instagram</span>
                </a>
              ) : null}
            </div>
          </div>

        </div>
      </div>

      {/* ── RESPONSIVE FULL BORDERLESS 3D ID CARD POPUP ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setModalOpen(false)}
        >
          {/* Floating Close Button */}
          <button
            onClick={() => setModalOpen(false)}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-[#FFE600] hover:text-black text-white flex items-center justify-center text-lg font-bold transition-all shadow-2xl cursor-pointer z-50 border border-white/20"
            title="Close (Esc)"
          >
            <Icon name="close" />
          </button>

          {/* Pure 3D Flippable ID Card Picture Container */}
          <div
            onClick={(e) => {
              e.stopPropagation()
              if (hasBack) {
                setPopupFlipped((f) => !f)
              }
            }}
            className="relative w-full max-w-[320px] sm:max-w-[360px] md:max-w-[400px] aspect-[3/4.4] max-h-[76vh] cursor-pointer select-none [perspective:1400px] my-auto"
            title={hasBack ? (popupFlipped ? "Click to flip Front" : "Click to flip Back") : undefined}
          >
            <div
              className="relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.4,0.2,0.2,1)] [transform-style:preserve-3d]"
              style={{ transform: popupFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              {/* Front Side Picture */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] flex items-center justify-center">
                {!imageError && member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={`${member.name} Front ID`}
                    className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] select-none"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#1E2433] rounded-3xl text-6xl font-black text-[#FFE600]">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Back Side Picture */}
              <div
                className="absolute inset-0 w-full h-full [backface-visibility:hidden] flex items-center justify-center"
                style={{ transform: 'rotateY(180deg)' }}
              >
                {hasBack ? (
                  <img
                    src={member.backAvatarUrl!}
                    alt={`${member.name} Back ID`}
                    className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] select-none"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#1E2433] rounded-3xl text-white/40 text-sm font-mono">
                    No back side
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Minimal Flip Indicator & Direct Action */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-4 flex flex-wrap items-center justify-center gap-3 z-10"
          >
            {hasBack && (
              <button
                onClick={() => setPopupFlipped((f) => !f)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-[#FFE600] text-white hover:text-black text-xs font-mono font-bold transition-all cursor-pointer shadow-lg flex items-center gap-1.5 border border-white/15"
              >
                <span>↻</span>
                <span>{popupFlipped ? "Back Side · Click to see Front" : "Front Side · Click to see Back"}</span>
              </button>
            )}

            <Link
              href={profilePath}
              className="px-4 py-2 rounded-full bg-[#FFE600] hover:bg-[#FFE600]/90 text-black text-xs font-bold font-display uppercase tracking-wider transition-all shadow-lg flex items-center gap-1 cursor-pointer"
            >
              <span>View Profile</span>
              <span>→</span>
            </Link>
          </div>

        </div>
      )}
    </>
  )
}
