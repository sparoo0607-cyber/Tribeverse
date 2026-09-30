'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Shown on the projector display only when a host or admin is signed in.
export default function DisplaySignOut() {
  const [signedIn, setSignedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setSignedIn(!!user))
  }, [])

  if (!signedIn) return null

  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut()
        router.push('/login')
      }}
      className="fixed top-3 right-3 z-50 px-3 py-1.5 rounded-lg bg-black/40 text-white/30 hover:text-white text-[11px] font-bold font-display"
    >
      Sign out
    </button>
  )
}
