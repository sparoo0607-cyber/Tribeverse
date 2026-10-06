export const AMBASSADOR_SKILLS = [
  'Communication',
  'Event Management',
  'Marketing',
  'Design',
  'Photography / Videography',
  'Social Media',
  'Public Speaking',
  'Technical',
] as const

export const AMBASSADOR_DEPARTMENTS = [
  'CSE', 'AI & ML / AI & DS', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Data Science / Cyber Security', 'MBA / Management', 'Other',
]

export const AMBASSADOR_SECTIONS = ['Section A', 'Section B', 'Section C', 'Section D', 'Section E', 'Section F', 'Other']

export const AMBASSADOR_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']

export type AmbassadorStatus = 'NEW' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED'
export const AMBASSADOR_STATUSES: AmbassadorStatus[] = ['NEW', 'SHORTLISTED', 'SELECTED', 'REJECTED']

export interface AmbassadorApplication {
  id: string
  full_name: string
  roll_number: string
  section: string
  department: string
  year: string
  phone: string
  email: string
  skills: string[]
  experience: string | null
  motivation: string
  instagram: string | null
  linkedin: string | null
  extra: string | null
  status: AmbassadorStatus
  admin_notes: string | null
  created_at: string
  updated_at: string
}
