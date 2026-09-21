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
  team_id: string
  selected_option: string
  is_correct: boolean
  time_taken_ms: number | null
  submitted_at: string
  team_name: string
  full_name: string
}

export interface QERoundState {
  roundId: string
  status: 'locked' | 'live' | 'completed'
  phase: QEPhase
  phaseStartedAt: string | null
  durationSeconds: number
  question: QEQuestion | null
  winnerTeamId: string | null
  winnerTeamName: string | null
}

async function getRoundRow() {
  const supabase = createClient()
  const { data: activity } = await supabase.from('activities').select('id').eq('slug', 'playground').single()
  if (!activity) return null
  const { data: round } = await supabase
    .from('rounds')
    .select('id, status, phase, phase_started_at, duration_seconds, winner_team_id, winner_team:teams!rounds_winner_team_id_fkey(name)')
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

  const winnerTeam = Array.isArray(round.winner_team) ? round.winner_team[0] : round.winner_team

  return {
    roundId: round.id,
    status: round.status,
    phase: (round.phase ?? 'idle') as QEPhase,
    phaseStartedAt: round.phase_started_at,
    durationSeconds: question?.time_limit_seconds ?? round.duration_seconds ?? 15,
    question: question ?? null,
    winnerTeamId: round.winner_team_id,
    winnerTeamName: winnerTeam?.name ?? null,
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
    .select('id, user_id, team_id, selected_option, is_correct, time_taken_ms, submitted_at, team:teams(name), profile:profiles(full_name)')
    .eq('round_id', roundId)
    .order('submitted_at')

  return (data ?? []).map((row: any) => {
    const team = Array.isArray(row.team) ? row.team[0] : row.team
    const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile
    return {
      id: row.id,
      user_id: row.user_id,
      team_id: row.team_id,
      selected_option: row.selected_option,
      is_correct: row.is_correct,
      time_taken_ms: row.time_taken_ms,
      submitted_at: row.submitted_at,
      team_name: team?.name ?? 'Unknown Team',
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
    winner_team_id: null,
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
    .select('team_id, points_awarded')
    .eq('round_id', roundId)
    .eq('is_correct', true)
    .order('time_taken_ms', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (fastestCorrect) {
    const { data: team } = await supabase.from('teams').select('total_score').eq('id', fastestCorrect.team_id).single()
    if (team) {
      await supabase.from('teams').update({ total_score: (team.total_score ?? 0) + (fastestCorrect.points_awarded ?? 0) }).eq('id', fastestCorrect.team_id)
    }
  }

  await supabase.from('rounds').update({
    phase: 'revealed',
    status: 'completed',
    winner_team_id: fastestCorrect?.team_id ?? null,
  }).eq('id', roundId)
}

export async function resetRound(roundId: string) {
  const supabase = createClient()
  await supabase.from('rounds').update({
    status: 'locked',
    phase: 'idle',
    phase_started_at: null,
    winner_team_id: null,
  }).eq('id', roundId)
  await supabase.from('player_attempts').delete().eq('round_id', roundId)
}

// ---- Student action ----

export async function submitAnswer(params: {
  roundId: string
  questionId: string
  userId: string
  teamId: string
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
    team_id: params.teamId,
    selected_option: params.selectedOption,
    is_correct: isCorrect,
    points_awarded: isCorrect ? params.points : 0,
    time_taken_ms: params.timeTakenMs,
  })
  return isCorrect
}
