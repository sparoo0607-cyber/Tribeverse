'use client'
import { useState } from 'react'

const POSTS = [
 { id: 1, author: 'Alex (Team Titans)', content: 'We just cracked the main library riddle! Let us go!!', time: '5m ago', status: 'approved'},
 { id: 2, author: 'Priya (Team Apex)', content: 'Best freshers event ever! Student Tribe rocks', time: '8m ago', status: 'approved'},
 { id: 3, author: 'Rahul (Team Cyber)', content: 'Where is the lunch counter guys?', time: '12m ago', status: 'pending'},
]

export default function AdminMonitorPage() {
 const [posts, setPosts] = useState(POSTS)

 const removePost = (id: number) =>{
 setPosts(prev =>prev.filter(p =>p.id !== id))
 }

 return (
 <div className="space-y-6 max-w-4xl">
 <div>
 <h1 className="text-3xl font-black text-white font-display">Live Wall Moderation</h1>
 <p className="text-white/50 text-sm">Moderate live student photo and message posts on The Tribe Wall.</p>
 </div>

 <div className="space-y-3">
 {posts.map(p =>(
 <div key={p.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-xl">
 <div>
 <p className="font-bold text-white font-display text-sm">{p.author} <span className="text-white/30 text-xs font-normal">· {p.time}</span></p>
 <p className="text-white/80 text-sm mt-1">{p.content}</p>
 </div>
 <button
 onClick={() =>removePost(p.id)}
 className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold rounded-lg text-xs transition-colors"
 >
 DELETE POST 
 </button>
 </div>
 ))}
 </div>
 </div>
 )
}
