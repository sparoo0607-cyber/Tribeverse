import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'

// This route uses the service-role key, so only signed-in admins may call it.
async function requireAdmin(): Promise<NextResponse | null> {
  const session = await createSessionClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const { data: me } = await session.from('profiles').select('role').eq('id', user.id).single()
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Admins only' }, { status: 403 })
  return null
}

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied
  try {
    const body = await request.json()
    const { userId, studentId, tagIssued = true } = body

    if (!userId && !studentId) {
      return NextResponse.json({ error: 'userId or studentId is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase service role configuration missing' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const timestamp = tagIssued ? new Date().toISOString() : null

    // 1. Find profile first
    let query = supabaseAdmin.from('profiles').select('*')
    if (userId) query = query.eq('id', userId)
    else if (studentId) query = query.ilike('student_id', studentId.trim())

    const { data: profile, error: findError } = await query.maybeSingle()

    if (findError || !profile) {
      return NextResponse.json({ error: 'Participant profile not found' }, { status: 404 })
    }

    // 2. Update tag status in profiles table
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        tag_issued: tagIssued,
        tag_issued_at: timestamp,
      })
      .eq('id', profile.id)

    if (updateError) {
      // If column doesn't exist in sql yet, we also update user metadata as safe fallback
      await supabaseAdmin.auth.admin.updateUserById(profile.id, {
        user_metadata: {
          tag_issued: tagIssued,
          tag_issued_at: timestamp,
        },
      })
    } else {
      // Keep user_metadata in sync
      await supabaseAdmin.auth.admin.updateUserById(profile.id, {
        user_metadata: {
          tag_issued: tagIssued,
          tag_issued_at: timestamp,
        },
      })
    }

    // 3. Return updated profile
    const updatedProfile = {
      ...profile,
      tag_issued: tagIssued,
      tag_issued_at: timestamp,
    }

    return NextResponse.json({
      success: true,
      message: tagIssued ? 'Physical tag / wristband issued successfully' : 'Tag status revoked',
      profile: updatedProfile,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to look up student by QR code value, studentId, or phone
export async function GET(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied
  try {
    const { searchParams } = new URL(request.url)
    const queryStr = searchParams.get('q')?.trim().replace(/[^\w@.+ -]/g, ' ').trim()

    if (!queryStr) {
      return NextResponse.json({ error: 'Search query string (q) is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Search by student_id or full_name or phone or id
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .or(`student_id.ilike.%${queryStr}%,full_name.ilike.%${queryStr}%,phone.ilike.%${queryStr}%,id.eq.${queryStr.length === 36 ? queryStr : '00000000-0000-0000-0000-000000000000'}`)
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      results: profiles || [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
