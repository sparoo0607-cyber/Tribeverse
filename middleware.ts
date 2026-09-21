// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // API routes manage their own auth (e.g. /api/auth/register runs
  // unauthenticated with the service-role key) — never gate them here.
  if (pathname.startsWith('/api/')) {
    return supabaseResponse
  }

  const { data: { user } } = await supabase.auth.getUser()

  // Public routes — no auth needed. /display is the passive projector/LED
  // screen (event_state is public-readable) — it's meant to be opened on a
  // venue laptop without anyone signing in.
  const publicRoutes = ['/', '/login', '/register', '/auth/callback']
  if (publicRoutes.includes(pathname) || pathname.startsWith('/display')) {
    return supabaseResponse
  }

  // Not authenticated → redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'student'
  const homeFor = (r: string) => (r === 'admin' ? '/admin' : r === 'host' ? '/event-flow' : '/dashboard')

  // Only admins may access the admin desk or the per-stage Event Control cockpit
  if ((pathname.startsWith('/admin') || pathname.startsWith('/event-control')) && role !== 'admin') {
    return NextResponse.redirect(new URL(homeFor(role), request.url))
  }

  // The one-page Event Flow cockpit: admins and hosts both run the show from here
  if (pathname.startsWith('/event-flow') && role !== 'admin' && role !== 'host') {
    return NextResponse.redirect(new URL(homeFor(role), request.url))
  }

  // Admins use the admin desk instead; students and hosts (who embed the
  // live stage pages inside the Event Flow cockpit) may both view it
  if (pathname.startsWith('/dashboard') && role === 'admin') {
    return NextResponse.redirect(new URL(homeFor(role), request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
