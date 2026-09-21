'use client'

import { createClient } from '@/lib/supabase/client'
import { uniqueChannelName } from '@/lib/realtime'

export interface WallPostRow {
  id: string
  userId: string
  authorName: string
  content: string
  isPinned: boolean
  status: 'pending' | 'approved' | 'rejected'
  likesCount: number
  createdAt: string
}

interface RawWallPost {
  id: string
  user_id: string
  author_name: string
  content: string
  is_pinned: boolean
  status: 'pending' | 'approved' | 'rejected'
  likes_count: number
  created_at: string
}

const WALL_COLUMNS = 'id, user_id, author_name, content, is_pinned, status, likes_count, created_at'

function mapPost(row: RawWallPost): WallPostRow {
  return {
    id: row.id,
    userId: row.user_id,
    authorName: row.author_name,
    content: row.content,
    isPinned: row.is_pinned,
    status: row.status,
    likesCount: row.likes_count ?? 0,
    createdAt: row.created_at,
  }
}

// Admin/controller view: every post regardless of status (RLS lets an
// admin see all rows; a student would only get their own + approved).
export async function fetchAllWallPosts(): Promise<WallPostRow[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('wall_posts')
    .select(WALL_COLUMNS)
    .order('created_at', { ascending: false })
  return (data ?? []).map(mapPost)
}

// Student: pin a new dream to the wall. Goes in as 'pending' so it only
// appears publicly once an admin approves it from the Wall moderation
// panel — even though the table's own default is 'approved'.
export async function submitWallPost(params: { userId: string; teamId: string | null; authorName: string; content: string }) {
  const supabase = createClient()
  await supabase.from('wall_posts').insert({
    user_id: params.userId,
    team_id: params.teamId,
    author_name: params.authorName,
    content: params.content,
    status: 'pending',
  })
}

export async function likePost(id: string, currentLikes: number) {
  const supabase = createClient()
  await supabase.from('wall_posts').update({ likes_count: currentLikes + 1 }).eq('id', id)
}

export function subscribeToWallPosts(onChange: () => void): () => void {
  const supabase = createClient()
  const channel = supabase
    .channel(uniqueChannelName('wall-posts-sync'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'wall_posts' }, onChange)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

export async function approvePost(id: string) {
  const supabase = createClient()
  await supabase.from('wall_posts').update({ status: 'approved' }).eq('id', id)
}

export async function hidePost(id: string) {
  const supabase = createClient()
  await supabase.from('wall_posts').update({ status: 'rejected', is_pinned: false }).eq('id', id)
}

export async function togglePin(id: string, pinned: boolean) {
  const supabase = createClient()
  await supabase.from('wall_posts').update({ is_pinned: pinned }).eq('id', id)
}
