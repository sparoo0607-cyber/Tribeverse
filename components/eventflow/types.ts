export type StageColor = 'pink' | 'blue' | 'yellow' | 'purple' | 'orange' | 'green' | 'red' | 'teal' | 'dark'

export interface JourneyStage {
  num: string
  time: string
  slug: string | null // activities.slug this maps to, or null if not DB-backed
  name: string
  anchor: string
  color: StageColor
  brief: string
}

export const JOURNEY: JourneyStage[] = [
  { num: '01', time: '9:30 – 10:00 AM', slug: null, name: 'Inauguration', anchor: 'inauguration', color: 'pink', brief: 'Official opening of TRIBEVERSE and welcome to the participants.' },
  { num: '02', time: '10:00 – 10:30 AM', slug: null, name: 'ST Brief', anchor: 'briefs', color: 'blue', brief: 'Introduction to Student Tribe, its community and student opportunities.' },
  { num: '03', time: '10:30 – 11:00 AM', slug: 'talent-hunt', name: 'Talent Hunt', anchor: 'talent-hunt', color: 'purple', brief: 'Open platform for students to showcase their talents and creative skills.' },
  { num: '04', time: '11:00 AM – 12:00 PM', slug: 'playground', name: 'Tribe Playground', anchor: 'playground', color: 'yellow', brief: 'Interactive team activities focused on participation, creativity and quick thinking.' },
  { num: '05', time: '12:00 – 1:00 PM', slug: 'lunch', name: 'Lunch Break', anchor: 'lunch', color: 'orange', brief: 'Break for lunch, relaxation and informal interaction among participants.' },
  { num: '06', time: '1:00 – 2:00 PM', slug: 'playground-continuous', name: 'Playground Cont.', anchor: 'playground-continuous', color: 'green', brief: 'Continuation of Playground activities and completion of remaining participation.' },
  { num: '07', time: '2:00 – 3:00 PM', slug: 'jam', name: 'Tribe Jam', anchor: 'jam', color: 'red', brief: 'Open music and performance session featuring students and participants.' },
  { num: '08', time: '3:00 – 3:20 PM', slug: 'reveal', name: 'Tribeverse Reveal', anchor: 'reveal', color: 'dark', brief: 'Closing reveal connecting the day\'s experiences with the TRIBEVERSE identity.' },
  { num: '09', time: '3:20 – 3:30 PM', slug: 'wall', name: 'The Tribe Wall', anchor: 'wall', color: 'teal', brief: 'Participants share a goal, thought or aspiration as a collective closing activity.' },
]
