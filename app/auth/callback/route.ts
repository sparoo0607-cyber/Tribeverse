// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
 const { searchParams, origin } = new URL(request.url)
 const code = searchParams.get('code')
 const next = searchParams.get('next') ?? '/dashboard'

 if (code) {
 const cookieStore = await cookies()
 const supabase = createServerClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
 {
 cookies: {
 getAll() { return cookieStore.getAll() },
 setAll(cookiesToSet) {
 cookiesToSet.forEach(({ name, value, options }) =>
 cookieStore.set(name, value, options)
 )
 },
 },
 }
 )

 const { data, error } = await supabase.auth.exchangeCodeForSession(code)
 if (!error && data.user) {
 // Redirect based on role
 const { data: profile } = await supabase
 .from('profiles')
 .select('role')
 .eq('id', data.user.id)
 .single()

 if (profile?.role ==='admin') {
 return NextResponse.redirect(`${origin}/admin`)
 }
 if (profile?.role ==='host') {
 return NextResponse.redirect(`${origin}/event-flow`)
 }
 return NextResponse.redirect(`${origin}${next}`)
 }
 }

 return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
