import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, fullName, phone, branch, section, role = 'student' } = body

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return Response.json({ error: 'Supabase service configuration missing' }, { status: 500 })
    }

    // Admin client with service_role key to bypass email confirmation and email rate limits
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const passSuffix = Math.floor(1000 + Math.random() * 9000)
    const studentId = `ST-2026-TRB-${passSuffix}`

    // 1. Create user with email_confirm: true (Pre-confirms email, avoids all rate limits & verification walls)
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || 'Tribe Member',
        student_id: studentId,
        phone: phone || '',
        branch: branch || '',
        section: section || '',
        role: role,
        tag_issued: false,
      },
    })

    if (createError) {
      // If user already exists, return informative response
      if (createError.message.toLowerCase().includes('already') || createError.message.toLowerCase().includes('exists')) {
        return Response.json({ error: 'Account already exists. Please login directly with your password.', exists: true }, { status: 409 })
      }
      return Response.json({ error: createError.message }, { status: 400 })
    }

    const user = userData.user

    // 2. Insert / Upsert Profile in profiles table
    if (user) {
      try {
        await supabaseAdmin.from('profiles').upsert({
          id: user.id,
          full_name: fullName || 'Tribe Member',
          student_id: studentId,
          phone: phone || '',
          branch: branch || '',
          section: section || '',
          tag_issued: false,
          role: role,
        })
      } catch (e) {
        // Fallback for base profile if custom columns aren't migrated yet
        await supabaseAdmin.from('profiles').upsert({
          id: user.id,
          full_name: fullName || 'Tribe Member',
          student_id: studentId,
          role: role,
        })
      }

      // 3. Assign to a team if teams exist
      const { data: teams } = await supabaseAdmin.from('teams').select('id, name, team_number').order('team_number')
      if (teams && teams.length > 0) {
        const pickedTeam = teams[Math.floor(Math.random() * teams.length)]
        await supabaseAdmin.from('team_members').upsert({
          team_id: pickedTeam.id,
          user_id: user.id,
          assigned_round: Math.floor(1 + Math.random() * 5),
        }, { onConflict: 'user_id' })
      }
    }

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: fullName || 'Tribe Member',
        studentId,
        phone: phone || '',
        branch: branch || '',
        section: section || '',
      },
    })
  } catch (err: any) {
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
