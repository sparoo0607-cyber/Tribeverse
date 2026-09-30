'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Icon from '@/components/icons/Icon'

export default function ProfilePage() {
 const router = useRouter()
 const supabase = createClient()

 const handleSignOut = async () =>{
 await supabase.auth.signOut()
 router.push('/')
 }

 return (
 <div className="space-y-6 max-w-2xl mx-auto">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-black text-white font-display">Participant Profile</h1>
 <p className="text-white/50 text-sm">Your account and participant credential for TRIBEVERSE V1.</p>
 </div>
 <a
 href="/dashboard/pass"
 className="px-4 py-2 bg-[#FFE600] text-black font-black font-display text-xs uppercase tracking-wider rounded-xl shadow-lg hover:scale-105 transition-transform inline-flex items-center gap-1.5"
 >
 <Icon name="ticket" /> View Full Pass
 </a>
 </div>

 {/* Digital ID Badge */}
 <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A6FFF] via-[#0D1B4B] to-[#7B2FFF] p-8 border border-white/20 shadow-2xl">
 <div className="flex justify-between items-start mb-6">
 <div className="flex items-baseline gap-2">
 <span className="font-black text-4xl text-[#FFE600] font-display">st.</span>
 <span className="font-bold text-xs uppercase tracking-widest text-white/80 font-display">STUDENT TRIBE</span>
 </div>
 <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-black rounded-full font-display uppercase tracking-widest">
 OFFICIAL PASS
 </span>
 </div>

 <div className="flex items-center gap-5 mb-6">
 <div className="w-16 h-16 rounded-2xl bg-[#FFE600] text-black font-black text-3xl font-display flex items-center justify-center shadow-lg">
 R
 </div>
 <div>
 <h2 className="text-2xl font-black text-white font-display">Rohan Varma</h2>
 <p className="text-[#00FFD1] text-xs font-mono font-bold">ST-2026-TRB-0001</p>
 <p className="text-white/60 text-xs mt-0.5">Role: Participant · Student</p>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3 bg-black/40 p-4 rounded-2xl border border-white/10 text-xs">
 <div>
 <span className="text-white/40 block font-display uppercase">Participation</span>
 <strong className="text-white font-bold text-sm">Open Fresher Access</strong>
 </div>
 <div>
 <span className="text-white/40 block font-display uppercase">Assigned Ability</span>
 <strong className="text-[#FFE600] font-bold text-sm">Round 03: Reaction</strong>
 </div>
 </div>

 <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-white/40 font-mono">
 <span>EVENT: TRIBEVERSE V1</span>
 <span>DATE: SEP 23, 2026</span>
 </div>
 </div>

 <button
 onClick={handleSignOut}
 className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 font-bold font-display text-xs uppercase tracking-wider hover:bg-red-500/10 transition-colors"
 >
 Sign Out of Platform
 </button>
 </div>
 )
}
