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

export type WhatsAppTemplate = 'SHORTLISTED' | 'SELECTED' | 'REJECTED'
export const WHATSAPP_TEMPLATES: { key: WhatsAppTemplate; label: string }[] = [
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'SELECTED', label: 'Selected' },
  { key: 'REJECTED', label: 'Not selected' },
]

export function whatsappMessage(template: WhatsAppTemplate, name: string): string {
  const first = name.trim().split(/\s+/)[0]
  const group = AMBASSADOR_WHATSAPP_LINK
    ? `\n\nJoin our WhatsApp group for the next steps:\n${AMBASSADOR_WHATSAPP_LINK}`
    : ''
  switch (template) {
    case 'SHORTLISTED':
      return `Hi ${first}! 🎉 Congratulations, you've been shortlisted as a TRIBEVERSE Campus Ambassador. We'll reach out soon about the next round.${group}`
    case 'SELECTED':
      return `Hi ${first}! 🥳 You've been selected as a TRIBEVERSE Campus Ambassador. Welcome to the tribe!${group}`
    case 'REJECTED':
      return `Hi ${first}, thank you for applying to be a TRIBEVERSE Campus Ambassador. We couldn't take you forward this time, but we'd love to see you at TRIBEVERSE events. Stay connected! 💛`
  }
}

// Opens WhatsApp chat with the applicant and a prefilled message. Indian
// 10-digit numbers get the 91 country code.
export function whatsappUrl(phone: string, text: string): string {
  let digits = phone.replace(/\D/g, '')
  if (digits.length === 10) digits = '91' + digits
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

// Excel / Google Sheets compatible CSV (UTF-8 BOM so Excel keeps emojis/Telugu).
export function ambassadorsCsv(apps: AmbassadorApplication[]): string {
  const cols: [string, (a: AmbassadorApplication) => string | null][] = [
    ['Applied On', (a) => new Date(a.created_at).toLocaleString('en-IN')],
    ['Status', (a) => a.status],
    ['Full Name', (a) => a.full_name],
    ['Roll Number', (a) => a.roll_number],
    ['Department', (a) => a.department],
    ['Year', (a) => a.year],
    ['Section', (a) => a.section],
    ['Phone', (a) => a.phone],
    ['Email', (a) => a.email],
    ['Skills', (a) => a.skills.join(', ')],
    ['Why TRIBEVERSE', (a) => a.motivation],
    ['Experience', (a) => a.experience],
    ['Instagram', (a) => a.instagram],
    ['LinkedIn', (a) => a.linkedin],
    ['Anything Else', (a) => a.extra],
    ['Admin Notes', (a) => a.admin_notes],
  ]
  const cell = (v: string | null) => {
    let s = v ?? ''
    if (/^[=+\-@]/.test(s)) s = "'" + s // stop spreadsheet formula injection
    return `"${s.replace(/"/g, '""')}"`
  }
  const rows = [cols.map(([h]) => cell(h)).join(',')]
  for (const a of apps) rows.push(cols.map(([, f]) => cell(f(a))).join(','))
  return '﻿' + rows.join('\r\n')
}
