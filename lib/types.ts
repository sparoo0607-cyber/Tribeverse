// lib/types.ts

export type UserRole ='student'|'admin'|'host'

export interface Profile {
  id: string
  full_name: string
  student_id?: string
  role: UserRole
  phone?: string
  branch?: string
  section?: string
  tag_issued?: boolean
  tag_issued_at?: string
  avatar_url?: string
  created_at: string
}

export interface TeamMemberCard {
  id: string
  slug?: string
  name: string
  teamIdBadge: string
  role: string
  branch: string
  college?: string
  location?: string
  phone?: string
  experience: string
  avatarUrl?: string | null
  backAvatarUrl?: string | null
  linkedinUrl?: string | null
  instagramUrl?: string | null
  category?: 'Lead' | 'Tech' | 'Operations' | 'Design' | 'Host' | 'Core' | string
}

export interface Team {
 id: string
 name: string
 team_number: number
 color: string
 total_score: number
 created_at: string
}

export interface TeamMember {
 id: string
 team_id: string
 user_id: string
 assigned_round?: number
 joined_at: string
 profile?: Profile
 team?: Team
}

export interface Event {
 id: string
 name: string
 edition: string
 event_date: string
 start_time: string
 status: 'upcoming'|'live'|'paused'|'ended'
 reveal_activated: boolean
 created_at: string
}

export interface Activity {
 id: string
 event_id: string
 name: string
 slug: string
 description?: string
 icon?: string
 order_index: number
 status: 'locked'|'live'|'completed'
 scheduled_start?: string
 scheduled_end?: string
 max_rounds: number
 created_at: string
 rounds?: Round[]
}

export interface Round {
 id: string
 activity_id: string
 round_number: number
 name: string
 slug: string
 description?: string
 icon?: string
 status: 'locked'|'live'|'completed'
 duration_seconds: number
 points_correct: number
 points_wrong: number
 created_at: string
 questions?: Question[]
}

export interface Question {
 id: string
 round_id: string
 question_text: string
 question_type: 'mcq'|'image_mcq'|'audio_mcq'|'canvas'|'reaction'|'memory'|'emoji'
 image_url?: string
 audio_url?: string
 options?: { label: string; text: string }[]
 correct_answer?: string
 points: number
 order_index: number
 active: boolean
}

export interface GameAttempt {
 id: string
 user_id: string
 team_id: string
 round_id: string
 question_id?: string
 answer_given?: string
 is_correct: boolean
 score_earned: number
 time_taken_ms?: number
 attempt_data?: Record<string, unknown>
 submitted_at: string
}

export interface Score {
 id: string
 team_id: string
 activity_id: string
 points: number
 updated_at: string
 team?: Team
 activity?: Activity
}

export interface LeaderboardEntry {
 team_id: string
 team_name: string
 team_number: number
 color: string
 total_points: number
 rank: number
}

export interface TribeWallPost {
 id: string
 user_id: string
 team_id?: string
 dream_text: string
 color: string
 rotation_deg: number
 created_at: string
 profile?: Profile
}

export interface JamRequest {
 id: string
 user_id: string
 team_id?: string
 instrument: string
 status: 'pending'|'approved'|'performing'|'done'|'rejected'
 requested_at: string
 approved_at?: string
 profile?: Profile
 team?: Team
}

export interface DetectiveRole {
 id: string
 round_id: string
 user_id: string
 secret_role: string
 round_number?: number
}

export interface ImpossibleSubmission {
 id: string
 team_id: string
 round_id: string
 problem_statement?: string
 solution_text?: string
 sketch_data?: Record<string, unknown>
 submitted_at: string
 judge_score: number
 judge_category?: string
 judged_by?: string
}

export interface ScoreAdjustment {
 id: string
 team_id: string
 activity_id?: string
 points_delta: number
 reason?: string
 adjusted_by?: string
 adjusted_at: string
}

export interface EventLog {
 id: string
 admin_id?: string
 action: string
 target_type?: string
 target_id?: string
 metadata?: Record<string, unknown>
 logged_at: string
}

// Dashboard context
export interface DashboardContext {
 profile: Profile
 team?: Team
 teamMembers: TeamMember[]
 membership?: TeamMember
 activities: Activity[]
 currentActivity?: Activity
 event: Event
}
