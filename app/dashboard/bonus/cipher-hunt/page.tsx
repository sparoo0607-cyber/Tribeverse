'use client'

import { useState } from 'react'

const RIDDLES = [
 {
 id: 1,
 title: 'Clue #1: The Origin Stone',
 riddle: 'I have no voice, but I tell the tale of every founder who walked through this gate. Look under the shadow of the main auditorium.',
 cipher: 'VBER-CVYNE-01',
 hint: 'Rot-13 Cipher: Shift each letter back 13 positions.',
 solution: 'IBER-CLYAR-01',
 points: 150,
 },
 {
 id: 2,
 title: 'Clue #2: The Binary Beacon',
 riddle: 'Where thousands of books sleep in silence, find the 3rd floor aisle 7. What is 01010100 01010010 01001001 01000010 01000101 in plain text?',
 cipher: '01010100 01010010 01001001 01000010 01000101',
 hint: '8-bit ASCII Binary sequence.',
 solution: 'TRIBE',
 points: 200,
 },
 {
 id: 3,
 title: 'Clue #3: The Cafeteria Cryptogram',
 riddle: 'Order a secret item at the canteen counter: "A cup of chai with 5 spoons of revolution". What secret word did the barista whisper?',
 cipher: 'ZHOFRPH WR WKH WULEHYHUVH',
 hint: 'Caesar Cipher with shift +3. Decode it to find the passphrase.',
 solution: 'WELCOME TO THE TRIBEVERSE',
 points: 250,
 }
]

export default function TribeDetectivePage() {
 const [activeTab, setActiveTab] = useState<'riddles'|'decoder'|'evidence'>('riddles')
 const [inputs, setInputs] = useState<Record<number, string>>({})
 const [solved, setSolved] = useState<Record<number, boolean>>({})
 const [decoderInput, setDecoderInput] = useState('')
 const [decoderShift, setDecoderShift] = useState(13)
 const [decoderOutput, setDecoderOutput] = useState('')
 const [evidenceNote, setEvidenceNote] = useState('')
 const [evidenceSubmitting, setEvidenceSubmitting] = useState(false)
 const [evidenceSuccess, setEvidenceSuccess] = useState(false)

 const solveRiddle = (id: number, sol: string, pts: number) =>{
 const val = (inputs[id] ||'').trim().toUpperCase()
 if (val === sol.toUpperCase()) {
 setSolved(prev =>({ ...prev, [id]: true }))
 alert(` Correct! You decoded Clue #${id} and earned ${pts} points for your team!`)
 } else {
 alert('Incorrect decode. Check the cipher hint and try again!')
 }
 }

 const decodeCaesar = () =>{
 const res = decoderInput.split('').map(char =>{
 const code = char.charCodeAt(0)
 if (code >= 65 && code<= 90) {
 return String.fromCharCode(((code - 65 + decoderShift) % 26) + 65)
 } else if (code >= 97 && code<= 122) {
 return String.fromCharCode(((code - 97 + decoderShift) % 26) + 97)
 }
 return char
 }).join('')
 setDecoderOutput(res)
 }

 return (
 <div className="space-y-6 max-w-4xl mx-auto">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0D1B4B] to-[#1A6FFF]/20 p-6 rounded-3xl border border-[#1A6FFF]/30">
 <div>
 <div className="flex items-center gap-2 mb-2">
 <span className="px-3 py-1 bg-[#00FFD1]/20 text-[#00FFD1] text-xs font-black rounded-full font-display uppercase tracking-widest">Bonus Hunt</span>
 <span className="text-white/40 text-xs">Optional · Anytime During the Event</span>
 </div>
 <h1 className="text-3xl md:text-5xl font-black text-white font-display">Cipher Hunt</h1>
 <p className="text-white/70 text-sm mt-1">Solve campus riddles, crack ciphers, and find the secret Tribe QR checkpoints. Not required, but worth bonus points.</p>
 </div>
 <div className="bg-black/40 border border-white/10 p-4 rounded-2xl text-center min-w-[140px]">
 <p className="text-white/40 text-xs font-display uppercase">Solved</p>
 <p className="text-3xl font-black text-[#FFE600] font-display">{Object.keys(solved).length} / {RIDDLES.length}</p>
 </div>
 </div>

 {/* Tabs */}
 <div className="flex gap-2 border-b border-white/10 pb-2">
 <button onClick={() =>setActiveTab('riddles')} className={` px-5 py-2.5 rounded-xl font-bold font-display text-sm transition-all ${activeTab==='riddles'? 'bg-[#FFE600] text-black shadow-lg': 'text-white/60 hover:text-white bg-white/5'}`}>
 Active Clues
 </button>
 <button onClick={() =>setActiveTab('decoder')} className={` px-5 py-2.5 rounded-xl font-bold font-display text-sm transition-all ${activeTab==='decoder'? 'bg-[#FFE600] text-black shadow-lg': 'text-white/60 hover:text-white bg-white/5'}`}>
 Cipher Tool
 </button>
 <button onClick={() =>setActiveTab('evidence')} className={` px-5 py-2.5 rounded-xl font-bold font-display text-sm transition-all ${activeTab==='evidence'? 'bg-[#FFE600] text-black shadow-lg': 'text-white/60 hover:text-white bg-white/5'}`}>
 Submit Evidence
 </button>
 </div>

 {/* Riddles Tab */}
 {activeTab ==='riddles'&& (
 <div className="space-y-4">
 {RIDDLES.map(r =>(
 <div key={r.id} className={` p-6 rounded-2xl border transition-all ${solved[r.id]? 'bg-green-500/10 border-green-500/40': 'bg-white/[0.03] border-white/10'}`}>
 <div className="flex justify-between items-start mb-3">
 <h3 className="text-xl font-black text-white font-display">{r.title}</h3>
 <span className="px-3 py-1 bg-[#FFE600]/10 text-[#FFE600] text-xs font-black rounded-lg font-display">+{r.points} PTS</span>
 </div>
 <p className="text-white/80 text-base mb-3 leading-relaxed font-sans">{r.riddle}</p>
 
 <div className="bg-black/50 p-3 rounded-xl border border-white/5 mb-3 font-mono text-sm">
 <span className="text-white/40 block text-xs uppercase mb-1">Encrypted Cipher:</span>
 <span className="text-[#00FFD1] font-bold">{r.cipher}</span>
 <p className="text-white/40 text-xs mt-1">{r.hint}</p>
 </div>

 {solved[r.id] ? (
 <div className="flex items-center gap-2 text-green-400 font-bold font-display text-sm">
 <span>Clue Solved! Solution: {r.solution}</span>
 </div>
 ) : (
 <div className="flex gap-2 mt-4">
 <input
 type="text"
 placeholder="Enter decrypted solution..."
 value={inputs[r.id] ||''}
 onChange={(e) =>setInputs({ ...inputs, [r.id]: e.target.value })}
 className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#FFE600]"
 />
 <button
 onClick={() =>solveRiddle(r.id, r.solution, r.points)}
 className="bg-[#FFE600] text-black font-black px-6 py-2.5 rounded-xl font-display text-sm hover:bg-[#D4FF00] transition-colors"
 >
 SUBMIT
 </button>
 </div>
 )}
 </div>
 ))}
 </div>
 )}

 {/* Cipher Decoder Tab */}
 {activeTab ==='decoder'&& (
 <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-4">
 <h3 className="text-xl font-black text-white font-display">In-App Cipher Tool</h3>
 <p className="text-white/60 text-sm">Use this quick rot / caesar shift calculator to crack scrambled clues.</p>
 
 <div>
 <label className="block text-white/40 text-xs uppercase font-display mb-1">Encrypted Text</label>
 <textarea
 rows={3}
 value={decoderInput}
 onChange={(e) =>setDecoderInput(e.target.value)}
 placeholder="Paste cipher text here..."
 className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-[#00FFD1]"
 />
 </div>

 <div className="flex items-center gap-4">
 <div className="flex-1">
 <label className="block text-white/40 text-xs uppercase font-display mb-1">Shift Offset ({decoderShift})</label>
 <input
 type="range"
 min="1"
 max="25"
 value={decoderShift}
 onChange={(e) =>setDecoderShift(parseInt(e.target.value))}
 className="w-full accent-[#FFE600]"
 />
 </div>
 <button
 onClick={decodeCaesar}
 className="bg-[#00FFD1] text-black font-black px-6 py-3 rounded-xl font-display text-sm hover:bg-cyan-300 transition-colors mt-3"
 >
 RUN DECODER
 </button>
 </div>

 {decoderOutput && (
 <div className="bg-black/60 p-4 rounded-xl border border-[#00FFD1]/30">
 <p className="text-white/40 text-xs uppercase font-display mb-1">Decoded Output:</p>
 <p className="text-[#FFE600] font-mono font-bold text-lg">{decoderOutput}</p>
 </div>
 )}
 </div>
 )}

 {/* Submit Evidence Tab */}
 {activeTab ==='evidence'&& (
 <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-4">
 <h3 className="text-xl font-black text-white font-display">Physical Checkpoint Evidence</h3>
 <p className="text-white/60 text-sm">Found the physical sticker or QR stamp on campus? Submit location details and photo evidence for admin verification.</p>

 <div className="space-y-3">
 <div>
 <label className="block text-white/40 text-xs uppercase font-display mb-1">Checkpoint / Location Description</label>
 <input
 type="text"
 placeholder="e.g. Behind Auditorium Pillar #4 sticker code"
 value={evidenceNote}
 onChange={(e) =>setEvidenceNote(e.target.value)}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FFE600]"
 />
 </div>

 <div className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center hover:border-[#FFE600]/50 transition-colors cursor-pointer bg-white/[0.01]">
 <span className="text-4xl block mb-2"></span>
 <p className="text-white font-bold font-display text-sm">Upload Checkpoint Photo</p>
 <p className="text-white/40 text-xs mt-1">PNG, JPG up to 10MB</p>
 </div>

 <button
 disabled={evidenceSubmitting || !evidenceNote}
 onClick={() =>{
 setEvidenceSubmitting(true)
 setTimeout(() =>{
 setEvidenceSubmitting(false)
 setEvidenceSuccess(true)
 setEvidenceNote('')
 }, 1000)
 }}
 className="w-full bg-[#1A6FFF] text-white font-black py-3.5 rounded-xl font-display text-sm uppercase tracking-wider hover:bg-blue-600 transition-colors disabled:opacity-40"
 >
 {evidenceSubmitting ? 'Transmitting to Admin...': 'Submit Evidence for +300 PTS'}
 </button>

 {evidenceSuccess && (
 <div className="bg-green-500/20 border border-green-500/40 p-4 rounded-xl text-green-300 font-bold font-display text-sm text-center">
 Evidence successfully received! Admin review pending for points credit.
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 )
}
