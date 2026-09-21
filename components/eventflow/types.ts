export interface JourneyStage {
  num: string
  slug: string | null // activities.slug this maps to, or null if not DB-backed (Inauguration/Briefs)
  name: string
  anchor: string
}

export const JOURNEY: JourneyStage[] = [
  { num: '01', slug: null, name: 'Inauguration', anchor: 'inauguration' },
  { num: '02', slug: null, name: 'Student Tribe Briefs', anchor: 'briefs' },
  { num: '03', slug: 'playground', name: 'Tribe Playground', anchor: 'playground' },
  { num: '04', slug: 'detective', name: 'The Tribe Detective', anchor: 'detective' },
  { num: '05', slug: 'lunch', name: 'Lunch / Free Tribe Time', anchor: 'lunch' },
  { num: '06', slug: 'jam', name: 'Tribe Jam', anchor: 'jam' },
  { num: '07', slug: 'wall', name: 'The Tribe Wall', anchor: 'wall' },
  { num: '08', slug: 'reveal', name: 'Tribeverse Reveal', anchor: 'reveal' },
]
