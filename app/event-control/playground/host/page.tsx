'use client'

import Link from 'next/link'
import { PG_ROUNDS, QUICK_EYES, QUICK_DRAW, THINK_FAST, SOUND_CHECK, MEMORY_LEVELS, memoryAnswer } from '@/lib/playgroundQuestions'

// Private host sheet: every question with its answer. Never shown on the projector.
export default function PlaygroundHostSheet() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 print:text-black">
      <div>
        <Link href="/event-control" className="text-white/50 hover:text-white text-xs font-bold font-display">← Event Control</Link>
        <h1 className="text-3xl font-black text-white font-display mt-2">Tribe Playground · Host Sheet</h1>
        <p className="text-white/50 text-sm">Questions and answers for all 5 rounds. Keep this off the projector.</p>
      </div>

      {PG_ROUNDS.map((r) => (
        <section key={r.n} className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <header className="p-5" style={{ background: r.color }}>
            <p className="text-xs font-black tracking-widest text-black/70 font-display">ROUND {r.n}</p>
            <h2 className="text-2xl font-black text-white font-display">{r.name}</h2>
            <p className="text-white/90 text-sm font-semibold">{r.format ? `${r.skill} · ${r.format}` : r.skill}</p>
            {r.scoring && <p className="text-black font-black text-xs mt-1">{r.scoring}</p>}
            {r.tip && <p className="text-white/90 text-xs mt-1">Tip: {r.tip}</p>}
          </header>

          <ol className="divide-y divide-white/10">
            {r.n === 1 && QUICK_EYES.map((q, i) => (
              <Item key={i} n={i + 1} title={q.prompt} options={q.options} answer={q.answer} note={q.note} />
            ))}
            {r.n === 2 && QUICK_DRAW.map((q, i) => (
              <Item key={i} n={i + 1} title={`Topic: ${q.topic}`} answer={q.topic} note="45 seconds. No words, letters or numbers." />
            ))}
            {r.n === 3 && THINK_FAST.map((q, i) => (
              <Item key={i} n={i + 1} title={q.prompt} options={q.options} answer={q.answer} note={q.note} />
            ))}
            {r.n === 4 && SOUND_CHECK.map((q, i) => (
              <Item key={i} n={i + 1} title={q.category} answer={q.answer} />
            ))}
            {r.n === 5 && MEMORY_LEVELS.map((l, i) => (
              <Item key={i} n={i + 1} title={`${l.count} items · shown ${l.seconds} sec · max ${l.max} pts`} answer={memoryAnswer(l)} note={l.note} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}

function Item({ n, title, options, answer, note }: { n: number; title: string; options?: string[]; answer: string; note?: string }) {
  return (
    <li className="p-5 space-y-2">
      <p className="text-white font-bold">
        <span className="text-white/40 font-mono mr-2">Q{n}</span>
        {title}
      </p>
      {options && <p className="text-white/60 text-sm">{options.join('   ')}</p>}
      <p className="text-[#00FFD1] text-sm font-black">Answer: <span className="text-white font-bold">{answer}</span></p>
      {note && <p className="text-white/40 text-xs">{note}</p>}
    </li>
  )
}
