// What the projector (/display) shows for each stage, in order.
// The Event Control panel steps through these with Prev / Next.
// Drop your files in public/display/posters and public/display/videos using the names below.

import { PG_ROUNDS, QUICK_EYES, QUICK_DRAW, THINK_FAST, SOUND_CHECK, MEMORY_LEVELS, memoryAnswer } from '@/lib/playgroundQuestions'

export type Scene =
  | { kind: 'image'; title: string; src: string; fit?: 'contain' | 'cover' }
  | { kind: 'video'; title: string; src: string }
  | { kind: 'welcome'; title: string }
  | { kind: 'intro'; title: string; role: string; name: string; subtitle?: string; photo?: string; color: string }
  | { kind: 'talent'; title: string }
  | { kind: 'games'; title: string }
  | { kind: 'round'; title: string; n: number; name: string; skill: string; format: string; color: string; tip?: string; scoring?: string }
  | { kind: 'qvisual'; title: string; src: string; seconds: number; q: number; prompt: string; options?: string[]; color: string; reveal?: string; answer?: string }
  | { kind: 'question'; title: string; label: string; prompt: string; options?: string[]; color: string; correct?: string; reveal?: string; answer?: string }
  | { kind: 'draw'; title: string; q: number; topic: string; seconds: number; answer?: string }
  | { kind: 'sound'; title: string; q: number; audio: string; answer?: string }
  | { kind: 'memory'; title: string; level: number; seconds: number; items: { text: string; emoji?: string }[]; answer?: string }
  | { kind: 'lunch'; title: string }
  | { kind: 'jam'; title: string }
  | { kind: 'reveal'; title: string }
  | { kind: 'wall'; title: string }

const PLAYBOOK: Scene[] = Array.from({ length: 13 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0')
  return { kind: 'image', title: `Playbook ${i + 1}/13`, src: `/handbook/slides/slide-${n}.png`, fit: 'contain' } as Scene
})

// Names shown one by one at the Tribe Reveal. Fill these in.
export const REVEAL_NAMES: string[] = []

export type PhaseAction = { label: string; phase: number }

// Buttons the controller shows for the screen on the projector.
// phase 0 is always the screen's starting state.
export function sceneActions(s: Scene): PhaseAction[] {
  switch (s.kind) {
    case 'qvisual': return [{ label: 'Show Image', phase: 1 }, { label: 'Show Question', phase: 2 }, { label: 'Show Answer', phase: 3 }, { label: 'Reset', phase: 0 }]
    case 'draw': return [{ label: 'Start Timer', phase: 1 }, { label: 'Show Answer', phase: 2 }, { label: 'Reset', phase: 0 }]
    case 'question': return [{ label: 'Show Answer', phase: 1 }, { label: 'Reset', phase: 0 }]
    case 'sound': return [{ label: 'Play Sound', phase: 1 }, { label: 'Stop', phase: 0 }]
    case 'memory': return [{ label: 'Show Items', phase: 1 }, { label: 'Show Answer', phase: 2 }, { label: 'Reset', phase: 0 }]
    default: return []
  }
}

// Answer / host note shown only in Event Control, never on the projector.
export const sceneAnswer = (s: Scene): string | undefined => ('answer' in s ? s.answer : undefined)

function buildPlayground(): Scene[] {
  const c = (n: number) => PG_ROUNDS[n - 1]
  const round = (n: number): Scene => {
    const r = c(n)
    return { kind: 'round', title: `Round ${n}: ${r.name}`, n, name: r.name, skill: r.skill, format: r.format, color: r.color, tip: r.tip, scoring: r.scoring }
  }
  const out: Scene[] = [{ kind: 'games', title: 'Tribe Playground' }]

  out.push(round(1))
  QUICK_EYES.forEach((q, i) => {
    // One step: the picture shows for 20 sec, then the question appears by itself.
    out.push({
      kind: 'qvisual',
      title: `Quick Eyes Q${i + 1}`,
      src: `/display/quick-eyes/q${i + 1}.png`,
      seconds: 20,
      q: i + 1,
      prompt: q.prompt,
      options: q.options,
      color: c(1).color,
      reveal: q.reveal,
      answer: `${q.answer}${q.note ? ' (' + q.note + ')' : ''}`,
    })
  })

  out.push(round(2))
  QUICK_DRAW.forEach((q, i) => out.push({ kind: 'draw', title: `Quick Draw Q${i + 1}: ${q.topic}`, q: i + 1, topic: q.topic, seconds: 45, answer: q.topic }))

  out.push(round(3))
  THINK_FAST.forEach((q, i) => out.push({ kind: 'question', title: `Think Fast Q${i + 1}`, label: `THINK FAST · Q${i + 1}`, prompt: q.prompt, options: q.options, color: c(3).color, correct: q.answer, reveal: q.note, answer: `${q.answer}${q.note ? ' (' + q.note + ')' : ''}` }))

  out.push(round(4))
  SOUND_CHECK.forEach((q, i) => out.push({ kind: 'sound', title: `Sound Check Q${i + 1}`, q: i + 1, audio: `/display/sounds/q${i + 1}.mp3`, answer: `${q.category}: ${q.answer}` }))

  out.push(round(5))
  MEMORY_LEVELS.forEach((l, i) => out.push({ kind: 'memory', title: `Memory Chain Level ${i + 1}: ${l.count} items`, level: i + 1, seconds: l.seconds, items: l.items, answer: `Max ${l.max} pts. Order: ${memoryAnswer(l)}${l.note ? ' (' + l.note + ')' : ''}` }))
  return out
}

const PLAYGROUND_DECK = buildPlayground()

export const DECKS: Record<string, Scene[]> = {
  inauguration: [
    { kind: 'welcome', title: 'Inauguration' },
    // Update name / photo / subtitle for each person. Photos go in public/display/people/.
    { kind: 'intro', title: 'Principal Intro', role: 'PRINCIPAL', name: 'Principal Name', subtitle: 'Chief Guest', photo: '/display/people/principal.png', color: '#FF1A75' },
    { kind: 'intro', title: 'MECH HOD Intro', role: 'HOD · MECH', name: 'HOD Name', subtitle: 'Head of Department, Mechanical Engineering', photo: '/display/people/mech-hod.png', color: '#7B2FFF' },
    { kind: 'intro', title: 'FED HOD Intro', role: 'HOD · FED', name: 'HOD Name', subtitle: 'Head of Department, First Year Engineering', photo: '/display/people/fed-hod.png', color: '#FF5500' },
    { kind: 'intro', title: 'Tribe Head Intro', role: 'TRIBE HEAD', name: 'Tribe Head Name', subtitle: 'Student Tribe', photo: '/display/people/tribe-head.png', color: '#1A6FFF' },
  ],
  briefs: [
    ...PLAYBOOK,
    { kind: 'video', title: 'ST Brief Video 1', src: '/display/videos/st-brief-1.mp4' },
    { kind: 'video', title: 'ST Brief Video 2', src: '/display/videos/st-brief-2.mp4' },
  ],
  'talent-hunt': [{ kind: 'talent', title: 'Talent Hunt Intro' }],
  playground: PLAYGROUND_DECK,
  lunch: [{ kind: 'lunch', title: 'Lunch Break' }],
  jam: [{ kind: 'jam', title: 'Tribe Jam' }],
  reveal: [{ kind: 'reveal', title: 'Tribe Reveal' }],
  wall: [{ kind: 'wall', title: 'The Tribe Wall' }],
}

export const GAMES = ['Quick Eyes', 'Quick Draw', 'Think Fast', 'Sound Check', 'Memory Chain']
