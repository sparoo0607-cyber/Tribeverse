'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import QRCode from 'qrcode'
import { TeamMemberCard } from '@/lib/types'
import Icon from '@/components/icons/Icon'

interface TeamBadgeModalProps {
  member: TeamMemberCard
  isOpen: boolean
  onClose: () => void
}

type BadgeFormat = 'story' | 'square' | 'pass'

export default function TeamBadgeModal({ member, isOpen, onClose }: TeamBadgeModalProps) {
  const [format, setFormat] = useState<BadgeFormat>('story')
  const [generating, setGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [copiedCaption, setCopiedCaption] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/team/${member.id}`
    : `https://tribeverse.in/team/${member.id}`

  const shareCaption = `🔥 Proud to be part of the STUDENT TRIBE squad as ${member.role}! Check out my official Tribeverse Ambassador Pass & connect with me: ${profileUrl} \n\n#StudentTribe #Tribeverse #CampusAmbassador #Tribeverse2026`

  const renderBadge = useCallback(async () => {
    if (!isOpen) return
    setGenerating(true)

    try {
      // 1. Determine canvas dimensions
      let width = 1080
      let height = 1920

      if (format === 'square') {
        width = 1080
        height = 1080
      } else if (format === 'pass') {
        width = 900
        height = 1200
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Helper function to load image safely
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => resolve(img)
          img.onerror = () => reject(new Error(`Failed to load ${src}`))
          img.src = src
        })
      }

      // Generate QR Code data URL
      const qrDataUrl = await QRCode.toDataURL(profileUrl, {
        width: 360,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
      const qrImg = await loadImage(qrDataUrl)

      // Try loading member avatar
      let avatarImg: HTMLImageElement | null = null
      if (member.avatarUrl) {
        try {
          avatarImg = await loadImage(member.avatarUrl)
        } catch (err) {
          console.warn('Could not load avatar for canvas badge:', err)
        }
      }

      // ── BACKGROUND GRADIENTS & GLOWS ──
      const bgGrad = ctx.createLinearGradient(0, 0, width, height)
      bgGrad.addColorStop(0, '#06080E')
      bgGrad.addColorStop(0.5, '#0B101A')
      bgGrad.addColorStop(1, '#05070B')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // Cyber Grid Pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
      ctx.lineWidth = 1
      const gridSize = 40
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Neon Radial Flares
      const addGlow = (cx: number, cy: number, r: number, color: string) => {
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        glow.addColorStop(0, color)
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
      }

      addGlow(width * 0.2, height * 0.15, width * 0.4, 'rgba(255, 230, 0, 0.12)')
      addGlow(width * 0.85, height * 0.45, width * 0.35, 'rgba(255, 45, 135, 0.1)')
      addGlow(width * 0.15, height * 0.85, width * 0.4, 'rgba(0, 255, 209, 0.12)')

      // Outer Cyber Border Frame
      ctx.strokeStyle = 'rgba(255, 230, 0, 0.4)'
      ctx.lineWidth = 4
      ctx.strokeRect(30, 30, width - 60, height - 60)

      // Inner Corner Accents
      const cornerSize = 25
      ctx.strokeStyle = '#FFE600'
      ctx.lineWidth = 6
      // Top Left
      ctx.beginPath()
      ctx.moveTo(25, 25 + cornerSize)
      ctx.lineTo(25, 25)
      ctx.lineTo(25 + cornerSize, 25)
      ctx.stroke()
      // Top Right
      ctx.beginPath()
      ctx.moveTo(width - 25 - cornerSize, 25)
      ctx.lineTo(width - 25, 25)
      ctx.lineTo(width - 25, 25 + cornerSize)
      ctx.stroke()
      // Bottom Left
      ctx.beginPath()
      ctx.moveTo(25, height - 25 - cornerSize)
      ctx.lineTo(25, height - 25)
      ctx.lineTo(25 + cornerSize, height - 25)
      ctx.stroke()
      // Bottom Right
      ctx.beginPath()
      ctx.moveTo(width - 25 - cornerSize, height - 25)
      ctx.lineTo(width - 25, height - 25)
      ctx.lineTo(width - 25, height - 25 - cornerSize)
      ctx.stroke()

      // ── FORMAT-SPECIFIC LAYOUTS ──
      if (format === 'story') {
        // ── 9:16 INSTAGRAM / WHATSAPP STORY (1080 x 1920) ──

        // 1. Top Branding Header
        ctx.textAlign = 'center'
        ctx.fillStyle = '#FFE600'
        ctx.font = '900 32px Outfit, sans-serif'
        ctx.fillText('STUDENT TRIBE PRESENTS', width / 2, 105)

        ctx.fillStyle = '#FFFFFF'
        ctx.font = '900 68px Outfit, sans-serif'
        ctx.fillText('TRIBEVERSE 2026', width / 2, 175)

        // Pill Tag: "OFFICIAL AMBASSADOR PASS"
        const tagText = 'OFFICIAL VERIFIED AMBASSADOR'
        ctx.font = '800 20px Outfit, sans-serif'
        const tagWidth = ctx.measureText(tagText).width + 40
        ctx.fillStyle = 'rgba(255, 230, 0, 0.15)'
        ctx.strokeStyle = 'rgba(255, 230, 0, 0.5)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(width / 2 - tagWidth / 2, 205, tagWidth, 38, 19)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = '#FFE600'
        ctx.fillText(tagText, width / 2, 231)

        // 2. Center Card Frame (Ambassador ID Photo)
        const cardW = 680
        const cardH = 880
        const cardX = (width - cardW) / 2
        const cardY = 275

        // Card Drop Shadow & Border
        ctx.save()
        ctx.shadowColor = 'rgba(255, 230, 0, 0.35)'
        ctx.shadowBlur = 35
        ctx.fillStyle = '#10141F'
        ctx.strokeStyle = '#FFE600'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.roundRect(cardX, cardY, cardW, cardH, 28)
        ctx.fill()
        ctx.stroke()
        ctx.restore()

        // Draw Avatar inside Card Frame
        if (avatarImg) {
          ctx.save()
          ctx.beginPath()
          ctx.roundRect(cardX + 6, cardY + 6, cardW - 12, cardH - 12, 24)
          ctx.clip()
          ctx.drawImage(avatarImg, cardX + 6, cardY + 6, cardW - 12, cardH - 12)
          ctx.restore()
        } else {
          ctx.fillStyle = '#FFE600'
          ctx.font = '900 160px Outfit, sans-serif'
          ctx.fillText(member.name.charAt(0), width / 2, cardY + cardH / 2 + 50)
        }

        // Overlay Badge on Card (ST-CA Badge)
        const badgeLabel = member.teamIdBadge || 'ST-CA'
        ctx.font = '800 20px Outfit, sans-serif'
        const badgeW = ctx.measureText(badgeLabel).width + 36
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
        ctx.strokeStyle = '#FFE600'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(cardX + 24, cardY + 24, badgeW, 36, 18)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = '#FFE600'
        ctx.fillText(badgeLabel, cardX + 24 + badgeW / 2, cardY + 49)

        // 3. Ambassador Details (Below Photo)
        const detailsY = cardY + cardH + 65

        // Name
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '900 48px Outfit, sans-serif'
        const cleanName = member.name.toUpperCase()
        ctx.fillText(cleanName, width / 2, detailsY)

        // Role & Squad
        ctx.fillStyle = '#FFE600'
        ctx.font = '800 24px Outfit, sans-serif'
        ctx.fillText(member.role.toUpperCase(), width / 2, detailsY + 40)

        // Branch
        ctx.fillStyle = '#00FFD1'
        ctx.font = '700 22px Outfit, sans-serif'
        ctx.fillText(member.branch, width / 2, detailsY + 76)

        // 4. Bottom QR & Scan Box
        const qrBoxW = 760
        const qrBoxH = 260
        const qrBoxX = (width - qrBoxW) / 2
        const qrBoxY = 1520

        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 24)
        ctx.fill()
        ctx.stroke()

        // QR Code
        const qrSize = 180
        const qrX = qrBoxX + 35
        const qrY = qrBoxY + (qrBoxH - qrSize) / 2
        ctx.save()
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 16)
        ctx.fill()
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
        ctx.restore()

        // QR Text Call to Action
        ctx.textAlign = 'left'
        ctx.fillStyle = '#FFE600'
        ctx.font = '900 22px Outfit, sans-serif'
        ctx.fillText('SCAN TO CONNECT WITH ME', qrBoxX + 245, qrBoxY + 75)

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
        ctx.font = '600 20px Outfit, sans-serif'
        ctx.fillText('View My Tribeverse Profile', qrBoxX + 245, qrBoxY + 115)
        ctx.fillText('& Official Verified Credentials', qrBoxX + 245, qrBoxY + 145)

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.font = '600 16px Outfit, sans-serif'
        ctx.fillText(`tribeverse.in/team/${member.id}`, qrBoxX + 245, qrBoxY + 195)

        // 5. Very Bottom Tag
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.font = '700 16px Outfit, sans-serif'
        ctx.fillText('STUDENT TRIBE · EMPOWERING STUDENTS ACROSS INDIA', width / 2, 1845)

      } else if (format === 'square') {
        // ── 1:1 SQUARE FEED POST (1080 x 1080) ──

        // Top Brand Header
        ctx.textAlign = 'left'
        ctx.fillStyle = '#FFE600'
        ctx.font = '900 24px Outfit, sans-serif'
        ctx.fillText('STUDENT TRIBE · TRIBEVERSE 2026', 70, 85)

        ctx.textAlign = 'right'
        ctx.fillStyle = '#00FFD1'
        ctx.font = '800 20px Outfit, sans-serif'
        ctx.fillText('VERIFIED AMBASSADOR', width - 70, 85)

        // Split Layout: Left Avatar Card, Right Details + QR
        const photoW = 440
        const photoH = 580
        const photoX = 70
        const photoY = 120

        ctx.save()
        ctx.shadowColor = 'rgba(255, 230, 0, 0.35)'
        ctx.shadowBlur = 30
        ctx.fillStyle = '#10141F'
        ctx.strokeStyle = '#FFE600'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.roundRect(photoX, photoY, photoW, photoH, 24)
        ctx.fill()
        ctx.stroke()
        ctx.restore()

        if (avatarImg) {
          ctx.save()
          ctx.beginPath()
          ctx.roundRect(photoX + 5, photoY + 5, photoW - 10, photoH - 10, 20)
          ctx.clip()
          ctx.drawImage(avatarImg, photoX + 5, photoY + 5, photoW - 10, photoH - 10)
          ctx.restore()
        }

        // Right Info Panel
        const rightX = 545
        ctx.textAlign = 'left'

        // Badge pill
        ctx.fillStyle = 'rgba(255, 230, 0, 0.15)'
        ctx.strokeStyle = '#FFE600'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.roundRect(rightX, 125, 150, 32, 16)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = '#FFE600'
        ctx.font = '800 16px Outfit, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(member.teamIdBadge || 'ST-CA', rightX + 75, 147)

        ctx.textAlign = 'left'
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '900 38px Outfit, sans-serif'
        ctx.fillText(member.name, rightX, 210)

        ctx.fillStyle = '#FFE600'
        ctx.font = '800 22px Outfit, sans-serif'
        ctx.fillText(member.role, rightX, 250)

        ctx.fillStyle = '#00FFD1'
        ctx.font = '700 18px Outfit, sans-serif'
        ctx.fillText(member.branch, rightX, 285)

        // QR Code Box on Right
        const qrBoxY = 320
        const qrSize = 160
        ctx.save()
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.roundRect(rightX, qrBoxY, qrSize + 20, qrSize + 20, 16)
        ctx.fill()
        ctx.drawImage(qrImg, rightX + 10, qrBoxY + 10, qrSize, qrSize)
        ctx.restore()

        ctx.fillStyle = '#FFFFFF'
        ctx.font = '800 18px Outfit, sans-serif'
        ctx.fillText('SCAN TO VIEW PROFILE', rightX + qrSize + 40, qrBoxY + 60)

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.font = '600 15px Outfit, sans-serif'
        ctx.fillText('Official Tribeverse Squad', rightX + qrSize + 40, qrBoxY + 90)
        ctx.fillText('Verified Badge 2026', rightX + qrSize + 40, qrBoxY + 115)

        // Bottom Banner Strip
        const bottomY = 740
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.roundRect(70, bottomY, width - 140, 240, 20)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = '#FFE600'
        ctx.font = '800 16px Outfit, sans-serif'
        ctx.fillText('CAMPUS AMBASSADOR BIO & IMPACT', 105, bottomY + 45)

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = '500 18px Outfit, sans-serif'
        // Wrap bio text
        const bioWords = member.experience.split(' ')
        let line = ''
        let curY = bottomY + 85
        for (let i = 0; i < bioWords.length; i++) {
          const testLine = line + bioWords[i] + ' '
          const testWidth = ctx.measureText(testLine).width
          if (testWidth > width - 210 && i > 0) {
            ctx.fillText(line, 105, curY)
            line = bioWords[i] + ' '
            curY += 28
            if (curY > bottomY + 190) break
          } else {
            line = testLine
          }
        }
        if (curY <= bottomY + 190) {
          ctx.fillText(line, 105, curY)
        }

        // Footer Tag
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
        ctx.font = '700 15px Outfit, sans-serif'
        ctx.fillText('STUDENT TRIBE · tribeverse.in', width / 2, 1030)

      } else if (format === 'pass') {
        // ── 3:4 VIP DIGITAL PASS (900 x 1200) ──

        // Top Pass Lanyard Slot
        ctx.fillStyle = '#FFE600'
        ctx.beginPath()
        ctx.roundRect(width / 2 - 60, 20, 120, 10, 5)
        ctx.fill()

        // Pass Header
        ctx.textAlign = 'center'
        ctx.fillStyle = '#FFE600'
        ctx.font = '900 24px Outfit, sans-serif'
        ctx.fillText('TRIBEVERSE VIP DELEGATE & AMBASSADOR', width / 2, 85)

        ctx.fillStyle = '#FFFFFF'
        ctx.font = '900 44px Outfit, sans-serif'
        ctx.fillText('STUDENT TRIBE 2026', width / 2, 135)

        // Photo / Avatar Frame
        const cardW = 460
        const cardH = 540
        const cardX = (width - cardW) / 2
        const cardY = 170

        ctx.save()
        ctx.shadowColor = 'rgba(255, 230, 0, 0.4)'
        ctx.shadowBlur = 30
        ctx.fillStyle = '#10141F'
        ctx.strokeStyle = '#FFE600'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.roundRect(cardX, cardY, cardW, cardH, 20)
        ctx.fill()
        ctx.stroke()
        ctx.restore()

        if (avatarImg) {
          ctx.save()
          ctx.beginPath()
          ctx.roundRect(cardX + 4, cardY + 4, cardW - 8, cardH - 8, 16)
          ctx.clip()
          ctx.drawImage(avatarImg, cardX + 4, cardY + 4, cardW - 8, cardH - 8)
          ctx.restore()
        }

        // Details Section
        const textY = 760
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '900 36px Outfit, sans-serif'
        ctx.fillText(member.name, width / 2, textY)

        ctx.fillStyle = '#FFE600'
        ctx.font = '800 20px Outfit, sans-serif'
        ctx.fillText(member.role.toUpperCase(), width / 2, textY + 34)

        ctx.fillStyle = '#00FFD1'
        ctx.font = '700 17px Outfit, sans-serif'
        ctx.fillText(member.branch, width / 2, textY + 62)

        // Security Hologram / Barcode Line
        ctx.strokeStyle = 'rgba(255, 230, 0, 0.4)'
        ctx.setLineDash([8, 8])
        ctx.beginPath()
        ctx.moveTo(80, 875)
        ctx.lineTo(width - 80, 875)
        ctx.stroke()
        ctx.setLineDash([])

        // Bottom QR Section
        const qrSize = 150
        const qrX = width / 2 - qrSize / 2
        const qrY = 905
        ctx.save()
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.roundRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12)
        ctx.fill()
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
        ctx.restore()

        ctx.fillStyle = '#FFE600'
        ctx.font = '900 16px Outfit, sans-serif'
        ctx.fillText('SCAN FOR DIGITAL CREDENTIALS', width / 2, 1105)

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.font = '600 13px Outfit, sans-serif'
        ctx.fillText(`${member.teamIdBadge} · tribeverse.in`, width / 2, 1135)
      }

      const dataUrl = canvas.toDataURL('image/png', 1.0)
      setPreviewUrl(dataUrl)
    } catch (err) {
      console.error('Error rendering ambassador badge:', err)
    } finally {
      setGenerating(false)
    }
  }, [isOpen, format, member, profileUrl])

  useEffect(() => {
    if (isOpen) {
      renderBadge()
    }
  }, [isOpen, format, renderBadge])

  // Download Image
  const handleDownload = () => {
    if (!previewUrl) return
    const link = document.createElement('a')
    link.href = previewUrl
    link.download = `StudentTribe-${member.name.replace(/\s+/g, '_')}-${format.toUpperCase()}.png`
    link.click()
  }

  // Native Web Share API (Mobile Support)
  const handleNativeShare = async () => {
    if (!previewUrl) return
    try {
      if (navigator.share) {
        // Convert dataUrl to blob/file if supported
        const res = await fetch(previewUrl)
        const blob = await res.blob()
        const file = new File([blob], `StudentTribe-Pass-${member.name}.png`, { type: 'image/png' })

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Student Tribe Ambassador Pass - ${member.name}`,
            text: shareCaption,
            files: [file],
          })
          setShareSuccess(true)
          setTimeout(() => setShareSuccess(false), 2500)
          return
        }

        // Fallback to url/text share
        await navigator.share({
          title: `Student Tribe Ambassador Pass - ${member.name}`,
          text: shareCaption,
          url: profileUrl,
        })
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 2500)
      } else {
        handleCopyLink()
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err)
      }
    }
  }

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🔥 Check out *${member.name}*'s official Student Tribe Ambassador Pass for *TRIBEVERSE 2026*! 🚀\n\nRole: ${member.role}\nConnect & View Profile: ${profileUrl}`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  // LinkedIn Share
  const handleLinkedInShare = () => {
    const url = encodeURIComponent(profileUrl)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
  }

  // Twitter / X Share
  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `Excited to share ${member.name}'s official Ambassador Pass for @StudentTribe Tribeverse 2026! 🚀 Connect here:`
    )
    const url = encodeURIComponent(profileUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  // Copy Caption
  const handleCopyCaption = () => {
    navigator.clipboard.writeText(shareCaption)
    setCopiedCaption(true)
    setTimeout(() => setCopiedCaption(false), 2500)
  }

  // Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl)
    setShareSuccess(true)
    setTimeout(() => setShareSuccess(false), 2500)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-[#0E121B] border-2 border-[#FFE600]/60 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(255,230,0,0.2)] p-4 sm:p-8 space-y-6 my-auto max-h-[92vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFE600]/20 border border-[#FFE600]/40 flex items-center justify-center text-[#FFE600]">
              <Icon name="sparkle" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase text-white font-display">
                Digital Pass & Social Badge
              </h2>
              <p className="text-xs text-white/50 font-mono">
                {member.name} · {member.teamIdBadge}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
            title="Close modal"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Modal Body: 2 Columns (Preview & Controls) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center overflow-y-auto pr-1">
          
          {/* Left Preview Column (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-3">
            {/* Format Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/5 border border-white/10 rounded-2xl w-full">
              <button
                onClick={() => setFormat('story')}
                className={`py-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all font-display cursor-pointer ${
                  format === 'story'
                    ? 'bg-[#FFE600] text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                📱 Story (9:16)
              </button>
              <button
                onClick={() => setFormat('square')}
                className={`py-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all font-display cursor-pointer ${
                  format === 'square'
                    ? 'bg-[#FFE600] text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                🔳 Square (1:1)
              </button>
              <button
                onClick={() => setFormat('pass')}
                className={`py-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all font-display cursor-pointer ${
                  format === 'pass'
                    ? 'bg-[#FFE600] text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                🎫 VIP Pass (3:4)
              </button>
            </div>

            {/* Canvas Badge Preview Container */}
            <div className="relative w-full flex items-center justify-center bg-black/50 border border-white/10 rounded-2xl p-2 min-h-[360px] max-h-[440px] overflow-hidden">
              {generating ? (
                <div className="flex flex-col items-center gap-2 text-white/50 text-xs font-mono">
                  <div className="w-8 h-8 border-2 border-[#FFE600] border-t-transparent rounded-full animate-spin" />
                  <span>Generating High-Res Badge…</span>
                </div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt={`Badge Preview for ${member.name}`}
                  className="max-h-[420px] w-auto object-contain rounded-xl shadow-2xl border border-white/10"
                />
              ) : (
                <span className="text-white/40 text-xs">Generating preview…</span>
              )}
            </div>
            
            <p className="text-[10px] text-white/40 font-mono text-center">
              Generated in real-time with embedded scannable profile QR code
            </p>
          </div>

          {/* Right Action Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Primary Download & Mobile Share Buttons */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFE600] block font-display">
                Download & Save Badge
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownload}
                  disabled={generating || !previewUrl}
                  className="py-3.5 px-5 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black font-black text-xs uppercase tracking-wider rounded-2xl font-display transition-all shadow-[0_0_25px_rgba(255,230,0,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
                >
                  <Icon name="download" />
                  <span>Download High-Res PNG</span>
                </button>

                <button
                  onClick={handleNativeShare}
                  disabled={generating || !previewUrl}
                  className="py-3.5 px-5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-2xl font-display transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                >
                  <Icon name="link" />
                  <span>{shareSuccess ? 'Shared / Link Copied!' : 'Instant Mobile Share'}</span>
                </button>
              </div>
            </div>

            {/* Quick Share to Social Networks */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00FFD1] block font-display">
                One-Click Social Share
              </span>

              <div className="grid grid-cols-3 gap-2.5">
                {/* WhatsApp */}
                <button
                  onClick={handleWhatsAppShare}
                  className="h-11 min-w-0 whitespace-nowrap px-2 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366] border border-[#25D366]/40 text-white text-xs font-bold font-display flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={handleLinkedInShare}
                  className="h-11 min-w-0 whitespace-nowrap px-2 rounded-xl bg-[#0077B5]/20 hover:bg-[#0077B5] border border-[#0077B5]/40 text-white text-xs font-bold font-display flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span>LinkedIn</span>
                </button>

                {/* X / Twitter */}
                <button
                  onClick={handleTwitterShare}
                  className="h-11 min-w-0 whitespace-nowrap px-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold font-display flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>X</span>
                </button>
              </div>
            </div>

            {/* Formatted Post Caption */}
            <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                  Instagram / LinkedIn Post Caption
                </span>
                <button
                  onClick={handleCopyCaption}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold text-[#FFE600] uppercase tracking-wider transition-all cursor-pointer"
                >
                  {copiedCaption ? 'Copied!' : 'Copy Caption'}
                </button>
              </div>
              <p className="text-xs text-white/80 font-mono leading-relaxed line-clamp-3 bg-white/[0.02] p-2 rounded-xl border border-white/5">
                {shareCaption}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
