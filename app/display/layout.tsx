import DisplaySignOut from '@/components/DisplaySignOut'

export default function DisplayLayout({ children }: { children: React.ReactNode }) {
  // Passive projector/LED screen: no nav, everything is driven by Supabase
  // Realtime. The only control is a faint sign-out for a logged-in host.
  return (
    <div className="min-h-screen bg-[#0A0A0A] overflow-hidden">
      <DisplaySignOut />
      {children}
    </div>
  )
}
