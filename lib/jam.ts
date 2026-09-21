'use client'

import { createClient } from '@/lib/supabase/client'
import { uniqueChannelName } from '@/lib/realtime'

export interface JamEntry {
  id: string
  title: string
  artist: string | null
  teamName: string | null
  votes: number
  status: string
}

interface JamRow {
  id: string
  title: string
  artist: string | null
  votes: number
  status: string
  team: { name: string } | { name: string }[] | null
}

function mapRow(row: JamRow): JamEntry {
  const team = Array.isArray(row.team) ? row.team[0] : row.team
  return { id: row.id, title: row.title, artist: row.artist, teamName: team?.name ?? null, votes: row.votes ?? 0, status: row.status }
}

export async function fetchJamQueue(): Promise<{ nowPlaying: JamEntry | null; upNext: JamEntry[] }> {
  const supabase = createClient()
  const { data } = await supabase
    .from('song_requests')
    .select('id, title, artist, votes, status, team:teams(name)')
    .order('votes', { ascending: false })

  const rows = (data ?? []).map((r) => mapRow(r as unknown as JamRow))
  const nowPlaying = rows.find((r) => r.status === 'now_playing') ?? null
  const upNext = rows.filter((r) => r.status === 'queued')
  return { nowPlaying, upNext }
}

export function subscribeToJamQueue(onChange: () => void): () => void {
  const supabase = createClient()
  const channel = supabase
    .channel(uniqueChannelName('jam-queue-sync'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'song_requests' }, onChange)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

export async function startNext() {
  const supabase = createClient()
  await supabase.from('song_requests').update({ status: 'done' }).eq('status', 'now_playing')
  const { data: next } = await supabase
    .from('song_requests')
    .select('id')
    .eq('status', 'queued')
    .order('votes', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (next) await supabase.from('song_requests').update({ status: 'now_playing' }).eq('id', next.id)
}

export async function pauseCurrent() {
  const supabase = createClient()
  await supabase.from('song_requests').update({ status: 'queued' }).eq('status', 'now_playing')
}

export async function removeFromQueue(id: string) {
  const supabase = createClient()
  await supabase.from('song_requests').delete().eq('id', id)
}
