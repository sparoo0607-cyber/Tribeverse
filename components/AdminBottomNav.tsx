'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Icon, { IconName } from '@/components/icons/Icon'

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: '/admin', label: 'Home', icon: 'bolt' },
  { href: '/event-control', label: 'Control', icon: 'monitor' },
  { href: '/admin/scanner', label: 'Check-in', icon: 'camera' },
  { href: '/admin/participants', label: 'People', icon: 'users' },
]

// Fixed bottom tab bar for phones, shared by the admin desk and Event Control.
export default function AdminBottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    await createClient().auth.signOut()
    router.push('/')
  }

  return (
    <nav
      aria-label="Admin"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#050505]/95 backdrop-blur border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {TABS.map((t) => {
          const active = pathname === t.href || (t.href !== '/admin' && pathname.startsWith(t.href))
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold font-display ${active ? 'text-[#FF2D87]' : 'text-white/50'}`}
              >
                <Icon name={t.icon} className="w-5 h-5" />
                {t.label}
              </Link>
            </li>
          )
        })}
        <li>
          <button onClick={signOut} className="w-full flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold font-display text-white/50 active:text-red-400">
            <Icon name="logout" className="w-5 h-5" />
            Sign out
          </button>
        </li>
      </ul>
    </nav>
  )
}
