import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AMBASSADOR_SECTIONS, AMBASSADOR_SKILLS } from '@/lib/ambassador'

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Honeypot: real people never fill this hidden field.
  if (clip(body.website, 100)) return NextResponse.json({ success: true })

  const full_name = clip(body.full_name, 120)
  const roll_number = clip(body.roll_number, 40).toUpperCase()
  const section = clip(body.section, 20)
  const department = clip(body.department, 80)
  const year = clip(body.year, 20)
  const phone = clip(body.phone, 20).replace(/[\s-]/g, '')
  const email = clip(body.email, 200).toLowerCase()
  const motivation = clip(body.motivation, 2000)
  const experience = clip(body.experience, 2000)
  const extra = clip(body.extra, 2000)
  const instagram = clip(body.instagram, 300)
  const linkedin = clip(body.linkedin, 300)
  const skills = Array.isArray(body.skills)
    ? body.skills.filter((s): s is string => typeof s === 'string' && (AMBASSADOR_SKILLS as readonly string[]).includes(s))
    : []

  if (!full_name || !roll_number || !AMBASSADOR_SECTIONS.includes(section) || !department || !year || !phone || !email || !motivation) {
    return NextResponse.json({ error: 'Please fill all required fields.' }, { status: 400 })
  }
  if (!/^\+?\d{10,13}$/.test(phone)) {
    return NextResponse.json({ error: 'Enter a valid phone number.' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 })
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const { error } = await admin.from('ambassador_applications').insert({
    full_name, roll_number, section, department, year, phone, email, skills,
    experience: experience || null,
    motivation,
    instagram: instagram || null,
    linkedin: linkedin || null,
    extra: extra || null,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'An application with this roll number already exists.' }, { status: 409 })
    }
    console.error('ambassador apply failed:', error.code, error.message)
    return NextResponse.json({ error: 'Could not submit. Please try again.' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
