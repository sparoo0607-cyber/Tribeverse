'use client'

import { createClient } from '@/lib/supabase/client'
import { uniqueChannelName } from '@/lib/realtime'

export interface RevealedAnswer {
  title: string
  answer: string
  explanation: string
}

export interface StageResult {
  winnerName?: string
  winnerPoints?: number
  revealedAnswers?: RevealedAnswer[]
  customNote?: string
}

export interface StageState {
  id: string
  slug: string
  name: string
  icon: string
  status: 'locked' | 'live' | 'completed'
  result?: StageResult
}

export interface BroadcastNotification {
  id: string
  message: string
  type: 'info' | 'live' | 'winner' | 'alert'
  timestamp: string
}

// Curated fallback reveal content per stage, used whenever the admin
// concludes a stage without typing custom answers — so students always
// see something meaningful instead of a blank result.
export const STAGE_REVEAL_TEMPLATES: Record<string, { revealedAnswers: RevealedAnswer[]; customNote: string }> = {
  'talent-hunt': {
    revealedAnswers: [
      { title: 'Talent Showcase Spotlight', answer: 'Top Student Performers Recognized', explanation: 'Celebrating outstanding raw talent in singing, dance, rap, and creative expression.' },
      { title: 'Audience Vibe Meter', answer: 'Peak Freshers Energy', explanation: 'Highest engagement and audience cheer score recorded.' },
    ],
    customNote: 'Talent Hunt concluded! Congratulations to all performers.',
  },
  playground: {
    revealedAnswers: [
      { title: 'Round 1: Quick Eyes', answer: 'Target Pattern #4', explanation: 'Pattern 4 was the only asymmetrical symbol in the matrix.' },
      { title: 'Round 2: Quick Draw', answer: 'Visual Recognition', explanation: 'Speed and team clue synchronization.' },
      { title: 'Round 3: Think Fast', answer: 'Tribe Protocol 2026', explanation: 'The official keyword decoded from the binary clue.' },
      { title: 'Round 4: Sound Check', answer: 'Track Rhythm Clue', explanation: 'Recognized within 3 seconds.' },
      { title: 'Round 5: Memory Chain', answer: 'Longest Chain Recalled', explanation: 'Most items reproduced in the exact order.' },
    ],
    customNote: 'Tribe Playground (Part 1) concluded!',
  },
  lunch: {
    revealedAnswers: [
      { title: 'Campus Food Battle Winner', answer: 'Paradise Biryani (42% Votes)', explanation: 'Winner of the Freshers Lunch Choice Poll.' },
    ],
    customNote: 'Lunch break completed! Food poll concluded.',
  },
  'playground-continuous': {
    revealedAnswers: [
      { title: 'Tribe Playground Final Standings', answer: 'All 20 Teams Completed', explanation: 'All 5 abilities scored and verified across teams.' },
    ],
    customNote: 'Tribe Playground Continuous concluded! Points added to team scores.',
  },
  arcade: {
    revealedAnswers: [
      { title: 'Speed Tapper Record', answer: '84 Taps in 10 Seconds', explanation: 'Logged during the arcade session.' },
      { title: 'Color Match Frenzy', answer: '18 Streak without Error', explanation: 'Flawless Stroop ink color recognition.' },
      { title: 'Math Blitz High Score', answer: '24 Arithmetic Correct in 30s', explanation: 'Fastest mental math score.' },
    ],
    customNote: 'Arcade showdown completed with record high scores across all stations.',
  },
  impossible: {
    revealedAnswers: [
      { title: 'Puzzle 1: Bat & Ball Cost ($1.10)', answer: '5 Cents (Not 10 cents!)', explanation: 'Bat is $1.05, Ball is $0.05. Total = $1.10, Bat is $1.00 more than ball.' },
      { title: 'Puzzle 2: 100 Machines 100 Widgets', answer: '5 Minutes (Not 100 minutes!)', explanation: 'Each machine takes 5 minutes to produce 1 widget.' },
      { title: 'Puzzle 3: Lily Pad Doubling in 48 Days', answer: 'Day 47 (Not Day 24!)', explanation: 'Since it doubles every day, on day 47 it covered exactly half the lake.' },
    ],
    customNote: 'The Impossible Challenge concluded!',
  },
  jam: {
    revealedAnswers: [
      { title: 'Live Keyboard & Instrumental Jam', answer: 'Chords, Harmonies & Lead Keys', explanation: 'Live keyboard playing leading spontaneous jams.' },
      { title: 'Singing, Rap & Beatbox', answer: 'Vocal Expression & Microphones', explanation: 'Singing, rap, beatboxing, and crowd harmonizing.' },
      { title: 'Dance & Pure Jam Vibe', answer: 'Freestyle Movement & Energy', explanation: 'Spontaneous dancing, rhythm, and authentic Tribe vibes.' },
    ],
    customNote: 'Tribe Jam stage concluded with electric keyboard sets, singing, dance, and pure vibes!',
  },
  wall: {
    revealedAnswers: [
      { title: 'Top Voted Ambition', answer: 'Most-liked dream on the Tribe Wall', explanation: 'Chosen by fellow participants.' },
    ],
    customNote: 'All participant dreams are permanently immortalized on the Tribe Wall.',
  },
  reveal: {
    revealedAnswers: [
      { title: 'Grand Champions', answer: 'See the Leaderboard', explanation: 'Final standings frozen at the Grand Finale.' },
    ],
    customNote: 'TRIBEVERSE V1 concluded. The Tribe is born!',
  },
}

interface ActivityRow {
  id: string
  slug: string
  name: string
  icon: string | null
  status: 'locked' | 'live' | 'completed'
  winner_points: number | null
  revealed_answers: RevealedAnswer[] | null
  custom_note: string | null
  winner: { full_name: string } | { full_name: string }[] | null
}

function mapActivityRow(row: ActivityRow): StageState {
  const winnerRel = Array.isArray(row.winner) ? row.winner[0] : row.winner
  const template = STAGE_REVEAL_TEMPLATES[row.slug]
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon ?? '',
    status: row.status,
    result: row.status === 'completed'
      ? {
        winnerName: winnerRel?.full_name,
        winnerPoints: row.winner_points ?? undefined,
        revealedAnswers: row.revealed_answers ?? template?.revealedAnswers,
        customNote: row.custom_note ?? template?.customNote,
      }
      : undefined,
  }
}

// Read the current lock/live/completed state + reveal content for every stage.
export async function fetchStageStates(): Promise<Record<string, StageState>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('activities')
    .select('id, slug, name, icon, status, winner_points, revealed_answers, custom_note, winner:profiles!activities_winner_user_id_fkey(full_name)')
    .order('order_index')

  if (error || !data) return {}

  const out: Record<string, StageState> = {}
  for (const row of data as unknown as ActivityRow[]) {
    out[row.slug] = mapActivityRow(row)
  }
  return out
}

// Subscribe to live cross-device changes on any stage. Returns an unsubscribe function.
export function subscribeToStageChanges(onChange: () => void): () => void {
  const supabase = createClient()
  const channel = supabase
    .channel(uniqueChannelName('activities-sync'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, onChange)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

// Admin: lock / go-live / conclude a stage for every connected device.
export async function setStageStatus(slug: string, status: 'locked' | 'live' | 'completed') {
  const supabase = createClient()
  await supabase.from('activities').update({ status }).eq('slug', slug)
}

// Admin: conclude a stage, award the winning participant, and reveal official answers to all students.
export async function revealStageWinner(
  slug: string,
  userId: string,
  points: number,
  overrides?: Partial<Pick<StageResult, 'revealedAnswers' | 'customNote'>>
) {
  const supabase = createClient()
  const template = STAGE_REVEAL_TEMPLATES[slug]

  await supabase
    .from('activities')
    .update({
      status: 'completed',
      winner_user_id: userId,
      winner_points: points,
      revealed_answers: overrides?.revealedAnswers ?? template?.revealedAnswers ?? null,
      custom_note: overrides?.customNote ?? template?.customNote ?? null,
    })
    .eq('slug', slug)

  await supabase.rpc('add_user_points', { p_user_id: userId, p_points: points })
}

// Read the most recent flash alert (so late joiners still see it).
export async function fetchLatestBroadcast(): Promise<BroadcastNotification | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('broadcasts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return null
  return {
    id: data.id,
    message: data.message,
    type: data.type,
    timestamp: new Date(data.created_at).toLocaleTimeString(),
  }
}

// Subscribe to newly pushed flash alerts across every device.
export function subscribeToBroadcasts(onNew: (b: BroadcastNotification) => void): () => void {
  const supabase = createClient()
  const channel = supabase
    .channel(uniqueChannelName('broadcasts-sync'))
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'broadcasts' },
      (payload) => {
        const row = payload.new as { id: string; message: string; type: BroadcastNotification['type']; created_at: string }
        onNew({
          id: row.id,
          message: row.message,
          type: row.type,
          timestamp: new Date(row.created_at).toLocaleTimeString(),
        })
      }
    )
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

// Admin: push a flash alert banner to every student screen.
export async function pushBroadcast(message: string, type: BroadcastNotification['type'] = 'info') {
  const supabase = createClient()
  await supabase.from('broadcasts').insert({ message, type })
}

// Host (Event Flow runner): read the live event row (id + current step).
// The projector position is stored as one number: screen index * 10 + phase
// (phase = Show Image / Show Question / Show Answer / Start Timer ... within a screen).
export async function fetchEventFlow(): Promise<{ id: string; currentStep: number; phase: number } | null> {
  const supabase = createClient()
  const { data } = await supabase.from('events').select('id, current_step').order('created_at').limit(1).maybeSingle()
  if (!data) return null
  const raw: number = data.current_step ?? 0
  return { id: data.id, currentStep: Math.floor(raw / 10), phase: raw % 10 }
}

// Host: advance/rewind the Event Flow for every synced screen.
export async function setEventFlowStep(eventId: string, step: number, phase = 0) {
  const supabase = createClient()
  await supabase.from('events').update({ current_step: step * 10 + phase }).eq('id', eventId)
}

// Subscribe to live cross-device changes on the event row (flow step, status).
export function subscribeToEventChanges(onChange: () => void): () => void {
  const supabase = createClient()
  const channel = supabase
    .channel(uniqueChannelName('event-flow-sync'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, onChange)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}
