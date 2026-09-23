export type StageColor = 'pink' | 'blue' | 'yellow' | 'purple' | 'orange' | 'red' | 'teal' | 'dark'

export interface JourneyStage {
  num: string
  slug: string | null // activities.slug this maps to, or null if not DB-backed (Inauguration/Briefs)
  name: string
  anchor: string
  color: StageColor
}

export const JOURNEY: JourneyStage[] = [
  { num: '01', slug: null, name: 'Inauguration', anchor: 'inauguration', color: 'pink' },
  { num: '02', slug: null, name: 'Student Tribe Briefs', anchor: 'briefs', color: 'blue' },
  { num: '03', slug: 'playground', name: 'Tribe Playground', anchor: 'playground', color: 'yellow' },
  { num: '04', slug: 'detective', name: 'The Tribe Detective', anchor: 'detective', color: 'purple' },
  { num: '05', slug: 'lunch', name: 'Lunch / Free Tribe Time', anchor: 'lunch', color: 'orange' },
  { num: '06', slug: 'jam', name: 'Tribe Jam', anchor: 'jam', color: 'red' },
  { num: '07', slug: 'wall', name: 'The Tribe Wall', anchor: 'wall', color: 'teal' },
  { num: '08', slug: 'reveal', name: 'Tribeverse Reveal', anchor: 'reveal', color: 'dark' },
]
