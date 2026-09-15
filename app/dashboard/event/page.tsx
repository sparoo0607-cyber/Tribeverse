'use client'

const SCHEDULE = [
 { time: '9:00 AM', name: 'Registration & Welcome', type: 'Opening', badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', desc: 'Check-in, collect Tribe kit & find your 4 teammates'},
 { time: '9:30 AM', name: 'Inauguration Ceremony', type: 'Ceremony', badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', desc: 'Official event kickoff and rule declaration'},
 { time: '10:00 AM', name: 'Tribe Playground (5 Rounds)', type: 'Challenge', badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/30', desc: '5 teammates split into 5 individual ability trials'},
 { time: '11:15 AM', name: 'The Tribe Detective', type: 'Mystery', badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', desc: 'Campus riddle trail, cipher clues & physical checkpoint hunt'},
 { time: '1:00 PM', name: 'Lunch Break & Chill Lounge', type: 'Break', badgeBg: 'bg-green-500/20 text-green-300 border-green-500/30', desc: 'Campus food battle voting, music playlist & team recharge'},
 { time: '2:00 PM', name: 'Tribe Arcade Minigames', type: 'Arcade', badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30', desc: 'Speed tapper, stroop color frenzy & math blitz'},
 { time: '3:30 PM', name: 'The Impossible Challenge', type: 'Intense', badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30', desc: '100-Second timed high stakes logic puzzles'},
 { time: '4:30 PM', name: 'Tribe Jam', type: 'Music', badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30', desc: 'Music. Expression. Vibes. Performance Round (sing, rap, beatbox, hum) & team musical energy.'},
 { time: '5:30 PM', name: 'The Tribe Wall & Dream Board', type: 'Interactive', badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', desc: '"Before I Graduate, I Want To..." sticky note pins'},
 { time: '6:00 PM', name: 'TRIBEVERSE REVEAL & Podium', type: 'Finale', badgeBg: 'bg-[#FFE600] text-black font-black', desc: 'Final winner announcements, confetti & community reveal'},
]

export default function EventGuidePage() {
 return (
 <div className="space-y-8 max-w-4xl mx-auto">
 <div>
 <span className="px-3 py-1 bg-[#1A6FFF]/20 text-[#00FFD1] text-xs font-black rounded-full font-display uppercase tracking-widest">
 Event Playbook
 </span>
 <h1 className="text-3xl sm:text-5xl font-black text-white font-display mt-2">
 Event Guide & Schedule
 </h1>
 <p className="text-white/60 text-sm mt-1">
 Everything you need to know about the TRIBEVERSE V1 itinerary, rules, and scoring system.
 </p>
 </div>

 {/* Schedule Table */}
 <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
 <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
 <h3 className="font-black text-white font-display text-base">Minute-by-Minute Schedule</h3>
 <span className="text-xs text-white/40 font-mono">September 23, 2026</span>
 </div>
 <div className="divide-y divide-white/5">
 {SCHEDULE.map((item, idx) =>(
 <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
 <div className="flex items-start sm:items-center gap-4">
 <span className="font-mono font-bold text-sm text-[#FFE600] min-w-[75px]">{item.time}</span>
 <div>
 <p className="font-bold text-white font-display text-base">{item.name}</p>
 <p className="text-white/50 text-xs mt-0.5">{item.desc}</p>
 </div>
 </div>
 <span className={` px-3 py-1 text-xs font-bold font-display rounded-full border self-start sm:self-auto ${item.badgeBg}`}>
 {item.type}
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* Rules of Engagement */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-3">
 <h3 className="text-lg font-black text-white font-display flex items-center gap-2">
 Scoring Rules
 </h3>
 <ul className="space-y-2 text-white/70 text-xs leading-relaxed">
 <li>• Every member's game attempt contributes to the overall team total.</li>
 <li>• Speed matters: Faster completions in Trivia & Reaction earn streak bonuses.</li>
 <li>• Detective submissions undergo admin verification before points credit.</li>
 <li>• Leaderboard freezes 15 minutes before the Grand Finale reveal.</li>
 </ul>
 </div>

 <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-3">
 <h3 className="text-lg font-black text-white font-display flex items-center gap-2">
 Tribe Spirit Code
 </h3>
 <ul className="space-y-2 text-white/70 text-xs leading-relaxed">
 <li>• 100 participants enter as strangers, leave as a unified tribe.</li>
 <li>• Support your teammates across all individual ability rounds.</li>
 <li>• Fair play, zero toxicity, and maximum high-energy celebration.</li>
 <li>• In case of disputes, Admin desk decisions are final and binding.</li>
 </ul>
 </div>
 </div>
 </div>
 )
}
