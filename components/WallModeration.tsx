'use client'

import { useEffect, useState } from 'react'
import { fetchAllWallPosts, subscribeToWallPosts, approvePost, hidePost, WallPostRow } from '@/lib/wall'

// Approve or hide student posts before they show on the Tribe Wall.
export default function WallModeration() {
  const [posts, setPosts] = useState<WallPostRow[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const all = await fetchAllWallPosts()
      if (!cancelled) setPosts(all)
    }
    load()
    const unsubscribe = subscribeToWallPosts(load)
    return () => { cancelled = true; unsubscribe() }
  }, [])

  const pending = posts.filter((p) => p.status === 'pending')
  const approved = posts.filter((p) => p.status === 'approved')

  return (
    <div id="wall" className="space-y-4 scroll-mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-white font-display">Tribe Wall Posts</h3>
        <span className="text-xs font-mono text-white/40">{pending.length} waiting · {approved.length} live</span>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-3xl divide-y divide-white/5">
        {pending.length === 0 && approved.length === 0 && (
          <p className="text-center text-white/40 text-sm py-10">No posts yet. They appear here as students pin their dreams.</p>
        )}

        {pending.map((p) => (
          <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFE600]">Waiting for approval</span>
              <p className="text-white text-sm mt-0.5 break-words">{p.content}</p>
              <p className="text-white/40 text-xs mt-0.5">{p.authorName}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => approvePost(p.id)} className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl text-xs font-black font-display uppercase">Approve</button>
              <button onClick={() => hidePost(p.id)} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-black font-display uppercase">Reject</button>
            </div>
          </div>
        ))}

        {approved.slice(0, 20).map((p) => (
          <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Live on the wall</span>
              <p className="text-white/80 text-sm mt-0.5 break-words">{p.content}</p>
              <p className="text-white/40 text-xs mt-0.5">{p.authorName}</p>
            </div>
            <button onClick={() => hidePost(p.id)} className="px-4 py-2 bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-xl text-xs font-black font-display uppercase shrink-0">Hide</button>
          </div>
        ))}
      </div>
    </div>
  )
}
