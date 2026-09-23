'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface StudentProfile {
  id: string
  full_name: string
  student_id: string
  phone?: string
  branch?: string
  section?: string
  role?: string
  tag_issued?: boolean
  tag_issued_at?: string
  created_at?: string
  team_members?: Array<{
    assigned_round: number
    team: {
      name: string
      team_number: number
      color: string
    }
  }>
}

export default function AdminScannerPage() {
  const [query, setQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null)
  const [studentsList, setStudentsList] = useState<StudentProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [filter, setFilter] = useState<'all' | 'issued' | 'pending'>('all')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const supabase = createClient()

  // Load all students and listen to real-time changes
  async function loadStudents() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*, team_members(assigned_round, team:teams(name, team_number, color))')
      .order('created_at', { ascending: false })

    if (data) {
      setStudentsList(data as any)
      // Update selected student if present
      if (selectedStudent) {
        const found = data.find((s) => s.id === selectedStudent.id)
        if (found) setSelectedStudent(found as any)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    loadStudents()

    const channel = supabase
      .channel('admin-scanner-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, loadStudents)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      stopCamera()
    }
  }, [])

  // Start Camera for Live QR Code Scanning
  async function startCamera() {
    setCameraError('')
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
        setCameraActive(true)
      } else {
        setCameraError('Camera access not supported on this device/browser.')
      }
    } catch (err: any) {
      setCameraError('Camera permission denied or camera not found.')
    }
  }

  // Stop Camera
  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  // Handle Search / Scan Query Submit
  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!query.trim()) return

    const trimmed = query.trim().toUpperCase()
    // 1. Try local match first
    const matched = studentsList.find(
      (s) =>
        s.student_id?.toUpperCase() === trimmed ||
        s.student_id?.toUpperCase().includes(trimmed) ||
        s.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        s.phone?.includes(query.trim()) ||
        s.id === query.trim()
    )

    if (matched) {
      setSelectedStudent(matched)
      setFeedback({ type: 'success', message: `Found participant: ${matched.full_name}` })
      return
    }

    // 2. Fetch from backend API
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/tag?q=${encodeURIComponent(query.trim())}`)
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        setSelectedStudent(data.results[0])
        setFeedback({ type: 'success', message: `Found: ${data.results[0].full_name}` })
      } else {
        setFeedback({ type: 'error', message: `No participant found matching "${query}"` })
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to search participant.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Toggle or Set Tag Issued Status
  async function handleToggleTag(student: StudentProfile, issue: boolean) {
    setActionLoading(true)
    setFeedback(null)

    try {
      const res = await fetch('/api/admin/tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: student.id,
          studentId: student.student_id,
          tagIssued: issue,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update tag status')
      }

      setFeedback({
        type: 'success',
        message: issue
          ? `🎉 TAG ISSUED to ${student.full_name}! (${student.student_id})`
          : `↩️ Tag revoked for ${student.full_name}`,
      })

      // Update local state instantly
      const updated = {
        ...student,
        tag_issued: issue,
        tag_issued_at: issue ? new Date().toISOString() : undefined,
      }
      setSelectedStudent(updated)
      setStudentsList((prev) => prev.map((s) => (s.id === student.id ? updated : s)))
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error updating tag status' })
    } finally {
      setActionLoading(false)
    }
  }

  // Stats calculation
  const totalStudents = studentsList.length
  const tagsIssuedCount = studentsList.filter((s) => s.tag_issued).length
  const pendingTagsCount = totalStudents - tagsIssuedCount

  // Filtered List for Table
  const filteredList = studentsList.filter((s) => {
    if (filter === 'issued') return s.tag_issued === true
    if (filter === 'pending') return !s.tag_issued
    return true
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#FFE600]/15 border border-[#FFE600]/30 text-[#FFE600] rounded-full text-xs font-black uppercase tracking-widest font-display">
              ✦ ARENA ENTRY COCKPIT
            </span>
            <span className="px-2.5 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
              LIVE SYNC
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white font-display mt-2">
            QR SCANNER & <span className="text-[#FFE600]">TAG ISSUANCE</span>
          </h1>
          <p className="text-white/60 text-xs sm:text-sm">
            Scan participant QR codes at the gate or search by ID/Phone to verify entry and issue physical wristband tags.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="px-4 py-2.5 rounded-xl bg-[#FFE600] hover:bg-[#FFE600]/90 text-black font-black text-xs uppercase tracking-wider font-display transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>📷</span>
              <span>Start Camera Scanner</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider font-display transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>✕</span>
              <span>Stop Camera</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl">
          <span className="text-xs font-bold text-white/50 uppercase font-display block">Total Registered</span>
          <p className="text-3xl font-black text-white font-display mt-1">{totalStudents}</p>
          <span className="text-[11px] text-white/40">Verified event participants</span>
        </div>

        <div className="p-5 bg-green-500/10 border border-green-500/30 rounded-2xl">
          <span className="text-xs font-bold text-green-400 uppercase font-display block">Tags Issued</span>
          <p className="text-3xl font-black text-green-400 font-display mt-1">{tagsIssuedCount}</p>
          <span className="text-[11px] text-green-300/60">Wristbands assigned at gate</span>
        </div>

        <div className="p-5 bg-[#FFE600]/10 border border-[#FFE600]/30 rounded-2xl">
          <span className="text-xs font-bold text-[#FFE600] uppercase font-display block">Pending Check-in</span>
          <p className="text-3xl font-black text-[#FFE600] font-display mt-1">{pendingTagsCount}</p>
          <span className="text-[11px] text-[#FFE600]/60">Awaiting arrival at entrance</span>
        </div>
      </div>

      {/* Camera Live View (if active) */}
      {cameraActive && (
        <div className="p-6 bg-[#121620] border-2 border-[#FFE600]/50 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center">
          <div className="relative w-full max-w-md aspect-square bg-black rounded-2xl overflow-hidden border border-white/20">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            {/* Scanner reticle overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-[#FFE600] rounded-2xl shadow-[0_0_20px_rgba(255,230,0,0.5)] relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#FFE600] -translate-x-1 -translate-y-1" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#FFE600] translate-x-1 -translate-y-1" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#FFE600] -translate-x-1 translate-y-1" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#FFE600] translate-x-1 translate-y-1" />
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#FFE600] to-transparent animate-pulse mt-28" />
              </div>
            </div>
          </div>
          <p className="text-xs font-bold text-white/70 mt-3 font-display uppercase tracking-wider">
            Point camera at Participant&apos;s Digital Event Pass QR code
          </p>
        </div>
      )}

      {cameraError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium">
          ⚠️ {cameraError}
        </div>
      )}

      {/* Search / Manual Input Bar */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-3.5 text-white/40 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Scan or enter Pass ID (e.g. ST-2026-TRB-1234), Name, or Mobile Number…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 focus:border-[#FFE600] rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={actionLoading}
            className="px-6 py-3 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black rounded-xl text-xs font-black uppercase tracking-wider font-display transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Verify Pass</span>
            <span>→</span>
          </button>
        </form>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold font-display flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-green-500/15 border-green-500/40 text-green-300'
              : 'bg-red-500/15 border-red-500/40 text-red-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-white/60 hover:text-white ml-3">
            ✕
          </button>
        </div>
      )}

      {/* ── SELECTED PARTICIPANT VERIFICATION & TAG ISSUANCE CARD ── */}
      {selectedStudent && (
        <div className="bg-gradient-to-br from-[#151922] via-[#10141B] to-[#0A0D14] border-2 border-[#FFE600]/50 rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)] space-y-6 animate-in fade-in zoom-in-95 duration-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1A6FFF] via-[#FF2D87] to-[#FFE600] p-[2px]">
                <div className="w-full h-full bg-[#111418] rounded-[14px] flex items-center justify-center text-2xl font-black text-white font-display">
                  {selectedStudent.full_name?.charAt(0) || 'P'}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#FFE600] uppercase font-bold">
                  VERIFIED PARTICIPANT
                </span>
                <h2 className="text-2xl font-black text-white font-display">{selectedStudent.full_name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono font-bold text-white/70 bg-white/10 px-2 py-0.5 rounded">
                    {selectedStudent.student_id}
                  </span>
                  {selectedStudent.phone && (
                    <span className="text-xs text-white/50">📱 {selectedStudent.phone}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tag Status Badge */}
            <div className="flex items-center gap-3">
              {selectedStudent.tag_issued ? (
                <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-2xl text-green-400 text-xs font-black font-display uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.25)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                  <span>🏷️ TAG ISSUED</span>
                </div>
              ) : (
                <div className="px-4 py-2 bg-[#FFE600]/20 border border-[#FFE600]/50 rounded-2xl text-[#FFE600] text-xs font-black font-display uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(255,230,0,0.2)] animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600]"></span>
                  <span>⚠️ TAG NOT ISSUED</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
              <span className="text-[10px] font-bold text-white/40 uppercase font-display block">Branch</span>
              <strong className="text-sm font-bold text-white font-display mt-0.5 block truncate">
                {selectedStudent.branch || 'Not specified'}
              </strong>
            </div>

            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
              <span className="text-[10px] font-bold text-white/40 uppercase font-display block">Section</span>
              <strong className="text-sm font-bold text-white font-display mt-0.5 block truncate">
                {selectedStudent.section || 'General'}
              </strong>
            </div>

            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
              <span className="text-[10px] font-bold text-white/40 uppercase font-display block">Assigned Team</span>
              <strong className="text-sm font-bold text-[#FFE600] font-display mt-0.5 block truncate">
                {selectedStudent.team_members?.[0]?.team?.name || 'Team Titans'}
              </strong>
            </div>

            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
              <span className="text-[10px] font-bold text-white/40 uppercase font-display block">Tag Timestamp</span>
              <strong className="text-xs font-mono text-white/70 mt-0.5 block truncate">
                {selectedStudent.tag_issued_at
                  ? new Date(selectedStudent.tag_issued_at).toLocaleTimeString()
                  : 'Pending'}
              </strong>
            </div>
          </div>

          {/* Big Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!selectedStudent.tag_issued ? (
              <button
                onClick={() => handleToggleTag(selectedStudent, true)}
                disabled={actionLoading}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_8px_30px_rgba(34,197,94,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer font-display"
              >
                <span>🏷️ ISSUE WRISTBAND / PHYSICAL TAG</span>
                <span>✓</span>
              </button>
            ) : (
              <button
                onClick={() => handleToggleTag(selectedStudent, false)}
                disabled={actionLoading}
                className="py-3 px-6 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer font-display"
              >
                ↩️ Revoke / Unmark Tag
              </button>
            )}

            <button
              onClick={() => setSelectedStudent(null)}
              className="py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-2xl text-xs font-bold font-display uppercase tracking-wider transition-all"
            >
              Clear
            </button>
          </div>

        </div>
      )}

      {/* ── ALL REGISTERED PARTICIPANTS ROSTER & TAG STATUS TABLE ── */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden">
        
        {/* Table Header / Filter Bar */}
        <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-white font-display">Participant Roster & Gate Check-in</h2>
            <p className="text-white/50 text-xs">Click any participant to view details or toggle wristband status.</p>
          </div>

          <div className="flex items-center gap-2">
            {(['all', 'pending', 'issued'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-[#FFE600] text-black shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All (100)' : f === 'pending' ? `Pending (${pendingTagsCount})` : `Issued (${tagsIssuedCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-16 text-center text-white/40 font-display">
            <div className="w-8 h-8 border-4 border-[#FFE600] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading participants roster…
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-12 text-center text-white/40 font-display text-xs">
            No participants found matching selected filter.
          </div>
        ) : (
          <div className="divide-y divide-white/5 overflow-x-auto">
            {filteredList.map((student) => (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`flex items-center justify-between p-4 hover:bg-white/[0.04] transition-colors cursor-pointer ${
                  selectedStudent?.id === student.id ? 'bg-[#FFE600]/10 border-l-4 border-l-[#FFE600]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white text-sm font-display">
                    {student.full_name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm font-display">{student.full_name}</p>
                      <span className="font-mono text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded">
                        {student.student_id}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">
                      {student.branch || 'CSE'} · {student.section || 'Sec A'} · {student.phone || 'No phone'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {student.tag_issued ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleTag(student, false)
                      }}
                      className="px-3 py-1.5 bg-green-500/20 hover:bg-red-500/20 text-green-400 hover:text-red-300 border border-green-500/40 hover:border-red-500/40 rounded-xl text-xs font-bold font-display transition-colors"
                      title="Click to Revoke"
                    >
                      ✓ Tag Issued
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleTag(student, true)}
                      }
                      className="px-3.5 py-1.5 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black font-black text-xs uppercase tracking-wider rounded-xl font-display transition-transform hover:scale-105 shadow-md cursor-pointer"
                    >
                      🏷️ Issue Tag
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  )
}
