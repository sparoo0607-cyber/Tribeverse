// Tribe Playground question set: 5 games x 5 questions/levels.
// Used by the projector (answers hidden) and the host sheet in Event Control (answers shown).

export interface PgQuestion {
  prompt: string
  options?: string[]
  answer: string
  note?: string
  // Shown on the projector at "Show Answer" (falls back to the picture if empty)
  reveal?: string
}

export interface PgMemoryLevel {
  count: number
  seconds: number
  max: number
  items: { text: string; emoji?: string }[]
  note?: string
}

export interface PgRound {
  n: number
  name: string
  skill: string
  format: string
  color: string
  scoring?: string
  tip?: string
}

export const PG_ROUNDS: PgRound[] = [
  { n: 1, name: 'Quick Eyes', skill: 'Observation', format: 'Visual on screen, 20 seconds, then the question', color: '#1A6FFF', tip: 'Answers depend on the exact visuals you prepare. Drop them in public/display/quick-eyes/q1.png to q5.png.' },
  { n: 2, name: 'Quick Draw', skill: 'Creativity and communication', format: '45 seconds per topic. Draw it, teammates guess.', color: '#FF1A75', tip: 'No words, no letters, no numbers.' },
  { n: 3, name: 'Think Fast', skill: 'Logic and speed', format: 'Medium difficulty, multiple choice', color: '#7B2FFF' },
  { n: 4, name: 'Sound Check', skill: 'Listening', format: '', color: '#FF5500', tip: 'Show "SOUND PLAYING", then BUZZ. Teams answer.' },
  { n: 5, name: 'Memory Chain', skill: 'Memory, concentration and sequence recall', format: 'Remember the items and reproduce the exact order', color: '#00B894' },
]

export const QUICK_EYES: PgQuestion[] = [
  { prompt: 'How many pens were on the desk?', answer: '3', reveal: '3 pens', note: 'Visual: a desk with 2 books, 1 laptop, 3 pens, 1 coffee cup, 1 mobile phone.' },
  { prompt: 'What color was the small car parked beside the blue car?', answer: 'As per your prepared visual', note: 'Visual: a street scene with several colored vehicles.' },
  { prompt: 'What object was placed between the clock and the plant?', answer: 'As per your prepared visual', note: 'Visual: a room with different objects.' },
  { prompt: 'How many stars were visible in the image?', answer: 'As per your prepared visual', note: 'Visual: a busy illustration with many objects.' },
  { prompt: 'Which accessory was NOT visible?', options: ['A. Watch', 'B. Cap', 'C. Sunglasses', 'D. Bracelet'], answer: 'As per your prepared visual', note: 'Visual: a person with several accessories, shown for 20 seconds.' },
]

export const QUICK_DRAW: { topic: string }[] = [
  { topic: 'ROCKET' },
  { topic: 'SOCIAL MEDIA' },
  { topic: 'HOSPITAL' },
  { topic: 'AIRPORT' },
  { topic: 'ARTIFICIAL INTELLIGENCE' },
]

export const THINK_FAST: PgQuestion[] = [
  {
    prompt: 'Number pattern: 2, 6, 12, 20, 30, ?',
    options: ['A) 36', 'B) 40', 'C) 42', 'D) 44'],
    answer: 'C) 42',
    note: '2×1, 3×2, 4×3, 5×4, 6×5, 7×6 = 42',
  },
  {
    prompt: 'A farmer has 17 sheep. All but 9 run away. How many sheep are left?',
    options: ['A) 8', 'B) 9', 'C) 17', 'D) 0'],
    answer: 'B) 9',
    note: '"All but 9" means 9 stay.',
  },
  {
    prompt: 'A clock shows 3:15. What is the approximate angle between the hour and minute hands?',
    options: ['A) 0°', 'B) 7.5°', 'C) 15°', 'D) 30°'],
    answer: 'B) 7.5°',
    note: 'Hour hand is at 97.5°, minute hand at 90°.',
  },
  {
    prompt: 'Sequence: A, C, F, J, O, ?',
    options: ['A) T', 'B) U', 'C) V', 'D) W'],
    answer: 'B) U',
    note: 'A +2 C, +3 F, +4 J, +5 O, +6 U',
  },
  {
    prompt: 'I am an odd number. Take away one letter and I become even. What number am I?',
    options: ['A) Three', 'B) Seven', 'C) Five', 'D) Nine'],
    answer: 'B) Seven',
    note: 'SEVEN minus the S = EVEN.',
  },
]

export const SOUND_CHECK: { category: string; answer: string }[] = [
  { category: 'Song Intro', answer: 'Play 3 to 5 seconds of a popular song that most students know but whose opening is not obvious. 10 pts.' },
  { category: 'Movie Dialogue', answer: 'Play a 3 to 5 second dialogue from a popular Telugu movie. Teams name the movie.' },
  { category: 'Everyday Sound', answer: 'Play a sound such as keyboard typing. Teams name the object.' },
  { category: 'Instrument', answer: 'Play a short isolated sound such as a guitar. Teams name the instrument.' },
  { category: 'Meme / Internet Sound', answer: 'Play a 3 to 5 second meme or reaction sound that your college audience will recognize.' },
]

// 5 levels, 10 items each. No item repeats in any other level. Edit freely.
export const MEMORY_LEVELS: PgMemoryLevel[] = [
  {
    count: 10, seconds: 12, max: 10,
    items: [
      { text: 'APPLE', emoji: '🍎' }, { text: 'CAR', emoji: '🚗' }, { text: 'GUITAR', emoji: '🎸' }, { text: 'MOON', emoji: '🌙' },
      { text: 'ELEPHANT', emoji: '🐘' }, { text: 'CAMERA', emoji: '📷' }, { text: 'PIZZA', emoji: '🍕' },
      { text: 'TIGER', emoji: '🐯' }, { text: 'ROCKET', emoji: '🚀' }, { text: 'OCEAN', emoji: '🌊' },
    ],
  },
  {
    count: 10, seconds: 12, max: 10,
    items: [
      { text: '27' }, { text: 'BOOK' }, { text: 'BLUE' }, { text: 'LION' }, { text: '84' },
      { text: 'PIANO' }, { text: 'MANGO' }, { text: 'STAR' }, { text: '52' }, { text: 'GREEN' },
    ],
    note: 'Numbers, words and colours mixed.',
  },
  {
    count: 10, seconds: 12, max: 10,
    items: [
      { text: 'BICYCLE' }, { text: '42' }, { text: 'RED' }, { text: 'DOLPHIN' }, { text: '17' },
      { text: 'DRUM' }, { text: 'MOUNTAIN' }, { text: 'CLOCK' }, { text: '63' }, { text: 'YELLOW' },
    ],
    note: 'Participants must remember the item, number, colour and exact position.',
  },
  {
    count: 10, seconds: 12, max: 10,
    items: [
      { text: 'BUTTERFLY', emoji: '🦋' }, { text: '24' }, { text: 'HEADPHONES', emoji: '🎧' }, { text: 'PINK' }, { text: 'BURGER', emoji: '🍔' },
      { text: '81' }, { text: 'HELICOPTER', emoji: '🚁' }, { text: 'ORANGE' }, { text: 'SUNFLOWER', emoji: '🌻' }, { text: '36' },
    ],
    note: 'Difficulty increases because categories are mixed.',
  },
  {
    count: 10, seconds: 10, max: 10,
    items: [
      { text: 'PANDA', emoji: '🐼' }, { text: '19' }, { text: 'WHITE' }, { text: 'FOOTBALL', emoji: '⚽' }, { text: '73' },
      { text: 'ICE CREAM', emoji: '🍦' }, { text: 'PURPLE' }, { text: '45' }, { text: 'TRAIN', emoji: '🚂' }, { text: 'RAINBOW', emoji: '🌈' },
    ],
    note: 'Final level: all categories mixed, shortest viewing time.',
  },
]

export const memoryAnswer = (l: PgMemoryLevel) => l.items.map((i) => (i.emoji ? `${i.emoji} ${i.text}` : i.text)).join(' → ')
