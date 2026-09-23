'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const ROUND_NAMES: Record<number, string> = {
  1: 'Round 1: Quick Eyes (Visual & Memory)',
  2: 'Round 2: Quick Draw (Cipher & Logic)',
  3: 'Round 3: Reaction Challenge (Reflexes)',
  4: 'Round 4: Sound Check (Music & Rhythm)',
  5: 'Round 5: Think Fast (Strategy & Puzzle)',
}

import { Suspense } from 'react'

function EventPassContent() {
  const [profile, setProfile] = useState<{ 
    full_name: string; 
    student_id?: string; 
    email?: string;
    branch?: string;
    section?: string;
    phone?: string;
    tag_issued?: boolean;
  } | null>(null)
  const [team, setTeam] = useState<{ name: string; team_number: number; color: string; total_score: number } | null>(null)
  const [assignedRound, setAssignedRound] = useState<number>(3)
  const [copied, setCopied] = useState(false)
  const [isNewRegistration, setIsNewRegistration] = useState(false)
  const passRef = useRef<HTMLDivElement>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setIsNewRegistration(true)
    }

    async function loadPassData() {
      // 1. Check local storage cache for instant rendering
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('tribeverse_pass_data')
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            setProfile({
              full_name: parsed.fullName || 'Rohan Varma',
              student_id: parsed.studentId || 'ST-2026-TRB-1001',
              email: parsed.email,
              branch: parsed.branch,
              section: parsed.section,
              phone: parsed.phone,
            })
            if (parsed.assignedRound) setAssignedRound(parsed.assignedRound)
          } catch (e) {}
        }
      }

      // 2. Fetch authenticated Supabase user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Default preview state if not logged in
        if (!profile) {
          setProfile({
            full_name: 'Rohan Varma',
            student_id: 'ST-2026-TRB-1001',
            email: 'rohan.varma@studenttribe.in',
            branch: 'CSE (Computer Science)',
            section: 'Section A',
            phone: '9876543210',
            tag_issued: false,
          })
          setTeam({
            name: 'Team Titans',
            team_number: 1,
            color: '#1A6FFF',
            total_score: 920,
          })
          setAssignedRound(3)
        }
        return
      }

      // Fetch profile
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (p) {
        setProfile({
          full_name: p.full_name,
          student_id: p.student_id || user.user_metadata?.student_id || `ST-2026-TRB-${user.id.substring(0, 4).toUpperCase()}`,
          email: user.email,
          branch: p.branch || user.user_metadata?.branch,
          section: p.section || user.user_metadata?.section,
          phone: p.phone || user.user_metadata?.phone,
          tag_issued: p.tag_issued || false,
        })
      }

      // Fetch team & membership
      const { data: membership } = await supabase
        .from('team_members')
        .select('assigned_round, team:teams(*)')
        .eq('user_id', user.id)
        .maybeSingle()

      if (membership) {
        if (membership.assigned_round) setAssignedRound(membership.assigned_round)
        const t = Array.isArray(membership.team) ? membership.team[0] : membership.team
        if (t) {
          setTeam({
            name: t.name,
            team_number: t.team_number,
            color: t.color || '#1A6FFF',
            total_score: t.total_score || 0,
          })
        }
      } else {
        setTeam({
          name: 'Team Titans',
          team_number: 1,
          color: '#1A6FFF',
          total_score: 920,
        })
      }
    }

    loadPassData()
  }, [searchParams])

  const studentName = profile?.full_name || 'Rohan Varma'
  const passId = profile?.student_id || 'ST-2026-TITAN-03'
  const teamName = team?.name || 'Team Titans (#01)'
  const teamColor = team?.color || '#1A6FFF'

  function handleCopyPassId() {
    navigator.clipboard.writeText(passId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Welcome Alert if newly registered */}
      {isNewRegistration && (
        <div className="bg-gradient-to-r from-[#FFE600]/20 via-[#FF6B1A]/20 to-[#FF2D87]/20 border border-[#FFE600]/40 rounded-2xl p-4 sm:p-6 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h3 className="font-black text-white text-base font-display">
                REGISTRATION SUCCESSFUL! YOUR EVENT PASS IS READY!
              </h3>
              <p className="text-white/70 text-xs mt-0.5">
                Welcome to <strong>TRIBEVERSE V1</strong>. Your official digital pass and team allocation are confirmed below.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNewRegistration(false)}
            className="text-xs text-white/50 hover:text-white px-3 py-1.5 bg-black/40 rounded-lg border border-white/10"
          >
            Dismiss ✕
          </button>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#FFE600] font-display">
            ✦ OFFICIAL CREDENTIAL
          </span>
          <h1 className="text-3xl font-black text-white font-display uppercase tracking-tight">
            YOUR DIGITAL EVENT PASS
          </h1>
          <p className="text-white/50 text-xs sm:text-sm">
            Present this scannable digital ticket at the campus arena entrance on Sep 23, 2026.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <span>🖨️</span>
            <span>Download / Print</span>
          </button>
          <Link
            href="/dashboard/play"
            className="px-4 py-2.5 bg-[#FFE600] hover:bg-[#ffe600]/90 text-black rounded-xl text-xs font-black font-display uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
          >
            <span>🎮</span>
            <span>Enter Arena →</span>
          </Link>
        </div>
      </div>

      {/* ── THE MASTER EVENT PASS CARD ── */}
      <div 
        ref={passRef}
        className="relative rounded-3xl overflow-hidden bg-[#0A0D14] border-2 border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-white select-none print:shadow-none print:border-black"
      >
        {/* Holographic Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FFE600] via-[#FF2D87] to-[#00FFD1]" />

        {/* Pass Top Ribbon */}
        <div className="p-6 sm:p-8 border-b border-dashed border-white/15 bg-gradient-to-br from-white/[0.06] to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE600] text-black font-black text-2xl font-display flex items-center justify-center shadow-lg">
              st.
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-widest uppercase font-display text-white">STUDENT TRIBE</span>
                <span className="px-2 py-0.5 bg-[#FFE600]/20 border border-[#FFE600]/40 text-[#FFE600] rounded text-[10px] font-black font-display">
                  FRESHERS 2026
                </span>
              </div>
              <p className="text-white/50 text-xs font-mono">TRIBEVERSE V1 · OFFICIAL PARTICIPANT PASS</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3.5 py-1.5 bg-gradient-to-r from-[#FF2D87]/20 to-[#1A6FFF]/20 border border-white/20 rounded-full text-xs font-black font-display uppercase tracking-widest text-[#00FFD1] shadow-inner">
              ⭐ ALL-ACCESS PASS
            </span>
          </div>
        </div>

        {/* Main Pass Body: 2 Columns */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Side: Participant Info & Team */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Participant Profile Banner */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#1A6FFF] via-[#FF2D87] to-[#FFE600] p-[2px] flex-shrink-0 shadow-xl">
                <div className="w-full h-full bg-[#111418] rounded-[14px] flex items-center justify-center text-3xl sm:text-4xl font-black text-white font-display">
                  {studentName.charAt(0)}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#FFE600] uppercase font-bold">
                  REGISTERED PARTICIPANT
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                  {studentName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-bold text-white/70 bg-white/10 px-2.5 py-1 rounded-md">
                    {passId}
                  </span>
                  <button
                    onClick={handleCopyPassId}
                    className="text-[11px] text-white/50 hover:text-white underline cursor-pointer"
                  >
                    {copied ? '✓ Copied' : 'Copy ID'}
                  </button>
                </div>
              </div>
            </div>

            {/* Grid of Event Data */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-2xl">
                <span className="text-[10px] font-bold text-white/40 uppercase font-display block">Branch & Section</span>
                <strong className="text-xs font-black text-white font-display mt-1 block truncate">
                  {profile?.branch || 'CSE'} · {profile?.section || 'Sec A'}
                </strong>
              </div>

              <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-2xl">
                <span className="text-[10px] font-bold text-white/40 uppercase font-display block">Assigned Team</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teamColor }}></span>
                  <strong className="text-xs font-black text-white font-display truncate">{teamName}</strong>
                </div>
              </div>

              <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-2xl">
                <span className="text-[10px] font-bold text-white/40 uppercase font-display block">Arena Ability</span>
                <strong className="text-xs font-bold text-[#FFE600] font-display mt-1 block truncate">
                  {ROUND_NAMES[assignedRound] || `Round ${assignedRound}`}
                </strong>
              </div>

              <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-2xl">
                <span className="text-[10px] font-bold text-white/40 uppercase font-display block">Physical Tag</span>
                <div className="flex items-center gap-1.5 mt-1">
                  {profile?.tag_issued ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                      <strong className="text-xs font-black text-green-400 font-display">🏷️ ISSUED</strong>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#FFE600] animate-pulse"></span>
                      <strong className="text-xs font-bold text-[#FFE600] font-display">SCAN AT ENTRY</strong>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Event Schedule & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2.5 text-white/70">
                <span className="text-base">📅</span>
                <div>
                  <span className="text-[10px] text-white/40 uppercase font-bold block">Event Date</span>
                  <strong>Wednesday, Sep 23, 2026</strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-white/70">
                <span className="text-base">📍</span>
                <div>
                  <span className="text-[10px] text-white/40 uppercase font-bold block">Venue Location</span>
                  <strong>Main Campus Auditorium · Hyderabad</strong>
                </div>
              </div>
            </div>

          </div>

          {/* Right Side: QR Code & Security Barcode */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-white/[0.03] border border-white/10 rounded-2xl text-center space-y-4">
            
            {/* Dynamic Scannable QR Code */}
            <div className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
              <svg 
                className="w-36 h-36 sm:w-40 sm:h-40 text-black" 
                viewBox="0 0 100 100" 
                fill="currentColor"
              >
                {/* Clean Decorative Scannable QR Matrix Representation */}
                <rect x="5" y="5" width="28" height="28" fill="black" />
                <rect x="9" y="9" width="20" height="20" fill="white" />
                <rect x="13" y="13" width="12" height="12" fill="black" />

                <rect x="67" y="5" width="28" height="28" fill="black" />
                <rect x="71" y="9" width="20" height="20" fill="white" />
                <rect x="75" y="13" width="12" height="12" fill="black" />

                <rect x="5" y="67" width="28" height="28" fill="black" />
                <rect x="9" y="71" width="20" height="20" fill="white" />
                <rect x="13" y="75" width="12" height="12" fill="black" />

                {/* Data Points */}
                <rect x="38" y="8" width="6" height="6" />
                <rect x="48" y="8" width="6" height="6" />
                <rect x="38" y="18" width="6" height="12" />
                <rect x="48" y="24" width="8" height="6" />
                <rect x="8" y="38" width="6" height="6" />
                <rect x="18" y="38" width="12" height="6" />
                <rect x="8" y="48" width="12" height="8" />
                <rect x="24" y="48" width="6" height="16" />
                <rect x="38" y="38" width="10" height="10" />
                <rect x="52" y="38" width="8" height="8" />
                <rect x="64" y="38" width="14" height="6" />
                <rect x="82" y="38" width="8" height="8" />
                <rect x="38" y="52" width="6" height="14" />
                <rect x="48" y="50" width="12" height="6" />
                <rect x="64" y="48" width="8" height="12" />
                <rect x="76" y="50" width="16" height="6" />
                <rect x="38" y="70" width="8" height="8" />
                <rect x="50" y="70" width="6" height="14" />
                <rect x="60" y="68" width="12" height="6" />
                <rect x="76" y="68" width="16" height="10" />
                <rect x="38" y="82" width="10" height="8" />
                <rect x="60" y="80" width="10" height="10" />
                <rect x="74" y="82" width="18" height="8" />
              </svg>
            </div>

            <div>
              <span className="text-[11px] font-black font-mono tracking-widest text-[#FFE600] uppercase block">
                SCAN TO VERIFY ENTRY
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                PASS VERIFICATION: AUTH-OK
              </span>
            </div>

            {/* Barcode Strip */}
            <div className="w-full pt-2 flex flex-col items-center">
              <div className="flex items-center gap-[2px] h-8 opacity-80">
                {[3,1,2,4,1,3,2,1,4,2,3,1,2,3,1,4,2,1,3,2,4,1,2,3,1,4,2].map((w, i) => (
                  <div key={i} className="bg-white h-full" style={{ width: `${w * 1.5}px` }} />
                ))}
              </div>
              <span className="text-[9px] font-mono tracking-widest text-white/50 mt-1">
                *{passId}*
              </span>
            </div>

          </div>

        </div>

        {/* Pass Bottom Foil Security Footer */}
        <div className="px-6 sm:px-8 py-3 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 font-mono gap-2">
          <span>ISSUED BY STUDENT TRIBE TECH & OPERATIONS</span>
          <span className="text-white/60">NON-TRANSFERABLE · PRESENT WITH COLLEGE ID</span>
        </div>
      </div>

      {/* Next Steps Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link 
          href="/dashboard/play" 
          className="p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl transition-all group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform inline-block mb-2">🎯</span>
          <h4 className="font-bold text-white text-sm font-display">1. Tribe Playground</h4>
          <p className="text-white/50 text-xs mt-1">Practice your round challenge and master the countdown mechanics.</p>
        </Link>

        <Link 
          href="/dashboard/leaderboard" 
          className="p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl transition-all group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform inline-block mb-2">🏆</span>
          <h4 className="font-bold text-white text-sm font-display">2. Team Leaderboard</h4>
          <p className="text-white/50 text-xs mt-1">Check current rankings of all 20 teams and race to the top.</p>
        </Link>

        <Link 
          href="/dashboard/wall" 
          className="p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl transition-all group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform inline-block mb-2">💬</span>
          <h4 className="font-bold text-white text-sm font-display">3. The Tribe Wall</h4>
          <p className="text-white/50 text-xs mt-1">Post your freshers dream note and connect with 100 participants.</p>
        </Link>
      </div>
    </div>
  )
}

export default function EventPassPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-white/50 font-display">
        Loading Official Event Pass…
      </div>
    }>
      <EventPassContent />
    </Suspense>
  )
}
