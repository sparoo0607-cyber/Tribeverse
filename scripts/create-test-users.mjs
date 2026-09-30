// Creates (or resets) three test logins: student, admin, host.
// Run:  node --env-file=.env.local scripts/create-test-users.mjs
// Passwords are random and printed once to your terminal, unless TEST_PASSWORD is set.
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run with --env-file=.env.local')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

const USERS = [
  { role: 'student', email: 'test.student@studenttribe.in', name: 'Test Student', studentId: 'ST-2026-TRB-9001' },
  { role: 'admin', email: 'test.admin@studenttribe.in', name: 'Test Admin', studentId: 'ST-2026-ADM-9002' },
  { role: 'host', email: 'test.host@studenttribe.in', name: 'Test Host', studentId: 'ST-2026-HST-9003' },
]

// Set TEST_PASSWORD to choose one shared password (min 6 chars); otherwise each gets a random one.
const newPassword = () => process.env.TEST_PASSWORD || randomBytes(9).toString('base64url')

async function findUserByEmail(email) {
  for (let page = 1; page < 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const hit = data.users.find((u) => u.email?.toLowerCase() === email)
    if (hit) return hit
    if (data.users.length < 200) return null
  }
  return null
}

const results = []
for (const u of USERS) {
  const password = newPassword()
  const meta = { full_name: u.name, role: u.role, student_id: u.studentId }

  let user = await findUserByEmail(u.email)
  if (user) {
    const { error } = await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true, user_metadata: meta })
    if (error) throw error
  } else {
    const { data, error } = await supabase.auth.admin.createUser({ email: u.email, password, email_confirm: true, user_metadata: meta })
    if (error) throw error
    user = data.user
  }

  const { error: pErr } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: u.name,
    student_id: u.studentId,
    role: u.role,
    assigned_round: u.role === 'student' ? 1 + Math.floor(Math.random() * 5) : null,
  })
  if (pErr) throw pErr

  results.push({ role: u.role, email: u.email, password })
}

console.log('\nTest logins (shown once):\n')
for (const r of results) console.log(`${r.role.padEnd(8)} ${r.email}   ${r.password}`)
console.log('\nLog in from the matching tab on /login. Delete these users when you are done.\n')
