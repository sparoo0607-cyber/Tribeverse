'use client'

import { useState, useEffect } from 'react'
import { fetchLatestBroadcast, subscribeToBroadcasts, BroadcastNotification } from '@/lib/stageStore'

export default function LiveBroadcastBanner() {
 const [broadcast, setBroadcast] = useState<BroadcastNotification | null>(null)
 const [visible, setVisible] = useState(false)

 useEffect(() =>{
 let cancelled = false

 fetchLatestBroadcast().then(latest =>{
 if (cancelled || !latest) return
 setBroadcast(latest)
 setVisible(true)
 })

 const unsubscribe = subscribeToBroadcasts((notif) =>{
 setBroadcast(notif)
 setVisible(true)
 })

 return () =>{ cancelled = true; unsubscribe() }
 }, [])

 if (!visible || !broadcast) return null

 return (
 <div className="sticky top-0 z-50 bg-gradient-to-r from-[#FF2D87] via-[#7B2FFF] to-[#1A6FFF] text-white px-4 py-2.5 shadow-2xl border-b border-white/20 flex items-center justify-between gap-4 animate-bounce-short">
 <div className="flex items-center gap-3 max-w-4xl mx-auto overflow-hidden">
 <span className="px-2 py-0.5 bg-black/40 text-[#FFE600] font-black text-[10px] rounded uppercase tracking-widest font-mono flex-shrink-0 animate-pulse">
 LIVE HOST ALERT
 </span>
 <p className="text-xs sm:text-sm font-bold font-display truncate">
 {broadcast.message}
 </p>
 <span className="text-[10px] text-white/60 font-mono hidden sm:inline flex-shrink-0">
 [{broadcast.timestamp}]
 </span>
 </div>

 <button
 onClick={() =>setVisible(false)}
 className="text-white/60 hover:text-white font-black text-xs px-2 py-1 bg-black/30 rounded-lg flex-shrink-0"
 >
 
 </button>
 </div>
 )
}
