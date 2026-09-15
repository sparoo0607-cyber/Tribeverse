'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [tab, setTab] = useState<'student' | 'admin'>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: tab === 'admin' ? 'admin' : 'student',
          },
        },
      })
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }
      setError('Check your email for the confirmation link!')
      setLoading(false)
      return
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // Check role and redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard/pass?welcome=true')
    }
  }

  return (
    <div className="min-h-screen bg-[#111418] flex items-center justify-center px-4 py-8">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(26,111,255,0.12),transparent_60%)]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-baseline gap-2 mb-3">
            <span className="font-black text-4xl text-[#FFE600]" style={{ fontFamily: 'Outfit,sans-serif' }}>
              st.
            </span>
            <span
              className="font-bold text-sm tracking-widest text-white/70 uppercase"
              style={{ fontFamily: 'Outfit,sans-serif' }}
            >
              Student Tribe
            </span>
          </Link>
          <h1
            className="text-2xl font-black text-white uppercase tracking-tight"
            style={{ fontFamily: 'Outfit,sans-serif' }}
          >
            ENTER TRIBEVERSE
          </h1>
          <p className="text-white/50 text-xs mt-1">Sign in to access your Event Pass & Arena</p>
        </div>

        {/* Event Registration Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-[#FFE600]/10 border border-[#FFE600]/30 text-center">
          <span className="text-xs text-[#FFE600] font-bold block mb-1 font-display uppercase tracking-wider">
            Haven&apos;t registered for the event yet?
          </span>
          <Link
            href="/register"
            className="inline-flex items-center gap-1 text-xs font-black text-black bg-[#FFE600] px-4 py-2 rounded-xl mt-1 font-display uppercase tracking-widest hover:scale-105 transition-transform"
          >
            <span>🎟️ Register & Generate Pass</span>
            <span>→</span>
          </Link>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-white/5 border border-white/10 p-1 mb-6">
          {(['student', 'admin'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t)
                setError('')
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 ${
                tab === t
                  ? t === 'admin'
                    ? 'bg-[#FF2D87] text-white shadow-lg'
                    : 'bg-[#1A6FFF] text-white shadow-lg'
                  : 'text-white/40 hover:text-white/70'
              }`}
              style={{ fontFamily: 'Outfit,sans-serif' }}
            >
              {t === 'student' ? 'Student Login' : 'Admin Login'}
            </button>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label
                  className="block text-xs font-bold tracking-widest text-white/50 uppercase mb-2"
                  style={{ fontFamily: 'Outfit,sans-serif' }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#1A6FFF] transition-colors"
                />
              </div>
            )}

            <div>
              <label
                className="block text-xs font-bold tracking-widest text-white/50 uppercase mb-2"
                style={{ fontFamily: 'Outfit,sans-serif' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tab === 'admin' ? 'admin@studenttribe.in' : 'student@college.edu'}
                required
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#1A6FFF] transition-colors"
              />
            </div>

            <div>
              <label
                className="block text-xs font-bold tracking-widest text-white/50 uppercase mb-2"
                style={{ fontFamily: 'Outfit,sans-serif' }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#1A6FFF] transition-colors"
              />
            </div>

            {error && (
              <div
                className={`text-sm px-4 py-3 rounded-xl ${
                  error.includes('Check your email')
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
              } ${
                tab === 'admin'
                  ? 'bg-[#FF2D87] text-white shadow-[0_8px_32px_rgba(255,45,135,0.3)]'
                  : 'bg-[#FFE600] text-black shadow-[0_8px_32px_rgba(255,230,0,0.25)]'
              }`}
              style={{ fontFamily: 'Outfit,sans-serif' }}
            >
              {loading
                ? 'Please wait…'
                : isSignUp
                ? 'Create Account'
                : tab === 'admin'
                ? 'Admin Login'
                : 'Sign In & View Pass'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="text-white/40 hover:text-white/70 text-xs transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create account"}
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <p className="text-center text-white/30 text-xs mt-6">
          <Link href="/" className="hover:text-white transition-colors">
            ← Back to Tribeverse Overview
          </Link>
        </p>
      </div>
    </div>
  )
}
