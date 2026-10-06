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

// WhatsApp group invite link (set NEXT_PUBLIC_AMBASSADOR_WHATSAPP_LINK in .env.local).
export const AMBASSADOR_WHATSAPP_LINK = process.env.NEXT_PUBLIC_AMBASSADOR_WHATSAPP_LINK ?? ''

// Opens WhatsApp with a prefilled invite message to the applicant. Indian
// 10-digit numbers get the 91 country code.
export function whatsappInviteUrl(name: string, phone: string): string | null {
  if (!AMBASSADOR_WHATSAPP_LINK) return null
  let digits = phone.replace(/\D/g, '')
  if (digits.length === 10) digits = '91' + digits
  const first = name.trim().split(/\s+/)[0]
  const text =
    `Hi ${first}! 🎉 Congratulations, you've been shortlisted as a TRIBEVERSE Campus Ambassador.\n\n` +
    `Join our WhatsApp group for the next steps:\n${AMBASSADOR_WHATSAPP_LINK}`
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
