'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const ABILITIES = [
  { round: 1, title: 'Round 1: Quick Eyes', icon: '👁️', desc: 'Visual recognition & memory speed' },
  { round: 2, title: 'Round 2: Quick Draw / Logic', icon: '🎨', desc: 'Cipher solving & fast sketches' },
  { round: 3, title: 'Round 3: Reaction Challenge', icon: '⚡', desc: 'Microsecond reflexes & tapping' },
  { round: 4, title: 'Round 4: Sound Check / Music', icon: '🎵', desc: 'Audio beat identification & rhythm' },
  { round: 5, title: 'Round 5: Think Fast / Strategy', icon: '🧠', desc: 'Rapid puzzle solving under pressure' },
]

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [college, setCollege] = useState('')
  const [selectedRound, setSelectedRound] = useState<number>(3)
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

    try {
      // 1. Generate a unique Student Pass ID
      const passSuffix = Math.floor(1000 + Math.random() * 9000)
      const studentId = `ST-2026-TRB-${passSuffix}`

      // 2. Sign up user in Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            student_id: studentId,
            phone: phone,
            college: college,
            assigned_round: selectedRound,
            role: 'student',
          },
        },
      })

      if (signUpError) {
        // If user already exists, try signing in directly
        if (signUpError.message.toLowerCase().includes('already registered') || signUpError.message.toLowerCase().includes('exists')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
          if (signInError) {
            throw new Error('Account already exists. Please sign in with your password.')
          }
          // Signed in successfully
          router.push('/dashboard/pass?welcome=true')
          return
        }
        throw signUpError
      }

      const user = authData?.user
      if (user) {
        // 3. Upsert Profile
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: fullName,
          student_id: studentId,
          role: 'student',
        })

        // 4. Assign to a team if teams exist
        const { data: teams } = await supabase.from('teams').select('id, name, team_number').order('team_number')
        if (teams && teams.length > 0) {
          // Randomly or sequentially pick a team
          const pickedTeam = teams[Math.floor(Math.random() * teams.length)]
          await supabase.from('team_members').upsert({
            team_id: pickedTeam.id,
            user_id: user.id,
            assigned_round: selectedRound,
          }, { onConflict: 'user_id' })
        }

        // 5. Store pass metadata in local storage for fast instant load
        if (typeof window !== 'undefined') {
          localStorage.setItem('tribeverse_pass_data', JSON.stringify({
            fullName,
            studentId,
            college,
            phone,
            assignedRound: selectedRound,
            email,
          }))
        }

        // 6. Check if email confirmation is required or if session is active
        if (authData.session) {
          setSuccess('Registration complete! Generating your Event Pass…')
          setTimeout(() => {
            router.push('/dashboard/pass?welcome=true')
          }, 600)
        } else {
          // Auto sign in to establish session
          const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
          if (!signInErr) {
            router.push('/dashboard/pass?welcome=true')
          } else {
            setSuccess('Registration successful! Please check your email or proceed to Login.')
            setTimeout(() => {
              router.push('/login')
            }, 1200)
          }
        }
      } else {
        router.push('/login')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.')
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
      <main className="relative z-10 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="bg-[#151922]/90 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 bg-[#FFE600]/15 border border-[#FFE600]/30 text-[#FFE600] rounded-full text-[11px] font-black uppercase tracking-widest mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              ✦ OFFICIAL EVENT REGISTRATION
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>
              REGISTER FOR <span className="text-[#FFE600]">TRIBEVERSE V1</span>
            </h1>
            <p className="text-white/60 text-xs sm:text-sm mt-2 max-w-md mx-auto">
              Fill your details to register for the event. Your official <strong>Digital Event Pass & Team ID</strong> will be generated immediately.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold tracking-widest text-white/60 uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
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

              <div>
                <label className="block text-xs font-bold tracking-widest text-white/60 uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  WhatsApp / Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-white/[0.05] border border-white/10 focus:border-[#FFE600] rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* College & Branch */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-white/60 uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                College & Branch *
              </label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. CBIT - CSE (Freshers 2026)"
                className="w-full bg-white/[0.05] border border-white/10 focus:border-[#FFE600] rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none transition-colors"
              />
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold tracking-widest text-white/60 uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@college.edu"
                  className="w-full bg-white/[0.05] border border-white/10 focus:border-[#FFE600] rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-white/60 uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Create Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-white/[0.05] border border-white/10 focus:border-[#FFE600] rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Preferred Role / Ability in Team */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-white/60 uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Select Your Team Ability / Superpower
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ABILITIES.map((ab) => (
                  <button
                    key={ab.round}
                    type="button"
                    onClick={() => setSelectedRound(ab.round)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      selectedRound === ab.round
                        ? 'bg-[#FFE600]/10 border-[#FFE600] text-white shadow-[0_0_15px_rgba(255,230,0,0.15)]'
                        : 'bg-white/[0.03] border-white/10 text-white/60 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{ab.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white font-display">{ab.title}</div>
                      <div className="text-[11px] text-white/50">{ab.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Messages */}
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="p-3.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-xl font-medium">
                ✅ {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest bg-gradient-to-r from-[#FFE600] via-[#FF6B1A] to-[#FF2D87] text-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_8px_30px_rgba(255,230,0,0.3)] flex items-center justify-center gap-2 ${
                loading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Generating Event Pass…</span>
                </>
              ) : (
                <>
                  <span>🎟️ Register & Generate Event Pass</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Footer Links */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-3">
            <span>Event Date: September 23, 2026</span>
            <Link href="/login" className="text-[#FFE600] hover:underline font-bold">
              Already have an account? Login here →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-white/30">
        Student Tribe Presents TRIBEVERSE V1 · 20 Teams · 5 Members · 100 Participants
      </footer>
    </div>
  )
}
