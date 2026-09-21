'use client'

import { createClient } from '@/lib/supabase/client'
import { uniqueChannelName } from '@/lib/realtime'

export interface RevealedAnswer {
 title: string
 answer: string
 explanation: string
}

export interface StageResult {
 winningTeam?: string
 winnerPoints?: number
 revealedAnswers?: RevealedAnswer[]
 customNote?: string
}

export interface StageState {
 id: string
 slug: string
 name: string
 icon: string
 status: 'locked'|'live'|'completed'
 result?: StageResult
}

export interface BroadcastNotification {
 id: string
 message: string
 type: 'info'|'live'|'winner'|'alert'
 timestamp: string
}

// Curated fallback reveal content per stage, used whenever the admin
// concludes a stage without typing custom answers — so students always
// see something meaningful instead of a blank result.
export const STAGE_REVEAL_TEMPLATES: Record<string, { revealedAnswers: RevealedAnswer[]; customNote: string }>= {
 playground: {
 revealedAnswers: [
 { title: 'Round 1: Quick Eyes', answer: 'Target Pattern #4', explanation: 'Pattern 4 was the only asymmetrical symbol in the matrix.'},
 { title: 'Round 3: Think Fast', answer: 'Tribe Protocol 2026', explanation: 'The official keyword decoded from the binary clue.'},
 { title: 'Round 5: Reaction Time', answer: '184ms', explanation: 'Fastest reaction score logged during the round.'},
 ],
 customNote: 'Stage 01 Playground concluded!',
 },
 detective: {
 revealedAnswers: [
 { title: 'Clue #1 (Origin Stone)', answer: 'IBER-CLYAR-01', explanation: 'Rot-13 shifted back 13 positions.'},
 { title: 'Clue #2 (Binary Beacon)', answer: 'TRIBE', explanation: '8-bit ASCII binary sequence converted to text.'},
 { title: 'Clue #3 (Cafeteria Cryptogram)', answer: 'WELCOME TO THE TRIBEVERSE', explanation: 'Caesar cipher with -3 shift.'},
 ],
 customNote: 'All 3 campus riddles cracked! Checkpoint evidence verified by Admin.',
 },
 lunch: {
 revealedAnswers: [
 { title: 'Campus Food Battle Winner', answer: 'Paradise Biryani (42% Votes)', explanation: 'Winner of the Freshers Lunch Choice Poll.'},
 ],
 customNote: 'Lunch break completed! Food poll concluded.',
 },
 arcade: {
 revealedAnswers: [
 { title: 'Speed Tapper Record', answer: '84 Taps in 10 Seconds', explanation: 'Logged during the arcade session.'},
 { title: 'Color Match Frenzy', answer: '18 Streak without Error', explanation: 'Flawless Stroop ink color recognition.'},
 { title: 'Math Blitz High Score', answer: '24 Arithmetic Correct in 30s', explanation: 'Fastest mental math score.'},
 ],
 customNote: 'Arcade showdown completed with record high scores across all 3 stations.',
 },
 impossible: {
 revealedAnswers: [
 { title: 'Puzzle 1: Bat & Ball Cost ($1.10)', answer: '5 Cents (Not 10 cents!)', explanation: 'Bat is $1.05, Ball is $0.05. Total = $1.10, Bat is $1.00 more than ball.'},
 { title: 'Puzzle 2: 100 Machines 100 Widgets', answer: '5 Minutes (Not 100 minutes!)', explanation: 'Each machine takes 5 minutes to produce 1 widget.'},
 { title: 'Puzzle 3: Lily Pad Doubling in 48 Days', answer: 'Day 47 (Not Day 24!)', explanation: 'Since it doubles every day, on day 47 it covered exactly half the lake.'},
 ],
 customNote: 'The Impossible Challenge concluded!',
 },
 jam: {
 revealedAnswers: [
 { title: 'Performance Round', answer: 'Sing, rap, beatbox, hum', explanation: 'Any expression of music counted towards the score.' },
 { title: 'Team Vibe Energy', answer: 'Maximum Audience & Team Resonance', explanation: 'Team musical energy combined for top vibe rating.' },
 { title: 'Tribe Language', answer: 'Authentic Expression', explanation: 'Passion, rhythm, and authentic self over perfect pitch.' },
 ],
 customNote: 'Tribe Jam stage concluded with electric performances and pure vibes!',
 },
 wall: {
 revealedAnswers: [
 { title: 'Top Voted Ambition', answer: 'Most-liked dream on the Tribe Wall', explanation: 'Chosen by fellow participants.'},
 ],
 customNote: 'All participant dreams are permanently immortalized on the Tribe Wall.',
 },
 reveal: {
 revealedAnswers: [
 { title: 'Grand Champions', answer: 'See the Leaderboard', explanation: 'Final standings frozen at the Grand Finale.'},
 ],
 customNote: 'TRIBEVERSE V1 concluded. The Tribe is born!',
 },
}

interface ActivityRow {
 id: string
 slug: string
 name: string
 icon: string | null
 status: 'locked'|'live'|'completed'
 winner_points: number | null
 revealed_answers: RevealedAnswer[] | null
 custom_note: string | null
 winner_team: { name: string } | { name: string }[] | null
}

function mapActivityRow(row: ActivityRow): StageState {
 const winnerTeamRel = Array.isArray(row.winner_team) ? row.winner_team[0] : row.winner_team
 const template = STAGE_REVEAL_TEMPLATES[row.slug]
 return {
 id: row.id,
 slug: row.slug,
 name: row.name,
 icon: row.icon ?? '',
 status: row.status,
 result: row.status ==='completed'
 ? {
 winningTeam: winnerTeamRel?.name,
 winnerPoints: row.winner_points ?? undefined,
 revealedAnswers: row.revealed_answers ?? template?.revealedAnswers,
 customNote: row.custom_note ?? template?.customNote,
 }
 : undefined,
 }
}

// Read the current lock/live/completed state + reveal content for every stage.
export async function fetchStageStates(): Promise<Record<string, StageState>>{
 const supabase = createClient()
 const { data, error } = await supabase
 .from('activities')
 .select('id, slug, name, icon, status, winner_points, revealed_answers, custom_note, winner_team:teams!activities_winner_team_id_fkey(name)')
 .order('order_index')

 if (error || !data) return {}

 const out: Record<string, StageState>= {}
 for (const row of data as unknown as ActivityRow[]) {
 out[row.slug] = mapActivityRow(row)
 }
 return out
}

// Subscribe to live cross-device changes on any stage. Returns an unsubscribe function.
export function subscribeToStageChanges(onChange: () =>void): () =>void {
 const supabase = createClient()
 const channel = supabase
 .channel(uniqueChannelName('activities-sync'))
 .on('postgres_changes', { event: '*', schema: 'public', table: 'activities'}, onChange)
 .subscribe()
 return () =>{ supabase.removeChannel(channel) }
}

// Admin: lock / go-live / conclude a stage for every connected device.
export async function setStageStatus(slug: string, status: 'locked'|'live'|'completed') {
 const supabase = createClient()
 await supabase.from('activities').update({ status }).eq('slug', slug)
}

// Admin: conclude a stage, award the winning team, and reveal official answers to all students.
export async function revealStageWinner(
 slug: string,
 teamId: string,
 points: number,
 overrides?: Partial<Pick<StageResult, 'revealedAnswers'|'customNote'>>
) {
 const supabase = createClient()
 const template = STAGE_REVEAL_TEMPLATES[slug]

 await supabase
 .from('activities')
 .update({
 status: 'completed',
 winner_team_id: teamId,
 winner_points: points,
 revealed_answers: overrides?.revealedAnswers ?? template?.revealedAnswers ?? null,
 custom_note: overrides?.customNote ?? template?.customNote ?? null,
 })
 .eq('slug', slug)

 const { data: team } = await supabase.from('teams').select('total_score').eq('id', teamId).single()
 if (team) {
 await supabase.from('teams').update({ total_score: (team.total_score ?? 0) + points }).eq('id', teamId)
 }
}

// Read the most recent flash alert (so late joiners still see it).
export async function fetchLatestBroadcast(): Promise<BroadcastNotification | null>{
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
export function subscribeToBroadcasts(onNew: (b: BroadcastNotification) =>void): () =>void {
 const supabase = createClient()
 const channel = supabase
 .channel(uniqueChannelName('broadcasts-sync'))
 .on(
'postgres_changes',
 { event: 'INSERT', schema: 'public', table: 'broadcasts'},
 (payload) =>{
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
 return () =>{ supabase.removeChannel(channel) }
}

// Admin: push a flash alert banner to every student screen.
export async function pushBroadcast(message: string, type: BroadcastNotification['type'] ='info') {
 const supabase = createClient()
 await supabase.from('broadcasts').insert({ message, type })
}

// Host (Event Flow runner): read the live event row (id + current step).
export async function fetchEventFlow(): Promise<{ id: string; currentStep: number } | null> {
 const supabase = createClient()
 const { data } = await supabase.from('events').select('id, current_step').order('created_at').limit(1).maybeSingle()
 if (!data) return null
 return { id: data.id, currentStep: data.current_step ?? 0 }
}

// Host: advance/rewind the Event Flow for every synced screen.
export async function setEventFlowStep(eventId: string, step: number) {
 const supabase = createClient()
 await supabase.from('events').update({ current_step: step }).eq('id', eventId)
}

// Subscribe to live cross-device changes on the event row (flow step, status).
export function subscribeToEventChanges(onChange: () =>void): () =>void {
 const supabase = createClient()
 const channel = supabase
 .channel(uniqueChannelName('event-flow-sync'))
 .on('postgres_changes', { event: '*', schema: 'public', table: 'events'}, onChange)
 .subscribe()
 return () =>{ supabase.removeChannel(channel) }
}
