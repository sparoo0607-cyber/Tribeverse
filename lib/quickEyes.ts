'use client'

import { createClient } from '@/lib/supabase/client'
import { uniqueChannelName } from '@/lib/realtime'

export type QEPhase = 'idle' | 'visual' | 'timer' | 'question' | 'closed' | 'revealed'

export interface QEQuestion {
  id: string
  question_text: string
  options: { label: string; text: string }[]
  correct_option: string
  points: number
  time_limit_seconds: number
  image_url: string | null
}

export interface QEAttempt {
  id: string
  user_id: string
  selected_option: string
  is_correct: boolean
  time_taken_ms: number | null
  submitted_at: string
  full_name: string
}

export interface QERoundState {
  roundId: string
  status: 'locked' | 'live' | 'completed'
  phase: QEPhase
  phaseStartedAt: string | null
  durationSeconds: number
  question: QEQuestion | null
  winnerUserId: string | null
  winnerName: string | null
}

async function getRoundRow() {
  const supabase = createClient()
  const { data: activity } = await supabase.from('activities').select('id').eq('slug', 'playground').single()
  if (!activity) return null
  const { data: round } = await supabase
    .from('rounds')
    .select('id, status, phase, phase_started_at, duration_seconds, winner_user_id, winner:profiles!rounds_winner_user_id_fkey(full_name)')
    .eq('activity_id', activity.id)
    .eq('slug', 'quick-eyes')
    .maybeSingle()
  return round
}

export async function fetchQuickEyesState(): Promise<QERoundState | null> {
  const supabase = createClient()
  const round = await getRoundRow()
  if (!round) return null

  const { data: question } = await supabase
    .from('questions')
    .select('id, question_text, options, correct_option, points, time_limit_seconds, image_url')
    .eq('round_id', round.id)
    .order('order_index')
    .limit(1)
    .maybeSingle()

  const winner = Array.isArray(round.winner) ? round.winner[0] : round.winner

  return {
    roundId: round.id,
    status: round.status,
    phase: (round.phase ?? 'idle') as QEPhase,
    phaseStartedAt: round.phase_started_at,
    durationSeconds: question?.time_limit_seconds ?? round.duration_seconds ?? 15,
    question: question ?? null,
    winnerUserId: round.winner_user_id,
    winnerName: winner?.full_name ?? null,
  }
}

export function subscribeToQuickEyesRound(onChange: () => void): () => void {
  const supabase = createClient()
  const channel = supabase
    .channel(uniqueChannelName('quick-eyes-round-sync'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rounds' }, onChange)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

export async function fetchAttempts(roundId: string): Promise<QEAttempt[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('player_attempts')
    .select('id, user_id, selected_option, is_correct, time_taken_ms, submitted_at, profile:profiles(full_name)')
    .eq('round_id', roundId)
    .order('submitted_at')

  return (data ?? []).map((row: any) => {
    const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile
    return {
      id: row.id,
      user_id: row.user_id,
      selected_option: row.selected_option,
      is_correct: row.is_correct,
      time_taken_ms: row.time_taken_ms,
      submitted_at: row.submitted_at,
      full_name: profile?.full_name ?? 'Unknown',
    }
  })
}

export async function fetchMyAttempt(roundId: string, userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('player_attempts')
    .select('selected_option, is_correct')
    .eq('round_id', roundId)
    .eq('user_id', userId)
    .maybeSingle()
  return data
}

export function subscribeToQuickEyesAttempts(roundId: string, onChange: () => void): () => void {
  const supabase = createClient()
  const channel = supabase
    .channel(uniqueChannelName(`quick-eyes-attempts-${roundId}`))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'player_attempts', filter: `round_id=eq.${roundId}` }, onChange)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

// ---- Admin actions ----

export async function startVisual(roundId: string) {
  const supabase = createClient()
  await supabase.from('rounds').update({
    status: 'live',
    phase: 'visual',
    phase_started_at: new Date().toISOString(),
    winner_user_id: null,
  }).eq('id', roundId)
  await supabase.from('player_attempts').delete().eq('round_id', roundId)
}

export async function startTimer(roundId: string) {
  const supabase = createClient()
  await supabase.from('rounds').update({
    phase: 'timer',
    phase_started_at: new Date().toISOString(),
  }).eq('id', roundId)
}

export async function showQuestion(roundId: string) {
  const supabase = createClient()
  await supabase.from('rounds').update({ phase: 'question' }).eq('id', roundId)
}

export async function closeAnswers(roundId: string) {
  const supabase = createClient()
  await supabase.from('rounds').update({ phase: 'closed' }).eq('id', roundId)
}

export async function revealResult(roundId: string) {
  const supabase = createClient()

  const { data: fastestCorrect } = await supabase
    .from('player_attempts')
    .select('user_id, points_awarded')
    .eq('round_id', roundId)
    .eq('is_correct', true)
    .order('time_taken_ms', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (fastestCorrect) {
    await supabase.rpc('add_user_points', { p_user_id: fastestCorrect.user_id, p_points: fastestCorrect.points_awarded ?? 0 })
  }

  await supabase.from('rounds').update({
    phase: 'revealed',
    status: 'completed',
    winner_user_id: fastestCorrect?.user_id ?? null,
  }).eq('id', roundId)
}

export async function resetRound(roundId: string) {
  const supabase = createClient()
  await supabase.from('rounds').update({
    status: 'locked',
    phase: 'idle',
    phase_started_at: null,
    winner_user_id: null,
  }).eq('id', roundId)
  await supabase.from('player_attempts').delete().eq('round_id', roundId)
}

// ---- Student action ----

export async function submitAnswer(params: {
  roundId: string
  questionId: string
  userId: string
  selectedOption: string
  correctOption: string
  points: number
  timeTakenMs: number
}) {
  const supabase = createClient()
  const isCorrect = params.selectedOption === params.correctOption
  await supabase.from('player_attempts').insert({
    round_id: params.roundId,
    question_id: params.questionId,
    user_id: params.userId,
    selected_option: params.selectedOption,
    is_correct: isCorrect,
    points_awarded: isCorrect ? params.points : 0,
    time_taken_ms: params.timeTakenMs,
  })
  return isCorrect
}
