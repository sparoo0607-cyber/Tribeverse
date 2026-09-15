'use client'

import StageGuard from '@/components/StageGuard'

import { useState } from 'react'

const INITIAL_POSTS = [
 { id: 1, author: 'Rohan (Team Titans)', text: 'I want to build an AI product that changes education', color: '#FFE600', deg: '-2deg', likes: 24 },
 { id: 2, author: 'Priya (Team Apex)', text: 'Perform live on a stadium stage with my music band', color: '#FF6BDE', deg: '3deg', likes: 19 },
 { id: 3, author: 'Karan (Team Cyber)', text: 'Launch my own startup before I graduate college', color: '#00FFD1', deg: '-1deg', likes: 31 },
 { id: 4, author: 'Sneha (Team Phoenix)', text: 'Travel across 15 different countries and capture stories', color: '#FF8C42', deg: '2deg', likes: 15 },
 { id: 5, author: 'Ananya (Team Vortex)', text: 'Make lifelong friends and find my true tribe', color: '#6BFFA0', deg: '-3deg', likes: 42 },
 { id: 6, author: 'Vikram (Team Nexus)', text: 'Win a national hackathon and build something that touches millions', color: '#FFE600', deg: '1deg', likes: 28 },
]

export default function TribeWallPage() {
 const [posts, setPosts] = useState(INITIAL_POSTS)
 const [dream, setDream] = useState('')
 const [authorName, setAuthorName] = useState('')

 const handlePin = (e: React.FormEvent) =>{
 e.preventDefault()
 if (!dream.trim()) return
 const colors = ['#FFE600', '#FF6BDE', '#00FFD1', '#FF8C42', '#6BFFA0']
 const degs = ['-3deg', '-2deg', '-1deg', '1deg', '2deg', '3deg']
 const newPost = {
 id: Date.now(),
 author: authorName ||'You (Team Titans)',
 text: dream.trim(),
 color: colors[Math.floor(Math.random() * colors.length)],
 deg: degs[Math.floor(Math.random() * degs.length)],
 likes: 1
 }
 setPosts(prev =>[newPost, ...prev])
 setDream('')
 setAuthorName('')
 }

 const likePost = (id: number) =>{
 setPosts(prev =>prev.map(p =>p.id === id ? { ...p, likes: p.likes + 1 } : p))
 }

 return (
 <StageGuard slug="wall" title="The Tribe Wall" stageNumber="07" points={300}>
 <div className="space-y-8 max-w-5xl mx-auto">
 <div className="text-center space-y-2">
 <span className="px-3 py-1 bg-[#D4FF00]/20 text-[#D4FF00] text-xs font-black rounded-full font-display uppercase tracking-widest">
 Interactive Dream Wall
 </span>
 <h1 className="text-4xl sm:text-6xl font-black text-white font-display" style={{ background: 'linear-gradient(135deg, #D4FF00, #00FFD1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
 THE TRIBE WALL
 </h1>
 <p className="text-white/80 font-bold text-lg sm:text-xl font-display">"BEFORE I GRADUATE, I WANT TO..."</p>
 <p className="text-white/40 text-xs">{posts.length} Dreams Shared by Participants Today</p>
 </div>

 {/* Pin Input Form */}
 <div className="max-w-xl mx-auto bg-white/[0.04] border border-[#D4FF00]/30 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
 <h3 className="font-black text-white text-base font-display mb-3">Pin Your Dream to the Live Wall</h3>
 <form onSubmit={handlePin} className="space-y-3">
 <input
 type="text"
 placeholder="Your Name (e.g. Rohan · Team Titans)"
 value={authorName}
 onChange={(e) =>setAuthorName(e.target.value)}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#D4FF00]"
 />
 <textarea
 required
 rows={2}
 maxLength={120}
 placeholder="Before I graduate, I want to..."
 value={dream}
 onChange={(e) =>setDream(e.target.value)}
 className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#D4FF00]"
 />
 <button
 type="submit"
 className="w-full bg-[#D4FF00] text-black font-black py-3 rounded-xl font-display text-xs uppercase tracking-wider hover:bg-[#FFE600] transition-colors"
 >
 PIN TO WALL 
 </button>
 </form>
 </div>

 {/* Sticky Notes Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
 {posts.map(post =>(
 <div
 key={post.id}
 className="p-5 rounded-xl shadow-xl flex flex-col justify-between transition-transform hover:scale-105 select-none"
 style={{ background: post.color, transform: ` rotate(${post.deg})`, color: '#0A0A0A'}}
 >
 <div>
 <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 font-display">{post.author}</p>
 <p className="font-bold text-base leading-snug font-sans">{post.text}</p>
 </div>
 <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
 <button
 onClick={() =>likePost(post.id)}
 className="flex items-center gap-1.5 px-3 py-1 bg-black/10 hover:bg-black/20 rounded-full text-xs font-bold transition-colors"
 >
 {post.likes}
 </button>
 <span className="text-[10px] font-mono opacity-50">Student Tribe</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </StageGuard>
 )
}
