'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Icon from '@/components/icons/Icon'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // One login for everyone: the account's role decides where it lands.
  function redirectFor(role: string | undefined) {
    if (role === 'admin') router.push('/admin')
    else if (role === 'host') router.push('/display')
    else router.push('/dashboard')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (signInError) {
      setError(signInError.message === 'Invalid login credentials' ? 'Wrong email or password.' : signInError.message)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    redirectFor(profile?.role)
  }

  return (
    <div className="relative min-h-screen bg-[#111418] flex items-center justify-center px-4 py-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(26,111,255,0.18),transparent_60%)]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-baseline gap-2 mb-3">
            <span className="font-black text-4xl text-[#FFE600]" style={{ fontFamily: 'Outfit,sans-serif' }}>st.</span>
            <span className="font-bold text-sm tracking-widest text-white/70 uppercase" style={{ fontFamily: 'Outfit,sans-serif' }}>Student Tribe</span>
          </Link>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit,sans-serif' }}>
            Login
          </h1>
          <p className="text-white/50 text-xs mt-1">Sign in to continue to TRIBEVERSE</p>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold tracking-widest text-white/50 uppercase mb-2" style={{ fontFamily: 'Outfit,sans-serif' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#FFE600] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest text-white/50 uppercase mb-2" style={{ fontFamily: 'Outfit,sans-serif' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#FFE600] transition-colors"
              />
            </div>

            {error && (
              <div className="text-sm px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest bg-[#FFE600] text-black shadow-[0_8px_32px_rgba(255,230,0,0.25)] transition-all ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
              }`}
              style={{ fontFamily: 'Outfit,sans-serif' }}
            >
              {loading ? 'Please wait…' : 'Login'}
            </button>
          </form>
        </div>

        <div className="mt-5 p-4 rounded-2xl bg-[#FFE600]/10 border border-[#FFE600]/30 text-center">
          <span className="text-xs text-[#FFE600] font-bold block mb-2 font-display uppercase tracking-wider">
            New here? Register for the event
          </span>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-xs font-black text-black bg-[#FFE600] px-4 py-2 rounded-xl font-display uppercase tracking-widest hover:scale-105 transition-transform"
          >
            <Icon name="ticket" />
            <span>Register & Get Pass</span>
            <span>→</span>
          </Link>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          <Link href="/" className="hover:text-white transition-colors">← Back to Tribeverse Overview</Link>
        </p>
      </div>
    </div>
  )
}
