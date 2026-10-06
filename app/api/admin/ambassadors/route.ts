import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'
import { AMBASSADOR_STATUSES } from '@/lib/ambassador'

// Service-role route: only signed-in admins may call it.
async function requireAdmin(): Promise<NextResponse | null> {
  const session = await createSessionClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const { data: me } = await session.from('profiles').select('role').eq('id', user.id).single()
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Admins only' }, { status: 403 })
  return null
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  const admin = serviceClient()
  if (!admin) return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 })
  const { data, error } = await admin
    .from('ambassador_applications')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ applications: data ?? [] })
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied
  const admin = serviceClient()
  if (!admin) return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 })

  const { id, status, admin_notes } = await request.json()
  if (typeof id !== 'string') return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (status !== undefined) {
    if (!AMBASSADOR_STATUSES.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    patch.status = status
  }
  if (admin_notes !== undefined) patch.admin_notes = String(admin_notes).slice(0, 4000)

  const { data, error } = await admin.from('ambassador_applications').update(patch).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ application: data })
}
