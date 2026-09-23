'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const BRANCH_OPTIONS = [
  'CSE (Computer Science & Engg)',
  'AI & ML / AI & DS',
  'IT (Information Technology)',
  'ECE (Electronics & Comm)',
  'EEE (Electrical & Electronics)',
  'Mechanical Engg',
  'Civil Engg',
  'Data Science / Cyber Security',
  'MBA / Management',
  'Other Branch',
]

const SECTION_OPTIONS = ['Section A', 'Section B', 'Section C', 'Section D', 'Section E', 'Section F', 'Other']

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [branch, setBranch] = useState('')
  const [customBranch, setCustomBranch] = useState('')
  const [section, setSection] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const effectiveBranch = branch === 'Other Branch' ? customBranch.trim() || 'General' : branch

    if (!effectiveBranch) {
      setError('Please select or specify your branch.')
      setLoading(false)
      return
    }

    if (!section) {
      setError('Please select your section.')
      setLoading(false)
      return
    }

    try {
      // 1. Call server-side registration API (Pre-confirms email & bypasses rate limits/verification)
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim(),
          branch: effectiveBranch,
          section: section.trim(),
          role: 'student',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // If account already exists, attempt instant sign in with entered password
        if (data.exists || data.error?.toLowerCase().includes('already') || data.error?.toLowerCase().includes('exists')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
          if (signInError) {
            throw new Error('This email is already registered. Please login with your password or use a different email.')
          }
          router.push('/dashboard/pass?welcome=true')
          return
        }
        throw new Error(data.error || 'Registration failed')
      }

      // 2. Save local pass metadata for instantaneous rendering
      if (typeof window !== 'undefined') {
        localStorage.setItem('tribeverse_pass_data', JSON.stringify({
          fullName: fullName.trim(),
          studentId: data.user?.studentId,
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          branch: effectiveBranch,
          section: section.trim(),
        }))
      }

      // 3. Immediately log the student in without any email verification barrier
      const { error: loginErr } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
      if (loginErr) {
        // Fallback: If session delay, still route them directly into the pass page
        setSuccess('Registration successful! Launching your Event Pass…')
        setTimeout(() => {
          router.push('/dashboard/pass?welcome=true')
        }, 600)
        return
      }

      setSuccess('Registration complete! Generating your Event Pass…')
      setTimeout(() => {
        router.push('/dashboard/pass?welcome=true')
      }, 400)
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0E1116] text-white flex flex-col justify-between relative overflow-hidden selection:bg-[#FFE600] selection:text-black">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FFE600]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#FF2D87]/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-[#1A6FFF]/15 rounded-full blur-3xl"></div>
        <div 
          className="absolute inset-0 opacity-20" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px' 
          }} 
        />
      </div>

      {/* Top Navigation */}
      <header className="relative z-10 px-6 py-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/" className="inline-flex items-baseline gap-2 group">
          <span className="font-black text-3xl text-[#FFE600] tracking-tight group-hover:scale-105 transition-transform" style={{ fontFamily: 'Outfit, sans-serif' }}>st.</span>
          <span className="font-bold text-xs tracking-widest text-white/70 uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>STUDENT TRIBE</span>
        </Link>
        <Link 
          href="/login"
          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Already Registered? Login →
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="relative z-10 max-w-xl mx-auto w-full px-4 py-6">
        <div className="bg-[#151922]/90 border border-white/10 rounded-3xl p-6 sm:p-9 backdrop-blur-xl shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-7">
            <span className="inline-block px-3 py-1 bg-[#FFE600]/15 border border-[#FFE600]/30 text-[#FFE600] rounded-full text-[11px] font-black uppercase tracking-widest mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              ✦ OFFICIAL EVENT REGISTRATION
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>
              REGISTER FOR <span className="text-[#FFE600]">TRIBEVERSE V1</span>
            </h1>
            <p className="text-white/60 text-xs sm:text-sm mt-1.5 max-w-md mx-auto">
              Fill your details below. Your official <strong>Digital Event Pass & Team ID</strong> will be generated immediately with instant access!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-white/70 uppercase mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rohan Varma"
                className="w-full bg-white/[0.05] border border-white/10 focus:border-[#FFE600] rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none transition-colors"
              />
            </div>

            {/* 2. Email Address & 3. Mobile Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold tracking-widest text-white/70 uppercase mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rohan@gmail.com"
                  className="w-full bg-white/[0.05] border border-white/10 focus:border-[#FFE600] rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-white/70 uppercase mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit mobile number"
                  className="w-full bg-white/[0.05] border border-white/10 focus:border-[#FFE600] rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* 4. Branch & 5. Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold tracking-widest text-white/70 uppercase mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Branch *
                </label>
                <select
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-[#1A1F2B] border border-white/10 focus:border-[#FFE600] rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="" disabled>Select Branch</option>
                  {BRANCH_OPTIONS.map((b) => (
                    <option key={b} value={b} className="bg-[#151922] text-white">
                      {b}
                    </option>
                  ))}
                </select>
                {branch === 'Other Branch' && (
                  <input
                    type="text"
                    required
                    value={customBranch}
                    onChange={(e) => setCustomBranch(e.target.value)}
                    placeholder="Enter your branch name"
                    className="w-full mt-2 bg-white/[0.05] border border-white/10 focus:border-[#FFE600] rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-xs focus:outline-none transition-colors"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-white/70 uppercase mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Section *
                </label>
                <select
                  required
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full bg-[#1A1F2B] border border-white/10 focus:border-[#FFE600] rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="" disabled>Select Section</option>
                  {SECTION_OPTIONS.map((s) => (
                    <option key={s} value={s} className="bg-[#151922] text-white">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-white/70 uppercase mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Create Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-white/[0.05] border border-white/10 focus:border-[#FFE600] rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none transition-colors"
              />
            </div>

            {/* Feedback Messages */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-xl font-medium flex items-center gap-2">
                <span>✅</span>
                <span>{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest bg-gradient-to-r from-[#FFE600] via-[#FF6B1A] to-[#FF2D87] text-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_8px_30px_rgba(255,230,0,0.3)] flex items-center justify-center gap-2 mt-2 cursor-pointer ${
                loading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Issuing Pass & Logging In…</span>
                </>
              ) : (
                <>
                  <span>🎟️ Register & Get Event Pass</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Footer Links */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-2">
            <span>Event: Tribeverse V1 Freshers</span>
            <Link href="/login" className="text-[#FFE600] hover:underline font-bold">
              Already registered? Login here →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-white/30">
        Student Tribe Presents TRIBEVERSE V1 · 20 Teams · 5 Members · 100 Participants
      </footer>
    </div>
  )
}
