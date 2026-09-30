import { createClient } from '@supabase/supabase-js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const ROLL_RE = /^[A-Z0-9][A-Z0-9/_-]{3,24}$/

function fail(error: string, status = 400, extra: Record<string, unknown> = {}) {
  return Response.json({ error, ...extra }, { status })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Public sign-up can only ever create a student. Admin and host accounts
    // are created by staff, never through this endpoint.
    const role = 'student'

    const fullName = String(body.fullName ?? '').trim().replace(/\s+/g, ' ')
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const phone = String(body.phone ?? '').replace(/[^\d+]/g, '')
    const rollNumber = String(body.rollNumber ?? '').trim().toUpperCase()
    const branch = String(body.branch ?? '').trim().slice(0, 80)
    const section = String(body.section ?? '').trim().slice(0, 40)

    if (fullName.length < 2 || fullName.length > 80) return fail('Please enter your full name.')
    if (!EMAIL_RE.test(email)) return fail('Please enter a valid email address.')
    if (password.length < 6) return fail('Password must be at least 6 characters.')
    if (phone.replace(/\D/g, '').length < 10) return fail('Please enter a valid 10 digit phone number.')
    if (!ROLL_RE.test(rollNumber)) return fail('Please enter a valid roll number (letters and digits, 4 to 25 characters).')
    if (!branch) return fail('Please select your branch.')
    if (!section) return fail('Please select your section.')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return fail('Supabase service configuration missing', 500)
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // One registration per roll number.
    const { data: rollTaken } = await admin
      .from('profiles')
      .select('id')
      .ilike('roll_number', rollNumber)
      .limit(1)
    if (rollTaken && rollTaken.length > 0) {
      return fail('This roll number is already registered. Please log in instead.', 409, { exists: true })
    }

    // Unique pass ID: retry until it does not collide with an existing one.
    let studentId = ''
    for (let attempt = 0; attempt < 12; attempt++) {
      const digits = attempt < 6 ? 4 : 5
      const n = Math.floor(Math.pow(10, digits - 1) + Math.random() * 9 * Math.pow(10, digits - 1))
      const candidate = `ST-2026-TRB-${n}`
      const { data: clash } = await admin.from('profiles').select('id').eq('student_id', candidate).limit(1)
      if (!clash || clash.length === 0) { studentId = candidate; break }
    }
    if (!studentId) return fail('Could not generate a pass ID. Please try again.', 500)

    // 1. Create the auth user (email pre-confirmed so there is no verification wall).
    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        student_id: studentId,
        roll_number: rollNumber,
        phone,
        branch,
        section,
        role,
        tag_issued: false,
      },
    })

    if (createError) {
      const msg = createError.message.toLowerCase()
      if (msg.includes('already') || msg.includes('exists')) {
        return fail('Account already exists. Please login directly with your password.', 409, { exists: true })
      }
      return fail(createError.message)
    }

    const user = userData.user

    // 2. Save the profile. supabase-js returns errors instead of throwing, so check them.
    const row = {
      id: user.id,
      full_name: fullName,
      student_id: studentId,
      roll_number: rollNumber,
      phone,
      branch,
      section,
      tag_issued: false,
      role,
      assigned_round: Math.floor(1 + Math.random() * 5),
    }

    let { error: profileError } = await admin.from('profiles').upsert(row)

    // Database not migrated yet for the roll number column: keep the rest, the
    // roll number is still stored in the auth metadata above.
    if (profileError && /roll_number/i.test(profileError.message)) {
      const { roll_number: _omit, ...withoutRoll } = row
      void _omit
      ;({ error: profileError } = await admin.from('profiles').upsert(withoutRoll))
    }

    if (profileError) {
      // Do not leave a login without a profile behind.
      await admin.auth.admin.deleteUser(user.id)
      if (profileError.code === '23505') {
        return fail('This roll number or pass ID is already registered. Please try again.', 409)
      }
      return fail('Could not save your registration. Please try again.', 500)
    }

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName,
        studentId,
        rollNumber,
        phone,
        branch,
        section,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return fail(message, 500)
  }
}
