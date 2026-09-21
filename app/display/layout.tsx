export default function DisplayLayout({ children }: { children: React.ReactNode }) {
  // Zero admin controls, zero nav — this is the passive projector/LED
  // screen. Everything it shows is driven purely by Supabase Realtime.
  return <div className="min-h-screen bg-[#0A0A0A] overflow-hidden">{children}</div>
}
