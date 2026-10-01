import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EVENT_LOCK_COOKIE, eventLockToken } from '@/lib/eventLock'

export async function POST(request: Request) {
  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const { data: me } = await session.from('profiles').select('role').eq('id', user.id).single()
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Admins only' }, { status: 403 })

  const token = await eventLockToken()
  if (!token) return NextResponse.json({ error: 'EVENT_CONTROL_PASSWORD is not set on the server' }, { status: 500 })

  const { password } = await request.json().catch(() => ({ password: '' }))
  if (typeof password !== 'string' || password !== process.env.EVENT_CONTROL_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(EVENT_LOCK_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
  return res
}
