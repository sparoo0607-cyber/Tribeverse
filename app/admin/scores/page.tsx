'use client'
import { useState } from 'react'

const LOGS = [
 { id: 1, team: 'Team Titans', action: 'Solved Detective Clue #2', pts: '+200', time: '2 mins ago'},
 { id: 2, team: 'Team Phoenix', action: 'Completed Think Fast Round', pts: '+350', time: '4 mins ago'},
 { id: 3, team: 'Team Cyber', action: 'Speed Tapper High Score', pts: '+180', time: '7 mins ago'},
 { id: 4, team: 'Team Apex', action: 'Admin Manual Award', pts: '+100', time: '12 mins ago'},
]

export default function AdminScoresPage() {
 const [logs, setLogs] = useState(LOGS)

 return (
 <div className="space-y-6 max-w-4xl">
 <div>
 <h1 className="text-3xl font-black text-white font-display">Live Score Feed</h1>
 <p className="text-white/50 text-sm">Real-time point updates, activity completions, and audit logs.</p>
 </div>

 <div className="space-y-3">
 {logs.map(log =>(
 <div key={log.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-xl">
 <div className="flex items-center gap-3">
 <span className="w-2 h-2 rounded-full bg-[#FFE600] animate-ping"/>
 <div>
 <p className="font-bold text-white font-display text-sm">{log.team}</p>
 <p className="text-white/40 text-xs">{log.action}</p>
 </div>
 </div>
 <div className="text-right">
 <span className="font-mono font-black text-green-400 text-sm">{log.pts}</span>
 <p className="text-white/30 text-[10px]">{log.time}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 )
}
