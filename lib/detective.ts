'use client'

import { createClient } from '@/lib/supabase/client'
import { uniqueChannelName } from '@/lib/realtime'

export type DetectivePhase = 'idle' | 'scenario' | 'guessing_open' | 'guessing_closed' | 'revealed'

export interface DetectiveRound {
  id: string
  roundNumber: number
  name: string
  slug: string
  icon: string
  description: string | null
  scenarioText: string | null
  rolePool: string[]
  status: 'locked' | 'live' | 'completed'
  phase: DetectivePhase
  pointsPerCorrect: number
}

export interface Teammate {
  userId: string
  fullName: string
}

export interface GuessResult {
  targetUserId: string
  guessedRole: string
  isCorrect: boolean | null
  pointsAwarded: number
}

interface RoundRow {
  id: string
  round_number: number
  name: string
  slug: string
  icon: string | null
  description: string | null
  scenario_text: string | null
  role_pool: unknown
  status: 'locked' | 'live' | 'completed'
  phase: string | null
  points_per_correct: number | null
}

interface ProfileJoinRow {
  user_id: string
  team_id?: string
  profile: { full_name: string } | { full_name: string }[] | null
}

function mapRound(row: RoundRow): DetectiveRound {
  return {
    id: row.id,
    roundNumber: row.round_number,
    name: row.name,
    slug: row.slug,
    icon: row.icon ?? '',
    description: row.description,
    scenarioText: row.scenario_text,
    rolePool: Array.isArray(row.role_pool) ? (row.role_pool as string[]) : [],
    status: row.status,
    phase: (row.phase ?? 'idle') as DetectivePhase,
    pointsPerCorrect: row.points_per_correct ?? 100,
  }
}

const ROUND_COLUMNS = 'id, round_number, name, slug, icon, description, scenario_text, role_pool, status, phase, points_per_correct'

export async function fetchDetectiveRounds(): Promise<DetectiveRound[]> {
  const supabase = createClient()
  const { data: activity } = await supabase.from('activities').select('id').eq('slug', 'detective').single()
  if (!activity) return []
  const { data } = await supabase
    .from('rounds')
    .select(ROUND_COLUMNS)
    .eq('activity_id', activity.id)
    .order('round_number')
  return (data ?? []).map(mapRound)
}

export async function fetchLiveDetectiveRound(): Promise<DetectiveRound | null> {
  const rounds = await fetchDetectiveRounds()
  return rounds.find((r) => r.status === 'live') ?? null
}

export function subscribeToDetectiveRounds(onChange: () => void): () => void {
  const supabase = createClient()
  const channel = supabase
    .channel(uniqueChannelName('detective-rounds-sync'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rounds' }, onChange)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

// ---- Student ----

export async function fetchTeammates(teamId: string, excludeUserId: string): Promise<Teammate[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('team_members')
    .select('user_id, profile:profiles(full_name)')
    .eq('team_id', teamId)
    .neq('user_id', excludeUserId)

  return ((data ?? []) as ProfileJoinRow[]).map((row) => {
    const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile
    return { userId: row.user_id, fullName: profile?.full_name ?? 'Teammate' }
  })
}

export async function fetchMySecretRole(roundId: string, userId: string): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('detective_assignments')
    .select('secret_role')
    .eq('round_id', roundId)
    .eq('user_id', userId)
    .maybeSingle()
  return data?.secret_role ?? null
}

export async function fetchMyGuesses(roundId: string, guesserUserId: string): Promise<Record<string, GuessResult>> {
  const supabase = createClient()
  const { data } = await supabase
    .from('detective_guesses')
    .select('target_user_id, guessed_role, is_correct, points_awarded')
    .eq('round_id', roundId)
    .eq('guesser_user_id', guesserUserId)

  const out: Record<string, GuessResult> = {}
  for (const row of data ?? []) {
    out[row.target_user_id] = {
      targetUserId: row.target_user_id,
      guessedRole: row.guessed_role,
      isCorrect: row.is_correct,
      pointsAwarded: row.points_awarded ?? 0,
    }
  }
  return out
}

export async function submitGuess(params: {
  roundId: string
  guesserUserId: string
  targetUserId: string
  teamId: string
  guessedRole: string
}) {
  const supabase = createClient()
  await supabase.from('detective_guesses').upsert(
    {
      round_id: params.roundId,
      guesser_user_id: params.guesserUserId,
      target_user_id: params.targetUserId,
      team_id: params.teamId,
      guessed_role: params.guessedRole,
    },
    { onConflict: 'round_id,guesser_user_id,target_user_id' }
  )
}

export function subscribeToMyGuesses(roundId: string, guesserUserId: string, onChange: () => void): () => void {
  const supabase = createClient()
  const channel = supabase
    .channel(uniqueChannelName(`detective-guesses-${roundId}-${guesserUserId}`))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'detective_guesses', filter: `guesser_user_id=eq.${guesserUserId}` }, onChange)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

// ---- Event Control (admin) ----

export interface TeamWithMembers {
  teamId: string
  teamName: string
  members: Teammate[]
}

export async function fetchTeamsWithMembers(): Promise<TeamWithMembers[]> {
  const supabase = createClient()
  const { data: teams } = await supabase.from('teams').select('id, name, team_number').order('team_number')
  const { data: members } = await supabase.from('team_members').select('user_id, team_id, profile:profiles(full_name)')

  return (teams ?? []).map((t) => ({
    teamId: t.id,
    teamName: `${t.name} (#${String(t.team_number).padStart(2, '0')})`,
    members: ((members ?? []) as ProfileJoinRow[])
      .filter((m) => m.team_id === t.id)
      .map((m) => {
        const profile = Array.isArray(m.profile) ? m.profile[0] : m.profile
        return { userId: m.user_id, fullName: profile?.full_name ?? 'Participant' }
      }),
  }))
}

export async function fetchAssignmentsForRound(roundId: string): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data } = await supabase.from('detective_assignments').select('user_id, secret_role').eq('round_id', roundId)
  return Object.fromEntries((data ?? []).map((r) => [r.user_id, r.secret_role]))
}

export async function assignRole(roundId: string, userId: string, teamId: string, secretRole: string) {
  const supabase = createClient()
  await supabase.from('detective_assignments').upsert(
    { round_id: roundId, user_id: userId, team_id: teamId, secret_role: secretRole },
    { onConflict: 'round_id,user_id' }
  )
}

export async function updateRoundContent(roundId: string, rolePool: string[], scenarioText: string) {
  const supabase = createClient()
  await supabase.from('rounds').update({ role_pool: rolePool, scenario_text: scenarioText }).eq('id', roundId)
}

export async function setDetectivePhase(roundId: string, phase: DetectivePhase, status?: 'locked' | 'live' | 'completed') {
  const supabase = createClient()
  await supabase.from('rounds').update({ phase, ...(status ? { status } : {}) }).eq('id', roundId)
}

export async function startDetectiveRound(roundId: string) {
  const supabase = createClient()
  await supabase.from('detective_guesses').delete().eq('round_id', roundId)
  await supabase.from('rounds').update({ status: 'live', phase: 'scenario' }).eq('id', roundId)
}

export function subscribeToDetectiveGuesses(roundId: string, onChange: () => void): () => void {
  const supabase = createClient()
  const channel = supabase
    .channel(uniqueChannelName(`detective-guesses-progress-${roundId}`))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'detective_guesses', filter: `round_id=eq.${roundId}` }, onChange)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

export async function fetchGuessProgress(roundId: string): Promise<{ submitted: number; expected: number }> {
  const supabase = createClient()
  const { count: submitted } = await supabase
    .from('detective_guesses')
    .select('*', { count: 'exact', head: true })
    .eq('round_id', roundId)

  const { data: members } = await supabase.from('team_members').select('team_id')
  const teamSizes: Record<string, number> = {}
  for (const m of members ?? []) teamSizes[m.team_id] = (teamSizes[m.team_id] ?? 0) + 1
  const expected = Object.values(teamSizes).reduce((sum, size) => sum + size * Math.max(0, size - 1), 0)

  return { submitted: submitted ?? 0, expected }
}

// Score every guess against the real assignment, award team points, and
// flip the round to revealed/completed.
export async function revealDetectiveRound(roundId: string) {
  const supabase = createClient()

  const { data: round } = await supabase.from('rounds').select('points_per_correct').eq('id', roundId).single()
  const pointsPerCorrect = round?.points_per_correct ?? 100

  const { data: assignments } = await supabase.from('detective_assignments').select('user_id, secret_role').eq('round_id', roundId)
  const roleByUser = Object.fromEntries((assignments ?? []).map((a) => [a.user_id, a.secret_role]))

  const { data: guesses } = await supabase.from('detective_guesses').select('id, target_user_id, guessed_role, team_id').eq('round_id', roundId)

  const teamPoints: Record<string, number> = {}
  for (const g of guesses ?? []) {
    const actual = roleByUser[g.target_user_id]
    const isCorrect = !!actual && actual === g.guessed_role
    const pointsAwarded = isCorrect ? pointsPerCorrect : 0
    await supabase.from('detective_guesses').update({ is_correct: isCorrect, points_awarded: pointsAwarded }).eq('id', g.id)
    if (isCorrect) teamPoints[g.team_id] = (teamPoints[g.team_id] ?? 0) + pointsAwarded
  }

  for (const [teamId, pts] of Object.entries(teamPoints)) {
    const { data: team } = await supabase.from('teams').select('total_score').eq('id', teamId).single()
    if (team) await supabase.from('teams').update({ total_score: (team.total_score ?? 0) + pts }).eq('id', teamId)
  }

  await supabase.from('rounds').update({ phase: 'revealed', status: 'completed' }).eq('id', roundId)
}

export async function resetDetectiveRound(roundId: string) {
  const supabase = createClient()
  await supabase.from('detective_guesses').delete().eq('round_id', roundId)
  await supabase.from('rounds').update({ status: 'locked', phase: 'idle' }).eq('id', roundId)
}
