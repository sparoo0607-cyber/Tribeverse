'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function UnlockForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const res = await fetch('/api/admin/event-lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      const next = params.get('next') ?? ''
      router.replace(next.startsWith('/event-control') ? next : '/event-control')
      router.refresh()
      return
    }
    const data = await res.json().catch(() => ({}))
    setError(data.error ?? 'Could not unlock')
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
      <h1 className="font-black text-xl text-white font-display">Event Control</h1>
      <p className="text-white/60 text-sm">Enter the Event Control password to continue.</p>
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-[#FF2D87]"
      />
      {error && <p className="text-red-400 text-sm font-bold">{error}</p>}
      <button
        type="submit"
        disabled={busy || !password}
        className="w-full py-3 rounded-xl bg-[#FF2D87] text-white font-black font-display disabled:opacity-50"
      >
        {busy ? 'Checking…' : 'Unlock'}
      </button>
    </form>
  )
}

export default function EventLockPage() {
  return (
    <div className="flex justify-center pt-10">
      <Suspense>
        <UnlockForm />
      </Suspense>
    </div>
  )
}
